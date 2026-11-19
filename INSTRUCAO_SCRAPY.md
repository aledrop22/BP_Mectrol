# Instruções para Configurar Scrapy para bp.mectrol.com.br

## Situação Atual

O site https://bp.mectrol.com.br/ é uma **SPA (Single Page Application)** que:
- Usa JavaScript para carregar dados dinamicamente
- Não tem tabelas HTML visíveis no código fonte inicial
- Dados são carregados via API ou JavaScript após o carregamento

## Opções para Extração de Dados

### Opção 1: Encontrar a API Interna (RECOMENDADO)

1. Abra https://bp.mectrol.com.br/ no navegador
2. Pressione F12 para abrir as Ferramentas de Desenvolvedor
3. Vá na aba **Network** (Rede)
4. Recarregue a página (F5)
5. Filtre por "XHR" ou "Fetch"
6. Procure requisições que retornam JSON com dados dos BPs
7. Clique na requisição e copie a URL

Exemplo de URL que pode aparecer:
- `https://bp.mectrol.com.br/api/bps`
- `https://bp.mectrol.com.br/api/v1/business-process`
- `https://bp.mectrol.com.br/service/list`

Depois de encontrar a URL:
1. Edite `scrapy_bp_mectrol/spiders/bp_spider.py`
2. Substitua `start_urls` pela URL da API que você encontrou
3. Adapte o método `parse_api()` para extrair os campos corretos

### Opção 2: Usar Selenium (Requer ChromeDriver)

```bash
# Instalar ChromeDriver
# Baixe de: https://chromedriver.chromium.org/downloads
# Coloque no PATH ou na pasta do projeto

# Instalar dependências
pip install selenium

# Executar
python scripts/extract_with_selenium.py
```

### Opção 3: Exportação Manual (Mais Rápido para Começar)

Se o sistema tiver um botão de exportar para Excel/CSV:

1. Acesse https://bp.mectrol.com.br/
2. Faça login se necessário
3. Exporte os dados para Excel/CSV
4. Salve como `public/historico_bps_desenho.csv`
5. O dashboard lerá esse arquivo automaticamente

### Opção 4: Integração Direta com Backend

Se você tiver acesso ao backend/servidor do sistema:

1. Crie um endpoint API interno que retorne os dados em JSON
2. Configure o Scrapy para acessar esse endpoint
3. O workflow GitHub Actions pode chamar esse endpoint

## Passo a Passo Recomendado

1. **Teste Opção 1 primeiro** (encontrar API no Network)
   - Mais limpo e rápido
   - Não requer dependências extras

2. **Se não funcionar, tente Opção 3** (exportação manual)
   - Garante que funciona
   - Pode automatizar depois

3. **Se precisar automação total, use Opção 2 ou 4**
   - Selenium se o site não tiver API
   - Backend integration se você tem acesso ao servidor

## Exemplo de Configuração após Encontrar API

Suponha que você encontrou a API: `https://bp.mectrol.com.br/api/bps`

Edite `scrapy_bp_mectrol/spiders/bp_spider.py`:

```python
class BPMectrolSpider(scrapy.Spider):
    name = 'bp_mectrol'
    allowed_domains = ['bp.mectrol.com.br']
    start_urls = ['https://bp.mectrol.com.br/api/bps']  # URL da API

    def parse(self, response):
        """Parser para resposta JSON da API"""
        import json
        data = json.loads(response.text)

        # A estrutura pode ser: {"data": [...]} ou [...]
        if isinstance(data, dict) and 'data' in data:
            data = data['data']

        for bp_data in data:
            item = BPMectrolItem()
            item['bp'] = str(bp_data.get('bp') or bp_data.get('id'))
            item['cliente'] = bp_data.get('cliente') or ''
            item['razao_social'] = bp_data.get('razao_social') or ''
            item['nota_fiscal'] = str(bp_data.get('nota_fiscal') or bp_data.get('nf'))
            item['filial'] = bp_data.get('filial') or ''
            item['vendedor'] = bp_data.get('vendedor') or ''
            item['chegada'] = bp_data.get('chegada') or ''
            item['prazo'] = bp_data.get('prazo') or ''
            item['atraso'] = bp_data.get('atraso') or ''
            item['status'] = bp_data.get('status') or 'Em Andamento'
            item['laudo'] = bp_data.get('laudo') or 'Pendente'
            item['urgencia'] = bp_data.get('urgencia') or 'NORMAL'
            item['alerta_email'] = bp_data.get('alerta_email') or ''
            item['diametro_primitivo'] = str(bp_data.get('diametro_primitivo') or '')
            item['passo'] = str(bp_data.get('passo') or '')
            item['comp_total'] = str(bp_data.get('comp_total') or '')
            item['precisao'] = bp_data.get('precisao') or ''

            if item['bp']:
                yield item
```

## Suporte

Se precisar de ajuda para configurar:
1. Abra o navegador em https://bp.mectrol.com.br/
2. Pressione F12 → Network
3. Tire printscreen das requisições XHR/Fetch
4. Compartilhe para que eu possa ajudar a configurar o spider
