import React, { useState } from 'react';
import {
  ShieldAlert,
  MailCheck,
  Upload,
  CheckCircle2,
  X,
  UserCheck,
  ArrowUpCircle,
} from 'lucide-react';

export default function ModalFuraFilaDiretoria({
  item,
  bpsAtivos,
  perfilAtivo,
  onFechar,
  onConfirmarFuraFila,
  onMudarPerfilParaDiretoria,
}) {
  const [bpEscolhido, setBpEscolhido] = useState(item?.bp || bpsAtivos[0]?.bp || '');
  const [modoValidacao, setModoValidacao] = useState(
    perfilAtivo === 'DIRETORIA' ? 'DIRETO_DIRETORIA' : 'ANEXO_EMAIL'
  );
  const [autorizador, setAutorizador] = useState('Roberto Mectrol (Diretor Industrial)');
  const [motivo, setMotivo] = useState(
    'Vendedor alinhou com a Diretoria: cliente com máquina parada em linha crítica. Autorizado subir para #1 da fila geral.'
  );
  const [nomeArquivoEmail, setNomeArquivoEmail] = useState(
    item?.emailComprovante || `autorizacao_diretoria_bp_${item?.bp || 'novo'}.eml`
  );
  const [erro, setErro] = useState('');

  const bpObj = bpsAtivos.find((b) => String(b.bp) === String(bpEscolhido)) || item;

  const handleUploadSimulado = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setNomeArquivoEmail(file.name);
      setErro('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErro('');

    if (!motivo.trim()) {
      setErro('Descreva o motivo ou alinhamento comercial autorizado pela Diretoria.');
      return;
    }

    if (modoValidacao === 'ANEXO_EMAIL' && !nomeArquivoEmail.trim()) {
      setErro('Anexe ou informe o e-mail de validação da Diretoria para liberar o Fura-Fila.');
      return;
    }

    try {
      onConfirmarFuraFila(bpEscolhido, {
        autorizador,
        motivo,
        emailComprovante:
          modoValidacao === 'DIRETO_DIRETORIA'
            ? 'Aprovação Direta no Painel da Diretoria'
            : nomeArquivoEmail,
        perfilAtivo: modoValidacao === 'DIRETO_DIRETORIA' ? 'DIRETORIA' : perfilAtivo,
      });
      onFechar();
    } catch (err) {
      setErro(err.message || 'Erro ao validar Fura-Fila.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-furafila-titulo"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
    >
      <div
        className="w-full max-w-xl rounded-xl border p-6 space-y-5 shadow-2xl"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-strong)',
          color: 'var(--text-primary)',
        }}
      >
        <div className="flex items-start justify-between gap-4 pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
              <ShieldAlert className="w-4 h-4" />
              <span>Governança de Prioridade Extrema • Fura-Fila Oficial</span>
            </div>
            <h2 id="modal-furafila-titulo" className="text-lg font-bold mt-1">
              Passar BP na Frente de Todos (#1 Topo da Fila)
            </h2>
          </div>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar modal Fura-Fila"
            className="p-1.5 rounded-lg border hover:opacity-80"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              BP que subirá para #1 da Fila Geral
            </label>
            <select
              value={bpEscolhido}
              onChange={(e) => setBpEscolhido(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-sm font-mono border"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-strong)',
                color: 'var(--text-primary)',
              }}
            >
              {bpsAtivos.map((b) => (
                <option key={b.bp} value={b.bp}>
                  BP #{b.bp} — {b.cliente} (NF {b.nf}) • Vendedor: {b.vendedor}
                </option>
              ))}
            </select>
          </div>

          {/* Escolha do Método de Validação */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setModoValidacao('DIRETO_DIRETORIA')}
              className="p-3 rounded-lg border text-left transition-all"
              style={{
                backgroundColor:
                  modoValidacao === 'DIRETO_DIRETORIA' ? 'rgba(225, 29, 72, 0.14)' : 'var(--bg-subtle)',
                borderColor:
                  modoValidacao === 'DIRETO_DIRETORIA' ? '#F43F5E' : 'var(--border-subtle)',
              }}
            >
              <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                <UserCheck className="w-4 h-4" />
                <span>Acesso Direto da Diretoria</span>
              </div>
              <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                A própria Diretoria autoriza no painel após conversa com o vendedor.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setModoValidacao('ANEXO_EMAIL')}
              className="p-3 rounded-lg border text-left transition-all"
              style={{
                backgroundColor:
                  modoValidacao === 'ANEXO_EMAIL' ? 'var(--accent-soft)' : 'var(--bg-subtle)',
                borderColor:
                  modoValidacao === 'ANEXO_EMAIL' ? 'var(--accent-primary)' : 'var(--border-subtle)',
              }}
            >
              <div className="flex items-center gap-2 text-xs font-bold" style={{ color: 'var(--accent-text)' }}>
                <MailCheck className="w-4 h-4" />
                <span>Anexar E-mail de Validação</span>
              </div>
              <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                Anexa comprovante de e-mail em que a Diretoria autorizou passar na frente.
              </p>
            </button>
          </div>

          {modoValidacao === 'ANEXO_EMAIL' && (
            <div
              className="rounded-lg p-3.5 border space-y-2.5"
              style={{
                backgroundColor: 'var(--bg-subtle)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <label className="block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                Comprovante de E-mail / Validação da Diretoria (.eml, .msg, .pdf ou assunto)
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={nomeArquivoEmail}
                  onChange={(e) => setNomeArquivoEmail(e.target.value)}
                  placeholder="Ex: aprovacao_diretoria_bp.eml"
                  className="flex-1 rounded-lg px-3 py-2 text-xs font-mono border"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border-strong)',
                    color: 'var(--text-primary)',
                  }}
                />
                <label
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border cursor-pointer"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border-strong)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Anexar Arquivo</span>
                  <input type="file" onChange={handleUploadSimulado} className="hidden" />
                </label>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
              Diretor Autorizador
            </label>
            <input
              type="text"
              value={autorizador}
              onChange={(e) => setAutorizador(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-xs border"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-strong)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
              Justificativa / Alinhamento Vendedor & Diretoria
            </label>
            <textarea
              rows={3}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-xs border"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-strong)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {erro && (
            <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/40 text-xs text-rose-400">
              {erro}
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onFechar}
              className="px-4 py-2 rounded-lg text-xs font-semibold border"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-secondary)',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition"
            >
              <ArrowUpCircle className="w-4 h-4" />
              <span>Aprovar Fura-Fila (#1 da Fila Geral)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
