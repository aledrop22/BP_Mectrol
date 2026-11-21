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

Cada sincronização consulta as quatro listas do portal, mantém apenas o processo de recebimento de material, busca os detalhes dos BPs e substitui o JSON atomicamente. O painel local lê o JSON pelo endpoint local. Uma falha encerra a execução sem sobrescrever o último arquivo válido. O log local fica em `local_data/portal-sync.log`.

## Painel publicado na Vercel

Os dados não são publicados no GitHub nem em um arquivo público. Para mostrar os BPs em `https://bp-mectrol.vercel.app`, conecte um Vercel Blob com acesso **Private** ao projeto e configure as variáveis de ambiente de **Production**:

- `BP_DASHBOARD_PASSWORD`: segredo aleatório com pelo menos 32 caracteres, usado para entrar no painel.
- `BP_SYNC_SECRET`: segredo aleatório diferente, com pelo menos 32 caracteres, usado para a publicação autenticada do coletor.

Ao criar/conectar o Blob, habilite **Add a read-write token env var to this connection** para que a Vercel adicione `BLOB_READ_WRITE_TOKEN` ao ambiente de Production. Faça um novo deploy depois de configurar o Blob e as variáveis.

No computador que executa a coleta, rode `scripts/set_vercel_sync_secret.ps1` e informe o mesmo `BP_SYNC_SECRET` no prompt seguro. O segredo será salvo no Windows Credential Manager, sem ir para o código ou para o JSON. A tarefa de cinco minutos passará a enviar o arquivo ao endpoint autenticado, que o grava no Blob privado. Os usuários do painel precisam informar `BP_DASHBOARD_PASSWORD`; o endpoint de leitura não publica uma URL aberta para o Blob.

Para gerar cada segredo localmente sem gravá-lo em um arquivo, use `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"` duas vezes e configure os valores diretamente nas variáveis da Vercel.
