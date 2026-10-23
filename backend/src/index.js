const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexão com o MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/netflix-clone', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Conectado ao MongoDB'))
.catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Rotas
const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');
const myListRoutes = require('./routes/myList');

app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/my-list', myListRoutes);

app.get('/', (req, res) => {
  res.send('Backend do Netflix Clone');
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});