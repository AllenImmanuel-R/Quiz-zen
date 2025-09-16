# Quiz Database Seeding Script

This script allows you to upload quizzes from JSON files directly to your MongoDB database.

## 🚀 Quick Start

### 1. Prepare Your JSON Files
Create JSON files with quiz data in the correct format (see example below).

### 2. Run the Seeding Script

#### Option A: Using specific files
```bash
cd server/scripts
node seed-quizzes.js path/to/your/quiz-file.json
```

#### Option B: Using multiple files
```bash
node seed-quizzes.js file1.json file2.json file3.json
```

#### Option C: Auto-detect files in data directory
```bash
# Place your JSON files in server/scripts/data/ directory
node seed-quizzes.js
```

## 📋 JSON Format Requirements

Your JSON file must contain an array of quiz objects with this structure:

```json
[
  {
    "title": "Quiz Title",
    "description": "Description of the quiz",
    "category": "Category Name",
    "difficulty": "Easy", // Must be: Easy, Medium, or Hard
    "duration": 15, // Duration in minutes (number)
    "image": "/images/quiz-image.jpg", // Optional
    "isPublic": true, // Optional, defaults to true
    "questions": [
      {
        "text": "Question text here?",
        "options": [
          {
            "text": "Option 1",
            "isCorrect": false
          },
          {
            "text": "Correct Option",
            "isCorrect": true
          },
          {
            "text": "Option 3",
            "isCorrect": false
          }
        ],
        "explanation": "Explanation of the correct answer" // Optional
      }
      // Add more questions...
    ]
  }
  // Add more quizzes...
]
```

## 📚 Field Explanations

### Quiz Fields:
- **title** (required): The name of your quiz
- **description** (required): A brief description of what the quiz covers
- **category** (required): Category name (e.g., "Science", "Technology", "Math", "Arts", "Sports")
- **difficulty** (required): Must be exactly "Easy", "Medium", or "Hard"
- **duration** (required): Time limit in minutes (number)
- **image** (optional): Path to quiz image
- **isPublic** (optional): Whether quiz is publicly available (defaults to true)
- **questions** (required): Array of question objects

### Question Fields:
- **text** (required): The question text
- **options** (required): Array of at least 2 answer options
- **explanation** (optional): Explanation of the correct answer

### Option Fields:
- **text** (required): The answer option text
- **isCorrect** (required): Boolean indicating if this is the correct answer

## ✅ Validation Rules

The script validates your data and will show errors for:

- Missing required fields
- Invalid difficulty values
- Questions with fewer than 2 options
- Questions with no correct answers
- Invalid data types

## 🔄 Update Behavior

- **New Quizzes**: Creates new quiz entries
- **Existing Quizzes**: Updates existing quizzes based on title + category match
- **Safe Operation**: Won't delete existing data, only creates or updates

## 📊 Output

The script provides detailed feedback:

```
🚀 Starting quiz seeding process...

✅ Connected to MongoDB
✅ System user created

📄 Processing: my-quizzes.json
📚 Seeding 5 quizzes...
✅ Created: JavaScript Fundamentals
✅ Created: Basic Science Quiz
🔄 Updated: Mathematics Challenge
❌ Quiz 3 validation errors: [Quiz 3: Missing title]
✅ Created: Sports Trivia

📊 File Results: 3 created, 1 updated, 1 errors

🎉 Seeding completed!
📈 Total Results:
   ✅ Created: 3
   🔄 Updated: 1
   ❌ Errors: 1

👋 Disconnected from database
```

## 🛠️ Troubleshooting

### Common Issues:

1. **MongoDB Connection Error**
   - Make sure your MongoDB server is running
   - Check your `.env` file has correct `MONGODB_URI`

2. **Validation Errors**
   - Check that all required fields are present
   - Ensure `difficulty` is exactly "Easy", "Medium", or "Hard"
   - Verify `duration` is a number
   - Make sure each question has at least one correct answer

3. **File Not Found**
   - Check the file path is correct
   - Ensure the file has `.json` extension

### Environment Variables:
Make sure your server's `.env` file contains:
```
MONGODB_URI=mongodb://localhost:27017/quizzen
```

## 📁 Example Directory Structure

```
server/
├── scripts/
│   ├── seed-quizzes.js
│   ├── data/
│   │   ├── science-quizzes.json
│   │   ├── tech-quizzes.json
│   │   └── math-quizzes.json
│   └── README.md
```

## 💡 Tips

1. **Test First**: Start with a small JSON file to test the process
2. **Backup**: Always backup your database before running large imports
3. **Organize**: Use separate files for different categories
4. **Validate**: The script will validate your data, but double-check manually too
5. **Images**: Make sure image paths are accessible by your application

## 🔧 Dependencies

The script requires these npm packages (already in your project):
- mongoose
- bcryptjs
- dotenv

That's it! You're ready to populate your quiz database with custom content. 🎉