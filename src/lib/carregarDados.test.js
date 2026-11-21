import assert from 'node:assert/strict';
import test from 'node:test';
import { carregarDados } from './carregarDados.js';

test('carrega e mapeia registros do JSON local', async () => {
  const fetchOriginal = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/bps');
    assert.equal(options.cache, 'no-store');
    return {
      ok: true,
      json: async () => ({
        registros: [{
          BP: '12345',
          Cliente: 'Cliente teste',
          Nota_Fiscal: 'NF-123',
          Quantidade: 2,
          Filial: 'Campinas',
          Vendedor: 'Vendedor teste',
          Defeito: 'Defeito teste',
          Status: 'Pendente',
          Categoria_Solicitacao: 'PENDENCIAS',
        }],
      }),
    };
  };

  try {
    const [bp] = await carregarDados();
    assert.equal(bp.bp, '12345');
    assert.equal(bp.cliente, 'Cliente teste');
    assert.equal(bp.nf, 'NF-123');
    assert.equal(bp.quantidade, 2);
    assert.equal(bp.categoriaSolicitacao, 'PENDENCIAS');
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

test('rejeita JSON sem registros válidos', async () => {
  const fetchOriginal = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({ registros: [] }),
  });

  try {
    await assert.rejects(carregarDados(), /não retornou registros de BP válidos/);
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

test('usa o JSON estático quando a API local não existe', async () => {
  const fetchOriginal = globalThis.fetch;
  const urls = [];
  globalThis.fetch = async (url) => {
    urls.push(url);
    if (url === '/api/bps') return { ok: false, status: 404 };
    return {
      ok: true,
      json: async () => ({
        registros: [{ BP: '777', Cliente: 'Cliente publicado', Quantidade: 3 }],
      }),
    };
  };

  try {
    const [bp] = await carregarDados();
    assert.deepEqual(urls, ['/api/bps', '/historico_bps_desenho.json']);
    assert.equal(bp.bp, '777');
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

test('normaliza quantidade para inteiro sem zeros decimais', async () => {
  const fetchOriginal = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({
      registros: [{ BP: '778', Quantidade: '10.0' }],
    }),
  });

  try {
    const [bp] = await carregarDados();
    assert.equal(bp.quantidade, 10);
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});
