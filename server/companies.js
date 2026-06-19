import { Router } from 'express'
import { db } from './db.js'
import { requireAuth } from './auth.js'
import { chatCompletion, AGENTS } from './ai.js'
import { registerExecution, finishExecution } from './live.js'

export const companiesRouter = Router()
companiesRouter.use(requireAuth)

companiesRouter.get('/', (req, res) => {
  const companies = db
    .prepare('SELECT * FROM companies WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.user.id)
  res.json({ companies })
})

companiesRouter.post('/', (req, res) => {
  const { name, idea } = req.body || {}
  if (!name || !idea) return res.status(400).json({ error: 'Company name and idea are required' })
  const info = db
    .prepare('INSERT INTO companies (user_id, name, idea) VALUES (?, ?, ?)')
    .run(req.user.id, name, idea)
  const company = db.prepare('SELECT * FROM companies WHERE id = ?').get(info.lastInsertRowid)
  res.json({ company })
})

function getOwnedCompany(req, res) {
  const company = db
    .prepare('SELECT * FROM companies WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id)
  if (!company) {
    res.status(404).json({ error: 'Company not found' })
    return null
  }
  return company
}

companiesRouter.get('/:id/messages', (req, res) => {
  const company = getOwnedCompany(req, res)
  if (!company) return
  const agent = req.query.agent || 'chat'
  const messages = db
    .prepare('SELECT * FROM messages WHERE company_id = ? AND agent = ? ORDER BY id ASC LIMIT 200')
    .all(company.id, agent)
  res.json({ messages })
})

companiesRouter.get('/:id/tasks', (req, res) => {
  const company = getOwnedCompany(req, res)
  if (!company) return
  const tasks = db
    .prepare('SELECT * FROM tasks WHERE company_id = ? ORDER BY id DESC LIMIT 100')
    .all(company.id)
  res.json({ tasks })
})

companiesRouter.post('/:id/agents/:agent/chat', async (req, res) => {
  const company = getOwnedCompany(req, res)
  if (!company) return
  const agentKey = req.params.agent
  const agent = AGENTS[agentKey]
  if (!agent) return res.status(400).json({ error: 'Unknown agent' })
  const { message } = req.body || {}
  if (!message?.trim()) return res.status(400).json({ error: 'Message is required' })

  const history = db
    .prepare('SELECT role, content FROM messages WHERE company_id = ? AND agent = ? ORDER BY id DESC LIMIT 20')
    .all(company.id, agentKey)
    .reverse()

  const insertMsg = db.prepare(
    'INSERT INTO messages (company_id, agent, role, content) VALUES (?, ?, ?, ?)',
  )
  insertMsg.run(company.id, agentKey, 'user', message)

  const execId = registerExecution(agent.name, agentKey, `Company #${company.id}`)
  try {
    const context =
      `${agent.system}\n\nCompany context — name: "${company.name}". ` +
      `What it does: ${company.idea}. Founder: ${req.user.name}.`
    const result = await chatCompletion([
      { role: 'system', content: context },
      ...history,
      { role: 'user', content: message },
    ])

    insertMsg.run(company.id, agentKey, 'assistant', result.content)
    const title = message.length > 80 ? `${message.slice(0, 77)}...` : message
    db.prepare('INSERT INTO tasks (company_id, agent, title, status) VALUES (?, ?, ?, ?)').run(
      company.id,
      agentKey,
      title,
      result.provider === 'none' || result.provider === 'error' ? 'failed' : 'done',
    )

    res.json({ reply: result.content, provider: result.provider })
  } finally {
    finishExecution(execId)
  }
})
