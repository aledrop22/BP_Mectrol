import { spawnSync } from 'node:child_process'
import { mkdir, open, readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const localDir = path.join(root, 'local_data')
const outputPath = path.join(localDir, 'historico_bps_desenho.json')
const lockPath = path.join(localDir, 'portal-sync.lock')
const credentialScript = path.join(root, 'scripts', 'credential_manager.ps1')
const apiBase = 'https://bp.mectrol.com.br/webservice/index.php/'
const vercelSyncUrl = 'https://bp-mectrol.vercel.app/api/bps'
const portalProcess = 'RECEBIMENTO DE MATERIAL EM ESTOQUE'
const listTypes = [
  { tipo: 0, category: 'PENDENCIAS', status: 'Pendente', priority: 0 },
  { tipo: 2, category: 'EM_ANDAMENTO', status: 'Em andamento', priority: 1 },
  { tipo: 9, category: 'ATIVIDADES_EXECUTADAS', status: 'Concluído', priority: 2 },
  { tipo: 1, category: 'CONCLUIDAS', status: 'Concluído', priority: 3 },
]

function readPortalToken() {
  const result = spawnSync(
    'powershell.exe',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', credentialScript, '-Mode', 'Read'],
    { encoding: 'utf8', windowsHide: true }
  )
  if (result.error) throw new Error(`Não foi possível ler o token local: ${result.error.message}`)
  if (result.status !== 0) {
    throw new Error(`Não foi possível ler o token do Windows Credential Manager: ${result.stderr.trim()}`)
  }
  const token = result.stdout.trim()
  if (!/^[A-Za-z0-9._-]{20,512}$/.test(token)) {
    throw new Error('O token armazenado no Windows Credential Manager é inválido.')
  }
  return token
}

function readVercelSyncSecret() {
  const result = spawnSync(
    'powershell.exe',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', credentialScript, '-Mode', 'ReadVercel'],
    { encoding: 'utf8', windowsHide: true }
  )
  if (result.error) throw new Error(`Não foi possível ler a credencial do Vercel: ${result.error.message}`)
  if (result.status !== 0) {
    throw new Error(`Não foi possível ler a credencial de publicação do Vercel: ${result.stderr.trim()}`)
  }
  const secret = result.stdout.trim()
  if (secret && !/^[!-~]{32,512}$/.test(secret)) {
    throw new Error('A credencial de publicação do Vercel armazenada é inválida.')
  }
  return secret || null
}

function getText(value) {
  if (value == null) return ''
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value).trim()
  }
  if (Array.isArray(value)) return value.map(getText).filter(Boolean).join(', ')
  for (const key of ['valor', 'value', 'text', 'descricao', 'label', 'nome']) {
    if (value[key] != null) return getText(value[key])
  }
  return ''
}

function normalizar(value) {
  return getText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase()
}

function formatarData(value) {
  const texto = getText(value)
  if (!texto) return ''
  const iso = texto.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}:\d{2})(?::\d{2})?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)?$/)
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}${iso[4] ? ` ${iso[4]}` : ''}`
  return texto
}

function numeroBP(row) {
  const numero = getText(row.numero).replace(/\D/g, '')
  if (!numero) throw new Error('A API retornou um processo de BP sem número válido.')
  return numero
}

async function requestJson(url, token) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'X-Auth-Token': token,
      'X-Frontend': 'beta',
    },
  })
  if (!response.ok) throw new Error(`API do portal respondeu HTTP ${response.status} em ${url.pathname}.`)
  try {
    return await response.json()
  } catch {
    throw new Error(`API do portal retornou JSON inválido em ${url.pathname}.`)
  }
}

async function listarProcessos(token, listType) {
  const processos = []
  let skip = 0
  let total = Infinity

  while (skip < total) {
    const url = new URL('solicitacao/listar_todas/', apiBase)
    url.searchParams.set('tipo_listagem', String(listType.tipo))
    url.searchParams.set('tela_listagem', '1')
    url.searchParams.set('dx_grid', 'true')
    url.searchParams.set('skip', String(skip))
    url.searchParams.set('take', '100')
    url.searchParams.set('requireTotalCount', 'true')

    const response = await requestJson(url, token)
    if (!Array.isArray(response.data)) {
      throw new Error(`API do portal não retornou uma lista para tipo ${listType.tipo}.`)
    }
    if (Number.isFinite(Number(response.totalCount))) total = Number(response.totalCount)
    processos.push(...response.data)
    if (!response.data.length) break
    skip += response.data.length
  }

  return processos
}

function mapearElementos(detail) {
  const grupos = detail.formulario?.grupos || detail.grupos || []
  const elementos = grupos.flatMap((grupo) => grupo.elementos || [])
  return elementos
}

function valorCampo(elementos, id) {
  const elemento = elementos.find((item) => item.id_elemento === id)
  return elemento ? getText(elemento.valor) : ''
}

function lerQuantidade(elementos) {
  const tabela = elementos.find((item) => item.id_elemento === 'tab_itens_nf')
  if (!tabela) return null

  const quantidadeCampo = (tabela.campos || []).find((campo) => campo.id_elemento === 'qtde')
  if (!quantidadeCampo) return null
  const chave = String(quantidadeCampo.elem_key)
  const valores = (tabela.valor || []).filter((item) => String(item.elem_key) === chave)
  if (!valores.length) return null

  return valores.reduce((total, item) => {
    const texto = getText(item.valor).replace(/\s/g, '').replace(/\./g, '').replace(',', '.')
    const quantidade = Number(texto)
    if (!Number.isFinite(quantidade)) throw new Error('A API retornou uma quantidade inválida no detalhe do BP.')
    return total + quantidade
  }, 0)
}

function extractArrival(description) {
  const match = getText(description).match(/DATA\s+DE\s+CHEGADA\s*[:\-]\s*([^\r\n,;]+)/i)
  return match ? match[1].trim() : ''
}

async function detalharProcesso(row, token, category) {
  const id = getText(row.solicitacao_atividade_id)
  if (!id) throw new Error(`O BP ${numeroBP(row)} não possui identificador para consulta de detalhe.`)

  const url = new URL('solicitacao/objeto/', apiBase)
  url.searchParams.set('solicitacao_atividade_id', id)
  const response = await requestJson(url, token)
  const detail = response.formulario
    ? response
    : response.objeto || (typeof response.data === 'object' && response.data) || response
  const elementos = mapearElementos(detail)
  const descricao = getText(row.descricao)
  const info = listTypes.find((item) => item.category === category)
  const entrega = formatarData(row.entrega)
  const prazo = formatarData(row.prazo_execucao)

  return {
    BP: numeroBP(row),
    Cliente: valorCampo(elementos, 'cliente_nome') || getText(row.cliente_nome),
    Razao_Social: valorCampo(elementos, 'razao_social'),
    Nota_Fiscal: valorCampo(elementos, 'n_da_nota_f'),
    Quantidade: lerQuantidade(elementos),
    Motivo_Recebimento: valorCampo(elementos, 'motivo_recebimento'),
    Defeito: valorCampo(elementos, 'descreva_o_defeito_'),
    Filial: valorCampo(elementos, 'grupo_comercial_resp'),
    Assistente: '',
    Vendedor: valorCampo(elementos, 'vendedor'),
    Chegada: extractArrival(descricao),
    Prazo: prazo,
    Entrega: entrega,
    Atraso: '',
    Status: info.status,
    Solicitado_Em: formatarData(row.data || row.data_solicitacao),
    Solicitante: getText(row.usuario_solicitacao_nome),
    Responsavel: getText(row.usuario_responsavel_nome),
    Categoria_Solicitacao: category,
    Atividade: getText(row.atividade_descricao),
    Descricao: descricao,
  }
}

async function acquireLock() {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const lock = await open(lockPath, 'wx')
      await lock.writeFile(String(process.pid))
      return lock
    } catch (error) {
      if (error.code !== 'EEXIST') throw error

      let contents
      let lockInfo
      try {
        [contents, lockInfo] = await Promise.all([
          readFile(lockPath, 'utf8'),
          stat(lockPath),
        ])
      } catch (readError) {
        if (readError.code === 'ENOENT') continue
        throw readError
      }

      const pid = Number(contents.trim())
      let processExists = false
      if (Number.isSafeInteger(pid) && pid > 0) {
        try {
          process.kill(pid, 0)
          processExists = true
        } catch (processError) {
          if (processError.code === 'EPERM') processExists = true
          else if (processError.code !== 'ESRCH') throw processError
        }
      } else if (Date.now() - lockInfo.mtimeMs < 120000) {
        processExists = true
      }

      if (processExists) {
        throw new Error('Já existe uma sincronização do portal em andamento.')
      }
      await rm(lockPath, { force: true })
    }
  }
  throw new Error('Não foi possível obter o bloqueio para sincronização do portal.')
}

async function publicarNoVercel(payload) {
  const secret = readVercelSyncSecret()
  if (!secret) return 'pendente_configuracao'

  const response = await fetch(vercelSyncUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(60000),
  })
  if (!response.ok) {
    throw new Error(`A publicação privada no Vercel respondeu HTTP ${response.status}.`)
  }
  const result = await response.json()
  if (!result.saved || result.total !== payload.total) {
    throw new Error('O Vercel não confirmou a gravação dos dados privados.')
  }
  return 'publicado'
}

async function main() {
  await mkdir(localDir, { recursive: true })
  const lock = await acquireLock()
  let token
  try {
    token = readPortalToken()
    const latestByBp = new Map()
    for (const listType of listTypes) {
      const processes = await listarProcessos(token, listType)
      const bpProcesses = processes.filter(
        (row) => normalizar(row.processo_nome).replace(/\s+\d+$/, '') === portalProcess
      )
      for (const row of bpProcesses) {
        const bp = numeroBP(row)
        const previous = latestByBp.get(bp)
        if (!previous || listType.priority < previous.listType.priority) {
          latestByBp.set(bp, { row, listType })
        }
      }
    }

    if (!latestByBp.size) throw new Error('O portal não retornou processos do tipo BP esperado.')

    const records = []
    for (const { row, listType } of latestByBp.values()) {
      records.push(await detalharProcesso(row, token, listType.category))
    }
    records.sort((a, b) => Number(a.BP) - Number(b.BP))

    const payload = {
      schemaVersion: 1,
      atualizadoEm: new Date().toISOString(),
      total: records.length,
      registros: records,
    }
    const temporaryPath = `${outputPath}.${process.pid}.tmp`
    await writeFile(temporaryPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
    await rename(temporaryPath, outputPath)
    const publicacaoVercel = await publicarNoVercel(payload)

    const coverage = Object.fromEntries(
      ['Cliente', 'Nota_Fiscal', 'Quantidade', 'Filial', 'Vendedor', 'Defeito'].map((field) => [
        field,
        records.filter((record) => record[field] !== '' && record[field] != null).length,
      ])
    )
    console.log(JSON.stringify({
      atualizadoEm: payload.atualizadoEm,
      total: records.length,
      publicacaoVercel,
      categorias: Object.fromEntries(
        [...latestByBp.values()].reduce((counts, item) => {
          counts.set(item.listType.category, (counts.get(item.listType.category) || 0) + 1)
          return counts
        }, new Map())
      ),
      cobertura: coverage,
    }))
  } finally {
    token = undefined
    await lock.close()
    await rm(lockPath, { force: true })
  }
}

main().catch((error) => {
  console.error(`Sincronização do portal falhou: ${error.message}`)
  process.exitCode = 1
})
