#!/usr/bin/env python3
"""
Script para extrair dados detalhados de cada card de solicitação em bp.mectrol.com.br
Navega automaticamente para cada card e extrai:
- Data de Abertura
- CLIENTE/FORNECEDOR
- Numero do BP Solicitação
- N° DA NF
- FILIAL RESPONSÁVEL
- VENDEDOR
- MOTIVO DO RECEBIMENTO DO ITEM
"""

import time
import csv
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException


def extract_bp_details():
    """Extrai dados detalhados de cada card de solicitação"""
    url = 'https://bp.mectrol.com.br/'

    # Configurar Chrome
    chrome_options = Options()
    chrome_options.add_argument('--headless')  # Remova para ver o navegador
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')

    print("Iniciando Chrome...")
    driver = webdriver.Chrome(options=chrome_options)

    try:
        print(f"Acessando: {url}")
        driver.get(url)

        # Esperar login (se necessário) ou página carregar
        print("Aguardando carregamento da página...")
        time.sleep(10)

        # Esperar até que o loader desapareça
        try:
            WebDriverWait(driver, 30).until(
                EC.invisibility_of_element_located((By.ID, 'loaderInicial'))
            )
            print("[OK] Loader desapareceu")
        except:
            print("[INFO] Loader ainda visivel, continuando...")

        # Esperar os cards carregarem
        time.sleep(5)

        # Encontrar todos os cards de solicitação
        cards = driver.find_elements(By.CSS_SELECTOR, '[data-tour="tl-item"]')
        print(f"[INFO] Encontrados {len(cards)} cards")

        dados_extraidos = []

        for idx, card in enumerate(cards):
            try:
                print(f"\n--- Processando card {idx + 1}/{len(cards)} ---")

                # Extrair dados visíveis no card
                bp_text = card.find_element(By.CSS_SELECTOR, 'span.font-mono').text
                bp_numero = bp_text.split('·')[0].replace('#', '').strip()

                cliente_span = card.find_element(By.CSS_SELECTOR, 'span[title]')
                cliente = cliente_span.get_attribute('title')

                print(f"BP: {bp_numero}")
                print(f"Cliente: {cliente}")

                # Clicar no card para ir para página de detalhes
                link = card.find_element(By.CSS_SELECTOR, 'a[href*="solicitacao"]')
                href = link.get_attribute('href')

                # Construir URL completa
                if href.startswith('#/'):
                    detail_url = url + href
                else:
                    detail_url = href

                print(f"Navegando para: {detail_url}")
                driver.get(detail_url)

                # Esperar página de detalhes carregar
                time.sleep(5)

                # Clicar na aba "Processos" (se estiver em outra aba)
                try:
                    print("  Verificando aba Processos...")
                    # Procura aba "Processos" ou "Minhas Atividades"
                    # Tenta encontrar e clicar na aba correta
                    processos_tab = driver.find_element(By.XPATH, "//*[contains(text(), 'Processos')]")
                    processos_tab.click()
                    time.sleep(2)
                except:
                    print("  [INFO] Já na aba correta ou não encontrada")

                # Clicar no ícone "Histórico" para expandir seção
                try:
                    print("  Clicando em Histórico...")
                    btn_historico = driver.find_element(By.CSS_SELECTOR, 'button[title="Histórico"]')
                    btn_historico.click()
                    time.sleep(2)
                except:
                    print("  [INFO] Botão Histórico não encontrado")

                # Clicar no ícone "Fluxo" para expandir seção
                try:
                    print("  Clicando em Fluxo...")
                    btn_fluxo = driver.find_element(By.CSS_SELECTOR, 'button[title="Fluxo"]')
                    btn_fluxo.click()
                    time.sleep(2)
                except:
                    print("  [INFO] Botão Fluxo não encontrado")

                # Extrair dados da página de detalhes
                detalhes = extract_detalhes_pagina(driver, bp_numero, cliente)
                dados_extraidos.append(detalhes)

                # Voltar para timeline
                print("Voltando para timeline...")
                driver.get(url)
                time.sleep(5)

            except Exception as e:
                print(f"[ERRO] Card {idx + 1}: {e}")
                continue

        # Salvar em CSV
        if dados_extraidos:
            csv_path = Path(__file__).parent.parent / 'public' / 'historico_bps_desenho.csv'
            with open(csv_path, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=[
                    'BP', 'Cliente', 'Razao_Social', 'Nota_Fiscal', 'Filial',
                    'Vendedor', 'Chegada', 'Prazo', 'Atraso', 'Status',
                    'Laudo', 'Urgencia', 'Alerta_Email', 'Diametro_Primitivo',
                    'Passo', 'Comp_Total', 'Precisao'
                ])
                writer.writeheader()
                writer.writerows(dados_extraidos)

            print(f"\n[OK] CSV gerado com {len(dados_extraidos)} registros: {csv_path}")
        else:
            print("\n[INFO] Nenhum dado extraido")

    except Exception as e:
        print(f"[ERRO] {e}")
        import traceback
        traceback.print_exc()
    finally:
        driver.quit()
        print("Chrome fechado")


def extract_detalhes_pagina(driver, bp_numero, cliente):
    """Extrai dados da página de detalhes de um BP"""
    detalhes = {
        'BP': bp_numero,
        'Cliente': cliente,
        'Razao_Social': '',
        'Nota_Fiscal': '',
        'Filial': '',
        'Vendedor': '',
        'Chegada': '',
        'Prazo': '',
        'Atraso': '',
        'Status': 'Em Andamento',
        'Laudo': 'Pendente',
        'Urgencia': 'NORMAL',
        'Alerta_Email': '',
        'Diametro_Primitivo': '',
        'Passo': '',
        'Comp_Total': '',
        'Precisao': ''
    }

    try:
        # Esperar página carregar
        time.sleep(3)

        # Clicar na aba "Processos" (se estiver em outra aba)
        try:
            print("  Clicando na aba Processos...")
            processos_tab = driver.find_element(By.XPATH, "//*[contains(text(), 'Processos')]")
            processos_tab.click()
            time.sleep(2)
        except:
            print("  [INFO] Já na aba Processos")

        # Abrir dropdown de filtros e selecionar "Minhas Pendências"
        try:
            print("  Abrindo filtros - Minhas Pendências...")
            # Procura dropdown com texto "Minhas Pendências"
            dropdown = driver.find_element(By.XPATH, "//*[contains(text(), 'Minhas Pendências')]")
            dropdown.click()
            time.sleep(1)
        except:
            print("  [INFO] Dropdown de filtros não encontrado")

        # Opções do filtro (se precisar mudar):
        # 1. Minhas Pendências (padrão)
        # 2. Minhas Solicitações Concluídas
        # 3. Minhas Solicitações em Andamento
        # 4. Minhas Atividades Executadas

        # Clicar no ícone "Histórico" para expandir seção
        try:
            print("  Clicando em Histórico...")
            btn_historico = driver.find_element(By.CSS_SELECTOR, 'button[title="Histórico"]')
            btn_historico.click()
            time.sleep(2)
        except:
            print("  [INFO] Botão Histórico não encontrado")

        # Clicar no ícone "Fluxo" para expandir seção
        try:
            print("  Clicando em Fluxo...")
            btn_fluxo = driver.find_element(By.CSS_SELECTOR, 'button[title="Fluxo"]')
            btn_fluxo.click()
            time.sleep(2)
        except:
            print("  [INFO] Botão Fluxo não encontrado")

        # Procurar atividades atrasadas na tabela
        try:
            print("  Procurando atividades atrasadas...")
            rows_atrasadas = driver.find_elements(By.XPATH, "//*[contains(text(), 'Atrasada')]")
            print(f"  Encontradas {len(rows_atrasadas)} atividades atrasadas")
        except:
            print("  [INFO] Não encontrou atividades atrasadas")

        # Interagir com último ícone de cada linha (atividade)
        try:
            print("  Interagindo com ícones de atividade...")
            # Último ícone na coluna "Atividade"
            icones_atividade = driver.find_elements(By.CSS_SELECTOR, 'td:last-child button, td:last-child svg')
            print(f"  Encontrados {len(icones_atividade)} ícones de atividade")
        except:
            print("  [INFO] Ícones de atividade não encontrados")

        # Tenta encontrar dados em diferentes locais (adaptar conforme HTML real)
        # Data de Abertura
        try:
            data_abertura = driver.find_element(By.XPATH, "//*[contains(text(), 'Data de Abertura')]/..//*[contains(@class, 'text-')]").text
            detalhes['Chegada'] = data_abertura
        except:
            pass

        # Número da NF
        try:
            nf = driver.find_element(By.XPATH, "//*[contains(text(), 'N° DA NF')]/..//*[contains(@class, 'text-')]").text
            detalhes['Nota_Fiscal'] = nf
        except:
            pass

        # Filial Responsável
        try:
            filial = driver.find_element(By.XPATH, "//*[contains(text(), 'FILIAL RESPONS')]/..//*[contains(@class, 'text-')]").text
            detalhes['Filial'] = filial
        except:
            pass

        # Vendedor
        try:
            vendedor = driver.find_element(By.XPATH, "//*[contains(text(), 'VENDEDOR')]/..//*[contains(@class, 'text-')]").text
            detalhes['Vendedor'] = vendedor
        except:
            pass

        # Motivo do Recebimento
        try:
            motivo = driver.find_element(By.XPATH, "//*[contains(text(), 'MOTIVO')]/..//*[contains(@class, 'text-')]").text
            detalhes['MOTIVO'] = motivo
        except:
            pass

        print(f"  Dados extraidos: {detalhes}")

    except Exception as e:
        print(f"  [AVISO] Erro ao extrair detalhes: {e}")

    return detalhes


if __name__ == '__main__':
    extract_bp_details()
