@echo off
echo ========================================
echo   PokeStatsBR - Build Windows .exe
echo ========================================
echo.

REM Verificar se Python esta instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Python nao encontrado!
    echo Instale Python 3.10+ de https://python.org
    pause
    exit /b 1
)

REM Criar ambiente virtual se nao existir
if not exist "venv" (
    echo Criando ambiente virtual...
    python -m venv venv
)

REM Ativar ambiente virtual
call venv\Scripts\activate.bat

REM Instalar dependencias
echo Instalando dependencias...
pip install -r requirements.txt
pip install pyinstaller

REM Build com PyInstaller
echo.
echo Gerando executavel...
pyinstaller --noconfirm --onedir --windowed ^
    --name "PokeStatsBR" ^
    --icon "static/icon.ico" ^
    --add-data "templates;templates" ^
    --add-data "static;static" ^
    --hidden-import "flask" ^
    --hidden-import "jinja2" ^
    --hidden-import "webview" ^
    desktop.py

echo.
echo ========================================
echo   Build concluido!
echo   Executavel em: dist\PokeStatsBR\
echo ========================================
pause
