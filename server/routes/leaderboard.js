const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Try to load models, but handle gracefully if they fail
let Leaderboard, GlobalLeaderboard, Profile;
try {
  const models = require('../models/Leaderboard');
  Leaderboard = models.Leaderboard;
  GlobalLeaderboard = models.GlobalLeaderboard;
  Profile = require('../models/Profile');
} catch (e) {
  Leaderboard = null;
  GlobalLeaderboard = null;
  Profile = null;
}

// Helper function to check if we should use MongoDB
function useDatabase() {
  return Leaderboard && GlobalLeaderboard && Profile && global.mongooseConnected;
}

// Get global leaderboard
router.get('/global', async (req, res) => {
  try {
    if (!useDatabase()) {
      // Return empty leaderboard for demo mode
      return res.json([]);
    }

    let globalLeaderboard = await GlobalLeaderboard.findOne()
      .populate('entries.user', ['name', 'email']);
    
    if (!globalLeaderboard) {
      // If no global leaderboard exists, create one
      globalLeaderboard = new GlobalLeaderboard({
        entries: [],
        lastUpdated: new Date()
      });
      await globalLeaderboard.save();
    }
    
    res.json(globalLeaderboard.entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get category leaderboard
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    let leaderboard = await Leaderboard.findOne({ category })
      .populate('entries.user', ['name', 'email']);
    
    if (!leaderboard) {
      // If no leaderboard exists for this category, create one
      leaderboard = new Leaderboard({
        category,
        entries: [],
        lastUpdated: new Date()
      });
      await leaderboard.save();
    }
    
    res.json(leaderboard.entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update leaderboard after quiz completion
router.post('/update', auth, async (req, res) => {
  try {
    const { quizId, category, score, totalPoints } = req.body;
    const userId = req.user.id;
    
    // Update category leaderboard
    let categoryLeaderboard = await Leaderboard.findOne({ category });
    if (!categoryLeaderboard) {
      categoryLeaderboard = new Leaderboard({
        category,
        entries: [],
        lastUpdated: new Date()
      });
    }
    
    // Find user in category leaderboard
    let userEntry = categoryLeaderboard.entries.find(
      entry => entry.user.toString() === userId
    );
    
    if (userEntry) {
      // Update existing entry
      userEntry.quizzesTaken += 1;
      userEntry.totalPoints += totalPoints;
      userEntry.averageScore = 
        (userEntry.averageScore * (userEntry.quizzesTaken - 1) + score) / userEntry.quizzesTaken;
      userEntry.lastActive = new Date();
    } else {
      // Create new entry
      categoryLeaderboard.entries.push({
        user: userId,
        score,
        quizzesTaken: 1,
        averageScore: score,
        totalPoints,
        lastActive: new Date()
      });
    }
    
    // Sort and update ranks
    categoryLeaderboard.entries.sort((a, b) => b.totalPoints - a.totalPoints);
    categoryLeaderboard.entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });
    
    categoryLeaderboard.lastUpdated = new Date();
    await categoryLeaderboard.save();
    
    // Update global leaderboard
    let globalLeaderboard = await GlobalLeaderboard.findOne();
    if (!globalLeaderboard) {
      globalLeaderboard = new GlobalLeaderboard({
        entries: [],
        lastUpdated: new Date()
      });
    }
    
    // Find user in global leaderboard
    let globalUserEntry = globalLeaderboard.entries.find(
      entry => entry.user.toString() === userId
    );
    
    if (globalUserEntry) {
      // Update existing entry
      globalUserEntry.quizzesTaken += 1;
      globalUserEntry.totalPoints += totalPoints;
      globalUserEntry.averageScore = 
        (globalUserEntry.averageScore * (globalUserEntry.quizzesTaken - 1) + score) / globalUserEntry.quizzesTaken;
      globalUserEntry.lastActive = new Date();
    } else {
      // Create new entry
      globalLeaderboard.entries.push({
        user: userId,
        score,
        quizzesTaken: 1,
        averageScore: score,
        totalPoints,
        lastActive: new Date()
      });
    }
    
    // Sort and update ranks
    globalLeaderboard.entries.sort((a, b) => b.totalPoints - a.totalPoints);
    globalLeaderboard.entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });
    
    globalLeaderboard.lastUpdated = new Date();
    await globalLeaderboard.save();
    
    res.json({ 
      categoryRank: categoryLeaderboard.entries.find(entry => entry.user.toString() === userId)?.rank || 0,
      globalRank: globalLeaderboard.entries.find(entry => entry.user.toString() === userId)?.rank || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's rank
router.get('/rank', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get global rank
    const globalLeaderboard = await GlobalLeaderboard.findOne();
    const globalRank = globalLeaderboard?.entries.find(
      entry => entry.user.toString() === userId
    )?.rank || 0;
    
    // Get category ranks
    const leaderboards = await Leaderboard.find();
    const categoryRanks = {};
    
    leaderboards.forEach(leaderboard => {
      const entry = leaderboard.entries.find(
        entry => entry.user.toString() === userId
      );
      
      if (entry) {
        categoryRanks[leaderboard.category] = entry.rank;
      }
    });
    
    res.json({
      globalRank,
      categoryRanks
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;