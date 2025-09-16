const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Try to load Quiz model, but handle gracefully if it fails
let Quiz;
try {
  Quiz = require('../models/Quiz');
} catch (e) {
  Quiz = null;
}

// Helper function to check if we should use MongoDB
function useDatabase() {
  return Quiz && global.mongooseConnected;
}

// Mock data for demo mode
const mockQuizzes = [
  {
    _id: '1',
    title: 'JavaScript Fundamentals',
    description: 'Test your knowledge of JavaScript basics',
    category: 'Technology',
    difficulty: 'Medium',
    questionCount: 10,
    duration: 15,
    playersCount: 156,
    creator: { _id: '1', name: 'Admin' },
    isPublic: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    _id: '2',
    title: 'Basic Mathematics',
    description: 'Math problems for beginners',
    category: 'Math',
    difficulty: 'Easy',
    questionCount: 8,
    duration: 10,
    playersCount: 89,
    creator: { _id: '1', name: 'Admin' },
    isPublic: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

// Get all public quizzes
router.get('/', async (req, res) => {
  try {
    const { category, search, difficulty } = req.query;

    if (!useDatabase()) {
      // Filter mock data
      let result = mockQuizzes.filter(q => q.isPublic);
      if (category && category !== 'All') result = result.filter(q => q.category === category);
      if (difficulty) result = result.filter(q => q.difficulty === difficulty);
      if (search) {
        const s = String(search).toLowerCase();
        result = result.filter(q => q.title.toLowerCase().includes(s) || q.description.toLowerCase().includes(s));
      }
      return res.json(result);
    }

    // Build filter object
    const filter = { isPublic: true };
    if (category && category !== 'All') filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const quizzes = await Quiz.find(filter)
      .populate('creator', 'name')
      .select('-questions.options.isCorrect')
      .sort({ createdAt: -1 });

    res.json(quizzes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single quiz by ID
router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('creator', 'name');
      
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    res.json(quiz);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new quiz (protected)
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category, difficulty, questions, duration, image, isPublic } = req.body;
    
    const newQuiz = new Quiz({
      title,
      description,
      category,
      difficulty,
      questions,
      duration,
      creator: req.user.id,
      image,
      isPublic: isPublic !== undefined ? isPublic : true
    });
    
    const quiz = await newQuiz.save();
    res.status(201).json(quiz);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a quiz (protected)
router.put('/:id', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    // Check if user is the creator
    if (quiz.creator.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const { title, description, category, difficulty, questions, duration, image, isPublic } = req.body;
    
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        category,
        difficulty,
        questions,
        duration,
        image,
        isPublic
      },
      { new: true }
    );
    
    res.json(updatedQuiz);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a quiz (protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    // Check if user is the creator
    if (quiz.creator.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ message: 'Quiz deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Increment player count when someone plays a quiz
router.post('/:id/play', async (req, res) => {
  try {
    if (!useDatabase()) {
      const quiz = mockQuizzes.find(q => q._id === req.params.id);
      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }
      quiz.playersCount += 1;
      return res.json({ success: true, playersCount: quiz.playersCount });
    }

    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      { $inc: { playersCount: 1 } },
      { new: true }
    );
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    res.json({ success: true, playersCount: quiz.playersCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;