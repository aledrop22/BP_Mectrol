import { DADOS_INICIAIS } from '../data/dados';

// Parser CSV simples (suporta campos entre aspas com vírgulas internas)
function parseCSV(texto) {
  const linhas = [];
  let campo = '', linha = [], emAspas = false;

  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (emAspas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') emAspas = false;
      else campo += c;
    } else if (c === '"') emAspas = true;
    else if (c === ',') { linha.push(campo); campo = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && texto[i + 1] === '\n') i++;
      linha.push(campo); campo = '';
      if (linha.length > 1 || linha[0] !== '') linhas.push(linha);
      linha = [];
    } else campo += c;
  }
  if (campo !== '' || linha.length) { linha.push(campo); linhas.push(linha); }
  return linhas;
}

function mapearLinha(cabecalho, valores) {
  const reg = Object.fromEntries(cabecalho.map((h, i) => [h.trim(), (valores[i] || '').trim()]));
  return {
    bp: reg.BP || '',
    cliente: reg.Cliente || '',
    razao: reg.Razao_Social || '',
    nf: reg.Nota_Fiscal || '',
    filial: reg.Filial || '',
    vendedor: reg.Vendedor || '',
    chegada: reg.Chegada || '',
    prazo: reg.Prazo || '',
    atraso: reg.Atraso || '',
    status: reg.Status || '',
    laudo: reg.Laudo || '',
    urgencia: (reg.Urgencia || 'NORMAL').toUpperCase(),
    alertaEmail: reg.Alerta_Email || '',
    diametro: reg.Diametro_Primitivo || '',
    passo: reg.Passo || '',
    compTotal: reg.Comp_Total || '',
    precisao: reg.Precisao || '',
  };
}

// Carrega public/historico_bps_desenho.csv (atualizado pelo GitHub Actions).
// Em caso de falha, usa os dados de demonstração embutidos.
export async function carregarDados() {
  try {
    const resp = await fetch('/historico_bps_desenho.csv', { cache: 'no-store' });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const texto = await resp.text();
    const [cabecalho, ...linhas] = parseCSV(texto);
    if (!cabecalho || !linhas.length) throw new Error('CSV vazio');
    return linhas.map(vals => mapearLinha(cabecalho, vals));
  } catch (err) {
    console.warn('Não foi possível carregar o CSV; usando dados de demonstração.', err);
    return DADOS_INICIAIS;
  }
}
