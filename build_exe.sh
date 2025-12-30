#!/bin/bash
echo "========================================"
echo "  PokeStatsBR - Build Script"
echo "========================================"
echo

# Criar ambiente virtual se nao existir
if [ ! -d "venv" ]; then
    echo "Criando ambiente virtual..."
    python3 -m venv venv
fi

# Ativar ambiente virtual
source venv/bin/activate

# Instalar dependencias
echo "Instalando dependencias..."
pip install -r requirements.txt
pip install pyinstaller

# Build com PyInstaller
echo
echo "Gerando executavel..."
pyinstaller --noconfirm --onedir --windowed \
    --name "PokeStatsBR" \
    --add-data "templates:templates" \
    --add-data "static:static" \
    --hidden-import "flask" \
    --hidden-import "jinja2" \
    --hidden-import "webview" \
    desktop.py

echo
echo "========================================"
echo "  Build concluido!"
echo "  Executavel em: dist/PokeStatsBR/"
echo "========================================"
