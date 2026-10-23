const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');

// Adicionar filme à lista de favoritos
router.post('/', async (req, res) => {
  try {
    const { profileId, movieId } = req.body;

    const profile = await Profile.findById(profileId);
    if (!profile) {
      return res.status(404).json({ message: 'Perfil não encontrado' });
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

// Listar filmes favoritos
router.get('/:profileId', async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.profileId).populate('favoriteMovies');
    if (!profile) {
      return res.status(404).json({ message: 'Perfil não encontrado' });
    }

    res.json(profile.favoriteMovies);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

module.exports = router;