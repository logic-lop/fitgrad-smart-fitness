# 🚀 Quick Reference - FitGrad Full Stack

## Start Everything in One Command
```bash
npm run dev
```

That's it! You now have:
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000
- **Database**: SQLite (packages/api/dev.db)

## Folder Structure
```
fitgrad-smart-fitness/
├── packages/web/     ← React frontend
├── packages/api/     ← Express backend + database
└── package.json      ← Root scripts
```

## Individual Commands
```bash
npm run dev:web       # Frontend only (port 8080)
npm run dev:api       # Backend only (port 3000)
npm run build         # Build both
npm run lint          # Lint frontend
npm run test          # Run tests
```

## What's New

### Backend (packages/api/)
- Express server on port 3000
- JWT authentication system
- SQLite database with Prisma ORM
- Full REST API with endpoints for:
  - Auth: register, login
  - Users: get/update profile
  - Diet: add, list, delete entries
  - Workouts: add, list, delete entries

### Frontend Changes (packages/web/)
- New API client (`src/lib/api.ts`)
- Updated AuthContext to use backend
- Updated FitnessContext to use API
- All data now stored in database

### Database (packages/api/dev.db)
- SQLite database (auto-created)
- Tables: users, diet_entries, workout_entries
- Managed by Prisma ORM

## API Endpoints

### Auth
```
POST   /api/auth/register  - Register user
POST   /api/auth/login     - Login user
```

### Users (requires token)
```
GET    /api/user/profile   - Get user profile
PUT    /api/user/profile   - Update user profile
```

### Diet (requires token)
```
POST   /api/diet           - Add food entry
GET    /api/diet           - Get all entries
DELETE /api/diet/:id       - Delete entry
```

### Workouts (requires token)
```
POST   /api/workout        - Add workout entry
GET    /api/workout        - Get all entries
DELETE /api/workout/:id    - Delete entry
```

## Test It

1. Run: `npm run dev`
2. Open: http://localhost:8080
3. Register → Login → Add entries
4. Data persists in SQLite database

## Environment Variables

**Frontend** (`packages/web/.env.local`):
```
VITE_API_URL=http://localhost:3000
```

**Backend** (`packages/api/.env.local`):
```
DATABASE_URL="file:./dev.db"
JWT_SECRET=your-secret-key
NODE_ENV=development
PORT=3000
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 8080 in use | Change frontend port in Vite config |
| Port 3000 in use | Change PORT in packages/api/.env.local |
| Database error | Run `cd packages/api && npx prisma db push` |
| Frontend can't connect | Check VITE_API_URL and ensure backend is running |
| Module not found | Run `npm install` in root directory |

## Full Stack Architecture

```
User Browser
     ↓
[React Frontend] :8080
     ↓ (HTTP API calls + JWT token)
[Express Backend] :3000
     ↓ (Prisma ORM queries)
[SQLite Database] dev.db
```

## Files Changed/Created

✅ **Created**:
- `packages/api/` - Entire backend
- `packages/api/src/index.ts` - Express server
- `packages/api/prisma/schema.prisma` - Database schema
- `packages/web/src/lib/api.ts` - API client
- `FULLSTACK_SETUP.md` - Setup guide
- `IMPLEMENTATION_COMPLETE.md` - Full docs

✅ **Updated**:
- `packages/web/src/contexts/AuthContext.tsx` - Now uses API
- `packages/web/src/contexts/FitnessContext.tsx` - Now uses API
- `packages/web/.env.local` - API URL config
- Root `package.json` - Monorepo + concurrently

## Next: Production Deployment

When ready:
1. Switch database to PostgreSQL
2. Set strong JWT_SECRET
3. Add HTTPS/TLS
4. Deploy to cloud (AWS, Heroku, etc.)
5. Update frontend VITE_API_URL to production domain

## Questions?

Check `IMPLEMENTATION_COMPLETE.md` for detailed documentation.
