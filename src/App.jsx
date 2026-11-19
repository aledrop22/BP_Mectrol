import React, { useState, useMemo, useEffect } from 'react';
import {
  DADOS_INICIAIS,
  FILIAIS_DB_INICIAL,
} from './data/dados';
import { PALETAS_TEMAS, obterVariaveisTema } from './data/temas';
import { carregarDados } from './lib/carregarDados';
import {
  ordenarFilaBPs,
  calcularPosicaoNaFila,
  solicitarPrioridadeFila,
  aplicarFuraFilaDiretoria,
  mesclarVendedorPorFerias,
  gerarNomePastaPadrao,
  obterEtapaMacroBP,
  calcularResumoSeisEtapas,
  avancarEtapaFluxoBP,
} from './lib/filaEngine';
import SidebarCroquis, { MODELOS_DASHBOARD } from './components/SidebarCroquis';
import PainelDashboardVisual from './components/PainelDashboardVisual';
import ModalFuraFilaDiretoria from './components/ModalFuraFilaDiretoria';
import { filtrarBPsPorPeriodoOuCalendario } from './lib/comparativoExportEngine';

export default function DashboardNextBP() {
  const [bps, setBps] = useState(() => ordenarFilaBPs(DADOS_INICIAIS));
  const [filiaisDb, setFiliaisDb] = useState(FILIAIS_DB_INICIAL);

  // Sidebar único recolhível (mostra os 6 ícones + nomes quando aberto, ou só os 6 ícones quando recolhido)
  const [sidebarRecolhido, setSidebarRecolhido] = useState(false);

  // Visão ativa selecionada pelos 6 ícones do Sidebar
  const [modeloAtivo, setModeloAtivo] = useState('DASH_1');

  // BP selecionado para inspeção rápida no Dashboard
  const [bpSelecionadoId, setBpSelecionadoId] = useState('53193');

  // Filtros globais (Período 30/60/90 dias, Calendário, Filial, Etapa, Motivo e Busca)
  const [filtroPeriodo, setFiltroPeriodo] = useState('30'); // '30' | '60' | '90' | 'TODOS' | 'CALENDARIO'
  const [dataInicio, setDataInicio] = useState('2026-01-01');
  const [dataFim, setDataFim] = useState('2026-11-18');
  const [filtroFilial, setFiltroFilial] = useState('Todas');
  const [filtroEtapa, setFiltroEtapa] = useState('TODAS');
  const [filtroMotivo, setFiltroMotivo] = useState('Todos');
  const [busca, setBusca] = useState('');

  // 4 Modelos de Tema (2 Dark: dark-colorido, dark-neutro | 2 White: white-colorido, white-intercalado)
  const [paletaId, setPaletaId] = useState('dark-colorido');
  const [modoCor, setModoCor] = useState('dark');
  const [copiadoId, setCopiadoId] = useState(null);

  // Modal Fura-Fila Diretoria e Notificação
  const [modalFuraFilaItem, setModalFuraFilaItem] = useState(null);
  const [avisoTempoReal, setAvisoTempoReal] = useState(null);

  useEffect(() => {
    carregarDados().then((dados) => {
      const ordenados = ordenarFilaBPs(dados);
      setBps(ordenados);
      if (ordenados.length > 0) {
        setBpSelecionadoId(ordenados[0].bp);
      }
    });
  }, []);

  const temaAtivo = useMemo(
    () => obterVariaveisTema(paletaId, modoCor),
    [paletaId, modoCor]
  );

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(temaAtivo.cssVars).forEach(([prop, val]) => {
      root.style.setProperty(prop, val);
    });
    if (temaAtivo.modoEfetivo === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [temaAtivo]);

  const selecionarPaleta = (id) => {
    const p = PALETAS_TEMAS.find((item) => item.id === id);
    if (!p) return;
    setPaletaId(p.id);
    setModoCor(p.modoPadrao);
  };

  const alternarChavinhaDarkWhite = () => {
    if (modoCor === 'dark') {
      setModoCor('light');
      setPaletaId('white-colorido');
    } else {
      setModoCor('dark');
      setPaletaId('dark-colorido');
    }
  };

  const dispararNotificacao = (titulo, detalhe) => {
    setAvisoTempoReal({ titulo, detalhe });
    setTimeout(() => setAvisoTempoReal(null), 4000);
  };

  // Ordenação base da fila
  const bpsOrdenados = useMemo(() => ordenarFilaBPs(bps), [bps]);

  // Filtro pelo período histórico (30d, 60d, 90d, Tudo ou Calendário 2026)
  const bpsPorPeriodo = useMemo(
    () =>
      filtrarBPsPorPeriodoOuCalendario(bpsOrdenados, {
        filtroPeriodo,
        dataInicio,
        dataFim,
        incluirHistorico2026: true,
      }),
    [bpsOrdenados, filtroPeriodo, dataInicio, dataFim]
  );

  // Resumo das 6 etapas e 10 filiais dentro do período selecionado
  const resumoFluxo = useMemo(
    () => calcularResumoSeisEtapas(bpsPorPeriodo, filiaisDb),
    [bpsPorPeriodo, filiaisDb]
  );

  // Lista filtrada por Filial, Etapa, Motivo e Busca
  const bpsFiltrados = useMemo(() => {
    return bpsPorPeriodo.filter((item) => {
      const matchFilial =
        filtroFilial === 'Todas' || item.filial.includes(filtroFilial);
      const etapaItem = obterEtapaMacroBP(item);
      const matchEtapa =
        filtroEtapa === 'TODAS' || etapaItem === filtroEtapa;
      const matchMotivo =
        filtroMotivo === 'Todos' || item.motivoRecebimento === filtroMotivo;
      const termo = busca.trim().toLowerCase();
      const matchBusca =
        !termo ||
        item.bp.toLowerCase().includes(termo) ||
        item.cliente.toLowerCase().includes(termo) ||
        item.nf.toLowerCase().includes(termo) ||
        item.vendedor.toLowerCase().includes(termo);
      return matchFilial && matchEtapa && matchMotivo && matchBusca;
    });
  }, [bpsPorPeriodo, filtroFilial, filtroEtapa, filtroMotivo, busca]);

  const mapaPosicoes = useMemo(() => {
    const ativos = bpsOrdenados.filter((b) => obterEtapaMacroBP(b) !== 'CONCLUIDO');
    const contadoresFaixa = { ALTA: 0, MEDIA: 0, BAIXA: 0 };
    const mapa = {};

    ativos.forEach((item, index) => {
      const p = item.prioridade || 'MEDIA';
      const naFrenteFaixa = contadoresFaixa[p] || 0;
      contadoresFaixa[p] = naFrenteFaixa + 1;
      mapa[item.bp] = {
        posicaoGeral: index + 1,
        posicaoNaFaixa: naFrenteFaixa + 1,
        pessoasNaFrenteNaFaixa: naFrenteFaixa,
      };
    });
    return mapa;
  }, [bpsOrdenados]);

  const bpSelecionado = useMemo(
    () => bpsOrdenados.find((b) => b.bp === bpSelecionadoId) || bpsOrdenados[0] || null,
    [bpsOrdenados, bpSelecionadoId]
  );

  const modeloInfoAtivo = useMemo(
    () => MODELOS_DASHBOARD.find((m) => m.id === modeloAtivo) || MODELOS_DASHBOARD[0],
    [modeloAtivo]
  );

  useEffect(() => {
    const el = document.getElementById('painel-paginas-scroll');
    if (el) el.scrollTop = 0;
  }, [modeloAtivo]);

  // Handlers
  const handleSelecionarBp = (bpNum) => {
    setBpSelecionadoId(bpNum);
  };

  const atualizarCampo = (bpNum, campo, valor) => {
    setBps((prev) =>
      prev.map((item) => (item.bp === bpNum ? { ...item, [campo]: valor } : item))
    );
  };

  const handleMudarEtapaBP = (bpNum, novaEtapaMacro) => {
    setBps((prev) => ordenarFilaBPs(avancarEtapaFluxoBP(prev, bpNum, novaEtapaMacro)));
    dispararNotificacao(
      `BP #${bpNum} atualizado no fluxo`,
      `Movido para a etapa: ${novaEtapaMacro}`
    );
  };

  const handleConfirmarPrioridade = (bpNum, novaPrioridade, solicitante) => {
    const posPrevia = calcularPosicaoNaFila(bps, bpNum, novaPrioridade);
    setBps((prev) => solicitarPrioridadeFila(prev, bpNum, novaPrioridade, solicitante));
    dispararNotificacao(
      `BP #${bpNum} ordenado em Prioridade ${novaPrioridade}`,
      `${posPrevia.mensagemPrincipal} (Fila Geral: #${posPrevia.posicaoGeral}º)`
    );
  };

  const handleConfirmarFuraFila = (bpNum, payload) => {
    setBps((prev) => aplicarFuraFilaDiretoria(prev, bpNum, payload));
    dispararNotificacao(
      `Emergência Autorizada (Diretoria / Supervisor): BP #${bpNum} subiu para #1 da Fila`,
      `${payload.motivo}`
    );
  };

  const handleMesclarFerias = (filialCod, vendedorOrigem, vendedorDestino) => {
    setBps((prev) => mesclarVendedorPorFerias(prev, filialCod, vendedorOrigem, vendedorDestino));
    dispararNotificacao(
      `Cobertura de Férias Aplicada (${filialCod})`,
      `Os BPs de ${vendedorOrigem} foram mesclados para ${vendedorDestino}.`
    );
  };

  const handleAdicionarVendedorFilial = (filialCod, nome, cargo) => {
    setFiliaisDb((prev) =>
      prev.map((f) => {
        if (f.codigo !== filialCod) return f;
        if (f.vendedores.some((v) => v.nome.toLowerCase() === nome.toLowerCase())) return f;
        return {
          ...f,
          vendedores: [
            ...f.vendedores,
            { id: `v-${Date.now()}`, nome, cargo: cargo || 'Depto. Comercial • Consultor', status: 'Ativo' },
          ],
        };
      })
    );
  };

  const handleAtualizarEquipeFilial = (filialCod, campo, valor) => {
    setFiliaisDb((prev) =>
      prev.map((f) => (f.codigo === filialCod ? { ...f, [campo]: valor } : f))
    );
  };

  const copiarPasta = (item) => {
    const texto = gerarNomePastaPadrao(item);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).catch(() => {});
    }
    setCopiadoId(item.bp);
    setTimeout(() => setCopiadoId(null), 2000);
  };

  return (
    <div
      className="h-screen w-full overflow-hidden flex flex-col transition-colors"
      style={{
        backgroundColor: 'var(--bg-canvas)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Top Bar Fixa no Topo */}
      <header
        className="sticky top-0 z-40 shrink-0 flex items-center justify-between gap-4 px-4 sm:px-6 py-2.5 border-b"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <div className="flex items-center gap-3">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setModeloAtivo('DASH_1');
            }}
            className="text-base sm:text-lg font-extrabold tracking-tight whitespace-nowrap shrink-0"
            style={{ color: 'var(--text-primary)' }}
          >
            MECTROL <span style={{ color: 'var(--accent-text)' }}>BP</span>
          </a>
          <span
            aria-hidden="true"
            className="hidden sm:inline text-sm"
            style={{ color: 'var(--border-strong)' }}
          >
            |
          </span>
          <span
            className="hidden sm:inline text-xs font-bold truncate"
            style={{ color: 'var(--text-secondary)' }}
          >
            {modeloInfoAtivo.curto} — {modeloInfoAtivo.sub}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setModalFuraFilaItem(bpsOrdenados[0])}
            className="px-3.5 py-1.5 text-xs font-bold text-white rounded-lg transition whitespace-nowrap shrink-0"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            Fura-Fila Diretoria
          </button>
        </div>
      </header>

      {/* Workspace Tela Cheia: Sidebar Fixo + Área de Páginas com Rolagem Independente */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row w-full overflow-hidden">
        <SidebarCroquis
          recolhido={sidebarRecolhido}
          onAlternarRecolhido={() => setSidebarRecolhido((prev) => !prev)}
          modeloAtivo={modeloAtivo}
          onMudarModelo={setModeloAtivo}
          paletaId={paletaId}
          modoCor={modoCor}
          onSelecionarPaleta={selecionarPaleta}
          onAlternarChavinhaDarkWhite={alternarChavinhaDarkWhite}
        />

        <main
          id="painel-paginas-scroll"
          className="flex-1 min-w-0 h-full overflow-y-auto px-3 sm:px-6 py-4 space-y-4"
        >
          {avisoTempoReal && (
            <div
              role="status"
              className="rounded-xl border px-4 py-2.5 flex items-center justify-between gap-3"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--accent-primary)',
              }}
            >
              <div className="text-xs">
                <strong className="font-bold block" style={{ color: 'var(--text-primary)' }}>
                  {avisoTempoReal.titulo}
                </strong>
                <span style={{ color: 'var(--text-secondary)' }}>{avisoTempoReal.detalhe}</span>
              </div>
              <button
                type="button"
                onClick={() => setAvisoTempoReal(null)}
                className="text-xs font-semibold px-2 py-1 rounded"
                style={{ color: 'var(--text-muted)' }}
              >
                Fechar
              </button>
            </div>
          )}

          <PainelDashboardVisual
            modeloAtivo={modeloAtivo}
            onMudarModelo={setModeloAtivo}
            paletaId={paletaId}
            modoCor={modoCor}
            bpsFiltrados={bpsFiltrados}
            todosBps={bpsOrdenados}
            resumoFluxo={resumoFluxo}
            filiaisDb={filiaisDb}
            mapaPosicoes={mapaPosicoes}
            bpSelecionado={bpSelecionado}
            bpSelecionadoId={bpSelecionadoId}
            onSelecionarBp={handleSelecionarBp}
            filtroPeriodo={filtroPeriodo}
            onMudarPeriodo={setFiltroPeriodo}
            dataInicio={dataInicio}
            dataFim={dataFim}
            onMudarDataInicio={setDataInicio}
            onMudarDataFim={setDataFim}
            filtroFilial={filtroFilial}
            onMudarFilial={setFiltroFilial}
            filtroEtapa={filtroEtapa}
            onMudarEtapa={setFiltroEtapa}
            filtroMotivo={filtroMotivo}
            onMudarMotivo={setFiltroMotivo}
            busca={busca}
            onMudarBusca={setBusca}
            copiadoId={copiadoId}
            onCopiarPasta={copiarPasta}
            onAtualizarCampo={atualizarCampo}
            onMudarEtapaBP={handleMudarEtapaBP}
            onConfirmarPrioridade={handleConfirmarPrioridade}
            onAbrirModalFuraFila={(item) => setModalFuraFilaItem(item)}
            onConfirmarFuraFila={handleConfirmarFuraFila}
            onMesclarFerias={handleMesclarFerias}
            onAdicionarVendedorFilial={handleAdicionarVendedorFilial}
            onAtualizarEquipeFilial={handleAtualizarEquipeFilial}
            onNotificar={dispararNotificacao}
          />
        </main>
      </div>

      {modalFuraFilaItem && (
        <ModalFuraFilaDiretoria
          item={modalFuraFilaItem}
          bpsAtivos={bpsOrdenados.filter((b) => obterEtapaMacroBP(b) !== 'CONCLUIDO')}
          perfilAtivo="DIRETORIA"
          onFechar={() => setModalFuraFilaItem(null)}
          onConfirmarFuraFila={handleConfirmarFuraFila}
        />
      )}
    </div>
  );
}
