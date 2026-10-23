# Saintflix - Netflix Clone com Autenticação e Pagamentos

## Visão Geral

Este projeto implementa um clone da Netflix com:
- **Autenticação completa**: Login, registro, JWT, perfis estilo Netflix (até 5 por conta)
- **Sistema de pagamentos**: Stripe para aluguel (48h) e compra vitalícia de filmes
- **Biblioteca pessoal**: Filmes comprados, alugados ativos e expirados
- **Proteção de rotas**: Middleware no backend e ProtectedRoute no frontend

## Estrutura do Projeto

```
netflix-clone/
├── app/                    # Next.js App Router (Frontend)
│   ├── auth/
│   │   ├── login/         # Página de login
│   │   └── register/      # Página de registro
│   ├── profiles/          # Seleção de perfil (estilo Netflix)
│   ├── conta/             # Gerenciamento de conta/perfis
│   ├── biblioteca/        # Filmes comprados/alugados
│   ├── movie/[id]/        # Detalhes do filme
│   ├── movie/[id]/watch/  # Player de vídeo (protegido)
│   ├── minha-lista/       # Lista de favoritos
│   └── layout.tsx         # Layout raiz com AuthProvider
├── components/            # Componentes React
│   ├── AuthProvider.tsx   # Contexto de autenticação
│   ├── ProtectedRoute.tsx # Guard de rotas protegidas
│   ├── PaymentModal.tsx   # Modal de pagamento Stripe
│   ├── MovieDetailClient.tsx # Client component para detalhes
│   ├── Navbar.tsx         # Navbar com menu de perfil
│   └── ...
├── hooks/
│   └── useMyList.ts       # Hook para lista de favoritos
├── lib/
│   └── api.ts             # Utilitários de API
└── backend/               # Express + MongoDB (Backend)
    ├── src/
    │   ├── index.js       # Entry point
    │   ├── middleware/
    │   │   └── auth.js    # Middleware JWT
    │   ├── models/
    │   │   ├── User.js    # Modelo de usuário
    │   │   ├── Profile.js # Modelo de perfil
    │   │   ├── Movie.js   # Modelo de filme
    │   │   └── Purchase.js # Modelo de compra/aluguel
    │   └── routes/
    │       ├── auth.js    # Rotas de autenticação + perfis
    │       ├── movies.js  # Rotas de filmes
    │       ├── myList.js  # Rotas de favoritos
    │       └── payments.js # Rotas de pagamento Stripe
    └── .env.example       # Variáveis de ambiente
```

## Configuração

### 1. Variáveis de Ambiente

#### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/netflix-clone
JWT_SECRET=seu_jwt_secret_super_seguro_aqui_minimo_32_caracteres
FRONTEND_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_sua_chave_secreta_stripe
STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave_publica_stripe
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret
TMDB_API_KEY=sua_chave_tmdb
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
```

#### Frontend (`.env`)
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave_publica_stripe
```

### 2. Instalação

```bash
# Frontend
cd netflix-clone
npm install --legacy-peer-deps

# Backend
cd backend
npm install
```

### 3. Stripe Setup

1. Crie uma conta no [Stripe](https://stripe.com)
2. Obtenha as chaves de teste no Dashboard
3. Configure o webhook:
   - URL: `https://seu-dominio.com/api/payments/webhook`
   - Eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
4. Para desenvolvimento local, use [Stripe CLI](https://stripe.com/docs/stripe-cli):
   ```bash
   stripe listen --forward-to localhost:5000/api/payments/webhook
   ```

### 4. MongoDB

Certifique-se de ter o MongoDB rodando localmente ou use MongoDB Atlas:
```bash
# Local
mongod

# Ou configure MONGODB_URI no .env para Atlas
```

## Executando o Projeto

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd netflix-clone
npm run dev
```

Acesse: http://localhost:3000

## Fluxos Principais

### Autenticação

1. **Registro**: `/auth/register` → Cria usuário + perfil principal automático
2. **Login**: `/auth/login` → Retorna JWT + dados do usuário com perfis
3. **Seleção de Perfil**: `/profiles` → Estilo Netflix, obrigatório antes de acessar conteúdo
4. **Proteção**: `ProtectedRoute` verifica token + perfil selecionado

### Perfis (Estilo Netflix)

- Máximo 5 perfis por conta
- Perfil infantil (filtro de conteúdo futuro)
- Avatares personalizáveis
- Troca rápida via menu do Navbar

### Pagamentos (Stripe)

#### Aluguel (Rental)
- Preço padrão: R$ 14,90
- Acesso por 48 horas
- Expiração automática

#### Compra (Purchase)
- Preço padrão: R$ 49,90
- Acesso vitalício
- Fica na biblioteca para sempre

#### Fluxo de Pagamento
1. Usuário clica em "Alugar" ou "Comprar" na página do filme
2. Modal Stripe abre com CardElement
3. Backend cria PaymentIntent + registro Purchase (status: pending)
4. Stripe processa pagamento no frontend
5. Frontend confirma no backend (`/confirm-payment`)
6. Backend atualiza status para `completed` + define expiração se aluguel
7. Webhook Stripe sincroniza status (falha, reembolso, etc.)

### Biblioteca (`/biblioteca`)

Três abas:
- **Comprados**: Acesso vitalício
- **Alugados**: Ativos (48h) com contador de expiração
- **Expirados**: Aluguéis vencidos (podem renovar)

## API Endpoints

### Autenticação
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/register` | Registrar usuário |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Validar token + obter usuário |
| PUT | `/api/auth/profile` | Atualizar nome/avatar |
| PUT | `/api/auth/password` | Alterar senha |
| GET | `/api/auth/profiles` | Listar perfis |
| POST | `/api/auth/profiles` | Criar perfil |
| PUT | `/api/auth/profiles/:id` | Atualizar perfil |
| DELETE | `/api/auth/profiles/:id` | Deletar perfil |

### Pagamentos
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/payments/config` | Obter publishable key |
| POST | `/api/payments/create-checkout-session` | Criar PaymentIntent |
| POST | `/api/payments/confirm-payment` | Confirmar pagamento |
| POST | `/api/payments/webhook` | Webhook Stripe |
| GET | `/api/payments/library` | Biblioteca do usuário |
| GET | `/api/payments/access/:movieId` | Verificar acesso ao filme |

### Favoritos
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/my-list` | Adicionar à lista |
| DELETE | `/api/my-list` | Remover da lista |
| GET | `/api/my-list?profileId=` | Listar favoritos |

### Filmes
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/movies` | Listar filmes (categorias) |
| GET | `/api/movies/:id` | Detalhes do filme |
| GET | `/api/movies/:id/similar` | Filmes similares |
| GET | `/api/movies/:id/videos` | Trailers |
| GET | `/api/movies/search` | Buscar filmes |
| GET | `/api/movies/discover` | Descobrir filmes |

## Modelo de Dados

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  profiles: [ObjectId],
  stripeCustomerId: String,
  emailVerified: Boolean,
  avatar: String
}
```

### Profile
```javascript
{
  name: String,
  user: ObjectId (ref: User),
  isKid: Boolean,
  avatar: String,
  favoriteMovies: [ObjectId]
}
```

### Purchase
```javascript
{
  user: ObjectId,
  profile: ObjectId,
  movie: ObjectId,
  type: 'rental' | 'purchase',
  price: Number (centavos),
  currency: 'BRL',
  stripePaymentIntentId: String,
  status: 'pending' | 'completed' | 'failed' | 'refunded',
  rentalExpiresAt: Date (apenas rental),
  purchasedAt: Date
}
```

## Personalização

### Preços dos Filmes
Adicione campos no modelo `Movie`:
```javascript
rentalPrice: { type: Number, default: 1490 },  // R$ 14,90
purchasePrice: { type: Number, default: 4990 } // R$ 49,90
```

### Temas
Edite `app/globals.css` para customizar cores:
```css
:root {
  --primary: #b88a2a;      /* Cor principal */
  --primary-strong: #9a6b16; /* Hover */
  --background: #f7f4ed;   /* Fundo light */
  --foreground: #17130d;   /* Texto light */
}

[data-theme="dark"] {
  --primary: #7c3aed;      /* Roxo dark mode */
  --background: #07060b;   /* Fundo dark */
}
```

## Segurança

- ✅ Senhas hasheadas com bcrypt (10 rounds)
- ✅ JWT com expiração (7 dias)
- ✅ Middleware de autenticação em todas as rotas protegidas
- ✅ Verificação de ownership (usuário só acessa seus dados)
- ✅ CORS configurado para frontend apenas
- ✅ Stripe: dados de cartão nunca tocam seu servidor
- ✅ Webhook signature verification

## Próximos Passos Sugeridos

1. **Email verification** - Enviar email de confirmação no registro
2. **Password reset** - Fluxo "Esqueci minha senha"
3. **Subscription plans** - Adicionar assinaturas mensais (Stripe Subscriptions)
4. **Content filtering** - Implementar filtro por idade (perfil infantil)
5. **Watch progress** - Salvar progresso do vídeo
6. **Recommendations** - Baseado em histórico
7. **Admin panel** - Gerenciar filmes/usuários
8. **Tests** - Jest + React Testing Library + Supertest

## Licença

MIT