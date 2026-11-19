# Scrapy BP Mectrol

Projeto Scrapy para extrair dados de BPs do sistema web interno da Mectrol.

## Teste Rápido (Sem Configurar URL Real)

Antes de configurar o Scrapy com a URL real do sistema, você pode testar o dashboard com dados de exemplo:

```bash
python scripts/test_scrapy_csv.py
```

Isso gera um CSV de teste em `public/historico_bps_desenho.csv` com 3 registros de exemplo.
Depois rode `npm run dev` para ver o dashboard funcionando.

## Configuração para Produção

### 1. Adaptar o Spider

Edite o arquivo `spiders/bp_spider.py` para configurar:

1. **URL do sistema interno**:
   ```python
   allowed_domains = ['seu-sistema-empresa.com.br']  # Substituir pelo domínio real
   start_urls = ['https://seu-sistema-empresa.com.br/bps']  # Substituir pela URL real
   ```

2. **Seletores CSS/XPath**:
   No método `parse()`, adapte os seletores conforme a estrutura HTML do sistema:
   ```python
   item['bp'] = self.extract_text(row, 'td:nth-child(1)')  # Adaptar conforme HTML
   ```

   OU use o método `parse_api()` se o sistema tiver uma API REST.

### 2. Autenticação (se necessário)

Se o sistema exigir login, adicione em `settings.py`:
```python
# Autenticação básica
HTTPBasicAuth = ('usuario', 'senha')

# Ou configure cookies no spider
```

### 3. Executar Localmente

```bash
# Instalar dependências
pip install -r ../requirements.txt

# Executar o spider
python scripts/run_scrapy.py
```

### 4. GitHub Actions

Configure os secrets no repositório (Settings → Secrets → Actions):
- `SISTEMA_URL`: URL do sistema interno
- `SISTEMA_USUARIO`: Usuário de autenticação (se necessário)
- `SISTEMA_SENHA`: Senha de autenticação (se necessário)

O workflow `.github/workflows/atualizar-bps.yml` executará o spider a cada 2 horas.

## Estrutura do CSV Gerado

O spider gera o arquivo `public/historico_bps_desenho.csv` com as colunas:
- BP, Cliente, Razao_Social, Nota_Fiscal, Filial, Vendedor
- Chegada, Prazo, Atraso, Status, Laudo, Urgencia, Alerta_Email
- Diametro_Primitivo, Passo, Comp_Total, Precisao

## Debug

Para testar e inspecionar os dados extraídos:
```bash
cd scrapy_bp_mectrol
scrapy crawl bp_mectrol -o output.json
```
