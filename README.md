# Saintflix - Netflix Clone

Um clone da Netflix construído com Next.js 15, React 19, TypeScript, Tailwind CSS v4, Express.js e MongoDB.

## 🚀 Tecnologias

### Frontend
- **Next.js 15** (App Router)
- **React 19**
- **TypeScript** (strict mode)
- **Tailwind CSS v4** com CSS Variables para theming
- **TMDB API** para catálogo de filmes

### Backend
- **Express.js**
- **MongoDB** com Mongoose
- **JWT** para autenticação
- **bcryptjs** para hash de senhas

## 📁 Estrutura do Projeto

```
saintflix/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes (proxy para TMDB)
│   │   ├── movies/        # Endpoints de filmes
│   │   └── ...
│   ├── movie/[id]/        # Páginas de filme
│   │   ├── page.tsx       # Detalhes
│   │   └── watch/         # Player de vídeo
│   ├── minha-lista/       # Minha Lista (localStorage)
│   ├── search/            # Busca de filmes
│   ├── discover/          # Descobrir filmes por categoria
│   ├── layout.tsx         # Layout raiz
│   ├── page.tsx           # Home
│   └── globals.css        # Estilos globais + Tailwind
├── components/            # Componentes React
│   ├── Hero.tsx           # Hero section
│   ├── HeroBackground.tsx
│   ├── MovieRow.tsx       # Carrossel de filmes
│   ├── MovieCard.tsx      # Card de filme
│   ├── Navbar.tsx         # Barra de navegação
│   ├── VideoPlayer.tsx    # Player de vídeo HTML5
│   ├── TrailerPlayer.tsx  # Player de trailer (YouTube)
│   ├── ThemeProvider.tsx  # Context de tema
│   ├── ThemeToggle.tsx    # Botão de tema
│   └── MyListButton.tsx   # Botão minha lista
├── hooks/
│   └── useMyList.ts       # Hook compartilhado para minha lista
├── lib/
│   └── api.ts             # Cliente API
├── backend/               # Backend Express
│   ├── src/
│   │   ├── index.js       # Entry point
│   │   ├── routes/
│   │   │   ├── auth.js    # Auth (register/login)
│   │   │   ├── movies.js  # Filmes (MongoDB)
│   │   │   └── myList.js  # Lista de favoritos
│   │   └── models/
│   │       ├── User.js
│   │       ├── Profile.js
│   │       └── Movie.js
│   ├── seed.js            # Script de seed
│   └── package.json
├── .env.example           # Variáveis de ambiente
├── docker-compose.yml     # Docker para dev
├── Dockerfile             # Frontend Dockerfile
├── backend/Dockerfile     # Backend Dockerfile
└── package.json
```

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Copie `.env.example` para `.env.local` (frontend) e `backend/.env` (backend):

```bash
# Frontend
cp .env.example .env.local

# Backend
cp .env.example backend/.env
```

**Variáveis obrigatórias:**

| Variável | Descrição | Onde |
|----------|-----------|------|
| `TMDB_API_KEY` | Chave da API do TMDB | Frontend (`.env.local`) |
| `NEXT_PUBLIC_APP_URL` | URL da aplicação | Frontend (`.env.local`) |
| `MONGODB_URI` | String de conexão MongoDB | Backend (`backend/.env`) |
| `JWT_SECRET` | Secret para JWT (32+ chars) | Backend (`backend/.env`) |

### 2. Obter TMDB API Key

1. Crie conta em [themoviedb.org](https://www.themoviedb.org)
2. Vá em Settings > API > Create
3. Copie a "API Read Access Token" (v4) ou "API Key" (v3)
4. Adicione no `.env.local` como `TMDB_API_KEY`

### 3. Gerar JWT Secret

```bash
openssl rand -base64 32
```

## 🐳 Desenvolvimento com Docker (Recomendado)

```bash
# Subir todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down

# Parar e remover volumes (limpa banco)
docker-compose down -v
```

Serviços disponíveis:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- MongoDB: mongodb://localhost:27017

## 💻 Desenvolvimento Local (Sem Docker)

### Pré-requisitos
- Node.js 20+
- MongoDB rodando localmente

### Frontend
```bash
cd netflix-clone
npm install
npm run dev
```

### Backend
```bash
cd netflix-clone/backend
npm install
npm run dev

# Popular banco com dados de teste
npm run seed
```

## 📝 Scripts Disponíveis

### Frontend
```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run start    # Servidor de produção
npm run lint     # ESLint
```

### Backend
```bash
npm run dev      # Desenvolvimento com nodemon
npm run start    # Produção
npm run seed     # Popular banco de dados
```

## 🎯 Funcionalidades

- ✅ **Catálogo de filmes** via TMDB (trending, popular, top rated, por gênero)
- ✅ **Busca de filmes** em tempo real
- ✅ **Página de detalhes** com trailer (YouTube)
- ✅ **Player de vídeo** HTML5 customizado
- ✅ **Minha Lista** (persistida no localStorage)
- ✅ **Tema Light/Dark** com persistência
- ✅ **Autenticação** JWT (backend pronto)
- ✅ **Perfis de usuário** (backend pronto)
- ✅ **Design responsivo** mobile-first
- ✅ **Animações suaves** e micro-interações

## 🔧 Arquitetura Híbrida

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  TMDB API    │  │  Next.js API │  │  Backend API │  │
│  │  (Catálogo)  │◄─│  Routes      │─►│  (Auth/User) │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

- **TMDB API**: Catálogo público de filmes, busca, detalhes, trailers
- **Next.js API Routes**: Proxy seguro para TMDB (esconde API key)
- **Backend Express**: Autenticação, usuários, perfis, lista de favoritos

## 📦 Deploy

### Vercel (Frontend)
1. Conecte o repositório no Vercel
2. Adicione variáveis de ambiente:
   - `TMDB_API_KEY`
   - `NEXT_PUBLIC_APP_URL` (URL da Vercel)
3. Deploy automático

### Railway/Render (Backend + MongoDB)
1. Crie banco MongoDB (Atlas ou managed)
2. Deploy do backend com variáveis:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `FRONTEND_URL` (URL do frontend Vercel)
3. Configure CORS no backend para aceitar domínio do frontend

## 🤝 Contribuindo

1. Fork o projeto
2. Crie branch (`git checkout -b feature/nova-feature`)
3. Commit (`git commit -m 'feat: nova feature'`)
4. Push (`git push origin feature/nova-feature`)
5. Abra Pull Request

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

**Saintflix** - Cinema, séries e descobertas. 🎬