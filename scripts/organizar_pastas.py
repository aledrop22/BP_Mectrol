import os
import re
import shutil
import zipfile

import pandas as pd

# Caminho da pasta da Manutenção no servidor da empresa e pasta onde descarrega as fotos do telemóvel
PASTA_SERVIDOR_MANUTENCAO = r"\\SERVIDOR\Manutencao\Clientes"
PASTA_FOTOS_AVULSAS = r"C:\Users\alexandre.cardoso\Documents\Fotos_Croqui"
CSV_BASE = "historico_bps_desenho.csv"


def nome_pasta_padrao(bp, nf, fuso_str):
    return f"BP {bp} - NF {nf} - {fuso_str}"


def organizar_e_compactar(bp_escolhido, modelo_fuso_manual=None):
    df = pd.read_csv(CSV_BASE, dtype=str).fillna("")
    registro = df[df["BP"] == str(bp_escolhido)]

    if registro.empty:
        print(f"BP {bp_escolhido} não encontrado na base.")
        return

    linha = registro.iloc[0]
    cliente = re.sub(r'[\\/*?:"<>|]', "", linha["Cliente"].strip())
    nf = linha["Nota_Fiscal"].strip()

    # Usa a medida escolhida no dashboard ou a do laudo da manutenção
    if modelo_fuso_manual:
        fuso_str = modelo_fuso_manual
    elif linha["Diametro_Primitivo"] and linha["Passo"]:
        fuso_str = f"Fuso {linha['Diametro_Primitivo']}x{linha['Passo']}x{linha['Comp_Total']}"
    else:
        fuso_str = "Fuso_Medida_Pendente"

    # 1. Verifica se a pasta do cliente já existe no servidor; se não, cria automaticamente
    pasta_cliente = os.path.join(PASTA_SERVIDOR_MANUTENCAO, cliente)
    os.makedirs(pasta_cliente, exist_ok=True)

    # 2. Define o nome padrão: BP + Nota Fiscal + Modelo do Fuso
    nome_pacote = nome_pasta_padrao(bp_escolhido, nf, fuso_str)
    pasta_destino_bp = os.path.join(pasta_cliente, nome_pacote)
    os.makedirs(pasta_destino_bp, exist_ok=True)

    # 3. Move as fotos/vídeos da pasta temporária e cria o .ZIP padronizado
    caminho_zip = os.path.join(pasta_destino_bp, f"{nome_pacote}.zip")
    arquivos = [f for f in os.listdir(PASTA_FOTOS_AVULSAS)
                if os.path.isfile(os.path.join(PASTA_FOTOS_AVULSAS, f))]

    if arquivos:
        with zipfile.ZipFile(caminho_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for arq in arquivos:
                origem = os.path.join(PASTA_FOTOS_AVULSAS, arq)
                zipf.write(origem, arcname=arq)
                shutil.move(origem, os.path.join(pasta_destino_bp, arq))
        print(f"Sucesso! Pasta e ZIP criados em: {pasta_destino_bp}")
    else:
        print(f"Pasta criada em {pasta_destino_bp} (nenhuma foto avulsa na pasta temporária).")


if __name__ == "__main__":
    bp = input("Digite o número do BP: ").strip()
    fuso_manual = input("Fuso manual (ex.: Fuso 40x10x1250) ou Enter para usar o laudo: ").strip() or None
    organizar_e_compactar(bp, fuso_manual)
