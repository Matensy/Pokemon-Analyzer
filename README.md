# 🎮 Pokémon Team Analyzer

Um site completo para análise de times Pokémon competitivos, com suporte para formatos 1v1 e 2v2 (Doubles).

![Pokémon Analyzer](https://img.shields.io/badge/Pokemon-Team%20Analyzer-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## ✨ Funcionalidades

### 🔍 Pesquisa de Pokémon
- Busca por nome ou número
- Exibe sprite oficial do Pokémon
- Mostra estatísticas base com barras visuais
- Lista fraquezas (2x e 4x), resistências e imunidades

### 👥 Montagem de Time
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

## 🔜 Futuras Melhorias

- [ ] Importar/Exportar times (formato Showdown)
- [ ] Mais movesets por Pokémon
- [ ] Tier lists (OU, UU, etc.)
- [ ] Análise de ameaças específicas
- [ ] Modo escuro/claro
- [ ] PWA (Progressive Web App)

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
