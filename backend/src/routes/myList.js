const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const Movie = require('../models/Movie');
const auth = require('../middleware/auth');

// Middleware de autenticação para todas as rotas
router.use(auth);

// Adicionar filme à lista de favoritos
router.post('/', async (req, res) => {
  try {
    const { profileId, movieId } = req.body;

    const profile = await Profile.findById(profileId);
    if (!profile) {
      return res.status(404).json({ message: 'Perfil não encontrado' });
    }

    // Verificar se o perfil pertence ao usuário autenticado
    if (profile.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    if (!profile.favoriteMovies.includes(movieId)) {
      profile.favoriteMovies.push(movieId);
      await profile.save();
    }

    res.json({ isInList: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// Remover filme da lista de favoritos
router.delete('/', async (req, res) => {
  try {
    const { profileId, movieId } = req.body;

    const profile = await Profile.findById(profileId);
    if (!profile) {
      return res.status(404).json({ message: 'Perfil não encontrado' });
    }

    // Verificar se o perfil pertence ao usuário autenticado
    if (profile.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    profile.favoriteMovies = profile.favoriteMovies.filter(
      id => id.toString() !== movieId
    );
    await profile.save();

    res.json({ isInList: false });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// Listar filmes favoritos do perfil autenticado
router.get('/', async (req, res) => {
  try {
    const { profileId } = req.query;

    if (!profileId) {
      return res.status(400).json({ message: 'profileId é obrigatório' });
    }

    const profile = await Profile.findById(profileId).populate('favoriteMovies');
    if (!profile) {
      return res.status(404).json({ message: 'Perfil não encontrado' });
    }

    // Verificar se o perfil pertence ao usuário autenticado
    if (profile.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    res.json(profile.favoriteMovies);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// Listar filmes favoritos por ID do perfil (rota legada)
router.get('/:profileId', async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.profileId).populate('favoriteMovies');
    if (!profile) {
      return res.status(404).json({ message: 'Perfil não encontrado' });
    }

    // Verificar se o perfil pertence ao usuário autenticado
    if (profile.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    res.json(profile.favoriteMovies);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

module.exports = router;