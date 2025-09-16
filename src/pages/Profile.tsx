import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Mail, 
  Calendar, 
  Trophy, 
  Target,
  Clock,
  TrendingUp,
  Award,
  Edit,
  Settings,
  BarChart3,
  BookOpen,
  Star
} from "lucide-react";

const quizHistory = [
  {
    id: "1",
    title: "JavaScript Fundamentals",
    category: "Technology",
    score: 85,
    totalQuestions: 20,
    correctAnswers: 17,
    timeTaken: "12:34",
    completedAt: "2024-01-15",
    difficulty: "Medium"
  },
  {
    id: "2",
    title: "World Geography",
    category: "Science",
    score: 92,
    totalQuestions: 15,
    correctAnswers: 14,
    timeTaken: "08:45",
    completedAt: "2024-01-14",
    difficulty: "Easy"
  },
  {
    id: "3",
    title: "Advanced Mathematics",
    category: "Math",
    score: 78,
    totalQuestions: 25,
    correctAnswers: 19,
    timeTaken: "24:12",
    completedAt: "2024-01-13",
    difficulty: "Hard"
  },
  {
    id: "4",
    title: "Art History Masterpieces",
    category: "Arts",
    score: 88,
    totalQuestions: 18,
    correctAnswers: 16,
    timeTaken: "15:23",
    completedAt: "2024-01-12",
    difficulty: "Medium"
  }
];

const achievements = [
  {
    id: "1",
    name: "First Steps",
    description: "Complete your first quiz",
    icon: "🎯",
    earned: true,
    earnedAt: "2024-01-10"
  },
  {
    id: "2",
    name: "Speed Demon",
    description: "Complete a quiz in under 5 minutes",
    icon: "⚡",
    earned: true,
    earnedAt: "2024-01-11"
  },
  {
    id: "3",
    name: "Perfect Score",
    description: "Get 100% on any quiz",
    icon: "🏆",
    earned: true,
    earnedAt: "2024-01-12"
  },
  {
    id: "4",
    name: "Streak Master",
    description: "Maintain a 7-day quiz streak",
    icon: "🔥",
    earned: true,
    earnedAt: "2024-01-13"
  },
  {
    id: "5",
    name: "Knowledge Hunter",
    description: "Complete 50 quizzes",
    icon: "📚",
    earned: false,
    progress: 28
  },
  {
    id: "6",
    name: "Category Expert",
    description: "Master all categories",
    icon: "🌟",
    earned: false,
    progress: 4
  }
];

const userStats = {
  totalQuizzes: 28,
  averageScore: 86,
  totalTimeSpent: "6h 42m",
  currentStreak: 5,
  longestStreak: 12,
  favoriteCategory: "Technology",
  rank: 42,
  totalPoints: 1456
};

export const Profile = () => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-success";
    if (score >= 75) return "text-primary";
    return "text-destructive";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-success/10 text-success border-success/20";
      case "Medium": return "bg-primary/10 text-primary border-primary/20";
      case "Hard": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted/10 text-muted-foreground border-muted/20";
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Profile Header */}
        <div className="mb-8">
          <Card className="card-quiz p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar & Basic Info */}
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24 border-4 border-primary/20">
                  <AvatarImage src="" alt="Your Avatar" />
                  <AvatarFallback className="bg-gradient-primary text-white text-2xl font-bold">
                    YU
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-foreground">Your Name</h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>your.email@example.com</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Joined January 2024</span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 min-w-0">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gradient">{userStats.totalQuizzes}</div>
                  <div className="text-sm text-muted-foreground">Quizzes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gradient">{userStats.averageScore}%</div>
                  <div className="text-sm text-muted-foreground">Avg Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gradient">#{userStats.rank}</div>
                  <div className="text-sm text-muted-foreground">Rank</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gradient">{userStats.currentStreak}</div>
                  <div className="text-sm text-muted-foreground">Streak</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Quiz History
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Performance Stats */}
              <Card className="card-quiz p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Performance
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Average Score</span>
                    <span className="font-semibold text-foreground">{userStats.averageScore}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Points</span>
                    <span className="font-semibold text-foreground">{userStats.totalPoints.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Time Spent</span>
                    <span className="font-semibold text-foreground">{userStats.totalTimeSpent}</span>
                  </div>
                </div>
              </Card>

              {/* Streaks */}
              <Card className="card-quiz p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Streaks
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Current Streak</span>
                    <span className="font-semibold text-destructive flex items-center gap-1">
                      🔥 {userStats.currentStreak} days
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Longest Streak</span>
                    <span className="font-semibold text-foreground">{userStats.longestStreak} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Favorite Category</span>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {userStats.favoriteCategory}
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Recent Achievement */}
              <Card className="card-quiz p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  Latest Achievement
                </h3>
                <div className="text-center space-y-3">
                  <div className="text-4xl">{achievements[3].icon}</div>
                  <div>
                    <div className="font-semibold text-foreground">{achievements[3].name}</div>
                    <div className="text-sm text-muted-foreground">{achievements[3].description}</div>
                  </div>
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                    Earned {achievements[3].earnedAt}
                  </Badge>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Quiz History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className="card-quiz">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-6">Recent Quiz Attempts</h3>
                <div className="space-y-4">
                  {quizHistory.map((quiz, index) => (
                    <div 
                      key={quiz.id}
                      className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-foreground">{quiz.title}</h4>
                            <Badge variant="outline" className={getDifficultyColor(quiz.difficulty)}>
                              {quiz.difficulty}
                            </Badge>
                            <Badge variant="outline" className="bg-muted/50 text-muted-foreground">
                              {quiz.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{quiz.correctAnswers}/{quiz.totalQuestions} correct</span>
                            <span>⏱️ {quiz.timeTaken}</span>
                            <span>📅 {quiz.completedAt}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getScoreColor(quiz.score)}`}>
                            {quiz.score}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement, index) => (
                <Card 
                  key={achievement.id}
                  className={`card-quiz p-6 text-center ${achievement.earned ? 'border-primary/20' : 'opacity-60'} animate-scale-in`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-4xl mb-3">{achievement.icon}</div>
                  <h3 className="font-semibold text-foreground mb-2">{achievement.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{achievement.description}</p>
                  
                  {achievement.earned ? (
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                      <Star className="w-3 h-3 mr-1" />
                      Earned {achievement.earnedAt}
                    </Badge>
                  ) : (
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Progress: {achievement.progress}/50
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-gradient-primary h-2 rounded-full transition-all"
                          style={{ width: `${(achievement.progress! / 50) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="card-quiz p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Category Performance</h3>
                <div className="space-y-4">
                  {[
                    { category: "Technology", score: 89, quizzes: 8 },
                    { category: "Science", score: 85, quizzes: 6 },
                    { category: "Math", score: 82, quizzes: 5 },
                    { category: "Arts", score: 88, quizzes: 4 },
                    { category: "Sports", score: 84, quizzes: 5 }
                  ].map((cat, index) => (
                    <div key={cat.category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-foreground font-medium">{cat.category}</span>
                        <span className="text-muted-foreground text-sm">{cat.score}% • {cat.quizzes} quizzes</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-gradient-primary h-2 rounded-full transition-all"
                          style={{ width: `${cat.score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="card-quiz p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Weekly Activity</h3>
                <div className="text-center py-8">
                  <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Detailed analytics coming soon!</p>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};