const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const Quiz = require('../models/Quiz');
const User = require('../models/User');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quizzen';

// System user for created quizzes
const SYSTEM_USER = {
  name: 'Quiz Master',
  email: 'system@quizmaster.com',
  password: 'systemuser123' // This will be hashed
};

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

async function ensureSystemUser() {
  try {
    let systemUser = await User.findOne({ email: SYSTEM_USER.email });
    
    if (!systemUser) {
      console.log('Creating system user...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(SYSTEM_USER.password, 10);
      
      systemUser = new User({
        name: SYSTEM_USER.name,
        email: SYSTEM_USER.email,
        password: hashedPassword
      });
      
      await systemUser.save();
      console.log('✅ System user created');
    }
    
    return systemUser;
  } catch (error) {
    console.error('❌ Error creating system user:', error);
    throw error;
  }
}

async function loadQuizzesFromJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    const quizzes = JSON.parse(data);
    
    // Validate the JSON structure
    if (!Array.isArray(quizzes)) {
      throw new Error('JSON file must contain an array of quizzes');
    }
    
    return quizzes;
  } catch (error) {
    console.error(`❌ Error reading JSON file ${filePath}:`, error);
    throw error;
  }
}

function validateQuiz(quiz, index) {
  const errors = [];
  
  if (!quiz.title) errors.push(`Quiz ${index}: Missing title`);
  if (!quiz.description) errors.push(`Quiz ${index}: Missing description`);
  if (!quiz.category) errors.push(`Quiz ${index}: Missing category`);
  if (!quiz.difficulty || !['Easy', 'Medium', 'Hard'].includes(quiz.difficulty)) {
    errors.push(`Quiz ${index}: Invalid difficulty (must be Easy, Medium, or Hard)`);
  }
  if (!quiz.duration || typeof quiz.duration !== 'number') {
    errors.push(`Quiz ${index}: Invalid duration (must be a number in minutes)`);
  }
  if (!quiz.questions || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    errors.push(`Quiz ${index}: Missing or empty questions array`);
  }
  
  if (quiz.questions) {
    quiz.questions.forEach((question, qIndex) => {
      if (!question.text) errors.push(`Quiz ${index}, Question ${qIndex}: Missing question text`);
      if (!question.options || !Array.isArray(question.options) || question.options.length < 2) {
        errors.push(`Quiz ${index}, Question ${qIndex}: Must have at least 2 options`);
      }
      
      if (question.options) {
        const correctOptions = question.options.filter(opt => opt.isCorrect);
        if (correctOptions.length === 0) {
          errors.push(`Quiz ${index}, Question ${qIndex}: Must have at least one correct option`);
        }
        
        question.options.forEach((option, oIndex) => {
          if (!option.text) errors.push(`Quiz ${index}, Question ${qIndex}, Option ${oIndex}: Missing option text`);
          if (typeof option.isCorrect !== 'boolean') {
            errors.push(`Quiz ${index}, Question ${qIndex}, Option ${oIndex}: isCorrect must be boolean`);
          }
        });
      }
    });
  }
  
  return errors;
}

async function seedQuizzes(systemUser, quizzes) {
  console.log(`\n📚 Seeding ${quizzes.length} quizzes...`);
  
  const results = {
    created: 0,
    updated: 0,
    errors: 0
  };
  
  for (let i = 0; i < quizzes.length; i++) {
    const quizData = quizzes[i];
    
    try {
      // Validate quiz data
      const validationErrors = validateQuiz(quizData, i);
      if (validationErrors.length > 0) {
        console.error(`❌ Quiz ${i} validation errors:`, validationErrors);
        results.errors++;
        continue;
      }
      
      // Check if quiz already exists (by title and category)
      const existingQuiz = await Quiz.findOne({ 
        title: quizData.title, 
        category: quizData.category 
      });
      
      if (existingQuiz) {
        // Update existing quiz
        existingQuiz.description = quizData.description;
        existingQuiz.difficulty = quizData.difficulty;
        existingQuiz.questions = quizData.questions;
        existingQuiz.duration = quizData.duration;
        existingQuiz.image = quizData.image;
        existingQuiz.isPublic = quizData.isPublic !== undefined ? quizData.isPublic : true;
        
        await existingQuiz.save();
        console.log(`🔄 Updated: ${quizData.title}`);
        results.updated++;
      } else {
        // Create new quiz
        const newQuiz = new Quiz({
          title: quizData.title,
          description: quizData.description,
          category: quizData.category,
          difficulty: quizData.difficulty,
          questions: quizData.questions,
          duration: quizData.duration,
          creator: systemUser._id,
          image: quizData.image,
          isPublic: quizData.isPublic !== undefined ? quizData.isPublic : true
        });
        
        await newQuiz.save();
        console.log(`✅ Created: ${quizData.title}`);
        results.created++;
      }
      
    } catch (error) {
      console.error(`❌ Error processing quiz ${i} (${quizData.title}):`, error);
      results.errors++;
    }
  }
  
  return results;
}

async function main() {
  try {
    console.log('🚀 Starting quiz seeding process...\n');
    
    // Connect to database
    await connectDB();
    
    // Ensure system user exists
    const systemUser = await ensureSystemUser();
    
    // Get JSON files from command line arguments or use default directory
    const jsonFiles = process.argv.slice(2);
    
    if (jsonFiles.length === 0) {
      console.log('📁 No JSON files specified. Looking for quiz files in ./data directory...');
      
      const dataDir = path.join(__dirname, 'data');
      try {
        const files = await fs.readdir(dataDir);
        const jsonFilePaths = files
          .filter(file => file.endsWith('.json'))
          .map(file => path.join(dataDir, file));
        
        if (jsonFilePaths.length === 0) {
          console.log('ℹ️  No JSON files found in ./data directory');
          console.log('💡 Usage: node seed-quizzes.js <path-to-quiz-file.json> [additional-files...]');
          return;
        }
        
        jsonFiles.push(...jsonFilePaths);
      } catch (error) {
        console.log('💡 Usage: node seed-quizzes.js <path-to-quiz-file.json> [additional-files...]');
        return;
      }
    }
    
    let totalResults = { created: 0, updated: 0, errors: 0 };
    
    // Process each JSON file
    for (const filePath of jsonFiles) {
      console.log(`\n📄 Processing: ${path.basename(filePath)}`);
      
      try {
        const quizzes = await loadQuizzesFromJSON(filePath);
        const results = await seedQuizzes(systemUser, quizzes);
        
        totalResults.created += results.created;
        totalResults.updated += results.updated;
        totalResults.errors += results.errors;
        
        console.log(`📊 File Results: ${results.created} created, ${results.updated} updated, ${results.errors} errors`);
      } catch (error) {
        console.error(`❌ Failed to process file ${filePath}:`, error);
        totalResults.errors++;
      }
    }
    
    console.log('\n🎉 Seeding completed!');
    console.log(`📈 Total Results:`);
    console.log(`   ✅ Created: ${totalResults.created}`);
    console.log(`   🔄 Updated: ${totalResults.updated}`);
    console.log(`   ❌ Errors: ${totalResults.errors}`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from database');
  }
}

// Run the script
main();