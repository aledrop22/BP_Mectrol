import assert from 'node:assert/strict'
import test from 'node:test'
import authHandler from '../api/auth.js'
import bpsHandler from '../api/bps.js'
import { SESSION_COOKIE, criarSessao, sessaoValida } from './auth.js'

const secret = 'a'.repeat(43)

function createResponse() {
  const headers = {}
  return {
    headers,
    statusCode: 200,
    body: '',
    setHeader(name, value) {
      headers[name.toLowerCase()] = value
    },
    end(value = '') {
      this.body = value
    },
  }
}

test('session cookie accepts valid signatures and rejects expired or modified ones', () => {
  const now = Date.now()
  const session = criarSessao(secret, now)
  assert.equal(sessaoValida(`other=value; ${SESSION_COOKIE}=${session}`, secret, now), true)
  assert.equal(sessaoValida(`${SESSION_COOKIE}=${session}`, secret, now + 9 * 60 * 60 * 1000), false)
  assert.equal(sessaoValida(`${SESSION_COOKIE}=${session}x`, secret, now), false)
})

test('login issues a secure session cookie and logout clears it', async () => {
  const previous = process.env.BP_DASHBOARD_PASSWORD
  process.env.BP_DASHBOARD_PASSWORD = secret
  try {
    const login = createResponse()
    authHandler({
      method: 'POST',
      headers: { origin: 'https://dashboard.test', host: 'dashboard.test' },
      body: { password: secret },
    }, login)

    assert.equal(login.statusCode, 200)
    assert.match(login.headers['set-cookie'], /HttpOnly; Secure; SameSite=Strict/)
    const cookie = login.headers['set-cookie'].split(';')[0]

    const check = createResponse()
    authHandler({ method: 'GET', headers: { cookie } }, check)
    assert.equal(check.statusCode, 200)
    assert.equal(JSON.parse(check.body).authenticated, true)

    const logout = createResponse()
    authHandler({
      method: 'DELETE',
      headers: { origin: 'https://dashboard.test', host: 'dashboard.test' },
    }, logout)
    assert.equal(logout.statusCode, 200)
    assert.match(logout.headers['set-cookie'], /Max-Age=0/)
  } finally {
    if (previous === undefined) delete process.env.BP_DASHBOARD_PASSWORD
    else process.env.BP_DASHBOARD_PASSWORD = previous
  }
})

test('login rejects an invalid password and a cross-origin request', () => {
  const previous = process.env.BP_DASHBOARD_PASSWORD
  process.env.BP_DASHBOARD_PASSWORD = secret
  try {
    const invalidPassword = createResponse()
    authHandler({
      method: 'POST',
      headers: { origin: 'https://dashboard.test', host: 'dashboard.test' },
      body: { password: 'wrong-password' },
    }, invalidPassword)
    assert.equal(invalidPassword.statusCode, 401)
    assert.equal(invalidPassword.headers['set-cookie'], undefined)

    const crossOrigin = createResponse()
    authHandler({
      method: 'POST',
      headers: { origin: 'https://attacker.test', host: 'dashboard.test' },
      body: { password: secret },
    }, crossOrigin)
    assert.equal(crossOrigin.statusCode, 403)
    assert.equal(crossOrigin.headers['set-cookie'], undefined)
  } finally {
    if (previous === undefined) delete process.env.BP_DASHBOARD_PASSWORD
    else process.env.BP_DASHBOARD_PASSWORD = previous
  }
})

test('BP API denies unauthenticated reads and uploads', async () => {
  const previousPassword = process.env.BP_DASHBOARD_PASSWORD
  const previousSyncSecret = process.env.BP_SYNC_SECRET
  process.env.BP_DASHBOARD_PASSWORD = secret
  delete process.env.BP_SYNC_SECRET
  try {
    const read = createResponse()
    await bpsHandler({ method: 'GET', headers: {} }, read)
    assert.equal(read.statusCode, 401)

    const write = createResponse()
    await bpsHandler({ method: 'POST', headers: {}, body: {} }, write)
    assert.equal(write.statusCode, 401)
  } finally {
    if (previousPassword === undefined) delete process.env.BP_DASHBOARD_PASSWORD
    else process.env.BP_DASHBOARD_PASSWORD = previousPassword
    if (previousSyncSecret === undefined) delete process.env.BP_SYNC_SECRET
    else process.env.BP_SYNC_SECRET = previousSyncSecret
  }
})
