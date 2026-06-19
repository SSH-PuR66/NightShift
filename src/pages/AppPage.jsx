import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, getToken, setToken } from '../lib/api.js'
import AuthForm from '../components/app/AuthForm.jsx'
import CompanySetup from '../components/app/CompanySetup.jsx'
import Dashboard from '../components/app/Dashboard.jsx'

export default function AppPage() {
  const [user, setUser] = useState(null)
  const [companies, setCompanies] = useState([])
  const [activeCompany, setActiveCompany] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      if (!getToken()) {
        setLoading(false)
        return
      }
      try {
        const { user } = await api('/api/auth/me')
        setUser(user)
        const { companies } = await api('/api/companies')
        setCompanies(companies)
        if (companies.length > 0) setActiveCompany(companies[0])
      } catch {
        setToken(null)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  function handleAuthed(user) {
    setUser(user)
  }

  function handleCompanyCreated(company) {
    setCompanies((prev) => [company, ...prev])
    setActiveCompany(company)
  }

  function handleLogout() {
    setToken(null)
    setUser(null)
    setCompanies([])
    setActiveCompany(null)
  }

  return (
    <div className="min-h-screen bg-ink">
      <header className="flex items-center justify-between border-b border-cream/10 px-6 py-4 md:px-10">
        <Link to="/" className="text-lg font-semibold tracking-tight">
          nightshift<span className="text-accent">.</span>
        </Link>
        {user && (
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-cream/50">
              {user.name}
              {user.is_pro ? ' · PRO' : ''}
            </span>
            <button
              onClick={handleLogout}
              className="rounded-full border border-cream/20 px-4 py-1.5 text-xs font-medium transition hover:border-cream/40"
            >
              Log out
            </button>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        {loading ? (
          <p className="py-20 text-center font-mono text-sm text-cream/40">Loading...</p>
        ) : !user ? (
          <AuthForm onAuthed={handleAuthed} />
        ) : !activeCompany ? (
          <CompanySetup onCreated={handleCompanyCreated} userName={user.name} />
        ) : (
          <Dashboard
            user={user}
            company={activeCompany}
            companies={companies}
            onSwitchCompany={setActiveCompany}
            onNewCompany={() => setActiveCompany(null)}
          />
        )}
      </main>
    </div>
  )
}
