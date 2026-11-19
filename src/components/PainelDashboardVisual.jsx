import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Copy,
  Check,
  ArrowRight,
  Search,
  BarChart3,
  ShieldAlert,
  Sparkles,
  Calendar,
  ArrowLeftRight,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import {
  ETAPAS_FLUXO_CONFIG,
  MOTIVOS_RECEBIMENTO,
  DIAMETROS,
  PASSOS,
} from '../data/dados';
import {
  obterEtapaMacroBP,
  gerarNomePastaPadrao,
  obterEquipeFilial,
} from '../lib/filaEngine';
import {
  calcularComparativoDatas,
  gerarPlanilhaExcelXLS,
  gerarRelatorioPDFBinario,
  dispararDownloadArquivo,
  formatarDataBR,
} from '../lib/comparativoExportEngine';
import PainelFilaPrioridade from './PainelFilaPrioridade';
import PainelFiliaisVendedores from './PainelFiliaisVendedores';
import PipelineDiretoriaRapido from './PipelineDiretoriaRapido';
import PainelCalendarioExportacao from './PainelCalendarioExportacao';

// Mini Sparkline SVG estilo BP Dash 1 e BP Dash 3
function SparklineSVG({ points = [4, 6, 5, 8, 7, 10], color = '#38BDF8' }) {
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const range = Math.max(1, max - min);
  const coords = points
    .map((val, idx) => {
      const x = (idx / Math.max(1, points.length - 1)) * 100;
      const y = 26 - ((val - min) / range) * 20;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 100 30" className="w-full h-7 overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={coords}
      />
    </svg>
  );
}

export default function PainelDashboardVisual({
  modeloAtivo,
  onMudarModelo,
  paletaId,
  modoCor,
  bpsFiltrados,
  todosBps,
  resumoFluxo,
  filiaisDb,
  mapaPosicoes,
  bpSelecionado,
  bpSelecionadoId,
  onSelecionarBp,
  filtroPeriodo,
  onMudarPeriodo,
  dataInicio = '2026-01-01',
  dataFim = '2026-11-18',
  onMudarDataInicio = () => {},
  onMudarDataFim = () => {},
  filtroFilial,
  onMudarFilial,
  filtroEtapa,
  onMudarEtapa,
  filtroMotivo,
  onMudarMotivo,
  busca,
  onMudarBusca,
  copiadoId,
  onCopiarPasta,
  onAtualizarCampo,
  onMudarEtapaBP,
  onConfirmarPrioridade,
  onAbrirModalFuraFila,
  onConfirmarFuraFila,
  onMesclarFerias,
  onAdicionarVendedorFilial,
  onAtualizarEquipeFilial,
  onNotificar = () => {},
}) {
  // Opção no Modelo 3 (BP Dash 3) para alternar entre Colunas Verticais e Barras Horizontais
  const [orientacaoGraficoFilial, setOrientacaoGraficoFilial] = useState('COLUNAS'); // 'COLUNAS' | 'BARRAS'
  // Opção para simular o volume de 189 BPs / 50 realizados mencionado pelo usuário ou usar a base atual
  const [escalaHistorica189, setEscalaHistorica189] = useState(false);

  // Estados do Comparativo de Datas (Mês a Mês, Semana a Semana ou 2 Pontos no Calendário) e Exportação PDF/Excel
  const [mostrarComparativo, setMostrarComparativo] = useState(false);
  const [modoComparativo, setModoComparativo] = useState('MES_A_MES'); // 'MES_A_MES' | 'SEMANA_A_SEMANA' | 'INTERVALO_LIVRE'
  const [mesA, setMesA] = useState('2026-10');
  const [mesB, setMesB] = useState('2026-11');
  const [semanaA, setSemanaA] = useState('SEM-45');
  const [semanaB, setSemanaB] = useState('SEM-46');
  const [inicioA, setInicioA] = useState('2026-01-01');
  const [fimA, setFimA] = useState('2026-06-30');
  const [inicioB, setInicioB] = useState('2026-07-01');
  const [fimB, setFimB] = useState('2026-11-18');
  const [modalRelatorioAberto, setModalRelatorioAberto] = useState(false);
  const [observacoesAnalise, setObservacoesAnalise] = useState('');

  const comparativo = useMemo(
    () =>
      calcularComparativoDatas(todosBps, filiaisDb, {
        modoComparativo,
        mesA,
        mesB,
        semanaA,
        semanaB,
        inicioA,
        fimA,
        inicioB,
        fimB,
      }),
    [todosBps, filiaisDb, modoComparativo, mesA, mesB, semanaA, semanaB, inicioA, fimA, inicioB, fimB]
  );

  const periodoDescricao = useMemo(() => {
    if (filtroPeriodo === 'CALENDARIO') {
      return `Calendário: ${formatarDataBR(dataInicio)} a ${formatarDataBR(dataFim)}`;
    }
    if (filtroPeriodo === 'TODOS') return 'Todo o Histórico (2026)';
    return `Últimos ${filtroPeriodo} Dias`;
  }, [filtroPeriodo, dataInicio, dataFim]);

  const handleExportarExcel = () => {
    const htmlXls = gerarPlanilhaExcelXLS({
      bps: bpsFiltrados,
      resumoFluxo,
      comparativo,
      periodoLabel: periodoDescricao,
      observacoesAnalise,
      filiaisDb,
    });
    dispararDownloadArquivo(
      htmlXls,
      `MECTROL_BP_Relatorio_${filtroPeriodo === 'CALENDARIO' ? `${dataInicio}_${dataFim}` : `${filtroPeriodo}d`}.xls`,
      'application/vnd.ms-excel;charset=utf-8'
    );
    onNotificar(
      'Planilha Excel (.XLS) Exportada com Sucesso',
      `Arquivo formatado com ${bpsFiltrados.length} BPs, resumo por etapa, 10 filiais e comparativo.`
    );
  };

  const handleExportarPDF = () => {
    const bytesPdf = gerarRelatorioPDFBinario({
      bps: bpsFiltrados,
      resumoFluxo,
      comparativo,
      periodoLabel: periodoDescricao,
      observacoesAnalise,
      filiaisDb,
    });
    dispararDownloadArquivo(
      bytesPdf,
      `MECTROL_BP_Dashboard_${filtroPeriodo === 'CALENDARIO' ? `${dataInicio}_${dataFim}` : `${filtroPeriodo}d`}.pdf`,
      'application/pdf'
    );
    onNotificar(
      'Dashboard em PDF (.PDF) Exportado com Sucesso',
      `Relatório executivo gerado com KPIs, comparativo, departamentos e ${bpsFiltrados.length} BPs.`
    );
  };

  const fatorEscala = escalaHistorica189
    ? Math.max(1, Number((189 / Math.max(1, resumoFluxo.totalBps)).toFixed(1)))
    : 1;

  const totalBpsExibido = escalaHistorica189
    ? 189
    : resumoFluxo.totalBps;
  const concluidosBpsExibido = escalaHistorica189
    ? 50
    : resumoFluxo.concluidosBps;
  const paraFazerBpsExibido = Math.max(0, totalBpsExibido - concluidosBpsExibido);
  const totalFusosExibido = Math.round(resumoFluxo.totalFusos * fatorEscala);

  const isNeutroDark = paletaId === 'dark-neutro' && modoCor === 'dark';

  // BPs com Emergência Autorizada pela Diretoria / Supervisores (Passar na frente de todos)
  const bpsEmergenciaDiretoria = todosBps.filter(
    (b) => b.diretoriaOverride && obterEtapaMacroBP(b) !== 'CONCLUIDO'
  );

  // Renderizador da Faixa Superior de 6 Cards (Adaptado aos 3 Modelos de Tema: Dark 1, Dark 2 e White 1)
  const renderTopoSeisCards = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
      {ETAPAS_FLUXO_CONFIG.map((et) => {
        const dadosEtapa = resumoFluxo.etapas[et.id] || { bps: 0, fusos: 0 };
        const bpsCount = Math.round(dadosEtapa.bps * fatorEscala);
        const fusosCount = Math.round(dadosEtapa.fusos * fatorEscala);
        const ativo = filtroEtapa === et.id;

        const headerBg = isNeutroDark
          ? 'rgba(148, 163, 184, 0.08)'
          : et.badgeBg;

        const corDestaque = isNeutroDark ? '#E4E4E7' : et.corHex;
        const corSpark = isNeutroDark ? '#94A3B8' : et.corHex;
        const cardBorder = ativo ? et.corHex : 'var(--border-subtle)';

        return (
          <button
            key={et.id}
            type="button"
            onClick={() => onMudarEtapa(ativo ? 'TODAS' : et.id)}
            className="text-left rounded-xl border overflow-hidden transition hover:opacity-95 flex flex-col justify-between"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: cardBorder,
            }}
          >
            {/* Topo colorido ou neutro conforme o tema selecionado */}
            <div
              className="px-2.5 py-1.5 flex items-center justify-between gap-1 border-b"
              style={{
                backgroundColor: headerBg,
                borderColor: 'var(--border-subtle)',
              }}
            >
              <span
                className="text-xs font-extrabold whitespace-nowrap"
                style={{ color: corDestaque }}
              >
                {et.titulo}
              </span>
            </div>

            {/* Número central grande + Subtítulo + Sparkline */}
            <div className="p-2.5 space-y-1">
              <div className="flex items-baseline justify-between gap-1.5">
                <div className="flex items-baseline gap-1">
                  <span
                    className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums leading-none"
                    style={{ color: corDestaque }}
                  >
                    {bpsCount}
                  </span>
                  <span
                    className="text-[11px] font-mono tabular-nums"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    BPs
                  </span>
                </div>
                <span
                  className="text-[11px] font-mono font-bold tabular-nums px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {fusosCount} fusos
                </span>
              </div>
              <p
                className="text-[11px] truncate"
                style={{ color: 'var(--text-muted)' }}
              >
                {et.subtitulo}
              </p>
              <SparklineSVG points={et.sparkline} color={corSpark} />
            </div>
          </button>
        );
      })}
    </div>
  );

  // Renderizador do Acompanhamento das 10 Filiais + Card de Emergência na Direita
  const renderFiliaisEInspetorNoDash = () => {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
        {/* Acompanhamento em Tempo Real das 10 Filiais (8 colunas) */}
        <section
          aria-label="Acompanhamento de Fluxo das 10 Filiais em Tempo Real"
          className="xl:col-span-8 rounded-xl border p-3 space-y-2.5"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2
                className="text-xs font-extrabold uppercase tracking-wider"
                style={{ color: 'var(--text-primary)' }}
              >
                Acompanhamento das 10 Filiais • Depto. Comercial (Bauru • SP • SJC/Vale • Campinas • BH • Joinville • Manaus + 3)
              </h2>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                Cada filial vincula automaticamente Supervisor/Coordenador e Assistente do Depto. Comercial
              </p>
            </div>
            <div className="flex items-center gap-2">
              {filtroFilial !== 'Todas' && (
                <button
                  type="button"
                  onClick={() => onMudarFilial('Todas')}
                  className="text-xs font-bold underline"
                  style={{ color: 'var(--accent-text)' }}
                >
                  Mostrar todas as 10 filiais
                </button>
              )}
              <button
                type="button"
                onClick={() => onMudarModelo('AUTORAL_3')}
                className="text-[11px] font-bold px-2 py-0.5 rounded border"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-strong)',
                  color: 'var(--accent-text)',
                }}
              >
                Depto. Comercial • Equipes das 10 Filiais
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {resumoFluxo.porFilial.map((fil) => {
              const selecionada = filtroFilial === fil.codigo;
              const totalF = Math.max(1, fil.totalFusos);
              return (
                <button
                  key={fil.codigo}
                  type="button"
                  onClick={() => onMudarFilial(selecionada ? 'Todas' : fil.codigo)}
                  className="text-left rounded-lg border p-2 transition space-y-1.5"
                  style={{
                    backgroundColor: selecionada
                      ? 'var(--bg-elevated)'
                      : 'var(--bg-subtle)',
                    borderColor: selecionada
                      ? 'var(--accent-primary)'
                      : 'var(--border-subtle)',
                  }}
                >
                  <div className="flex items-center justify-between text-[11px] gap-1">
                    <span
                      className="font-extrabold truncate"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {fil.codigo} · {fil.curto}
                    </span>
                    <span
                      className="font-mono font-bold tabular-nums shrink-0 text-[10px]"
                      style={{ color: 'var(--accent-text)' }}
                    >
                      {fil.totalBps}BP/{fil.totalFusos}f
                    </span>
                  </div>

                  {/* Nome pequenininho do Supervisor e Assistente da filial */}
                  <div
                    className="text-[9px] leading-tight truncate"
                    style={{ color: 'var(--text-muted)' }}
                    title={`Supervisor: ${fil.coordenador} | Assistente: ${fil.assistente}`}
                  >
                    Sup: <strong style={{ color: 'var(--text-secondary)' }}>{fil.coordenador}</strong> · As: {fil.assistente}
                  </div>

                  <div
                    className="w-full h-1.5 rounded-full overflow-hidden flex"
                    style={{ backgroundColor: 'var(--bg-canvas)' }}
                  >
                    <div
                      style={{
                        width: `${(fil.AGUARDANDO_LAUDO / totalF) * 100}%`,
                        backgroundColor: '#EF4444',
                      }}
                    />
                    <div
                      style={{
                        width: `${(fil.FILA_CROQUI / totalF) * 100}%`,
                        backgroundColor: '#F97316',
                      }}
                    />
                    <div
                      style={{
                        width: `${(fil.FILA_DESENHO_FINAL / totalF) * 100}%`,
                        backgroundColor: '#38BDF8',
                      }}
                    />
                    <div
                      style={{
                        width: `${(fil.EM_MANUTENCAO / totalF) * 100}%`,
                        backgroundColor: '#EAB308',
                      }}
                    />
                    <div
                      style={{
                        width: `${(fil.CONCLUIDO / totalF) * 100}%`,
                        backgroundColor: '#22C55E',
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Card da Direita (4 colunas): Emergência Autorizada (Diretoria / Supervisor) */}
        <section
          aria-label="Emergência Autorizada pela Diretoria e Supervisores"
          className="xl:col-span-4 rounded-xl border p-3.5 flex flex-col justify-between gap-2.5"
          style={{
            backgroundColor: 'rgba(220, 38, 38, 0.12)',
            borderColor: '#EF4444',
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 min-w-0">
              <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="text-xs font-extrabold uppercase tracking-wider text-red-400 block leading-tight">
                  Emergência Autorizada (Diretoria / Supervisor)
                </span>
                <span className="text-[10px] font-mono inline-block mt-1 px-2 py-0.5 rounded bg-red-600 text-white font-bold">
                  Passar na Frente (#1 da Fila) • Aviso p/ Depto. Manutenção & Depto. Projeto
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 my-auto">
            {bpsEmergenciaDiretoria.length > 0 ? (
              bpsEmergenciaDiretoria.map((em) => {
                const eq = obterEquipeFilial(em.filial, filiaisDb);
                return (
                  <div
                    key={em.bp}
                    onClick={() => onSelecionarBp(em.bp)}
                    className="rounded-lg border p-2.5 space-y-1 cursor-pointer transition hover:opacity-95"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'rgba(239, 68, 68, 0.45)',
                    }}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs font-mono">
                      <strong className="truncate" style={{ color: 'var(--text-primary)' }}>
                        BP #{em.bp} ({em.cliente})
                      </strong>
                      <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-red-600 text-white shrink-0">
                        {em.quantidade} fusos · #1 Fila
                      </span>
                    </div>
                    <p className="text-[11px] font-mono truncate" style={{ color: 'var(--text-secondary)' }}>
                      {em.filial} · Vend: {em.vendedor} · Sup: {eq.coordenador}
                    </p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {em.justificativaDiretoria || 'Prioridade máxima autorizada pela Diretoria/Supervisor'}
                    </p>
                  </div>
                );
              })
            ) : (
              <div
                className="rounded-lg border p-2.5 text-xs"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-secondary)',
                }}
              >
                Nenhuma emergência ativa no momento. Utilize o botão abaixo para autorizar fura-fila (#1).
              </div>
            )}
          </div>

          <div className="pt-1 flex items-center justify-between gap-2">
            <span className="text-[10px] font-mono" style={{ color: 'var(--text-secondary)' }}>
              Total em Emergência: <strong className="text-red-400">{bpsEmergenciaDiretoria.length} BP(s)</strong>
            </span>
            <button
              type="button"
              onClick={() => onAbrirModalFuraFila(bpSelecionado || todosBps[0])}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-500 transition whitespace-nowrap shrink-0"
            >
              + Autorizar Outra Emergência
            </button>
          </div>
        </section>
      </div>
    );
  };

  // Renderizador do Selo de Status colorido na Tabela
  const renderStatusHighlight = (etapaId) => {
    const cfg =
      ETAPAS_FLUXO_CONFIG.find((e) => e.id === etapaId) ||
      ETAPAS_FLUXO_CONFIG[1];
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-extrabold whitespace-nowrap"
        style={{
          backgroundColor: cfg.badgeBg,
          color: cfg.corHex,
          border: `1px solid ${cfg.corHex}`,
        }}
      >
        <span>{cfg.titulo}</span>
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Barra Superior Limpa de Filtros Globais e Resumo do Período */}
      <section
        aria-label="Filtros Globais e Resumo do Período"
        className="rounded-xl border p-3 space-y-2.5"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Botões de Período (30d / 60d / 90d / Tudo) + Calendário (ex: 01/01/2026) + Comparativo (Mês / Semana) */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: '30', label: 'Últimos 30 Dias' },
              { id: '60', label: '60 Dias' },
              { id: '90', label: '90 Dias' },
              { id: 'TODOS', label: 'Todo o Histórico' },
            ].map((per) => (
              <button
                key={per.id}
                type="button"
                onClick={() => onMudarPeriodo(per.id)}
                className="px-2.5 py-1 rounded-md text-xs font-bold border transition whitespace-nowrap"
                style={{
                  backgroundColor:
                    filtroPeriodo === per.id ? 'var(--accent-primary)' : 'var(--bg-subtle)',
                  borderColor:
                    filtroPeriodo === per.id
                      ? 'var(--accent-primary)'
                      : 'var(--border-subtle)',
                  color:
                    filtroPeriodo === per.id
                      ? '#FFFFFF'
                      : 'var(--text-secondary)',
                }}
              >
                {per.label}
              </button>
            ))}

            {/* Botão Calendário de Datas (ex: ver desde 01/01/2026) */}
            <button
              type="button"
              onClick={() => onMudarPeriodo(filtroPeriodo === 'CALENDARIO' ? '30' : 'CALENDARIO')}
              className="px-2.5 py-1 rounded-md text-xs font-bold border transition whitespace-nowrap inline-flex items-center gap-1.5"
              style={{
                backgroundColor:
                  filtroPeriodo === 'CALENDARIO' ? 'var(--accent-primary)' : 'var(--bg-subtle)',
                borderColor:
                  filtroPeriodo === 'CALENDARIO'
                    ? 'var(--accent-primary)'
                    : 'var(--border-strong)',
                color:
                  filtroPeriodo === 'CALENDARIO'
                    ? '#FFFFFF'
                    : 'var(--text-primary)',
              }}
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>Calendário (Datas)</span>
            </button>

            {/* Botão Comparativo de Datas (Mês a Mês / Semana a Semana / 2 Pontos) */}
            <button
              type="button"
              onClick={() => setMostrarComparativo((prev) => !prev)}
              className="px-2.5 py-1 rounded-md text-xs font-bold border transition whitespace-nowrap inline-flex items-center gap-1.5"
              style={{
                backgroundColor: mostrarComparativo
                  ? 'var(--accent-primary)'
                  : 'var(--bg-subtle)',
                borderColor: mostrarComparativo
                  ? 'var(--accent-primary)'
                  : 'var(--border-strong)',
                color: mostrarComparativo ? '#FFFFFF' : 'var(--accent-text)',
              }}
            >
              <ArrowLeftRight className="w-3.5 h-3.5 shrink-0" />
              <span>Comparativo (Mês / Semana)</span>
            </button>
          </div>

          {/* Resumo Global Soma de BPs (Total vs Realizados vs Para Fazer) + Exportação Excel & PDF */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono tabular-nums">
            <span>
              Total ({filtroPeriodo === 'CALENDARIO' ? `${formatarDataBR(dataInicio)}–${formatarDataBR(dataFim)}` : filtroPeriodo === 'TODOS' ? 'Histórico' : `${filtroPeriodo}d`}):{' '}
              <strong style={{ color: 'var(--text-primary)' }}>
                {totalBpsExibido} BPs ({totalFusosExibido} fusos)
              </strong>
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-500 font-bold">
              Realizados: {concluidosBpsExibido} BPs
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-500 font-bold">
              Para Fazer: {paraFazerBpsExibido} BPs
            </span>
            <button
              type="button"
              onClick={() => setEscalaHistorica189((prev) => !prev)}
              className="px-2 py-0.5 rounded border text-[11px] font-sans font-semibold transition"
              style={{
                backgroundColor: escalaHistorica189
                  ? 'var(--accent-primary)'
                  : 'var(--bg-subtle)',
                borderColor: 'var(--border-strong)',
                color: escalaHistorica189 ? '#FFFFFF' : 'var(--text-secondary)',
              }}
            >
              {escalaHistorica189
                ? 'Simulando Lote 189 BPs (50 OK)'
                : 'Simular Lote 189 BPs (50 OK)'}
            </button>

            {/* Botões de Exportação Formatada: Excel (.XLS) e Dashboard PDF (.PDF) */}
            <button
              type="button"
              onClick={handleExportarExcel}
              className="px-2.5 py-1 rounded-md text-[11px] font-sans font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 transition inline-flex items-center gap-1 whitespace-nowrap"
              title="Baixar planilha formatada para leitura em Excel (.xls)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
              <span>Exportar Excel</span>
            </button>

            <button
              type="button"
              onClick={() => setModalRelatorioAberto(true)}
              className="px-2.5 py-1 rounded-md text-[11px] font-sans font-extrabold text-white bg-sky-600 hover:bg-sky-500 transition inline-flex items-center gap-1 whitespace-nowrap"
              title="Abrir Dashboard em PDF para adicionar observações e baixar em PDF ou Excel"
            >
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>Dashboard PDF</span>
            </button>
          </div>
        </div>

        {/* Filtros de Filial (10 Filiais), Etapa, Tipo de Recebimento e Busca */}
        <div
          className="pt-2 border-t flex flex-wrap items-center justify-between gap-2"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Filtrar por Filial"
              value={filtroFilial}
              onChange={(e) => onMudarFilial(e.target.value)}
              className="rounded-lg px-2.5 py-1 text-xs font-semibold border"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-strong)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="Todas">Filial: Todas as 10 Filiais</option>
              {filiaisDb.map((f) => (
                <option key={f.codigo} value={f.codigo}>
                  {f.nome} (Sup: {f.coordenador})
                </option>
              ))}
            </select>

            <select
              aria-label="Filtrar por Etapa do Fluxo"
              value={filtroEtapa}
              onChange={(e) => onMudarEtapa(e.target.value)}
              className="rounded-lg px-2.5 py-1 text-xs font-semibold border"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-strong)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="TODAS">Etapa: Todas ({resumoFluxo.totalBps} BPs)</option>
              {ETAPAS_FLUXO_CONFIG.map((et) => (
                <option key={et.id} value={et.id}>
                  {et.titulo} ({resumoFluxo.etapas[et.id]?.bps || 0} BPs)
                </option>
              ))}
            </select>

            <select
              aria-label="Filtrar por Tipo de Recebimento (Depto. Manutenção vs Depto. Projeto)"
              value={filtroMotivo}
              onChange={(e) => onMudarMotivo(e.target.value)}
              className="rounded-lg px-2.5 py-1 text-xs font-semibold border"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-strong)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="Todos">Tipo: Todos (Depto. Manutenção + Depto. Projeto)</option>
              {MOTIVOS_RECEBIMENTO.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Search
              className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              aria-label="Buscar BP, Cliente, NF ou Vendedor"
              placeholder="Buscar BP, Cliente, NF..."
              value={busca}
              onChange={(e) => onMudarBusca(e.target.value)}
              className="rounded-lg pl-8 pr-2.5 py-1 text-xs border w-48 sm:w-60"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-strong)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>
      </section>

      {/* Painel Expansível de Calendário de Datas, Comparativo Mês/Semana/Datas e Modal de Exportação PDF/Excel */}
      <PainelCalendarioExportacao
        filtroPeriodo={filtroPeriodo}
        onMudarPeriodo={onMudarPeriodo}
        dataInicio={dataInicio}
        dataFim={dataFim}
        onMudarDataInicio={onMudarDataInicio}
        onMudarDataFim={onMudarDataFim}
        mostrarComparativo={mostrarComparativo}
        onAlternarComparativo={() => setMostrarComparativo((prev) => !prev)}
        modoComparativo={modoComparativo}
        onMudarModoComparativo={setModoComparativo}
        mesA={mesA}
        mesB={mesB}
        onMudarMesA={setMesA}
        onMudarMesB={setMesB}
        semanaA={semanaA}
        semanaB={semanaB}
        onMudarSemanaA={setSemanaA}
        onMudarSemanaB={setSemanaB}
        inicioA={inicioA}
        fimA={fimA}
        inicioB={inicioB}
        fimB={fimB}
        onMudarInicioA={setInicioA}
        onMudarFimA={setFimA}
        onMudarInicioB={setInicioB}
        onMudarFimB={setFimB}
        comparativo={comparativo}
        modalRelatorioAberto={modalRelatorioAberto}
        onFecharModalRelatorio={() => setModalRelatorioAberto(false)}
        observacoesAnalise={observacoesAnalise}
        onMudarObservacoesAnalise={setObservacoesAnalise}
        onExportarExcel={handleExportarExcel}
        onExportarPDF={handleExportarPDF}
        resumoFluxo={resumoFluxo}
        bpsFiltrados={bpsFiltrados}
        periodoDescricao={periodoDescricao}
      />

      {/* =====================================================================
          VISÃO 1 (DASH_1): GESTÃO À VISTA, 6 ETAPAS, 10 FILIAIS & EMERGÊNCIAS
         ===================================================================== */}
      {modeloAtivo === 'DASH_1' && (
        <div className="space-y-4" aria-label="Modelo 1: Gestão à Vista baseado no BP Dash 1">
          {/* Parte Superior: 6 Cards de Etapa com Sparklines */}
          {renderTopoSeisCards()}

          {/* Acompanhamento das 10 Filiais + Inspetor Dimensional Rápido */}
          {renderFiliaisEInspetorNoDash()}

          {/* Gargalos Críticos / Prazo de Envio Crítico na Tela Inicial */}
          <section
            aria-label="Alertas de Gargalos Críticos"
            className="rounded-xl border p-3.5 space-y-3"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>
                Alerta de Gargalos / Prazo de Envio Crítico (Depto. Manutenção → Depto. Projeto)
              </h2>
              <span className="text-xs font-mono tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                Prioridades críticas em andamento
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {resumoFluxo.gargalos.slice(0, 3).map((item) => {
                const isLaudoPendente = obterEtapaMacroBP(item) === 'AGUARDANDO_LAUDO';
                const eq = obterEquipeFilial(item.filial, filiaisDb);
                return (
                  <button
                    key={item.bp}
                    type="button"
                    onClick={() => onSelecionarBp(item.bp)}
                    className="text-left rounded-xl border p-3 transition hover:opacity-95 space-y-1"
                    style={{
                      backgroundColor: isLaudoPendente
                        ? 'rgba(239, 68, 68, 0.12)'
                        : 'rgba(234, 179, 8, 0.12)',
                      borderColor: isLaudoPendente ? '#EF4444' : '#EAB308',
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="text-xs font-extrabold font-mono tabular-nums flex items-center gap-1.5"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        <AlertTriangle
                          className="w-4 h-4 shrink-0"
                          style={{ color: isLaudoPendente ? '#EF4444' : '#EAB308' }}
                        />
                        <span>
                          BP {item.bp} — {item.cliente}
                        </span>
                      </span>
                      <span
                        className="text-[11px] font-bold px-2 py-0.5 rounded text-white"
                        style={{
                          backgroundColor: isLaudoPendente ? '#DC2626' : '#D97706',
                        }}
                      >
                        {isLaudoPendente ? 'Aguardando Laudo' : 'Urgente'}
                      </span>
                    </div>
                    <p className="text-xs font-mono tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                      {item.filial} · {item.quantidade} fusos · Prazo Envio:{' '}
                      <strong className="text-red-400">{item.prazoEnvio}</strong>
                    </p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      Vend: {item.vendedor} · Sup: {eq.coordenador} · Assist: {eq.assistente}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Tabela Inferior do BP Dash 1: Tabela de Status em Tempo Real com Supervisor e Assistente automáticos */}
          <section
            aria-label="Tabela de Status em Tempo Real"
            className="rounded-xl border overflow-x-auto"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div
              className="px-4 py-3 border-b flex items-center justify-between gap-2"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <div>
                <h2 className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>
                  Tabela Operacional em Tempo Real (Depto. Fiscal → Depto. Manutenção → Fila de Croqui [Depto. Projeto] → Desenho Final [Depto. Projeto])
                </h2>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  O BP ingressa pela Filial (Depto. Comercial), vinculando automaticamente Supervisor/Coordenador e Assistente ao Vendedor responsável
                </p>
              </div>
              <span className="text-xs font-mono tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                Exibindo {bpsFiltrados.length} BPs
              </span>
            </div>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr
                  className="border-b text-[11px] font-bold"
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <th className="py-2 px-2.5 whitespace-nowrap">BP / Cliente</th>
                  <th className="py-2 px-2 whitespace-nowrap">Filial (& Supervisor)</th>
                  <th className="py-2 px-2 whitespace-nowrap">Vendedor (& Assistente)</th>
                  <th className="py-2 px-2 whitespace-nowrap">Fusos</th>
                  <th className="py-2 px-2 whitespace-nowrap">Dimensional / Laudo</th>
                  <th className="py-2 px-2 whitespace-nowrap">Tempo</th>
                  <th className="py-2 px-2 whitespace-nowrap">Status Atual</th>
                  <th className="py-2 px-2.5 whitespace-nowrap">Prazo & Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                {bpsFiltrados.map((item) => {
                  const etapaId = obterEtapaMacroBP(item);
                  const selecionado = bpSelecionadoId === item.bp;
                  const eq = obterEquipeFilial(item.filial, filiaisDb);
                  return (
                    <tr
                      key={item.bp}
                      onClick={() => onSelecionarBp(item.bp)}
                      className="cursor-pointer transition hover:opacity-95"
                      style={{
                        backgroundColor: selecionado ? 'var(--bg-elevated)' : 'transparent',
                      }}
                    >
                      <td className="py-2 px-2.5 font-mono tabular-nums whitespace-nowrap">
                        <div className="font-extrabold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                          <span>BP {item.bp} · <span className="font-sans">{item.cliente}</span></span>
                          {item.diretoriaOverride && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-red-600 text-white">
                              EMERGÊNCIA #1
                            </span>
                          )}
                        </div>
                        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          NF {item.nf} · {item.motivoRecebimento}
                        </div>
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap">
                        <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {eq.curto} <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>({eq.codigo})</span>
                        </div>
                        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          Sup: {eq.coordenador}
                        </div>
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap">
                        <div className="font-semibold" style={{ color: 'var(--text-secondary)' }}>
                          {item.vendedor}
                        </div>
                        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          Assist: {eq.assistente}
                        </div>
                      </td>
                      <td className="py-2 px-2 font-mono font-extrabold tabular-nums whitespace-nowrap" style={{ color: 'var(--accent-text)' }}>
                        {item.quantidade} un.
                      </td>
                      <td className="py-2 px-2 font-mono tabular-nums whitespace-nowrap">
                        {item.diametro && item.passo && item.compTotal ? (
                          <div>
                            <span className="text-emerald-500 font-semibold block">
                              Ø{item.diametro}×P{item.passo}×{item.compTotal}mm
                            </span>
                            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                              {item.croquiAntesDoLaudo ? 'Croqui Pré-Laudo' : 'Laudo Validado'}
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span className="text-amber-500 font-semibold block">
                              {item.croquiAntesDoLaudo ? 'Liberado Pré-Laudo' : 'Aguarda Laudo'}
                            </span>
                            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                              {item.dimensionalStatus}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-2 font-mono tabular-nums whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                        {item.tempoParado}
                      </td>
                      <td className="py-2 px-2 whitespace-nowrap">
                        {renderStatusHighlight(etapaId)}
                      </td>
                      <td
                        className="py-2 px-2.5 whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold tabular-nums text-[11px]" style={{ color: 'var(--text-primary)' }}>
                            {item.prazoEnvio}
                          </span>
                          <select
                            aria-label={`Mudar etapa do BP ${item.bp}`}
                            value={etapaId}
                            onChange={(e) => onMudarEtapaBP(item.bp, e.target.value)}
                            className="rounded px-1.5 py-0.5 text-[11px] font-bold border"
                            style={{
                              backgroundColor: 'var(--bg-elevated)',
                              borderColor: 'var(--border-strong)',
                              color: 'var(--text-primary)',
                            }}
                          >
                            {ETAPAS_FLUXO_CONFIG.map((et) => (
                              <option key={et.id} value={et.id}>
                                {et.titulo}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        </div>
      )}

      {/* =====================================================================
          MODELO 2 (BASEADO NO BP DASH 2): GANTT DE FLUXO POR FILIAL & PRAZOS
         ===================================================================== */}
      {modeloAtivo === 'DASH_2' && (
        <div className="space-y-4" aria-label="Modelo 2: Gantt de Prazos baseado no BP Dash 2">
          {/* Topo combinado com os cards que o usuário gostou no Dash 1 */}
          {renderTopoSeisCards()}

          {/* Gráfico Gantt de BPs Ativos e Prazos de Envio (Day 1 a Day 15) */}
          <section
            aria-label="Gantt de BPs Ativos e Prazos de Envio"
            className="rounded-xl border overflow-x-auto"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div
              className="px-4 py-3 border-b flex flex-wrap items-center justify-between gap-3"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <div>
                <h2 className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>
                  Gantt de BPs Ativos, 10 Filiais e Prazos de Envio (Depto. Manutenção → Fila de Croqui [Depto. Projeto] → Desenho Final [Depto. Projeto])
                </h2>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Acompanhamento em paralelo do Laudo (Depto. Manutenção), Fila de Croqui (Depto. Projeto), Desenho Final (Depto. Projeto) e Execução (Depto. Manutenção) até a data limite.
                </p>
              </div>

              {/* Legenda do Gantt fiel ao BP Dash 2 */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" />
                  <span>Laudo (Depto. Manutenção)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-sky-500 inline-block" />
                  <span>Fila de Croqui (Depto. Projeto)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-purple-500 inline-block" />
                  <span>Desenho Final (Depto. Projeto)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-orange-500 inline-block" />
                  <span>Depto. Manutenção (Execução)</span>
                </span>
                <span className="flex items-center gap-1.5 text-rose-500 font-bold">
                  <span>┆ Data Limite de Envio (Dia 12)</span>
                </span>
              </div>
            </div>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr
                  className="border-b text-[11px] font-bold"
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <th className="py-2 px-3 whitespace-nowrap">Filial (& Sup.)</th>
                  <th className="py-2 px-3 whitespace-nowrap">Vendedor (& Assist.)</th>
                  <th className="py-2 px-3 whitespace-nowrap">BP / Cliente</th>
                  <th className="py-2 px-3 whitespace-nowrap text-center">Qtd Fusos</th>
                  <th className="py-2 px-4 min-w-[480px]">
                    <div
                      className="text-center font-mono text-[10px]"
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(15, minmax(0, 1fr))',
                      }}
                    >
                      {Array.from({ length: 15 }, (_, i) => (
                        <span
                          key={i}
                          className={i + 1 === 12 ? 'text-rose-500 font-extrabold' : ''}
                        >
                          Dia {i + 1}
                        </span>
                      ))}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                {bpsFiltrados.map((item) => {
                  const eq = obterEquipeFilial(item.filial, filiaisDb);
                  const g = item.gantt || {
                    inicio: 2,
                    laudo: 2,
                    croqui: 2,
                    desenho: 2,
                    manut: 2,
                    limite: 12,
                  };
                  const offsetPct = ((g.inicio - 1) / 15) * 100;
                  const laudoPct = (g.laudo / 15) * 100;
                  const croquiPct = (g.croqui / 15) * 100;
                  const desenhoPct = (g.desenho / 15) * 100;
                  const manutPct = (g.manut / 15) * 100;

                  return (
                    <tr
                      key={item.bp}
                      onClick={() => onSelecionarBp(item.bp)}
                      className="cursor-pointer transition hover:opacity-95"
                    >
                      <td className="py-2 px-3 whitespace-nowrap">
                        <div className="font-bold" style={{ color: 'var(--text-primary)' }}>
                          {eq.curto} <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>({eq.codigo})</span>
                        </div>
                        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          Sup: {eq.coordenador}
                        </div>
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <div className="font-semibold" style={{ color: 'var(--text-secondary)' }}>
                          {item.vendedor}
                        </div>
                        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          Assist: {eq.assistente}
                        </div>
                      </td>
                      <td className="py-2 px-3 font-mono font-bold whitespace-nowrap">
                        BP #{item.bp} · <span className="font-sans">{item.cliente}</span>
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-extrabold tabular-nums">
                        {item.quantidade}
                      </td>
                      <td className="py-2 px-4 relative">
                        {/* Linha tracejada vermelha de Data Limite de Envio no Dia 12 */}
                        <div
                          className="absolute top-0 bottom-0 border-r-2 border-dashed border-rose-500/80 pointer-events-none"
                          style={{ left: `${(12 / 15) * 100}%` }}
                        />
                        <div
                          className="w-full h-5 rounded-md flex items-center overflow-hidden relative"
                          style={{ backgroundColor: 'var(--bg-subtle)' }}
                        >
                          <div style={{ width: `${offsetPct}%` }} className="shrink-0" />
                          <div
                            style={{ width: `${laudoPct}%` }}
                            className="h-full bg-amber-400"
                            title={`Laudo Dimensional (Depto. Manutenção): ${g.laudo}d`}
                          />
                          <div
                            style={{ width: `${croquiPct}%` }}
                            className="h-full bg-sky-500"
                            title={`Fila de Croqui (Depto. Projeto): ${g.croqui}d`}
                          />
                          <div
                            style={{ width: `${desenhoPct}%` }}
                            className="h-full bg-purple-500"
                            title={`Projeto Final Desenho (Depto. Projeto): ${g.desenho}d`}
                          />
                          {g.manut > 0 && (
                            <div
                              style={{ width: `${manutPct}%` }}
                              className="h-full bg-orange-500"
                              title={`Depto. Manutenção (Execução): ${g.manut}d`}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        </div>
      )}

      {/* =====================================================================
          MODELO 3 (BASEADO NO BP DASH 3): BI VOLUME POR 10 FILIAIS & REALIZADO VS A FAZER
         ===================================================================== */}
      {modeloAtivo === 'DASH_3' && (
        <div className="space-y-4" aria-label="Modelo 3: BI Executivo baseado no BP Dash 3">
          {/* Topo Executivo do BP Dash 3 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
            {[
              {
                titulo: 'Total BPs (Período)',
                valor: totalBpsExibido,
                sub: `Histórico: ${filtroPeriodo === 'TODOS' ? 'Completo' : `${filtroPeriodo} dias`}`,
                cor: 'var(--text-primary)',
                spark: [120, 140, 155, 165, 178, 189],
              },
              {
                titulo: 'Qtd Total Fusos',
                valor: totalFusosExibido,
                sub: 'Fusos mapeados nas 10 filiais',
                cor: '#38BDF8',
                spark: [80, 95, 110, 130, 160, 189],
              },
              {
                titulo: 'Concluídos (Realizados)',
                valor: concluidosBpsExibido,
                sub: `De ${totalBpsExibido} BPs totais`,
                cor: '#22C55E',
                spark: [15, 22, 30, 38, 44, 50],
              },
              {
                titulo: 'Para Fazer (Saldo Ativo)',
                valor: paraFazerBpsExibido,
                sub: 'Soma pendente de entrega',
                cor: '#F59E0B',
                spark: [90, 105, 115, 125, 132, 139],
              },
              {
                titulo: 'Fila de Croqui (Depto. Projeto)',
                valor: Math.round(resumoFluxo.etapas.FILA_CROQUI.bps * fatorEscala),
                sub: `${Math.round(resumoFluxo.etapas.FILA_CROQUI.fusos * fatorEscala)} fusos p/ croqui`,
                cor: '#F97316',
                spark: [4, 6, 5, 7, 8, 9],
              },
              {
                titulo: 'Desenho Final (Depto. Projeto)',
                valor: Math.round(resumoFluxo.etapas.FILA_DESENHO_FINAL.bps * fatorEscala),
                sub: 'Depto. Projeto • Desenho Final',
                cor: '#A855F7',
                spark: [8, 12, 15, 18, 22, 25],
              },
            ].map((kpi, idx) => (
              <div
                key={idx}
                className="rounded-xl border p-3.5 flex flex-col justify-between"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <span className="text-xs font-bold block" style={{ color: 'var(--text-secondary)' }}>
                  {kpi.titulo}
                </span>
                <div
                  className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums my-1"
                  style={{ color: kpi.cor }}
                >
                  {kpi.valor}
                </div>
                <span className="text-[11px] block mb-1" style={{ color: 'var(--text-muted)' }}>
                  {kpi.sub}
                </span>
                <SparklineSVG points={kpi.spark} color={typeof kpi.cor === 'string' && kpi.cor.startsWith('#') ? kpi.cor : '#38BDF8'} />
              </div>
            ))}
          </div>

          {/* 2 Gráficos Centrais do BP Dash 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Gráfico 1: Volume de Fluxo de Fusos nas 10 Filiais (Alterna Colunas vs Barras) */}
            <section
              aria-label="Volume de Fusos nas 10 Filiais e Etapa"
              className="rounded-xl border p-4 space-y-4"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>
                    Volume de Fluxo nas 10 Filiais (Depto. Comercial) por Etapa
                  </h2>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Bauru, SP, SJC/Vale, Campinas, BH, Joinville, Manaus, Curitiba, POA e Recife
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setOrientacaoGraficoFilial((prev) =>
                      prev === 'COLUNAS' ? 'BARRAS' : 'COLUNAS'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg text-xs font-bold border inline-flex items-center gap-1.5"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border-strong)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>
                    {orientacaoGraficoFilial === 'COLUNAS'
                      ? 'Trocar p/ Barras'
                      : 'Trocar p/ Colunas'}
                  </span>
                </button>
              </div>

              {orientacaoGraficoFilial === 'COLUNAS' ? (
                <div
                  className="grid grid-cols-5 sm:grid-cols-10 gap-2 pt-4 items-end h-56 px-2 border-b"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  {resumoFluxo.porFilial.map((fil) => {
                    const maxFusos = Math.max(
                      ...resumoFluxo.porFilial.map((f) => f.totalFusos),
                      1
                    );
                    const alturaTotalPct = Math.max(
                      22,
                      Math.round((fil.totalFusos / maxFusos) * 100)
                    );
                    const tf = Math.max(1, fil.totalFusos);
                    return (
                      <div
                        key={fil.codigo}
                        className="flex flex-col items-center h-full justify-end gap-1.5 min-w-0"
                        title={`${fil.nome} — Sup: ${fil.coordenador} | Assist: ${fil.assistente}`}
                      >
                        <span className="text-[10px] font-mono font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                          {Math.round(fil.totalFusos * fatorEscala)}f
                        </span>
                        <div
                          className="w-full max-w-[34px] rounded-t-md overflow-hidden flex flex-col-reverse border"
                          style={{
                            height: `${alturaTotalPct}%`,
                            borderColor: 'var(--border-strong)',
                          }}
                        >
                          <div
                            style={{
                              height: `${(fil.CONCLUIDO / tf) * 100}%`,
                              backgroundColor: '#22C55E',
                            }}
                            title="Concluídos"
                          />
                          <div
                            style={{
                              height: `${(fil.EM_MANUTENCAO / tf) * 100}%`,
                              backgroundColor: '#EAB308',
                            }}
                            title="Depto. Manutenção"
                          />
                          <div
                            style={{
                              height: `${(fil.FILA_DESENHO_FINAL / tf) * 100}%`,
                              backgroundColor: '#38BDF8',
                            }}
                            title="Projeto Final Desenho (Depto. Projeto)"
                          />
                          <div
                            style={{
                              height: `${(fil.FILA_CROQUI / tf) * 100}%`,
                              backgroundColor: '#F97316',
                            }}
                            title="Fila de Croqui (Depto. Projeto)"
                          />
                          <div
                            style={{
                              height: `${((fil.AGUARDANDO_LAUDO + fil.PRE_BP) / tf) * 100}%`,
                              backgroundColor: '#EF4444',
                            }}
                            title="Aguardando Laudo (Depto. Manutenção)"
                          />
                        </div>
                        <span className="text-[10px] font-extrabold pb-1.5 truncate max-w-full" style={{ color: 'var(--text-primary)' }}>
                          {fil.curto}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2 py-1 max-h-64 overflow-y-auto pr-1">
                  {resumoFluxo.porFilial.map((fil) => {
                    const tf = Math.max(1, fil.totalFusos);
                    return (
                      <div key={fil.codigo} className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="truncate">
                            {fil.codigo} · {fil.curto}{' '}
                            <span className="font-normal text-[10px]" style={{ color: 'var(--text-muted)' }}>
                              (Sup: {fil.coordenador})
                            </span>
                          </span>
                          <span className="font-mono tabular-nums shrink-0">
                            {Math.round(fil.totalBps * fatorEscala)} BPs · {Math.round(fil.totalFusos * fatorEscala)} fusos
                          </span>
                        </div>
                        <div className="w-full h-3.5 rounded-md overflow-hidden flex" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                          <div style={{ width: `${(fil.AGUARDANDO_LAUDO / tf) * 100}%`, backgroundColor: '#EF4444' }} />
                          <div style={{ width: `${(fil.FILA_CROQUI / tf) * 100}%`, backgroundColor: '#F97316' }} />
                          <div style={{ width: `${(fil.FILA_DESENHO_FINAL / tf) * 100}%`, backgroundColor: '#38BDF8' }} />
                          <div style={{ width: `${(fil.EM_MANUTENCAO / tf) * 100}%`, backgroundColor: '#EAB308' }} />
                          <div style={{ width: `${(fil.CONCLUIDO / tf) * 100}%`, backgroundColor: '#22C55E' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold">
                <span className="text-red-400">■ Aguard. Laudo (Depto. Manutenção)</span>
                <span className="text-orange-400">■ Fila de Croqui (Depto. Projeto)</span>
                <span className="text-sky-400">■ Desenho Final (Depto. Projeto)</span>
                <span className="text-yellow-400">■ Depto. Manutenção</span>
                <span className="text-emerald-400">■ Concluídos</span>
              </div>
            </section>

            {/* Gráfico 2: Balanço Realizados vs. Para Fazer & Carga por Departamento */}
            <section
              aria-label="Balanço Realizados vs Para Fazer e Divisão por Departamento"
              className="rounded-xl border p-4 space-y-4"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div>
                <h2 className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>
                  Progresso de Entregas & Carga por Departamento
                </h2>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Soma total de BPs no período ({totalBpsExibido} BPs: {concluidosBpsExibido} realizados vs. {paraFazerBpsExibido} para fazer)
                </p>
              </div>

              <div className="space-y-3 pt-1">
                {[
                  {
                    rotulo: 'Fila de Croqui (Depto. Projeto)',
                    bps: Math.round(resumoFluxo.etapas.FILA_CROQUI.bps * fatorEscala),
                    fusos: Math.round(resumoFluxo.etapas.FILA_CROQUI.fusos * fatorEscala),
                    cor: '#F97316',
                    detalhe: 'Laudo validado (ou antecipado pré-laudo) • Levantamento dimensional e croqui técnico',
                  },
                  {
                    rotulo: 'Desenho Final (Depto. Projeto)',
                    bps: Math.round(resumoFluxo.etapas.FILA_DESENHO_FINAL.bps * fatorEscala),
                    fusos: Math.round(resumoFluxo.etapas.FILA_DESENHO_FINAL.fusos * fatorEscala),
                    cor: '#38BDF8',
                    detalhe: 'Croqui concluído • Elaboração do Desenho Final para fabricação ou arquivo técnico',
                  },
                  {
                    rotulo: 'Depto. Manutenção — Execução Física',
                    bps: Math.round(resumoFluxo.etapas.EM_MANUTENCAO.bps * fatorEscala),
                    fusos: Math.round(resumoFluxo.etapas.EM_MANUTENCAO.fusos * fatorEscala),
                    cor: '#EAB308',
                    detalhe: 'BPs em reparo e manutenção física de fuso pelo Depto. Manutenção',
                  },
                  {
                    rotulo: 'Aguardando Laudo / Pré-BP — Depto. Manutenção & Depto. Fiscal',
                    bps: Math.round(
                      (resumoFluxo.etapas.AGUARDANDO_LAUDO.bps +
                        resumoFluxo.etapas.PRE_BP.bps) *
                        fatorEscala
                    ),
                    fusos: Math.round(
                      (resumoFluxo.etapas.AGUARDANDO_LAUDO.fusos +
                        resumoFluxo.etapas.PRE_BP.fusos) *
                        fatorEscala
                    ),
                    cor: '#EF4444',
                    detalhe: 'Aguardando desmontagem e emissão de laudo pelo Depto. Manutenção',
                  },
                  {
                    rotulo: 'Concluídos no Período — Depto. Projeto & Depto. Manutenção',
                    bps: concluidosBpsExibido,
                    fusos: Math.round(resumoFluxo.concluidosFusos * fatorEscala),
                    cor: '#22C55E',
                    detalhe: 'Ciclo completo finalizado dentro do filtro selecionado',
                  },
                ].map((linha, idx) => {
                  const pct = Math.min(
                    100,
                    Math.max(8, Math.round((linha.bps / Math.max(1, totalBpsExibido)) * 100))
                  );
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                          {linha.rotulo}
                        </span>
                        <span className="font-mono font-extrabold tabular-nums" style={{ color: linha.cor }}>
                          {linha.bps} BPs ({linha.fusos} fusos)
                        </span>
                      </div>
                      <div
                        className="w-full h-2.5 rounded-full overflow-hidden"
                        style={{ backgroundColor: 'var(--bg-subtle)' }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: linha.cor }}
                        />
                      </div>
                      <span className="text-[11px] block" style={{ color: 'var(--text-muted)' }}>
                        {linha.detalhe}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODELO 4 (AUTORAL_1):
          FLUXO ENTRE DEPARTAMENTOS: 1 - AVALIAÇÃO & LAUDO -> 2 - FILA DE CROQUI -> 3 - DESENHO FINAL
         ===================================================================== */}
      {modeloAtivo === 'AUTORAL_1' && (
        <div
          className="space-y-4"
          aria-label="Fluxo Operacional entre Depto. Manutenção e Depto. Projeto"
        >
          <div
            className="rounded-xl border p-4 flex flex-wrap items-center justify-between gap-3"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div>
              <span className="text-xs font-bold text-sky-400 block">
                Fluxo Operacional entre Departamentos: Depto. Manutenção → Depto. Projeto
              </span>
              <h2 className="text-base sm:text-lg font-extrabold" style={{ color: 'var(--text-primary)' }}>
                1 - Avaliação & Geração de Laudo (Depto. Manutenção) → 2 - Fila de Croqui (Depto. Projeto) → 3 - Desenho Final (Depto. Projeto)
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-start">
            {/* Coluna 1: 1 - Avaliação & Geração de Laudo (Depto. Manutenção) */}
            <div
              className="rounded-xl border p-4 space-y-3"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div
                className="pb-3 border-b flex items-center justify-between gap-3"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <div className="min-w-0">
                  <span className="text-xs font-extrabold text-red-400 block">
                    1 - Avaliação & Geração de Laudo (Depto. Manutenção)
                  </span>
                  <span className="text-[11px] block mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Desmontagem técnica e inspeção do fuso para liberação de croqui (ou pré-laudo)
                  </span>
                </div>

                {/* Card interno para informar Qtd de BPs */}
                <div
                  className="rounded-xl border px-3 py-1.5 shrink-0 flex flex-col items-center justify-center text-center min-w-[78px]"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.12)',
                    borderColor: '#EF4444',
                  }}
                >
                  <span className="text-base font-mono font-extrabold text-red-400 tabular-nums leading-tight whitespace-nowrap">
                    {resumoFluxo.etapas.AGUARDANDO_LAUDO.bps + resumoFluxo.etapas.PRE_BP.bps} BPs
                  </span>
                  <span className="text-[10px] font-mono tabular-nums whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                    {resumoFluxo.etapas.AGUARDANDO_LAUDO.fusos + resumoFluxo.etapas.PRE_BP.fusos} fusos
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                {[
                  ...resumoFluxo.etapas.AGUARDANDO_LAUDO.itens,
                  ...resumoFluxo.etapas.PRE_BP.itens,
                ].map((item) => {
                  const eq = obterEquipeFilial(item.filial, filiaisDb);
                  return (
                    <article
                      key={item.bp}
                      onClick={() => onSelecionarBp(item.bp)}
                      className="rounded-xl border p-3 space-y-2 cursor-pointer"
                      style={{
                        backgroundColor: 'var(--bg-canvas)',
                        borderColor: 'var(--border-subtle)',
                      }}
                    >
                      <div className="flex justify-between items-center gap-2 text-xs font-mono">
                        <strong className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                          BP #{item.bp} · {item.cliente}
                        </strong>
                        <span className="text-red-400 font-bold whitespace-nowrap shrink-0">
                          {item.quantidade} fusos
                        </span>
                      </div>
                      <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                        NF {item.nf} · {eq.curto} ({item.vendedor}) · {item.motivoRecebimento}
                      </div>
                      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        Sup: {eq.coordenador} · Assist: {eq.assistente}
                      </div>
                      <div
                        className="pt-1.5 border-t flex flex-wrap justify-between items-center gap-1.5"
                        style={{ borderColor: 'var(--border-subtle)' }}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAtualizarCampo(item.bp, 'croquiAntesDoLaudo', true);
                            onMudarEtapaBP(item.bp, 'FILA_CROQUI');
                          }}
                          className="px-2 py-1 rounded text-[10px] font-bold border whitespace-nowrap"
                          style={{
                            backgroundColor: 'var(--bg-elevated)',
                            borderColor: 'var(--border-strong)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          Croqui Antes do Laudo
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMudarEtapaBP(item.bp, 'FILA_CROQUI');
                          }}
                          className="px-2.5 py-1 rounded text-[11px] font-bold text-white bg-orange-500 inline-flex items-center gap-1 whitespace-nowrap"
                        >
                          <span>Laudo OK → Fila de Croqui</span>
                          <ArrowRight className="w-3 h-3 shrink-0" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* Coluna 2: 2 - Fila de Croqui (Depto. Projeto) */}
            <div
              className="rounded-xl border p-4 space-y-3"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: '#F97316',
              }}
            >
              <div
                className="pb-3 border-b flex items-center justify-between gap-3"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <div className="min-w-0">
                  <span className="text-xs font-extrabold text-orange-400 block">
                    2 - Fila de Croqui (Depto. Projeto)
                  </span>
                  <span className="text-[11px] block mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Produto desmontado / Laudo pronto • Informar Ø×P×Comp e avançar p/ Etapa 3 (Desenho Final)
                  </span>
                </div>

                {/* Card interno para informar Qtd de BPs */}
                <div
                  className="rounded-xl border px-3 py-1.5 shrink-0 flex flex-col items-center justify-center text-center min-w-[78px]"
                  style={{
                    backgroundColor: 'rgba(249, 115, 22, 0.12)',
                    borderColor: '#F97316',
                  }}
                >
                  <span className="text-base font-mono font-extrabold text-orange-400 tabular-nums leading-tight whitespace-nowrap">
                    {resumoFluxo.etapas.FILA_CROQUI.bps} BPs
                  </span>
                  <span className="text-[10px] font-mono tabular-nums whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                    {resumoFluxo.etapas.FILA_CROQUI.fusos} fusos
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                {resumoFluxo.etapas.FILA_CROQUI.itens.map((item) => {
                  const eq = obterEquipeFilial(item.filial, filiaisDb);
                  return (
                    <article
                      key={item.bp}
                      onClick={() => onSelecionarBp(item.bp)}
                      className="rounded-xl border p-3 space-y-2 cursor-pointer"
                      style={{
                        backgroundColor: 'var(--bg-canvas)',
                        borderColor: 'var(--border-subtle)',
                      }}
                    >
                      <div className="flex justify-between items-center gap-2 text-xs font-mono">
                        <strong className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                          BP #{item.bp} · {item.cliente}
                        </strong>
                        <span className="text-orange-400 font-bold whitespace-nowrap shrink-0">
                          {item.quantidade} fusos
                        </span>
                      </div>
                      <div className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                        NF {item.nf} · {eq.curto} ({item.vendedor})
                      </div>
                      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        Sup: {eq.coordenador} · Assist: {eq.assistente}
                      </div>

                      {/* Edição rápida do dimensional do croqui */}
                      <div
                        className="grid grid-cols-3 gap-1 pt-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          aria-label={`Croqui Diâmetro BP ${item.bp}`}
                          value={item.diametro}
                          onChange={(e) => onAtualizarCampo(item.bp, 'diametro', e.target.value)}
                          className="rounded px-1.5 py-1 text-xs font-mono border"
                          style={{
                            backgroundColor: 'var(--bg-elevated)',
                            borderColor: 'var(--border-strong)',
                            color: 'var(--text-primary)',
                          }}
                        >
                          <option value="">Ø</option>
                          {DIAMETROS.filter(Boolean).map((d) => (
                            <option key={d} value={d}>Ø{d}</option>
                          ))}
                        </select>
                        <select
                          aria-label={`Croqui Passo BP ${item.bp}`}
                          value={item.passo}
                          onChange={(e) => onAtualizarCampo(item.bp, 'passo', e.target.value)}
                          className="rounded px-1.5 py-1 text-xs font-mono border"
                          style={{
                            backgroundColor: 'var(--bg-elevated)',
                            borderColor: 'var(--border-strong)',
                            color: 'var(--text-primary)',
                          }}
                        >
                          <option value="">Passo</option>
                          {PASSOS.filter(Boolean).map((p) => (
                            <option key={p} value={p}>P{p}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          aria-label={`Croqui Comprimento BP ${item.bp}`}
                          placeholder="Comp."
                          value={item.compTotal}
                          onChange={(e) => onAtualizarCampo(item.bp, 'compTotal', e.target.value)}
                          className="rounded px-1.5 py-1 text-xs font-mono border"
                          style={{
                            backgroundColor: 'var(--bg-elevated)',
                            borderColor: 'var(--border-strong)',
                            color: 'var(--text-primary)',
                          }}
                        />
                      </div>

                      <div
                        className="pt-1.5 border-t flex justify-between items-center gap-2"
                        style={{ borderColor: 'var(--border-subtle)' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => onCopiarPasta(item)}
                          className="px-2 py-1 rounded text-[11px] font-bold border inline-flex items-center gap-1 whitespace-nowrap"
                          style={{
                            backgroundColor: 'var(--bg-subtle)',
                            borderColor: 'var(--border-strong)',
                            color: 'var(--text-primary)',
                          }}
                        >
                          {copiadoId === item.bp ? <Check className="w-3 h-3 shrink-0" /> : <Copy className="w-3 h-3 shrink-0" />}
                          <span>Copiar .ZIP</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onMudarEtapaBP(item.bp, 'FILA_DESENHO_FINAL')}
                          className="px-2.5 py-1 rounded text-[11px] font-bold text-white bg-sky-600 inline-flex items-center gap-1 whitespace-nowrap"
                        >
                          <span>Enviar p/ Desenho Final</span>
                          <ArrowRight className="w-3 h-3 shrink-0" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* Coluna 3: 3 - Desenho Final (Depto. Projeto) */}
            <div
              className="rounded-xl border p-4 space-y-3"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: '#38BDF8',
              }}
            >
              <div
                className="pb-3 border-b flex items-center justify-between gap-3"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <div className="min-w-0">
                  <span className="text-xs font-extrabold text-sky-400 block">
                    3 - Desenho Final (Depto. Projeto)
                  </span>
                  <span className="text-[11px] block mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Croqui dimensional validado • Detalhamento técnico para fabricação ou arquivo
                  </span>
                </div>

                {/* Card interno para informar Qtd de BPs */}
                <div
                  className="rounded-xl border px-3 py-1.5 shrink-0 flex flex-col items-center justify-center text-center min-w-[78px]"
                  style={{
                    backgroundColor: 'rgba(56, 189, 248, 0.12)',
                    borderColor: '#38BDF8',
                  }}
                >
                  <span className="text-base font-mono font-extrabold text-sky-400 tabular-nums leading-tight whitespace-nowrap">
                    {resumoFluxo.etapas.FILA_DESENHO_FINAL.bps} BPs
                  </span>
                  <span className="text-[10px] font-mono tabular-nums whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                    {resumoFluxo.etapas.FILA_DESENHO_FINAL.fusos} fusos
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                {resumoFluxo.etapas.FILA_DESENHO_FINAL.itens.map((item) => {
                  const eq = obterEquipeFilial(item.filial, filiaisDb);
                  return (
                    <article
                      key={item.bp}
                      onClick={() => onSelecionarBp(item.bp)}
                      className="rounded-xl border p-3 space-y-2 cursor-pointer"
                      style={{
                        backgroundColor: 'var(--bg-canvas)',
                        borderColor: 'var(--border-subtle)',
                      }}
                    >
                      <div className="flex justify-between items-center gap-2 text-xs font-mono">
                        <strong className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                          BP #{item.bp} · {item.cliente}
                        </strong>
                        <span className="text-sky-400 font-bold whitespace-nowrap shrink-0">
                          {item.quantidade} fusos
                        </span>
                      </div>
                      <div className="text-[11px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                        Croqui Validado: Ø{item.diametro || '40'}×P{item.passo || '10'}×{item.compTotal || '1200'}mm · NF {item.nf}
                      </div>
                      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {eq.curto} ({item.vendedor}) · Sup: {eq.coordenador} · Assist: {eq.assistente}
                      </div>
                      <div
                        className="pt-1.5 border-t flex justify-between items-center gap-2"
                        style={{ borderColor: 'var(--border-subtle)' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
                          {item.motivoRecebimento} · Prazo: {item.prazoEnvio}
                        </span>
                        <button
                          type="button"
                          onClick={() => onMudarEtapaBP(item.bp, 'CONCLUIDO')}
                          className="px-2.5 py-1 rounded text-[11px] font-bold text-white bg-emerald-600 inline-flex items-center gap-1 whitespace-nowrap shrink-0"
                        >
                          <Check className="w-3 h-3 shrink-0" />
                          <span>Concluir Desenho Final</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODELO 5 (SUGESTÃO AUTORAL 02):
          SIMULADOR DE FILA DE PRIORIDADES + DIRETORIA + CARTEIRA DE FILIAIS
         ===================================================================== */}
      {modeloAtivo === 'AUTORAL_2' && (
        <div
          className="space-y-5"
          aria-label="Modelo Autoral 2: Simulador de Fila, Fura-Fila Diretoria e Filiais"
        >
          <div
            className="rounded-xl border p-4"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <span className="text-xs font-bold text-sky-400 block">
              Regras de Prioridade & Emergência (Diretoria, Depto. Comercial, Depto. Manutenção e Depto. Projeto)
            </span>
            <h2 className="text-base sm:text-lg font-extrabold" style={{ color: 'var(--text-primary)' }}>
              Simulador de Posição na Fila (&ldquo;Quantos na Frente&rdquo;), Emergência Diretoria/Supervisor & Cobertura de Férias
            </h2>
          </div>

          <PainelFilaPrioridade
            bps={todosBps}
            onConfirmarPrioridade={onConfirmarPrioridade}
            onAbrirModalFuraFila={onAbrirModalFuraFila}
          />

          <PipelineDiretoriaRapido
            bps={todosBps}
            mapaPosicoes={mapaPosicoes}
            onAprovarFuraFilaDireto={onConfirmarFuraFila}
          />

          <PainelFiliaisVendedores
            filiaisDb={filiaisDb}
            bps={todosBps}
            onMesclarFerias={onMesclarFerias}
            onAdicionarVendedorFilial={onAdicionarVendedorFilial}
            onAtualizarEquipeFilial={onAtualizarEquipeFilial}
            onFiltrarPorFilialEVendedor={(codFilial) => {
              onMudarFilial(codFilial);
              onMudarModelo('DASH_1');
            }}
          />
        </div>
      )}

      {/* =====================================================================
          MODELO 6 (AUTORAL_3 — DIFERENCIADO DA TABELA DO DASH 1):
          CENTRAL DAS 10 FILIAIS (DEPTO. COMERCIAL) & 5 ETAPAS POR DEPARTAMENTO
         ===================================================================== */}
      {modeloAtivo === 'AUTORAL_3' && (
        <div
          aria-label="Central das 10 Filiais e Mapa das 5 Etapas do Processo"
          className="space-y-5"
        >
          {/* Explicação Clara da Diferença desta Aba + Arquitetura das 5 Etapas Oficiais */}
          <section
            className="rounded-xl border p-4 space-y-4"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Central de Parametrização das 10 Filiais (Depto. Comercial) & 5 Etapas por Departamento</span>
                </span>
                <h2 className="text-base sm:text-lg font-extrabold" style={{ color: 'var(--text-primary)' }}>
                  10 Filiais (Depto. Comercial: Supervisores, Vendedores e Assistentes) + Fluxo das 5 Etapas
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  Enquanto o 1º painel (<strong>Gestão à Vista & Fluxo</strong>) apresenta a operação diária dos BPs, esta central gerencia o <strong>banco de dados das 10 Filiais do Depto. Comercial</strong> e as <strong>5 etapas oficiais</strong> entre <strong>Depto. Fiscal</strong>, <strong>Depto. Manutenção</strong> e <strong>Depto. Projeto</strong>.
                </p>
              </div>
            </div>

            {/* Mapa Visual das 5 Etapas Oficiais com Depto. na frente dos setores */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5 pt-1">
              {[
                {
                  passo: 'Etapa 1 • Depto. Fiscal & Depto. Comercial',
                  titulo: 'Validação Fiscal',
                  desc: 'Conferência da Nota Fiscal pelo Depto. Fiscal e entrada do BP pela Filial (Depto. Comercial — 03.01 a 03.10), vinculando automaticamente Supervisor/Coordenador e Assistente ao Vendedor.',
                  cor: '#8B5CF6',
                },
                {
                  passo: 'Etapa 2 • Depto. Manutenção',
                  titulo: 'Avaliação Técnica Manutenção',
                  desc: 'O Depto. Manutenção recebe o equipamento fisicamente e inicia a desmontagem e avaliação técnica do conjunto/fuso para inspeção.',
                  cor: '#EAB308',
                },
                {
                  passo: 'Etapa 3 • Depto. Manutenção',
                  titulo: 'Geração de Laudo Manutenção',
                  desc: 'O Depto. Manutenção conclui o diagnóstico técnico e emite o Laudo de Manutenção. Em caso de urgência autorizada pela Diretoria/Supervisor, um alerta destaca no painel principal.',
                  cor: '#EF4444',
                },
                {
                  passo: 'Etapa 4 • Depto. Projeto',
                  titulo: 'Desenvolvimento de Croqui',
                  desc: 'O Depto. Projeto realiza o levantamento dimensional e elabora o Croqui Técnico — após a emissão do laudo pelo Depto. Manutenção ou de forma antecipada quando solicitado.',
                  cor: '#F97316',
                },
                {
                  passo: 'Etapa 5 • Depto. Projeto',
                  titulo: 'Projeto Final Desenho',
                  desc: 'O Depto. Projeto elabora o Projeto Final Desenho para fabricação industrial ou arquivamento técnico com a nomenclatura padrão .ZIP.',
                  cor: '#22C55E',
                },
              ].map((et, i) => (
                <div
                  key={i}
                  className="rounded-xl border p-3 space-y-1.5"
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    borderColor: 'var(--border-subtle)',
                  }}
                >
                  <span
                    className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded inline-block"
                    style={{
                      backgroundColor: 'var(--bg-elevated)',
                      color: et.cor,
                    }}
                  >
                    {et.passo}
                  </span>
                  <h3 className="text-xs font-extrabold" style={{ color: 'var(--text-primary)' }}>
                    {et.titulo}
                  </h3>
                  <p className="text-[11px] leading-snug" style={{ color: 'var(--text-secondary)' }}>
                    {et.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Cadastro e Edição em Tempo Real das 10 Filiais (Depto. Comercial: Supervisor, Assistente e Vendedores) */}
          <PainelFiliaisVendedores
            filiaisDb={filiaisDb}
            bps={todosBps}
            onMesclarFerias={onMesclarFerias}
            onAdicionarVendedorFilial={onAdicionarVendedorFilial}
            onAtualizarEquipeFilial={onAtualizarEquipeFilial}
            onFiltrarPorFilialEVendedor={(codFilial) => {
              onMudarFilial(codFilial);
              onMudarModelo('DASH_1');
            }}
          />
        </div>
      )}
    </div>
  );
}

