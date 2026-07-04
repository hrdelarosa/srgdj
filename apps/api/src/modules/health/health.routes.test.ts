import express from 'express'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  execute: vi.fn(),
}))

vi.mock('../../database/db.js', () => ({
  db: {
    execute: mocks.execute,
  },
}))

const { healthRoutes } = await import('./health.routes.js')

function createTestApp() {
  const app = express()
  app.use('/health', healthRoutes)
  return app
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.execute.mockResolvedValue([])
})

describe('health routes', () => {
  it('reports that the API is running', async () => {
    const app = createTestApp()

    const response = await request(app).get('/health')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      status: 'ok',
      service: 'srgdj-api',
    })
    expect(mocks.execute).not.toHaveBeenCalled()
  })

  it('reports readiness when MySQL is reachable', async () => {
    const app = createTestApp()

    const response = await request(app).get('/health/ready')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      status: 'ready',
      service: 'srgdj-api',
      checks: {
        api: 'ok',
        database: 'ok',
      },
    })
    expect(mocks.execute).toHaveBeenCalledOnce()
  })

  it('reports not ready when MySQL is unreachable', async () => {
    mocks.execute.mockRejectedValue(new Error('database unavailable'))
    const app = createTestApp()

    const response = await request(app).get('/health/ready')

    expect(response.status).toBe(503)
    expect(response.body).toEqual({
      status: 'not_ready',
      service: 'srgdj-api',
      checks: {
        api: 'ok',
        database: 'error',
      },
    })
  })
})
