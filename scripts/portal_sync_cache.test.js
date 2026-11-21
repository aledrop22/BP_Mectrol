import assert from 'node:assert/strict'
import test from 'node:test'
import { needsDetailRefresh, recordsChanged, sourceFingerprint } from './portal_sync_cache.js'

const row = {
  solicitacao_atividade_id: 'atividade-1',
  atividade_descricao: 'Recebimento',
  usuario_responsavel_nome: 'Ana',
}

function cachedRecord(category, fingerprint) {
  return {
    record: { Categoria_Solicitacao: category },
    sourceFingerprint: fingerprint,
  }
}

test('refreshes details for new BPs and changed workflow stages', () => {
  const fingerprint = sourceFingerprint(row, 'PENDENCIAS')

  assert.equal(needsDetailRefresh(null, 'PENDENCIAS', fingerprint), true)
  assert.equal(needsDetailRefresh(cachedRecord('PENDENCIAS', fingerprint), 'EM_ANDAMENTO', fingerprint), true)
})

test('reuses details when the BP source data is unchanged', () => {
  const fingerprint = sourceFingerprint(row, 'PENDENCIAS')

  assert.equal(needsDetailRefresh(cachedRecord('PENDENCIAS', fingerprint), 'PENDENCIAS', fingerprint), false)
})

test('refreshes details when the activity or responsible person changes', () => {
  const fingerprint = sourceFingerprint(row, 'PENDENCIAS')

  assert.equal(
    needsDetailRefresh(
      cachedRecord('PENDENCIAS', fingerprint),
      'PENDENCIAS',
      sourceFingerprint({ ...row, solicitacao_atividade_id: 'atividade-2' }, 'PENDENCIAS')
    ),
    true
  )
  assert.equal(
    needsDetailRefresh(
      cachedRecord('PENDENCIAS', fingerprint),
      'PENDENCIAS',
      sourceFingerprint({ ...row, usuario_responsavel_nome: 'Bruno' }, 'PENDENCIAS')
    ),
    true
  )
})

test('establishes a fingerprint for legacy cached records without refreshing them', () => {
  assert.equal(needsDetailRefresh(cachedRecord('PENDENCIAS', null), 'PENDENCIAS', 'current'), false)
})

test('reports whether local records changed before writing the JSON', () => {
  const records = [{ BP: '123', Cliente: 'Cliente teste' }]

  assert.equal(recordsChanged(records, records), false)
  assert.equal(recordsChanged(records, [{ ...records[0], Cliente: 'Cliente alterado' }]), true)
  assert.equal(recordsChanged(undefined, records), true)
})
