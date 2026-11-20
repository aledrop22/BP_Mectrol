import assert from 'node:assert/strict';
import test from 'node:test';
import { carregarDados } from './carregarDados.js';

test('carrega e mapeia registros do JSON local', async () => {
  const fetchOriginal = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/local-data/historico_bps_desenho.json');
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
    await assert.rejects(carregarDados(), /não contém registros de BP válidos/);
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});
