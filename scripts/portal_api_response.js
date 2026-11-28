export function portalApiValidationError(payload) {
  const messages = payload?.validation?.messages
  if (!Array.isArray(messages)) return null

  const text = messages
    .map((item) => (typeof item?.message === 'string' ? item.message.trim() : ''))
    .filter(Boolean)
    .join('; ')

  if (/token\s+inv[aá]lido/i.test(text)) {
    return 'O token de sessão do portal expirou ou foi revogado. O sincronizador tenta entrar novamente com as credenciais salvas; se persistir, revise e-mail e senha em Configuração da Coleta no painel local.'
  }
  if (text) return `O portal rejeitou a solicitação: ${text}`
  return 'O portal rejeitou a solicitação por falha de validação.'
}
