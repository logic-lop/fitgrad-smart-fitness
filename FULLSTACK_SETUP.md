# FitGrad Smart Fitness - Full Stack Implementation

## Project Structure

```
fitgrad-smart-fitness/
├── packages/
│   ├── web/           # React frontend (port 8080)
│   └── api/           # Express backend (port 3000)
├── docker-compose.yml # PostgreSQL setup (optional)
└── package.json       # Root configuration
```

## Quick Start

### Prerequisites
- Node.js 18+
- npm 8+

### Installation & Running

```bash
# Install all dependencies
npm install

# Start both frontend and backend with one command
npm run dev
```

This will start:
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000
- **Database**: SQLite (dev.db in packages/api/)

### Individual Development Commands

```bash
# Frontend only
npm run dev:web

# Backend only  
npm run dev:api

# Build
npm run build

# Lint frontend
npm run lint

# Test frontend
npm run test
npm run test:watch
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### User Profile
- `GET /api/user/profile` - Get user profile (requires auth)
- `PUT /api/user/profile` - Update user profile (requires auth)

### Diet Entries
- `POST /api/diet` - Add diet entry (requires auth)
- `GET /api/diet` - Get all diet entries (requires auth)
- `DELETE /api/diet/:id` - Delete diet entry (requires auth)

### Workout Entries
- `POST /api/workout` - Add workout entry (requires auth)
- `GET /api/workout` - Get all workout entries (requires auth)
- `DELETE /api/workout/:id` - Delete workout entry (requires auth)

## Authentication

The app uses JWT (JSON Web Tokens) for authentication:
1. User registers/logs in via `/api/auth/register` or `/api/auth/login`
2. Server returns a JWT token
3. Token is stored in `localStorage` as `authToken`
4. Frontend includes token in `Authorization: Bearer <token>` header for protected routes
5. Backend validates token for all protected endpoints

## Database Schema

Using SQLite with Prisma ORM:

- **User** - User profiles with fitness goals
- **DietEntry** - Food entries with calories
- **WorkoutEntry** - Exercise entries with duration and calories burned

## Environment Variables

### Frontend (`packages/web/.env.local`)
```
VITE_API_URL=http://localhost:3000
```

### Backend (`packages/api/.env.local`)
```
DATABASE_URL="file:./dev.db"
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
PORT=3000
```

## Development Notes

- Frontend uses React with TypeScript, Vite, and Tailwind CSS
- Backend uses Express.js with TypeScript and Prisma ORM
- All communication happens through REST API
- Database migrations are managed with Prisma
- Hot reloading enabled for both frontend and backend

## Troubleshooting

### Port Already in Use
If port 8080 (frontend) or 3000 (backend) is already in use, update the env files:
- Frontend: Change `VITE_API_URL` in `.env.local`
- Backend: Change `PORT` in `.env.local`

### Database Issues
If you see database errors, regenerate Prisma client:
```bash
cd packages/api
npx prisma db push
npx prisma generate
```

### Frontend Can't Connect to Backend
Make sure:
1. Backend is running on http://localhost:3000
2. `VITE_API_URL` in frontend is set correctly
3. Check browser console for CORS errors

## Next Steps

To make this production-ready:
1. Use PostgreSQL/MongoDB instead of SQLite
2. Add password reset functionality
3. Implement food database integration
4. Add unit and integration tests
5. Set up CI/CD pipeline
6. Deploy to production hosting
