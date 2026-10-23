const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Profile = require('../models/Profile');
const auth = require('../middleware/auth');

// Gerar token JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Registro de usuário
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validação básica
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres' });
    }

    // Verificar se o usuário já existe
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Usuário já existe' });
    }

    // Criar novo usuário
    user = new User({ name, email, password });
    await user.save();

    // Criar perfil principal automaticamente
    const mainProfile = new Profile({
      name: name.split(' ')[0], // Primeiro nome
      user: user._id,
      isKid: false
    });
    await mainProfile.save();

    // Adicionar perfil ao usuário
    user.profiles.push(mainProfile._id);
    await user.save();

    // Gerar token JWT
    const token = generateToken(user._id);

    // Retornar usuário com perfis
    const userWithProfiles = await User.findById(user._id).populate('profiles');
    
    res.status(201).json({ 
      token, 
      user: userWithProfiles.toPublicJSON() 
    });
  } catch (err) {
    console.error('Erro no registro:', err.message);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Login de usuário
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    // Verificar se o usuário existe
    const user = await User.findOne({ email }).populate('profiles');
    if (!user) {
      return res.status(400).json({ message: 'Credenciais inválidas' });
    }

    // Verificar senha
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciais inválidas' });
    }

    // Gerar token JWT
    const token = generateToken(user._id);

    res.json({ 
      token, 
      user: user.toPublicJSON() 
    });
  } catch (err) {
    console.error('Erro no login:', err.message);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Obter usuário atual (validar token)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('profiles');
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    res.json({ user: user.toPublicJSON() });
  } catch (err) {
    console.error('Erro ao buscar usuário:', err.message);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Atualizar perfil do usuário
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    
    await user.save();
    res.json({ user: user.toPublicJSON() });
  } catch (err) {
    console.error('Erro ao atualizar perfil:', err.message);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// ===== GERENCIAMENTO DE PERFIS (estilo Netflix) =====

// Listar perfis do usuário
router.get('/profiles', auth, async (req, res) => {
  try {
    const profiles = await Profile.find({ user: req.user.userId });
    res.json({ profiles });
  } catch (err) {
    console.error('Erro ao buscar perfis:', err.message);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Criar novo perfil
router.post('/profiles', auth, async (req, res) => {
  try {
    const { name, isKid, avatar } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Nome do perfil é obrigatório' });
    }

    // Verificar limite de perfis (máx 5 como Netflix)
    const profilesCount = await Profile.countDocuments({ user: req.user.userId });
    if (profilesCount >= 5) {
      return res.status(400).json({ message: 'Limite de 5 perfis atingido' });
    }

    const profile = new Profile({
      name,
      user: req.user.userId,
      isKid: isKid || false,
      avatar: avatar || null
    });
    await profile.save();

    // Adicionar ao usuário
    await User.findByIdAndUpdate(req.user.userId, {
      $push: { profiles: profile._id }
    });

    res.status(201).json({ profile });
  } catch (err) {
    console.error('Erro ao criar perfil:', err.message);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Atualizar perfil
router.put('/profiles/:profileId', auth, async (req, res) => {
  try {
    const { name, isKid, avatar } = req.body;
    const { profileId } = req.params;

    const profile = await Profile.findById(profileId);
    if (!profile) {
      return res.status(404).json({ message: 'Perfil não encontrado' });
    }

    // Verificar se o perfil pertence ao usuário
    if (profile.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    if (name) profile.name = name;
    if (typeof isKid === 'boolean') profile.isKid = isKid;
    if (avatar) profile.avatar = avatar;

    await profile.save();
    res.json({ profile });
  } catch (err) {
    console.error('Erro ao atualizar perfil:', err.message);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Deletar perfil
router.delete('/profiles/:profileId', auth, async (req, res) => {
  try {
    const { profileId } = req.params;

    const profile = await Profile.findById(profileId);
    if (!profile) {
      return res.status(404).json({ message: 'Perfil não encontrado' });
    }

    // Verificar se o perfil pertence ao usuário
    if (profile.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    // Não permitir deletar se for o único perfil
    const profilesCount = await Profile.countDocuments({ user: req.user.userId });
    if (profilesCount <= 1) {
      return res.status(400).json({ message: 'Não é possível deletar o único perfil' });
    }

    await Profile.findByIdAndDelete(profileId);

    // Remover do array de perfis do usuário
    await User.findByIdAndUpdate(req.user.userId, {
      $pull: { profiles: profileId }
    });

    res.json({ message: 'Perfil deletado com sucesso' });
  } catch (err) {
    console.error('Erro ao deletar perfil:', err.message);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Trocar senha
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Senha atual e nova senha são obrigatórias' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'A nova senha deve ter pelo menos 6 caracteres' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Senha atual incorreta' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (err) {
    console.error('Erro ao alterar senha:', err.message);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

module.exports = router;