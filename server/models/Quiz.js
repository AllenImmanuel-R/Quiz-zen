const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [{ 
    text: { type: String, required: true },
    isCorrect: { type: Boolean, required: true }
  }],
  explanation: { type: String }
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  difficulty: { 
    type: String, 
    enum: ['Easy', 'Medium', 'Hard'],
    required: true 
  },
  questions: [questionSchema],
  duration: { type: Number, required: true }, // in minutes
  creator: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  playersCount: { 
    type: Number, 
    default: 0 
  },
  image: { type: String },
  isPublic: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

// Virtual for question count
quizSchema.virtual('questionCount').get(function() {
  return this.questions ? this.questions.length : 0;
});

// Ensure virtuals are included in JSON output
quizSchema.set('toJSON', { virtuals: true });
quizSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Quiz', quizSchema);