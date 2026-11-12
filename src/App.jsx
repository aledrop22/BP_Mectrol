import React, { useState, useMemo, useEffect } from 'react';
import { DADOS_INICIAIS, DIAMETROS, PASSOS } from './data/dados';
import { carregarDados } from './lib/carregarDados';

export default function DashboardNextBP() {
  const [bps, setBps] = useState(DADOS_INICIAIS);
  const [carregado, setCarregado] = useState(false);
  const [abaStatus, setAbaStatus] = useState("Todos");
  const [filtroFilial, setFiltroFilial] = useState("Todas");
  const [busca, setBusca] = useState("");
  const [copiadoId, setCopiadoId] = useState(null);

  useEffect(() => {
    carregarDados().then(dados => {
      setBps(dados);
      setCarregado(true);
    });
  }, []);

  const atualizarMedida = (bpNum, campo, valor) => {
    setBps(prev => prev.map(item => item.bp === bpNum ? { ...item, [campo]: valor } : item));
  };

  const alternarUrgencia = (bpNum) => {
    setBps(prev => prev.map(item =>
      item.bp === bpNum ? { ...item, urgencia: item.urgencia === "ALTA" ? "NORMAL" : "ALTA" } : item
    ));
  };

  const gerarNomePasta = (item) => {
    const fuso = item.diametro && item.passo
      ? ` - Fuso ${item.diametro}x${item.passo}${item.compTotal ? `x${item.compTotal}` : ''}`
      : ' - Fuso Pendente';
    return `BP ${item.bp} - NF ${item.nf}${fuso}`;
  };

  const copiarPasta = (item) => {
    navigator.clipboard.writeText(gerarNomePasta(item));
    setCopiadoId(item.bp);
    setTimeout(() => setCopiadoId(null), 2000);
  };

  const filtrados = useMemo(() => {
    return bps.filter(item => {
      const matchStatus = abaStatus === "Todos" || item.status === abaStatus;
      const matchFilial = filtroFilial === "Todas" || item.filial.includes(filtroFilial);
      const termo = busca.toLowerCase();
      const matchBusca = item.bp.includes(termo) || item.cliente.toLowerCase().includes(termo) || item.nf.includes(termo);
      return matchStatus && matchFilial && matchBusca;
    });
  }, [bps, abaStatus, filtroFilial, busca]);

  const contadores = {
    total: bps.filter(b => b.status !== "Concluído").length,
    atrasados: bps.filter(b => b.status === "Atrasada").length,
    andamento: bps.filter(b => b.status === "Em Andamento").length,
    urgentes: bps.filter(b => b.urgencia === "ALTA" && b.status !== "Concluído").length,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Cabeçalho */}
        <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              MECTROL <span className="text-blue-500">NextBP</span> • Gestão de Croquis e Desenhos
            </h1>
            <p className="text-sm text-slate-400">
              Sincronização automática a cada 2h via GitHub Actions • Setor: [G] Desenho
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full text-slate-300">
              Última varredura: {carregado ? 'CSV sincronizado' : 'Carregando...'}
            </span>
          </div>
        </div>

        {/* Cartões de Indicadores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <p className="text-xs uppercase text-slate-400 font-semibold">Fila Ativa Total</p>
            <p className="text-3xl font-bold text-white mt-1">{contadores.total} <span className="text-sm font-normal text-slate-400">croquis</span></p>
          </div>
          <div className="bg-red-950/30 border border-red-900/60 p-4 rounded-xl">
            <p className="text-xs uppercase text-red-400 font-semibold">Em Atraso</p>
            <p className="text-3xl font-bold text-red-400 mt-1">{contadores.atrasados} <span className="text-sm font-normal text-red-300/70">vencidos</span></p>
          </div>
          <div className="bg-blue-950/30 border border-blue-900/60 p-4 rounded-xl">
            <p className="text-xs uppercase text-blue-400 font-semibold">Em Andamento (No Prazo)</p>
            <p className="text-3xl font-bold text-blue-400 mt-1">{contadores.andamento} <span className="text-sm font-normal text-blue-300/70">vencem hoje</span></p>
          </div>
          <div className="bg-amber-950/30 border border-amber-900/60 p-4 rounded-xl">
            <p className="text-xs uppercase text-amber-400 font-semibold">Prioridade Comercial / E-mail</p>
            <p className="text-3xl font-bold text-amber-400 mt-1">{contadores.urgentes} <span className="text-sm font-normal text-amber-300/70">urgentes</span></p>
          </div>
        </div>

        {/* Barra de Filtros */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
          <div className="flex gap-2">
            {["Todos", "Atrasada", "Em Andamento", "Concluído"].map(status => (
              <button
                key={status}
                onClick={() => setAbaStatus(status)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition ${
                  abaStatus === status ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filtroFilial}
              onChange={(e) => setFiltroFilial(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200"
            >
              <option value="Todas">Todas as Filiais</option>
              <option value="BAURU">03.01 - Bauru</option>
              <option value="CAMPINAS">03.04 - Campinas</option>
              <option value="JOINVILLE">03.06 - Joinville</option>
            </select>

            <input
              type="text"
              placeholder="Buscar BP, Cliente ou NF..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 w-64"
            />
          </div>
        </div>

        {/* Tabela Principal */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase bg-slate-900/50">
                <th className="p-3">BP / Prioridade</th>
                <th className="p-3">Cliente / NF</th>
                <th className="p-3">Filial / Vendedor</th>
                <th className="p-3">Prazo / Laudo Manut.</th>
                <th className="p-3">Medidas do Fuso (Ø x Passo x Comp)</th>
                <th className="p-3">Padrão Pasta Rede (.ZIP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtrados.map(item => (
                <tr key={item.bp} className={`hover:bg-slate-800/40 ${item.urgencia === "ALTA" ? "bg-amber-950/10" : ""}`}>
                  <td className="p-3 font-medium">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-white">#{item.bp}</span>
                      <button
                        onClick={() => alternarUrgencia(item.bp)}
                        title="Alternar Prioridade Solicitada por E-mail/Vendedor"
                        className={`px-2 py-0.5 text-xs rounded font-semibold ${
                          item.urgencia === "ALTA" ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {item.urgencia === "ALTA" ? "URGENTE" : "Normal"}
                      </button>
                    </div>
                    <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded ${
                      item.status === "Atrasada" ? "bg-red-950 text-red-400 border border-red-800" : "bg-blue-950 text-blue-400 border border-blue-800"
                    }`}>
                      {item.status}
                    </span>
                  </td>

                  <td className="p-3">
                    <div className="font-semibold text-slate-100">{item.cliente}</div>
                    <div className="text-xs text-slate-400">NF: {item.nf} • Chegada: {item.chegada}</div>
                  </td>

                  <td className="p-3">
                    <div className="text-slate-200">{item.filial}</div>
                    <div className="text-xs text-slate-400">{item.vendedor}</div>
                  </td>

                  <td className="p-3">
                    <div className="text-slate-200">{item.prazo}</div>
                    <div className="text-xs mt-0.5">
                      Laudo: <span className={item.laudo === "Concluído" ? "text-emerald-400 font-medium" : "text-amber-400"}>{item.laudo}</span>
                    </div>
                  </td>

                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      <select
                        value={item.diametro}
                        onChange={(e) => atualizarMedida(item.bp, "diametro", e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded px-1.5 py-1 text-xs text-white"
                      >
                        <option value="">Ø</option>
                        {DIAMETROS.filter(Boolean).map(d => <option key={d} value={d}>Ø{d}</option>)}
                      </select>
                      <span className="text-slate-500">x</span>
                      <select
                        value={item.passo}
                        onChange={(e) => atualizarMedida(item.bp, "passo", e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded px-1.5 py-1 text-xs text-white"
                      >
                        <option value="">Passo</option>
                        {PASSOS.filter(Boolean).map(p => <option key={p} value={p}>P{p}</option>)}
                      </select>
                      <span className="text-slate-500">x</span>
                      <input
                        type="text"
                        placeholder="Comp."
                        value={item.compTotal}
                        onChange={(e) => atualizarMedida(item.bp, "compTotal", e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white w-16"
                      />
                    </div>
                  </td>

                  <td className="p-3">
                    <div className="flex items-center justify-between gap-2 bg-slate-950 border border-slate-800 px-2.5 py-1.5 rounded-lg">
                      <span className="text-xs font-mono text-slate-300 truncate max-w-[230px]">
                        {gerarNomePasta(item)}
                      </span>
                      <button
                        onClick={() => copiarPasta(item)}
                        className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded font-medium shrink-0"
                      >
                        {copiadoId === item.bp ? "Copiado!" : "Copiar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
