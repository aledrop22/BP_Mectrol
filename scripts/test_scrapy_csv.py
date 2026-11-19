#!/usr/bin/env python3
"""
Script de teste para gerar CSV de exemplo sem acessar o sistema real.
Útil para testar o dashboard antes de configurar o Scrapy com a URL real.
"""

import csv
from pathlib import Path

def gerar_csv_teste():
    """Gera um CSV de teste com dados de exemplo"""
    project_root = Path(__file__).parent.parent
    csv_path = project_root / 'public' / 'historico_bps_desenho.csv'

    dados_teste = [
        {
            'BP': '53193',
            'Cliente': 'CBA',
            'Razao_Social': 'COMPANHIA BRASILEIRA DE ALUMINIO',
            'Nota_Fiscal': '1416969',
            'Filial': '03.04 - CAMPINAS',
            'Vendedor': 'Vanessa Santos',
            'Chegada': '18/09/2026',
            'Prazo': '21/09/2026 10:36',
            'Atraso': '332:24',
            'Status': 'Atrasada',
            'Laudo': 'Concluído',
            'Urgencia': 'ALTA',
            'Alerta_Email': '',
            'Diametro_Primitivo': '40',
            'Passo': '10',
            'Comp_Total': '1250',
            'Precisao': 'RETIFICADO'
        },
        {
            'BP': '54388',
            'Cliente': 'H F SISTEMAS',
            'Razao_Social': 'H.F. SISTEMAS DE FREIO LTDA',
            'Nota_Fiscal': '191662',
            'Filial': '03.06 - JOINVILLE',
            'Vendedor': 'Comercial Joinville',
            'Chegada': '23/10/2026',
            'Prazo': '26/10/2026 13:14',
            'Atraso': '185:10',
            'Status': 'Atrasada',
            'Laudo': 'Concluído',
            'Urgencia': 'NORMAL',
            'Alerta_Email': '',
            'Diametro_Primitivo': '32',
            'Passo': '10',
            'Comp_Total': '850',
            'Precisao': 'LAMINADO'
        },
        {
            'BP': '54878',
            'Cliente': 'PEDERTRACTOR',
            'Razao_Social': 'PEDERTRACTOR IND COM DE PECAS SA',
            'Nota_Fiscal': '780341',
            'Filial': '03.01 - BAURU',
            'Vendedor': 'Danilo Carduci',
            'Chegada': '11/11/2026',
            'Prazo': '12/11/2026 14:22',
            'Atraso': 'No Prazo',
            'Status': 'Em Andamento',
            'Laudo': 'Concluído',
            'Urgencia': 'ALTA',
            'Alerta_Email': '',
            'Diametro_Primitivo': '50',
            'Passo': '16',
            'Comp_Total': '1850',
            'Precisao': 'RETIFICADO'
        }
    ]

    campos = [
        'BP', 'Cliente', 'Razao_Social', 'Nota_Fiscal', 'Filial', 'Vendedor',
        'Chegada', 'Prazo', 'Atraso', 'Status', 'Laudo', 'Urgencia', 'Alerta_Email',
        'Diametro_Primitivo', 'Passo', 'Comp_Total', 'Precisao'
    ]

    with open(csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=campos)
        writer.writeheader()
        writer.writerows(dados_teste)

    print(f"[OK] CSV de teste gerado em: {csv_path}")
    print(f"  {len(dados_teste)} registros inseridos")

if __name__ == '__main__':
    gerar_csv_teste()
