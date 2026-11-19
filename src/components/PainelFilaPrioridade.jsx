import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Users,
  CheckCircle2,
  ListOrdered,
} from 'lucide-react';
import { calcularPosicaoNaFila } from '../lib/filaEngine';

export default function PainelFilaPrioridade({
  bps,
  onConfirmarPrioridade,
  onAbrirModalFuraFila,
}) {
  const bpsAtivos = useMemo(
    () => bps.filter((item) => item.status !== 'Concluído'),
    [bps]
  );

  const [bpSelecionado, setBpSelecionado] = useState(
    bpsAtivos.find((b) => b.bp === '54680')?.bp || bpsAtivos[0]?.bp || ''
  );
  const [prioridadeSimulada, setPrioridadeSimulada] = useState('ALTA');
  const [feedbackConfirmacao, setFeedbackConfirmacao] = useState(null);

  const itemAtual = useMemo(
    () => bps.find((b) => String(b.bp) === String(bpSelecionado)) || bpsAtivos[0],
    [bps, bpSelecionado, bpsAtivos]
  );

  const simulacaoPorFaixa = useMemo(() => {
    const alvo = itemAtual?.bp || '';
    return {
      ALTA: calcularPosicaoNaFila(bps, alvo, 'ALTA'),
      MEDIA: calcularPosicaoNaFila(bps, alvo, 'MEDIA'),
      BAIXA: calcularPosicaoNaFila(bps, alvo, 'BAIXA'),
    };
  }, [bps, itemAtual]);

  const simulacaoAtiva = simulacaoPorFaixa[prioridadeSimulada] || simulacaoPorFaixa.ALTA;

  const handleConfirmarNaFila = (e) => {
    e.preventDefault();
    if (!itemAtual) return;
    onConfirmarPrioridade(itemAtual.bp, prioridadeSimulada, itemAtual.vendedor);
    setFeedbackConfirmacao({
      bp: itemAtual.bp,
      prioridade: prioridadeSimulada,
      posicaoNaFaixa: simulacaoAtiva.posicaoNaFaixa,
      posicaoGeral: simulacaoAtiva.posicaoGeral,
    });
    setTimeout(() => setFeedbackConfirmacao(null), 4000);
  };

  return (
    <section
      aria-label="Simulador e Enfileirador Inteligente de Prioridades"
      className="rounded-xl border p-4 transition-colors"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <form onSubmit={handleConfirmarNaFila} className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-center">
        {/* 1. Seleção do BP */}
        <div className="lg:col-span-3 space-y-1">
          <label
            htmlFor="select-bp-fila"
            className="flex items-center gap-1.5 text-xs font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            <ListOrdered className="w-3.5 h-3.5" style={{ color: 'var(--accent-text)' }} />
            <span>Simular / Ordenar BP na Fila:</span>
          </label>
          <select
            id="select-bp-fila"
            value={itemAtual?.bp || ''}
            onChange={(e) => setBpSelecionado(e.target.value)}
            className="w-full rounded-lg px-2.5 py-2 text-xs font-mono font-semibold border"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-strong)',
              color: 'var(--text-primary)',
            }}
          >
            {bpsAtivos.map((b) => (
              <option key={b.bp} value={b.bp}>
                BP #{b.bp} — {b.cliente} (Qtd: {b.quantidade || 1} · {b.vendedor})
              </option>
            ))}
          </select>
        </div>

        {/* 2. Botões das 3 Faixas (Alta, Média, Baixa) */}
        <div className="lg:col-span-4 grid grid-cols-3 gap-2">
          {[
            { id: 'ALTA', titulo: 'Alta', corTexto: 'text-amber-600 dark:text-amber-400', borda: '#F59E0B' },
            { id: 'MEDIA', titulo: 'Média', corTexto: 'text-sky-600 dark:text-sky-400', borda: '#0EA5E9' },
            { id: 'BAIXA', titulo: 'Baixa', corTexto: 'text-emerald-600 dark:text-emerald-400', borda: '#10B981' },
          ].map((faixa) => {
            const dados = simulacaoPorFaixa[faixa.id];
            const ativo = prioridadeSimulada === faixa.id;
            return (
              <button
                key={faixa.id}
                type="button"
                onClick={() => setPrioridadeSimulada(faixa.id)}
                className="rounded-lg p-2 border text-left transition-all"
                style={{
                  backgroundColor: ativo ? 'var(--bg-elevated)' : 'var(--bg-subtle)',
                  borderColor: ativo ? faixa.borda : 'var(--border-subtle)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${faixa.corTexto}`}>
                    Prio {faixa.titulo}
                  </span>
                </div>
                <div className="text-sm font-mono font-extrabold tabular-nums mt-0.5" style={{ color: 'var(--text-primary)' }}>
                  {dados.pessoasNaFrenteNaFaixa === 0 ? '1º fila' : `${dados.pessoasNaFrenteNaFaixa} na frente`}
                </div>
                <div className="text-[10px] font-mono tabular-nums" style={{ color: 'var(--text-muted)' }}>
                  Entra em {dados.posicaoNaFaixa}º
                </div>
              </button>
            );
          })}
        </div>

        {/* 3. Mensagem em tempo real da fila + Botão Confirmar */}
        <div className="lg:col-span-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div
            data-testid="live-queue-position-banner"
            className="flex-1 rounded-lg p-2.5 border text-xs"
            style={{
              backgroundColor: 'var(--accent-soft)',
              borderColor: 'var(--accent-primary)',
            }}
          >
            <p className="font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>
              {simulacaoAtiva.mensagemPrincipal}
            </p>
            <p className="text-[11px] font-mono tabular-nums mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Fila geral: <strong>#{simulacaoAtiva.posicaoGeral}º</strong> ({simulacaoAtiva.pessoasNaFrenteGeral} antes no total)
              {feedbackConfirmacao && (
                <span className="ml-2 text-emerald-600 dark:text-emerald-400 font-bold">
                  ✓ Salvo ({feedbackConfirmacao.posicaoNaFaixa}º)
                </span>
              )}
            </p>
          </div>

          <div className="flex sm:flex-col gap-1.5 shrink-0">
            <button
              type="submit"
              className="flex-1 py-2 px-3 rounded-lg text-xs font-bold text-white transition flex items-center justify-center gap-1.5 whitespace-nowrap"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Enfileirar ({prioridadeSimulada})</span>
            </button>
            <button
              type="button"
              onClick={() => itemAtual && onAbrirModalFuraFila(itemAtual)}
              className="py-1.5 px-2.5 rounded-lg text-[11px] font-semibold border transition flex items-center justify-center gap-1 whitespace-nowrap"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-strong)',
                color: 'var(--text-secondary)',
              }}
            >
              <ShieldAlert className="w-3 h-3 text-rose-500" />
              <span>Anexar E-mail Diretoria</span>
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
