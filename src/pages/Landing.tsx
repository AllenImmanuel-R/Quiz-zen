import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Play, 
  Trophy, 
  Users, 
  Brain, 
  Target, 
  Zap, 
  Star,
  BookOpen,
  BarChart3,
  Award
} from "lucide-react";

export const Landing = () => {
  const { user, isAuthenticated } = useAuth();
  
  const features = [
    {
      icon: Brain,
      title: "Create Quizzes",
      description: "Design engaging quizzes with multiple question types and instant feedback."
    },
    {
      icon: Play,
      title: "Play & Learn",
      description: "Challenge yourself with interactive quizzes across various categories."
    },
    {
      icon: Trophy,
      title: "Compete",
      description: "Climb the leaderboards and showcase your knowledge against others."
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "Track your progress with detailed performance insights and statistics."
    }
  ];

  const stats = [
    { label: "Active Players", value: "10K+", icon: Users },
    { label: "Quizzes Created", value: "5K+", icon: BookOpen },
    { label: "Questions Answered", value: "100K+", icon: Target },
    { label: "Achievements Earned", value: "50K+", icon: Award }
  ];

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-subtle">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            {/* Hero Badge */}
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              The Ultimate Quiz Platform
            </Badge>

            {/* Hero Title */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight animate-slide-up">
              Master Your{" "}
              <span className="text-gradient">Knowledge</span>
            </h1>

            {/* Hero Subtitle */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto animate-fade-in">
              Create, play, and compete with interactive quizzes. 
              Challenge yourself, learn something new, and climb the leaderboards.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-bounce-in">
              <Button variant="hero" size="xl" asChild>
                <Link to="/dashboard">
                  <Play className="w-5 h-5 mr-2" />
                  {isAuthenticated ? 'Continue Playing' : 'Start Playing'}
                </Link>
              </Button>
              
              {!isAuthenticated && (
                <Button variant="ghost" size="xl" asChild>
                  <Link to="/signup">
                    Sign Up Free
                  </Link>
                </Button>
              )}
              
              {isAuthenticated && (
                <Button variant="ghost" size="xl" asChild>
                  <Link to="/profile">
                    View Profile
                  </Link>
                </Button>
              )}
            </div>

            {/* Hero Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 animate-fade-in">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Background Decorations */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-secondary/10 rounded-full blur-xl animate-pulse"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Everything You Need to{" "}
              <span className="text-gradient">Excel</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to make learning fun, competitive, and rewarding.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const isAnalytics = feature.title === "Analytics";
              const isPlayLearn = feature.title === "Play & Learn";
              const isCompete = feature.title === "Compete";
              
              const cardContent = (
                <>
                  <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </>
              );
              
              // Determine navigation path based on feature type
              const isCreateQuiz = feature.title === "Create Quizzes";
              let navigationPath = null;
              
              if (isAnalytics) {
                navigationPath = isAuthenticated ? "/profile?tab=analytics" : "/login";
              } else if (isCreateQuiz) {
                navigationPath = isAuthenticated ? "/dashboard" : "/login";
              } else if (isPlayLearn) {
                navigationPath = "/dashboard";
              } else if (isCompete) {
                navigationPath = "/leaderboard";
              }
              
              return navigationPath ? (
                <Link
                  key={index}
                  to={navigationPath}
                  className="block animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Card className="card-quiz p-6 text-center group hover:card-glow cursor-pointer transition-all hover:scale-105">
                    {cardContent}
                  </Card>
                </Link>
              ) : (
                <Card 
                  key={index} 
                  className="card-quiz p-6 text-center group hover:card-glow animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {cardContent}
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="space-y-6 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              {isAuthenticated ? `Welcome back, ${user?.name?.split(' ')[0]}!` : 'Ready to Challenge Your Mind?'}
            </h2>
            <p className="text-xl text-white/90">
              {isAuthenticated 
                ? 'Continue your learning journey and challenge yourself with new quizzes.'
                : 'Join thousands of learners who are already mastering their knowledge with Quiz Master.'
              }
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Button variant="secondary" size="xl" asChild>
                    <Link to="/signup">
                      <Star className="w-5 h-5 mr-2" />
                      Get Started Now
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="secondary" 
                    size="xl" 
                    className="bg-white/20 border-white/30 text-white hover:bg-white hover:text-primary backdrop-blur-sm"
                    asChild
                  >
                    <Link to="/dashboard">
                      Browse Quizzes
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="secondary" size="xl" asChild>
                    <Link to="/dashboard">
                      <Play className="w-5 h-5 mr-2" />
                      Take a Quiz
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="secondary" 
                    size="xl" 
                    className="bg-white/20 border-white/30 text-white hover:bg-white hover:text-primary backdrop-blur-sm"
                    asChild
                  >
                    <Link to="/leaderboard">
                      <Trophy className="w-5 h-5 mr-2" />
                      View Leaderboard
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent opacity-90"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-white/5 rounded-full blur-3xl"></div>
        </div>
      </section>
    </div>
  );
};