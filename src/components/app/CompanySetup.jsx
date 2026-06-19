import { useState } from 'react'
import { api } from '../../lib/api.js'

export default function CompanySetup({ onCreated, userName }) {
  const [form, setForm] = useState({ name: '', idea: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const { company } = await api('/api/companies', { method: 'POST', body: form })
      onCreated(company)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto mt-10 max-w-xl">
      <h1 className="text-3xl font-bold tracking-tight">
        Alright {userName}, let's start a company.
      </h1>
      <p className="mt-2 text-sm text-cream/50">
        Give it a name and tell your AI team what you're building. They'll use this as
        context for everything they do.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <input
          type="text"
          placeholder="Company name (e.g. Fishkill Lawn Pros)"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-xl border border-cream/15 bg-cream/5 px-4 py-3 text-sm outline-none transition focus:border-accent"
          required
        />
        <textarea
          placeholder="What does it do? Who is it for? How will it make money?"
          value={form.idea}
          onChange={(e) => setForm({ ...form, idea: e.target.value })}
          rows={5}
          className="w-full resize-none rounded-xl border border-cream/15 bg-cream/5 px-4 py-3 text-sm outline-none transition focus:border-accent"
          required
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-cream py-3 text-sm font-semibold text-ink transition hover:bg-white disabled:opacity-50"
        >
          {busy ? 'Setting up...' : 'Launch company'}
        </button>
      </form>
    </div>
  )
}
