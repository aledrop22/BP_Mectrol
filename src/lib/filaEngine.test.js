import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ordenarFilaBPs,
  calcularPosicaoNaFila,
  obterStatusMonitoramentoManutencao,
  mesclarVendedorPorFerias,
  agruparDashboardVisual,
  obterEtapaMacroBP,
  calcularResumoSeisEtapas,
  avancarEtapaFluxoBP,
  obterEquipeFilial,
} from './filaEngine.js';
import { DADOS_INICIAIS, FILIAIS_DB_INICIAL } from '../data/dados.js';
import { PALETAS_TEMAS, obterVariaveisTema } from '../data/temas.js';
import {
  filtrarBPsPorPeriodoOuCalendario,
  calcularComparativoDatas,
  gerarPlanilhaExcelXLS,
  gerarRelatorioPDFBinario,
} from './comparativoExportEngine.js';

test('calcularPosicaoNaFila retorna 1º da fila quando não há ninguém na frente na prioridade', () => {
  const filaVazia = [];
  const res = calcularPosicaoNaFila(filaVazia, '99999', 'ALTA');
  assert.equal(res.pessoasNaFrenteNaFaixa, 0);
  assert.equal(res.posicaoNaFaixa, 1);
  assert.ok(res.mensagemPrincipal.includes('1º da fila'));
});

test('calcularPosicaoNaFila reproduz o cenário de prioridade Alta e Baixa', () => {
  const resAlta = calcularPosicaoNaFila(DADOS_INICIAIS, '54680', 'ALTA');
  assert.ok(resAlta.pessoasNaFrenteNaFaixa >= 5);
  assert.ok(resAlta.posicaoNaFaixa >= 6);
  assert.ok(resAlta.mensagemPrincipal.includes('solicitações na frente'));

  const resBaixa = calcularPosicaoNaFila(DADOS_INICIAIS, '54680', 'BAIXA');
  assert.ok(resBaixa.pessoasNaFrenteNaFaixa >= 2);
});

test('monitoramento do histórico da manutenção diferencia 6ª->7ª etapa, laudo difuso iniciado e laudo final concluído', () => {
  const concluido = DADOS_INICIAIS.find((b) => b.bp === '53193');
  const iniciado = DADOS_INICIAIS.find((b) => b.bp === '54680');
  const paradoEtapa6 = DADOS_INICIAIS.find((b) => b.bp === '54538');

  assert.equal(obterStatusMonitoramentoManutencao(concluido).codigo, 'FINALIZADO');
  assert.equal(obterStatusMonitoramentoManutencao(iniciado).codigo, 'INICIADO');
  assert.equal(obterStatusMonitoramentoManutencao(paradoEtapa6).codigo, 'AGUARDANDO_ETAPA_6');
});

test('mesclarVendedorPorFerias transfere BPs do vendedor titular para o substituto dentro da filial', () => {
  const mesclado = mesclarVendedorPorFerias(
    DADOS_INICIAIS,
    '03.04',
    'Vanessa Santos',
    'Rafael Oliveira'
  );
  const bpCampinas = mesclado.find((b) => b.bp === '53193');
  assert.equal(bpCampinas.vendedor, 'Rafael Oliveira');
  assert.equal(bpCampinas.vendedorOriginal, 'Vanessa Santos');
});

test('todos os BPs possuem quantidade, motivo de recebimento e 10 filiais vinculadas com supervisor e assistente', () => {
  for (const item of DADOS_INICIAIS) {
    assert.ok(item.quantidade >= 1);
    assert.ok(item.motivoRecebimento.length > 0);
    const eq = obterEquipeFilial(item.filial, FILIAIS_DB_INICIAL);
    assert.ok(eq.coordenador.length > 0);
    assert.ok(eq.assistente.length > 0);
  }
  assert.equal(FILIAIS_DB_INICIAL.length, 10);
});

test('3 modelos de tema possuem 2 temas dark (Dark 1, Dark 2) e 1 tema white (White 1)', () => {
  assert.equal(PALETAS_TEMAS.length, 3);
  const darkCount = PALETAS_TEMAS.filter((p) => p.modoPadrao === 'dark').length;
  const lightCount = PALETAS_TEMAS.filter((p) => p.modoPadrao === 'light').length;
  assert.equal(darkCount, 2);
  assert.equal(lightCount, 1);
});

test('calcularResumoSeisEtapas contabiliza corretamente as 6 etapas, fusos totais e acompanhamento das 10 filiais', () => {
  const resumo = calcularResumoSeisEtapas(DADOS_INICIAIS, FILIAIS_DB_INICIAL);
  assert.equal(resumo.totalBps, DADOS_INICIAIS.length);
  assert.ok(resumo.totalFusos > resumo.totalBps);
  assert.ok(resumo.etapas.PRE_BP.bps >= 1);
  assert.ok(resumo.etapas.AGUARDANDO_LAUDO.bps >= 1);
  assert.ok(resumo.etapas.FILA_CROQUI.bps >= 1);
  assert.ok(resumo.etapas.FILA_DESENHO_FINAL.bps >= 1);
  assert.ok(resumo.etapas.EM_MANUTENCAO.bps >= 1);
  assert.ok(resumo.etapas.CONCLUIDO.bps >= 1);
  assert.equal(resumo.porFilial.length, 10);

  const atualizado = avancarEtapaFluxoBP(DADOS_INICIAIS, '53193', 'FILA_DESENHO_FINAL');
  const bp53193 = atualizado.find((b) => b.bp === '53193');
  assert.equal(obterEtapaMacroBP(bp53193), 'FILA_DESENHO_FINAL');
});

test('filtrarBPsPorPeriodoOuCalendario e calcularComparativoDatas funcionam desde 01/01/2026 e geram Excel/PDF válidos', () => {
  const porCalendarioAno = filtrarBPsPorPeriodoOuCalendario(DADOS_INICIAIS, {
    filtroPeriodo: 'CALENDARIO',
    dataInicio: '2026-01-01',
    dataFim: '2026-11-18',
    incluirHistorico2026: true,
  });
  assert.ok(porCalendarioAno.length > DADOS_INICIAIS.length);

  const compMes = calcularComparativoDatas(DADOS_INICIAIS, FILIAIS_DB_INICIAL, {
    modoComparativo: 'MES_A_MES',
    mesA: '2026-01',
    mesB: '2026-11',
  });
  assert.ok(compMes.pontoA.totalBps >= 1);
  assert.ok(compMes.pontoB.totalBps >= 1);
  assert.equal(compMes.serieMensal2026.length, 11);

  const resumo = calcularResumoSeisEtapas(porCalendarioAno, FILIAIS_DB_INICIAL);
  const xls = gerarPlanilhaExcelXLS({
    bps: porCalendarioAno,
    resumoFluxo: resumo,
    comparativo: compMes,
    periodoLabel: 'Calendário: 01/01/2026 a 18/11/2026',
    observacoesAnalise: 'Análise consolidada 2026',
    filiaisDb: FILIAIS_DB_INICIAL,
  });
  assert.ok(xls.includes('MECTROL BP'));
  assert.ok(xls.includes('Análise consolidada 2026'));

  const pdfBytes = gerarRelatorioPDFBinario({
    bps: porCalendarioAno,
    resumoFluxo: resumo,
    comparativo: compMes,
    periodoLabel: 'Calendário: 01/01/2026 a 18/11/2026',
    observacoesAnalise: 'Análise consolidada 2026',
    filiaisDb: FILIAIS_DB_INICIAL,
  });
  assert.ok(pdfBytes instanceof Uint8Array);
  assert.ok(pdfBytes.length > 500);
});


