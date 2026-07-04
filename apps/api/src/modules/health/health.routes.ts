import { Router } from 'express'
import { sql } from 'drizzle-orm'
import { db } from '../../database/db.js'

export const healthRoutes = Router()

healthRoutes.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'srgdj-api' })
})

healthRoutes.get('/ready', async (req, res) => {
  try {
    await db.execute(sql`select 1`)

    res.status(200).json({
      status: 'ready',
      service: 'srgdj-api',
      checks: {
        api: 'ok',
        database: 'ok',
      },
    })
  } catch {
    res.status(503).json({
      status: 'not_ready',
      service: 'srgdj-api',
      checks: {
        api: 'ok',
        database: 'error',
      },
    })
  }
})
