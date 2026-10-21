# NightShift

**Created and maintained by [Sergio Rodriguez (SSH-PuR66)](https://github.com/SSH-PuR66).**

**One application, two execution surfaces.** A React interface and Express/SQLite service for agent-based workflows. Inspect [the scripts and dependencies](package.json), [the backend](server/), and [the application source](src/) before tracing a provider response into persisted state.

The quickstart below runs the local stack. Provider availability, billing, and deployed business outcomes are separate from the source implementation.

Your AI team that works while you sleep. Full-stack: React + Tailwind frontend, Express + SQLite backend, multi-provider free AI router, and Stripe payments.

## Quick start

```bash
npm install
copy .env.example .env   # then fill in at least one AI key
npm run dev              # runs API server (:3001) + Vite (:5173)
```

Open http://localhost:5173 — landing page. Click **Get Started** → create an account → launch a company → talk to your agents.

## Free AI keys (add at least one to `.env`)

All of these are free to sign up and have free usage tiers. The server tries them in order and falls back automatically if one is rate-limited:

| Provider | Get a key | Env var |
| --- | --- | --- |
| Groq | https://console.groq.com/keys | `GROQ_API_KEY` |
| Google Gemini | https://aistudio.google.com/apikey | `GEMINI_API_KEY` |
| OpenRouter (free models) | https://openrouter.ai/settings/keys | `OPENROUTER_API_KEY` |
| Cerebras | https://cloud.cerebras.ai | `CEREBRAS_API_KEY` |

## Getting paid (Stripe → your bank / Chime / Cash App)

1. Create a free Stripe account: https://dashboard.stripe.com/register (you need to be 18+, you are).
2. In Stripe → **Settings → Bank accounts and currencies**, add your payout account.
   - **Chime**: in the Chime app, copy your account + routing numbers and enter them as a bank account.
   - **Cash App**: Cash App also gives you account + routing numbers (Money tab) — same deal.
3. Copy your **Secret key** from https://dashboard.stripe.com/apikeys into `.env` as `STRIPE_SECRET_KEY`.
4. (For production) create a webhook pointing to `https://yourdomain.com/api/billing/webhook` for the `checkout.session.completed` event, and put its signing secret in `STRIPE_WEBHOOK_SECRET`.

Customers can pay by **card or Cash App Pay** at checkout. Money lands in your Stripe balance and pays out to your bank on a rolling schedule. `PRO_PRICE_USD` in `.env` sets the price.

## Architecture

```
server/
  index.js      Express app, serves API + built frontend
  db.js         SQLite schema (users, companies, messages, tasks, payments)
  auth.js       Signup/login, JWT sessions
  companies.js  Companies, agent chat, tasks
  ai.js         Multi-provider AI router + agent personas
  live.js       Honest live stats + active execution feed
  billing.js    Stripe checkout (card + Cash App Pay) + webhook
src/
  pages/        Landing + App (dashboard)
  components/   Landing sections + app UI
```

## Production

```bash
npm run build
npm start        # serves API + built frontend on :3001
```

Deploy anywhere that runs Node (Railway, Render, Fly.io, a $5 VPS). Set the env vars from `.env.example` in your host's dashboard.
