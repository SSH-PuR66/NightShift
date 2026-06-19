import { Router } from 'express'
import { db } from './db.js'

// In-memory registry of agent executions currently in flight
const active = new Map()
let nextExecId = 1

export function registerExecution(agentName, agentType, companyLabel) {
  const id = nextExecId++
  active.set(id, {
    id,
    status: 'running',
    created_at: new Date().toISOString(),
    started_at: new Date().toISOString(),
    agent_name: agentName,
    agent_type: agentType,
    company_label: companyLabel,
  })
  return id
}

export function finishExecution(id) {
  active.delete(id)
}

export const liveRouter = Router()

// Honest, real-time stats computed from this platform's own database.
liveRouter.get('/live', (_req, res) => {
  const count = (sql, ...args) => db.prepare(sql).get(...args)?.n ?? 0

  const revenue = db.prepare('SELECT COALESCE(SUM(amount_usd), 0) AS n FROM payments').get().n

  res.json({
    success: true,
    stats: {
      revenue_usd: revenue,
      tasks_completed: count("SELECT COUNT(*) AS n FROM tasks WHERE status = 'done'"),
      messages_sent: count("SELECT COUNT(*) AS n FROM messages WHERE role = 'assistant'"),
      companies: count('SELECT COUNT(*) AS n FROM companies'),
      founders: count('SELECT COUNT(*) AS n FROM users'),
      tasks_completed_24h: count(
        "SELECT COUNT(*) AS n FROM tasks WHERE status = 'done' AND created_at >= datetime('now', '-1 day')",
      ),
      companies_created_24h: count(
        "SELECT COUNT(*) AS n FROM companies WHERE created_at >= datetime('now', '-1 day')",
      ),
    },
    active_executions: [...active.values()].sort((a, b) => b.id - a.id),
  })
})
