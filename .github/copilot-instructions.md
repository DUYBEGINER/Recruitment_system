# Copilot Instructions for Recruitment System

This document provides essential guidance for AI agents working with this recruitment system codebase.

## Project Architecture

### Frontend (React + Vite)
- Single page application using React 19 with Vite
- Located in `/src` directory
- Key components:
  - `src/components/` - Reusable UI components
  - `src/page/` - Page-level components with routing
  - `src/context/` - Global state management using React Context
  - `src/api/` - API client functions using Axios
  - `src/layout/` - Layout components (AdminLayout, MainLayout)

### Backend (Express.js)
- REST API server in `/backend` directory
- Key components:
  - `backend/routes/` - API route definitions
  - `backend/controller/` - Business logic handlers
  - `backend/middleware/` - Request processing middleware
  - `backend/repositories/` - Data access layer
  - `backend/CV_Storage/` - File storage for uploaded CVs

## Development Workflow

### Running the Project
```bash
# Install dependencies
npm install

# Start development servers (both frontend and backend)
npm run dev
```
- Frontend runs on http://localhost:5173
- Backend runs on http://localhost:5000

### Key Patterns

1. **API Integration**
   - All API calls use Axios through wrapper functions in `src/api/`
   - Example: see `src/api/jobAPI.js` for pattern

2. **Authentication**
   - JWT-based auth implemented in `backend/middleware/verifyToken.js`
   - Protected routes use `src/components/ProtectedRoute/PrivateRoute.jsx`
   - Auth context provides user state (`src/context/AuthContext.jsx`)

3. **File Uploads**
   - CV uploads handled by Multer middleware in `backend/middleware/uploadcv.js`
   - Files stored in `backend/CV_Storage/`
   - Served statically at `/uploads` endpoint

4. **Error Handling**
   - Backend uses centralized error middleware in `server.js`
   - Frontend API calls wrapped in try-catch with user feedback
   - Example pattern in `src/components/JobDetail/JobDetail.jsx`

## Environment Configuration
- Frontend: Uses Vite env variables (define in `.env`)
- Backend: Uses dotenv (define in `backend/.env`)
- Required env variables:
  - `PORT` - Backend port
  - `JWT_SECRET` - JWT signing key
  - Database connection details (see `backend/config/db.js`)

## Project-Specific Conventions
1. File Structure:
   - Feature-first organization within `src/components/`
   - Each component has its own directory with CSS
   - Vietnamese language used in user-facing strings

2. Naming:
   - PascalCase for components and their directories
   - camelCase for other files and functions
   - Files exporting components use `.jsx` extension

3. API Response Format:
   ```javascript
   {
     success: boolean,
     message: string,
     data: any
   }
   ```