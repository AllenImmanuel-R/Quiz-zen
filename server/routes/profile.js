const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Try to load models, but handle gracefully if they fail
let Profile, User;
try {
  Profile = require('../models/Profile');
  User = require('../models/User');
} catch (e) {
  Profile = null;
  User = null;
}

// Helper function to check if we should use MongoDB
function useDatabase() {
  return Profile && User && global.mongooseConnected;
}

// Get current user's profile
router.get('/me', auth, async (req, res) => {
  try {
    if (!useDatabase()) {
      // Return mock profile data
      return res.json({
        _id: '1',
        user: {
          _id: req.user.id,
          name: req.user.name,
          email: req.user.email
        },
        bio: 'Quiz enthusiast',
        avatar: '',
        quizHistory: [],
        achievements: [],
        stats: {
          totalQuizzesTaken: 0,
          averageScore: 0,
          totalCorrectAnswers: 0,
          totalQuestions: 0,
          quizStreak: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    let profile = await Profile.findOne({ user: req.user.id })
      .populate('user', ['name', 'email'])
      .populate('quizHistory.quiz', ['title', 'category']);
    
    if (!profile) {
      // Create a new profile if one doesn't exist
      profile = new Profile({
        user: req.user.id,
        bio: '',
        avatar: '',
        quizHistory: [],
        achievements: [],
        stats: {
          totalQuizzesTaken: 0,
          averageScore: 0,
          totalCorrectAnswers: 0,
          totalQuestions: 0,
          quizStreak: 0
        }
      });
      await profile.save();
      
      // Populate the user data for the new profile
      profile = await Profile.findById(profile._id).populate('user', ['name', 'email']);
    }
    
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create or update profile
router.post('/', auth, async (req, res) => {
  try {
    const { bio, avatar } = req.body;
    
    // Build profile object
    const profileFields = {
      user: req.user.id,
      bio: bio || '',
      avatar: avatar || ''
    };
    
    let profile = await Profile.findOne({ user: req.user.id });
    
    if (profile) {
      // Update
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      );
      
      return res.json(profile);
    }
    
    // Create
    profile = new Profile(profileFields);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add quiz result to history
router.post('/quiz-history', auth, async (req, res) => {
  try {
    const { quizId, score, totalQuestions, correctAnswers, timeTaken, difficulty } = req.body;
    
    let profile = await Profile.findOne({ user: req.user.id });
    
    if (!profile) {
      // Create a new profile if one doesn't exist
      profile = new Profile({
        user: req.user.id,
        bio: '',
        avatar: '',
        quizHistory: [],
        achievements: [],
        stats: {
          totalQuizzesTaken: 0,
          averageScore: 0,
          totalCorrectAnswers: 0,
          totalQuestions: 0,
          quizStreak: 0
        }
      });
      await profile.save();
    }
    
    const newQuizHistory = {
      quiz: quizId,
      score,
      totalQuestions,
      correctAnswers,
      timeTaken,
      difficulty,
      completedAt: new Date()
    };
    
    // Update stats
    const stats = profile.stats;
    stats.totalQuizzesTaken += 1;
    stats.totalCorrectAnswers += correctAnswers;
    stats.totalQuestions += totalQuestions;
    stats.averageScore = 
      (stats.averageScore * (stats.totalQuizzesTaken - 1) + score) / stats.totalQuizzesTaken;
    stats.lastQuizDate = new Date();
    
    // Check for streak
    const oneDayInMs = 24 * 60 * 60 * 1000;
    if (stats.lastQuizDate && 
        (new Date() - new Date(stats.lastQuizDate)) <= oneDayInMs) {
      stats.quizStreak += 1;
    } else {
      stats.quizStreak = 1;
    }
    
    // Add to history
    profile.quizHistory.unshift(newQuizHistory);
    
    // Check for achievements
    if (stats.totalQuizzesTaken === 1) {
      // First Steps achievement
      profile.achievements.push({
        name: 'First Steps',
        description: 'Complete your first quiz',
        icon: '🎯',
        earned: true,
        earnedAt: new Date()
      });
    }
    
    if (score === 100) {
      // Perfect Score achievement
      const perfectScoreAchievement = profile.achievements.find(a => a.name === 'Perfect Score');
      if (!perfectScoreAchievement) {
        profile.achievements.push({
          name: 'Perfect Score',
          description: 'Get 100% on any quiz',
          icon: '🏆',
          earned: true,
          earnedAt: new Date()
        });
      }
    }
    
    // Speed Demon achievement (under 5 minutes)
    const timeParts = timeTaken.split(':');
    const minutes = parseInt(timeParts[0]);
    if (minutes < 5) {
      const speedDemonAchievement = profile.achievements.find(a => a.name === 'Speed Demon');
      if (!speedDemonAchievement) {
        profile.achievements.push({
          name: 'Speed Demon',
          description: 'Complete a quiz in under 5 minutes',
          icon: '⚡',
          earned: true,
          earnedAt: new Date()
        });
      }
    }
    
    // Streak Master achievement (7-day streak)
    if (stats.quizStreak >= 7) {
      const streakMasterAchievement = profile.achievements.find(a => a.name === 'Streak Master');
      if (!streakMasterAchievement) {
        profile.achievements.push({
          name: 'Streak Master',
          description: 'Maintain a 7-day quiz streak',
          icon: '🔥',
          earned: true,
          earnedAt: new Date()
        });
      }
    }
    
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's quiz history
router.get('/quiz-history', auth, async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id })
      .populate('quizHistory.quiz', ['title', 'category']);
    
    if (!profile) {
      // Create a new profile if one doesn't exist
      profile = new Profile({
        user: req.user.id,
        bio: '',
        avatar: '',
        quizHistory: [],
        achievements: [],
        stats: {
          totalQuizzesTaken: 0,
          averageScore: 0,
          totalCorrectAnswers: 0,
          totalQuestions: 0,
          quizStreak: 0
        }
      });
      await profile.save();
    }
    
    res.json(profile.quizHistory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's achievements
router.get('/achievements', auth, async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id });
    
    if (!profile) {
      // Create a new profile if one doesn't exist
      profile = new Profile({
        user: req.user.id,
        bio: '',
        avatar: '',
        quizHistory: [],
        achievements: [],
        stats: {
          totalQuizzesTaken: 0,
          averageScore: 0,
          totalCorrectAnswers: 0,
          totalQuestions: 0,
          quizStreak: 0
        }
      });
      await profile.save();
    }
    
    res.json(profile.achievements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;