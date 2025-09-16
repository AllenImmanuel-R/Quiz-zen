const fs = require('fs').promises;
const path = require('path');

// Function to decode HTML entities
function decodeHtml(html) {
  const entities = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
    '&deg;': '°',
    '&sup2;': '²',
    '&sup3;': '³',
  };
  
  return html.replace(/&[#\w]+;/g, (entity) => {
    return entities[entity] || entity;
  });
}

// Function to categorize questions by subject
function categorizeQuestions(questions) {
  const categories = {
    'Science': [],
    'Technology': [],
    'Math': [],
    'Arts': [],
    'Sports': []
  };

  questions.forEach(question => {
    const category = question.category;
    
    if (category.includes('Mathematics')) {
      categories['Math'].push(question);
    } else if (category.includes('Computers') || category.includes('Science: Computers')) {
      categories['Technology'].push(question);
    } else if (category.includes('Science') || category.includes('Nature')) {
      categories['Science'].push(question);
    } else if (category.includes('Art')) {
      categories['Arts'].push(question);
    } else if (category.includes('Sports')) {
      categories['Sports'].push(question);
    } else {
      // Default to Science for uncategorized questions
      categories['Science'].push(question);
    }
  });

  return categories;
}

// Function to convert API question to our format
function convertQuestion(apiQuestion) {
  const allAnswers = [apiQuestion.correct_answer, ...apiQuestion.incorrect_answers];
  const shuffledAnswers = allAnswers.sort(() => Math.random() - 0.5);

  return {
    text: decodeHtml(apiQuestion.question),
    options: shuffledAnswers.map(answer => ({
      text: decodeHtml(answer),
      isCorrect: answer === apiQuestion.correct_answer
    })),
    explanation: `The correct answer is: ${decodeHtml(apiQuestion.correct_answer)}`
  };
}

// Function to create quiz from category questions
function createQuiz(categoryName, questions) {
  const difficultyDistribution = {
    'Easy': questions.filter(q => q.difficulty === 'easy'),
    'Medium': questions.filter(q => q.difficulty === 'medium'),
    'Hard': questions.filter(q => q.difficulty === 'hard')
  };

  const quizzes = [];

  // Create separate quizzes for each difficulty if we have enough questions
  Object.entries(difficultyDistribution).forEach(([difficulty, questionsOfDifficulty]) => {
    if (questionsOfDifficulty.length >= 10) {
      const quiz = {
        title: `${categoryName} ${difficulty} Quiz`,
        description: `Test your ${categoryName.toLowerCase()} knowledge with ${difficulty.toLowerCase()} level questions`,
        category: categoryName,
        difficulty: difficulty,
        duration: difficulty === 'Easy' ? 15 : difficulty === 'Medium' ? 25 : 35,
        image: `/images/${categoryName.toLowerCase()}-quiz.jpg`,
        isPublic: true,
        questions: questionsOfDifficulty.slice(0, Math.min(questionsOfDifficulty.length, 20))
          .map(convertQuestion)
      };
      quizzes.push(quiz);
    }
  });

  // If we don't have enough questions for separate difficulty quizzes, create a mixed one
  if (quizzes.length === 0 && questions.length >= 10) {
    const quiz = {
      title: `${categoryName} Mixed Quiz`,
      description: `Test your ${categoryName.toLowerCase()} knowledge with questions of varying difficulty`,
      category: categoryName,
      difficulty: 'Medium',
      duration: 30,
      image: `/images/${categoryName.toLowerCase()}-quiz.jpg`,
      isPublic: true,
      questions: questions.slice(0, Math.min(questions.length, 25)).map(convertQuestion)
    };
    quizzes.push(quiz);
  }

  return quizzes;
}

async function convertTriviaApi() {
  try {
    console.log('🔄 Converting Open Trivia DB API response to quiz format...\n');

    // Read the API response file
    const apiDataPath = path.join(__dirname, 'data', 'example-quizzes.json');
    const rawData = await fs.readFile(apiDataPath, 'utf8');
    const apiResponse = JSON.parse(rawData);

    if (!apiResponse.results || !Array.isArray(apiResponse.results)) {
      throw new Error('Invalid API response format');
    }

    console.log(`📊 Found ${apiResponse.results.length} questions from Open Trivia DB`);

    // Categorize questions
    const categorizedQuestions = categorizeQuestions(apiResponse.results);
    
    console.log('\n📂 Questions by category:');
    Object.entries(categorizedQuestions).forEach(([category, questions]) => {
      console.log(`   ${category}: ${questions.length} questions`);
    });

    // Convert to quiz format
    const allQuizzes = [];
    
    Object.entries(categorizedQuestions).forEach(([categoryName, questions]) => {
      if (questions.length > 0) {
        const categoryQuizzes = createQuiz(categoryName, questions);
        allQuizzes.push(...categoryQuizzes);
      }
    });

    console.log(`\n📚 Created ${allQuizzes.length} quizzes:`);
    allQuizzes.forEach(quiz => {
      console.log(`   ✅ ${quiz.title} (${quiz.questions.length} questions, ${quiz.difficulty} difficulty)`);
    });

    // Write converted quizzes to new file
    const outputPath = path.join(__dirname, 'data', 'converted-quizzes.json');
    await fs.writeFile(outputPath, JSON.stringify(allQuizzes, null, 2));

    console.log(`\n💾 Converted quizzes saved to: ${path.basename(outputPath)}`);
    console.log('🎉 Conversion completed successfully!');

    return allQuizzes;

  } catch (error) {
    console.error('❌ Error converting trivia API data:', error);
    throw error;
  }
}

// Run the conversion
if (require.main === module) {
  convertTriviaApi()
    .then(() => {
      console.log('\n🚀 Ready to seed database! Run: node seed-quizzes.js data/converted-quizzes.json');
    })
    .catch(error => {
      console.error('❌ Conversion failed:', error);
      process.exit(1);
    });
}

module.exports = { convertTriviaApi };