import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, Trophy, User, Home, PlusCircle } from "lucide-react";

export const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border shadow-quiz-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Play className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">Quiz Master</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/') 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            
            <Link
              to="/dashboard"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/dashboard') 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Quizzes</span>
            </Link>
            
            <Link
              to="/leaderboard"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/leaderboard') 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Leaderboard</span>
            </Link>
            
            <Link
              to="/profile"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/profile') 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button variant="hero" size="sm" asChild>
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};