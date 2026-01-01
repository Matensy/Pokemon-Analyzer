# PokeStatsBR

Aplicativo de estatísticas do Pokémon Showdown em Português Brasileiro. Visualize dados de uso, movesets, itens, habilidades e muito mais de todos os formatos competitivos.

## Funcionalidades

- **Todos os Formatos**: VGC, Singles, Doubles, National Dex, Other Metagames, Random Battles e todas as gerações (Gen 1-9)
- **Estatísticas Detalhadas**: Uso, movimentos, itens, habilidades, distribuições de EVs, tipos Tera e parceiros de time
- **Fraquezas de Tipo**: Visualize fraquezas, resistências e imunidades de cada Pokémon
- **Construtor de Sets**: Monte sets customizados clicando nas opções ou manualmente
- **Replays**: Veja os últimos 20 replays de cada formato com preview dos times
- **Exportação de Times**: Exporte times dos replays no formato Showdown
- **Análise com IA**: Use o Gemini para analisar estratégias de times (requer API key)
- **Aplicativo Desktop**: Rode como app nativo no Windows

## Requisitos

- Python 3.8+
- pip (gerenciador de pacotes Python)

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/Pokemon-Analyzer.git
cd Pokemon-Analyzer
```

2. Crie um ambiente virtual (recomendado):
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. Instale as dependências:
```bash
pip install -r requirements.txt
```

## Como Rodar

### Modo Web (Navegador)

Execute o servidor Flask:
```bash
python app.py
```

Acesse no navegador: `http://localhost:5000`

### Modo Desktop (Windows)

Execute o launcher desktop:
```bash
python desktop.py
```

Isso abrirá uma janela nativa com o aplicativo.

## Criar Executável (.exe)

Para criar um arquivo `.exe` que pode ser executado sem Python instalado:

### Windows

Execute o script de build:
```bash
build_exe.bat
```

Ou manualmente:
```bash
pip install pyinstaller
pyinstaller --onefile --windowed --name PokeStatsBR --add-data "templates;templates" --add-data "static;static" desktop.py
```

O executável será criado em `dist/PokeStatsBR.exe`

### Linux/Mac

```bash
chmod +x build_exe.sh
./build_exe.sh
```

## Configuração da API Gemini (Opcional)

Para usar a funcionalidade de análise de times com IA:

1. Obtenha uma API key do [Google AI Studio](https://makersuite.google.com/app/apikey)

2. Configure a variável de ambiente:

**Windows (CMD):**
```cmd
set GEMINI_API_KEY=sua_chave_aqui
python app.py
```

**Windows (PowerShell):**
```powershell
$env:GEMINI_API_KEY="sua_chave_aqui"
python app.py
```

**Linux/Mac:**
```bash
export GEMINI_API_KEY=sua_chave_aqui
python app.py
```

Ou crie um arquivo `.env` na raiz do projeto:
```
GEMINI_API_KEY=sua_chave_aqui
```

## Estrutura do Projeto

```
Pokemon-Analyzer/
├── app.py              # Aplicação Flask principal
├── desktop.py          # Launcher para modo desktop
├── requirements.txt    # Dependências Python
├── build_exe.bat       # Script de build Windows
├── build_exe.sh        # Script de build Linux/Mac
├── templates/          # Templates HTML
│   ├── base.html       # Template base
│   ├── index.html      # Página inicial (formatos)
│   ├── format.html     # Lista de Pokémon do formato
│   ├── pokemon.html    # Detalhes do Pokémon
│   ├── replays.html    # Página de replays
│   └── about.html      # Sobre o projeto
└── static/             # Arquivos estáticos (CSS, JS, imagens)
```

## Fonte dos Dados

- **Estatísticas**: [Smogon Usage Stats](https://www.smogon.com/stats/)
- **Replays**: [Pokémon Showdown Replays](https://replay.pokemonshowdown.com/)
- **Sprites**: [Pokémon Showdown](https://play.pokemonshowdown.com/)
- **Tipos**: [PokéAPI](https://pokeapi.co/)

## Licença

Este projeto é apenas para fins educacionais. Pokémon é marca registrada da Nintendo/Game Freak/The Pokémon Company.
