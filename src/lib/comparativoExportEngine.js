import { obterEtapaMacroBP, calcularResumoSeisEtapas, gerarNomePastaPadrao, obterEquipeFilial } from './filaEngine';

// Data de referência do sistema (18/11/2026)
export const DATA_REF_ISO = '2026-11-18';

// Lista de meses de 2026 para comparativo Mês a Mês (desde 01/01/2026)
export const MESES_2026 = [
  { id: '2026-01', rotulo: 'Janeiro / 2026', curto: 'Jan/26', inicio: '2026-01-01', fim: '2026-01-31' },
  { id: '2026-02', rotulo: 'Fevereiro / 2026', curto: 'Fev/26', inicio: '2026-02-01', fim: '2026-02-28' },
  { id: '2026-03', rotulo: 'Março / 2026', curto: 'Mar/26', inicio: '2026-03-01', fim: '2026-03-31' },
  { id: '2026-04', rotulo: 'Abril / 2026', curto: 'Abr/26', inicio: '2026-04-01', fim: '2026-04-30' },
  { id: '2026-05', rotulo: 'Maio / 2026', curto: 'Mai/26', inicio: '2026-05-01', fim: '2026-05-31' },
  { id: '2026-06', rotulo: 'Junho / 2026', curto: 'Jun/26', inicio: '2026-06-01', fim: '2026-06-30' },
  { id: '2026-07', rotulo: 'Julho / 2026', curto: 'Jul/26', inicio: '2026-07-01', fim: '2026-07-31' },
  { id: '2026-08', rotulo: 'Agosto / 2026', curto: 'Ago/26', inicio: '2026-08-01', fim: '2026-08-31' },
  { id: '2026-09', rotulo: 'Setembro / 2026', curto: 'Set/26', inicio: '2026-09-01', fim: '2026-09-30' },
  { id: '2026-10', rotulo: 'Outubro / 2026', curto: 'Out/26', inicio: '2026-10-01', fim: '2026-10-31' },
  { id: '2026-11', rotulo: 'Novembro / 2026 (Atual)', curto: 'Nov/26', inicio: '2026-11-01', fim: '2026-11-30' },
];

// Lista de semanas recentes de 2026 para comparativo Semana a Semana
export const SEMANAS_2026 = [
  { id: 'SEM-40', rotulo: 'Semana 40 (28/09 a 04/10/2026)', curto: 'Sem 40 (Set/Out)', inicio: '2026-09-28', fim: '2026-10-04' },
  { id: 'SEM-41', rotulo: 'Semana 41 (05/10 a 11/10/2026)', curto: 'Sem 41 (Out)', inicio: '2026-10-05', fim: '2026-10-11' },
  { id: 'SEM-42', rotulo: 'Semana 42 (12/10 a 18/10/2026)', curto: 'Sem 42 (Out)', inicio: '2026-10-12', fim: '2026-10-18' },
  { id: 'SEM-43', rotulo: 'Semana 43 (19/10 a 25/10/2026)', curto: 'Sem 43 (Out)', inicio: '2026-10-19', fim: '2026-10-25' },
  { id: 'SEM-44', rotulo: 'Semana 44 (26/10 a 01/11/2026)', curto: 'Sem 44 (Out/Nov)', inicio: '2026-10-26', fim: '2026-11-01' },
  { id: 'SEM-45', rotulo: 'Semana 45 (02/11 a 08/11/2026)', curto: 'Sem 45 (Nov)', inicio: '2026-11-02', fim: '2026-11-08' },
  { id: 'SEM-46', rotulo: 'Semana 46 (09/11 a 15/11/2026)', curto: 'Sem 46 (Nov)', inicio: '2026-11-09', fim: '2026-11-15' },
  { id: 'SEM-47', rotulo: 'Semana 47 (16/11 a 18/11/2026)', curto: 'Sem 47 (Atual)', inicio: '2026-11-16', fim: '2026-11-22' },
];

// Histórico complementar de BPs ao longo do ano de 2026 (Janeiro a Outubro de 2026)
// Todos com diasAtras > 30 para não alterar a visualização padrão de 30 dias,
// mas permitindo consultar desde 01/01/2026 no calendário, 60d, 90d e comparativos.
export const HISTORICO_ANUAL_2026 = [
  {
    bp: '51012',
    cliente: 'GERDAU AÇOS',
    razao: 'GERDAU AÇOS LONGOS S.A.',
    nf: '110201',
    quantidade: 4,
    motivoRecebimento: 'Manutenção',
    tipoServico: 'Depto. Manutenção + Depto. Projeto',
    filial: '03.05 - BELO HORIZONTE (BH)',
    vendedor: 'Thiago Batista',
    vendedorOriginal: 'Thiago Batista',
    chegada: '08/01/2026',
    dataISO: '2026-01-08',
    diasAtras: 314,
    prazo: '18/01/2026 16:00',
    atraso: 'No Prazo',
    tempoParado: '0h',
    prazoEnvio: 'Concluído',
    gargaloCritico: false,
    status: 'Concluída',
    laudo: 'Concluído',
    dimensionalStatus: 'Completo (Ø50×P10×1600)',
    etapaMacro: 'CONCLUIDO',
    etapaFluxo: 'CONCLUIDO_TOTAL',
    etapaAtualNumero: 8,
    laudoDifusoInicio: '09/01/2026 08:30',
    laudoFinalConclusao: '10/01/2026 14:00',
    responsavelTecnico: 'Depto. Projeto & Depto. Manutenção',
    urgencia: 'NORMAL',
    prioridade: 'MEDIA',
    solicitadoEmOrder: 101,
    solicitadoEm: '08/01/2026 09:00',
    solicitadoPor: 'Thiago Batista',
    diametro: '50',
    passo: '10',
    compTotal: '1600',
    precisao: 'RETIFICADO',
    diretoriaOverride: false,
    gantt: { inicio: 1, laudo: 2, croqui: 2, desenho: 2, manut: 3, limite: 12 },
  },
  {
    bp: '51145',
    cliente: 'KLABIN PAPÉIS',
    razao: 'KLABIN S.A.',
    nf: '118940',
    quantidade: 3,
    motivoRecebimento: 'Reparo',
    tipoServico: 'Depto. Manutenção + Depto. Projeto',
    filial: '03.08 - CURITIBA',
    vendedor: 'Rodrigo Fontana',
    vendedorOriginal: 'Rodrigo Fontana',
    chegada: '22/01/2026',
    dataISO: '2026-01-22',
    diasAtras: 300,
    prazo: '30/01/2026 17:00',
    atraso: 'No Prazo',
    tempoParado: '0h',
    prazoEnvio: 'Concluído',
    gargaloCritico: false,
    status: 'Concluída',
    laudo: 'Concluído',
    dimensionalStatus: 'Completo (Ø40×P10×1150)',
    etapaMacro: 'CONCLUIDO',
    etapaFluxo: 'CONCLUIDO_TOTAL',
    etapaAtualNumero: 8,
    laudoDifusoInicio: '23/01/2026 09:00',
    laudoFinalConclusao: '24/01/2026 16:00',
    responsavelTecnico: 'Depto. Projeto & Depto. Manutenção',
    urgencia: 'NORMAL',
    prioridade: 'BAIXA',
    solicitadoEmOrder: 102,
    solicitadoEm: '22/01/2026 10:00',
    solicitadoPor: 'Rodrigo Fontana',
    diametro: '40',
    passo: '10',
    compTotal: '1150',
    precisao: 'RETIFICADO',
    diretoriaOverride: false,
    gantt: { inicio: 1, laudo: 2, croqui: 2, desenho: 2, manut: 2, limite: 12 },
  },
  {
    bp: '51320',
    cliente: 'SUZANO CELULOSE',
    razao: 'SUZANO S.A.',
    nf: '124510',
    quantidade: 5,
    motivoRecebimento: 'Manutenção',
    tipoServico: 'Depto. Manutenção + Depto. Projeto',
    filial: '03.01 - BAURU',
    vendedor: 'Danilo Carduci',
    vendedorOriginal: 'Danilo Carduci',
    chegada: '14/02/2026',
    dataISO: '2026-02-14',
    diasAtras: 277,
    prazo: '24/02/2026 18:00',
    atraso: 'No Prazo',
    tempoParado: '0h',
    prazoEnvio: 'Concluído',
    gargaloCritico: false,
    status: 'Concluída',
    laudo: 'Concluído',
    dimensionalStatus: 'Completo (Ø63×P20×1950)',
    etapaMacro: 'CONCLUIDO',
    etapaFluxo: 'CONCLUIDO_TOTAL',
    etapaAtualNumero: 8,
    laudoDifusoInicio: '15/02/2026 08:00',
    laudoFinalConclusao: '16/02/2026 15:20',
    responsavelTecnico: 'Depto. Projeto & Depto. Manutenção',
    urgencia: 'ALTA',
    prioridade: 'ALTA',
    solicitadoEmOrder: 103,
    solicitadoEm: '14/02/2026 11:00',
    solicitadoPor: 'Danilo Carduci',
    diametro: '63',
    passo: '20',
    compTotal: '1950',
    precisao: 'RETIFICADO',
    diretoriaOverride: false,
    gantt: { inicio: 1, laudo: 2, croqui: 2, desenho: 2, manut: 3, limite: 12 },
  },
  {
    bp: '51590',
    cliente: 'VOLKSWAGEN DO BRASIL',
    razao: 'VOLKSWAGEN DO BRASIL IND. DE VEICULOS',
    nf: '139822',
    quantidade: 6,
    motivoRecebimento: 'Somente Desenho / Croqui',
    tipoServico: 'Depto. Projeto (Somente Desenho)',
    filial: '03.02 - SÃO PAULO',
    vendedor: 'Marcos Nogueira',
    vendedorOriginal: 'Marcos Nogueira',
    chegada: '11/03/2026',
    dataISO: '2026-03-11',
    diasAtras: 252,
    prazo: '19/03/2026 14:00',
    atraso: 'No Prazo',
    tempoParado: '0h',
    prazoEnvio: 'Concluído',
    gargaloCritico: false,
    status: 'Concluída',
    laudo: 'Concluído',
    dimensionalStatus: 'Completo (Ø32×P10×980)',
    etapaMacro: 'CONCLUIDO',
    etapaFluxo: 'CONCLUIDO_TOTAL',
    etapaAtualNumero: 8,
    laudoDifusoInicio: '11/03/2026 13:00',
    laudoFinalConclusao: '12/03/2026 11:00',
    responsavelTecnico: 'Depto. Projeto',
    urgencia: 'NORMAL',
    prioridade: 'MEDIA',
    solicitadoEmOrder: 104,
    solicitadoEm: '11/03/2026 09:30',
    solicitadoPor: 'Marcos Nogueira',
    diametro: '32',
    passo: '10',
    compTotal: '980',
    precisao: 'RETIFICADO',
    diretoriaOverride: false,
    gantt: { inicio: 1, laudo: 1, croqui: 2, desenho: 2, manut: 0, limite: 12 },
  },
  {
    bp: '51840',
    cliente: 'TUPY FUNDIÇÃO',
    razao: 'TUPY S.A.',
    nf: '145900',
    quantidade: 4,
    motivoRecebimento: 'Manutenção',
    tipoServico: 'Depto. Manutenção + Depto. Projeto',
    filial: '03.06 - JOINVILLE',
    vendedor: 'Lucas Zimmermann',
    vendedorOriginal: 'Lucas Zimmermann',
    chegada: '16/04/2026',
    dataISO: '2026-04-16',
    diasAtras: 216,
    prazo: '26/04/2026 17:00',
    atraso: 'No Prazo',
    tempoParado: '0h',
    prazoEnvio: 'Concluído',
    gargaloCritico: false,
    status: 'Concluída',
    laudo: 'Concluído',
    dimensionalStatus: 'Completo (Ø40×P12×1420)',
    etapaMacro: 'CONCLUIDO',
    etapaFluxo: 'CONCLUIDO_TOTAL',
    etapaAtualNumero: 8,
    laudoDifusoInicio: '17/04/2026 08:30',
    laudoFinalConclusao: '18/04/2026 16:10',
    responsavelTecnico: 'Depto. Projeto & Depto. Manutenção',
    urgencia: 'NORMAL',
    prioridade: 'MEDIA',
    solicitadoEmOrder: 105,
    solicitadoEm: '16/04/2026 14:00',
    solicitadoPor: 'Lucas Zimmermann',
    diametro: '40',
    passo: '12',
    compTotal: '1420',
    precisao: 'RETIFICADO',
    diretoriaOverride: false,
    gantt: { inicio: 1, laudo: 2, croqui: 2, desenho: 2, manut: 3, limite: 12 },
  },
  {
    bp: '52090',
    cliente: 'AVIBRAS AEROESPACIAL',
    razao: 'AVIBRAS INDUSTRIA AEROESPACIAL S.A.',
    nf: '158210',
    quantidade: 3,
    motivoRecebimento: 'Reparo',
    tipoServico: 'Depto. Manutenção + Depto. Projeto',
    filial: '03.03 - SÃO JOSÉ DOS CAMPOS (VALE)',
    vendedor: 'Gustavo Ribeiro',
    vendedorOriginal: 'Gustavo Ribeiro',
    chegada: '19/05/2026',
    dataISO: '2026-05-19',
    diasAtras: 183,
    prazo: '28/05/2026 15:00',
    atraso: 'No Prazo',
    tempoParado: '0h',
    prazoEnvio: 'Concluído',
    gargaloCritico: false,
    status: 'Concluída',
    laudo: 'Concluído',
    dimensionalStatus: 'Completo (Ø32×P5×890)',
    etapaMacro: 'CONCLUIDO',
    etapaFluxo: 'CONCLUIDO_TOTAL',
    etapaAtualNumero: 8,
    laudoDifusoInicio: '20/05/2026 09:00',
    laudoFinalConclusao: '21/05/2026 14:30',
    responsavelTecnico: 'Depto. Projeto & Depto. Manutenção',
    urgencia: 'ALTA',
    prioridade: 'ALTA',
    solicitadoEmOrder: 106,
    solicitadoEm: '19/05/2026 10:15',
    solicitadoPor: 'Gustavo Ribeiro',
    diametro: '32',
    passo: '5',
    compTotal: '890',
    precisao: 'RETIFICADO',
    diretoriaOverride: false,
    gantt: { inicio: 1, laudo: 2, croqui: 2, desenho: 2, manut: 2, limite: 12 },
  },
  {
    bp: '52310',
    cliente: 'CATERPILLAR BRASIL',
    razao: 'CATERPILLAR BRASIL LTDA',
    nf: '164300',
    quantidade: 5,
    motivoRecebimento: 'Manutenção',
    tipoServico: 'Depto. Manutenção + Depto. Projeto',
    filial: '03.04 - CAMPINAS',
    vendedor: 'Vanessa Santos',
    vendedorOriginal: 'Vanessa Santos',
    chegada: '15/06/2026',
    dataISO: '2026-06-15',
    diasAtras: 156,
    prazo: '25/06/2026 16:00',
    atraso: 'No Prazo',
    tempoParado: '0h',
    prazoEnvio: 'Concluído',
    gargaloCritico: false,
    status: 'Concluída',
    laudo: 'Concluído',
    dimensionalStatus: 'Completo (Ø50×P16×1780)',
    etapaMacro: 'CONCLUIDO',
    etapaFluxo: 'CONCLUIDO_TOTAL',
    etapaAtualNumero: 8,
    laudoDifusoInicio: '16/06/2026 08:15',
    laudoFinalConclusao: '17/06/2026 15:45',
    responsavelTecnico: 'Depto. Projeto & Depto. Manutenção',
    urgencia: 'NORMAL',
    prioridade: 'MEDIA',
    solicitadoEmOrder: 107,
    solicitadoEm: '15/06/2026 11:00',
    solicitadoPor: 'Vanessa Santos',
    diametro: '50',
    passo: '16',
    compTotal: '1780',
    precisao: 'RETIFICADO',
    diretoriaOverride: false,
    gantt: { inicio: 1, laudo: 2, croqui: 2, desenho: 2, manut: 3, limite: 12 },
  },
  {
    bp: '52580',
    cliente: 'YAMAHA MOTOR AM',
    razao: 'YAMAHA MOTOR DA AMAZONIA LTDA',
    nf: '172910',
    quantidade: 4,
    motivoRecebimento: 'Troca em Garantia',
    tipoServico: 'Depto. Manutenção + Depto. Projeto',
    filial: '03.07 - MANAUS',
    vendedor: 'Diego Barroso',
    vendedorOriginal: 'Diego Barroso',
    chegada: '20/07/2026',
    dataISO: '2026-07-20',
    diasAtras: 121,
    prazo: '30/07/2026 17:00',
    atraso: 'No Prazo',
    tempoParado: '0h',
    prazoEnvio: 'Concluído',
    gargaloCritico: false,
    status: 'Concluída',
    laudo: 'Concluído',
    dimensionalStatus: 'Completo (Ø25×P5×740)',
    etapaMacro: 'CONCLUIDO',
    etapaFluxo: 'CONCLUIDO_TOTAL',
    etapaAtualNumero: 8,
    laudoDifusoInicio: '21/07/2026 09:00',
    laudoFinalConclusao: '22/07/2026 14:20',
    responsavelTecnico: 'Depto. Projeto & Depto. Manutenção',
    urgencia: 'NORMAL',
    prioridade: 'BAIXA',
    solicitadoEmOrder: 108,
    solicitadoEm: '20/07/2026 13:30',
    solicitadoPor: 'Diego Barroso',
    diametro: '25',
    passo: '5',
    compTotal: '740',
    precisao: 'RETIFICADO',
    diretoriaOverride: false,
    gantt: { inicio: 1, laudo: 2, croqui: 2, desenho: 2, manut: 2, limite: 12 },
  },
  {
    bp: '52790',
    cliente: 'RANDON IMPLEMENTOS',
    razao: 'RANDON S.A. IMPLEMENTOS E PARTICIPACOES',
    nf: '181440',
    quantidade: 5,
    motivoRecebimento: 'Peritagem / Reforma',
    tipoServico: 'Depto. Manutenção + Depto. Projeto',
    filial: '03.09 - PORTO ALEGRE',
    vendedor: 'Matheus Silveira',
    vendedorOriginal: 'Matheus Silveira',
    chegada: '18/08/2026',
    dataISO: '2026-08-18',
    diasAtras: 92,
    prazo: '28/08/2026 17:00',
    atraso: 'No Prazo',
    tempoParado: '0h',
    prazoEnvio: 'Concluído',
    gargaloCritico: false,
    status: 'Concluída',
    laudo: 'Concluído',
    dimensionalStatus: 'Completo (Ø40×P10×1390)',
    etapaMacro: 'CONCLUIDO',
    etapaFluxo: 'CONCLUIDO_TOTAL',
    etapaAtualNumero: 8,
    laudoDifusoInicio: '19/08/2026 08:30',
    laudoFinalConclusao: '20/08/2026 16:00',
    responsavelTecnico: 'Depto. Projeto & Depto. Manutenção',
    urgencia: 'NORMAL',
    prioridade: 'MEDIA',
    solicitadoEmOrder: 109,
    solicitadoEm: '18/08/2026 15:00',
    solicitadoPor: 'Matheus Silveira',
    diametro: '40',
    passo: '10',
    compTotal: '1390',
    precisao: 'RETIFICADO',
    diretoriaOverride: false,
    gantt: { inicio: 1, laudo: 2, croqui: 2, desenho: 2, manut: 3, limite: 12 },
  },
  {
    bp: '52940',
    cliente: 'BATERIAS MOURA',
    razao: 'ACUMULADORES MOURA S.A.',
    nf: '189320',
    quantidade: 3,
    motivoRecebimento: 'Manutenção',
    tipoServico: 'Depto. Manutenção + Depto. Projeto',
    filial: '03.10 - RECIFE',
    vendedor: 'Rafael Albuquerque',
    vendedorOriginal: 'Rafael Albuquerque',
    chegada: '14/09/2026',
    dataISO: '2026-09-14',
    diasAtras: 65,
    prazo: '24/09/2026 16:00',
    atraso: 'No Prazo',
    tempoParado: '0h',
    prazoEnvio: 'Concluído',
    gargaloCritico: false,
    status: 'Concluída',
    laudo: 'Concluído',
    dimensionalStatus: 'Completo (Ø32×P10×1050)',
    etapaMacro: 'CONCLUIDO',
    etapaFluxo: 'CONCLUIDO_TOTAL',
    etapaAtualNumero: 8,
    laudoDifusoInicio: '15/09/2026 09:00',
    laudoFinalConclusao: '16/09/2026 15:00',
    responsavelTecnico: 'Depto. Projeto & Depto. Manutenção',
    urgencia: 'NORMAL',
    prioridade: 'MEDIA',
    solicitadoEmOrder: 110,
    solicitadoEm: '14/09/2026 08:45',
    solicitadoPor: 'Rafael Albuquerque',
    diametro: '32',
    passo: '10',
    compTotal: '1050',
    precisao: 'RETIFICADO',
    diretoriaOverride: false,
    gantt: { inicio: 1, laudo: 2, croqui: 2, desenho: 2, manut: 2, limite: 12 },
  },
  {
    bp: '53085',
    cliente: 'ROMI INDÚSTRIA',
    razao: 'INDUSTRIAS ROMI S.A.',
    nf: '194120',
    quantidade: 4,
    motivoRecebimento: 'Somente Desenho / Croqui',
    tipoServico: 'Depto. Projeto (Somente Desenho)',
    filial: '03.04 - CAMPINAS',
    vendedor: 'Vanessa Santos',
    vendedorOriginal: 'Vanessa Santos',
    chegada: '08/10/2026',
    dataISO: '2026-10-08',
    diasAtras: 41,
    prazo: '18/10/2026 17:00',
    atraso: 'No Prazo',
    tempoParado: '0h',
    prazoEnvio: 'Concluído',
    gargaloCritico: false,
    status: 'Concluída',
    laudo: 'Concluído',
    dimensionalStatus: 'Completo (Ø40×P10×1280)',
    etapaMacro: 'CONCLUIDO',
    etapaFluxo: 'CONCLUIDO_TOTAL',
    etapaAtualNumero: 8,
    laudoDifusoInicio: '08/10/2026 14:00',
    laudoFinalConclusao: '09/10/2026 11:30',
    responsavelTecnico: 'Depto. Projeto',
    urgencia: 'ALTA',
    prioridade: 'ALTA',
    solicitadoEmOrder: 111,
    solicitadoEm: '08/10/2026 10:00',
    solicitadoPor: 'Vanessa Santos',
    diametro: '40',
    passo: '10',
    compTotal: '1280',
    precisao: 'RETIFICADO',
    diretoriaOverride: false,
    gantt: { inicio: 1, laudo: 1, croqui: 2, desenho: 2, manut: 0, limite: 12 },
  },
  {
    bp: '53110',
    cliente: 'SCHULZ COMPRESSORES',
    razao: 'SCHULZ S.A.',
    nf: '196800',
    quantidade: 3,
    motivoRecebimento: 'Manutenção',
    tipoServico: 'Depto. Manutenção + Depto. Projeto',
    filial: '03.06 - JOINVILLE',
    vendedor: 'Renata Schutz',
    vendedorOriginal: 'Renata Schutz',
    chegada: '15/10/2026',
    dataISO: '2026-10-15',
    diasAtras: 34,
    prazo: '25/10/2026 17:00',
    atraso: 'No Prazo',
    tempoParado: '0h',
    prazoEnvio: 'Concluído',
    gargaloCritico: false,
    status: 'Concluída',
    laudo: 'Concluído',
    dimensionalStatus: 'Completo (Ø32×P10×950)',
    etapaMacro: 'CONCLUIDO',
    etapaFluxo: 'CONCLUIDO_TOTAL',
    etapaAtualNumero: 8,
    laudoDifusoInicio: '16/10/2026 08:30',
    laudoFinalConclusao: '17/10/2026 15:00',
    responsavelTecnico: 'Depto. Projeto & Depto. Manutenção',
    urgencia: 'NORMAL',
    prioridade: 'MEDIA',
    solicitadoEmOrder: 112,
    solicitadoEm: '15/10/2026 09:20',
    solicitadoPor: 'Renata Schutz',
    diametro: '32',
    passo: '10',
    compTotal: '950',
    precisao: 'RETIFICADO',
    diretoriaOverride: false,
    gantt: { inicio: 1, laudo: 2, croqui: 2, desenho: 2, manut: 2, limite: 12 },
  },
];

/**
 * Converte ou deriva a data ISO (YYYY-MM-DD) de um BP no calendário de 2026.
 */
export function obterDataISOBP(item) {
  if (!item) return DATA_REF_ISO;
  if (item.dataISO && /^\d{4}-\d{2}-\d{2}$/.test(item.dataISO)) {
    return item.dataISO;
  }

  // Se houver diasAtras definido, calcula relativamente a 2026-11-18 para consistência com 30d/60d/90d
  if (typeof item.diasAtras === 'number' && !Number.isNaN(item.diasAtras)) {
    const base = new Date(`${DATA_REF_ISO}T12:00:00Z`);
    base.setUTCDate(base.getUTCDate() - Math.max(0, Math.round(item.diasAtras)));
    return base.toISOString().slice(0, 10);
  }

  // Fallback para string DD/MM/YYYY
  if (item.chegada && /^\d{2}\/\d{2}\/\d{4}$/.test(item.chegada.trim())) {
    const [dd, mm, yyyy] = item.chegada.trim().split('/');
    return `${yyyy}-${mm}-${dd}`;
  }

  return DATA_REF_ISO;
}

/**
 * Formata YYYY-MM-DD para DD/MM/YYYY
 */
export function formatarDataBR(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso || '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/**
 * Mescla os BPs ativos com a base histórica de 2026 quando necessário, sem duplicar BPs.
 */
export function obterBaseCompleta2026(bpsAtuais = []) {
  const existentes = new Set(bpsAtuais.map((b) => String(b.bp)));
  const complementares = HISTORICO_ANUAL_2026.filter((h) => !existentes.has(String(h.bp)));
  return [...bpsAtuais, ...complementares];
}

/**
 * Filtra a lista de BPs tanto pelos botões rápidos (30, 60, 90, TODOS)
 * quanto pelo modo de Calendário Personalizado (dataInicio -> dataFim).
 */
export function filtrarBPsPorPeriodoOuCalendario(bps = [], config = {}) {
  const {
    filtroPeriodo = '30',
    dataInicio = '2026-01-01',
    dataFim = DATA_REF_ISO,
    incluirHistorico2026 = true,
  } = config;

  // Para 30d mantemos exatamente os BPs com diasAtras <= 30;
  // Para 60d, 90d, TODOS ou CALENDARIO usamos a base completa de 2026.
  const base =
    filtroPeriodo === '30'
      ? bps
      : incluirHistorico2026
      ? obterBaseCompleta2026(bps)
      : bps;

  if (filtroPeriodo === 'TODOS') {
    return base;
  }

  if (filtroPeriodo === 'CALENDARIO') {
    const ini = dataInicio <= dataFim ? dataInicio : dataFim;
    const fim = dataInicio <= dataFim ? dataFim : dataInicio;
    return base.filter((item) => {
      const iso = obterDataISOBP(item);
      return iso >= ini && iso <= fim;
    });
  }

  const limiteDias = Number(filtroPeriodo) || 30;
  return base.filter((item) => (Number(item.diasAtras) || 10) <= limiteDias);
}

/**
 * Calcula estatísticas resumidas de um subconjunto de BPs para o comparativo.
 */
function resumirConjuntoComparativo(lista, filiaisDb, titulo, inicioISO, fimISO) {
  const resumo = calcularResumoSeisEtapas(lista, filiaisDb);
  return {
    titulo,
    inicioISO,
    fimISO,
    intervaloBR: `${formatarDataBR(inicioISO)} a ${formatarDataBR(fimISO)}`,
    totalBps: resumo.totalBps,
    totalFusos: resumo.totalFusos,
    realizadosBps: resumo.concluidosBps,
    realizadosFusos: resumo.concluidosFusos,
    paraFazerBps: resumo.paraFazerBps,
    paraFazerFusos: resumo.paraFazerFusos,
    etapas: {
      PRE_BP: resumo.etapas.PRE_BP.bps,
      AGUARDANDO_LAUDO: resumo.etapas.AGUARDANDO_LAUDO.bps,
      FILA_CROQUI: resumo.etapas.FILA_CROQUI.bps,
      FILA_DESENHO_FINAL: resumo.etapas.FILA_DESENHO_FINAL.bps,
      EM_MANUTENCAO: resumo.etapas.EM_MANUTENCAO.bps,
      CONCLUIDO: resumo.etapas.CONCLUIDO.bps,
    },
    porFilial: resumo.porFilial,
    itens: lista,
  };
}

/**
 * Calcula o comparativo entre dois pontos/intervalos no tempo:
 * - MES_A_MES (ex: Outubro/2026 vs Novembro/2026, ou Janeiro/2026 vs Novembro/2026)
 * - SEMANA_A_SEMANA (ex: Semana 46 vs Semana 47)
 * - INTERVALO_LIVRE (ex: Ponto A [01/01/2026 a 30/06/2026] vs Ponto B [01/07/2026 a 18/11/2026])
 */
export function calcularComparativoDatas(bps = [], filiaisDb = [], config = {}) {
  const {
    modoComparativo = 'MES_A_MES', // 'MES_A_MES' | 'SEMANA_A_SEMANA' | 'INTERVALO_LIVRE'
    mesA = '2026-10',
    mesB = '2026-11',
    semanaA = 'SEM-45',
    semanaB = 'SEM-46',
    inicioA = '2026-01-01',
    fimA = '2026-06-30',
    inicioB = '2026-07-01',
    fimB = DATA_REF_ISO,
  } = config;

  const baseAnual = obterBaseCompleta2026(bps);

  let rangeA = { rotulo: 'Período A', inicio: inicioA, fim: fimA };
  let rangeB = { rotulo: 'Período B', inicio: inicioB, fim: fimB };

  if (modoComparativo === 'MES_A_MES') {
    const objA = MESES_2026.find((m) => m.id === mesA) || MESES_2026[9];
    const objB = MESES_2026.find((m) => m.id === mesB) || MESES_2026[10];
    rangeA = { rotulo: objA.rotulo, inicio: objA.inicio, fim: objA.fim };
    rangeB = { rotulo: objB.rotulo, inicio: objB.inicio, fim: objB.fim };
  } else if (modoComparativo === 'SEMANA_A_SEMANA') {
    const objA = SEMANAS_2026.find((s) => s.id === semanaA) || SEMANAS_2026[5];
    const objB = SEMANAS_2026.find((s) => s.id === semanaB) || SEMANAS_2026[6];
    rangeA = { rotulo: objA.rotulo, inicio: objA.inicio, fim: objA.fim };
    rangeB = { rotulo: objB.rotulo, inicio: objB.inicio, fim: objB.fim };
  } else {
    const ia = inicioA <= fimA ? inicioA : fimA;
    const fa = inicioA <= fimA ? fimA : inicioA;
    const ib = inicioB <= fimB ? inicioB : fimB;
    const fb = inicioB <= fimB ? fimB : inicioB;
    rangeA = {
      rotulo: `Período A (${formatarDataBR(ia)} a ${formatarDataBR(fa)})`,
      inicio: ia,
      fim: fa,
    };
    rangeB = {
      rotulo: `Período B (${formatarDataBR(ib)} a ${formatarDataBR(fb)})`,
      inicio: ib,
      fim: fb,
    };
  }

  const listaA = baseAnual.filter((item) => {
    const iso = obterDataISOBP(item);
    return iso >= rangeA.inicio && iso <= rangeA.fim;
  });

  const listaB = baseAnual.filter((item) => {
    const iso = obterDataISOBP(item);
    return iso >= rangeB.inicio && iso <= rangeB.fim;
  });

  const pontoA = resumirConjuntoComparativo(listaA, filiaisDb, rangeA.rotulo, rangeA.inicio, rangeA.fim);
  const pontoB = resumirConjuntoComparativo(listaB, filiaisDb, rangeB.rotulo, rangeB.inicio, rangeB.fim);

  const calcDeltaPct = (valA, valB) => {
    if (valA === 0) return valB > 0 ? 100 : 0;
    return Math.round(((valB - valA) / valA) * 100);
  };

  // Série mensal de 2026 (Jan a Nov) para visualização de evolução Mês a Mês
  const serieMensal2026 = MESES_2026.map((m) => {
    const itensMes = baseAnual.filter((b) => {
      const iso = obterDataISOBP(b);
      return iso >= m.inicio && iso <= m.fim;
    });
    const fusosMes = itensMes.reduce((acc, b) => acc + (Number(b.quantidade) || 1), 0);
    const concluidosMes = itensMes.filter((b) => obterEtapaMacroBP(b) === 'CONCLUIDO').length;
    const paraFazerMes = itensMes.length - concluidosMes;
    return {
      ...m,
      bps: itensMes.length,
      fusos: fusosMes,
      realizados: concluidosMes,
      paraFazer: paraFazerMes,
    };
  });

  // Série semanal recente para visualização Semana a Semana
  const serieSemanal2026 = SEMANAS_2026.map((s) => {
    const itensSem = baseAnual.filter((b) => {
      const iso = obterDataISOBP(b);
      return iso >= s.inicio && iso <= s.fim;
    });
    const fusosSem = itensSem.reduce((acc, b) => acc + (Number(b.quantidade) || 1), 0);
    const concluidosSem = itensSem.filter((b) => obterEtapaMacroBP(b) === 'CONCLUIDO').length;
    return {
      ...s,
      bps: itensSem.length,
      fusos: fusosSem,
      realizados: concluidosSem,
      paraFazer: itensSem.length - concluidosSem,
    };
  });

  return {
    modoComparativo,
    pontoA,
    pontoB,
    variacao: {
      deltaBps: pontoB.totalBps - pontoA.totalBps,
      deltaPctBps: calcDeltaPct(pontoA.totalBps, pontoB.totalBps),
      deltaFusos: pontoB.totalFusos - pontoA.totalFusos,
      deltaPctFusos: calcDeltaPct(pontoA.totalFusos, pontoB.totalFusos),
      deltaRealizados: pontoB.realizadosBps - pontoA.realizadosBps,
      deltaParaFazer: pontoB.paraFazerBps - pontoA.paraFazerBps,
    },
    serieMensal2026,
    serieSemanal2026,
  };
}

function escaparHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Gera planilha Excel (.xls) totalmente formatada com cores institucionais MECTROL BP,
 * tabelas de Resumo do Período, Comparativo de Datas, Etapas por Departamento, 10 Filiais e Lista de BPs.
 */
export function gerarPlanilhaExcelXLS({
  bps = [],
  resumoFluxo,
  comparativo,
  periodoLabel = 'Últimos 30 Dias',
  observacoesAnalise = '',
  filiaisDb = [],
}) {
  const resumo = resumoFluxo || calcularResumoSeisEtapas(bps, filiaisDb);
  const dataGeracao = '18/11/2026';

  const linhasEtapas = [
    { etapa: '1. Pré-BP / Chegando (Depto. Fiscal → Depto. Manutenção)', bps: resumo.etapas.PRE_BP.bps, fusos: resumo.etapas.PRE_BP.fusos },
    { etapa: '2. Aguardando Laudo (Depto. Manutenção)', bps: resumo.etapas.AGUARDANDO_LAUDO.bps, fusos: resumo.etapas.AGUARDANDO_LAUDO.fusos },
    { etapa: '3. Fila de Croqui (Depto. Projeto)', bps: resumo.etapas.FILA_CROQUI.bps, fusos: resumo.etapas.FILA_CROQUI.fusos },
    { etapa: '4. Desenho Final (Depto. Projeto)', bps: resumo.etapas.FILA_DESENHO_FINAL.bps, fusos: resumo.etapas.FILA_DESENHO_FINAL.fusos },
    { etapa: '5. Depto. Manutenção (Execução Física)', bps: resumo.etapas.EM_MANUTENCAO.bps, fusos: resumo.etapas.EM_MANUTENCAO.fusos },
    { etapa: '6. Concluídos (Depto. Projeto & Depto. Manutenção)', bps: resumo.etapas.CONCLUIDO.bps, fusos: resumo.etapas.CONCLUIDO.fusos },
  ];

  const html = `\uFEFF<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: Arial, sans-serif; font-size: 11pt; color: #0F172A; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 18px; }
    th, td { border: 1px solid #CBD5E1; padding: 6px 10px; text-align: left; }
    .title { background-color: #0F172A; color: #FFFFFF; font-size: 14pt; font-weight: bold; }
    .subtitle { background-color: #1E293B; color: #38BDF8; font-size: 10pt; font-weight: bold; }
    .sec-header { background-color: #2563EB; color: #FFFFFF; font-weight: bold; font-size: 11pt; }
    .th-col { background-color: #E2E8F0; color: #0F172A; font-weight: bold; }
    .num { text-align: right; font-family: Consolas, monospace; font-weight: bold; }
    .ok { color: #15803D; font-weight: bold; }
    .warn { color: #B45309; font-weight: bold; }
  </style>
</head>
<body>
  <table>
    <tr><td colspan="9" class="title">MECTROL BP — RELATÓRIO EXECUTIVO &amp; COMPARATIVO DE BPs</td></tr>
    <tr><td colspan="9" class="subtitle">Período Filtrado: ${escaparHtml(periodoLabel)} | Data de Emissão: ${dataGeracao}</td></tr>
    ${observacoesAnalise ? `<tr><td colspan="9"><strong>Observações / Análise Final:</strong> ${escaparHtml(observacoesAnalise)}</td></tr>` : ''}
  </table>

  <table>
    <tr><td colspan="4" class="sec-header">1. RESUMO GERAL DE PRODUÇÃO NO PERÍODO</td></tr>
    <tr class="th-col">
      <th>Indicador</th>
      <th>Quantidade de BPs</th>
      <th>Total de Fusos</th>
      <th>Status / Observação</th>
    </tr>
    <tr>
      <td>Total de BPs no Período</td>
      <td class="num">${resumo.totalBps}</td>
      <td class="num">${resumo.totalFusos}</td>
      <td>Base consolidada das 10 Filiais</td>
    </tr>
    <tr>
      <td>Realizados / Concluídos</td>
      <td class="num ok">${resumo.concluidosBps}</td>
      <td class="num ok">${resumo.concluidosFusos}</td>
      <td>Ciclo finalizado (Depto. Manutenção &amp; Depto. Projeto)</td>
    </tr>
    <tr>
      <td>Para Fazer / Em Fila Ativa</td>
      <td class="num warn">${resumo.paraFazerBps}</td>
      <td class="num warn">${resumo.paraFazerFusos}</td>
      <td>Em andamento nos departamentos</td>
    </tr>
  </table>

  ${
    comparativo
      ? `<table>
    <tr><td colspan="5" class="sec-header">2. COMPARATIVO ENTRE DATAS / PERÍODOS (${escaparHtml(comparativo.pontoA.titulo)} vs. ${escaparHtml(comparativo.pontoB.titulo)})</td></tr>
    <tr class="th-col">
      <th>Métrica Comparada</th>
      <th>${escaparHtml(comparativo.pontoA.titulo)} (${escaparHtml(comparativo.pontoA.intervaloBR)})</th>
      <th>${escaparHtml(comparativo.pontoB.titulo)} (${escaparHtml(comparativo.pontoB.intervaloBR)})</th>
      <th>Diferença Absoluta</th>
      <th>Variação (%)</th>
    </tr>
    <tr>
      <td>Total de BPs</td>
      <td class="num">${comparativo.pontoA.totalBps}</td>
      <td class="num">${comparativo.pontoB.totalBps}</td>
      <td class="num">${comparativo.variacao.deltaBps >= 0 ? `+${comparativo.variacao.deltaBps}` : comparativo.variacao.deltaBps}</td>
      <td class="num">${comparativo.variacao.deltaPctBps >= 0 ? `+${comparativo.variacao.deltaPctBps}%` : `${comparativo.variacao.deltaPctBps}%`}</td>
    </tr>
    <tr>
      <td>Total de Fusos</td>
      <td class="num">${comparativo.pontoA.totalFusos}</td>
      <td class="num">${comparativo.pontoB.totalFusos}</td>
      <td class="num">${comparativo.variacao.deltaFusos >= 0 ? `+${comparativo.variacao.deltaFusos}` : comparativo.variacao.deltaFusos}</td>
      <td class="num">${comparativo.variacao.deltaPctFusos >= 0 ? `+${comparativo.variacao.deltaPctFusos}%` : `${comparativo.variacao.deltaPctFusos}%`}</td>
    </tr>
    <tr>
      <td>BPs Realizados (Concluídos)</td>
      <td class="num">${comparativo.pontoA.realizadosBps}</td>
      <td class="num">${comparativo.pontoB.realizadosBps}</td>
      <td class="num">${comparativo.variacao.deltaRealizados >= 0 ? `+${comparativo.variacao.deltaRealizados}` : comparativo.variacao.deltaRealizados}</td>
      <td class="num">-</td>
    </tr>
    <tr>
      <td>BPs Para Fazer (Em Fila)</td>
      <td class="num">${comparativo.pontoA.paraFazerBps}</td>
      <td class="num">${comparativo.pontoB.paraFazerBps}</td>
      <td class="num">${comparativo.variacao.deltaParaFazer >= 0 ? `+${comparativo.variacao.deltaParaFazer}` : comparativo.variacao.deltaParaFazer}</td>
      <td class="num">-</td>
    </tr>
  </table>`
      : ''
  }

  <table>
    <tr><td colspan="3" class="sec-header">3. DISTRIBUIÇÃO POR ETAPA E DEPARTAMENTO</td></tr>
    <tr class="th-col">
      <th>Etapa / Departamento</th>
      <th>Qtd. BPs</th>
      <th>Qtd. Fusos</th>
    </tr>
    ${linhasEtapas
      .map(
        (l) => `<tr>
      <td>${escaparHtml(l.etapa)}</td>
      <td class="num">${l.bps}</td>
      <td class="num">${l.fusos}</td>
    </tr>`
      )
      .join('')}
  </table>

  <table>
    <tr><td colspan="7" class="sec-header">4. VOLUME POR FILIAL (10 FILIAIS • DEPTO. COMERCIAL)</td></tr>
    <tr class="th-col">
      <th>Filial</th>
      <th>Supervisor (Depto. Comercial)</th>
      <th>Assistente (Depto. Comercial)</th>
      <th>Total BPs</th>
      <th>Total Fusos</th>
      <th>Fila de Croqui (Fusos)</th>
      <th>Desenho Final (Fusos)</th>
    </tr>
    ${resumo.porFilial
      .map(
        (f) => `<tr>
      <td>${escaparHtml(f.nome)}</td>
      <td>${escaparHtml(f.coordenador)}</td>
      <td>${escaparHtml(f.assistente)}</td>
      <td class="num">${f.totalBps}</td>
      <td class="num">${f.totalFusos}</td>
      <td class="num">${f.FILA_CROQUI}</td>
      <td class="num">${f.FILA_DESENHO_FINAL}</td>
    </tr>`
      )
      .join('')}
  </table>

  <table>
    <tr><td colspan="11" class="sec-header">5. LISTAGEM DETALHADA DE BPs (${bps.length} REGISTROS)</td></tr>
    <tr class="th-col">
      <th>BP</th>
      <th>Cliente</th>
      <th>Nota Fiscal</th>
      <th>Data Chegada</th>
      <th>Filial</th>
      <th>Vendedor (Depto. Comercial)</th>
      <th>Supervisor</th>
      <th>Qtd. Fusos</th>
      <th>Modalidade</th>
      <th>Dimensional (Ø×P×Comp)</th>
      <th>Nomenclatura Padrão (.ZIP)</th>
    </tr>
    ${bps
      .map((item) => {
        const eq = obterEquipeFilial(item.filial, filiaisDb);
        const dim =
          item.diametro && item.passo && item.compTotal
            ? `Ø${item.diametro}×P${item.passo}×${item.compTotal}mm`
            : 'Aguardando Laudo / Croqui';
        return `<tr>
      <td class="num">#${escaparHtml(item.bp)}</td>
      <td>${escaparHtml(item.cliente)}</td>
      <td class="num">${escaparHtml(item.nf)}</td>
      <td>${escaparHtml(formatarDataBR(obterDataISOBP(item)))}</td>
      <td>${escaparHtml(item.filial)}</td>
      <td>${escaparHtml(item.vendedor)}</td>
      <td>${escaparHtml(eq.coordenador)}</td>
      <td class="num">${item.quantidade}</td>
      <td>${escaparHtml(item.motivoRecebimento)}</td>
      <td>${escaparHtml(dim)}</td>
      <td>${escaparHtml(gerarNomePastaPadrao(item))}</td>
    </tr>`;
      })
      .join('')}
  </table>
</body>
</html>`;

  return html;
}

/**
 * Converte texto UTF-8/Latin para WinAnsi seguro para strings literais de PDF (%PDF-1.4).
 */
function limparTextoPDF(str) {
  return String(str ?? '')
    .replace(/→/g, '->')
    .replace(/•/g, '-')
    .replace(/·/g, '-')
    .replace(/×/g, 'x')
    .replace(/Ø/g, 'D')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/—/g, '-')
    .replace(/–/g, '-')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

/**
 * Codifica uma string JS (com acentos Latin1/WinAnsi) em Uint8Array de bytes 0..255.
 */
function stringParaBytesLatin1(str) {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    bytes[i] = code <= 255 ? code : 45; // '-' fallback
  }
  return bytes;
}

/**
 * Gera um arquivo PDF (%PDF-1.4) nativo binário formatado com layout de Dashboard Executivo
 * contendo: Cabeçalho MECTROL BP, KPIs do Período, Comparativo de Datas, Etapas por Departamento,
 * Resumo das 10 Filiais, Observações de Análise Final e Tabela de BPs.
 */
export function gerarRelatorioPDFBinario({
  bps = [],
  resumoFluxo,
  comparativo,
  periodoLabel = 'Últimos 30 Dias',
  observacoesAnalise = '',
  filiaisDb = [],
}) {
  const resumo = resumoFluxo || calcularResumoSeisEtapas(bps, filiaisDb);
  const ops = [];

  // Fundo do cabeçalho corporativo MECTROL BP
  ops.push('0.06 0.09 0.16 rg 30 765 535 52 re f');
  ops.push('0.15 0.39 0.92 rg 30 762 535 3 re f');

  const addText = (x, y, size, font, r, g, b, text) => {
    ops.push(`BT /${font} ${size} Tf ${r} ${g} ${b} rg ${x} ${y} Td (${limparTextoPDF(text)}) Tj ET`);
  };

  addText(42, 796, 15, 'F2', 1, 1, 1, 'MECTROL BP - DASHBOARD EXECUTIVO & ANALISE DE BPs');
  addText(42, 777, 9, 'F1', 0.58, 0.77, 0.99, `Periodo Analisado: ${periodoLabel}   |   Emissao: 18/11/2026`);

  // 4 Cards Superiores de KPIs no PDF
  const kpis = [
    { label: 'TOTAL DE BPs', val: `${resumo.totalBps} BPs`, sub: `${resumo.totalFusos} fusos no periodo`, r: 0.15, g: 0.39, b: 0.92 },
    { label: 'REALIZADOS (OK)', val: `${resumo.concluidosBps} BPs`, sub: `${resumo.concluidosFusos} fusos concluidos`, r: 0.09, g: 0.64, b: 0.29 },
    { label: 'PARA FAZER (FILA)', val: `${resumo.paraFazerBps} BPs`, sub: `${resumo.paraFazerFusos} fusos em fila`, r: 0.92, g: 0.35, b: 0.05 },
    { label: 'FILA DE CROQUI + DESENHO', val: `${resumo.etapas.FILA_CROQUI.bps + resumo.etapas.FILA_DESENHO_FINAL.bps} BPs`, sub: 'Depto. Projeto ativo', r: 0.02, g: 0.52, b: 0.78 },
  ];

  kpis.forEach((k, idx) => {
    const x = 30 + idx * 136;
    ops.push('0.95 0.97 0.99 rg ' + `${x} 702 127 50 re f`);
    ops.push(`${k.r} ${k.g} ${k.b} rg ${x} 749 127 3 re f`);
    addText(x + 8, 736, 7.5, 'F2', 0.3, 0.35, 0.45, k.label);
    addText(x + 8, 720, 13, 'F2', k.r, k.g, k.b, k.val);
    addText(x + 8, 708, 7.5, 'F1', 0.35, 0.4, 0.5, k.sub);
  });

  let curY = 682;

  // Bloco de Observações / Análise Final (se preenchido)
  if (observacoesAnalise && observacoesAnalise.trim()) {
    ops.push('0.98 0.96 0.88 rg 30 ' + (curY - 34) + ' 535 38 re f');
    addText(38, curY - 12, 8.5, 'F2', 0.55, 0.35, 0.05, 'OBSERVACOES / ANALISE FINAL DA GESTAO:');
    addText(38, curY - 25, 8.5, 'F1', 0.15, 0.2, 0.28, observacoesAnalise.trim().slice(0, 115));
    curY -= 46;
  }

  // Seção 1: Comparativo de Datas (Ponto A vs Ponto B)
  if (comparativo) {
    ops.push('0.12 0.16 0.23 rg 30 ' + (curY - 16) + ' 535 18 re f');
    addText(38, curY - 11, 9, 'F2', 1, 1, 1, `1. COMPARATIVO DE PERIODOS: ${comparativo.pontoA.titulo} vs. ${comparativo.pontoB.titulo}`);
    curY -= 30;

    const deltaSinal = comparativo.variacao.deltaBps >= 0 ? `+${comparativo.variacao.deltaBps}` : `${comparativo.variacao.deltaBps}`;
    const pctSinal = comparativo.variacao.deltaPctBps >= 0 ? `+${comparativo.variacao.deltaPctBps}%` : `${comparativo.variacao.deltaPctBps}%`;

    addText(
      36,
      curY,
      8.5,
      'F2',
      0.1,
      0.15,
      0.25,
      `Periodo A (${comparativo.pontoA.intervaloBR}): ${comparativo.pontoA.totalBps} BPs (${comparativo.pontoA.totalFusos} fusos) | Realizados: ${comparativo.pontoA.realizadosBps} | Para Fazer: ${comparativo.pontoA.paraFazerBps}`
    );
    curY -= 13;
    addText(
      36,
      curY,
      8.5,
      'F2',
      0.1,
      0.15,
      0.25,
      `Periodo B (${comparativo.pontoB.intervaloBR}): ${comparativo.pontoB.totalBps} BPs (${comparativo.pontoB.totalFusos} fusos) | Realizados: ${comparativo.pontoB.realizadosBps} | Para Fazer: ${comparativo.pontoB.paraFazerBps}`
    );
    curY -= 13;
    addText(
      36,
      curY,
      8.5,
      'F2',
      0.15,
      0.39,
      0.92,
      `Variacao entre os 2 pontos selecionados: ${deltaSinal} BPs (${pctSinal}) | Diferenca de Fusos: ${comparativo.variacao.deltaFusos >= 0 ? `+${comparativo.variacao.deltaFusos}` : comparativo.variacao.deltaFusos} fusos`
    );
    curY -= 18;
  }

  // Seção 2: Produção por Etapa e Departamento
  ops.push('0.12 0.16 0.23 rg 30 ' + (curY - 16) + ' 535 18 re f');
  addText(38, curY - 11, 9, 'F2', 1, 1, 1, '2. CARGA POR ETAPA E DEPARTAMENTO (DEPTO. FISCAL / DEPTO. MANUTENCAO / DEPTO. PROJETO)');
  curY -= 28;

  const etapasResumo = [
    `1. Pre-BP / Chegando (Depto. Fiscal -> Depto. Manutencao): ${resumo.etapas.PRE_BP.bps} BPs (${resumo.etapas.PRE_BP.fusos} fusos)`,
    `2. Avaliacao & Laudo (Depto. Manutencao): ${resumo.etapas.AGUARDANDO_LAUDO.bps} BPs (${resumo.etapas.AGUARDANDO_LAUDO.fusos} fusos)`,
    `3. Fila de Croqui (Depto. Projeto): ${resumo.etapas.FILA_CROQUI.bps} BPs (${resumo.etapas.FILA_CROQUI.fusos} fusos)`,
    `4. Desenho Final (Depto. Projeto): ${resumo.etapas.FILA_DESENHO_FINAL.bps} BPs (${resumo.etapas.FILA_DESENHO_FINAL.fusos} fusos)`,
    `5. Execucao Fisica (Depto. Manutencao): ${resumo.etapas.EM_MANUTENCAO.bps} BPs (${resumo.etapas.EM_MANUTENCAO.fusos} fusos)   |   6. Concluidos: ${resumo.etapas.CONCLUIDO.bps} BPs (${resumo.etapas.CONCLUIDO.fusos} fusos)`,
  ];

  etapasResumo.forEach((linha) => {
    addText(36, curY, 8.2, 'F1', 0.12, 0.16, 0.23, linha);
    curY -= 12;
  });

  curY -= 6;

  // Seção 3: Resumo das 10 Filiais (Depto. Comercial)
  ops.push('0.12 0.16 0.23 rg 30 ' + (curY - 16) + ' 535 18 re f');
  addText(38, curY - 11, 9, 'F2', 1, 1, 1, '3. DESEMPENHO DAS 10 FILIAIS (DEPTO. COMERCIAL - SUPERVISOR E ASSISTENTE)');
  curY -= 28;

  for (let i = 0; i < resumo.porFilial.length; i += 2) {
    const f1 = resumo.porFilial[i];
    const f2 = resumo.porFilial[i + 1];
    if (f1) {
      addText(
        36,
        curY,
        7.8,
        'F1',
        0.12,
        0.16,
        0.23,
        `${f1.codigo} ${f1.curto}: ${f1.totalBps} BPs / ${f1.totalFusos}f (Sup: ${f1.coordenador})`
      );
    }
    if (f2) {
      addText(
        305,
        curY,
        7.8,
        'F1',
        0.12,
        0.16,
        0.23,
        `${f2.codigo} ${f2.curto}: ${f2.totalBps} BPs / ${f2.totalFusos}f (Sup: ${f2.coordenador})`
      );
    }
    curY -= 11.5;
  }

  curY -= 6;

  // Seção 4: Tabela de BPs do Período
  ops.push('0.12 0.16 0.23 rg 30 ' + (curY - 16) + ' 535 18 re f');
  addText(38, curY - 11, 9, 'F2', 1, 1, 1, `4. RELAÇÃO DE BPs ANALISADOS (${bps.length} REGISTROS)`);
  curY -= 28;

  addText(36, curY, 7.8, 'F2', 0.2, 0.25, 0.35, 'BP #       CLIENTE                 DATA         FILIAL           FUSOS   DIMENSIONAL / ETAPA ATUAL');
  curY -= 11;

  const maxLinhas = Math.min(bps.length, Math.max(5, Math.floor((curY - 38) / 11)));
  for (let i = 0; i < maxLinhas; i++) {
    const b = bps[i];
    const eq = obterEquipeFilial(b.filial, filiaisDb);
    const dataBR = formatarDataBR(obterDataISOBP(b));
    const dim = b.diametro && b.passo && b.compTotal ? `D${b.diametro}xP${b.passo}x${b.compTotal}` : 'Aguard. Laudo';
    const etapaMacro = obterEtapaMacroBP(b);
    const linhaTxt = `#${String(b.bp).padEnd(8, ' ')} ${String(b.cliente).slice(0, 20).padEnd(22, ' ')} ${dataBR.padEnd(11, ' ')} ${String(eq.curto).slice(0, 14).padEnd(15, ' ')} ${String(b.quantidade + 'f').padEnd(6, ' ')} ${dim} (${etapaMacro})`;
    addText(36, curY, 7.4, 'F1', 0.15, 0.2, 0.28, linhaTxt);
    curY -= 10.5;
  }

  addText(30, 20, 7.5, 'F1', 0.45, 0.5, 0.58, 'Documento gerado automaticamente pelo painel MECTROL BP - Gestao de Fluxo, Departamentos e 10 Filiais.');

  const streamContent = ops.join('\n');

  const objetos = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n',
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n',
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n',
    `6 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream\nendobj\n`,
  ];

  let pdfStr = '%PDF-1.4\n';
  const offsets = [0];
  objetos.forEach((obj) => {
    offsets.push(pdfStr.length);
    pdfStr += obj;
  });

  const xrefPos = pdfStr.length;
  pdfStr += `xref\n0 ${objetos.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objetos.length; i++) {
    pdfStr += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdfStr += `trailer\n<< /Size ${objetos.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;

  return stringParaBytesLatin1(pdfStr);
}

/**
 * Dispara o download de um arquivo (Blob) no navegador sem usar window.open ou window.alert.
 */
export function dispararDownloadArquivo(conteudoOuBytes, nomeArquivo, mimeType) {
  if (typeof document === 'undefined') return false;
  const blob = new Blob([conteudoOuBytes], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
  return true;
}
