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
    scrapy_dir = Path(__file__).parent.parent / 'scrapy_bp_mectrol'

    if not scrapy_dir.exists():
        print(f"Erro: Diretório Scrapy não encontrado em {scrapy_dir}")
        sys.exit(1)

    # Muda para o diretório do Scrapy
    os.chdir(scrapy_dir)

    # Executa o spider
    print("Iniciando extração de dados com Scrapy...")
    result = subprocess.run(
        ['scrapy', 'crawl', 'bp_mectrol'],
        capture_output=True,
        text=True
    )

    if result.returncode == 0:
        print("✓ Scrapy executado com sucesso!")
        print(result.stdout)
    else:
        print("✗ Erro ao executar Scrapy:")
        print(result.stderr)
        sys.exit(1)

    # Verifica se o CSV foi gerado
    csv_path = Path(__file__).parent.parent / 'public' / 'historico_bps_desenho.csv'
    if csv_path.exists():
        print(f"✓ CSV atualizado: {csv_path}")
        print(f"  Tamanho: {csv_path.stat().st_size} bytes")
    else:
        print(f"✗ CSV não foi gerado em {csv_path}")
        sys.exit(1)


if __name__ == '__main__':
    run_scrapy_spider()
