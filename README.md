# ⚔️ Pokemon Champions Trainer

<div align="center">

![Pokemon Champions](https://img.shields.io/badge/Pokemon-Champions-8B5CF6?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?style=for-the-badge&logo=typescript)
![Version](https://img.shields.io/badge/Version-4.0-EC4899?style=for-the-badge)

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

### 📊 Página de Detalhes de Pokémon

Cada Pokémon possui uma página dedicada com **informações completas**:

#### 📈 Stats & Abilities
- **Stats Base Completos** com barras de progresso visuais
- **HP, Attack, Defense, Sp. Attack, Sp. Defense, Speed**
- **Total Base Stats** destacado
- **Todas as Abilities** (normal + hidden) com descrições

#### ⚔️ Type Effectiveness
- **Weaknesses** (2x e 4x)
- **Resistances** (0.5x)
- **Immunities** (0x)
- **Badges coloridos** por tipo

#### 🎯 Recommended Movesets
- **Roles automáticos** (Sweeper, Wall, Tank, Support, Setup)
- **4 movimentos otimizados** por role
- **Ability recomendada**
- **Item ideal** (Life Orb, Leftovers, etc.)
- **Nature** (Adamant, Timid, Jolly, etc.)
- **EV Spread competitivo** (252/252/4 format)
- **Múltiplos sets** para diferentes estratégias

#### 📚 Movepool Completo
- **Todos os movimentos** aprendidos pelo Pokémon
- **Organizado por tipo**
- **Interface clean e moderna**

### ⚔️ Battle Simulator (NOVO!)

**Sistema de batalha completo integrado ao site:**

#### 🎮 Features de Batalha
- **Battle Engine profissional** com cálculo de dano preciso
- **AI Opponent** inteligente que escolhe os melhores moves
- **Turn-based combat** como nos jogos oficiais
- **Damage Calculator** com fórmula Gen 8+
- **Type effectiveness** em tempo real
- **Critical hits** e **STAB** (Same Type Attack Bonus)
- **Accuracy rolls** realistas

#### 🤖 AI Battle System
- **AI seleciona o melhor move** baseado em damage output
- **Strategic switching** quando Pokémon faint
- **Meta team generation** com Pokémon competitivos
- **Battle log** completo com histórico de ações

#### 🎨 Interface Moderna
- **Animações fluidas** durante batalha
- **HP bars** dinâmicas com cores (verde/amarelo/vermelho)
- **Move selection** com tipos e power
- **Team overview** com status de cada Pokémon
- **Real-time battle log** com eventos

#### 📊 Damage Calculation
- **Fórmula oficial** Gen 8+ implementada
- **Modifiers**: STAB (1.5x), Type Effectiveness (0-4x), Critical (1.5x)
- **Random factor** (0.85-1.0)
- **Physical vs Special** calculation
- **Min/Max damage range**

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
│   │   ├── Header.tsx       # Navegação e tema
│   │   ├── PokemonCard.tsx  # Card de Pokémon
│   │   └── LoadingSpinner.tsx
│   ├── pages/               # Páginas da aplicação
│   │   ├── Home.tsx         # Landing page
│   │   ├── Pokedex.tsx      # Pokédex completa
│   │   ├── PokemonDetails.tsx # Detalhes do Pokémon
│   │   ├── TeamBuilder.tsx  # Construtor de times
│   │   └── Battle.tsx       # Simulador de batalha
│   ├── services/            # Lógica de negócio
│   │   ├── pokeapi.ts       # Client da PokeAPI
│   │   ├── movesetService.ts # Geração de movesets
│   │   ├── aiAnalysisService.ts # IA de análise de times
│   │   ├── damageCalculator.ts # Cálculo de dano (Gen 8+)
│   │   └── battleEngine.ts  # Engine de batalha
│   ├── store/               # State Management (Zustand)
│   │   ├── themeStore.ts    # Tema light/dark
│   │   └── teamStore.ts     # Persistência de times
│   ├── types/               # TypeScript Types
│   │   └── pokemon.ts       # Tipos do domínio
│   ├── styles/              # Estilos e Temas
│   │   ├── themes.ts        # Roxo/Branco & Roxo/Preto
│   │   └── global.css
│   ├── App.tsx              # App principal + Router
│   └── main.tsx             # Entry point
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🎮 Como Usar

### 🏠 Home - Visão Geral

1. Acesse a **Home** para ver todas as features
2. **4 cards principais**:
   - Complete Pokédex (1,025 Pokémon)
   - Team Builder (AI-powered)
   - Battle Simulator (vs AI)
   - Pokemon Champions Training
3. **Stats banner** mostra o escopo do projeto
4. Links diretos para cada seção

### 1️⃣ Explore a Pokédex

1. Acesse a aba **Pokédex**
2. **Carregamento inteligente**:
   - Inicia com 300 Pokémon
   - Clique em "Load All 1,025 Pokemon" para carregar todos
3. **Use filtros** para encontrar Pokémon:
   - 🔍 Busque por nome ou ID
   - 🏷️ Filtre por tipo (18 tipos)
   - 🎮 Filtre por geração (1-9)
4. **Dois botões por card**:
   - 👁️ **Details**: Ver página completa
   - ➕ **Add**: Adicionar ao time

### 2️⃣ Veja Detalhes Completos

1. Clique em **Details** em qualquer Pokémon
2. **4 tabs de informação**:
   - **Stats & Abilities**: Stats base + habilidades
   - **Type Effectiveness**: Fraquezas e resistências
   - **Recommended Movesets**: Sets competitivos
   - **All Moves**: Movepool completo
3. Botão **Add to Team** para adicionar diretamente

### 3️⃣ Monte seu Time

1. Vá para **Team Builder**
2. Adicione até **6 Pokémon**
3. **IA analisa automaticamente**:
   - Score geral do time (0-100)
   - Fraquezas compartilhadas
   - Sinergias entre Pokémon
   - Threats do meta
   - Recomendações inteligentes
4. **Ajuste** baseado nas sugestões

### 4️⃣ Battle Simulator (NOVO!)

1. Construa um time no **Team Builder**
2. Vá para **Battle**
3. **Sistema de batalha**:
   - AI gera um time competitivo
   - Turn-based combat
   - Escolha seus moves
   - AI responde estrategicamente
4. **Features durante batalha**:
   - HP bars dinâmicas
   - Damage calculation em tempo real
   - Type effectiveness
   - Critical hits e STAB
   - Battle log completo
5. **Switch Pokémon** quando necessário
6. Vença todas as batalhas!

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

### ✅ Concluído (v4.0)

- [x] Base de dados completa (1,025 Pokémon Gen 1-9)
- [x] Sistema de IA para análise avançada
- [x] Interface moderna (React + Bootstrap 5 + TypeScript)
- [x] Temas customizados (Roxo/Branco & Roxo/Preto)
- [x] Movesets recomendados por role
- [x] Type effectiveness completo
- [x] Team Builder com análise real-time
- [x] **Landing Page (Home)** moderna
- [x] **Página de Detalhes** completa por Pokémon
- [x] **Battle Simulator** profissional com AI
- [x] **Damage Calculator** Gen 8+ preciso
- [x] **AI Opponent** estratégico
- [x] Load all 1,025 Pokémon on demand

### 🔜 Próximas Features (v4.1)

- [ ] Import/Export formato Showdown
- [ ] Comparador de Pokémon (side-by-side)
- [ ] Histórico de batalhas
- [ ] Tier lists oficiais (OU, UU, RU, Uber, etc.)
- [ ] Saved teams manager
- [ ] Speed calculator (speed tiers)

### 🚀 Futuro (v5.0)

- [ ] Multiplayer battles (real-time)
- [ ] Online team sharing
- [ ] Breeding calculator
- [ ] IV/EV training simulator
- [ ] PWA (Progressive Web App)
- [ ] Modo offline completo
- [ ] Integração com Showdown API
- [ ] Tournament bracket generator

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
