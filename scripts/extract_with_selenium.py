#!/usr/bin/env python3
"""
Script para extrair dados de bp.mectrol.com.br usando Selenium.
Renderiza JavaScript e espera os dados carregarem.
"""

import time
import csv
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def extract_with_selenium():
    """Extrai dados usando Selenium para renderizar JavaScript"""
    url = 'https://bp.mectrol.com.br/'

    # Configurar Chrome headless
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')

    print("Iniciando Chrome...")
    driver = webdriver.Chrome(options=chrome_options)

    try:
        print(f"Acessando: {url}")
        driver.get(url)

        # Esperar a página carregar
        print("Aguardando carregamento da página...")
        time.sleep(5)

        # Esperar até que o loader desapareça
        try:
            WebDriverWait(driver, 30).until(
                EC.invisibility_of_element_located((By.ID, 'loaderInicial'))
            )
            print("[OK] Loader desapareceu")
        except:
            print("[INFO] Loader ainda visivel, continuando...")

        # Esperar mais tempo para os dados carregarem
        print("Aguardando dados carregarem...")
        time.sleep(10)

        # Pegar o HTML renderizado
        html = driver.page_source

        # Salvar HTML para inspeção
        html_path = Path(__file__).parent.parent / 'selenium_rendered.html'
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"[OK] HTML renderizado salvo em: {html_path}")

        # Tentar encontrar dados em tabelas
        tables = driver.find_elements(By.TAG_NAME, 'table')
        print(f"[INFO] Encontradas {len(tables)} tabelas")

        if tables:
            # Pegar a primeira tabela
            table = tables[0]
            rows = table.find_elements(By.TAG_NAME, 'tr')

            print(f"[INFO] {len(rows)} linhas na tabela")

            dados = []
            for row in rows:
                cells = row.find_elements(By.TAG_NAME, 'td')
                if len(cells) >= 5:
                    row_data = [cell.text.strip() for cell in cells]
                    dados.append(row_data)

            if dados:
                # Salvar em CSV
                csv_path = Path(__file__).parent.parent / 'public' / 'historico_bps_desenho.csv'
                with open(csv_path, 'w', newline='', encoding='utf-8') as f:
                    writer = csv.writer(f)
                    writer.writerows(dados)

                print(f"[OK] CSV gerado com {len(dados)} registros: {csv_path}")
            else:
                print("[INFO] Nenhum dado extraido da tabela")
        else:
            print("[INFO] Nenhuma tabela encontrada")
            print("[INFO] Os dados podem estar em outro formato (grid, cards, etc.)")
            print("[INFO] Por favor, inspecione o arquivo selenium_rendered.html manualmente")

    except Exception as e:
        print(f"[ERRO] {e}")
        import traceback
        traceback.print_exc()
    finally:
        driver.quit()
        print("Chrome fechado")


if __name__ == '__main__':
    extract_with_selenium()
