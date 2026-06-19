import { useEffect, useState } from 'react'

const EMPTY = {
  stats: {
    revenue_usd: 0,
    tasks_completed: 0,
    messages_sent: 0,
    companies: 0,
    founders: 0,
    tasks_completed_24h: 0,
    companies_created_24h: 0,
  },
  active_executions: [],
}

/** Fetches real platform stats from our own backend. */
export function useLiveStats({ refreshMs = 15000 } = {}) {
  const [data, setData] = useState(EMPTY)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE ?? ''}/api/public/live`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (!cancelled && json?.success) {
          setData(json)
          setIsLive(true)
        }
      } catch {
        if (!cancelled) setIsLive(false)
      }
    }

    load()
    const interval = setInterval(load, refreshMs)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [refreshMs])

  return { ...data, isLive }
}
