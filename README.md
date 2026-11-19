# MECTROL NextBP — Gestão de Croquis e Desenhos

Dashboard avançado (React + Tailwind) com 6 visualizações diferentes para gestão de BPs de desenho:
- Dashboard Visual com KPIs e gráficos
- Calendário de Exportação
- Fila de Prioridade
- Painel de Filiais e Vendedores
- Pipeline Diretoria Rápido
- Croquis Interativos

Alimentado pelo CSV `public/historico_bps_desenho.csv`, atualizado automaticamente
pelo Scrapy + GitHub Actions a cada 2 horas.

## Estrutura

```
├── index.html                  # Entrada do app Vite
├── package.json
├── vite.config.js
├── tailwind.config.js
├── public/
│   └── historico_bps_desenho.csv   # Base de dados consumida pelo painel
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
│   │   ├── dados.js            # Dados de demonstração (fallback offline)
│   │   └── temas.js            # Paletas de temas (dark/white, colorido/neutro)
│   └── lib/
│       ├── carregarDados.js    # Parser CSV + fetch do histórico
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
├── backup_original/            # Backup do código anterior
└── .github/workflows/
    └── atualizar-bps.yml       # Roda Scrapy a cada 2h e commita o CSV atualizado
```

## Como funciona o fluxo

1. **GitHub Actions** (`atualizar-bps.yml`) executa a cada 2h:
   - roda `scripts/run_scrapy.py`, que executa o spider Scrapy para extrair
     dados do sistema web interno da empresa;
   - gera/atualiza o arquivo `public/historico_bps_desenho.csv`;
   - *(opcional)* roda `scripts/monitor_email.py` para marcar BPs como URGENTE via IMAP;
   - commita o CSV atualizado no repositório.

2. **Vercel** serve o build do React; o app faz `fetch('/historico_bps_desenho.csv')`
   e renderiza o dashboard. Se o CSV falhar, usa os dados de `src/data/dados.js`.

3. **`organizar_pastas.py`** roda localmente: dado um BP, lê o CSV, monta o nome
   padrão (`BP 53193 - NF 1416969 - Fuso 40x10x1250`), cria a pasta do cliente
   em `\\SERVIDOR\Manutencao\Clientes\<CLIENTE>` se não existir, move as fotos
   da pasta temporária e gera o `.zip`.

## Rodar localmente

```bash
# Frontend
npm install
npm run dev        # painel em http://localhost:5173

# Scrapy (extração de dados)
pip install -r requirements.txt
cd scrapy_bp_mectrol
scrapy crawl bp_mectrol
# ou usar o script wrapper:
python scripts/run_scrapy.py
```

## Configuração necessária

### Secrets do GitHub (Settings → Secrets → Actions)
- `SISTEMA_URL`: URL do sistema web interno
- `SISTEMA_USUARIO`: Usuário de autenticação (se necessário)
- `SISTEMA_SENHA`: Senha de autenticação (se necessário)
- `IMAP_SERVIDOR`, `IMAP_USUARIO`, `IMAP_SENHA`: para o monitor de e-mail (opcional)

### Configuração do Scrapy
Edite `scrapy_bp_mectrol/spiders/bp_spider.py`:
1. Substitua `allowed_domains` pelo domínio real do sistema
2. Substitua `start_urls` pela URL real
3. Adapte os seletores CSS/XPath conforme a estrutura HTML do sistema
4. Se o sistema tiver API REST, use o método `parse_api()` em vez de `parse()`

### Configuração local
- **`scripts/organizar_pastas.py`**: ajuste `PASTA_SERVIDOR_MANUTENCAO` e
  `PASTA_FOTOS_AVULSAS` para os caminhos reais da sua rede.

### Deploy Vercel
Importe o repositório; a Vercel detecta Vite automaticamente
(build: `npm run build`, output: `dist`).

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
