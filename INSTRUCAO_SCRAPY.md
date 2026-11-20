# Coleta local de BPs

## Situação atual

O portal Beta é uma aplicação autenticada e renderizada em JavaScript. O spider Scrapy existente não faz login nem carrega as atividades reais, por isso não deve ser usado para atualizar os dados.

Os registros obtidos do portal ficam em `local_data/historico_bps_desenho.json`. Esse arquivo e o log local são ignorados pelo Git e não devem ser movidos para `public/`, enviados ao Supabase ou commitados. O workflow público que fazia commit do CSV foi removido para evitar exposição de dados de clientes.

## Dashboard local

Execute `npm run dev` e abra `http://127.0.0.1:3000`. O servidor local fornece o JSON privado ao dashboard, que relê o arquivo a cada cinco minutos. O servidor está limitado ao computador local.

O arquivo contém os campos `BP`, `Cliente`, `Nota_Fiscal`, `Quantidade`, `Filial`, `Vendedor`, `Defeito`, `Status` e `Categoria_Solicitacao`. O carregador não adiciona mais registros de demonstração.

## Scrapy

`python scripts/run_scrapy.py` interrompe a execução intencionalmente: o spider ainda não suporta a autenticação e o fluxo da aplicação Beta. A coleta autenticada usa a API do portal em `scripts/sync_portal_api.js`.

## Atualização automática

O token da sessão fica no Windows Credential Manager, separado do código e do JSON. A tarefa `Mectrol BP dashboard sync` executa a coleta a cada cinco minutos enquanto a conta do Windows estiver conectada. Para recriar ou verificar a tarefa, execute `scripts/install_portal_sync_task.ps1`.

Cada sincronização consulta as quatro listas do portal, mantém apenas o processo de recebimento de material, busca os detalhes dos BPs e substitui o JSON atomicamente. Uma falha encerra a execução sem sobrescrever o último arquivo válido. O log local fica em `local_data/portal-sync.log`.
