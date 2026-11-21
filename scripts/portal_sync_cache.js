import { createHash } from 'node:crypto'

const sourceFields = [
  'solicitacao_atividade_id',
  'atividade_descricao',
  'descricao',
  'entrega',
  'prazo_execucao',
  'data',
  'data_solicitacao',
  'cliente_nome',
  'usuario_solicitacao_nome',
  'usuario_responsavel_nome',
]

export function sourceFingerprint(row, category) {
  const sourceData = [
    category,
    ...sourceFields.map((field) => {
      const value = row[field]
      if (value == null) return ''
      return typeof value === 'string' ? value.trim() : JSON.stringify(value)
    }),
  ]
  return createHash('sha256').update(JSON.stringify(sourceData)).digest('hex')
}

export function needsDetailRefresh(previous, category, fingerprint) {
  if (!previous?.record) return true
  if (previous.record.Categoria_Solicitacao !== category) return true
  if (previous.sourceFingerprint == null) return false
  return previous.sourceFingerprint !== fingerprint
}

export function recordsChanged(previousRecords, records) {
  return JSON.stringify(previousRecords) !== JSON.stringify(records)
}
