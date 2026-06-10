import type { Request, Response } from 'express'
import { AuthModel } from './auth.model.js'
import { AuthService } from './auth.service.js'

export class AuthController {
  private readonly authService: AuthService

  constructor({ authModel }: { authModel: typeof AuthModel }) {
    this.authService = new AuthService({ authModel })
  }

  login = async (req: Request, res: Response) => {
    const result = await this.authService.login({
      data: req.body,
      meta: {
        ip: req.ip,
        userAgent: req.headers['user-agent'] ?? undefined,
      },
    })

    res.json(result)
  }
}
