import { useEffect, useRef, useState } from 'react'
import { api } from '../../lib/api.js'

const AGENTS = [
  { key: 'chat', name: 'Chat', desc: 'Your AI co-founder' },
  { key: 'ceo', name: 'CEO', desc: 'Strategy & roadmap' },
  { key: 'engineering', name: 'Engineering', desc: 'Code & architecture' },
  { key: 'marketing', name: 'Marketing', desc: 'Ads, tweets, copy' },
  { key: 'sales', name: 'Sales', desc: 'Outreach & closing' },
  { key: 'support', name: 'Support', desc: 'Customer replies' },
]

export default function Dashboard({ user, company, companies, onSwitchCompany, onNewCompany }) {
  const [agent, setAgent] = useState('chat')
  const [messages, setMessages] = useState([])
  const [tasks, setTasks] = useState([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [upgradeMsg, setUpgradeMsg] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [{ messages }, { tasks }] = await Promise.all([
          api(`/api/companies/${company.id}/messages?agent=${agent}`),
          api(`/api/companies/${company.id}/tasks`),
        ])
        if (!cancelled) {
          setMessages(messages)
          setTasks(tasks)
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [company.id, agent])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || busy) return
    setInput('')
    setError('')
    setBusy(true)
    setMessages((prev) => [...prev, { id: `tmp-${Date.now()}`, role: 'user', content: text }])
    try {
      const { reply } = await api(`/api/companies/${company.id}/agents/${agent}/chat`, {
        method: 'POST',
        body: { message: text },
      })
      setMessages((prev) => [...prev, { id: `tmp-${Date.now()}-r`, role: 'assistant', content: reply }])
      const { tasks } = await api(`/api/companies/${company.id}/tasks`)
      setTasks(tasks)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function upgrade() {
    setUpgradeMsg('')
    try {
      const { url } = await api('/api/billing/checkout', { method: 'POST' })
      window.location.href = url
    } catch (err) {
      setUpgradeMsg(err.message)
    }
  }

  const activeAgent = AGENTS.find((a) => a.key === agent)

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr_260px]">
      {/* Sidebar: agents */}
      <aside>
        <div className="mb-4">
          <select
            value={company.id}
            onChange={(e) =>
              onSwitchCompany(companies.find((c) => c.id === Number(e.target.value)))
            }
            className="w-full rounded-xl border border-cream/15 bg-ink px-3 py-2 text-sm outline-none"
          >
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            onClick={onNewCompany}
            className="mt-2 w-full rounded-xl border border-dashed border-cream/20 py-2 text-xs text-cream/50 transition hover:border-cream/40 hover:text-cream/80"
          >
            + New company
          </button>
        </div>
        <nav className="space-y-1">
          {AGENTS.map((a) => (
            <button
              key={a.key}
              onClick={() => setAgent(a.key)}
              className={`w-full rounded-xl px-4 py-3 text-left transition ${
                agent === a.key
                  ? 'bg-accent/15 text-accent-soft'
                  : 'text-cream/60 hover:bg-cream/5 hover:text-cream'
              }`}
            >
              <span className="block text-sm font-semibold">{a.name}</span>
              <span className="block text-xs text-cream/40">{a.desc}</span>
            </button>
          ))}
        </nav>
        {!user.is_pro && (
          <div className="mt-6 rounded-2xl border border-accent/30 bg-accent/10 p-4">
            <p className="text-sm font-semibold">NightShift Pro</p>
            <p className="mt-1 text-xs text-cream/50">
              Support the platform. One-time, card or Cash App.
            </p>
            <button
              onClick={upgrade}
              className="mt-3 w-full rounded-xl bg-accent py-2 text-xs font-semibold text-white transition hover:opacity-90"
            >
              Upgrade
            </button>
            {upgradeMsg && <p className="mt-2 text-xs text-amber-300">{upgradeMsg}</p>}
          </div>
        )}
      </aside>

      {/* Chat */}
      <section className="flex h-[72vh] flex-col rounded-2xl border border-cream/10 bg-cream/[0.02]">
        <div className="border-b border-cream/10 px-5 py-3">
          <p className="text-sm font-semibold">{activeAgent.name} Agent</p>
          <p className="text-xs text-cream/40">{activeAgent.desc} · working for {company.name}</p>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.length === 0 && (
            <p className="font-mono text-sm text-cream/40">
              Ask {activeAgent.name} anything about {company.name}. They already know your idea.
            </p>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'ml-auto bg-accent/20 text-cream'
                  : 'bg-cream/5 text-cream/90'
              }`}
            >
              {m.content}
            </div>
          ))}
          {busy && (
            <p className="font-mono text-xs text-cream/40">
              {activeAgent.name} is working...
            </p>
          )}
          <div ref={bottomRef} />
        </div>
        {error && <p className="px-5 pb-1 text-xs text-red-400">{error}</p>}
        <form onSubmit={send} className="flex gap-2 border-t border-cream/10 p-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${activeAgent.name}...`}
            className="flex-1 rounded-xl border border-cream/15 bg-ink px-4 py-3 text-sm outline-none transition focus:border-accent"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="rounded-xl bg-cream px-5 text-sm font-semibold text-ink transition hover:bg-white disabled:opacity-40"
          >
            Send
          </button>
        </form>
      </section>

      {/* Tasks */}
      <aside className="rounded-2xl border border-cream/10 bg-cream/[0.02] p-5">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-cream/50">
          Recent tasks
        </p>
        <ul className="mt-4 space-y-3">
          {tasks.length === 0 && (
            <li className="text-xs text-cream/40">Nothing yet — put your team to work.</li>
          )}
          {tasks.slice(0, 15).map((t) => (
            <li key={t.id} className="text-xs">
              <span
                className={`mr-2 inline-block h-1.5 w-1.5 rounded-full ${
                  t.status === 'done' ? 'bg-green-400' : 'bg-red-400'
                }`}
              />
              <span className="font-mono text-cream/40">[{t.agent}]</span>{' '}
              <span className="text-cream/70">{t.title}</span>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  )
}
