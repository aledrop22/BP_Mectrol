import React from 'react';
import {
  Calendar,
  ArrowLeftRight,
  FileSpreadsheet,
  FileText,
  Download,
  TrendingUp,
  CheckCircle2,
  Clock,
  X,
} from 'lucide-react';
import {
  MESES_2026,
  SEMANAS_2026,
  formatarDataBR,
} from '../lib/comparativoExportEngine';

export default function PainelCalendarioExportacao({
  filtroPeriodo,
  onMudarPeriodo,
  dataInicio,
  dataFim,
  onMudarDataInicio,
  onMudarDataFim,
  mostrarComparativo,
  onAlternarComparativo,
  modoComparativo,
  onMudarModoComparativo,
  mesA,
  mesB,
  onMudarMesA,
  onMudarMesB,
  semanaA,
  semanaB,
  onMudarSemanaA,
  onMudarSemanaB,
  inicioA,
  fimA,
  inicioB,
  fimB,
  onMudarInicioA,
  onMudarFimA,
  onMudarInicioB,
  onMudarFimB,
  comparativo,
  modalRelatorioAberto,
  onFecharModalRelatorio,
  observacoesAnalise,
  onMudarObservacoesAnalise,
  onExportarExcel,
  onExportarPDF,
  resumoFluxo,
  bpsFiltrados,
  periodoDescricao,
}) {
  const aplicarAtalhoCalendario = (ini, fim) => {
    onMudarDataInicio(ini);
    onMudarDataFim(fim);
    onMudarPeriodo('CALENDARIO');
  };

  return (
    <>
      {/* Painel Expansível: Calendário Personalizado (ex: desde 01/01/2026) */}
      {filtroPeriodo === 'CALENDARIO' && (
        <div
          aria-label="Seleção de Intervalo por Calendário"
          className="rounded-xl border p-3 space-y-2.5"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--accent-primary)',
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" style={{ color: 'var(--accent-text)' }} />
              <span className="text-xs font-extrabold" style={{ color: 'var(--text-primary)' }}>
                Filtro por Calendário de Datas (Selecione o ponto inicial e final)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => aplicarAtalhoCalendario('2026-01-01', '2026-11-18')}
                className="px-2 py-0.5 rounded text-[11px] font-bold border transition"
                style={{
                  backgroundColor:
                    dataInicio === '2026-01-01' && dataFim === '2026-11-18'
                      ? 'var(--accent-primary)'
                      : 'var(--bg-surface)',
                  borderColor: 'var(--border-strong)',
                  color:
                    dataInicio === '2026-01-01' && dataFim === '2026-11-18'
                      ? '#FFFFFF'
                      : 'var(--text-secondary)',
                }}
              >
                Desde 01/01/2026 (Ano 2026)
              </button>
              <button
                type="button"
                onClick={() => aplicarAtalhoCalendario('2026-01-01', '2026-06-30')}
                className="px-2 py-0.5 rounded text-[11px] font-bold border transition"
                style={{
                  backgroundColor:
                    dataInicio === '2026-01-01' && dataFim === '2026-06-30'
                      ? 'var(--accent-primary)'
                      : 'var(--bg-surface)',
                  borderColor: 'var(--border-strong)',
                  color:
                    dataInicio === '2026-01-01' && dataFim === '2026-06-30'
                      ? '#FFFFFF'
                      : 'var(--text-secondary)',
                }}
              >
                1º Semestre 2026
              </button>
              <button
                type="button"
                onClick={() => aplicarAtalhoCalendario('2026-07-01', '2026-11-18')}
                className="px-2 py-0.5 rounded text-[11px] font-bold border transition"
                style={{
                  backgroundColor:
                    dataInicio === '2026-07-01' && dataFim === '2026-11-18'
                      ? 'var(--accent-primary)'
                      : 'var(--bg-surface)',
                  borderColor: 'var(--border-strong)',
                  color:
                    dataInicio === '2026-07-01' && dataFim === '2026-11-18'
                      ? '#FFFFFF'
                      : 'var(--text-secondary)',
                }}
              >
                2º Semestre 2026
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              <span>Data Inicial:</span>
              <input
                type="date"
                aria-label="Data Inicial do Calendário"
                value={dataInicio}
                onChange={(e) => onMudarDataInicio(e.target.value)}
                className="rounded-lg px-2.5 py-1 text-xs font-mono border"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-strong)',
                  color: 'var(--text-primary)',
                }}
              />
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              <span>Data Final:</span>
              <input
                type="date"
                aria-label="Data Final do Calendário"
                value={dataFim}
                onChange={(e) => onMudarDataFim(e.target.value)}
                className="rounded-lg px-2.5 py-1 text-xs font-mono border"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-strong)',
                  color: 'var(--text-primary)',
                }}
              />
            </label>

            <span className="text-xs font-mono" style={{ color: 'var(--accent-text)' }}>
              Exibindo de <strong>{formatarDataBR(dataInicio)}</strong> até <strong>{formatarDataBR(dataFim)}</strong> ({bpsFiltrados.length} BPs encontrados)
            </span>
          </div>
        </div>
      )}

      {/* Painel Expansível: Comparativo Mês a Mês, Semana a Semana ou 2 Pontos no Calendário */}
      {mostrarComparativo && comparativo && (
        <section
          aria-label="Painel Comparativo de Datas Mês a Mês e Semana a Semana"
          className="rounded-xl border p-3.5 space-y-3"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--accent-primary)',
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4" style={{ color: 'var(--accent-text)' }} />
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>
                  Comparativo de Datas & Evolução (Mês a Mês • Semana a Semana • 2 Pontos no Calendário)
                </h3>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  Selecione dois períodos para comparar volume de BPs, fusos, realizados e carga entre departamentos
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'MES_A_MES', label: 'Mês a Mês (2026)' },
                { id: 'SEMANA_A_SEMANA', label: 'Semana a Semana' },
                { id: 'INTERVALO_LIVRE', label: 'Calendário (Ponto A vs. Ponto B)' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onMudarModoComparativo(m.id)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold border transition"
                  style={{
                    backgroundColor:
                      modoComparativo === m.id ? 'var(--accent-primary)' : 'var(--bg-surface)',
                    borderColor:
                      modoComparativo === m.id ? 'var(--accent-primary)' : 'var(--border-strong)',
                    color: modoComparativo === m.id ? '#FFFFFF' : 'var(--text-secondary)',
                  }}
                >
                  {m.label}
                </button>
              ))}
              <button
                type="button"
                onClick={onAlternarComparativo}
                className="p-1 rounded-lg border"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-muted)',
                }}
                title="Fechar Comparativo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Seletores de Ponto A e Ponto B conforme o modo escolhido */}
          {modoComparativo === 'MES_A_MES' && (
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <label className="flex items-center gap-2 font-bold" style={{ color: 'var(--text-secondary)' }}>
                <span>1º Mês (Ponto A):</span>
                <select
                  aria-label="Selecionar Primeiro Mês para Comparativo"
                  value={mesA}
                  onChange={(e) => onMudarMesA(e.target.value)}
                  className="rounded-lg px-2.5 py-1 text-xs font-bold border"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-strong)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {MESES_2026.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.rotulo}
                    </option>
                  ))}
                </select>
              </label>

              <span className="font-extrabold" style={{ color: 'var(--accent-text)' }}>vs.</span>

              <label className="flex items-center gap-2 font-bold" style={{ color: 'var(--text-secondary)' }}>
                <span>2º Mês (Ponto B):</span>
                <select
                  aria-label="Selecionar Segundo Mês para Comparativo"
                  value={mesB}
                  onChange={(e) => onMudarMesB(e.target.value)}
                  className="rounded-lg px-2.5 py-1 text-xs font-bold border"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-strong)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {MESES_2026.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.rotulo}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {modoComparativo === 'SEMANA_A_SEMANA' && (
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <label className="flex items-center gap-2 font-bold" style={{ color: 'var(--text-secondary)' }}>
                <span>1ª Semana (Ponto A):</span>
                <select
                  aria-label="Selecionar Primeira Semana para Comparativo"
                  value={semanaA}
                  onChange={(e) => onMudarSemanaA(e.target.value)}
                  className="rounded-lg px-2.5 py-1 text-xs font-bold border"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-strong)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {SEMANAS_2026.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.rotulo}
                    </option>
                  ))}
                </select>
              </label>

              <span className="font-extrabold" style={{ color: 'var(--accent-text)' }}>vs.</span>

              <label className="flex items-center gap-2 font-bold" style={{ color: 'var(--text-secondary)' }}>
                <span>2ª Semana (Ponto B):</span>
                <select
                  aria-label="Selecionar Segunda Semana para Comparativo"
                  value={semanaB}
                  onChange={(e) => onMudarSemanaB(e.target.value)}
                  className="rounded-lg px-2.5 py-1 text-xs font-bold border"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-strong)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {SEMANAS_2026.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.rotulo}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {modoComparativo === 'INTERVALO_LIVRE' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div
                className="rounded-lg border p-2.5 flex flex-wrap items-center gap-2"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <strong className="text-sky-400">Ponto A (1º Intervalo):</strong>
                <input
                  type="date"
                  aria-label="Data Inicial Ponto A"
                  value={inicioA}
                  onChange={(e) => onMudarInicioA(e.target.value)}
                  className="rounded px-2 py-1 font-mono border"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border-strong)',
                    color: 'var(--text-primary)',
                  }}
                />
                <span>até</span>
                <input
                  type="date"
                  aria-label="Data Final Ponto A"
                  value={fimA}
                  onChange={(e) => onMudarFimA(e.target.value)}
                  className="rounded px-2 py-1 font-mono border"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border-strong)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div
                className="rounded-lg border p-2.5 flex flex-wrap items-center gap-2"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <strong className="text-emerald-400">Ponto B (2º Intervalo):</strong>
                <input
                  type="date"
                  aria-label="Data Inicial Ponto B"
                  value={inicioB}
                  onChange={(e) => onMudarInicioB(e.target.value)}
                  className="rounded px-2 py-1 font-mono border"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border-strong)',
                    color: 'var(--text-primary)',
                  }}
                />
                <span>até</span>
                <input
                  type="date"
                  aria-label="Data Final Ponto B"
                  value={fimB}
                  onChange={(e) => onMudarFimB(e.target.value)}
                  className="rounded px-2 py-1 font-mono border"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border-strong)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </div>
          )}

          {/* 3 Cards Comparativos Lado a Lado: Ponto A | Ponto B | Variação & Departamentos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Card Ponto A */}
            <div
              className="rounded-xl border p-3 space-y-2"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-sky-400 truncate">
                  Ponto A: {comparativo.pontoA.titulo}
                </span>
                <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                  {comparativo.pontoA.intervaloBR}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-mono font-extrabold" style={{ color: 'var(--text-primary)' }}>
                    {comparativo.pontoA.totalBps} BPs
                  </span>
                  <span className="text-xs font-mono ml-2" style={{ color: 'var(--text-secondary)' }}>
                    ({comparativo.pontoA.totalFusos} fusos)
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-mono">
                <div className="rounded px-2 py-1 border" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-subtle)' }}>
                  <span className="text-emerald-400 font-bold block">Realizados: {comparativo.pontoA.realizadosBps} BPs</span>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{comparativo.pontoA.realizadosFusos} fusos</span>
                </div>
                <div className="rounded px-2 py-1 border" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-subtle)' }}>
                  <span className="text-amber-400 font-bold block">Para Fazer: {comparativo.pontoA.paraFazerBps} BPs</span>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{comparativo.pontoA.paraFazerFusos} fusos</span>
                </div>
              </div>
            </div>

            {/* Card Ponto B */}
            <div
              className="rounded-xl border p-3 space-y-2"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-emerald-400 truncate">
                  Ponto B: {comparativo.pontoB.titulo}
                </span>
                <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                  {comparativo.pontoB.intervaloBR}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-mono font-extrabold" style={{ color: 'var(--text-primary)' }}>
                    {comparativo.pontoB.totalBps} BPs
                  </span>
                  <span className="text-xs font-mono ml-2" style={{ color: 'var(--text-secondary)' }}>
                    ({comparativo.pontoB.totalFusos} fusos)
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-mono">
                <div className="rounded px-2 py-1 border" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-subtle)' }}>
                  <span className="text-emerald-400 font-bold block">Realizados: {comparativo.pontoB.realizadosBps} BPs</span>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{comparativo.pontoB.realizadosFusos} fusos</span>
                </div>
                <div className="rounded px-2 py-1 border" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-subtle)' }}>
                  <span className="text-amber-400 font-bold block">Para Fazer: {comparativo.pontoB.paraFazerBps} BPs</span>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{comparativo.pontoB.paraFazerFusos} fusos</span>
                </div>
              </div>
            </div>

            {/* Card Diferença & Comparativo por Departamento */}
            <div
              className="rounded-xl border p-3 space-y-2"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                  <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                  <span>Resultado do Comparativo (B vs. A)</span>
                </span>
                <span
                  className={`text-xs font-mono font-extrabold px-2 py-0.5 rounded ${
                    comparativo.variacao.deltaBps >= 0
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {comparativo.variacao.deltaBps >= 0
                    ? `+${comparativo.variacao.deltaBps} BPs (+${comparativo.variacao.deltaPctBps}%)`
                    : `${comparativo.variacao.deltaBps} BPs (${comparativo.variacao.deltaPctBps}%)`}
                </span>
              </div>

              <div className="space-y-1 text-[11px] font-mono">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Depto. Manutenção (Laudo):</span>
                  <span style={{ color: 'var(--text-primary)' }}>
                    A: {comparativo.pontoA.etapas.AGUARDANDO_LAUDO} → B: <strong>{comparativo.pontoB.etapas.AGUARDANDO_LAUDO} BPs</strong>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Fila de Croqui (Depto. Projeto):</span>
                  <span style={{ color: 'var(--text-primary)' }}>
                    A: {comparativo.pontoA.etapas.FILA_CROQUI} → B: <strong>{comparativo.pontoB.etapas.FILA_CROQUI} BPs</strong>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Desenho Final (Depto. Projeto):</span>
                  <span style={{ color: 'var(--text-primary)' }}>
                    A: {comparativo.pontoA.etapas.FILA_DESENHO_FINAL} → B: <strong>{comparativo.pontoB.etapas.FILA_DESENHO_FINAL} BPs</strong>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Concluídos no Período:</span>
                  <span className="text-emerald-400 font-bold">
                    A: {comparativo.pontoA.etapas.CONCLUIDO} → B: {comparativo.pontoB.etapas.CONCLUIDO} BPs
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Linha de Evolução Mês a Mês (Desde 01/01/2026) ou Semana a Semana */}
          <div
            className="rounded-xl border p-2.5 space-y-2"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-extrabold" style={{ color: 'var(--text-primary)' }}>
                {modoComparativo === 'SEMANA_A_SEMANA'
                  ? 'Evolução Semana a Semana (Clique em uma semana para comparar)'
                  : 'Evolução Mês a Mês desde 01/01/2026 (Clique em um mês para selecionar no comparativo)'}
              </span>
              <span className="font-mono" style={{ color: 'var(--text-muted)' }}>
                Verde = Realizados · Azul = Em Fila
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-11 gap-1.5">
              {(modoComparativo === 'SEMANA_A_SEMANA'
                ? comparativo.serieSemanal2026
                : comparativo.serieMensal2026
              ).map((item) => {
                const selecionado =
                  modoComparativo === 'SEMANA_A_SEMANA'
                    ? item.id === semanaA || item.id === semanaB
                    : item.id === mesA || item.id === mesB;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (modoComparativo === 'SEMANA_A_SEMANA') {
                        onMudarSemanaA(item.id);
                      } else {
                        onMudarModoComparativo('MES_A_MES');
                        onMudarMesA(item.id);
                      }
                    }}
                    className="rounded-lg border p-1.5 text-left transition"
                    style={{
                      backgroundColor: selecionado ? 'var(--bg-elevated)' : 'var(--bg-subtle)',
                      borderColor: selecionado ? 'var(--accent-primary)' : 'var(--border-subtle)',
                    }}
                  >
                    <span className="text-[10px] font-extrabold block truncate" style={{ color: 'var(--text-primary)' }}>
                      {item.curto}
                    </span>
                    <span className="text-xs font-mono font-extrabold block" style={{ color: 'var(--accent-text)' }}>
                      {item.bps} BPs
                    </span>
                    <span className="text-[9px] font-mono block" style={{ color: 'var(--text-muted)' }}>
                      {item.fusos}f ({item.realizados} OK)
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Modal de Dashboard em PDF & Exportação Formatada (PDF e Excel) */}
      {modalRelatorioAberto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Dashboard Executivo para Exportação em PDF e Excel"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 overflow-y-auto"
        >
          <div
            className="w-full max-w-4xl rounded-2xl border p-4 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-strong)',
              color: 'var(--text-primary)',
            }}
          >
            <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-sky-400 block">
                  Central de Exportação & Análise Final • MECTROL BP
                </span>
                <h2 className="text-base sm:text-lg font-extrabold">
                  Dashboard Executivo em PDF & Planilha Formatada Excel (.XLS)
                </h2>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Período Consolidado: <strong>{periodoDescricao}</strong> • Inclui resumo de BPs realizados, fila por departamento, 10 filiais e comparativo.
                </p>
              </div>

              <button
                type="button"
                onClick={onFecharModalRelatorio}
                className="px-2.5 py-1 rounded-lg border text-xs font-bold"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-strong)',
                  color: 'var(--text-secondary)',
                }}
              >
                Fechar
              </button>
            </div>

            {/* Campo para adicionar observações / anotações de análise final no PDF e Excel */}
            <div className="space-y-1.5">
              <label
                htmlFor="campo-observacoes-pdf"
                className="text-xs font-extrabold block"
                style={{ color: 'var(--text-primary)' }}
              >
                Informações / Observações para Análise Final no PDF e Excel:
              </label>
              <textarea
                id="campo-observacoes-pdf"
                rows={2}
                value={observacoesAnalise}
                onChange={(e) => onMudarObservacoesAnalise(e.target.value)}
                placeholder="Digite observações gerenciais, metas do mês, gargalos resolvidos ou conclusões para incluir no cabeçalho do PDF e do Excel..."
                className="w-full rounded-xl border p-2.5 text-xs"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-strong)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            {/* Prévia Visual do Dashboard PDF */}
            <div
              className="rounded-xl border p-4 space-y-3"
              style={{
                backgroundColor: 'var(--bg-canvas)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <div>
                  <span className="text-xs font-extrabold" style={{ color: 'var(--accent-text)' }}>
                    PRÉVIA DO DASHBOARD EM PDF — MECTROL BP
                  </span>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    Dados prontos para leitura executiva em PDF ou planilha Excel (.xls)
                  </p>
                </div>
                <span className="text-xs font-mono font-bold" style={{ color: 'var(--text-secondary)' }}>
                  {bpsFiltrados.length} BPs listados
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                <div className="rounded-lg border p-2.5" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                  <span className="text-[10px] block" style={{ color: 'var(--text-muted)' }}>TOTAL NO PERÍODO</span>
                  <strong className="text-base font-extrabold text-sky-400">{resumoFluxo.totalBps} BPs</strong>
                  <span className="text-[10px] block" style={{ color: 'var(--text-secondary)' }}>{resumoFluxo.totalFusos} fusos</span>
                </div>
                <div className="rounded-lg border p-2.5" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                  <span className="text-[10px] block" style={{ color: 'var(--text-muted)' }}>REALIZADOS (CONCLUÍDOS)</span>
                  <strong className="text-base font-extrabold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {resumoFluxo.concluidosBps} BPs
                  </strong>
                  <span className="text-[10px] block" style={{ color: 'var(--text-secondary)' }}>{resumoFluxo.concluidosFusos} fusos</span>
                </div>
                <div className="rounded-lg border p-2.5" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                  <span className="text-[10px] block" style={{ color: 'var(--text-muted)' }}>PARA FAZER (EM FILA)</span>
                  <strong className="text-base font-extrabold text-amber-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {resumoFluxo.paraFazerBps} BPs
                  </strong>
                  <span className="text-[10px] block" style={{ color: 'var(--text-secondary)' }}>{resumoFluxo.paraFazerFusos} fusos</span>
                </div>
                <div className="rounded-lg border p-2.5" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                  <span className="text-[10px] block" style={{ color: 'var(--text-muted)' }}>COMPARATIVO (B vs. A)</span>
                  <strong className="text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>
                    {comparativo.variacao.deltaBps >= 0 ? `+${comparativo.variacao.deltaBps}` : comparativo.variacao.deltaBps} BPs
                  </strong>
                  <span className="text-[10px] block" style={{ color: 'var(--text-secondary)' }}>
                    {comparativo.pontoA.titulo} vs {comparativo.pontoB.titulo}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] font-mono">
                <div className="rounded border p-2" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="text-red-400 font-bold block">Laudo (Depto. Manut.)</span>
                  <span>{resumoFluxo.etapas.AGUARDANDO_LAUDO.bps} BPs ({resumoFluxo.etapas.AGUARDANDO_LAUDO.fusos}f)</span>
                </div>
                <div className="rounded border p-2" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="text-orange-400 font-bold block">Fila de Croqui</span>
                  <span>{resumoFluxo.etapas.FILA_CROQUI.bps} BPs ({resumoFluxo.etapas.FILA_CROQUI.fusos}f)</span>
                </div>
                <div className="rounded border p-2" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="text-sky-400 font-bold block">Desenho Final</span>
                  <span>{resumoFluxo.etapas.FILA_DESENHO_FINAL.bps} BPs ({resumoFluxo.etapas.FILA_DESENHO_FINAL.fusos}f)</span>
                </div>
                <div className="rounded border p-2" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="text-yellow-400 font-bold block">Depto. Manutenção</span>
                  <span>{resumoFluxo.etapas.EM_MANUTENCAO.bps} BPs ({resumoFluxo.etapas.EM_MANUTENCAO.fusos}f)</span>
                </div>
                <div className="rounded border p-2" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="text-emerald-400 font-bold block">Concluídos</span>
                  <span>{resumoFluxo.etapas.CONCLUIDO.bps} BPs ({resumoFluxo.etapas.CONCLUIDO.fusos}f)</span>
                </div>
              </div>
            </div>

            {/* Botões de Download Formatado em PDF e Excel */}
            <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onExportarExcel}
                className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 transition inline-flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Baixar Arquivo Excel Formatado (.XLS)</span>
                <Download className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={onExportarPDF}
                className="px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-sky-600 hover:bg-sky-500 transition inline-flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>Baixar Dashboard em PDF (.PDF)</span>
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
