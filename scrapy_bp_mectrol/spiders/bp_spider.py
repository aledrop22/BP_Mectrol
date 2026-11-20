import scrapy
from scrapy_bp_mectrol.items import BPMectrolItem
from datetime import datetime
import json
import re


class BPMectrolSpider(scrapy.Spider):
    name = 'bp_mectrol'
    allowed_domains = ['bp.mectrol.com.br']
    start_urls = ['https://bp.mectrol.com.br/']

    custom_settings = {
        'FEEDS': {
            '../public/historico_bps_desenho.csv': {
                'format': 'csv',
                'overwrite': True,
                'fields': [
                    'bp', 'cliente', 'razao_social', 'nota_fiscal', 'filial',
                    'vendedor', 'chegada', 'prazo', 'atraso', 'status',
                    'laudo', 'urgencia', 'alerta_email', 'diametro_primitivo',
                    'passo', 'comp_total', 'precisao', 'defeito'
                ]
            }
        },
        'DOWNLOAD_DELAY': 2,
        'CONCURRENT_REQUESTS': 1,
    }

    def parse(self, response):
        """
        Parser principal para https://bp.mectrol.com.br/
        Como é uma SPA, os dados podem estar em:
        1. JSON embutido no HTML (script tag)
        2. API interna (ex: /api/bps)
        3. Renderizado via JavaScript (precisa Playwright)
        """
        self.logger.info(f"Parsing: {response.url}")

        # Tentativa 1: Procurar JSON em script tags (dados embutidos)
        script_tags = response.css('script[type="application/json"]::text').getall()
        for script in script_tags:
            try:
                data = json.loads(script)
                if self.extract_from_json(data):
                    return
            except:
                continue

        # Tentativa 2: Procurar dados em window.__DATA__ ou similar
        scripts = response.css('script::text').getall()
        for script in scripts:
            if 'window.__DATA__' in script or 'window.DATA' in script:
                # Extrair JSON de variável JavaScript
                try:
                    import re
                    match = re.search(r'window\.__DATA__\s*=\s*({[^;]+});', script)
                    if match:
                        data = json.loads(match.group(1))
                        if self.extract_from_json(data):
                            return
                except:
                    continue

        # Tentativa 3: Verificar se há API endpoints visíveis
        # Procurar por links de API nos scripts
        import re
        api_endpoints = re.findall(r'["\'](/api/[^"\']+)["\']', ' '.join(scripts))
        for endpoint in api_endpoints:
            if 'bp' in endpoint.lower():
                api_url = response.urljoin(endpoint)
                self.logger.info(f"Encontrado endpoint API: {api_url}")
                yield scrapy.Request(api_url, callback=self.parse_api)
                return

        # Tentativa 4: Se for SPA pura, informar usuário
        self.logger.warning(
            "Nao foi possivel extrair dados automaticamente. "
            "A pagina parece ser uma SPA que carrega dados via JavaScript. "
            "Use o spider com Playwright ou inspecione o navegador para encontrar a API."
        )

        # Tentativa 5: Extrair de tabela HTML (fallback)
        self.parse_table(response)

    def parse_api(self, response):
        """Parser para respostas JSON de API"""
        try:
            data = json.loads(response.text)
            self.logger.info(f"Recebido JSON da API: {len(str(data))} caracteres")
            self.extract_from_json(data)
        except Exception as e:
            self.logger.error(f"Erro ao parsear JSON da API: {e}")

    def extract_from_json(self, data):
        """Extrai BPs de uma estrutura JSON"""
        items = []

        # Adaptar conforme a estrutura real do JSON
        if isinstance(data, dict):
            # Pode ser {data: [...], bps: [...], etc}
            if 'data' in data:
                data = data['data']
            elif 'bps' in data:
                data = data['bps']
            elif 'items' in data:
                data = data['items']
            elif 'results' in data:
                data = data['results']

        if isinstance(data, list):
            for bp_data in data:
                item = BPMectrolItem()
                # Mapear campos conforme a estrutura real
                item['bp'] = str(bp_data.get('bp') or bp_data.get('id') or bp_data.get('BP') or '')
                item['cliente'] = bp_data.get('cliente') or bp_data.get('client') or ''
                item['razao_social'] = bp_data.get('razao_social') or bp_data.get('razaoSocial') or ''
                item['nota_fiscal'] = str(bp_data.get('nota_fiscal') or bp_data.get('nf') or bp_data.get('Nota_Fiscal') or '')
                item['filial'] = bp_data.get('filial') or bp_data.get('branch') or ''
                item['vendedor'] = bp_data.get('vendedor') or bp_data.get('seller') or ''
                item['chegada'] = bp_data.get('chegada') or bp_data.get('arrival') or ''
                item['prazo'] = bp_data.get('prazo') or bp_data.get('deadline') or ''
                item['atraso'] = bp_data.get('atraso') or bp_data.get('delay') or ''
                item['status'] = bp_data.get('status') or 'Em Andamento'
                item['laudo'] = bp_data.get('laudo') or 'Pendente'
                item['urgencia'] = bp_data.get('urgencia') or 'NORMAL'
                item['alerta_email'] = bp_data.get('alerta_email') or ''
                item['diametro_primitivo'] = str(bp_data.get('diametro_primitivo') or bp_data.get('diameter') or '')
                item['passo'] = str(bp_data.get('passo') or bp_data.get('pitch') or '')
                item['comp_total'] = str(bp_data.get('comp_total') or bp_data.get('length') or '')
                item['precisao'] = bp_data.get('precisao') or bp_data.get('precision') or ''
                item['defeito'] = bp_data.get('defeito') or bp_data.get('defect') or ''

                if item['bp']:
                    items.append(item)
                    yield item

        if items:
            self.logger.info(f"Extraidos {len(items)} BPs do JSON")
            return True
        return False

    def parse_table(self, response):
        """Parser fallback para tabelas HTML"""
        rows = response.css('table tbody tr, table tr')

        for row in rows:
            item = BPMectrolItem()
            cells = row.css('td')

            if len(cells) >= 5:  # Pelo menos 5 colunas
                item['bp'] = self.extract_text(cells, 0)
                item['cliente'] = self.extract_text(cells, 1)
                item['razao_social'] = self.extract_text(cells, 2)
                item['nota_fiscal'] = self.extract_text(cells, 3)
                item['filial'] = self.extract_text(cells, 4)
                item['vendedor'] = self.extract_text(cells, 5) if len(cells) > 5 else ''
                item['chegada'] = self.extract_text(cells, 6) if len(cells) > 6 else ''
                item['prazo'] = self.extract_text(cells, 7) if len(cells) > 7 else ''
                item['atraso'] = self.extract_text(cells, 8) if len(cells) > 8 else ''
                item['status'] = self.extract_text(cells, 9) if len(cells) > 9 else ''
                item['laudo'] = self.extract_text(cells, 10) if len(cells) > 10 else ''
                item['urgencia'] = self.extract_text(cells, 11) if len(cells) > 11 else 'NORMAL'
                item['alerta_email'] = self.extract_text(cells, 12) if len(cells) > 12 else ''
                item['diametro_primitivo'] = self.extract_text(cells, 13) if len(cells) > 13 else ''
                item['passo'] = self.extract_text(cells, 14) if len(cells) > 14 else ''
                item['comp_total'] = self.extract_text(cells, 15) if len(cells) > 15 else ''
                item['precisao'] = self.extract_text(cells, 16) if len(cells) > 16 else ''
                item['defeito'] = self.extract_text(cells, 17) if len(cells) > 17 else ''

                if item['bp']:
                    yield item

    def extract_text(self, cells, index):
        """Helper para extrair texto de uma célula"""
        if index < len(cells):
            return cells[index].css('::text').get('').strip()
        return ''
