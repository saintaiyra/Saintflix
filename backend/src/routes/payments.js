const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Purchase = require('../models/Purchase');
const Movie = require('../models/Movie');
const Profile = require('../models/Profile');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Middleware de autenticação para TODAS as rotas
router.use(auth);


// Criar checkout session para aluguel ou compra
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { movieId, profileId, type } = req.body; // type: 'rental' ou 'purchase'

    if (!['rental', 'purchase'].includes(type)) {
      return res.status(400).json({ message: 'Tipo inválido. Use "rental" ou "purchase"' });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Filme não encontrado' });
    }

    const profile = await Profile.findById(profileId);
    if (!profile) {
      return res.status(404).json({ message: 'Perfil não encontrado' });
    }

    // Verificar se o perfil pertence ao usuário autenticado
    if (profile.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    // Verificar se já possui o filme (para compra)
    if (type === 'purchase') {
      const existingPurchase = await Purchase.findOne({
        user: req.user.userId,
        profile: profileId,
        movie: movieId,
        type: 'purchase',
        status: 'completed'
      });
      if (existingPurchase) {
        return res.status(400).json({ message: 'Você já possui este filme' });
      }
    }

    // Verificar se já tem aluguel ativo
    if (type === 'rental') {
      const activeRental = await Purchase.findOne({
        user: req.user.userId,
        profile: profileId,
        movie: movieId,
        type: 'rental',
        status: 'completed',
        rentalExpiresAt: { $gt: new Date() }
      });
      if (activeRental) {
        return res.status(400).json({ message: 'Você já tem este filme alugado ativamente' });
      }
    }

    // Preços (em centavos para Stripe)
    const prices = {
      rental: movie.rentalPrice || 1490, // R$ 14,90 padrão
      purchase: movie.purchasePrice || 4990 // R$ 49,90 padrão
    };

    const amount = prices[type];

    // Criar Payment Intent no Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'brl',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        movieId: movieId,
        profileId: profileId,
        userId: req.user.userId,
        type: type
      }
    });

    // Criar registro de compra pendente
    const purchase = new Purchase({
      user: req.user.userId,
      profile: profileId,
      movie: movieId,
      type,
      price: amount,
      stripePaymentIntentId: paymentIntent.id,
      status: 'pending'
    });
    await purchase.save();

    res.json({
      clientSecret: paymentIntent.client_secret,
      purchaseId: purchase._id
    });
  } catch (err) {
    console.error('Erro ao criar checkout:', err);
    res.status(500).json({ message: 'Erro ao processar pagamento' });
  }
});

// Confirmar pagamento (chamado após sucesso no frontend)
router.post('/confirm-payment', async (req, res) => {
  try {
    const { purchaseId, paymentIntentId } = req.body;

    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) {
      return res.status(404).json({ message: 'Compra não encontrada' });
    }

    if (purchase.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    // Verificar status no Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      purchase.status = 'completed';
      purchase.purchasedAt = new Date();

      // Se for aluguel, definir expiração (48 horas)
      if (purchase.type === 'rental') {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 48);
        purchase.rentalExpiresAt = expiresAt;
      }

      await purchase.save();

      res.json({ success: true, purchase });
    } else {
      purchase.status = 'failed';
      await purchase.save();
      res.status(400).json({ message: 'Pagamento não aprovado' });
    }
  } catch (err) {
    console.error('Erro ao confirmar pagamento:', err);
    res.status(500).json({ message: 'Erro ao confirmar pagamento' });
  }
});

// Webhook do Stripe
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Processar eventos
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      const { movieId, profileId, userId, type } = paymentIntent.metadata;

      // Atualizar compra
      await Purchase.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntent.id },
        {
          status: 'completed',
          purchasedAt: new Date(),
          rentalExpiresAt: type === 'rental' 
            ? new Date(Date.now() + 48 * 60 * 60 * 1000) 
            : undefined
        }
      );
      break;
    }
    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      await Purchase.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntent.id },
        { status: 'failed' }
      );
      break;
    }
    case 'charge.refunded': {
      const charge = event.data.object;
      const paymentIntent = await stripe.paymentIntents.retrieve(charge.payment_intent);
      await Purchase.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntent.id },
        { status: 'refunded' }
      );
      break;
    }
  }

  res.json({ received: true });
});

// Listar compras do usuário (biblioteca)
router.get('/library', async (req, res) => {
  try {
    const { profileId } = req.query;

    const query = { user: req.user.userId, status: 'completed' };
    if (profileId) query.profile = profileId;

    const purchases = await Purchase.find(query)
      .populate('movie')
      .populate('profile', 'name')
      .sort({ purchasedAt: -1 });

    // Separar compras e aluguéis ativos
    const now = new Date();
    const owned = purchases.filter(p => p.type === 'purchase');
    const rentals = purchases.filter(p => 
      p.type === 'rental' && p.rentalExpiresAt && new Date(p.rentalExpiresAt) > now
    );
    const expiredRentals = purchases.filter(p => 
      p.type === 'rental' && p.rentalExpiresAt && new Date(p.rentalExpiresAt) <= now
    );

    res.json({ owned, rentals, expiredRentals });
  } catch (err) {
    console.error('Erro ao buscar biblioteca:', err);
    res.status(500).json({ message: 'Erro ao buscar biblioteca' });
  }
});

// Verificar se usuário tem acesso ao filme
router.get('/access/:movieId', async (req, res) => {
  try {
    const { profileId } = req.query;
    const { movieId } = req.params;

    const query = {
      user: req.user.userId,
      movie: movieId,
      status: 'completed'
    };
    if (profileId) query.profile = profileId;

    const purchase = await Purchase.findOne(query);

    if (!purchase) {
      return res.json({ hasAccess: false });
    }

    // Verificar se aluguel expirou
    if (purchase.type === 'rental' && purchase.rentalExpiresAt) {
      if (new Date(purchase.rentalExpiresAt) <= new Date()) {
        return res.json({ hasAccess: false, expired: true });
      }
    }

    res.json({ 
      hasAccess: true, 
      type: purchase.type,
      expiresAt: purchase.rentalExpiresAt
    });
  } catch (err) {
    console.error('Erro ao verificar acesso:', err);
    res.status(500).json({ message: 'Erro ao verificar acesso' });
  }
});

// Obter configuração do Stripe (publishable key)
router.get('/config', (req, res) => {
  res.json({ 
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY 
  });
});

module.exports = router;