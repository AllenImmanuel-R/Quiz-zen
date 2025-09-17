import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  PlusCircle, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  Target,
  Zap,
  BookOpen,
  Settings,
  Magic,
  Star
} from "lucide-react";

export const QuizCreation = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    // Add a small delay for visual feedback
    setTimeout(() => {
      if (option === 'generate') {
        navigate('/quiz/generate');
      } else if (option === 'create') {
        navigate('/quiz/manual');
      }
    }, 200);
  };

  const creationOptions = [
    {
      id: 'generate',
      title: 'Generate Quiz',
      subtitle: 'AI-Powered Creation',
      description: 'Let our AI create engaging quizzes for you. Just provide a topic, and we\'ll generate questions automatically.',
      icon: Sparkles,
      gradient: 'from-purple-500 to-pink-500',
      features: [
        'AI-generated questions',
        'Multiple difficulty levels',
        'Various question types',
        'Instant creation'
      ],
      badge: 'Smart',
      recommended: true
    },
    {
      id: 'create',
      title: 'Create Quiz',
      subtitle: 'Manual Creation',
      description: 'Build your quiz from scratch with full control over every question, answer, and setting.',
      icon: PlusCircle,
      gradient: 'from-blue-500 to-cyan-500',
      features: [
        'Custom questions',
        'Full customization',
        'Multiple choice & true/false',
        'Rich formatting options'
      ],
      badge: 'Custom',
      recommended: false
    }
  ];

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-4 py-2 mb-4">
            <Brain className="w-4 h-4 mr-2" />
            Quiz Creation Hub
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Create Your Perfect{" "}
            <span className="text-gradient">Quiz</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose how you'd like to create your quiz. Generate one instantly with AI or build it manually with full control.
          </p>
        </div>

        {/* Creation Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {creationOptions.map((option, index) => (
            <Card
              key={option.id}
              className={`card-quiz p-8 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl relative overflow-hidden ${
                selectedOption === option.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleOptionSelect(option.id)}
            >
              {/* Recommended Badge */}
              {option.recommended && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                    <Star className="w-3 h-3 mr-1" />
                    Recommended
                  </Badge>
                </div>
              )}

              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${option.gradient} opacity-5`}></div>

              {/* Content */}
              <div className="relative z-10 space-y-6">
                {/* Icon and Header */}
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${option.gradient} flex items-center justify-center`}>
                    <option.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <Badge variant="outline" className={`mb-2 bg-gradient-to-r ${option.gradient} text-white border-0`}>
                    {option.badge}
                  </Badge>
                  
                  <h3 className="text-2xl font-bold text-foreground mb-1">
                    {option.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground font-medium">
                    {option.subtitle}
                  </p>
                </div>

                {/* Description */}
                <p className="text-muted-foreground text-center leading-relaxed">
                  {option.description}
                </p>

                {/* Features */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground text-sm uppercase tracking-wide">
                    Key Features
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {option.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${option.gradient}`}></div>
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <Button 
                  className={`w-full bg-gradient-to-r ${option.gradient} hover:opacity-90 text-white border-0 group`}
                  size="lg"
                >
                  {option.id === 'generate' ? 'Generate with AI' : 'Create Manually'}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>

                {/* Time Estimate */}
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>
                    {option.id === 'generate' ? '~2 minutes' : '~10-15 minutes'}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Multiple Categories</h4>
              <p className="text-sm text-muted-foreground">
                Create quizzes in Science, Technology, Math, History, Sports, and more.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Flexible Settings</h4>
              <p className="text-sm text-muted-foreground">
                Customize difficulty, duration, question types, and scoring options.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Share & Play</h4>
              <p className="text-sm text-muted-foreground">
                Publish your quizzes publicly or keep them private for personal use.
              </p>
            </div>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="px-6"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};