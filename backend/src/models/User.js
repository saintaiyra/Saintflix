const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  profiles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile'
  }],
  // Stripe
  stripeCustomerId: {
    type: String
  },
  // Configurações
  emailVerified: {
    type: Boolean,
    default: false
  },
  avatar: {
    type: String
  }
}, {
  timestamps: true
});

// Hash da senha antes de salvar
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Método para comparar senhas
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para obter dados públicos do usuário
UserSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    profiles: this.profiles,
    avatar: this.avatar,
    emailVerified: this.emailVerified,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('User', UserSchema);