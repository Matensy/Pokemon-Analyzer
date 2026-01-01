"""
PokeStatsBR - Aplicativo Desktop
Abre o app Flask em uma janela nativa do Windows
"""

import sys
import os
import threading
import webbrowser

# Adicionar diretório atual ao path
if getattr(sys, 'frozen', False):
    # Executando como .exe
    application_path = os.path.dirname(sys.executable)
    os.chdir(application_path)
else:
    application_path = os.path.dirname(os.path.abspath(__file__))

# Configurar variáveis de ambiente antes de importar Flask
os.environ['FLASK_ENV'] = 'production'

def run_flask():
    """Inicia o servidor Flask em background"""
    from app import app
    import logging
    log = logging.getLogger('werkzeug')
    log.setLevel(logging.ERROR)
    app.run(host='127.0.0.1', port=5000, debug=False, use_reloader=False)

def main():
    """Função principal - abre o app no navegador ou em janela nativa"""

    # Tentar usar pywebview para janela nativa
    try:
        import webview

        # Iniciar Flask em thread separada
        flask_thread = threading.Thread(target=run_flask, daemon=True)
        flask_thread.start()

        # Aguardar Flask iniciar
        import time
        time.sleep(1.5)

        # Criar janela nativa
        webview.create_window(
            'PokeStatsBR - Estatísticas Pokemon',
            'http://127.0.0.1:5000',
            width=1280,
            height=800,
            resizable=True,
            min_size=(800, 600),
            background_color='#0a0a0f'
        )
        webview.start()

    except ImportError:
        # Fallback: abrir no navegador padrão
        print("=" * 50)
        print("  PokeStatsBR - Estatísticas Pokemon Showdown")
        print("=" * 50)
        print()
        print("Iniciando servidor...")
        print()

        # Abrir navegador após pequeno delay
        def open_browser():
            import time
            time.sleep(1.5)
            webbrowser.open('http://127.0.0.1:5000')
            print("Aplicativo aberto no navegador!")
            print()
            print("Para fechar, pressione Ctrl+C nesta janela.")

        browser_thread = threading.Thread(target=open_browser, daemon=True)
        browser_thread.start()

        # Rodar Flask na thread principal
        run_flask()


if __name__ == '__main__':
    main()
