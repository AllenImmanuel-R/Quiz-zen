import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  BookOpen,
  Calculator,
  Trophy,
  MapPin,
  Music,
  Loader2
} from "lucide-react";
import { getQuizzes, Quiz } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const categories = [
  { name: "All", icon: Globe, count: 0 },
  { name: "Science", icon: Brain, count: 0 },
  { name: "Technology", icon: Code, count: 0 },
  { name: "History", icon: BookOpen, count: 0 },
  { name: "Math", icon: Calculator, count: 0 },
  { name: "Sports", icon: Trophy, count: 0 }
];

export const Dashboard = () => {
  const [allQuizzes, setAllQuizzes] = useState<Quiz[]>([]);
  const [displayedQuizzes, setDisplayedQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Update category counts based on all quizzes (not filtered)
  const categoriesWithCounts = categories.map(category => ({
    ...category,
    count: category.name === "All" 
      ? allQuizzes.length 
      : allQuizzes.filter(quiz => quiz.category === category.name).length
  }));

  // Fetch all quizzes on mount
  useEffect(() => {
    const fetchAllQuizzes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await getQuizzes({});
        setAllQuizzes(data);
      } catch (err) {
        console.error("Failed to fetch quizzes:", err);
        setError("Failed to load quizzes. Please try again later.");
        toast({
          title: "Error",
          description: "Failed to load quizzes. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAllQuizzes();
  }, [toast]);

  // Filter and search quizzes based on selected category and search query
  useEffect(() => {
    let filtered = allQuizzes;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(quiz => quiz.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(quiz => 
        quiz.title.toLowerCase().includes(query) ||
        quiz.description.toLowerCase().includes(query) ||
        quiz.category.toLowerCase().includes(query)
      );
    }

    setDisplayedQuizzes(filtered);
  }, [allQuizzes, selectedCategory, searchQuery]);

  // Handle playing a quiz
  const handlePlayQuiz = (id: string) => {
    navigate(`/quiz/${id}`);
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
            {categoriesWithCounts.map((category) => (
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

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading quizzes...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Error</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        )}

        {/* Quizzes Grid */}
        {!loading && !error && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                {selectedCategory === "All" ? "All Quizzes" : `${selectedCategory} Quizzes`}
                <span className="text-muted-foreground ml-2">({displayedQuizzes.length})</span>
              </h2>
            </div>

            {displayedQuizzes.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedQuizzes.map((quiz, index) => (
                  <div
                    key={quiz._id}
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
        )}
      </div>
    </div>
  );
};