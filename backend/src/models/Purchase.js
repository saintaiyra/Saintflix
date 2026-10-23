const mongoose = require('mongoose');

const PurchaseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  },
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  type: {
    type: String,
    enum: ['rental', 'purchase'],
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'BRL'
  },
  stripePaymentIntentId: {
    type: String,
    required: true
  },
  stripeSessionId: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  rentalExpiresAt: {
    type: Date
  },
  purchasedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índice para buscar compras do usuário rapidamente
PurchaseSchema.index({ user: 1, profile: 1, movie: 1 });

module.exports = mongoose.model('Purchase', PurchaseSchema);