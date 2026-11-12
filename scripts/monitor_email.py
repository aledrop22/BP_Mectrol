import email
import imaplib
import re

import pandas as pd

CSV_BASE = "historico_bps_desenho.csv"

TERMOS_URGENCIA = ["URGENTE", "PRIORIDADE", "QUANTO ANTES", "HOJE", "CRÍTICO", "APROVAÇÃO"]


def extrair_corpo(msg):
    if msg.is_multipart():
        corpo = ""
        for part in msg.walk():
            if part.get_content_type() == "text/plain":
                corpo += part.get_payload(decode=True).decode(errors="ignore")
        return corpo
    payload = msg.get_payload(decode=True)
    return payload.decode(errors="ignore") if payload else ""


def checar_emails_urgencia(servidor_imap, email_user, email_pass, pasta="inbox"):
    mail = imaplib.IMAP4_SSL(servidor_imap)
    mail.login(email_user, email_pass)
    mail.select(pasta)

    # Procura e-mails não lidos na caixa de entrada
    status, mensagens = mail.search(None, 'UNSEEN')
    ids_emails = mensagens[0].split()

    df = pd.read_csv(CSV_BASE, dtype=str).fillna("")
    if "Urgencia" not in df.columns:
        df["Urgencia"] = "NORMAL"
    if "Alerta_Email" not in df.columns:
        df["Alerta_Email"] = ""

    bps_ativos = set(df["BP"].astype(str).tolist())
    alterados = False

    for e_id in ids_emails:
        _, msg_data = mail.fetch(e_id, '(RFC822)')
        msg = email.message_from_bytes(msg_data[0][1])
        assunto = str(msg.get("Subject", ""))

        texto_completo = f"{assunto} {extrair_corpo(msg)}".upper()

        # Procura números de 5 dígitos que correspondam a um BP ativo
        numeros_citados = re.findall(r'\b\d{5}\b', texto_completo)

        for num in numeros_citados:
            if num in bps_ativos and any(t in texto_completo for t in TERMOS_URGENCIA):
                df.loc[df["BP"].astype(str) == num, "Urgencia"] = "ALTA"
                df.loc[df["BP"].astype(str) == num, "Alerta_Email"] = "Solicitado via E-mail"
                alterados = True

    if alterados:
        df.to_csv(CSV_BASE, index=False, encoding="utf-8-sig")
    mail.logout()
    return alterados


if __name__ == "__main__":
    import os
    checar_emails_urgencia(
        servidor_imap=os.environ.get("IMAP_SERVIDOR", "imap.seudominio.com"),
        email_user=os.environ["IMAP_USUARIO"],
        email_pass=os.environ["IMAP_SENHA"],
    )
