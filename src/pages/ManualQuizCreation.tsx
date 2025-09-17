import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  BookOpen,
  Clock,
  Target,
  Settings,
  CheckCircle,
  AlertCircle,
  Eye,
  Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createQuiz as createQuizAPI } from "@/lib/api";

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  text: string;
  options: QuizOption[];
  explanation?: string;
}

interface QuizDetails {
  title: string;
  description: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration: number;
}

const categories = [
  "Science",
  "Technology", 
  "Math",
  "History",
  "Sports"
];

export const ManualQuizCreation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Quiz details (Step 1)
  const [quizDetails, setQuizDetails] = useState<QuizDetails>({
    title: '',
    description: '',
    category: '',
    difficulty: 'Easy',
    duration: 10
  });

  // Questions (Step 2)
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      text: '',
      options: [
        { id: '1', text: '', isCorrect: true },
        { id: '2', text: '', isCorrect: false }
      ],
      explanation: ''
    }
  ]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Step validation
  const validateStep1 = () => {
    return quizDetails.title.trim() !== '' && 
           quizDetails.description.trim() !== '' &&
           quizDetails.category !== '' &&
           quizDetails.duration > 0;
  };

  const validateStep2 = () => {
    return questions.every(q => 
      q.text.trim() !== '' &&
      q.options.length >= 2 &&
      q.options.every(opt => opt.text.trim() !== '') &&
      q.options.some(opt => opt.isCorrect)
    );
  };

  // Question management
  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: '',
      options: [
        { id: '1', text: '', isCorrect: true },
        { id: '2', text: '', isCorrect: false }
      ],
      explanation: ''
    };
    setQuestions([...questions, newQuestion]);
    setCurrentQuestionIndex(questions.length);
  };

  const removeQuestion = (questionId: string) => {
    if (questions.length <= 1) {
      toast({
        title: "Cannot remove question",
        description: "A quiz must have at least one question.",
        variant: "destructive"
      });
      return;
    }
    
    const newQuestions = questions.filter(q => q.id !== questionId);
    setQuestions(newQuestions);
    
    if (currentQuestionIndex >= newQuestions.length) {
      setCurrentQuestionIndex(Math.max(0, newQuestions.length - 1));
    }
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, ...updates } : q
    ));
  };

  // Option management
  const addOption = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;
    
    if (question.options.length >= 6) {
      toast({
        title: "Maximum options reached",
        description: "A question can have maximum 6 options.",
        variant: "destructive"
      });
      return;
    }

    const newOption: QuizOption = {
      id: Date.now().toString(),
      text: '',
      isCorrect: false
    };

    updateQuestion(questionId, {
      options: [...question.options, newOption]
    });
  };

  const removeOption = (questionId: string, optionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;
    
    if (question.options.length <= 2) {
      toast({
        title: "Cannot remove option",
        description: "A question must have at least 2 options.",
        variant: "destructive"
      });
      return;
    }

    const newOptions = question.options.filter(opt => opt.id !== optionId);
    
    // Ensure at least one option is correct
    if (!newOptions.some(opt => opt.isCorrect)) {
      newOptions[0].isCorrect = true;
    }

    updateQuestion(questionId, { options: newOptions });
  };

  const updateOption = (questionId: string, optionId: string, updates: Partial<QuizOption>) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    const newOptions = question.options.map(opt => 
      opt.id === optionId ? { ...opt, ...updates } : opt
    );

    // If setting an option as correct, ensure only one is correct for single-answer questions
    if (updates.isCorrect === true) {
      newOptions.forEach(opt => {
        if (opt.id !== optionId) opt.isCorrect = false;
      });
    }

    updateQuestion(questionId, { options: newOptions });
  };

  // Navigation
  const nextStep = () => {
    if (currentStep === 1 && !validateStep1()) {
      toast({
        title: "Please complete all fields",
        description: "Fill in quiz title, description, category, and duration.",
        variant: "destructive"
      });
      return;
    }
    
    if (currentStep === 2 && !validateStep2()) {
      toast({
        title: "Please complete all questions",
        description: "Each question must have text, at least 2 options, and one correct answer.",
        variant: "destructive"
      });
      return;
    }

    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Quiz creation
  const createQuiz = async () => {
    try {
      const quizData = {
        ...quizDetails,
        questions: questions.map(q => ({
          text: q.text,
          options: q.options.map(opt => ({
            text: opt.text,
            isCorrect: opt.isCorrect
          })),
          explanation: q.explanation || undefined
        }))
      };

      // Call API to create quiz
      console.log('Creating quiz:', quizData);
      
      const createdQuiz = await createQuizAPI(quizData);
      console.log('Quiz created successfully:', createdQuiz);
      
      toast({
        title: "Quiz created successfully!",
        description: `"${quizDetails.title}" has been created with ${questions.length} questions.`
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast({
        title: "Failed to create quiz",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/quiz/create')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Creation Hub
          </Button>
          
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Create Quiz Manually
          </h1>
          <p className="text-muted-foreground">
            Build your quiz step by step with full control over every detail.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step === currentStep
                    ? 'bg-primary text-primary-foreground'
                    : step < currentStep
                    ? 'bg-success text-success-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {step < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step
                  )}
                </div>
                <div className="ml-3">
                  <p className={`font-medium ${step === currentStep ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step === 1 && 'Quiz Details'}
                    {step === 2 && 'Add Questions'}
                    {step === 3 && 'Review & Create'}
                  </p>
                </div>
                {step < totalSteps && (
                  <div className={`w-20 h-0.5 mx-4 ${step < currentStep ? 'bg-success' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Quiz Details */}
        {currentStep === 1 && (
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-semibold">Quiz Information</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Quiz Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter quiz title"
                    value={quizDetails.title}
                    onChange={(e) => setQuizDetails({...quizDetails, title: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={quizDetails.category}
                    onValueChange={(value) => setQuizDetails({...quizDetails, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty *</Label>
                  <Select
                    value={quizDetails.difficulty}
                    onValueChange={(value: 'Easy' | 'Medium' | 'Hard') => 
                      setQuizDetails({...quizDetails, difficulty: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    max="120"
                    value={quizDetails.duration}
                    onChange={(e) => setQuizDetails({...quizDetails, duration: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what your quiz is about"
                  rows={3}
                  value={quizDetails.description}
                  onChange={(e) => setQuizDetails({...quizDetails, description: e.target.value})}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Step 2: Questions */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Question Navigation */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Questions ({questions.length})</h3>
                </div>
                <Button onClick={addQuestion} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </div>
              
              {questions.length > 1 && (
                <div className="flex gap-2 mt-4 flex-wrap">
                  {questions.map((_, index) => (
                    <Button
                      key={index}
                      variant={index === currentQuestionIndex ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentQuestionIndex(index)}
                    >
                      {index + 1}
                    </Button>
                  ))}
                </div>
              )}
            </Card>

            {/* Current Question Editor */}
            {currentQuestion && (
              <Card className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold">Question {currentQuestionIndex + 1}</h4>
                    {questions.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeQuestion(currentQuestion.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Question Text *</Label>
                    <Textarea
                      placeholder="Enter your question"
                      value={currentQuestion.text}
                      onChange={(e) => updateQuestion(currentQuestion.id, { text: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Answer Options *</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addOption(currentQuestion.id)}
                        disabled={currentQuestion.options.length >= 6}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Option
                      </Button>
                    </div>

                    {currentQuestion.options.map((option, optionIndex) => (
                      <div key={option.id} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name={`correct-${currentQuestion.id}`}
                          checked={option.isCorrect}
                          onChange={() => updateOption(currentQuestion.id, option.id, { isCorrect: true })}
                          className="w-4 h-4 text-primary"
                        />
                        <Input
                          placeholder={`Option ${optionIndex + 1}`}
                          value={option.text}
                          onChange={(e) => updateOption(currentQuestion.id, option.id, { text: e.target.value })}
                          className="flex-1"
                        />
                        {currentQuestion.options.length > 2 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOption(currentQuestion.id, option.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    
                    <p className="text-sm text-muted-foreground">
                      Select the radio button next to the correct answer
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Explanation (Optional)</Label>
                    <Textarea
                      placeholder="Explain why this is the correct answer"
                      value={currentQuestion.explanation}
                      onChange={(e) => updateQuestion(currentQuestion.id, { explanation: e.target.value })}
                      rows={2}
                    />
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-semibold">Review Your Quiz</h3>
              </div>

              {/* Quiz Summary */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Title</Label>
                  <p className="font-semibold">{quizDetails.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                  <p className="font-semibold">{quizDetails.category}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Difficulty</Label>
                  <Badge variant="outline">{quizDetails.difficulty}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
                  <p className="font-semibold">{quizDetails.duration} minutes</p>
                </div>
              </div>

              <div className="mb-4">
                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                <p>{quizDetails.description}</p>
              </div>

              <Separator className="my-6" />

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Questions ({questions.length})</Label>
                <div className="space-y-4 mt-2">
                  {questions.map((question, index) => (
                    <div key={question.id} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">
                        {index + 1}. {question.text}
                      </h4>
                      <div className="space-y-1">
                        {question.options.map((option, optionIndex) => (
                          <div key={option.id} className={`text-sm ${option.isCorrect ? 'text-success font-medium' : 'text-muted-foreground'}`}>
                            {optionIndex + 1}. {option.text} {option.isCorrect && '✓'}
                          </div>
                        ))}
                      </div>
                      {question.explanation && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          <strong>Explanation:</strong> {question.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          {currentStep > 1 && (
            <Button variant="outline" onClick={prevStep}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
          )}
          
          <div className="ml-auto">
            {currentStep < totalSteps ? (
              <Button onClick={nextStep}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={createQuiz} className="bg-gradient-to-r from-blue-500 to-cyan-500">
                <Save className="w-4 h-4 mr-2" />
                Create Quiz
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};