import { useEffect, useState } from 'react'

export default function PortalLogin({ checking = false, initialError = '', onAuthenticated }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(initialError)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setError(initialError)
  }, [initialError])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.message || 'Não foi possível autenticar.')
      }
      setPassword('')
      onAuthenticated()
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--bg-canvas)' }}>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border p-6 shadow-2xl"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
      >
        <p className="text-sm font-bold tracking-widest" style={{ color: 'var(--accent-text)' }}>
          MECTROL BP
        </p>
        <h1 className="mt-3 text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Acesso ao painel
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Informe a senha para acessar os dados de processos.
        </p>

        {checking ? (
          <p role="status" className="mt-5 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Verificando acesso...
          </p>
        ) : (
          <>
            <label htmlFor="dashboard-password" className="mt-5 block text-sm font-medium">
              Senha
            </label>
            <input
              id="dashboard-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none"
              style={{
                backgroundColor: 'var(--bg-canvas)',
                borderColor: 'var(--border-strong)',
                color: 'var(--text-primary)',
              }}
            />
            {error && (
              <p role="alert" className="mt-3 text-sm text-red-400">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="mt-5 w-full rounded-lg px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              {submitting ? 'Entrando...' : 'Entrar'}
            </button>
          </>
        )}
      </form>
    </main>
  )
}
