#!/usr/bin/env python3
"""
Script para inspecionar a estrutura do site bp.mectrol.com.br
e salvar o HTML para análise manual.
"""

import requests
from pathlib import Path

def inspect_site():
    url = 'https://bp.mectrol.com.br/'

    print(f"Acessando: {url}")
    response = requests.get(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    })

    print(f"Status: {response.status_code}")
    print(f"Content-Type: {response.headers.get('Content-Type')}")

    # Salvar HTML completo
    html_path = Path(__file__).parent.parent / 'site_inspection.html'
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(response.text)

    print(f"[OK] HTML salvo em: {html_path}")
    print(f"  Tamanho: {len(response.text)} caracteres")

    # Buscar por strings importantes
    html = response.text.lower()

    print("\n=== Análise do HTML ===")
    print(f"Contem 'script': {'script' in html}")
    print(f"Contem 'data-': {'data-' in html}")
    print(f"Contem 'api': {'api' in html}")
    print(f"Contem 'json': {'json' in html}")
    print(f"Contem 'vue': {'vue' in html}")
    print(f"Contem 'react': {'react' in html}")
    print(f"Contem 'angular': {'angular' in html}")

    # Procurar por tables
    if '<table' in html:
        print("\n[ENCONTRADO] Tabelas HTML detectadas!")
    else:
        print("\n[INFO] Nenhuma tabela HTML encontrada (provavelmente SPA)")

    # Procurar por API endpoints
    import re
    api_matches = re.findall(r'["\']([/\w]+api[/?\w]*)["\']', html)
    if api_matches:
        print(f"\n[ENCONTRADO] {len(set(api_matches))} endpoints de API:")
        for endpoint in sorted(set(api_matches)):
            print(f"  - {endpoint}")

    # Procurar por dados embutidos
    if 'window.__' in html or 'window.data' in html:
        print("\n[ENCONTRADO] Dados provavelmente em variaveis JavaScript")

if __name__ == '__main__':
    inspect_site()
