import test from 'node:test';
import assert from 'node:assert/strict';
import { correspondeFiltroSolicitacao, obterEquipeFilial } from './filaEngine.js';

test('correspondeFiltroSolicitacao classifica BPs por status e atividade registrada', () => {
  const atrasada = { status: 'Atrasada' };
  const concluida = { status: 'Concluído' };
  const emAndamento = { status: 'Em Andamento' };
  const atividadeExecutada = { status: 'Em Andamento', laudoFinalConclusao: '20/11/2026 10:00' };
  const semAtividadeExecutada = { status: 'Em Andamento', laudoFinalConclusao: ' ' };

  assert.equal(correspondeFiltroSolicitacao(atrasada, 'PENDENCIAS'), true);
  assert.equal(correspondeFiltroSolicitacao(concluida, 'CONCLUIDAS'), true);
  assert.equal(correspondeFiltroSolicitacao(emAndamento, 'EM_ANDAMENTO'), true);
  assert.equal(correspondeFiltroSolicitacao(atividadeExecutada, 'ATIVIDADES_EXECUTADAS'), true);
  assert.equal(correspondeFiltroSolicitacao(semAtividadeExecutada, 'ATIVIDADES_EXECUTADAS'), false);
  assert.equal(correspondeFiltroSolicitacao(atrasada, 'TODOS'), true);
});

test('categoria real do portal prevalece sobre o status da atividade', () => {
  const atividadeConcluidaDeSolicitacaoAberta = {
    status: 'Em Andamento',
    categoriaSolicitacao: 'ATIVIDADES_EXECUTADAS',
  };

  assert.equal(correspondeFiltroSolicitacao(atividadeConcluidaDeSolicitacaoAberta, 'ATIVIDADES_EXECUTADAS'), true);
  assert.equal(correspondeFiltroSolicitacao(atividadeConcluidaDeSolicitacaoAberta, 'EM_ANDAMENTO'), false);
});

test('nome da filial prevalece sobre código divergente no portal', () => {
  const curitiba = obterEquipeFilial('03.03 - COMERCIAL CURITIBA');
  const caxias = obterEquipeFilial('03.05 - COMERCIAL CAXIAS');

  assert.equal(curitiba.curto, 'Curitiba');
  assert.equal(curitiba.assistente, 'Helena Viana');
  assert.equal(caxias.assistente, 'Não informado');
});
