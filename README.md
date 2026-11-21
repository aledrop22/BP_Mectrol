# MECTROL NextBP — Gestão de Croquis e Desenhos

Dashboard avançado (React + Tailwind) com 6 visualizações diferentes para gestão de BPs de desenho:
- Dashboard Visual com KPIs e gráficos
- Calendário de Exportação
- Fila de Prioridade
- Painel de Filiais e Vendedores
- Pipeline Diretoria Rápido
- Croquis Interativos

Os dados são coletados do portal MECTROL e mantidos localmente em
`local_data/historico_bps_desenho.json`. O painel local não usa senha própria,
planilha ou armazenamento na Vercel.

## Estrutura

```
├── index.html                  # Entrada do app Vite
├── package.json
├── vite.config.js
├── tailwind.config.js
├── local_data/
│   ├── historico_bps_desenho.json  # Dados locais (ignorado pelo Git)
│   └── portal-sync-cache.json      # Cache de comparação local
├── src/
│   ├── main.jsx
│   ├── App.jsx                  # Dashboard principal com 6 visualizações
│   ├── index.css
│   ├── components/              # Componentes avançados
│   │   ├── CardBPEvoluido.jsx
│   │   ├── ModalFuraFilaDiretoria.jsx
│   │   ├── PainelDashboardVisual.jsx
│   │   ├── PainelCalendarioExportacao.jsx
│   │   ├── PainelFilaPrioridade.jsx
│   │   ├── PainelFiliaisVendedores.jsx
│   │   ├── PipelineDiretoriaRapido.jsx
│   │   └── SidebarCroquis.jsx
│   ├── data/
│   │   ├── dados.js            # Configuração inicial das filiais
│   │   └── temas.js            # Paletas de temas (dark/white, colorido/neutro)
│   └── lib/
│       ├── carregarDados.js    # Leitura do JSON local
│       ├── filaEngine.js       # Motor de ordenação de fila
│       └── comparativoExportEngine.js  # Motor de calendário/exportação
├── scripts/
│   ├── organizar_pastas.py      # Cria pasta do cliente na rede + .ZIP padronizado
│   ├── monitor_email.py        # Lê caixa IMAP e marca BPs como URGENTE
│   └── run_scrapy.py           # Executa o spider Scrapy
├── scrapy_bp_mectrol/           # Projeto Scrapy para extração de dados
│   ├── scrapy.cfg
│   ├── items.py
│   ├── pipelines.py
│   ├── settings.py
│   ├── middlewares.py
│   └── spiders/
│       └── bp_spider.py         # Spider para extrair dados do sistema web interno
├── requirements.txt
└── backup_original/            # Backup do código anterior
```

## Como funciona o fluxo local

1. `scripts/install_portal_sync_task.ps1` agenda a coleta a cada cinco minutos.
2. `scripts/sync_portal_api.js` compara os BPs com o cache e grava o JSON local
   somente quando os dados mudam.
3. `npm run dev` abre o painel em `http://127.0.0.1:3000`; a tela relê o JSON
   local a cada cinco minutos.

O token de sessão é usado apenas para acessar o portal de origem e fica no Windows
Credential Manager. Os dados e o cache em `local_data/` são ignorados pelo Git.

## Rodar localmente

```bash
npm run dev        # painel em http://127.0.0.1:3000
```

Para instalar a sincronização automática de cinco em cinco minutos, execute
`scripts/install_portal_sync_task.ps1` uma vez no Windows. A coleta requer o token
de sessão do portal de origem; o painel local não pede senha.

Extração detalhada alternativa, fora do fluxo automático: `python scripts/extract_bp_details.py`.

### Sincronização incremental do portal (Windows)

A tarefa instalada por `scripts/install_portal_sync_task.ps1` consulta as quatro
listas do portal a cada cinco minutos e salva os dados somente neste computador
em `local_data/historico_bps_desenho.json`.
Os detalhes de BPs sem mudanças são reutilizados do cache local
`local_data/portal-sync-cache.json`, evitando consultar novamente cada BP a cada ciclo.
O painel local lê esse JSON e atualiza a tela a cada cinco minutos. Nenhuma senha
do painel, segredo da Vercel ou planilha é necessária. O token de sessão do portal
é usado somente para acessar os dados de origem e fica no Windows Credential Manager.
Os arquivos de dados locais são ignorados pelo Git e não são enviados ao repositório.

### Configuração local
- **`scripts/organizar_pastas.py`**: ajuste `PASTA_SERVIDOR_MANUTENCAO` e
  `PASTA_FOTOS_AVULSAS` para os caminhos reais da sua rede.

## Correções aplicadas

- `monitor_email.py`: adicionado `import re`, corrigida indentação quebrada
  em `ids_emails` e adicionado tratamento das colunas `Urgencia`/`Alerta_Email`.
- `organizar_pastas.py`: adicionado `import re` (era usado sem import).
- Frontend: migrado para layout avançado com 6 visualizações e temas customizáveis.
- Scrapy: adicionado projeto completo para extração de dados do sistema web interno.

## Dashboard Visualizações

1. **DASH_1**: Dashboard Visual com KPIs, gráficos de tempo e status
2. **DASH_2**: Calendário de Exportação com visualização por período
3. **DASH_3**: Fila de Prioridade com ordenação por urgência
4. **DASH_4**: Painel de Filiais e Vendedores com capacidade de gestão
5. **DASH_5**: Pipeline Diretoria Rápido para emergências
6. **DASH_6**: Croquis Interativos com visualização técnica
