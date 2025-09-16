import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Crown, Filter, TrendingUp } from "lucide-react";

const categories = [
  "All Categories",
  "Technology", 
  "Science",
  "Math",
  "Arts",
  "Sports"
];

const leaderboardData = [
  {
    rank: 1,
    name: "Alex Chen",
    avatar: "",
    score: 2847,
    quizzesCompleted: 45,
    accuracy: 94,
    streak: 12,
    badges: ["🏆", "🎯", "🔥"]
  },
  {
    rank: 2,
    name: "Sarah Johnson",
    avatar: "",
    score: 2756,
    quizzesCompleted: 42,
    accuracy: 91,
    streak: 8,
    badges: ["🥈", "📚", "⭐"]
  },
  {
    rank: 3,
    name: "Mike Rodriguez",
    avatar: "",
    score: 2689,
    quizzesCompleted: 38,
    accuracy: 89,
    streak: 15,
    badges: ["🥉", "🔥", "🎯"]
  },
  {
    rank: 4,
    name: "Emily Davis",
    avatar: "",
    score: 2534,
    quizzesCompleted: 41,
    accuracy: 87,
    streak: 6,
    badges: ["📚", "⭐", "🎨"]
  },
  {
    rank: 5,
    name: "David Kim",
    avatar: "",
    score: 2489,
    quizzesCompleted: 35,
    accuracy: 92,
    streak: 9,
    badges: ["🔥", "🎯", "💻"]
  },
  {
    rank: 6,
    name: "Lisa Wang",
    avatar: "",
    score: 2367,
    quizzesCompleted: 39,
    accuracy: 85,
    streak: 4,
    badges: ["📚", "⭐", "🧬"]
  },
  {
    rank: 7,
    name: "James Wilson",
    avatar: "",
    score: 2298,
    quizzesCompleted: 33,
    accuracy: 88,
    streak: 7,
    badges: ["🏃", "⚽", "🎯"]
  },
  {
    rank: 8,
    name: "Maria Garcia",
    avatar: "",
    score: 2234,
    quizzesCompleted: 37,
    accuracy: 86,
    streak: 5,
    badges: ["🎨", "📚", "⭐"]
  }
];

export const Leaderboard = () => {
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankCardStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "card-glow border-yellow-500/20";
      case 2:
        return "border-gray-400/20";
      case 3:
        return "border-amber-600/20";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            <Trophy className="w-12 h-12 text-primary inline-block mr-4" />
            <span className="text-gradient">Leaderboard</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See how you rank against other quiz masters from around the world
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`cursor-pointer px-4 py-2 transition-all hover:scale-105 ${
                  selectedCategory === category 
                    ? "bg-primary text-primary-foreground shadow-quiz-md" 
                    : "hover:bg-primary/10 hover:text-primary hover:border-primary/20"
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
          
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            More Filters
          </Button>
        </div>

        {/* Top 3 Podium */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {leaderboardData.slice(0, 3).map((player, index) => (
            <Card 
              key={player.rank} 
              className={`card-quiz p-6 text-center relative ${getRankCardStyle(player.rank)} animate-scale-in`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {/* Rank Icon */}
              <div className="flex justify-center mb-4">
                {getRankIcon(player.rank)}
              </div>

              {/* Avatar */}
              <Avatar className="w-20 h-20 mx-auto mb-4 border-4 border-primary/20">
                <AvatarImage src={player.avatar} alt={player.name} />
                <AvatarFallback className="text-lg font-semibold bg-gradient-primary text-white">
                  {player.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>

              {/* Player Info */}
              <h3 className="text-xl font-bold text-foreground mb-2">{player.name}</h3>
              <div className="text-3xl font-bold text-gradient mb-2">{player.score.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground mb-4">points</p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-semibold text-foreground">{player.quizzesCompleted}</div>
                  <div className="text-muted-foreground">Quizzes</div>
                </div>
                <div>
                  <div className="font-semibold text-foreground">{player.accuracy}%</div>
                  <div className="text-muted-foreground">Accuracy</div>
                </div>
              </div>

              {/* Badges */}
              <div className="flex justify-center gap-1 mt-4">
                {player.badges.map((badge, i) => (
                  <span key={i} className="text-lg">{badge}</span>
                ))}
              </div>

              {/* Streak Indicator */}
              {player.streak > 0 && (
                <div className="absolute top-4 right-4 bg-destructive text-destructive-foreground px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                  🔥 {player.streak}
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Rest of Leaderboard */}
        <Card className="card-quiz">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              Full Rankings
            </h2>
            
            <div className="space-y-4">
              {leaderboardData.slice(3).map((player, index) => (
                <div 
                  key={player.rank}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors animate-fade-in"
                  style={{ animationDelay: `${(index + 3) * 0.1}s` }}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="w-8 text-center">
                      {getRankIcon(player.rank)}
                    </div>

                    {/* Avatar & Name */}
                    <Avatar className="w-12 h-12 border-2 border-primary/20">
                      <AvatarImage src={player.avatar} alt={player.name} />
                      <AvatarFallback className="bg-gradient-primary-light text-white font-semibold">
                        {player.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h3 className="font-semibold text-foreground">{player.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{player.quizzesCompleted} quizzes</span>
                        <span>{player.accuracy}% accuracy</span>
                        {player.streak > 0 && (
                          <span className="text-destructive">🔥 {player.streak} streak</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Score & Badges */}
                  <div className="text-right">
                    <div className="text-xl font-bold text-foreground">
                      {player.score.toLocaleString()}
                    </div>
                    <div className="flex gap-1 justify-end mt-1">
                      {player.badges.map((badge, i) => (
                        <span key={i} className="text-sm">{badge}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Your Rank */}
        <Card className="card-quiz mt-8 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-8 text-center text-lg font-bold text-muted-foreground">#42</div>
              <Avatar className="w-12 h-12 border-2 border-primary/20">
                <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                  YU
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-foreground">You</h3>
                <p className="text-sm text-muted-foreground">Keep climbing! 🚀</p>
              </div>
            </div>
            <div className="text-xl font-bold text-foreground">1,456</div>
          </div>
        </Card>
      </div>
    </div>
  );
};