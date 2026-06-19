/**
 * Multi-provider AI router. All providers below have free tiers and speak the
 * OpenAI chat-completions format, so we can fall through them in order until
 * one succeeds. Add keys to .env — any subset works.
 */

function buildProviders() {
  const providers = []

  if (process.env.GROQ_API_KEY) {
    providers.push({
      name: 'groq',
      url: 'https://api.groq.com/openai/v1/chat/completions',
      key: process.env.GROQ_API_KEY,
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    })
  }

  if (process.env.GEMINI_API_KEY) {
    providers.push({
      name: 'gemini',
      url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
      key: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    })
  }

  if (process.env.OPENROUTER_API_KEY) {
    providers.push({
      name: 'openrouter',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      key: process.env.OPENROUTER_API_KEY,
      model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free',
    })
  }

  if (process.env.CEREBRAS_API_KEY) {
    providers.push({
      name: 'cerebras',
      url: 'https://api.cerebras.ai/v1/chat/completions',
      key: process.env.CEREBRAS_API_KEY,
      model: process.env.CEREBRAS_MODEL || 'llama-3.3-70b',
    })
  }

  return providers
}

export async function chatCompletion(messages) {
  const providers = buildProviders()

  if (providers.length === 0) {
    return {
      provider: 'none',
      content:
        "I'm not connected to an AI provider yet. The owner needs to add at least one free API key " +
        '(GROQ_API_KEY, GEMINI_API_KEY, OPENROUTER_API_KEY, or CEREBRAS_API_KEY) to the .env file. ' +
        'All of them have free tiers — see the README for links.',
    }
  }

  let lastError = null
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
      if (!res.ok) {
        lastError = new Error(`${p.name} HTTP ${res.status}`)
        continue
      }
      const json = await res.json()
      const content = json.choices?.[0]?.message?.content
      if (content) return { provider: p.name, content }
      lastError = new Error(`${p.name} returned empty response`)
    } catch (err) {
      lastError = err
    }
  }

  return {
    provider: 'error',
    content: `All AI providers failed (${lastError?.message}). This is usually a rate limit — try again in a minute.`,
  }
}

export const AGENTS = {
  ceo: {
    name: 'CEO',
    system:
      'You are the CEO agent of NightShift, an AI workforce platform. You help founders plan strategy, ' +
      'roadmaps, pricing, and priorities for their company. Be decisive, concrete, and practical. ' +
      'Give actionable next steps, not vague advice. Keep responses focused and well-structured.',
  },
  engineering: {
    name: 'Engineering',
    system:
      'You are the Engineering agent of NightShift. You write production-quality code, design architectures, ' +
      'and debug problems for the founder. Always provide complete, working code with brief explanations.',
  },
  marketing: {
    name: 'Marketing',
    system:
      'You are the Marketing agent of NightShift. You write ad copy, tweets, landing page text, email campaigns, ' +
      'and growth plans. Be punchy and conversion-focused. When asked for tweets or ads, give several variants.',
  },
  support: {
    name: 'Support',
    system:
      'You are the Customer Support agent of NightShift. You draft empathetic, clear replies to customer ' +
      'messages, handle complaints gracefully, and suggest ways to turn unhappy customers into fans.',
  },
  sales: {
    name: 'Sales',
    system:
      'You are the Sales agent of NightShift. You write cold outreach, follow-ups, proposals, and closing ' +
      'scripts. Be persuasive without being pushy. Tailor everything to the company context provided.',
  },
  chat: {
    name: 'Chat',
    system:
      'You are NightShift, an AI co-founder. Answer anything about running the company — business, legal basics, ' +
      'finance basics, product. Be a calm, smart partner. Recommend the specialist agents when relevant.',
  },
}
