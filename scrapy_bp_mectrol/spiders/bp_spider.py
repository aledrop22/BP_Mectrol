import scrapy
from scrapy_bp_mectrol.items import BPMectrolItem
from datetime import datetime


class BPMectrolSpider(scrapy.Spider):
    name = 'bp_mectrol'
    allowed_domains = ['sistema-interno-empresa.com.br']  # Substituir pelo domínio real
    start_urls = ['https://sistema-interno-empresa.com.br/bps']  # Substituir pela URL real

    custom_settings = {
        'FEEDS': {
            '../public/historico_bps_desenho.csv': {
                'format': 'csv',
                'overwrite': True,
                'fields': [
                    'bp', 'cliente', 'razao_social', 'nota_fiscal', 'filial',
                    'vendedor', 'chegada', 'prazo', 'atraso', 'status',
                    'laudo', 'urgencia', 'alerta_email', 'diametro_primitivo',
                    'passo', 'comp_total', 'precisao'
                ]
            }
        }
    }

    def parse(self, response):
        """
        Parser principal para extrair dados dos BPs do sistema web interno.
        Este é um template - adapte os seletores CSS/XPath conforme a estrutura real do sistema.
        """
        # Exemplo: supondo que os dados estejam em uma tabela
        rows = response.css('table tbody tr')  # Adaptar conforme o sistema real

        for row in rows:
            item = BPMectrolItem()

            # Extrair dados das células da tabela - ADAPTAR SELETORES
            item['bp'] = self.extract_text(row, 'td:nth-child(1)')
            item['cliente'] = self.extract_text(row, 'td:nth-child(2)')
            item['razao_social'] = self.extract_text(row, 'td:nth-child(3)')
            item['nota_fiscal'] = self.extract_text(row, 'td:nth-child(4)')
            item['filial'] = self.extract_text(row, 'td:nth-child(5)')
            item['vendedor'] = self.extract_text(row, 'td:nth-child(6)')
            item['chegada'] = self.extract_text(row, 'td:nth-child(7)')
            item['prazo'] = self.extract_text(row, 'td:nth-child(8)')
            item['atraso'] = self.extract_text(row, 'td:nth-child(9)')
            item['status'] = self.extract_text(row, 'td:nth-child(10)')
            item['laudo'] = self.extract_text(row, 'td:nth-child(11)')
            item['urgencia'] = self.extract_text(row, 'td:nth-child(12)')
            item['alerta_email'] = self.extract_text(row, 'td:nth-child(13)')
            item['diametro_primitivo'] = self.extract_text(row, 'td:nth-child(14)')
            item['passo'] = self.extract_text(row, 'td:nth-child(15)')
            item['comp_total'] = self.extract_text(row, 'td:nth-child(16)')
            item['precisao'] = self.extract_text(row, 'td:nth-child(17)')

            if item['bp']:  # Só yield se tiver BP
                yield item

        # Paginação - se houver botão "próxima página"
        next_page = response.css('a.next-page::attr(href)').get()
        if next_page:
            yield response.follow(next_page, callback=self.parse)

    def extract_text(self, element, selector):
        """Helper para extrair texto de um elemento"""
        return element.css(selector + '::text').get('').strip()

    # =====================================================================
    # MÉTODO ALTERNATIVO: Se o sistema retornar JSON via API
    # =====================================================================
    def parse_api(self, response):
        """
        Parser alternativo para APIs que retornam JSON.
        Use este método se o sistema tiver uma API REST.
        """
        import json

        data = json.loads(response.text)

        for bp_data in data.get('bps', []):  # Adaptar estrutura JSON
            item = BPMectrolItem()
            item['bp'] = bp_data.get('bp', '')
            item['cliente'] = bp_data.get('cliente', '')
            item['razao_social'] = bp_data.get('razao_social', '')
            item['nota_fiscal'] = bp_data.get('nota_fiscal', '')
            item['filial'] = bp_data.get('filial', '')
            item['vendedor'] = bp_data.get('vendedor', '')
            item['chegada'] = bp_data.get('chegada', '')
            item['prazo'] = bp_data.get('prazo', '')
            item['atraso'] = bp_data.get('atraso', '')
            item['status'] = bp_data.get('status', '')
            item['laudo'] = bp_data.get('laudo', '')
            item['urgencia'] = bp_data.get('urgencia', 'NORMAL')
            item['alerta_email'] = bp_data.get('alerta_email', '')
            item['diametro_primitivo'] = bp_data.get('diametro_primitivo', '')
            item['passo'] = bp_data.get('passo', '')
            item['comp_total'] = bp_data.get('comp_total', '')
            item['precisao'] = bp_data.get('precisao', '')

            if item['bp']:
                yield item
