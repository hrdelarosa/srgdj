import argon2 from 'argon2'
import { randomBytes } from 'node:crypto'
import jwt, { type SignOptions } from 'jsonwebtoken'
import { AppError } from '../../utils/errors/app-error.js'
import { AuthModel } from './auth.model.js'
import { LoginInput } from './auth.schema.js'
import { hashToken } from '../../utils/auth/hashToken.js'
import type { AuthMeta } from './auth.type.js'
import { AuditService } from '../audit/audit.service.js'

const ACCESS_TOKEN_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ??
  '15m') as SignOptions['expiresIn']
const REFRESH_TOKEN_DAYS = Number(process.env.REFRESH_TOKEN_DAYS ?? 7)

function createRefreshToken() {
  return randomBytes(48).toString('base64url')
}

function createAccessToken({
  user,
}: {
  user: { id: string; username: string; role: { code: string } }
}) {
  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret) throw new Error('JWT_SECRET is not defined')

  return jwt.sign(
    {
      sub: user.id,
      username: user.username,
      role: user.role.code,
    },
    jwtSecret,
    {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    },
  )
}

function createRefreshExpiration(now: Date) {
  return new Date(now.getTime() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000)
}

export class AuthService {
  private readonly authModel: typeof AuthModel

  constructor({ authModel }: { authModel: typeof AuthModel }) {
    this.authModel = authModel
  }

  login = async ({
    data,
    meta,
  }: {
    data: LoginInput
    meta: AuthMeta
  }) => {
    const user = await this.authModel.findUserByUsername({
      username: data.username,
    })

    if (!user) {
      await AuditService.create({
        data: {
          action: 'auth.login_failed',
          entityType: 'auth',
          metadata: { username: data.username },
          ip: meta.ip ?? null,
          userAgent: meta.userAgent ?? null,
        },
      })

      throw new AppError({
        message: 'Credenciales inválidas',
        statusCode: 401,
        code: 'INVALID_CREDENTIALS',
      })
    }

    const isPasswordValid = await argon2.verify(
      user.passwordHash,
      data.password,
    )

    if (!isPasswordValid) {
      await AuditService.create({
        data: {
          actorUserId: user.id,
          action: 'auth.login_failed',
          entityType: 'auth',
          metadata: { username: data.username },
          ip: meta.ip ?? null,
          userAgent: meta.userAgent ?? null,
        },
      })

      throw new AppError({
        message: 'Credenciales inválidas',
        statusCode: 401,
        code: 'INVALID_CREDENTIALS',
      })
    }

    if (!user.isActive) {
      await AuditService.create({
        data: {
          actorUserId: user.id,
          action: 'auth.login_failed',
          entityType: 'auth',
          metadata: { username: data.username, reason: 'inactive_user' },
          ip: meta.ip ?? null,
          userAgent: meta.userAgent ?? null,
        },
      })

      throw new AppError({
        message: 'Usuario inactivo',
        statusCode: 403,
        code: 'INACTIVE_USER',
      })
    }

    if (!user.role.isActive) {
      await AuditService.create({
        data: {
          actorUserId: user.id,
          action: 'auth.login_failed',
          entityType: 'auth',
          metadata: { username: data.username, reason: 'inactive_role' },
          ip: meta.ip ?? null,
          userAgent: meta.userAgent ?? null,
        },
      })

      throw new AppError({
        message: 'El rol del usuario está inactivo',
        statusCode: 403,
        code: 'INACTIVE_ROLE',
      })
    }

    const now = new Date()
    const accessToken = createAccessToken({ user })
    const refreshToken = createRefreshToken()
    const expiresAt = createRefreshExpiration(now)

    await this.authModel.createSession({
      data: {
        userId: user.id,
        tokenHash: hashToken(accessToken),
        refreshTokenHash: hashToken(refreshToken),
        expiresAt,
        lastActivityAt: now,
        createdByIp: meta.ip ?? null,
        userAgent: meta.userAgent ?? null,
      },
    })

    await this.authModel.updateLastLogin({ id: user.id })

    const permissions = await this.authModel.findPermissionsByRoleId({
      roleId: user.role.id,
    })

    await AuditService.create({
      data: {
        actorUserId: user.id,
        action: 'auth.login_success',
        entityType: 'auth',
        entityId: user.id,
        ip: meta.ip ?? null,
        userAgent: meta.userAgent ?? null,
      },
    })

    return {
      accessToken,
      refreshToken,
      refreshExpiresAt: expiresAt,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        permissions: permissions.map((permission) => permission.code),
        mustChangePassword: user.mustChangePassword,
      },
    }
  }

  logout = async ({ sessionId }: { sessionId: string }) => {
    await this.authModel.revokeSession({ sessionId, reason: 'logout' })
    await AuditService.create({
      data: {
        action: 'auth.logout',
        entityType: 'auth',
        entityId: sessionId,
      },
    })
  }

  refresh = async ({
    refreshToken,
    meta,
  }: {
    refreshToken: string
    meta: AuthMeta
  }) => {
    const session = await this.authModel.findValidSessionByRefreshTokenHash({
      refreshTokenHash: hashToken(refreshToken),
    })

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new AppError({
        message: 'Sesión no válida',
        statusCode: 401,
        code: 'INVALID_SESSION',
      })
    }

    if (!session.user.isActive) {
      await this.authModel.revokeSession({
        sessionId: session.id,
        reason: 'inactive_user',
      })

      throw new AppError({
        message: 'Usuario inactivo',
        statusCode: 401,
        code: 'INACTIVE_USER',
      })
    }

    if (!session.user.role.isActive) {
      await this.authModel.revokeSession({
        sessionId: session.id,
        reason: 'inactive_role',
      })

      throw new AppError({
        message: 'El rol del usuario está inactivo',
        statusCode: 401,
        code: 'INACTIVE_ROLE',
      })
    }

    const now = new Date()
    const newAccessToken = createAccessToken({ user: session.user })
    const newRefreshToken = createRefreshToken()
    const expiresAt = createRefreshExpiration(now)

    await this.authModel.rotateSession({
      sessionId: session.id,
      tokenHash: hashToken(newAccessToken),
      refreshTokenHash: hashToken(newRefreshToken),
      expiresAt,
      date: now,
    })

    const permissions = await this.authModel.findPermissionsByRoleId({
      roleId: session.user.role.id,
    })

    await AuditService.create({
      data: {
        actorUserId: session.user.id,
        action: 'auth.refresh',
        entityType: 'auth',
        entityId: session.id,
        ip: meta.ip ?? null,
        userAgent: meta.userAgent ?? null,
      },
    })

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      refreshExpiresAt: expiresAt,
      user: {
        id: session.user.id,
        username: session.user.username,
        fullName: session.user.fullName,
        role: session.user.role,
        permissions: permissions.map((permission) => permission.code),
        mustChangePassword: session.user.mustChangePassword,
      },
    }
  }

  findSessions = async ({ userId }: { userId: string }) => {
    return this.authModel.findSessionsByUserId({ userId })
  }

  revokeSession = async ({
    sessionId,
    actorUserId,
  }: {
    sessionId: string
    actorUserId: string
  }) => {
    await this.authModel.revokeSession({ sessionId, reason: 'manual' })
    await AuditService.create({
      data: {
        actorUserId,
        action: 'auth.session_revoked',
        entityType: 'user_session',
        entityId: sessionId,
      },
    })
  }
}
