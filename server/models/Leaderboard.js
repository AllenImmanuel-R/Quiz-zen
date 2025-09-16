const mongoose = require('mongoose');

const leaderboardEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  quizzesTaken: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  rank: {
    type: Number
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
});

const leaderboardSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    unique: true
  },
  entries: [leaderboardEntrySchema],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Global leaderboard (across all categories)
const globalLeaderboardSchema = new mongoose.Schema({
  entries: [leaderboardEntrySchema],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);
const GlobalLeaderboard = mongoose.model('GlobalLeaderboard', globalLeaderboardSchema);

module.exports = { Leaderboard, GlobalLeaderboard };