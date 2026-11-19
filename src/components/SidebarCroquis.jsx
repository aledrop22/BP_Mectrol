import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Activity,
  GanttChartSquare,
  BarChart3,
  Ruler,
  ShieldAlert,
  Building2,
  Sun,
  Moon,
} from 'lucide-react';
import { PALETAS_TEMAS } from '../data/temas';

export const MODELOS_DASHBOARD = [
  {
    id: 'DASH_1',
    curto: 'Gestão à Vista & Fluxo',
    sub: '6 Etapas, Gargalos e Status',
    nome: 'Gestão à Vista & Gargalos (Ref. BP Dash 1)',
    origem: 'BP Dash 1',
    icon: Activity,
  },
  {
    id: 'DASH_2',
    curto: 'Gantt de Prazos & Filial',
    sub: 'Cronograma D1–D15 e Limite',
    nome: 'Gantt de Fluxo por Filial & Prazo (Ref. BP Dash 2)',
    origem: 'BP Dash 2',
    icon: GanttChartSquare,
  },
  {
    id: 'DASH_3',
    curto: 'BI Volume & Metas',
    sub: 'Realizados vs. Para Fazer',
    nome: 'Volume por Filial & Realizado vs. A Fazer (Ref. BP Dash 3)',
    origem: 'BP Dash 3',
    icon: BarChart3,
  },
  {
    id: 'AUTORAL_1',
    curto: 'Fluxo de Departamentos',
    sub: 'Depto. Manutenção → Depto. Projeto',
    nome: 'Fluxo Operacional: Depto. Manutenção → Fila de Croqui (Depto. Projeto) → Desenho Final (Depto. Projeto)',
    origem: 'Depto. Projeto',
    icon: Ruler,
  },
  {
    id: 'AUTORAL_2',
    curto: 'Fila, Diretoria & Férias',
    sub: 'Prioridades e Fura-Fila #1',
    nome: 'Simulador de Fila, Fura-Fila Diretoria & Férias',
    origem: 'Prioridades',
    icon: ShieldAlert,
  },
  {
    id: 'AUTORAL_3',
    curto: '10 Filiais & 5 Etapas',
    sub: 'Depto. Comercial e Departamentos',
    nome: 'Banco das 10 Filiais (Depto. Comercial) e 5 Etapas por Departamento',
    origem: '10 Filiais & Etapas',
    icon: Building2,
  },
];

export default function SidebarCroquis({
  recolhido,
  onAlternarRecolhido,
  modeloAtivo,
  onMudarModelo,
  paletaId,
  modoCor,
  onSelecionarPaleta,
  onAlternarChavinhaDarkWhite,
}) {
  return (
    <aside
      aria-label="Menu Lateral Recolhível de Navegação e Temas"
      className={`shrink-0 lg:h-full lg:overflow-y-auto border-b lg:border-b-0 lg:border-r transition-all duration-200 flex flex-col justify-between ${
        recolhido ? 'w-full lg:w-16' : 'w-full lg:w-64'
      }`}
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      {/* Parte Superior: Setinha de Recolher/Expandir + Os 6 Ícones com os Nomes na frente quando aberto */}
      <div className="p-2.5 space-y-2.5">
        {/* Topo do Sidebar Fixo: Cabeçalho + Setinha de Recolher / Expandir */}
        <div
          className={`flex items-center ${
            recolhido ? 'justify-between lg:justify-center' : 'justify-between'
          } pb-2 border-b`}
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          {!recolhido && (
            <div className="px-1 min-w-0">
              <span
                className="text-[10px] font-bold uppercase tracking-wider block truncate"
                style={{ color: 'var(--accent-text)' }}
              >
                Navegação MECTROL BP
              </span>
              <span
                className="text-xs font-extrabold block truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                Painéis do Sistema
              </span>
            </div>
          )}

          <button
            type="button"
            role="switch"
            aria-checked={!recolhido}
            aria-label="Chavinha do Sidebar: Recolher ou Expandir Nomes dos Ícones"
            onClick={onAlternarRecolhido}
            className="p-1.5 rounded-lg border transition hover:opacity-90 flex items-center justify-center shrink-0"
            style={{
              backgroundColor: 'var(--accent-primary)',
              borderColor: 'var(--accent-primary)',
              color: '#FFFFFF',
            }}
            title={
              recolhido
                ? 'Expandir Sidebar (mostrar nomes na frente dos ícones)'
                : 'Recolher Sidebar (mostrar apenas os 6 ícones)'
            }
          >
            {recolhido ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Os 6 Ícones no Topo (com os nomes na frente quando aberto, ou só ícones quando recolhido) */}
        <nav
          aria-label="Visões do Sistema"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1.5"
        >
          {MODELOS_DASHBOARD.map((mod) => {
            const Icon = mod.icon;
            const ativo = modeloAtivo === mod.id;
            return (
              <button
                key={mod.id}
                type="button"
                aria-label={mod.nome}
                onClick={() => onMudarModelo(mod.id)}
                className={`rounded-xl border transition flex items-center ${
                  recolhido
                    ? 'justify-center p-2.5'
                    : 'justify-start gap-2.5 px-3 py-2 text-left'
                }`}
                style={{
                  backgroundColor: ativo
                    ? 'var(--accent-primary)'
                    : 'transparent',
                  borderColor: ativo
                    ? 'var(--accent-primary)'
                    : 'transparent',
                  color: ativo ? '#FFFFFF' : 'var(--text-primary)',
                }}
                title={mod.nome}
              >
                <Icon
                  className="w-4 h-4 shrink-0"
                  style={{
                    color: ativo ? '#FFFFFF' : 'var(--accent-text)',
                  }}
                />
                {!recolhido && (
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-extrabold block truncate">
                      {mod.curto}
                    </span>
                    <span
                      className="text-[10px] block truncate opacity-80"
                      style={{
                        color: ativo ? '#E2E8F0' : 'var(--text-secondary)',
                      }}
                    >
                      {mod.sub}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Seletor Discreto em 1 Linha x 3 Colunas: Dark 1 | Dark 2 | White 1 */}
        <div
          className="pt-2 border-t"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          {recolhido ? (
            <button
              type="button"
              role="switch"
              aria-checked={modoCor === 'light'}
              aria-label="Chavinha Dark ou White"
              onClick={onAlternarChavinhaDarkWhite}
              className="w-full rounded-xl border p-2.5 transition flex items-center justify-center"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-strong)',
                color: 'var(--text-primary)',
              }}
              title="Alternar entre Dark e White"
            >
              {modoCor === 'dark' ? (
                <Moon className="w-4 h-4 text-sky-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
            </button>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {PALETAS_TEMAS.map((t) => {
                const selecionado = paletaId === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onSelecionarPaleta(t.id)}
                    className="py-1.5 px-1.5 rounded-lg border text-[11px] font-extrabold transition flex items-center justify-center gap-1 whitespace-nowrap"
                    style={{
                      backgroundColor: selecionado
                        ? 'var(--accent-primary)'
                        : 'var(--bg-subtle)',
                      borderColor: selecionado
                        ? 'var(--accent-primary)'
                        : 'var(--border-subtle)',
                      color: selecionado ? '#FFFFFF' : 'var(--text-secondary)',
                    }}
                    title={t.nome}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0 border"
                      style={{
                        backgroundColor: t.swatchPrimary,
                        borderColor: selecionado ? '#FFFFFF' : t.swatchAccent,
                      }}
                    />
                    <span>{t.curto}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
