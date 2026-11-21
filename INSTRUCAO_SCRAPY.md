# Coleta local de BPs

## Coleta local

O portal Beta é uma aplicação autenticada e renderizada em JavaScript. O spider Scrapy existente não faz login nem carrega as atividades reais, por isso não deve ser usado para atualizar os dados.

`python scripts/run_scrapy.py` interrompe a execução intencionalmente: o spider ainda não suporta a autenticação e o fluxo da aplicação Beta. A coleta autenticada usa a API do portal em `scripts/sync_portal_api.js`.

O coletor grava os registros em `local_data/historico_bps_desenho.json` somente quando há alterações. O cache de comparação fica em `local_data/portal-sync-cache.json`; ambos, assim como o log local, são ignorados pelo Git e não devem ser movidos para `public/`, enviados ao Supabase ou commitados.

## Atualização automática e painel

A tarefa `Mectrol BP dashboard sync` executa a coleta a cada cinco minutos enquanto a conta do Windows estiver conectada. Para instalar ou verificar a tarefa, execute `scripts/install_portal_sync_task.ps1`. Cada sincronização consulta as quatro listas e reutiliza detalhes sem alterações. Uma falha não sobrescreve o último JSON válido; o log fica em `local_data/portal-sync.log`.

Para abrir o painel sem senha própria, execute `npm run dev` e acesse `http://127.0.0.1:3000`. Ele lê o JSON local e atualiza a tela a cada cinco minutos. O token de sessão fica no Windows Credential Manager porque o portal de origem exige autenticação; não é uma senha do painel nem um segredo da Vercel.
