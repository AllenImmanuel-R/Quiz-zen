import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  ArrowRight,
  Flag,
  AlertTriangle
} from "lucide-react";
import { getQuiz } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { QuizWithQuestions, Question } from "@/lib/api";

interface QuizAnswer {
  questionIndex: number;
  selectedOptionIndex: number;
  isCorrect: boolean;
  timeSpent: number;
}

export const Quiz = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [quiz, setQuiz] = useState<QuizWithQuestions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Load quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      if (!id) {
        setError("Quiz ID not provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const quizData = await getQuiz(id);
        setQuiz(quizData);
        setTimeRemaining(quizData.duration * 60); // Convert minutes to seconds
        setQuestionStartTime(Date.now());
      } catch (err) {
        console.error("Failed to fetch quiz:", err);
        setError("Failed to load quiz. Please try again.");
        toast({
          title: "Error",
          description: "Failed to load quiz. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id, toast]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0 || isQuizCompleted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isQuizCompleted]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
  };

  const handleNextQuestion = () => {
    if (!quiz || selectedOption === null) return;

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const isCorrect = currentQuestion.options[selectedOption].isCorrect;
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

    // Save answer
    const newAnswer: QuizAnswer = {
      questionIndex: currentQuestionIndex,
      selectedOptionIndex: selectedOption,
      isCorrect,
      timeSpent
    };

    setAnswers(prev => [...prev, newAnswer]);

    // Move to next question or finish quiz
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setQuestionStartTime(Date.now());
    } else {
      handleSubmitQuiz([...answers, newAnswer]);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      
      // Restore previous answer if it exists
      const previousAnswer = answers[currentQuestionIndex - 1];
      if (previousAnswer) {
        setSelectedOption(previousAnswer.selectedOptionIndex);
      } else {
        setSelectedOption(null);
      }
    }
  };

  const handleSubmitQuiz = (finalAnswers?: QuizAnswer[]) => {
    const quizAnswers = finalAnswers || answers;
    setIsQuizCompleted(true);
    
    // Navigate to results page with quiz data
    navigate(`/quiz/${id}/results`, { 
      state: { 
        quiz, 
        answers: quizAnswers,
        timeSpent: quiz ? (quiz.duration * 60) - timeRemaining : 0
      } 
    });
  };

  const getProgressPercentage = () => {
    if (!quiz) return 0;
    return ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Quiz Not Found</h2>
          <p className="text-muted-foreground mb-6">{error || "The quiz you're looking for doesn't exist."}</p>
          <Button onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Quiz Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
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

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                <span className={`font-mono ${timeRemaining < 300 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">{quiz.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
              <span>•</span>
              <span>{answers.filter(a => a.isCorrect).length} correct so far</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>
        </div>

        {/* Question Card */}
        <Card className="p-8 mb-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-6">
                {currentQuestion.text}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all hover:border-primary/50 ${
                    selectedOption === index
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedOption === index
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground'
                    }`}>
                      <span className="text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </span>
                    </div>
                    <span className="text-foreground">{option.text}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => handleSubmitQuiz()}
            >
              <Flag className="w-4 h-4 mr-2" />
              Submit Quiz
            </Button>

            <Button
              variant="default"
              onClick={handleNextQuestion}
              disabled={selectedOption === null}
            >
              {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};