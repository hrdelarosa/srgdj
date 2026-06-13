import type { Request, Response } from 'express'
import { AuthModel } from './auth.model.js'
import { AuthService } from './auth.service.js'
import {
  clearRefreshTokenCookie,
  getRefreshCookieName,
  parseCookies,
  setRefreshTokenCookie,
} from '../../utils/auth/cookies.js'
import { AppError } from '../../utils/errors/app-error.js'

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

    setRefreshTokenCookie({
      res,
      token: result.refreshToken,
      expiresAt: result.refreshExpiresAt,
    })

    const { refreshToken, refreshExpiresAt, ...body } = result

    res.json(body)
  }

  refresh = async (req: Request, res: Response) => {
    const refreshToken = parseCookies(req.headers.cookie).get(
      getRefreshCookieName(),
    )

    if (!refreshToken) {
      throw new AppError({
        message: 'Sesión no válida',
        statusCode: 401,
        code: 'INVALID_SESSION',
      })
    }

    const result = await this.authService.refresh({
      refreshToken,
      meta: {
        ip: req.ip,
        userAgent: req.headers['user-agent'] ?? undefined,
      },
    })

    setRefreshTokenCookie({
      res,
      token: result.refreshToken,
      expiresAt: result.refreshExpiresAt,
    })

    const { refreshToken: _refreshToken, refreshExpiresAt, ...body } = result

    res.json(body)
  }

  sessions = async (req: Request, res: Response) => {
    const sessions = await this.authService.findSessions({
      userId: req.user!.id,
    })

    res.json({ items: sessions })
  }

  revokeSession = async (req: Request, res: Response) => {
    await this.authService.revokeSession({
      sessionId: req.params.id as string,
      actorUserId: req.user!.id,
    })

    res.status(204).send()
  }

  me = async (req: Request, res: Response) => {
    res.json({
      user: req.user,
    })
  }

  logout = async (req: Request, res: Response) => {
    await this.authService.logout({ sessionId: req.sessionId! })
    clearRefreshTokenCookie(res)

    res.status(204).send()
  }
}
