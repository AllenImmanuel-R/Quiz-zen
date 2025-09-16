import { useState } from "react";
import { QuizCard } from "@/components/quiz/QuizCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Plus,
  Brain,
  Globe,
  Code,
  Palette,
  Calculator,
  Trophy
} from "lucide-react";

const categories = [
  { name: "All", icon: Globe, count: 42 },
  { name: "Science", icon: Brain, count: 12 },
  { name: "Technology", icon: Code, count: 8 },
  { name: "Arts", icon: Palette, count: 6 },
  { name: "Math", icon: Calculator, count: 10 },
  { name: "Sports", icon: Trophy, count: 6 }
];

const quizzes = [
  {
    id: "1",
    title: "JavaScript Fundamentals",
    description: "Test your knowledge of core JavaScript concepts including variables, functions, and DOM manipulation.",
    category: "Technology",
    difficulty: "Medium" as const,
    questionCount: 20,
    duration: 15,
    playersCount: 1234
  },
  {
    id: "2", 
    title: "World Geography",
    description: "Explore capitals, countries, and landmarks from around the globe in this comprehensive geography quiz.",
    category: "Science",
    difficulty: "Easy" as const,
    questionCount: 15,
    duration: 10,
    playersCount: 856
  },
  {
    id: "3",
    title: "Advanced Mathematics", 
    description: "Challenge yourself with calculus, algebra, and complex mathematical problems.",
    category: "Math",
    difficulty: "Hard" as const,
    questionCount: 25,
    duration: 30,
    playersCount: 432
  },
  {
    id: "4",
    title: "Art History Masterpieces",
    description: "Journey through art history from Renaissance to modern contemporary works.",
    category: "Arts", 
    difficulty: "Medium" as const,
    questionCount: 18,
    duration: 20,
    playersCount: 678
  },
  {
    id: "5",
    title: "Olympic Sports Trivia",
    description: "Test your knowledge about Olympic games, records, and famous athletes throughout history.",
    category: "Sports",
    difficulty: "Easy" as const,
    questionCount: 12,
    duration: 8,
    playersCount: 945
  },
  {
    id: "6",
    title: "React & TypeScript",
    description: "Advanced concepts in React development with TypeScript integration and best practices.",
    category: "Technology",
    difficulty: "Hard" as const,
    questionCount: 30,
    duration: 25,
    playersCount: 567
  }
];

export const Dashboard = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesCategory = selectedCategory === "All" || quiz.category === selectedCategory;
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePlayQuiz = (quizId: string) => {
    // Navigate to quiz play page
    console.log(`Starting quiz: ${quizId}`);
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Discover <span className="text-gradient">Quizzes</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Choose from our collection of engaging quizzes and test your knowledge
              </p>
            </div>
            
            <Button variant="hero" size="lg" className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Quiz
            </Button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search quizzes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            
            <Button variant="outline" size="lg" className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Categories</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Badge
                key={category.name}
                variant={selectedCategory === category.name ? "default" : "outline"}
                className={`cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105 ${
                  selectedCategory === category.name 
                    ? "bg-primary text-primary-foreground shadow-quiz-md" 
                    : "hover:bg-primary/10 hover:text-primary hover:border-primary/20"
                }`}
                onClick={() => setSelectedCategory(category.name)}
              >
                <category.icon className="w-4 h-4 mr-2" />
                {category.name}
                <span className="ml-2 text-xs opacity-75">({category.count})</span>
              </Badge>
            ))}
          </div>
        </div>

        {/* Quizzes Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              {selectedCategory === "All" ? "All Quizzes" : `${selectedCategory} Quizzes`}
              <span className="text-muted-foreground ml-2">({filteredQuizzes.length})</span>
            </h2>
          </div>

          {filteredQuizzes.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredQuizzes.map((quiz, index) => (
                <div
                  key={quiz.id}
                  className="animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <QuizCard {...quiz} onPlay={handlePlayQuiz} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No quizzes found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or browse a different category.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};