import assert from 'node:assert/strict'
import test from 'node:test'
import { portalApiValidationError } from './portal_api_response.js'

test('explains when the portal session token is invalid', () => {
  assert.match(
    portalApiValidationError({ validation: { messages: [{ message: 'Token inválido' }] } }),
    /token de sessão do portal expirou ou foi revogado/i
  )
})

test('preserves useful portal validation messages', () => {
  assert.equal(
    portalApiValidationError({ validation: { messages: [{ message: 'Parâmetro inválido' }] } }),
    'O portal rejeitou a solicitação: Parâmetro inválido'
  )
})

test('ignores normal API payloads', () => {
  assert.equal(portalApiValidationError({ data: [], totalCount: 0 }), null)
})
