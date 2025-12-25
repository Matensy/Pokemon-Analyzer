# ⚔️ Pokemon Champions Trainer

<div align="center">

![Pokemon Champions](https://img.shields.io/badge/Pokemon-Champions-8B5CF6?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?style=for-the-badge&logo=typescript)
![Version](https://img.shields.io/badge/Version-3.0-EC4899?style=for-the-badge)

**Plataforma completa de treinamento competitivo para Pokemon Champions**
*Com IA avançada para análise de times e recomendações estratégicas*

[🚀 Demo](#) • [📖 Documentação](#features) • [🎮 Como Usar](#getting-started)

</div>

---

## 🌟 Sobre o Projeto

O **Pokemon Champions Trainer** é a plataforma definitiva para treinar composições de time para o novo jogo **Pokemon Champions** (similar ao Pokemon Showdown). Desenvolvida com tecnologias modernas e equipada com **Inteligência Artificial** para análise estratégica, oferece tudo que você precisa para dominar o meta competitivo.

### 🎯 Diferenciais

- ✅ **Base de Dados Completa**: Todos os 1025 Pokémon (Gerações 1-9)
- 🤖 **IA Avançada**: Análise inteligente de times com recomendações estratégicas
- 🎨 **Interface Moderna**: React + Bootstrap 5 + TypeScript
- 🌓 **Temas Customizados**:
  - 🌞 **Light Mode**: Branco + Roxo vibrante
  - 🌙 **Dark Mode**: Roxo + Preto premium
- 📊 **Análise Profunda**: Movesets, fraquezas, sinergias, counters e mais
- ⚡ **Performance Otimizada**: Cache inteligente e carregamento rápido

---

## ✨ Features

### 📚 Pokédex Nacional Completa

- **1025 Pokémon** de todas as gerações (1-9)
- **Filtros avançados**:
  - 🔍 Busca por nome ou ID
  - 🏷️ Filtro por tipo (18 tipos)
  - 🎮 Filtro por geração
  - 📊 Ordenação por stats
- **Paginação inteligente** (24 por página)
- **Cards interativos** com informações detalhadas
- **Artwork oficial** em alta qualidade

### 🤖 Sistema de IA

Nossa IA analisa seu time e fornece:

- **📈 Score Geral** (0-100) baseado em múltiplos fatores
- **⚠️ Identificação de Fraquezas** compartilhadas
- **✅ Análise de Pontos Fortes** do time
- **🔗 Detecção de Sinergias** entre Pokémon
- **🎯 Threats do Meta** (Landorus, Dragapult, etc.)
- **💡 Recomendações Inteligentes**:
  - Sugestões de swap de Pokémon
  - Melhorias em movesets
  - Cobertura ofensiva/defensiva
  - Balanceamento de roles

### ⚔️ Team Builder Avançado

- **Montagem de time** (até 6 Pokémon)
- **Persistência local** (salva automaticamente)
- **Análise em tempo real** com IA
- **Visualização de:**
  - Cobertura de tipos (ofensiva/defensiva)
  - Fraquezas compartilhadas
  - Sinergias entre pares
  - Ameaças do meta

### 📊 Dados Completos de Pokémon

Para cada Pokémon você tem acesso a:

- **Stats Base Completos**: HP, Atk, Def, SpA, SpD, Speed
- **Tipos e Efetividades**: Fraquezas (2x, 4x), Resistências, Imunidades
- **Abilities**: Todas as habilidades com descrições
- **Movesets Recomendados**:
  - Roles (Sweeper, Wall, Tank, Support, Setup)
  - Movimentos por role
  - EVs otimizados
  - Nature ideal
  - Item recomendado
- **Movepool Completo**: Todos os movimentos aprendidos

### 🎨 Sistema de Temas

#### 🌞 Light Mode - Branco & Roxo
```css
Background: Branco (#FFFFFF)
Primary: Roxo Vibrante (#8B5CF6)
Accent: Rosa (#EC4899)
```

#### 🌙 Dark Mode - Roxo & Preto
```css
Background: Preto (#0F0F0F)
Primary: Roxo Claro (#A78BFA)
Accent: Rosa (#F472B6)
```

Troca instantânea com persistência automática!

---

## 🚀 Getting Started

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone https://github.com/Matensy/Pokemon-Analyzer.git
cd Pokemon-Analyzer

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

### Build para Produção

```bash
# Criar build otimizado
npm run build

# Preview do build
npm run preview
```

---

## 🛠️ Stack Tecnológica

### Frontend
- **React 18.2** - UI Library
- **TypeScript 5.2** - Type Safety
- **Vite** - Build Tool & Dev Server
- **Bootstrap 5.3** - UI Framework
- **React Bootstrap 2.9** - React Components

### State Management
- **Zustand 4.4** - Global State (leve e performático)
- **Persist Middleware** - LocalStorage sync

### Data Fetching
- **Axios 1.6** - HTTP Client
- **TanStack React Query 5** - Server State & Cache
- **PokeAPI** - Pokemon Data Source

### UI/UX
- **Framer Motion 10** - Animations
- **Lucide React** - Icons
- **Recharts 2** - Charts & Graphs

### Utilities
- **React Router 6** - Navigation

---

## 📁 Estrutura do Projeto

```
Pokemon-Analyzer/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── Header.tsx
│   │   ├── PokemonCard.tsx
│   │   └── LoadingSpinner.tsx
│   ├── pages/               # Páginas
│   │   ├── Pokedex.tsx
│   │   └── TeamBuilder.tsx
│   ├── services/            # Lógica de negócio
│   │   ├── pokeapi.ts       # Client da PokeAPI
│   │   ├── movesetService.ts # Geração de movesets
│   │   └── aiAnalysisService.ts # IA de análise
│   ├── store/               # State Management
│   │   ├── themeStore.ts
│   │   └── teamStore.ts
│   ├── types/               # TypeScript Types
│   │   └── pokemon.ts
│   ├── styles/              # Estilos e Temas
│   │   ├── themes.ts
│   │   └── global.css
│   ├── App.tsx             # App principal
│   └── main.tsx            # Entry point
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🎮 Como Usar

### 1️⃣ Explore a Pokédex

1. Acesse a aba **Pokédex**
2. Use filtros para encontrar Pokémon:
   - Busque por nome ou ID
   - Filtre por tipo ou geração
3. Clique em um Pokémon para ver detalhes completos
4. Adicione ao seu time com um clique

### 2️⃣ Monte seu Time

1. Vá para **Team Builder**
2. Adicione até 6 Pokémon
3. A IA analisa automaticamente
4. Veja:
   - Score geral do time
   - Fraquezas compartilhadas
   - Sinergias detectadas
   - Recomendações da IA

### 3️⃣ Otimize com IA

1. Leia as recomendações da IA
2. Identifique threats do meta
3. Ajuste seu time baseado nas sugestões
4. Melhore seu score gradualmente

---

## 🤖 Como Funciona a IA

### Análise Multifatorial

A IA analisa seu time considerando:

1. **Cobertura de Tipos**
   - Ofensiva: Quantos tipos você cobre com super efetivo
   - Defensiva: Quais tipos você resiste bem

2. **Fraquezas Compartilhadas**
   - Identifica tipos perigosos (3+ Pokémon fracos)
   - Prioriza fraquezas críticas (4x damage)

3. **Sinergias**
   - Cobertura defensiva complementar
   - Distribuição de speed tiers
   - Balanceamento físico/especial

4. **Meta Threats**
   - Compara com Pokémon populares (Landorus, Dragapult, etc.)
   - Avalia vulnerabilidade do seu time

5. **Role Balance**
   - Verifica presença de Sweepers, Walls, Supports
   - Sugere balanceamento ideal

### Score Calculation

```typescript
Score Base: 100 pontos
- Fraquezas compartilhadas: -10 a -20
+ Cobertura ofensiva: +0 a +20
+ Sinergias: +0 a +15
- Time incompleto: -5 por slot vazio
```

**Classificação:**
- 80-100: 🟢 Excelente
- 60-79: 🔵 Bom
- 40-59: 🟡 Regular
- 0-39: 🔴 Precisa melhorias

---

## 🎯 Roadmap

### ✅ Concluído (v3.0)

- [x] Base de dados completa (Gen 1-9)
- [x] Sistema de IA para análise
- [x] Interface moderna (React + Bootstrap 5)
- [x] Temas customizados (Light/Dark)
- [x] Movesets recomendados
- [x] Type effectiveness completo
- [x] Team Builder com análise real-time

### 🔜 Próximas Features (v3.1)

- [ ] Import/Export formato Showdown
- [ ] Simulador de batalha básico
- [ ] Damage calculator
- [ ] Comparador de Pokémon
- [ ] Histórico de times salvos
- [ ] Tier lists oficiais (OU, UU, RU, etc.)

### 🚀 Futuro (v4.0)

- [ ] Multiplayer (compartilhar times)
- [ ] Breeding calculator
- [ ] EV training simulator
- [ ] PWA (Progressive Web App)
- [ ] Modo offline
- [ ] Integração com Showdown API

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona NovaFeature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🙏 Créditos

- **PokeAPI** - API gratuita de dados Pokémon
- **Pokemon Company** - Pokémon é marca registrada da Nintendo/Game Freak
- **Comunidade Competitiva** - Inspiração e dados de meta

---

## 📧 Contato

**Matensy** - [@Matensy](https://github.com/Matensy)

Project Link: [https://github.com/Matensy/Pokemon-Analyzer](https://github.com/Matensy/Pokemon-Analyzer)

---

<div align="center">

**Feito com ❤️ para a comunidade Pokemon Champions**

⚔️ Bons treinos e boa sorte nas batalhas! ⚔️

</div>
