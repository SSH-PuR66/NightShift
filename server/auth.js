import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from './db.js'

const JWT_SECRET = process.env.JWT_SECRET || 'nightshift-dev-secret-change-me'

export function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' })
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Not logged in' })
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    const user = db.prepare('SELECT id, email, name, is_pro FROM users WHERE id = ?').get(payload.id)
    if (!user) return res.status(401).json({ error: 'User not found' })
    req.user = user
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' })
  }
}

export const authRouter = Router()

authRouter.post('/signup', (req, res) => {
  const { email, password, name } = req.body || {}
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email and password are required' })
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' })
  }
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase())
  if (existing) return res.status(409).json({ error: 'An account with that email already exists' })

  const hash = bcrypt.hashSync(password, 10)
  const info = db
    .prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)')
    .run(email.toLowerCase(), hash, name)
  const user = { id: info.lastInsertRowid, email: email.toLowerCase(), name, is_pro: 0 }
  res.json({ token: signToken(user), user })
})

authRouter.post('/login', (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase())
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Wrong email or password' })
  }
  res.json({
    token: signToken(user),
    user: { id: user.id, email: user.email, name: user.name, is_pro: user.is_pro },
  })
})

authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user })
})
