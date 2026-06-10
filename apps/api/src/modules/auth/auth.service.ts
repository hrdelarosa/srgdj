import argon2 from 'argon2'
import jwt, { type SignOptions } from 'jsonwebtoken'
import { AppError } from '../../utils/errors/app-error.js'
import { AuthModel } from './auth.model.js'
import { LoginInput } from './auth.schema.js'
import { hashToken } from '../../utils/auth/hashToken.js'

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
    meta: { ip?: string; userAgent?: string }
  }) => {
    const user = await this.authModel.findUserByUsername({
      username: data.username,
    })

    if (!user || !user.isActive)
      throw new AppError({
        message: 'Credenciales inválidas',
        statusCode: 401,
        code: 'INVALID_CREDENTIALS',
      })

    const isPasswordValid = await argon2.verify(
      user.passwordHash,
      data.password,
    )

    if (!isPasswordValid) {
      throw new AppError({
        message: 'Credenciales inválidas',
        statusCode: 401,
        code: 'INVALID_CREDENTIALS',
      })
    }

    const jwtSecret = process.env.JWT_SECRET

    if (!jwtSecret) throw new Error('JWT_SECRET is not defined')

    const expiresIn = (process.env.JWT_EXPIRES_IN ??
      '1h') as SignOptions['expiresIn']
    const accessToken = jwt.sign(
      {
        sub: user.id,
        username: user.username,
        role: user.role.code,
      },
      jwtSecret,
      {
        expiresIn,
      },
    )
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000)

    await this.authModel.createSession({
      data: {
        userId: user.id,
        tokenHash: hashToken(accessToken),
        expiresAt,
        lastActivityAt: now,
        createdByIp: meta.ip ?? null,
        userAgent: meta.userAgent ?? null,
      },
    })

    await this.authModel.updateLastLogin({ id: user.id })

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        fullNeme: user.fullName,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
    }
  }
}
