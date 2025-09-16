# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Frontend Development (Vite + React)
- `npm run dev` - Start development server at http://localhost:8080
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode  
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint on all files

### Backend Development (Express + MongoDB)
The backend server runs on Node.js with Express and optional MongoDB integration:
- `cd server && node index.js` - Start backend server (runs on port 4000)
- Backend supports both MongoDB (via MONGO_URI env var) and in-memory fallback mode

### Environment Setup
- Frontend: Node.js 18+ with npm
- Backend: Node.js with optional MongoDB connection
- Development server uses port 8080, backend uses port 4000
- No test framework currently configured

## Architecture Overview

### Tech Stack
- **Frontend**: Vite + React 18 + TypeScript + TailwindCSS
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **State Management**: React Query (@tanstack/react-query) for server state
- **Routing**: React Router DOM v6
- **Backend**: Express.js with JWT authentication
- **Database**: MongoDB with Mongoose (optional, falls back to in-memory)
- **Styling**: Tailwind CSS with custom design system

### Application Structure

#### Frontend Architecture (`/src`)
- **Pages**: Route-level components (Landing, Dashboard, Profile, Auth, Leaderboard)
- **Components**: Reusable UI components with `/ui` for shadcn components and `/layout` for app structure
- **API Layer**: Centralized in `/lib/api.ts` with typed interfaces for all backend communication
- **Routing**: Single-page application with protected routes and authentication state management

#### Backend Architecture (`/server`)
- **Routes**: RESTful API endpoints for auth, quiz management, and user profiles
- **Models**: Mongoose schemas for User, Quiz, Profile, and Leaderboard entities  
- **Middleware**: JWT authentication middleware for protected endpoints
- **Fallback Mode**: Graceful degradation when MongoDB is unavailable

### Key Design Patterns

#### Component Architecture
- shadcn/ui provides the base design system with Radix UI accessibility
- Custom theme system with CSS variables and Tailwind extensions
- Consistent use of TypeScript interfaces for all data structures
- Component composition over inheritance

#### Data Flow
- React Query manages server state with caching and synchronization
- JWT tokens stored in localStorage for authentication persistence
- RESTful API design with proper HTTP status codes and error handling
- Optimistic updates for better user experience

#### Quiz System
- Quiz entities contain questions, answers, metadata (difficulty, category, duration)
- User profiles track quiz history, achievements, and statistics
- Leaderboard system supports both global and category-specific rankings
- Support for multiple question types and scoring systems

### Development Guidelines

#### File Organization
- Use absolute imports with `@/` alias for src directory
- Group related functionality in feature-based directories
- Separate UI components from business logic components
- Keep API interfaces co-located with their usage

#### Styling Approach  
- Leverage the existing design system variables and utility classes
- Use semantic color tokens (primary, secondary, success, destructive)
- Implement responsive design with mobile-first approach
- Custom animations and transitions use CSS variables for consistency

#### API Integration
- All backend communication goes through `/lib/api.ts`
- Use TypeScript interfaces for request/response types  
- Handle loading and error states consistently across components
- Implement proper error boundaries for API failures

### Authentication Flow
JWT-based authentication with localStorage persistence. Auth state is managed at the application level with protected routes. Backend supports both database and in-memory user storage depending on MongoDB availability.

### Known Limitations
- No test suite currently implemented
- Backend runs in development mode without production optimizations
- Limited error handling for edge cases
- No automated deployment pipeline configured