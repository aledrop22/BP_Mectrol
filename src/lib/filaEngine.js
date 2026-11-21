// Motor puro de ordenação de fila, cálculo de posição por prioridade (Alta, Média, Baixa),
// mesclagem de vendedores por filial (férias/cobertura), monitoramento do histórico de manutenção
// (Laudo de Manutenção de Fuso [Início] e Laudo Manutenção Final [Fim]) e Fura-Fila da Diretoria.

import { FILIAIS_DB_INICIAL } from '../data/dados.js';

export const PESO_PRIORIDADE = {
  ALTA: 3,
  MEDIA: 2,
  BAIXA: 1,
};

export const ROTULO_PRIORIDADE = {
  ALTA: 'Alta (Urgente)',
  MEDIA: 'Média (Programada)',
  BAIXA: 'Baixa (Normal)',
};

export function correspondeFiltroSolicitacao(item, filtro) {
  switch (filtro) {
    case 'PENDENCIAS':
      return item.categoriaSolicitacao
        ? item.categoriaSolicitacao === 'PENDENCIAS'
        : item.status === 'Atrasada';
    case 'CONCLUIDAS':
      return item.categoriaSolicitacao
        ? item.categoriaSolicitacao === 'CONCLUIDAS'
        : item.status === 'Concluído';
    case 'EM_ANDAMENTO':
      return item.categoriaSolicitacao
        ? item.categoriaSolicitacao === 'EM_ANDAMENTO'
        : item.status === 'Em Andamento';
    case 'ATIVIDADES_EXECUTADAS':
      return item.categoriaSolicitacao
        ? item.categoriaSolicitacao === 'ATIVIDADES_EXECUTADAS'
        : Boolean(String(item.laudoFinalConclusao || '').trim());
    case 'TODOS':
      return true;
    default:
      return false;
  }
}

/**
 * Ordena a lista de BPs seguindo a regra de negócio da MECTROL:
 * 1. BPs ativos vêm antes de BPs "Concluído".
 * 2. No topo absoluto (#1): BPs com `diretoriaOverride === true` (aprovados pela Diretoria / Fura-Fila),
 *    ordenados pelo mais recente comando da diretoria (`diretoriaTimestamp` desc).
 * 3. Em seguida, ordena por faixa de prioridade: ALTA > MEDIA > BAIXA.
 * 4. Dentro da mesma faixa de prioridade, segue ordem estrita de chegada da solicitação
 *    (`solicitadoEmOrder` asc — quem solicitou primeiro fica na frente).
 */
export function ordenarFilaBPs(listaBps) {
  return [...listaBps].sort((a, b) => {
    const aConcluido = a.status === 'Concluído' ? 1 : 0;
    const bConcluido = b.status === 'Concluído' ? 1 : 0;
    if (aConcluido !== bConcluido) return aConcluido - bConcluido;

    const aDir = a.diretoriaOverride ? 1 : 0;
    const bDir = b.diretoriaOverride ? 1 : 0;
    if (aDir !== bDir) return bDir - aDir;
    if (aDir && bDir) {
      return (b.diretoriaTimestamp || 0) - (a.diretoriaTimestamp || 0);
    }

    const pesoA = PESO_PRIORIDADE[a.prioridade] || 1;
    const pesoB = PESO_PRIORIDADE[b.prioridade] || 1;
    if (pesoA !== pesoB) return pesoB - pesoA;

    return (a.solicitadoEmOrder || 9999) - (b.solicitadoEmOrder || 9999);
  });
}

/**
 * Calcula quantas pessoas/BPs já estão na frente quando alguém seleciona uma prioridade
 * (ALTA, MEDIA ou BAIXA) para um BP específico ou nova solicitação.
 */
export function calcularPosicaoNaFila(listaBps, bpAlvo, prioridadeEscolhida = 'ALTA') {
  const prio = ['ALTA', 'MEDIA', 'BAIXA'].includes(prioridadeEscolhida)
    ? prioridadeEscolhida
    : 'ALTA';

  const ativos = ordenarFilaBPs(listaBps).filter(
    (item) => item.status !== 'Concluído' && String(item.bp) !== String(bpAlvo)
  );

  const naMesmaPrioridade = ativos.filter(
    (item) => !item.diretoriaOverride && item.prioridade === prio
  );
  const pessoasNaFrenteNaFaixa = naMesmaPrioridade.length;
  const posicaoNaFaixa = pessoasNaFrenteNaFaixa + 1;

  const pesoEscolhido = PESO_PRIORIDADE[prio];
  const naFrenteGeral = ativos.filter((item) => {
    if (item.diretoriaOverride) return true;
    const pesoItem = PESO_PRIORIDADE[item.prioridade] || 1;
    return pesoItem >= pesoEscolhido;
  });

  const pessoasNaFrenteGeral = naFrenteGeral.length;
  const posicaoGeral = pessoasNaFrenteGeral + 1;

  const nomeFaixa =
    prio === 'ALTA' ? 'Alta (Urgente)' : prio === 'MEDIA' ? 'Média' : 'Baixa';

  let mensagemPrincipal = '';
  if (pessoasNaFrenteNaFaixa === 0) {
    mensagemPrincipal = `1º da fila na Prioridade ${nomeFaixa} — nenhuma solicitação anterior nesta faixa.`;
  } else if (pessoasNaFrenteNaFaixa === 1) {
    mensagemPrincipal = `2º da fila na Prioridade ${nomeFaixa} — 1 solicitação na frente nesta faixa.`;
  } else {
    mensagemPrincipal = `Prioridade ${nomeFaixa}: ${pessoasNaFrenteNaFaixa} solicitações na frente (${posicaoNaFaixa}º da fila nesta faixa).`;
  }

  return {
    prioridade: prio,
    pessoasNaFrenteNaFaixa,
    posicaoNaFaixa,
    pessoasNaFrenteGeral,
    posicaoGeral,
    diretoriaNoTopoCount: ativos.filter((i) => i.diretoriaOverride).length,
    tempoEstimadoHoras: Math.max(1.5, Number((posicaoGeral * 1.5).toFixed(1))),
    mensagemPrincipal,
  };
}

/**
 * Aplica alteração de prioridade normal (Alta, Média, Baixa) solicitada por vendedor/usuário.
 */
export function solicitarPrioridadeFila(listaBps, bpAlvo, novaPrioridade, solicitante = 'Depto. Comercial') {
  const maxOrder = listaBps.reduce(
    (max, item) => Math.max(max, Number(item.solicitadoEmOrder) || 0),
    0
  );
  const agora = new Date();
  const horaStr = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const atualizada = listaBps.map((item) => {
    if (String(item.bp) !== String(bpAlvo)) return item;
    return {
      ...item,
      prioridade: novaPrioridade,
      urgencia: novaPrioridade === 'ALTA' ? 'ALTA' : 'NORMAL',
      diretoriaOverride: false,
      solicitadoEmOrder: maxOrder + 1,
      solicitadoEm: `Hoje às ${horaStr}`,
      solicitadoPor: solicitante || item.vendedor,
    };
  });

  return ordenarFilaBPs(atualizada);
}

/**
 * Aplica o "Fura-Fila da Diretoria" (passa na frente de TODOS os BPs).
 */
export function aplicarFuraFilaDiretoria(
  listaBps,
  bpAlvo,
  { autorizador, motivo, emailComprovante, perfilAtivo }
) {
  const temPermissaoDireta = perfilAtivo === 'DIRETORIA';
  const temComprovanteValido = Boolean(
    emailComprovante && String(emailComprovante).trim().length > 0
  );

  if (!temPermissaoDireta && !temComprovanteValido) {
    throw new Error(
      'Para passar na frente de toda a fila, é obrigatório anexar o e-mail de validação da Diretoria ou aprovar pelo Pipeline da Diretoria.'
    );
  }

  if (!motivo || !String(motivo).trim()) {
    throw new Error('Informe a justificativa ou alinhamento comercial para o Fura-Fila da Diretoria.');
  }

  const maxDirTs = listaBps.reduce(
    (max, item) => Math.max(max, Number(item.diretoriaTimestamp) || 0),
    100
  );

  const atualizada = listaBps.map((item) => {
    if (String(item.bp) !== String(bpAlvo)) return item;
    return {
      ...item,
      prioridade: 'ALTA',
      urgencia: 'ALTA',
      diretoriaOverride: true,
      diretoriaAutorizador: autorizador || 'Diretoria Executiva',
      diretoriaMotivo: String(motivo).trim(),
      diretoriaTimestamp: maxDirTs + 1,
      emailComprovante: emailComprovante || item.emailComprovante || 'Aprovação Direta no Pipeline Diretoria',
    };
  });

  return ordenarFilaBPs(atualizada);
}

/**
 * Classifica o status de monitoramento do histórico do Depto. Manutenção (6ª -> 7ª etapa):
 * - Se tem `laudoFinalConclusao` ou `laudo === 'Concluído'`:
 *   "Laudo Finalizado" (mostra início do Laudo de Fuso e fim do Laudo Final)
 * - Se tem apenas `laudoDifusoInicio` e ainda não tem `laudoFinalConclusao`:
 *   "Depto. Manutenção Iniciado"
 * - Se não tem nenhum dos dois:
 *   "Parado na 6ª Etapa • Aguardando Movimentação p/ Depto. Manutenção (7ª Etapa)"
 */
export function obterStatusMonitoramentoManutencao(item) {
  const temInicio = Boolean(item.laudoDifusoInicio && String(item.laudoDifusoInicio).trim());
  const temFim = Boolean(item.laudoFinalConclusao && String(item.laudoFinalConclusao).trim());
  const laudoConcluido = item.laudo === 'Concluído' || temFim;

  if (laudoConcluido) {
    return {
      codigo: 'FINALIZADO',
      curto: 'Depto. Manutenção Finalizado',
      detalhe: `Início: ${item.laudoDifusoInicio || 'Registrado'} · Final: ${item.laudoFinalConclusao || 'Concluído'}`,
      cor: 'emerald',
    };
  }

  if (temInicio) {
    return {
      codigo: 'INICIADO',
      curto: 'Depto. Manutenção (Laudo Fuso)',
      detalhe: `Iniciou: ${item.laudoDifusoInicio} · Aguardando Laudo Final`,
      cor: 'sky',
    };
  }

  return {
    codigo: 'AGUARDANDO_ETAPA_6',
    curto: 'Aguardando Mov. p/ Depto. Manutenção (6ª→7ª)',
    detalhe: 'Parado na 6ª etapa · Próxima etapa: entrada no Depto. Manutenção',
    cor: 'amber',
  };
}

/**
 * Mescla / transfere os BPs de um vendedor (ex: saiu de férias) para outro vendedor substituto
 * dentro da mesma filial responsável.
 */
export function mesclarVendedorPorFerias(listaBps, filialCodigoOuNome, vendedorOrigem, vendedorDestino) {
  if (!vendedorOrigem || !vendedorDestino || vendedorOrigem === vendedorDestino) {
    throw new Error('Selecione o vendedor titular e um vendedor substituto diferente na mesma filial.');
  }

  return listaBps.map((item) => {
    const mesmaFilial =
      !filialCodigoOuNome ||
      item.filial.includes(filialCodigoOuNome);
    if (mesmaFilial && item.vendedor === vendedorOrigem) {
      return {
        ...item,
        vendedorOriginal: item.vendedorOriginal || item.vendedor,
        vendedor: vendedorDestino,
        coberturaFerias: `${vendedorDestino} (cobrindo ${item.vendedorOriginal || vendedorOrigem})`,
      };
    }
    return item;
  });
}

/**
 * Gera o nome padronizado de pasta e arquivo .ZIP na rede MECTROL.
 */
export function gerarNomePastaPadrao(item) {
  const fuso =
    item.diametro && item.passo
      ? ` - Fuso ${item.diametro}x${item.passo}${item.compTotal ? `x${item.compTotal}` : ''}`
      : ' - Fuso Pendente';
  return `BP ${item.bp} - NF ${item.nf}${fuso}`;
}

/**
 * Agrupa os BPs nas 3 visões visuais principais solicitadas para o Dashboard:
 * 1. Demanda Prioritária do Dia (Diretoria #1 + Prioridade Alta)
 * 2. Próxima Etapa do Fluxo (6ª -> 7ª etapa: Aguardando movimentação ou em bancada no Depto. Manutenção)
 * 3. Laudo Concluído pelo Depto. Manutenção — Liberado para Fila de Croqui (Depto. Projeto)
 */
export function agruparDashboardVisual(listaBps) {
  const ordenados = ordenarFilaBPs(listaBps);
  const ativos = ordenados.filter((item) => item.status !== 'Concluído');
  const concluidos = ordenados.filter((item) => item.status === 'Concluído');

  const paraFazerHoje = ativos.filter(
    (item) => item.diretoriaOverride || item.prioridade === 'ALTA'
  );

  const jaDeuProximaEtapa = ativos.filter(
    (item) => obterStatusMonitoramentoManutencao(item).codigo !== 'FINALIZADO'
  );

  const prontosParaTirarCroqui = ativos.filter(
    (item) => obterStatusMonitoramentoManutencao(item).codigo === 'FINALIZADO'
  );

  return {
    ativos,
    concluidos,
    paraFazerHoje,
    jaDeuProximaEtapa,
    prontosParaTirarCroqui,
    pecasProntasCroqui: prontosParaTirarCroqui.reduce(
      (acc, item) => acc + (Number(item.quantidade) || 1),
      0
    ),
    pecasHoje: paraFazerHoje.reduce(
      (acc, item) => acc + (Number(item.quantidade) || 1),
      0
    ),
    pecasProximaEtapa: jaDeuProximaEtapa.reduce(
      (acc, item) => acc + (Number(item.quantidade) || 1),
      0
    ),
  };
}

/**
 * Classifica cada BP em uma das 6 etapas macro do fluxo industrial (BP Dash 1, 2 e 3):
 * - PRE_BP: Pré-BP / Chegando (Depto. Fiscal -> Depto. Manutenção)
 * - AGUARDANDO_LAUDO: Aguardando Laudo (Depto. Manutenção)
 * - FILA_CROQUI: Fila de Croqui (Depto. Projeto)
 * - FILA_DESENHO_FINAL: Projeto Final Desenho (Depto. Projeto)
 * - EM_MANUTENCAO: Depto. Manutenção (reparo físico no fuso)
 * - CONCLUIDO: Concluídos (todas as etapas finalizadas)
 */
export function obterEtapaMacroBP(item) {
  if (item.etapaMacro && item.etapaMacro === 'CONCLUIDO') {
    return 'CONCLUIDO';
  }
  if (item.etapaMacro && [
    'PRE_BP',
    'AGUARDANDO_LAUDO',
    'FILA_CROQUI',
    'FILA_DESENHO_FINAL',
    'EM_MANUTENCAO',
    'CONCLUIDO',
  ].includes(item.etapaMacro)) {
    return item.etapaMacro;
  }

  const categoria = String(item.categoriaSolicitacao || '').trim().toUpperCase();
  const atividade = String(item.atividade || '').trim().toUpperCase();
  const status = String(item.status || '').trim().toLowerCase();
  const responsavel = String(item.responsavel || '').trim().toUpperCase();
  const nf = String(item.nf || '').trim();
  const chegada = String(item.chegada || '').trim();

  if (categoria === 'CONCLUIDAS') return 'CONCLUIDO';
  if (status === 'concluído' && !['PENDENCIAS', 'EM_ANDAMENTO'].includes(categoria)) {
    if (atividade.includes('CROQUI') || atividade.includes('DESENHO')) {
      return 'FILA_DESENHO_FINAL';
    }
  }

  if (!nf && !chegada) return 'PRE_BP';

  if (atividade.includes('CROQUI') || atividade.includes('DESENHO')) {
    if (status === 'concluído' || categoria === 'ATIVIDADES_EXECUTADAS') {
      return 'FILA_DESENHO_FINAL';
    }
    return 'FILA_CROQUI';
  }

  if (atividade.includes('MANUT') || atividade.includes('LAUDO') ||
      responsavel.includes('MANUTEN')) {
    if (item.laudoFinalConclusao || item.laudo === 'Concluído') {
      return 'FILA_CROQUI';
    }
    if (status === 'concluído') return 'EM_MANUTENCAO';
    return 'AGUARDANDO_LAUDO';
  }

  const hist = obterStatusMonitoramentoManutencao(item);
  if (hist.codigo !== 'FINALIZADO') {
    return 'AGUARDANDO_LAUDO';
  }
  const temCroqui = Boolean(item.diametro && item.passo && item.compTotal);
  return temCroqui ? 'FILA_DESENHO_FINAL' : 'FILA_CROQUI';
}

/**
 * Calcula o resumo completo das 6 etapas (BPs + Fusos), gargalos, realizado vs. para fazer,
 * e o acompanhamento por Filial (Depto. Comercial).
 */
export function obterEquipeFilial(filialStr, filiaisDb = FILIAIS_DB_INICIAL) {
  const texto = String(filialStr || '');
  const normalizar = (valor) =>
    String(valor || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  const textoNormalizado = normalizar(texto);
  const encontradaPorNome = filiaisDb.find((filial) => {
    const nome = normalizar(
      filial.nome.replace(/^\d{2}\.\d{2}\s*[-–]\s*/, '').replace(/\s*\([^)]*\)/g, '')
    );
    const cidade = normalizar(filial.cidade).split(/[\/,]/)[0].trim();
    return [nome, cidade, normalizar(filial.curto)]
      .filter((termo) => termo.length >= 4)
      .some((termo) => textoNormalizado.includes(termo));
  });
  const encontradaPorCodigo =
    !textoNormalizado.includes('comercial') &&
    filiaisDb.find((filial) => texto.includes(filial.codigo));
  const encontrada = encontradaPorNome || encontradaPorCodigo || {
    codigo: texto.match(/\b\d{2}\.\d{2}\b/)?.[0] || '',
    nome: texto || 'Filial não identificada',
    curto: 'Não identificada',
    coordenador: 'Não informado',
    assistente: 'Não informado',
    vendedores: [],
  };
  return {
    codigo: encontrada.codigo,
    nome: encontrada.nome,
    curto: encontrada.curto,
    coordenador: encontrada.coordenador || 'Coordenador Regional',
    assistente: encontrada.assistente || 'Assistente Comercial',
    vendedores: encontrada.vendedores || [],
  };
}

export function calcularResumoSeisEtapas(listaBps, filiaisDb = FILIAIS_DB_INICIAL) {
  const etapas = {
    PRE_BP: { bps: 0, fusos: 0, itens: [] },
    AGUARDANDO_LAUDO: { bps: 0, fusos: 0, itens: [] },
    FILA_CROQUI: { bps: 0, fusos: 0, itens: [] },
    FILA_DESENHO_FINAL: { bps: 0, fusos: 0, itens: [] },
    EM_MANUTENCAO: { bps: 0, fusos: 0, itens: [] },
    CONCLUIDO: { bps: 0, fusos: 0, itens: [] },
  };

  const mapaFiliais = {};
  for (const fil of filiaisDb) {
    mapaFiliais[fil.codigo] = {
      codigo: fil.codigo,
      nome: fil.nome,
      curto: fil.curto,
      cidade: fil.cidade,
      coordenador: fil.coordenador,
      assistente: fil.assistente,
      vendedores: fil.vendedores,
      totalBps: 0,
      totalFusos: 0,
      PRE_BP: 0,
      AGUARDANDO_LAUDO: 0,
      FILA_CROQUI: 0,
      FILA_DESENHO_FINAL: 0,
      EM_MANUTENCAO: 0,
      CONCLUIDO: 0,
    };
  }

  let totalBps = 0;
  let totalFusos = 0;

  for (const item of listaBps) {
    const etapa = obterEtapaMacroBP(item);
    const qtd = Number(item.quantidade) || 1;
    totalBps += 1;
    totalFusos += qtd;

    if (etapas[etapa]) {
      etapas[etapa].bps += 1;
      etapas[etapa].fusos += qtd;
      etapas[etapa].itens.push(item);
    }

    const eq = obterEquipeFilial(item.filial, filiaisDb);
    const codFilial = eq.codigo;

    if (mapaFiliais[codFilial]) {
      mapaFiliais[codFilial].totalBps += 1;
      mapaFiliais[codFilial].totalFusos += qtd;
      mapaFiliais[codFilial][etapa] = (mapaFiliais[codFilial][etapa] || 0) + qtd;
    }
  }

  const concluidosBps = etapas.CONCLUIDO.bps;
  const concluidosFusos = etapas.CONCLUIDO.fusos;
  const paraFazerBps = totalBps - concluidosBps;
  const paraFazerFusos = totalFusos - concluidosFusos;

  const gargalos = listaBps.filter(
    (i) =>
      obterEtapaMacroBP(i) !== 'CONCLUIDO' &&
      (i.gargaloCritico ||
        i.diretoriaOverride ||
        obterEtapaMacroBP(i) === 'AGUARDANDO_LAUDO' ||
        String(i.prazoEnvio || '').includes('Expirando') ||
        String(i.prazoEnvio || '').includes('Imediato'))
  );

  return {
    etapas,
    porFilial: Object.values(mapaFiliais),
    totalBps,
    totalFusos,
    concluidosBps,
    concluidosFusos,
    paraFazerBps,
    paraFazerFusos,
    gargalos,
  };
}

/**
 * Avança ou altera a etapa macro de um BP no fluxo (Ex: Fila de Croqui -> Projeto Final Desenho -> Concluído).
 */
export function avancarEtapaFluxoBP(listaBps, bpAlvo, novaEtapaMacro) {
  return listaBps.map((item) => {
    if (String(item.bp) !== String(bpAlvo)) return item;
    const isConcluido = novaEtapaMacro === 'CONCLUIDO';
    const isLaudoPronto = ['FILA_CROQUI', 'FILA_DESENHO_FINAL', 'EM_MANUTENCAO', 'CONCLUIDO'].includes(novaEtapaMacro);
    return {
      ...item,
      etapaMacro: novaEtapaMacro,
      status: isConcluido ? 'Concluído' : item.status === 'Concluído' ? 'Em Andamento' : item.status,
      laudo: isLaudoPronto ? 'Concluído' : 'Pendente',
      laudoDifusoInicio: isLaudoPronto ? (item.laudoDifusoInicio || '12/11/2026 08:30') : item.laudoDifusoInicio,
      laudoFinalConclusao: isLaudoPronto ? (item.laudoFinalConclusao || '12/11/2026 14:15') : '',
      prazoEnvio: isConcluido ? 'Enviado' : item.prazoEnvio === 'Enviado' ? '2 dias' : item.prazoEnvio,
      responsavelTecnico:
        novaEtapaMacro === 'FILA_CROQUI'
          ? 'Depto. Projeto (Croqui)'
          : novaEtapaMacro === 'FILA_DESENHO_FINAL'
          ? 'Depto. Projeto (Desenho Final)'
          : novaEtapaMacro === 'EM_MANUTENCAO'
          ? 'Depto. Manutenção'
          : novaEtapaMacro === 'CONCLUIDO'
          ? 'Concluído (Depto. Projeto & Depto. Manutenção)'
          : 'Depto. Manutenção (Laudo)',
    };
  });
}


