import express from 'express'
import { createClient } from '@libsql/client'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const port = process.env.PORT || 3001
const databaseUrl = process.env.TURSO_DATABASE_URL || 'file:casamentoforever.db'
const authToken = process.env.TURSO_AUTH_TOKEN || undefined

const db = createClient({ url: databaseUrl, authToken })

app.get('/api/hello', async (req, res) => {
  try {
    const result = await db.execute('SELECT 1 AS ok')
    res.json({
      message: 'Hello World – CasamentoForever conectado ao Turso!',
      connected: Array.isArray(result.rows) && result.rows.length > 0,
      row: result.rows[0] ?? null,
    })
  } catch (error) {
    res.status(500).json({ error: error?.message ?? 'Erro desconhecido ao conectar ao Turso' })
  }
})

app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`)
})
