
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use((req, res, next) => {
  if (req.originalUrl === '/api/payments/webhook') {
    return next();
  }

  express.json()(req, res, next);
});

// Conexão com o MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado ao MongoDB Atlas'))
  .catch(err => {
    console.error('Erro ao conectar ao MongoDB:', err.message);
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
  res.send('Backend do Netflix Clone');
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
