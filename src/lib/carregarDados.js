import { ordenarFilaBPs } from './filaEngine.js';

function mapearRegistro(reg, idx) {
  const bpNum = String(reg.BP || '').trim();
  if (!bpNum) return null;

  const quantidade = reg.Quantidade === '' || reg.Quantidade == null
    ? null
    : Number(String(reg.Quantidade).replace(',', '.'));
  if (quantidade !== null && !Number.isFinite(quantidade)) {
    throw new Error(`Quantidade inválida no registro BP ${bpNum}.`);
  }

  return {
    bp: bpNum,
    cliente: reg.Cliente || '',
    razao: reg.Razao_Social || '',
    nf: reg.Nota_Fiscal || '',
    quantidade: quantidade === null ? null : Math.round(quantidade),
    motivoRecebimento: reg.Motivo_Recebimento || '',
    defeito: reg.Defeito || '',
    tipoServico: '',
    filial: reg.Filial || '',
    assistente: reg.Assistente || '',
    vendedor: reg.Vendedor || '',
    vendedorOriginal: reg.Vendedor || '',
    chegada: reg.Chegada || '',
    diasAtras: 0,
    prazo: reg.Prazo || '',
    atraso: reg.Atraso || '',
    tempoParado: '',
    prazoEnvio: '',
    gargaloCritico: false,
    status: reg.Status || '',
    laudo: reg.Laudo || '',
    dimensionalStatus: reg.Dimensional_Status || '',
    etapaMacro: reg.Etapa_Macro || '',
    laudoDifusoInicio: reg.Laudo_Manutencao_Difuso || '',
    laudoFinalConclusao: reg.Laudo_Manutencao_Final || '',
    urgencia: (reg.Urgencia || 'NORMAL').toUpperCase(),
    prioridade: (reg.Prioridade || 'MEDIA').toUpperCase(),
    solicitadoEmOrder: idx + 1,
    solicitadoEm: reg.Solicitado_Em || '',
    solicitadoPor: reg.Solicitante || '',
    responsavel: reg.Responsavel || '',
    categoriaSolicitacao: reg.Categoria_Solicitacao || '',
    atividade: reg.Atividade || '',
    descricao: reg.Descricao || '',
    diametro: reg.Diametro_Primitivo || '',
    passo: reg.Passo || '',
    compTotal: reg.Comp_Total || '',
    precisao: reg.Precisao || '',
    diretoriaOverride: false,
    diretoriaAutorizador: '',
    diretoriaMotivo: '',
    diretoriaTimestamp: 0,
    emailComprovante: '',
    gantt: { inicio: 0, laudo: 0, croqui: 0, desenho: 0, manut: 0, limite: 0 },
  };
}

export async function carregarDados() {
  let arquivo;
  let ultimoErro;

  for (const origem of ['/api/bps', '/historico_bps_desenho.json']) {
    try {
      const resp = await fetch(origem, { cache: 'no-store' });
      if (resp.ok) {
        arquivo = await resp.json();
        break;
      }
      ultimoErro = new Error(`Não foi possível carregar os dados de BPs (HTTP ${resp.status}).`);
      ultimoErro.status = resp.status;
    } catch (error) {
      ultimoErro = error;
    }
  }

  if (!arquivo) {
    throw ultimoErro || new Error('Não foi possível carregar os dados de BPs.');
  }
  if (!arquivo || !Array.isArray(arquivo.registros) || !arquivo.registros.length) {
    throw new Error('O armazenamento não retornou registros de BP válidos.');
  }

  const mapeados = arquivo.registros
    .map((reg, idx) => mapearRegistro(reg, idx))
    .filter(Boolean);
  if (!mapeados.length) throw new Error('O armazenamento não retornou registros de BP válidos.');
  return ordenarFilaBPs(mapeados);
}
