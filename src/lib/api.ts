export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

type LoginResponse = {
  token: string;
};

export type Quiz = {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  questionCount: number;
  duration: number;
  playersCount: number;
  image?: string;
  creator: {
    _id: string;
    name: string;
  };
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Question = {
  text: string;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
  explanation?: string;
};

export type QuizWithQuestions = Quiz & {
  questions: Question[];
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    headers,
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }

  return (await res.json()) as T;
}

// Auth endpoints
export async function login(email: string, password: string) {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function signup(name: string, email: string, password: string) {
  return request<LoginResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export function setToken(token: string) {
  localStorage.setItem("quizzen_token", token);
}

export function getToken() {
  return localStorage.getItem("quizzen_token");
}

export function logout() {
  localStorage.removeItem("quizzen_token");
}

// Quiz endpoints
export async function getQuizzes(params?: { 
  category?: string; 
  search?: string;
  difficulty?: string;
}) {
  const queryParams = new URLSearchParams();
  
  if (params?.category) {
    queryParams.append('category', params.category);
  }
  
  if (params?.search) {
    queryParams.append('search', params.search);
  }
  
  if (params?.difficulty) {
    queryParams.append('difficulty', params.difficulty);
  }
  
  const queryString = queryParams.toString();
  const url = `/quiz${queryString ? `?${queryString}` : ''}`;
  
  return request<Quiz[]>(url);
}

export async function getQuiz(id: string) {
  return request<QuizWithQuestions>(`/quiz/${id}`);
}

export async function createQuiz(quiz: Omit<QuizWithQuestions, '_id' | 'creator' | 'createdAt' | 'updatedAt' | 'playersCount'>) {
  return request<Quiz>('/quiz', {
    method: 'POST',
    body: JSON.stringify(quiz),
  });
}

export async function updateQuiz(id: string, quiz: Partial<QuizWithQuestions>) {
  return request<Quiz>(`/quiz/${id}`, {
    method: 'PUT',
    body: JSON.stringify(quiz),
  });
}

export async function deleteQuiz(id: string) {
  return request<{ message: string }>(`/quiz/${id}`, {
    method: 'DELETE',
  });
}

export async function playQuiz(id: string) {
  return request<{ success: boolean; playersCount: number }>(`/quiz/${id}/play`, {
    method: 'POST',
  });
}

// Profile endpoints
export type Profile = {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  bio: string;
  avatar?: string;
  quizHistory: QuizHistory[];
  achievements: Achievement[];
  stats: UserStats;
  createdAt: string;
  updatedAt: string;
};

export type QuizHistory = {
  _id: string;
  quiz: {
    _id: string;
    title: string;
    category: string;
  };
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: string;
  difficulty: "Easy" | "Medium" | "Hard";
  completedAt: string;
};

export type Achievement = {
  _id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: string;
};

export type UserStats = {
  totalQuizzesTaken: number;
  averageScore: number;
  totalCorrectAnswers: number;
  totalQuestions: number;
  bestCategory?: string;
  quizStreak: number;
  lastQuizDate?: string;
};

export async function getProfile() {
  return request<Profile>('/profile/me');
}

export async function updateProfile(data: { bio?: string; avatar?: string }) {
  return request<Profile>('/profile', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function addQuizResult(data: {
  quizId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: string;
  difficulty: "Easy" | "Medium" | "Hard";
}) {
  return request<Profile>('/profile/quiz-history', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getQuizHistory() {
  return request<QuizHistory[]>('/profile/quiz-history');
}

export async function getAchievements() {
  return request<Achievement[]>('/profile/achievements');
}

// Leaderboard endpoints
export type LeaderboardEntry = {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  score: number;
  quizzesTaken: number;
  averageScore: number;
  totalPoints: number;
  rank: number;
  lastActive: string;
};

export type UserRank = {
  globalRank: number;
  categoryRanks: Record<string, number>;
};

export async function getGlobalLeaderboard() {
  return request<LeaderboardEntry[]>('/leaderboard/global');
}

export async function getCategoryLeaderboard(category: string) {
  return request<LeaderboardEntry[]>(`/leaderboard/category/${category}`);
}

export async function updateLeaderboard(data: {
  quizId: string;
  category: string;
  score: number;
  totalPoints: number;
}) {
  return request<{ categoryRank: number; globalRank: number }>('/leaderboard/update', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getUserRank() {
  return request<UserRank>('/leaderboard/rank');
}
