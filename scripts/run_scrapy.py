#!/usr/bin/env python3
"""Prevent the unauthenticated SPA spider from replacing local BP data."""

import sys


def main():
    print(
        "O spider Scrapy atual não autentica no portal Beta e não coleta BPs reais. "
        "A execução foi interrompida para preservar o CSV local.",
        file=sys.stderr,
    )
    return 2


if __name__ == '__main__':
    raise SystemExit(main())
