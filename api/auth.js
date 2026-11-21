import {
  criarSessao,
  segredoConfigurado,
  segredoConfere,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  sessaoValida,
} from '../server/auth.js'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4kb',
    },
  },
}

function responder(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.end(body == null ? '' : JSON.stringify(body))
}

function mesmaOrigem(req) {
  const origin = req.headers.origin
  if (!origin) return false
  try {
    return new URL(origin).host === req.headers.host
  } catch {
    return false
  }
}

export default function handler(req, res) {
  const secret = process.env.BP_DASHBOARD_PASSWORD
  if (!segredoConfigurado(secret)) {
    responder(res, 503, { error: 'auth_not_configured', message: 'A autenticação do painel ainda não foi configurada.' })
    return
  }

  if (req.method === 'GET') {
    const authenticated = sessaoValida(req.headers.cookie, secret)
    responder(res, authenticated ? 200 : 401, { authenticated })
    return
  }

  if (req.method === 'DELETE') {
    if (!mesmaOrigem(req)) {
      responder(res, 403, { error: 'invalid_origin' })
      return
    }
    res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`)
    responder(res, 200, { authenticated: false })
    return
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST, DELETE')
    responder(res, 405, { error: 'method_not_allowed' })
    return
  }

  if (!mesmaOrigem(req)) {
    responder(res, 403, { error: 'invalid_origin' })
    return
  }

  const password = typeof req.body?.password === 'string' ? req.body.password : ''
  if (!segredoConfere(password, secret)) {
    responder(res, 401, { error: 'invalid_credentials', message: 'Senha incorreta.' })
    return
  }

  const session = criarSessao(secret)
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=${session}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_MAX_AGE}`
  )
  responder(res, 200, { authenticated: true })
}
