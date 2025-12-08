# Task Assignment System

A full-stack web application for managing tasks, developers, and skills with intelligent task assignment capabilities using Google's Generative AI.

## Overview

The Task Assignment System is a modern web application designed to efficiently manage development tasks, developer profiles, and skill sets. It features intelligent task assignment using AI, hierarchical task management with subtasks, and a comprehensive skill-matching system.

### Key Features

- Task management with hierarchical subtasks
- Developer profile management with skills
- Intelligent AI-powered task assignment
- Skill-based task matching

## System Architecture

The application follows a modern three-tier architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   (React +      │◄──►│   (Node.js +    │◄──►│   (PostgreSQL)  │
│   TypeScript)   │    │   Express)      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Architecture Components

1. **Frontend (React + TypeScript)**

   - Single Page Application with React Router
   - Material-UI for consistent design system
   - TanStack Query for state management and caching
   - Axios for HTTP client communication

2. **Backend (Node.js + Express)**

   - RESTful API with Express.js
   - Prisma ORM for database operations
   - Google Generative AI integration
   - Comprehensive error handling and validation

3. **Database (PostgreSQL)**
   - Relational database with referential integrity
   - Prisma migrations for schema management

## Tech Stack & Dependencies

### Frontend Dependencies

| Library               | Version | Purpose             | Justification                                                                                   |
| --------------------- | ------- | ------------------- | ----------------------------------------------------------------------------------------------- |
| **React**             | ^18.2.0 | UI Framework        | Industry standard for building modern web applications with component-based architecture        |
| **TypeScript**        | ^5.3.3  | Type Safety         | Provides compile-time type checking, reducing runtime errors and improving developer experience |
| **Material-UI (MUI)** | ^5.15.0 | UI Components       | Google's Material Design implementation with accessible, customizable components                |
| **React Router**      | ^6.20.1 | Client-side Routing | Standard routing solution for React SPAs with modern hooks API                                  |
| **TanStack Query**    | ^5.14.2 | State Management    | Advanced data fetching with caching, background updates, and optimistic updates                 |
| **Axios**             | ^1.6.2  | HTTP Client         | Promise-based HTTP client with request/response interceptors and better error handling          |
| **Vite**              | ^5.0.8  | Build Tool          | Fast development server and optimized production builds with hot module replacement             |
| **Tailwind CSS**      | ^3.3.6  | Utility CSS         | Utility-first CSS framework for rapid UI development and consistent styling                     |

### Backend Dependencies

| Library                  | Version   | Purpose               | Justification                                                                              |
| ------------------------ | --------- | --------------------- | ------------------------------------------------------------------------------------------ |
| **Express.js**           | ^4.18.2   | Web Framework         | Minimal and flexible Node.js framework with robust middleware ecosystem                    |
| **Prisma**               | ^5.7.0    | Database ORM          | Type-safe database client with migrations, introspection, and excellent TypeScript support |
| **PostgreSQL**           | 16-alpine | Database              | Reliable ACID-compliant relational database with excellent performance and JSON support    |
| **Google Generative AI** | ^0.1.3    | AI Integration        | Advanced language model for intelligent task assignment and description generation         |
| **dotenv**               | ^16.3.1   | Environment Variables | Secure configuration management for different environments                                 |
| **Jest**                 | ^29.7.0   | Testing Framework     | Comprehensive testing with mocking, coverage reports, and snapshot testing                 |
| **TSX**                  | ^4.6.2    | TypeScript Execution  | Direct TypeScript execution for development and scripts                                    |

## Installation & Setup

### Using Docker (Recommended)

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Task_List
   ```

2. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

3. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5001
- Database: localhost:5432

### Local Development Setup

1. **Clone and install dependencies**

   ```bash
   git clone <repository-url>
   cd Task_List

   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

2. **Set up the database**

   ```bash
   # Start PostgreSQL (using Docker)
   docker run --name postgres -e POSTGRES_PASSWORD=postgres -d -p 5432:5432 postgres:16-alpine

   # Run migrations
   cd backend
   npx prisma migrate deploy
   npx prisma db seed
   ```

3. **Start development servers**

   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/taskdb?schema=public

# API Configuration
PORT=5001
VITE_API_URL=http://localhost:5001/api

# Google Generative AI
GEMINI_API_KEY=your_google_ai_api_key_here

# Development
NODE_ENV=development
```

### Docker Environment

For Docker deployments, the `docker-compose.yml` handles most configuration automatically. Only the `GEMINI_API_KEY` needs to be set as an environment variable:

```bash
export GEMINI_API_KEY=your_api_key_here
docker-compose up -d
```

## Running the Application

### Development Mode

```bash
# Build & Start all services
docker-compose up --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## API Documentation

### Base URL

- Development: `http://localhost:5001/api`

### Authentication

Currently, the API doesn't require authentication. This can be added in future versions.

### Endpoints

#### Tasks API (`/api/tasks`)

| Method | Endpoint                    | Description              | Request Body                                                   |
| ------ | --------------------------- | ------------------------ | -------------------------------------------------------------- |
| GET    | `/`                         | Get all tasks            | -                                                              |
| GET    | `/:id`                      | Get task by ID           | -                                                              |
| POST   | `/create`                   | Create new task          | `{ title: string, skillIds?: string[], developerId?: string }` |
| PUT    | `/update/:id`               | Update task              | `{ title?: string, status?: string, developerId?: string }`    |
| PUT    | `/update-with-subtasks/:id` | Update task and subtasks | `{ title?: string, subtasks?: Task[] }`                        |
| DELETE | `/delete/:id`               | Delete task              | -                                                              |

#### Developers API (`/api/developers`)

| Method | Endpoint | Description          | Request Body                                             |
| ------ | -------- | -------------------- | -------------------------------------------------------- |
| GET    | `/`      | Get all developers   | -                                                        |
| GET    | `/:id`   | Get developer by ID  | -                                                        |
| POST   | `/`      | Create new developer | `{ name: string, email: string, skillIds?: string[] }`   |
| PUT    | `/:id`   | Update developer     | `{ name?: string, email?: string, skillIds?: string[] }` |

#### Skills API (`/api/skills`)

| Method | Endpoint | Description      | Request Body       |
| ------ | -------- | ---------------- | ------------------ |
| GET    | `/`      | Get all skills   | -                  |
| GET    | `/:id`   | Get skill by ID  | -                  |
| POST   | `/`      | Create new skill | `{ name: string }` |
| PUT    | `/:id`   | Update skill     | `{ name: string }` |

## Testing

### Running Tests

```bash
# Backend tests
cd backend
npm test                 # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report

# Frontend tests (if configured)
cd frontend
npm test
```

### Test Coverage

The backend includes comprehensive tests for:

- ✅ Controller functions
- ✅ API endpoints
- ✅ Database operations
- ✅ Error handling

Current coverage target: >80%
