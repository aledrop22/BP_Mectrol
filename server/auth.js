import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

export const SESSION_COOKIE = 'bp_mectrol_session'
export const SESSION_MAX_AGE = 8 * 60 * 60
export const MIN_SECRET_LENGTH = 32

function digest(value) {
  return createHash('sha256').update(value).digest()
}

export function segredoConfigurado(secret) {
  return typeof secret === 'string' &&
    secret.length >= MIN_SECRET_LENGTH &&
    secret.length <= 512
}

export function segredoConfere(candidate, expected) {
  if (
    typeof candidate !== 'string' ||
    candidate.length > 512 ||
    typeof expected !== 'string' ||
    expected.length > 512
  ) return false
  return timingSafeEqual(digest(candidate), digest(expected))
}

export function criarSessao(secret, now = Date.now()) {
  const expires = Math.floor(now / 1000) + SESSION_MAX_AGE
  const signature = createHmac('sha256', secret).update(String(expires)).digest('base64url')
  return `${expires}.${signature}`
}

export function sessaoValida(cookieHeader, secret, now = Date.now()) {
  if (!segredoConfigurado(secret) || typeof cookieHeader !== 'string') return false

  const cookie = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`))
  if (!cookie) return false

  const value = cookie.slice(SESSION_COOKIE.length + 1)
  const [expiresText, signature] = value.split('.')
  const expires = Number(expiresText)
  if (!Number.isSafeInteger(expires) || expires <= Math.floor(now / 1000) || !signature) {
    return false
  }

  const expected = createHmac('sha256', secret).update(expiresText).digest('base64url')
  return signature.length === expected.length &&
    timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
}
