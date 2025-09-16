import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, BookOpen } from "lucide-react";

interface QuizCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  questionCount: number;
  duration: number;
  playersCount: number;
  image?: string;
  onPlay: (id: string) => void;
}

const difficultyColors = {
  Easy: "bg-success/10 text-success border-success/20",
  Medium: "bg-primary/10 text-primary border-primary/20", 
  Hard: "bg-destructive/10 text-destructive border-destructive/20"
};

export const QuizCard = ({
  id,
  title,
  description,
  category,
  difficulty,
  questionCount,
  duration,
  playersCount,
  image,
  onPlay
}: QuizCardProps) => {
  return (
    <Card className="card-quiz overflow-hidden group cursor-pointer animate-fade-in">
      {/* Quiz Image */}
      <div className="relative h-48 bg-gradient-primary-light overflow-hidden">
        {image ? (
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-slow"
          />
        ) : (
          <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
            <BookOpen className="w-16 h-16 text-white opacity-50" />
          </div>
        )}
        
        {/* Category Badge */}
        <Badge 
          variant="secondary" 
          className="absolute top-3 right-3 bg-white/90 text-primary"
        >
          {category}
        </Badge>
      </div>

      {/* Quiz Content */}
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
              {title}
            </h3>
            <Badge 
              variant="outline"
              className={difficultyColors[difficulty]}
            >
              {difficulty}
            </Badge>
          </div>
          
          <p className="text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>

        {/* Quiz Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>{questionCount} questions</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{duration} min</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{playersCount} played</span>
          </div>
        </div>

        {/* Play Button */}
        <Button 
          variant="hero" 
          className="w-full"
          onClick={() => onPlay(id)}
        >
          Start Quiz
        </Button>
      </div>
    </Card>
  );
};