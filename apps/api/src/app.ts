import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

import { apiRouter } from './routes/index.js'
import { notFound } from './middlewares/not-found.js'
import { errorHandler } from './middlewares/error-handler.js'

export const app = express()

app.use(helmet())
app.use(
  cors({
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  }),
)
app.use(express.json())
app.use(morgan('dev'))

app.use('/api/v1', apiRouter)

app.use(notFound)
app.use(errorHandler)
