import { DADOS_INICIAIS } from '../data/dados';
import { ordenarFilaBPs } from './filaEngine';

function parseCSV(texto) {
  const linhas = [];
  let campo = '', linha = [], emAspas = false;

  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (emAspas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') emAspas = false;
      else campo += c;
    } else if (c === '"') emAspas = true;
    else if (c === ',') { linha.push(campo); campo = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && texto[i + 1] === '\n') i++;
      linha.push(campo); campo = '';
      if (linha.length > 1 || linha[0] !== '') linhas.push(linha);
      linha = [];
    } else campo += c;
  }
  if (campo !== '' || linha.length) { linha.push(campo); linhas.push(linha); }
  return linhas;
}

function mapearLinhaComEnriquecimento(cabecalho, valores, idx) {
  const reg = Object.fromEntries(cabecalho.map((h, i) => [h.trim(), (valores[i] || '').trim()]));
  const bpNum = reg.BP || '';
  const baseEnriquecida = DADOS_INICIAIS.find((d) => String(d.bp) === String(bpNum)) || {};

  const urgenciaCsv = (reg.Urgencia || baseEnriquecida.urgencia || 'NORMAL').toUpperCase();
  const prioridade = baseEnriquecida.prioridade || (urgenciaCsv === 'ALTA' ? 'ALTA' : 'MEDIA');
  const laudoStr = baseEnriquecida.laudo || reg.Laudo || 'Pendente';

  return {
    ...baseEnriquecida,
    bp: bpNum,
    cliente: reg.Cliente || baseEnriquecida.cliente || '',
    razao: reg.Razao_Social || baseEnriquecida.razao || '',
    nf: reg.Nota_Fiscal || baseEnriquecida.nf || '',
    quantidade: Number(baseEnriquecida.quantidade || reg.Quantidade || 1),
    motivoRecebimento: baseEnriquecida.motivoRecebimento || reg.Motivo_Recebimento || 'Manutenção',
    tipoServico: baseEnriquecida.tipoServico || 'Depto. Manutenção + Depto. Projeto',
    filial: baseEnriquecida.filial || reg.Filial || '',
    vendedor: baseEnriquecida.vendedor || reg.Vendedor || '',
    vendedorOriginal: baseEnriquecida.vendedorOriginal || reg.Vendedor || '',
    chegada: reg.Chegada || baseEnriquecida.chegada || '',
    diasAtras: baseEnriquecida.diasAtras ?? 10,
    prazo: reg.Prazo || baseEnriquecida.prazo || '',
    atraso: baseEnriquecida.atraso || reg.Atraso || '',
    tempoParado: baseEnriquecida.tempoParado || '1 dia',
    prazoEnvio: baseEnriquecida.prazoEnvio || '2 dias',
    gargaloCritico: Boolean(baseEnriquecida.gargaloCritico),
    status: baseEnriquecida.status || reg.Status || 'Em Andamento',
    laudo: laudoStr,
    dimensionalStatus:
      baseEnriquecida.dimensionalStatus ||
      (laudoStr === 'Concluído' ? 'Completo' : 'Aguardando Laudo'),
    etapaMacro:
      baseEnriquecida.etapaMacro ||
      (laudoStr === 'Concluído' ? 'FILA_CROQUI' : 'AGUARDANDO_LAUDO'),
    laudoDifusoInicio:
      reg.Laudo_Manutencao_Difuso ||
      baseEnriquecida.laudoDifusoInicio ||
      (laudoStr === 'Concluído' ? `${reg.Chegada || '28/10/2026'} 09:00` : ''),
    laudoFinalConclusao:
      reg.Laudo_Manutencao_Final ||
      baseEnriquecida.laudoFinalConclusao ||
      (laudoStr === 'Concluído' ? `${reg.Chegada || '28/10/2026'} 15:30` : ''),
    urgencia: urgenciaCsv,
    prioridade,
    solicitadoEmOrder: baseEnriquecida.solicitadoEmOrder || idx + 1,
    solicitadoEm: baseEnriquecida.solicitadoEm || '12/11/2026 09:00',
    solicitadoPor: baseEnriquecida.solicitadoPor || reg.Vendedor || 'Depto. Comercial',
    diametro: reg.Diametro_Primitivo !== undefined && reg.Diametro_Primitivo !== '' ? reg.Diametro_Primitivo : (baseEnriquecida.diametro || ''),
    passo: reg.Passo !== undefined && reg.Passo !== '' ? reg.Passo : (baseEnriquecida.passo || ''),
    compTotal: reg.Comp_Total !== undefined && reg.Comp_Total !== '' ? reg.Comp_Total : (baseEnriquecida.compTotal || ''),
    precisao: reg.Precisao !== undefined && reg.Precisao !== '' ? reg.Precisao : (baseEnriquecida.precisao || ''),
    diretoriaOverride: Boolean(baseEnriquecida.diretoriaOverride),
    diretoriaAutorizador: baseEnriquecida.diretoriaAutorizador || '',
    diretoriaMotivo: baseEnriquecida.diretoriaMotivo || '',
    diretoriaTimestamp: baseEnriquecida.diretoriaTimestamp || 0,
    emailComprovante: baseEnriquecida.emailComprovante || '',
    gantt: baseEnriquecida.gantt || { inicio: 2, laudo: 2, croqui: 2, desenho: 2, manut: 2, limite: 12 },
  };
}

export async function carregarDados() {
  try {
    const resp = await fetch('/historico_bps_desenho.csv', { cache: 'no-store' });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const texto = await resp.text();
    const [cabecalho, ...linhas] = parseCSV(texto);
    if (!cabecalho || !linhas.length) throw new Error('CSV vazio');
    const mapeados = linhas.map((vals, idx) => mapearLinhaComEnriquecimento(cabecalho, vals, idx));
    const bpsMapeadosSet = new Set(mapeados.map((m) => String(m.bp)));
    const extras = DADOS_INICIAIS.filter((d) => !bpsMapeadosSet.has(String(d.bp)));
    return ordenarFilaBPs([...mapeados, ...extras]);
  } catch (err) {
    console.warn('Não foi possível carregar o CSV; usando dados de demonstração.', err);
    return ordenarFilaBPs(DADOS_INICIAIS);
  }
}
