import React, { useState } from 'react';
import {
  Building2,
  Users,
  ArrowRightLeft,
  UserPlus,
  CheckCircle2,
} from 'lucide-react';

export default function PainelFiliaisVendedores({
  filiaisDb,
  bps,
  onMesclarFerias,
  onAdicionarVendedorFilial,
  onAtualizarEquipeFilial,
  onFiltrarPorFilialEVendedor,
}) {
  const [filialSelecionada, setFilialSelecionada] = useState(filiaisDb[1]?.codigo || '03.04');
  const [vendedorSaindo, setVendedorSaindo] = useState('Vanessa Santos');
  const [vendedorCobrindo, setVendedorCobrindo] = useState('Rafael Oliveira');
  const [novoVendedorNome, setNovoVendedorNome] = useState('');
  const [novoVendedorCargo, setNovoVendedorCargo] = useState('Depto. Comercial • Consultor');
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  const filialObj =
    filiaisDb.find((f) => f.codigo === filialSelecionada) || filiaisDb[0];

  const handleTrocarFilialForm = (cod) => {
    setFilialSelecionada(cod);
    const f = filiaisDb.find((item) => item.codigo === cod);
    if (f && f.vendedores.length >= 2) {
      setVendedorSaindo(f.vendedores[0].nome);
      setVendedorCobrindo(f.vendedores[1].nome);
    }
  };

  const handleExecutarMesclagem = (e) => {
    e.preventDefault();
    if (!vendedorSaindo || !vendedorCobrindo || vendedorSaindo === vendedorCobrindo) return;
    onMesclarFerias(filialSelecionada, vendedorSaindo, vendedorCobrindo);
    setMensagemSucesso(
      `Carteira da filial ${filialObj.nome} (Depto. Comercial) atualizada: BPs de ${vendedorSaindo} transferidos para ${vendedorCobrindo}.`
    );
    setTimeout(() => setMensagemSucesso(''), 5000);
  };

  const handleCriarVendedor = (e) => {
    e.preventDefault();
    if (!novoVendedorNome.trim()) return;
    onAdicionarVendedorFilial(filialSelecionada, novoVendedorNome.trim(), novoVendedorCargo.trim());
    setMensagemSucesso(
      `Vendedor ${novoVendedorNome.trim()} cadastrado no Depto. Comercial da filial ${filialObj.nome}.`
    );
    setNovoVendedorNome('');
    setTimeout(() => setMensagemSucesso(''), 5000);
  };

  return (
    <section
      aria-label="Banco de Dados de 10 Filiais Responsáveis, Supervisores, Assistentes e Vendedores Vinculados"
      className="space-y-5"
    >
      {/* Resumo das 10 Filiais com Depto. Comercial, Supervisor/Coordenador, Assistente e Vendedores */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
        {filiaisDb.map((filial) => {
          const bpsFilial = bps.filter(
            (b) => b.filial.includes(filial.codigo) && b.status !== 'Concluído'
          );
          return (
            <div
              key={filial.codigo}
              className="rounded-xl border p-3.5 space-y-2.5 flex flex-col justify-between"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-mono font-bold" style={{ color: 'var(--accent-text)' }}>
                    Cód. {filial.codigo}
                  </span>
                  <span className="text-[11px] font-mono tabular-nums" style={{ color: 'var(--text-muted)' }}>
                    {bpsFilial.length} BPs ativos
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-extrabold truncate" style={{ color: 'var(--text-primary)' }}>
                    {filial.curto} ({filial.cidade})
                  </h3>
                  <span className="text-[10px] font-bold block truncate" style={{ color: 'var(--accent-text)' }}>
                    {filial.regional?.startsWith('Depto.') ? filial.regional : `Depto. ${filial.regional || 'Comercial'}`}
                  </span>
                </div>

                {/* Supervisor / Coordenador e Assistente Vinculados ao Depto. Comercial (Editáveis) */}
                <div
                  className="rounded-lg p-2 space-y-1 border text-[11px]"
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    borderColor: 'var(--border-subtle)',
                  }}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      Depto. Comercial (Sup.):
                    </span>
                    {onAtualizarEquipeFilial ? (
                      <input
                        type="text"
                        aria-label={`Supervisor da filial ${filial.curto}`}
                        value={filial.coordenador}
                        onChange={(e) =>
                          onAtualizarEquipeFilial(filial.codigo, 'coordenador', e.target.value)
                        }
                        className="text-right font-semibold bg-transparent border-b border-transparent focus:border-sky-500 outline-none w-28 truncate"
                        style={{ color: 'var(--text-primary)' }}
                      />
                    ) : (
                      <span className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        {filial.coordenador}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      Depto. Comercial (Assist.):
                    </span>
                    {onAtualizarEquipeFilial ? (
                      <input
                        type="text"
                        aria-label={`Assistente da filial ${filial.curto}`}
                        value={filial.assistente || ''}
                        onChange={(e) =>
                          onAtualizarEquipeFilial(filial.codigo, 'assistente', e.target.value)
                        }
                        className="text-right font-semibold bg-transparent border-b border-transparent focus:border-sky-500 outline-none w-28 truncate"
                        style={{ color: 'var(--text-secondary)' }}
                      />
                    ) : (
                      <span className="font-semibold truncate" style={{ color: 'var(--text-secondary)' }}>
                        {filial.assistente}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
                  Depto. Comercial • Vendedores ({filial.vendedores.length})
                </span>
                {filial.vendedores.map((vend) => {
                  const qtdBpsVendedor = bpsFilial.filter((b) => b.vendedor === vend.nome).length;
                  return (
                    <div
                      key={vend.id}
                      className="flex items-center justify-between gap-1.5 rounded px-2 py-1 border text-[11px]"
                      style={{
                        backgroundColor: 'var(--bg-subtle)',
                        borderColor: 'var(--border-subtle)',
                      }}
                    >
                      <div className="min-w-0">
                        <div className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                          {vend.nome}
                        </div>
                        <div className="text-[9px] truncate" style={{ color: 'var(--text-muted)' }}>
                          {vend.cargo?.startsWith('Depto.') ? vend.cargo : `Depto. Comercial • ${vend.cargo || 'Vendas'}`}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onFiltrarPorFilialEVendedor(filial.codigo, vend.nome)}
                        className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold border whitespace-nowrap shrink-0 hover:opacity-85"
                        style={{
                          backgroundColor: 'var(--bg-elevated)',
                          borderColor: 'var(--border-strong)',
                          color: 'var(--accent-text)',
                        }}
                      >
                        {qtdBpsVendedor} BPs
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Painel de Cobertura de Férias / Mesclagem de Carteira dentro da Filial */}
      <div
        className="rounded-xl border p-5 grid grid-cols-1 lg:grid-cols-12 gap-6"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <form onSubmit={handleExecutarMesclagem} className="lg:col-span-7 space-y-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold" style={{ color: 'var(--accent-text)' }}>
              <ArrowRightLeft className="w-4 h-4" />
              <span>Depto. Comercial • Gestão de Férias & Mesclagem de Vendedores por Filial</span>
            </div>
            <h3 className="text-base font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>
              Transferir / Cobrir Carteira de BPs na Mesma Filial (Depto. Comercial)
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Em período de férias no Depto. Comercial, selecione a filial e transfira os BPs ativos do vendedor titular para o vendedor substituto da mesma unidade.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                1. Filial Responsável (Depto. Comercial)
              </label>
              <select
                aria-label="Selecionar filial para cobertura de férias"
                value={filialSelecionada}
                onChange={(e) => handleTrocarFilialForm(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-xs font-semibold border"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-strong)',
                  color: 'var(--text-primary)',
                }}
              >
                {filiaisDb.map((f) => (
                  <option key={f.codigo} value={f.codigo}>
                    {f.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                2. Vendedor Titular (Férias)
              </label>
              <select
                aria-label="Selecionar vendedor saindo de férias"
                value={vendedorSaindo}
                onChange={(e) => setVendedorSaindo(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-xs font-semibold border"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-strong)',
                  color: 'var(--text-primary)',
                }}
              >
                {filialObj.vendedores.map((v) => (
                  <option key={v.id} value={v.nome}>
                    {v.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                3. Vendedor Substituto (Cobrindo)
              </label>
              <select
                aria-label="Selecionar vendedor substituto"
                value={vendedorCobrindo}
                onChange={(e) => setVendedorCobrindo(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-xs font-semibold border"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-strong)',
                  color: 'var(--text-primary)',
                }}
              >
                {filialObj.vendedores.map((v) => (
                  <option key={v.id} value={v.nome}>
                    {v.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-white transition"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Mesclar Carteira na Filial {filialObj.codigo}</span>
            </button>

            {mensagemSucesso && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                {mensagemSucesso}
              </span>
            )}
          </div>
        </form>

        {/* Cadastrar Novo Vendedor na Filial */}
        <form
          onSubmit={handleCriarVendedor}
          className="lg:col-span-5 rounded-xl border p-4 space-y-3"
          style={{
            backgroundColor: 'var(--bg-subtle)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="flex items-center gap-2 text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
            <UserPlus className="w-4 h-4" style={{ color: 'var(--accent-text)' }} />
            <span>Depto. Comercial • Adicionar Vendedor ({filialObj.nome})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>
                Nome do Vendedor
              </label>
              <input
                type="text"
                placeholder="Ex: Marcos Nogueira"
                value={novoVendedorNome}
                onChange={(e) => setNovoVendedorNome(e.target.value)}
                className="w-full rounded-lg px-2.5 py-1.5 text-xs border"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-strong)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
            <div>
              <label className="block text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>
                Setor / Cargo
              </label>
              <input
                type="text"
                value={novoVendedorCargo}
                onChange={(e) => setNovoVendedorCargo(e.target.value)}
                className="w-full rounded-lg px-2.5 py-1.5 text-xs border"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-strong)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-3 rounded-lg text-xs font-semibold border transition"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-strong)',
              color: 'var(--text-primary)',
            }}
          >
            + Vincular ao Depto. Comercial ({filialObj.codigo})
          </button>
        </form>
      </div>
    </section>
  );
}
