require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Validação de variáveis obrigatórias
const requiredEnv = ['MONGODB_URI', 'JWT_SECRET', 'FRONTEND_URL'];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`❌ Variável obrigatória ausente: ${key}`);
    process.exit(1);
  }
}
if (process.env.JWT_SECRET.length < 32) {
  console.error('❌ JWT_SECRET deve ter pelo menos 32 caracteres');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy (necessário para Railway/Render/Heroku)
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Raw body para webhook Stripe (DEVE vir antes do express.json)
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payments/webhook') {
    return express.raw({ type: 'application/json' })(req, res, next);
  }
  express.json()(req, res, next);
});

// Health check (para load balancers)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: process.env.NODE_ENV
  });
});

// Conexão com MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado ao MongoDB Atlas'))
  .catch(err => {
    console.error('❌ Erro ao conectar ao MongoDB:', err.message);
    process.exit(1);
  });

// Eventos de conexão
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB desconectado');
});
mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconectado');
});

// Rotas
const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');
const myListRoutes = require('./routes/myList');
const paymentRoutes = require('./routes/payments');

app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/my-list', myListRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/', (req, res) => {
  res.json({ 
    name: 'Saintflix API',
    version: '1.0.0',
    status: 'running'
  });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({ 
    message: 'Erro interno do servidor',
    ...(process.env.NODE_ENV !== 'production' && { error: err.message })
  });
});

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`\n${signal} recebido, encerrando graciosamente...`);
  
  try {
    await mongoose.connection.close();
    console.log('✅ Conexão MongoDB fechada');
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro ao fechar conexão:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 Ambiente: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Timeout para conexões ociosas
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;