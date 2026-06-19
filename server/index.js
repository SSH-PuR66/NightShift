import 'dotenv/config'
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { authRouter } from './auth.js'
import { companiesRouter } from './companies.js'
import { liveRouter } from './live.js'
import { billingRouter, stripeWebhook } from './billing.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

// Stripe webhook needs the raw body, so register it before express.json()
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), stripeWebhook)

app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/companies', companiesRouter)
app.use('/api/public', liveRouter)
app.use('/api/billing', billingRouter)

// Serve the built frontend in production
const dist = path.join(__dirname, '..', 'dist')
app.use(express.static(dist))
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(dist, 'index.html'), (err) => {
    if (err) res.status(404).send('Run `npm run build` first, or use `npm run dev`.')
  })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`NightShift server running on http://localhost:${PORT}`)
})
