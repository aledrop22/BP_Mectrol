#!/usr/bin/env python3
"""
Script para executar o spider Scrapy e atualizar o CSV dos BPs.
Este script pode ser executado manualmente ou via GitHub Actions.
"""

import os
import sys
import subprocess
from pathlib import Path


def run_scrapy_spider():
    """Executa o spider Scrapy para extrair dados do sistema interno"""
    # Caminho para o diretório do projeto Scrapy
    project_root = Path(__file__).parent.parent
    scrapy_dir = project_root / 'scrapy_bp_mectrol'

    if not scrapy_dir.exists():
        print(f"Erro: Diretório Scrapy não encontrado em {scrapy_dir}")
        sys.exit(1)

    # Adiciona o diretório do projeto ao PYTHONPATH
    sys.path.insert(0, str(project_root))

    # Muda para o diretório do Scrapy
    original_dir = os.getcwd()
    os.chdir(scrapy_dir)

    try:
        # Executa o spider usando scrapy.crawler diretamente
        print("Iniciando extração de dados com Scrapy...")

        from scrapy.crawler import CrawlerProcess
        from scrapy.utils.project import get_project_settings

        settings = get_project_settings()
        settings.set('FEEDS', {
            str(project_root / 'public' / 'historico_bps_desenho.csv'): {
                'format': 'csv',
                'overwrite': True,
                'fields': [
                    'bp', 'cliente', 'razao_social', 'nota_fiscal', 'filial',
                    'vendedor', 'chegada', 'prazo', 'atraso', 'status',
                    'laudo', 'urgencia', 'alerta_email', 'diametro_primitivo',
                    'passo', 'comp_total', 'precisao'
                ]
            }
        })

        process = CrawlerProcess(settings)
        process.crawl('bp_mectrol')
        process.start()

        print("[OK] Scrapy executado com sucesso!")

    except Exception as e:
        print(f"[ERRO] Erro ao executar Scrapy: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        # Volta para o diretório original
        os.chdir(original_dir)

    # Verifica se o CSV foi gerado
    csv_path = project_root / 'public' / 'historico_bps_desenho.csv'
    if csv_path.exists():
        print(f"[OK] CSV atualizado: {csv_path}")
        print(f"  Tamanho: {csv_path.stat().st_size} bytes")
    else:
        print(f"[ERRO] CSV não foi gerado em {csv_path}")
        sys.exit(1)


if __name__ == '__main__':
    run_scrapy_spider()
