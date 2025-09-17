import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
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
  Star,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useSearchParams } from "react-router-dom";
import { getProfile, getUserRank, Profile as ProfileType, UserRank } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Default achievements that can be earned
const defaultAchievements = [
  {
    _id: "first_quiz",
    name: "First Steps",
    description: "Complete your first quiz",
    icon: "🎯",
    earned: false
  },
  {
    _id: "speed_demon",
    name: "Speed Demon", 
    description: "Complete a quiz in under 5 minutes",
    icon: "⚡",
    earned: false
  },
  {
    _id: "perfect_score",
    name: "Perfect Score",
    description: "Score 100% on any quiz",
    icon: "🌟",
    earned: false
  },
  {
    _id: "quiz_master",
    name: "Quiz Master",
    description: "Complete 25 quizzes", 
    icon: "🏆",
    earned: false
  },
  {
    _id: "knowledge_hunter",
    name: "Knowledge Hunter",
    description: "Complete 50 quizzes", 
    icon: "📚",
    earned: false
  },
  {
    _id: "category_expert",
    name: "Category Expert",
    description: "Score 90%+ average in any category",
    icon: "🎓",
    earned: false
  }
];

export const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl === 'analytics' ? 'analytics' : 'overview');
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [userRank, setUserRank] = useState<UserRank | null>(null);
  const { toast } = useToast();

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        const [profileData, rankData] = await Promise.all([
          getProfile(),
          getUserRank()
        ]);
        
        setProfile(profileData);
        setUserRank(rankData);
        
      } catch (err) {
        console.error('Failed to fetch profile data:', err);
        setError('Failed to load profile data. Please try again later.');
        toast({
          title: "Error",
          description: "Failed to load profile data.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [user, toast]);

  useEffect(() => {
    // Update active tab when URL parameter changes
    if (tabFromUrl === 'analytics') {
      setActiveTab('analytics');
    }
  }, [tabFromUrl]);

  // Helper functions
  const calculateCategoryStats = () => {
    if (!profile?.quizHistory) return [];
    
    const categoryMap = new Map();
    
    profile.quizHistory.forEach(quiz => {
      // Check if quiz and quiz.quiz exist before accessing category
      if (!quiz || !quiz.quiz || !quiz.quiz.category) {
        return; // Skip this entry if quiz data is missing
      }
      
      const category = quiz.quiz.category;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { scores: [], count: 0 });
      }
      
      const categoryData = categoryMap.get(category);
      categoryData.scores.push(quiz.score);
      categoryData.count++;
    });
    
    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      score: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
      quizzes: data.count
    }));
  };
  
  const processAchievements = () => {
    if (!profile) return defaultAchievements;
    
    const earned = new Set(profile.achievements.map(a => a._id));
    const stats = profile.stats;
    
    return defaultAchievements.map(achievement => {
      const isEarned = earned.has(achievement._id);
      let progress: number | undefined;
      
      // Calculate progress for non-earned achievements
      if (!isEarned) {
        switch (achievement._id) {
          case 'first_quiz':
            progress = stats.totalQuizzesTaken > 0 ? 100 : 0;
            break;
          case 'quiz_master':
            progress = Math.min(100, (stats.totalQuizzesTaken / 25) * 100);
            break;
          case 'knowledge_hunter':
            progress = Math.min(100, (stats.totalQuizzesTaken / 50) * 100);
            break;
          case 'category_expert':
            const categoryStats = calculateCategoryStats();
            const hasExpertCategory = categoryStats.some(cat => cat.score >= 90);
            const maxScore = categoryStats.length > 0 ? Math.max(...categoryStats.map(cat => cat.score)) : 0;
            progress = hasExpertCategory ? 100 : maxScore;
            break;
        }
      }
      
      return {
        ...achievement,
        earned: isEarned,
        progress,
        earnedAt: isEarned ? profile.achievements.find(a => a._id === achievement._id)?.earnedAt : undefined
      };
    });
  };
  
  const formatTime = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };
  
  const getJoinDate = () => {
    if (profile?.createdAt) {
      return format(new Date(profile.createdAt), 'MMMM yyyy');
    }
    return 'Recently';
  };

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

  if (!user) {
    return (
      <div className="min-h-screen pt-20 pb-12 flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to view your profile.</p>
      </div>
    );
  }
  
  const categoryStats = calculateCategoryStats();
  const achievements = processAchievements();
  
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Loading profile data...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-12 h-12 text-destructive" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Error</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : (
          <>
            {/* Profile Header */}
            <div className="mb-8">
              <Card className="card-quiz p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  {/* Avatar & Basic Info */}
                  <div className="flex items-center gap-6">
                    <Avatar className="w-24 h-24 border-4 border-primary/20">
                      <AvatarImage src="" alt={user.name} />
                      <AvatarFallback className="bg-gradient-primary text-white text-2xl font-bold">
                        {user.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-2">
                      <h1 className="text-3xl font-bold text-foreground">{user.name?.split(' ')[0]}</h1>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {getJoinDate()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 min-w-0">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gradient">{profile?.stats.totalQuizzesTaken || 0}</div>
                      <div className="text-sm text-muted-foreground">Quizzes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gradient">{Math.round(profile?.stats.averageScore || 0)}%</div>
                      <div className="text-sm text-muted-foreground">Avg Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gradient">#{userRank?.globalRank || '--'}</div>
                      <div className="text-sm text-muted-foreground">Rank</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gradient">{profile?.stats.quizStreak || 0}</div>
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
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
                        <span className="font-semibold text-foreground">{Math.round(profile?.stats.averageScore || 0)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Questions</span>
                        <span className="font-semibold text-foreground">{profile?.stats.totalQuestions || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Correct Answers</span>
                        <span className="font-semibold text-foreground">{profile?.stats.totalCorrectAnswers || 0}</span>
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
                          🔥 {profile?.stats.quizStreak || 0} {profile?.stats.quizStreak === 1 ? 'quiz' : 'quizzes'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Accuracy</span>
                        <span className="font-semibold text-foreground">
                          {profile?.stats.totalQuestions ? 
                            Math.round((profile.stats.totalCorrectAnswers / profile.stats.totalQuestions) * 100) 
                            : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Best Category</span>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          {profile?.stats.bestCategory || 'None yet'}
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
                    {(() => {
                      const latestAchievement = achievements.find(a => a.earned && a.earnedAt) || achievements.find(a => a.earned);
                      if (latestAchievement && latestAchievement.earned) {
                        return (
                          <div className="text-center space-y-3">
                            <div className="text-4xl">{latestAchievement.icon}</div>
                            <div>
                              <div className="font-semibold text-foreground">{latestAchievement.name}</div>
                              <div className="text-sm text-muted-foreground">{latestAchievement.description}</div>
                            </div>
                            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                              {latestAchievement.earnedAt ? 
                                `Earned ${format(new Date(latestAchievement.earnedAt), 'MMM d, yyyy')}` : 
                                'Recently earned'
                              }
                            </Badge>
                          </div>
                        );
                      } else {
                        return (
                          <div className="text-center space-y-3">
                            <div className="text-4xl text-muted-foreground">🏆</div>
                            <div>
                              <div className="font-semibold text-foreground">No Achievements Yet</div>
                              <div className="text-sm text-muted-foreground">Complete quizzes to earn your first achievement!</div>
                            </div>
                          </div>
                        );
                      }
                    })()}
                  </Card>
                </div>
              </TabsContent>

              {/* Quiz History Tab */}
              <TabsContent value="history" className="space-y-6">
                <Card className="card-quiz">
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-6">Recent Quiz Attempts</h3>
                    <div className="space-y-4">
                      {profile?.quizHistory && profile.quizHistory.length > 0 ? (
                        profile.quizHistory
                          .filter(quiz => quiz && quiz.quiz && quiz.quiz.title) // Filter out invalid entries
                          .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
                          .map((quiz, index) => (
                          <div 
                            key={quiz._id}
                            className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors animate-fade-in"
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-semibold text-foreground">{quiz.quiz.title}</h4>
                                  <Badge variant="outline" className={getDifficultyColor(quiz.difficulty)}>
                                    {quiz.difficulty}
                                  </Badge>
                                  <Badge variant="outline" className="bg-muted/50 text-muted-foreground">
                                    {quiz.quiz.category}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span>{quiz.correctAnswers}/{quiz.totalQuestions} correct</span>
                                  <span>⏱️ {quiz.timeTaken}</span>
                                  <span>📅 {format(new Date(quiz.completedAt), 'MMM d, yyyy')}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`text-2xl font-bold ${getScoreColor(quiz.score)}`}>
                                  {quiz.score}%
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-foreground mb-2">No Quiz History</h3>
                          <p className="text-muted-foreground">
                            Complete your first quiz to see your history here!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* Achievements Tab */}
              <TabsContent value="achievements" className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {achievements.map((achievement, index) => (
                    <Card 
                      key={achievement._id}
                      className={`card-quiz p-6 text-center ${achievement.earned ? 'border-primary/20' : 'opacity-60'} animate-scale-in`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="text-4xl mb-3">{achievement.icon}</div>
                      <h3 className="font-semibold text-foreground mb-2">{achievement.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{achievement.description}</p>
                      
                      {achievement.earned ? (
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                          <Star className="w-3 h-3 mr-1" />
                          {achievement.earnedAt ? 
                            `Earned ${format(new Date(achievement.earnedAt), 'MMM d')}` : 
                            'Earned'
                          }
                        </Badge>
                      ) : achievement.progress !== undefined ? (
                        <div>
                          <div className="text-sm text-muted-foreground mb-2">
                            Progress: {Math.round(achievement.progress)}%
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-gradient-primary h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(100, achievement.progress)}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          Not yet earned
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
                      {categoryStats.length > 0 ? (
                        categoryStats.map((cat) => (
                          <div key={cat.category} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-foreground font-medium">{cat.category}</span>
                              <span className="text-muted-foreground text-sm">{cat.score}% • {cat.quizzes} {cat.quizzes === 1 ? 'quiz' : 'quizzes'}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-gradient-primary h-2 rounded-full transition-all"
                                style={{ width: `${cat.score}%` }}
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">Complete quizzes to see category performance!</p>
                        </div>
                      )}
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
          </>
        )}
      </div>
    </div>
  );
};