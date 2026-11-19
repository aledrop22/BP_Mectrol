import React, { useState, useMemo } from 'react';
import {
  Search,
  ShieldAlert,
  ArrowUpCircle,
  CheckCircle2,
  Clock,
  MailCheck,
} from 'lucide-react';
import { obterStatusMonitoramentoManutencao } from '../lib/filaEngine';

export default function PipelineDiretoriaRapido({
  bps,
  mapaPosicoes,
  onAprovarFuraFilaDireto,
}) {
  const [termoBp, setTermoBp] = useState('');
  const [motivoDiretoria, setMotivoDiretoria] = useState(
    'Vendedor entrou em contato com a Diretoria — autorizado passar na frente da fila (#1).'
  );

  const resultadosBusca = useMemo(() => {
    const t = termoBp.trim().toLowerCase();
    const ativos = bps.filter((b) => b.status !== 'Concluído');
    if (!t) return ativos.slice(0, 6);
    return ativos.filter(
      (b) =>
        b.bp.toLowerCase().includes(t) ||
        b.cliente.toLowerCase().includes(t) ||
        b.nf.toLowerCase().includes(t) ||
        b.vendedor.toLowerCase().includes(t)
    );
  }, [bps, termoBp]);

  const aprovadosDiretoria = useMemo(
    () => bps.filter((b) => b.diretoriaOverride && b.status !== 'Concluído'),
    [bps]
  );

  return (
    <section
      aria-label="Pipeline Rápido da Diretoria para Consulta e Liberação por BP"
      className="space-y-5"
    >
      {/* Busca Rápida por BP (O vendedor ligou -> Diretoria digita o BP e aprova na hora) */}
      <div
        className="rounded-xl border p-5 space-y-4"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-4 h-4" />
              <span>Pipeline Rápido da Diretoria • Liberação Instantânea por Número de BP</span>
            </div>
            <h2 className="text-base font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>
              Digite o BP solicitado pelo vendedor para consultar e subir para #1 da fila
            </h2>
          </div>

          <div className="text-xs font-mono tabular-nums" style={{ color: 'var(--text-muted)' }}>
            Fura-Filas Ativos da Diretoria: <strong className="text-rose-600 dark:text-rose-400">{aprovadosDiretoria.length}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              aria-label="Digite o número do BP para busca rápida da Diretoria"
              placeholder="Digite o nº do BP (ex: 54528, 54680) ou Cliente..."
              value={termoBp}
              onChange={(e) => setTermoBp(e.target.value)}
              className="w-full rounded-lg pl-10 pr-4 py-2.5 text-sm font-mono border focus:outline-none"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-strong)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div className="md:col-span-7">
            <input
              type="text"
              aria-label="Observação de aprovação da Diretoria"
              placeholder="Justificativa / Alinhamento com o vendedor..."
              value={motivoDiretoria}
              onChange={(e) => setMotivoDiretoria(e.target.value)}
              className="w-full rounded-lg px-3.5 py-2.5 text-xs border"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-strong)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>

        {/* Resultado Imediato do BP Digitado */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {resultadosBusca.map((item) => {
            const pos = mapaPosicoes[item.bp] || { posicaoGeral: '-' };
            const hist = obterStatusMonitoramentoManutencao(item);
            return (
              <div
                key={item.bp}
                className="rounded-lg border p-3.5 flex flex-col justify-between gap-2.5"
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  borderColor: item.diretoriaOverride ? '#F43F5E' : 'var(--border-subtle)',
                }}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                    <span className="font-bold" style={{ color: 'var(--accent-text)' }}>
                      Fila Atual: #{pos.posicaoGeral}º ({item.prioridade})
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      Qtd: <strong>{item.quantidade || 1} pç</strong> · {item.motivoRecebimento}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-base font-extrabold font-mono" style={{ color: 'var(--text-primary)' }}>
                      BP #{item.bp} · {item.cliente}
                    </h3>
                    <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                      NF {item.nf}
                    </span>
                  </div>

                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {item.filial} · Vendedor: <strong>{item.vendedor}</strong>
                  </p>
                  <p className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                    {hist.curto} ({hist.detalhe})
                  </p>
                </div>

                {item.diretoriaOverride ? (
                  <div className="px-3 py-1.5 rounded bg-rose-500/15 border border-rose-500/30 text-xs font-bold text-rose-600 dark:text-rose-400 text-center">
                    Já está no Topo #1 (Aprovado pela Diretoria)
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      onAprovarFuraFilaDireto(item.bp, {
                        autorizador: 'Diretoria Executiva',
                        motivo: motivoDiretoria,
                        emailComprovante: 'Aprovação Direta via Busca Rápida de BP',
                        perfilAtivo: 'DIRETORIA',
                      })
                    }
                    className="w-full py-2 px-3 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition flex items-center justify-center gap-1.5"
                  >
                    <ArrowUpCircle className="w-3.5 h-3.5" />
                    <span>Passar BP #{item.bp} na Frente de Todos (#1)</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
