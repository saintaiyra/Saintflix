const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  releaseYear: {
    type: Number,
    required: true
  },
  genre: {
    type: [String],
    required: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 10
  },
  duration: {
    type: Number,
    required: true
  },
  posterUrl: {
    type: String,
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Movie', MovieSchema);