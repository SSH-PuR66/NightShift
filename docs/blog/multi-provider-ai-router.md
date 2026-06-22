---
title: "I Built an AI Agent Platform That Falls Through 4 Free LLM Providers — Zero Cost to Start"
published: false
description: "NightShift routes AI requests through Groq, Gemini, OpenRouter, and Cerebras with automatic fallback. Here's how the multi-provider router works."
tags: ai, javascript, saas, webdev
cover_image: ""
canonical_url:
---

Here's the problem: you want to build an AI product, but OpenAI costs money and rate-limits your free tier hard. You could pay, or you could do what I did — build a router that tries multiple free providers in order and falls through to the next one when one is down or rate-limited.

**NightShift** is a full-stack AI agent platform (React + Express + SQLite + Stripe). But the most reusable piece is the AI router, and that's what this post is about.

---

## The router pattern

```js
function buildProviders() {
  const providers = []

  if (process.env.GROQ_API_KEY)
    providers.push({
      name: 'groq',
      url: 'https://api.groq.com/openai/v1/chat/completions',
      key: process.env.GROQ_API_KEY,
      model: 'llama-3.3-70b-versatile',
    })

  if (process.env.GEMINI_API_KEY)
    providers.push({
      name: 'gemini',
      url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
      key: process.env.GEMINI_API_KEY,
      model: 'gemini-2.0-flash',
    })

  // ... OpenRouter, Cerebras
  return providers
}
```

The key insight: **Groq, Gemini, OpenRouter, and Cerebras all speak the OpenAI chat completions format.** Same `messages` array, same `temperature`, same `max_tokens`. So the router doesn't need provider-specific code — it just changes the URL, key, and model.

---

## The fallback logic

```js
async function chatCompletion(messages) {
  const providers = buildProviders()

  for (const p of providers) {
    try {
      const res = await fetch(p.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${p.key}`,
        },
        body: JSON.stringify({
          model: p.model,
          messages,
          temperature: 0.7,
          max_tokens: 2048,
        }),
      })
      if (!res.ok) continue  // Try next provider
      const data = await res.json()
      return { provider: p.name, content: data.choices[0].message.content }
    } catch {
      continue  // Network error, try next
    }
  }
  // All failed
  return { provider: 'none', content: 'All AI providers are unavailable.' }
}
```

Walk through it:
1. Build the provider list from whatever keys are in `.env`
2. Try Groq first (fastest — they have custom inference chips)
3. If Groq returns a non-200 (rate limited), try Gemini
4. If Gemini fails, try OpenRouter
5. If OpenRouter fails, try Cerebras
6. If everything fails, return a human-readable error

**The user never sees a provider error.** They just get a response, and it might come from a different model than last time. For a business automation agent, consistency of *availability* matters more than consistency of *model*.

---

## Why these four providers?

| Provider | Free tier | Speed | Model |
|---|---|---|---|
| **Groq** | 6,000 tokens/min | Blazing (custom chips) | LLaMA 3.3 70B |
| **Gemini** | 60 RPM | Fast | Gemini 2.0 Flash |
| **OpenRouter** | Varies by model | Moderate | LLaMA 3.3 70B (free tier) |
| **Cerebras** | Generous limits | Fast | LLaMA 3.3 70B |

All free to sign up. All have free tiers that are good enough for a demo or low-traffic product. Combined, you get enough capacity to handle real users without spending a dollar.

---

## The full stack

NightShift isn't just an AI router — it's a full business automation platform:

```
React + Tailwind (Vite)     Express + SQLite
─────────────────────────   ──────────────────
Landing page                Auth (JWT)
Dashboard                   Company management
Agent chat UI               Agent personas
Task management             Multi-provider AI
Billing (Stripe)            Stripe webhooks
                            Live stats feed
```

The pitch: "Your AI team that works while you sleep." You create a company, launch agents (each with a persona: sales, support, operations), and they handle tasks via the chat interface.

Stripe handles billing — card and Cash App Pay. The webhook validates payments and upgrades accounts automatically. Money goes to your bank on a rolling schedule.

---

## What makes this different from another ChatGPT wrapper

1. **Multi-provider resilience** — not dependent on one AI vendor
2. **Agent personas** — each agent has a system prompt tuned for its role
3. **Company scoping** — data isolation between different businesses
4. **Production billing** — real Stripe integration, not a mock
5. **Zero-cost start** — free AI tiers + SQLite = $0 until you have real customers

---

## Deployment

```bash
npm install
cp .env.example .env  # Add at least one AI key
npm run dev            # API on :3001, Vite on :5173
```

For production:
```bash
npm run build
npm start  # Serves API + built frontend on :3001
```

Deploy anywhere that runs Node — Railway, Render, Fly.io, or a $5 VPS. The whole app runs in one process.

---

## What I'd improve

- **Streaming** — SSE for real-time token display instead of waiting for the full response
- **Provider health tracking** — remember which providers failed recently and skip them for a cooldown period
- **Response caching** — if the same question is asked twice, serve the cached response
- **Model quality routing** — for complex questions, prefer the 70B model; for simple ones, use the fastest

---

*Source: [github.com/SSH-PuR66/NightShift](https://github.com/SSH-PuR66/NightShift)*
