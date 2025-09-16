const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const mongoose = require('mongoose');

const app = express();

// Global variable to track if MongoDB is available
global.mongooseConnected = false;

// Connect to MongoDB if MONGO_URI is set
const MONGO_URI = process.env.MONGO_URI;
if (MONGO_URI) {
	mongoose.connect(MONGO_URI)
		.then(() => {
			console.log('Connected to MongoDB');
			global.mongooseConnected = true;
		})
		.catch(err => {
			console.error('MongoDB connection error:', err);
			global.mongooseConnected = false;
		});
} else {
	console.warn('MONGO_URI not set. Running without DB (in-memory/demo mode).');
	global.mongooseConnected = false;
}
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/quiz', require('./routes/quiz'));
app.use('/profile', require('./routes/profile'));
app.use('/leaderboard', require('./routes/leaderboard'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
