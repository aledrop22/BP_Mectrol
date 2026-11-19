# Scrapy BP Mectrol

Projeto Scrapy para extrair dados de BPs do sistema web interno da Mectrol.

## Configuração

### 1. Adaptar o Spider

Edite o arquivo `spiders/bp_spider.py` para configurar:

1. **URL do sistema interno**:
   ```python
   allowed_domains = ['sistema-interno-empresa.com.br']  # Substituir pelo domínio real
   start_urls = ['https://sistema-interno-empresa.com.br/bps']  # Substituir pela URL real
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
cd scrapy_bp_mectrol
scrapy crawl bp_mectrol
```

Ou use o script wrapper:
```bash
python scripts/run_scrapy.py
```

### 4. GitHub Actions

Configure os secrets no repositório:
- `SISTEMA_URL`: URL do sistema interno
- `SISTEMA_USUARIO`: Usuário de autenticação (se necessário)
- `SISTEMA_SENHA`: Senha de autenticação (se necessário)

O workflow `.github/workflows/atualizar-bps.yml` executará o spider a cada 2 horas.

## Estrutura do CSV Gerado

O spider gera o arquivo `public/historico_bps_desenho.csv` com as colunas:
- BP, Cliente, Razao_Social, Nota_Fiscal, Filial, Vendedor
- Chegada, Prazo, Atraso, Status, Laudo, Urgencia, Alerta_Email
- Diametro_Primitivo, Passo, Comp_Total, Precisao

## Testes

Para testar sem afetar o sistema de produção, use o modo de depuração:
```bash
scrapy crawl bp_mectrol -o output.json
```
