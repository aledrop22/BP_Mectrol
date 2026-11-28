import React, { useEffect, useState } from 'react';
import { KeyRound, Save, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function PainelConfigColeta() {
  const [status, setStatus] = useState(null);
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [aberto, setAberto] = useState(false);

  const carregarStatus = async () => {
    try {
      const res = await fetch('/local-data/portal-credentials', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      setStatus(data);
      if (data.usuario) setUsuario(data.usuario);
    } catch {
      // Endpoint indisponível fora do servidor de desenvolvimento local.
    }
  };

  useEffect(() => {
    void carregarStatus();
  }, []);

  const salvar = async (event) => {
    event.preventDefault();
    setSalvando(true);
    setFeedback(null);
    try {
      const res = await fetch('/local-data/portal-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, senha }),
      });
      const texto = await res.text();
      if (res.ok) {
        setFeedback({ ok: true, msg: 'Credenciais salvas no Windows Credential Manager. A sincronização passa a entrar automaticamente.' });
        setSenha('');
        void carregarStatus();
      } else {
        setFeedback({ ok: false, msg: texto || 'Não foi possível salvar as credenciais.' });
      }
    } catch {
      setFeedback({ ok: false, msg: 'Falha de conexão com o servidor local.' });
    } finally {
      setSalvando(false);
    }
  };

  const configurado = Boolean(status?.usuarioConfigurado && status?.senhaConfigurada);

  return (
    <section
      aria-label="Configuração da Coleta Local"
      className="rounded-xl border p-3 space-y-2"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <button
        type="button"
        onClick={() => setAberto((prev) => !prev)}
        className="w-full flex items-center justify-between gap-2 text-left"
      >
        <span className="flex items-center gap-2 text-xs font-extrabold" style={{ color: 'var(--text-primary)' }}>
          <KeyRound className="w-3.5 h-3.5" style={{ color: 'var(--accent-text)' }} />
          Configuração da Coleta (login automático do portal)
        </span>
        <span className="flex items-center gap-2">
          <span
            className="text-[10px] font-mono font-bold px-2 py-0.5 rounded"
            style={{
              backgroundColor: configurado ? 'rgba(16,185,129,0.15)' : 'rgba(234,179,8,0.15)',
              color: configurado ? '#10B981' : '#EAB308',
            }}
          >
            {configurado ? 'Credenciais salvas' : 'Credenciais pendentes'}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{aberto ? '▲' : '▼'}</span>
        </span>
      </button>

      {aberto && (
        <form onSubmit={salvar} className="flex flex-wrap items-end gap-2 pt-1">
          <label className="flex flex-col gap-1 text-[10px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
            E-mail / Usuário do portal
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="seu@email.com"
              autoComplete="username"
              className="rounded-lg px-2.5 py-1.5 text-xs border w-56"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-strong)',
                color: 'var(--text-primary)',
              }}
            />
          </label>
          <label className="flex flex-col gap-1 text-[10px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
            Senha do portal
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder={status?.senhaConfigurada ? '•••••••• (salva)' : 'Digite a senha'}
              autoComplete="current-password"
              className="rounded-lg px-2.5 py-1.5 text-xs border w-44"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-strong)',
                color: 'var(--text-primary)',
              }}
            />
          </label>
          <button
            type="submit"
            disabled={salvando || !usuario.trim() || !senha}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white rounded-lg transition disabled:opacity-50"
            style={{ backgroundColor: 'var(--accent-primary)' }}
          >
            <Save className="w-3.5 h-3.5" />
            {salvando ? 'Salvando...' : 'Salvar credenciais'}
          </button>
          {status?.usuario && (
            <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
              Conta atual: {status.usuario}
            </span>
          )}
        </form>
      )}

      {feedback && (
        <p
          className="text-[11px] flex items-center gap-1.5"
          style={{ color: feedback.ok ? '#10B981' : '#EF4444' }}
        >
          {feedback.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
          {feedback.msg}
        </p>
      )}

      {!aberto && (
        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          Salva e-mail e senha do portal no Windows Credential Manager para a coleta entrar sozinha quando a sessão expirar.
        </p>
      )}
    </section>
  );
}
