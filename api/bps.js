import { get, put } from '@vercel/blob'
import { segredoConfigurado, segredoConfere, sessaoValida } from '../server/auth.js'

const BLOB_PATHNAME = 'mectrol/historico_bps_desenho.json'
const MAX_PAYLOAD_BYTES = 1024 * 1024
const CATEGORIES = new Set([
  'PENDENCIAS',
  'EM_ANDAMENTO',
  'CONCLUIDAS',
  'ATIVIDADES_EXECUTADAS',
])

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}

function responder(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.end(JSON.stringify(body))
}

function payloadValido(payload) {
  if (!payload || payload.schemaVersion !== 1 || !Array.isArray(payload.registros)) return false
  if (!payload.registros.length || payload.registros.length > 1000) return false
  if (payload.total !== payload.registros.length) return false
  return payload.registros.every((record) =>
    record &&
    typeof record.BP === 'string' &&
    /^\d+$/.test(record.BP) &&
    typeof record.Cliente === 'string' &&
    CATEGORIES.has(record.Categoria_Solicitacao)
  )
}

async function lerDados(res) {
  if (!process.env.BLOB_STORE_ID && !process.env.BLOB_READ_WRITE_TOKEN) {
    responder(res, 503, { error: 'private_storage_not_configured' })
    return
  }

  try {
    const result = await get(BLOB_PATHNAME, { access: 'private' })
    if (!result || result.statusCode !== 200) {
      responder(res, 404, { error: 'data_not_synced' })
      return
    }

    const text = await new Response(result.stream).text()
    const payload = JSON.parse(text)
    if (!payloadValido(payload)) {
      responder(res, 502, { error: 'stored_data_invalid' })
      return
    }
    responder(res, 200, payload)
  } catch (error) {
    console.error('Private BP data read failed:', error.name || 'Error')
    responder(res, 503, { error: 'private_storage_unavailable' })
  }
}

async function gravarDados(req, res) {
  const expected = process.env.BP_SYNC_SECRET
  const authorization = req.headers.authorization || ''
  const match = authorization.match(/^Bearer (.+)$/)
  if (!segredoConfigurado(expected) || !segredoConfere(match?.[1] || '', expected)) {
    responder(res, 401, { error: 'invalid_sync_credentials' })
    return
  }

  const payload = req.body
  if (!payloadValido(payload)) {
    responder(res, 400, { error: 'invalid_payload' })
    return
  }

  const content = JSON.stringify(payload)
  if (Buffer.byteLength(content, 'utf8') > MAX_PAYLOAD_BYTES) {
    responder(res, 413, { error: 'payload_too_large' })
    return
  }

  if (!process.env.BLOB_STORE_ID && !process.env.BLOB_READ_WRITE_TOKEN) {
    responder(res, 503, { error: 'private_storage_not_configured' })
    return
  }

  try {
    await put(BLOB_PATHNAME, content, {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60,
      contentType: 'application/json; charset=utf-8',
    })
    responder(res, 200, {
      saved: true,
      total: payload.total,
      atualizadoEm: payload.atualizadoEm,
    })
  } catch (error) {
    console.error('Private BP data write failed:', error.name || 'Error')
    responder(res, 503, { error: 'private_storage_unavailable' })
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const secret = process.env.BP_DASHBOARD_PASSWORD
    if (!segredoConfigurado(secret)) {
      responder(res, 503, { error: 'auth_not_configured' })
      return
    }
    if (!sessaoValida(req.headers.cookie, secret)) {
      responder(res, 401, { error: 'authentication_required' })
      return
    }
    await lerDados(res)
    return
  }

  if (req.method === 'POST') {
    await gravarDados(req, res)
    return
  }

  res.setHeader('Allow', 'GET, POST')
  responder(res, 405, { error: 'method_not_allowed' })
}
