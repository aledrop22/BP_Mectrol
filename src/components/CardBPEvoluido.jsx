import React from 'react';
import {
  Copy,
  Check,
  ShieldAlert,
  CheckCircle2,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { DIAMETROS, PASSOS } from '../data/dados';
import {
  gerarNomePastaPadrao,
  obterStatusMonitoramentoManutencao,
} from '../lib/filaEngine';

export default function CardBPEvoluido({
  item,
  posicaoGeral,
  posicaoNaFaixa,
  pessoasNaFrenteNaFaixa,
  vendedoresDaFilial,
  copiadoId,
  onCopiarPasta,
  onAtualizarCampo,
  onAlterarPrioridadeRapida,
  onAlternarConcluidoDesenho,
}) {
  const nomePasta = gerarNomePastaPadrao(item);
  const histManut = obterStatusMonitoramentoManutencao(item);
  const isConcluido = item.status === 'Concluído';

  const configPrioridade = {
    ALTA: {
      texto: 'Alta',
      corTexto: 'text-amber-600 dark:text-amber-400 font-semibold',
      corBarra: '#F59E0B',
    },
    MEDIA: {
      texto: 'Média',
      corTexto: 'text-sky-600 dark:text-sky-400 font-semibold',
      corBarra: '#0EA5E9',
    },
    BAIXA: {
      texto: 'Baixa',
      corTexto: 'text-emerald-600 dark:text-emerald-400 font-semibold',
      corBarra: '#10B981',
    },
  }[item.prioridade || 'MEDIA'];

  const corHistTexto =
    histManut.cor === 'emerald'
      ? 'text-emerald-600 dark:text-emerald-400'
      : histManut.cor === 'sky'
      ? 'text-sky-600 dark:text-sky-400'
      : 'text-amber-600 dark:text-amber-400';

  return (
    <article
      data-testid={`bp-card-${item.bp}`}
      className="rounded-lg border transition-all flex flex-col justify-between overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: item.diretoriaOverride
          ? '#EF4444'
          : isConcluido
          ? '#10B981'
          : 'var(--border-subtle)',
      }}
    >
      {/* Barra superior fina de prioridade */}
      <div
        className="h-1 w-full"
        style={{
          backgroundColor: isConcluido
            ? '#10B981'
            : item.diretoriaOverride
            ? '#EF4444'
            : configPrioridade?.corBarra || 'var(--accent-primary)',
        }}
      />

      <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
        {/* 1. Topo enxuto: Posição + BP + Cliente + Prioridade */}
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center flex-wrap gap-1 text-[11px] font-mono tabular-nums" style={{ color: 'var(--text-muted)' }}>
                <span className="font-bold" style={{ color: 'var(--accent-text)' }}>
                  {isConcluido ? 'CONCLUÍDO' : `#${posicaoGeral}º Fila`}
                </span>
                <span aria-hidden="true">·</span>
                {item.diretoriaOverride ? (
                  <span className="text-rose-600 dark:text-rose-400 font-bold">
                    Topo Diretoria (#1)
                  </span>
                ) : (
                  <span className={configPrioridade?.corTexto}>
                    {posicaoNaFaixa}º {configPrioridade?.texto} ({pessoasNaFrenteNaFaixa === 0 ? '1º' : `${pessoasNaFrenteNaFaixa} antes`})
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1.5 mt-0.5 min-w-0">
                <h3 className="text-base font-extrabold font-mono tabular-nums shrink-0" style={{ color: 'var(--text-primary)' }}>
                  BP #{item.bp}
                </h3>
                <span className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }} title={item.cliente}>
                  · {item.cliente}
                </span>
              </div>
            </div>

            <select
              aria-label={`Alterar prioridade do BP ${item.bp}`}
              value={item.prioridade || 'MEDIA'}
              onChange={(e) => onAlterarPrioridadeRapida(item.bp, e.target.value)}
              className="rounded px-1.5 py-0.5 text-[11px] font-semibold border cursor-pointer shrink-0"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-strong)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="ALTA">Prio: Alta</option>
              <option value="MEDIA">Prio: Média</option>
              <option value="BAIXA">Prio: Baixa</option>
            </select>
          </div>

          {/* 2. Dados essenciais: NF · Quantidade · Motivo do Recebimento */}
          <div
            className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-mono tabular-nums pt-0.5"
            style={{ color: 'var(--text-secondary)' }}
          >
            <span>NF: <strong>{item.nf}</strong></span>
            <span aria-hidden="true">·</span>
            <span className="font-bold" style={{ color: 'var(--accent-text)' }}>
              Qtd: {item.quantidade || 1} {Number(item.quantidade) > 1 ? 'pçs' : 'pç'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-sans font-semibold" style={{ color: 'var(--text-primary)' }}>
              {item.motivoRecebimento || 'Manutenção'}
            </span>
          </div>

          {/* 3. Filial Responsável + Vendedor (vinculado à filial) */}
          <div className="flex items-center justify-between gap-2 text-[11px] pt-0.5" style={{ color: 'var(--text-muted)' }}>
            <span className="truncate font-medium" style={{ color: 'var(--text-secondary)' }}>
              {item.filial}
            </span>
            <select
              aria-label={`Vendedor da filial para BP ${item.bp}`}
              value={item.vendedor}
              onChange={(e) => onAtualizarCampo(item.bp, 'vendedor', e.target.value)}
              className="rounded px-1.5 py-0.5 text-[11px] border max-w-[145px] truncate"
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-secondary)',
              }}
              title="Trocar vendedor responsável dentro desta filial (ex: férias)"
            >
              {vendedoresDaFilial.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {item.diretoriaOverride && (
            <div className="rounded px-2 py-1 bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <ShieldAlert className="w-3 h-3 shrink-0" />
              <span className="truncate font-semibold">
                Diretoria #1: {item.diretoriaMotivo}
              </span>
            </div>
          )}
        </div>

        {/* 4. Monitoramento Enxuto do Histórico da Manutenção (Início Difuso / Fim Final / Etapa 6->7) */}
        <div
          className="rounded p-2 border text-[11px] space-y-1"
          style={{
            backgroundColor: 'var(--bg-subtle)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="flex items-center justify-between gap-1">
            <span className={`font-bold flex items-center gap-1 ${corHistTexto}`}>
              <Clock className="w-3 h-3 shrink-0" />
              <span>{histManut.curto}</span>
            </span>
            <span className="font-mono tabular-nums" style={{ color: 'var(--text-muted)' }}>
              {item.status === 'Atrasada' ? `Atraso ${item.atraso}h` : item.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-0.5 font-mono text-[10px] tabular-nums" style={{ color: 'var(--text-secondary)' }}>
            <div className="truncate" title="Data/hora de início do Laudo de Manutenção de Fuso">
              <span style={{ color: 'var(--text-muted)' }}>Laudo Fuso: </span>
              <strong>{item.laudoDifusoInicio || 'Aguard. 6ª→7ª'}</strong>
            </div>
            <div className="truncate" title="Data/hora de fechamento do Laudo Manutenção Final">
              <span style={{ color: 'var(--text-muted)' }}>Laudo Final: </span>
              <strong>{item.laudoFinalConclusao || 'Pendente'}</strong>
            </div>
          </div>
        </div>

        {/* 5. Medidas do Fuso + Copiar .ZIP + Concluir na mesma estrutura compacta */}
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center gap-1 text-[11px] font-mono">
            <span className="text-[10px] font-sans" style={{ color: 'var(--text-muted)' }}>Fuso:</span>
            <select
              aria-label={`Diâmetro do BP ${item.bp}`}
              value={item.diametro}
              onChange={(e) => onAtualizarCampo(item.bp, 'diametro', e.target.value)}
              className="rounded px-1 py-0.5 text-[11px] border"
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
            <span style={{ color: 'var(--text-muted)' }}>×</span>
            <select
              aria-label={`Passo do BP ${item.bp}`}
              value={item.passo}
              onChange={(e) => onAtualizarCampo(item.bp, 'passo', e.target.value)}
              className="rounded px-1 py-0.5 text-[11px] border"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-strong)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="">P</option>
              {PASSOS.filter(Boolean).map((p) => (
                <option key={p} value={p}>P{p}</option>
              ))}
            </select>
            <span style={{ color: 'var(--text-muted)' }}>×</span>
            <input
              type="text"
              aria-label={`Comprimento total do BP ${item.bp}`}
              placeholder="Comp"
              value={item.compTotal}
              onChange={(e) => onAtualizarCampo(item.bp, 'compTotal', e.target.value)}
              className="rounded px-1.5 py-0.5 text-[11px] border w-14 tabular-nums"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-strong)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div className="flex items-center gap-1.5">
            <div
              className="flex-1 min-w-0 flex items-center justify-between gap-1.5 rounded px-2 py-1 border"
              style={{
                backgroundColor: 'var(--bg-canvas)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <span
                className="text-[11px] font-mono truncate tabular-nums"
                style={{ color: 'var(--text-secondary)' }}
                title={nomePasta}
              >
                {nomePasta}
              </span>
              <button
                type="button"
                onClick={() => onCopiarPasta(item)}
                className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded text-white transition whitespace-nowrap shrink-0"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              >
                {copiadoId === item.bp ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => onAlternarConcluidoDesenho(item.bp)}
              title={isConcluido ? 'Reabrir BP na fila' : 'Marcar croqui como Concluído'}
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded border transition whitespace-nowrap shrink-0 ${
                isConcluido
                  ? 'text-amber-600 dark:text-amber-400 border-amber-500/40 hover:bg-amber-500/10'
                  : 'text-emerald-600 dark:text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/10'
              }`}
            >
              {isConcluido ? (
                <>
                  <RotateCcw className="w-3 h-3" />
                  <span>Reabrir</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Concluir</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
