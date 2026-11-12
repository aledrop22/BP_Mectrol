# MECTROL NextBP — Gestão de Croquis e Desenhos

Painel web (React + Tailwind) que exibe a fila de BPs de desenho, com edição
rápida das medidas do fuso, cópia do nome padrão de pasta e prioridade por
e-mail — alimentado pelo CSV `public/historico_bps_desenho.csv`, atualizado
automaticamente pelo GitHub Actions a cada 2 horas.

## Estrutura

```
├── index.html                  # Entrada do app Vite
├── package.json
├── vite.config.js
├── tailwind.config.js
├── public/
│   └── historico_bps_desenho.csv   # Base de dados consumida pelo painel (e pela Vercel)
├── src/
│   ├── main.jsx
│   ├── App.jsx                  # Dashboard (KPIs, filtros, tabela, edição inline)
│   ├── index.css
│   ├── data/dados.js            # Dados de demonstração (fallback offline)
│   └── lib/carregarDados.js     # Parser CSV + fetch do histórico
├── scripts/
│   ├── organizar_pastas.py      # Cria pasta do cliente na rede + .ZIP padronizado
│   └── monitor_email.py        # Lê caixa IMAP e marca BPs como URGENTE
├── requirements.txt
└── .github/workflows/
    └── atualizar-bps.yml       # Roda a cada 2h e commita o CSV atualizado
```

## Como funciona o fluxo

1. **GitHub Actions** (`atualizar-bps.yml`) executa a cada 2h:
   - roda `scripts/monitor_email.py`, que varre e-mails não lidos via IMAP,
     procura números de BP (5 dígitos) acompanhados de termos como
     "urgente", "prioridade", "hoje" e marca `Urgencia = ALTA` no CSV;
   - *(adicione aqui o robô que coleta os BPs do sistema de origem)*;
   - commita o `historico_bps_desenho.csv` atualizado.
2. **Vercel** serve o build do React; o app faz `fetch('/historico_bps_desenho.csv')`
   e renderiza a tabela. Se o CSV falhar, usa os dados de `src/data/dados.js`.
3. **`organizar_pastas.py`** roda localmente: dado um BP, lê o CSV, monta o nome
   padrão (`BP 53193 - NF 1416969 - Fuso 40x10x1250`), cria a pasta do cliente
   em `\\SERVIDOR\Manutencao\Clientes\<CLIENTE>` se não existir, move as fotos
   da pasta temporária e gera o `.zip`.

## Rodar localmente

```bash
npm install
npm run dev        # painel em http://localhost:5173
```

## Configuração necessária

- **Secrets do GitHub** (Settings → Secrets → Actions):
  `IMAP_SERVIDOR`, `IMAP_USUARIO`, `IMAP_SENHA` — para o monitor de e-mail.
- **`scripts/organizar_pastas.py`**: ajuste `PASTA_SERVIDOR_MANUTENCAO` e
  `PASTA_FOTOS_AVULSAS` para os caminhos reais da sua rede.
- **Deploy Vercel**: importe o repositório; a Vercel detecta Vite automaticamente
  (build: `npm run build`, output: `dist`).

## Correções aplicadas em relação ao código original

- `monitor_email.py`: adicionado `import re`, corrigida indentação quebrada
  em `ids_emails` e adicionado tratamento das colunas `Urgencia`/`Alerta_Email`.
- `organizar_pastas.py`: adicionado `import re` (era usado sem import).
- Frontend: dados movidos para `src/data/dados.js`; adicionado carregamento
  real do CSV via `src/lib/carregarDados.js`.
