const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

let User;
try {
  User = require('../models/User');
} catch (e) {
  User = null;
}

// Helper function to check if we should use MongoDB
function useDatabase() {
  return User && global.mongooseConnected;
}

// In-memory user store for demo purposes (fallback)
const users = [];

const authMiddleware = require('../middleware/auth');

router.get('/me', authMiddleware, async (req, res) => {
  const userId = req.userId;
  if (useDatabase()) {
    try {
      const user = await User.findById(userId).select('-password');
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.json({ user });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  // in-memory fallback
  const user = users.find(u => u.id == userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password, ...safe } = user;
  res.json({ user: safe });
});

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: 'Missing fields' });

  const normalized = email.toLowerCase();

  if (useDatabase()) {
    try {
      const exists = await User.findOne({ email: normalized });
      if (exists) return res.status(409).json({ error: 'User exists' });

      const hash = await bcrypt.hash(password, 8);
      const user = await User.create({ name, email: normalized, password: hash });

      const token = jwt.sign({ id: user._id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  // fallback in-memory
  const exists = users.find(u => u.email === normalized);
  if (exists) return res.status(409).json({ error: 'User exists' });

  const hash = await bcrypt.hash(password, 8);
  const user = { id: users.length + 1, name, email: normalized, password: hash };
  users.push(user);

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

  const normalized = email.toLowerCase();

  if (useDatabase()) {
    try {
      const user = await User.findOne({ email: normalized });
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ id: user._id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  // fallback in-memory
  const user = users.find(u => u.email === normalized);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

module.exports = router;
