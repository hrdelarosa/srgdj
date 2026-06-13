import type { Response } from 'express'

const REFRESH_COOKIE_NAME = 'srgdj_refresh_token'

export function getRefreshCookieName() {
  return REFRESH_COOKIE_NAME
}

export function parseCookies(cookieHeader: string | undefined) {
  const cookies = new Map<string, string>()

  if (!cookieHeader) return cookies

  cookieHeader.split(';').forEach((cookie) => {
    const [name, ...rest] = cookie.trim().split('=')
    if (!name) return
    cookies.set(name, decodeURIComponent(rest.join('=')))
  })

  return cookies
}

export function setRefreshTokenCookie({
  res,
  token,
  expiresAt,
}: {
  res: Response
  token: string
  expiresAt: Date
}) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    path: '/api/v1/auth',
  })
}

export function clearRefreshTokenCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/api/v1/auth',
  })
}
