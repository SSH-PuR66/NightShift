import { useState } from 'react'
import { api, setToken } from '../../lib/api.js'

export default function AuthForm({ onAuthed }) {
  const [mode, setMode] = useState('signup')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const path = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login'
      const body =
        mode === 'signup'
          ? form
          : { email: form.email, password: form.password }
      const { token, user } = await api(path, { method: 'POST', body })
      setToken(token)
      onAuthed(user)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto mt-10 max-w-md">
      <h1 className="text-3xl font-bold tracking-tight">
        {mode === 'signup' ? 'Create your account' : 'Welcome back'}
      </h1>
      <p className="mt-2 text-sm text-cream/50">
        {mode === 'signup'
          ? 'Free. No credit card. Your AI team is waiting.'
          : 'Log in to get back to your company.'}
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        {mode === 'signup' && (
          <input
            type="text"
            placeholder="Your name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-xl border border-cream/15 bg-cream/5 px-4 py-3 text-sm outline-none transition focus:border-accent"
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full rounded-xl border border-cream/15 bg-cream/5 px-4 py-3 text-sm outline-none transition focus:border-accent"
          required
        />
        <input
          type="password"
          placeholder="Password (8+ characters)"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full rounded-xl border border-cream/15 bg-cream/5 px-4 py-3 text-sm outline-none transition focus:border-accent"
          required
          minLength={8}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-cream py-3 text-sm font-semibold text-ink transition hover:bg-white disabled:opacity-50"
        >
          {busy ? 'One sec...' : mode === 'signup' ? 'Create account' : 'Log in'}
        </button>
      </form>

      <button
        onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
        className="mt-6 text-sm text-cream/50 underline-offset-4 hover:underline"
      >
        {mode === 'signup' ? 'Already have an account? Log in' : 'New here? Create an account'}
      </button>
    </div>
  )
}
