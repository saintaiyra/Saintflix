// Script para popular o banco de dados com filmes de teste
// Execute com: node seed.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./src/models/User');
const Profile = require('./src/models/Profile');
const Movie = require('./src/models/Movie');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/netflix-clone';

const sampleMovies = [
  {
    title: "Interestelar",
    description: "Uma equipe de exploradores viaja através de um buraco de minhoca no espaço na tentativa de garantir a sobrevivência da humanidade.",
    releaseYear: 2014,
    genre: ["Ficção Científica", "Aventura", "Drama"],
    rating: 8.6,
    duration: 169,
    posterUrl: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    videoUrl: "https://example.com/videos/interstellar.mp4"
  },
  {
    title: "A Origem",
    description: "Um ladrão habilidoso invade os sonhos das pessoas para roubar segredos do subconsciente.",
    releaseYear: 2010,
    genre: ["Ficção Científica", "Ação", "Thriller"],
    rating: 8.8,
    duration: 148,
    posterUrl: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    videoUrl: "https://example.com/videos/inception.mp4"
  },
  {
    title: "O Poderoso Chefão",
    description: "O patriarca de uma família do crime organizado transfere o controle de seu império para seu filho relutante.",
    releaseYear: 1972,
    genre: ["Crime", "Drama"],
    rating: 9.2,
    duration: 175,
    posterUrl: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    videoUrl: "https://example.com/videos/godfather.mp4"
  },
  {
    title: "Pulp Fiction",
    description: "As vidas de dois assassinos de aluguel, um boxeador, um gângster e sua esposa, e um par de bandidos se entrelaçam.",
    releaseYear: 1994,
    genre: ["Crime", "Drama"],
    rating: 8.9,
    duration: 154,
    posterUrl: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    videoUrl: "https://example.com/videos/pulp.mp4"
  },
  {
    title: "Matrix",
    description: "Um hacker descobre a verdade sobre sua realidade e seu papel na guerra contra seus controladores.",
    releaseYear: 1999,
    genre: ["Ficção Científica", "Ação"],
    rating: 8.7,
    duration: 136,
    posterUrl: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    videoUrl: "https://example.com/videos/matrix.mp4"
  },
  {
    title: "Parasita",
    description: "A ganância e a discriminação de classe ameaçam a recém-formada aliança entre uma família rica e uma família pobre.",
    releaseYear: 2019,
    genre: ["Thriller", "Drama", "Comédia"],
    rating: 8.6,
    duration: 132,
    posterUrl: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    videoUrl: "https://example.com/videos/parasite.mp4"
  },
  {
    title: "O Cavaleiro das Trevas",
    description: "Batman enfrenta o Coringa, um criminoso que quer provar que qualquer um pode se corromper.",
    releaseYear: 2008,
    genre: ["Ação", "Crime", "Drama"],
    rating: 9.0,
    duration: 152,
    posterUrl: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    videoUrl: "https://example.com/videos/darkknight.mp4"
  },
  {
    title: "Forrest Gump",
    description: "A história de um homem simples que presencia e influencia momentos históricos dos EUA.",
    releaseYear: 1994,
    genre: ["Drama", "Romance"],
    rating: 8.8,
    duration: 142,
    posterUrl: "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
    videoUrl: "https://example.com/videos/forrest.mp4"
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Conectado ao MongoDB');

    // Limpar coleções
    await Movie.deleteMany({});
    await Profile.deleteMany({});
    await User.deleteMany({});
    console.log('Coleções limpas');

    // Criar usuário de teste
    const user = new User({
      name: 'Usuário Teste',
      email: 'teste@saintflix.com',
      password: '123456'
    });
    await user.save();
    console.log('Usuário criado:', user.email);

    // Criar perfil
    const profile = new Profile({
      name: 'Perfil Principal',
      user: user._id,
      isKid: false,
      favoriteMovies: []
    });
    await profile.save();
    console.log('Perfil criado:', profile.name);

    // Criar filmes
    const movies = await Movie.insertMany(sampleMovies);
    console.log(`${movies.length} filmes criados`);

    // Adicionar alguns filmes aos favoritos do perfil
    profile.favoriteMovies = movies.slice(0, 3).map(m => m._id);
    await profile.save();
    console.log('Filmes adicionados aos favoritos');

    console.log('\n✅ Seed concluído com sucesso!');
    console.log('\nCredenciais de teste:');
    console.log('Email: teste@saintflix.com');
    console.log('Senha: 123456');
    console.log(`\nProfile ID para testes: ${profile._id}`);

  } catch (error) {
    console.error('Erro no seed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();