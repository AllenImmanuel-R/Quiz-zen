const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  earned: { type: Boolean, default: false },
  earnedAt: { type: Date }
});

const quizHistorySchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  timeTaken: { type: String, required: true },
  difficulty: { 
    type: String, 
    enum: ['Easy', 'Medium', 'Hard'],
    required: true 
  },
  completedAt: { 
    type: Date,
    default: Date.now
  }
});

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bio: { type: String, default: '' },
  avatar: { type: String },
  quizHistory: [quizHistorySchema],
  achievements: [achievementSchema],
  stats: {
    totalQuizzesTaken: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    totalCorrectAnswers: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    bestCategory: { type: String },
    quizStreak: { type: Number, default: 0 },
    lastQuizDate: { type: Date }
  }
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);