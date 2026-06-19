import { Router } from 'express'
import Stripe from 'stripe'
import { db } from './db.js'
import { requireAuth } from './auth.js'

const PRO_PRICE_USD = Number(process.env.PRO_PRICE_USD || 19)

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

export const billingRouter = Router()

billingRouter.get('/config', (_req, res) => {
  res.json({
    enabled: Boolean(process.env.STRIPE_SECRET_KEY),
    pro_price_usd: PRO_PRICE_USD,
  })
})

billingRouter.post('/checkout', requireAuth, async (req, res) => {
  const stripe = getStripe()
  if (!stripe) {
    return res.status(503).json({
      error:
        'Payments are not set up yet. The owner needs to add STRIPE_SECRET_KEY to .env — see README.',
    })
  }
  const origin = req.headers.origin || `http://localhost:${process.env.PORT || 3001}`
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      // Cards + Cash App Pay. More methods (Link, Klarna, etc.) can be
      // enabled from the Stripe dashboard without code changes.
      payment_method_types: ['card', 'cashapp'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: Math.round(PRO_PRICE_USD * 100),
            product_data: {
              name: 'NightShift Pro',
              description: 'Priority agents, unlimited companies, and support for the founder.',
            },
          },
          quantity: 1,
        },
      ],
      client_reference_id: String(req.user.id),
      success_url: `${origin}/app?upgraded=1`,
      cancel_url: `${origin}/app`,
    })
    res.json({ url: session.url })
  } catch (err) {
    res.status(500).json({ error: `Stripe error: ${err.message}` })
  }
})

// Stripe webhook — marks the user as Pro and records honest revenue.
// Raw body is required for signature verification (wired up in index.js).
export async function stripeWebhook(req, res) {
  const stripe = getStripe()
  if (!stripe) return res.status(503).end()

  let event
  try {
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.headers['stripe-signature'],
        process.env.STRIPE_WEBHOOK_SECRET,
      )
    } else {
      event = JSON.parse(req.body.toString())
    }
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const userId = Number(session.client_reference_id)
    if (userId) {
      db.prepare('UPDATE users SET is_pro = 1 WHERE id = ?').run(userId)
      db.prepare(
        'INSERT INTO payments (user_id, amount_usd, stripe_session_id) VALUES (?, ?, ?)',
      ).run(userId, (session.amount_total ?? 0) / 100, session.id)
    }
  }

  res.json({ received: true })
}
