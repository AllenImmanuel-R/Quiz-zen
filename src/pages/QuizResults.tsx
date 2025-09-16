import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Clock, 
  Target, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  Share2,
  RotateCcw,
  Home
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateLeaderboard, addQuizResult, type QuizWithQuestions } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface QuizAnswer {
  questionIndex: number;
  selectedOptionIndex: number;
  isCorrect: boolean;
  timeSpent: number;
}

interface LocationState {
  quiz: QuizWithQuestions;
  answers: QuizAnswer[];
  timeSpent: number;
}

export const QuizResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();

  const state = location.state as LocationState;
  
  if (!state || !state.quiz || !state.answers) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Results Not Available</h2>
          <p className="text-muted-foreground mb-6">
            Unable to display quiz results. Please try taking the quiz again.
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const { quiz, answers, timeSpent } = state;
  
  // Calculate results
  const totalQuestions = quiz.questions.length;
  const correctAnswers = answers.filter(a => a.isCorrect).length;
  const incorrectAnswers = totalQuestions - correctAnswers;
  const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);
  const averageTimePerQuestion = Math.round(timeSpent / totalQuestions);

  // Update leaderboard and user profile when results are loaded
  useEffect(() => {
    const updateUserData = async () => {
      if (!user || !id) return;
      
      try {
        // Calculate total points based on score, difficulty, and time
        const difficultyMultiplier = {
          'Easy': 1,
          'Medium': 1.5,
          'Hard': 2
        }[quiz.difficulty] || 1;
        
        const basePoints = scorePercentage * 10;
        const timeBonus = Math.max(0, (quiz.duration * 60 - timeSpent) * 0.1);
        const totalPoints = Math.round((basePoints + timeBonus) * difficultyMultiplier);
        
        // Update leaderboard
        await updateLeaderboard({
          quizId: id,
          category: quiz.category,
          score: scorePercentage,
          totalPoints: totalPoints
        });
        
        // Add quiz result to user profile
        await addQuizResult({
          quizId: id,
          score: scorePercentage,
          totalQuestions: totalQuestions,
          correctAnswers: correctAnswers,
          timeTaken: formatTime(timeSpent),
          difficulty: quiz.difficulty
        });
        
      } catch (error) {
        console.error('Failed to update user data:', error);
        // Don't show error to user as this is background operation
      }
    };
    
    updateUserData();
  }, [user, id, quiz, scorePercentage, totalQuestions, correctAnswers, timeSpent]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-success";
    if (score >= 70) return "text-primary";
    if (score >= 50) return "text-warning";
    return "text-destructive";
  };

  const getScoreMessage = (score: number) => {
    if (score === 100) return "Perfect! Outstanding performance! 🎉";
    if (score >= 90) return "Excellent work! You're a quiz master! 🌟";
    if (score >= 80) return "Great job! You really know your stuff! 👏";
    if (score >= 70) return "Well done! Good understanding of the topic! 👍";
    if (score >= 60) return "Not bad! Keep learning and improving! 📚";
    if (score >= 50) return "You're on the right track! Practice makes perfect! 💪";
    return "Don't give up! Every expert was once a beginner! 🌱";
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleShare = async () => {
    const shareText = `I just scored ${scorePercentage}% on "${quiz.title}"! 🎯\n\nCorrect answers: ${correctAnswers}/${totalQuestions}\nTime taken: ${formatTime(timeSpent)}\n\nTry it yourself!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Quiz Results - ${quiz.title}`,
          text: shareText,
          url: window.location.origin
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied to clipboard!",
        description: "Your results have been copied to the clipboard."
      });
    }
  };

  const handleRetakeQuiz = () => {
    navigate(`/quiz/${id}`);
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center mb-4 animate-bounce-in">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              {scorePercentage >= 80 && (
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center animate-pulse">
                  <span className="text-white text-lg">🏆</span>
                </div>
              )}
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">Quiz Completed!</h1>
          <p className="text-xl text-muted-foreground mb-4">{quiz.title}</p>
          
          <div className="flex items-center justify-center gap-3 mb-6">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              {quiz.category}
            </Badge>
            <Badge variant="outline" className={
              quiz.difficulty === 'Easy' ? 'bg-success/10 text-success border-success/20' :
              quiz.difficulty === 'Medium' ? 'bg-primary/10 text-primary border-primary/20' :
              'bg-destructive/10 text-destructive border-destructive/20'
            }>
              {quiz.difficulty}
            </Badge>
          </div>
        </div>

        {/* Score Overview */}
        <Card className="p-8 mb-8 text-center">
          <div className="space-y-6">
            <div>
              <div className={`text-6xl font-bold ${getScoreColor(scorePercentage)} mb-2`}>
                {scorePercentage}%
              </div>
              <p className="text-xl text-foreground mb-2">Your Score</p>
              <p className="text-muted-foreground">{getScoreMessage(scorePercentage)}</p>
            </div>
            
            <Progress value={scorePercentage} className="h-3" />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
                <div className="text-2xl font-bold text-success">{correctAnswers}</div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <XCircle className="w-6 h-6 text-destructive" />
                </div>
                <div className="text-2xl font-bold text-destructive">{incorrectAnswers}</div>
                <div className="text-sm text-muted-foreground">Incorrect</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary">{formatTime(timeSpent)}</div>
                <div className="text-sm text-muted-foreground">Total Time</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary">{averageTimePerQuestion}s</div>
                <div className="text-sm text-muted-foreground">Avg/Question</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Question Review */}
        <Card className="p-6 mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-6">Question Review</h3>
          <div className="space-y-6">
            {quiz.questions.map((question, index) => {
              const answer = answers.find(a => a.questionIndex === index);
              const userAnswer = answer ? question.options[answer.selectedOptionIndex] : null;
              const correctOption = question.options.find(opt => opt.isCorrect);
              const isCorrect = answer?.isCorrect || false;
              
              return (
                <div key={index} className="border-l-4 pl-6 py-4" style={{
                  borderLeftColor: isCorrect ? 'rgb(34 197 94)' : 'rgb(239 68 68)'
                }}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                      isCorrect ? 'bg-success' : 'bg-destructive'
                    }`}>
                      {isCorrect ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground mb-2">
                        Question {index + 1}: {question.text}
                      </h4>
                      
                      {userAnswer && (
                        <div className="mb-2">
                          <span className="text-sm text-muted-foreground">Your answer: </span>
                          <span className={isCorrect ? 'text-success font-medium' : 'text-destructive font-medium'}>
                            {userAnswer.text}
                          </span>
                        </div>
                      )}
                      
                      {!isCorrect && correctOption && (
                        <div className="mb-2">
                          <span className="text-sm text-muted-foreground">Correct answer: </span>
                          <span className="text-success font-medium">{correctOption.text}</span>
                        </div>
                      )}
                      
                      {question.explanation && (
                        <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                          <strong>Explanation:</strong> {question.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            <Home className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share Results
          </Button>
          
          <Button variant="default" onClick={handleRetakeQuiz}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Retake Quiz
          </Button>
        </div>
      </div>
    </div>
  );
};