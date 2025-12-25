# 🎮 Pokémon Database & Team Analyzer

Um banco de dados completo e analisador de times Pokémon competitivos, inspirado nos melhores sites como PokemonDB e PokemonGoHub, com suporte para formatos 1v1 e 2v2 (Doubles).

![Pokémon Analyzer](https://img.shields.io/badge/Pokemon-Database-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-2.0-orange?style=for-the-badge)

## ✨ Funcionalidades Principais

### 🗂️ Pokedex Nacional Completa
- **151 Pokémon da Geração 1** carregados dinamicamente
- **Paginação inteligente** (24 Pokémon por página)
- **Filtros avançados**:
  - Busca por nome ou número
  - Filtro por tipo (18 tipos disponíveis)
  - Filtro por geração (Gen 1-8)
  - Ordenação por: ID, Nome, HP, Ataque, Defesa, Speed
- **Sistema de Favoritos** com persistência local
- **Grid responsivo** com cards interativos
- Visualização rápida de sprites e tipos

### 🧮 Calculadora de Dano
- Calcule dano entre dois Pokémon
- Considere level, stats base e efetividade de tipos
- Fórmula de dano simplificada baseada nos jogos
- Interface intuitiva com resultados visuais
- Indicadores de super efetivo/resistência

### ⚖️ Comparador de Pokémon
- Compare dois Pokémon lado a lado
- **Gráficos de barras interativos** para cada estatística
- Comparação visual de stats:
  - HP, Ataque, Defesa
  - Ataque Especial, Defesa Especial
  - Speed
- **Total Base Stats** destacado
- Identificação visual de quem tem vantagem em cada stat

### 📦 Import/Export de Times (Formato Showdown)
- **Exporte seu time** no formato Pokémon Showdown
- **Importe times** colando texto do Showdown
- Formato compatível com a comunidade competitiva
- Geração automática de movesets baseados em roles
- Inclui EVs, Nature e movimentos sugeridos

### 🎨 Tema Claro/Escuro
- **Toggle de tema** com um clique
- **Persistência automática** da preferência
- Design adaptado para ambos os modos
- Transições suaves entre temas

### 🔍 Sistema de Busca Avançado
- Busca rápida por nome ou número
- Exibe sprite oficial em alta qualidade
- Mostra estatísticas base com barras visuais coloridas
- Lista completa de fraquezas (2x e 4x), resistências e imunidades
- Integração com a Pokedex

### 👥 Montagem e Análise de Time
- Suporte para 6 Pokémon
- Salva automaticamente no navegador
- Interface drag-and-drop intuitiva

### 📊 Análise Completa do Time
- **Sinergias**: Cobertura de tipos, sinergia defensiva, tiers de speed
- **Cobertura Defensiva**: Visualização de quais tipos seu time resiste ou é fraco
- **Cobertura Ofensiva**: Quais tipos seu time consegue acertar com super efetivo
- **Roles do Time**: Identifica se você tem Sweepers, Tanks, Walls, Supports, etc.
- **Fraquezas Compartilhadas**: Alerta sobre tipos perigosos para seu time
- **Counters**: Sugere Pokémon que podem countar seu time

### 🎯 Movesets Recomendados
- Movimentos sugeridos por role
- Itens recomendados
- Natures ideais
- Distribuição de EVs

### ⚔️ Análise 1v1
- Score de viabilidade para cada Pokémon
- Dicas específicas para formato singles

### 👥 Análise 2v2 (Doubles)
- Sinergias entre pares de Pokémon
- Dicas para formato doubles
- Combos sugeridos

### 📋 Tabela de Tipos
- Tabela completa de efetividades
- Todos os 18 tipos
- Visual código de cores

## 🚀 Como Usar

### Opção 1: GitHub Pages (Recomendado)

1. Faça um Fork deste repositório
2. Vá em **Settings** > **Pages**
3. Em "Source", selecione **Deploy from a branch**
4. Selecione a branch `main` e pasta `/ (root)`
5. Clique em **Save**
6. Aguarde alguns minutos e acesse: `https://seuusuario.github.io/pokemon-team-analyzer`

### Opção 2: Local

1. Clone o repositório:
```bash
git clone https://github.com/seuusuario/pokemon-team-analyzer.git
```

2. Abra o arquivo `index.html` no navegador

## 🛠️ Tecnologias

- **HTML5** - Estrutura
- **CSS3** - Estilização (sem frameworks)
- **JavaScript** - Lógica e interatividade
- **PokéAPI** - Dados dos Pokémon
- **LocalStorage** - Persistência do time

## 📱 Responsivo

O site é totalmente responsivo e funciona em:
- 💻 Desktop
- 📱 Mobile
- 📟 Tablet

## 🎨 Design

- Tema escuro para conforto visual
- Cores inspiradas em games competitivos
- Animações suaves
- Feedback visual claro

## 📝 Estrutura do Projeto

```
pokemon-team-analyzer/
├── index.html          # Arquivo principal (tudo em um)
├── README.md           # Documentação
└── LICENSE             # Licença MIT
```

## 🆕 Novidades da Versão 2.0

Esta versão foi completamente reformulada com base nos melhores bancos de dados de Pokémon:

### Inspirações
- **PokemonDB.net**: Sistema de filtros, comparador, pokedex completa
- **PokemonGoHub**: Interface limpa, organização de dados
- **Pokemon Showdown**: Formato de import/export de times

### O Que Foi Adicionado
- ✅ Pokedex completa com 151 Pokémon (Gen 1)
- ✅ Sistema de filtros avançados (tipo, geração, stats)
- ✅ Paginação profissional
- ✅ Calculadora de dano funcional
- ✅ Comparador de Pokémon com gráficos
- ✅ Import/Export formato Showdown
- ✅ Tema claro/escuro
- ✅ Sistema de favoritos
- ✅ UI/UX completamente redesenhada
- ✅ Design responsivo aprimorado

## 🔜 Próximas Melhorias

- [ ] Expandir Pokedex para todas as gerações (898+ Pokémon)
- [ ] Adicionar movepool completo de cada Pokémon
- [ ] Integrar abilities (habilidades) com descrições
- [ ] Tier lists oficiais (OU, UU, RU, etc.)
- [ ] Breeding calculator (cadeias de breeding)
- [ ] Análise de ameaças específicas
- [ ] PWA (Progressive Web App)
- [ ] Modo offline
- [ ] Gráficos de meta competitivo
- [ ] Integration com Pokémon Showdown API

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer um Fork
2. Criar uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abrir um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🙏 Créditos

- [PokéAPI](https://pokeapi.co/) - API gratuita de dados Pokémon
- Pokémon é uma marca registrada da Nintendo/Game Freak

---

Feito com ❤️ para a comunidade Pokémon competitiva
