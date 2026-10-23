const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');

// Listar todos os filmes
router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// Obter detalhes de um filme específico
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Filme não encontrado' });
    }
    res.json(movie);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// Buscar filmes por título ou gênero
router.get('/search', async (req, res) => {
  try {
    const { title, genre } = req.query;
    let query = {};

    if (title) {
      query.title = { $regex: title, $options: 'i' };
    }

    if (genre) {
      query.genre = { $in: [genre] };
    }

    const movies = await Movie.find(query);
    res.json(movies);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

module.exports = router;