# Newlin Developer Tools Template

## Purpose
Reusable Next.js template for building developer tool SaaS products. 
Base for CronPing, ChangelogFeed, Fluister, and future tools.

## Existing Projects (reference implementations)
- **CronPing:** /root/projects/cronping (SQLite, jsonwebtoken)
- **ChangelogFeed:** /root/projects/changelogfeed (SQLite, jsonwebtoken + jose)
- **Fluister:** /root/clawd/projects/fluister/app (PostgreSQL, jose, next-intl)

## Template Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Auth:** jose (edge-compatible JWT) + bcryptjs
- **Database:** SQLite (better-sqlite3) as default, with abstraction layer for swapping to PostgreSQL
- **Cookie:** httpOnly JWT session cookie

## Template Must Include

### Auth System (`/src/lib/auth.ts`)
- JWT sign/verify with jose (edge-compatible, unlike jsonwebtoken)
- Cookie-based session management
- Password hashing with bcryptjs
- `getCurrentUser()` helper
- Role support: user, admin, super_admin

### Auth Routes (`/src/app/api/auth/`)
- POST `/api/auth/register` — create account
- POST `/api/auth/login` — login, set cookie
- POST `/api/auth/logout` — clear cookie  
- GET `/api/auth/me` — get current user
- POST `/api/auth/change-password` — change password
- POST `/api/auth/forgot-password` — send reset email (stub)
- POST `/api/auth/reset-password` — reset with token

### Database (`/src/lib/db.ts`)
- SQLite with better-sqlite3 as default
- WAL mode, foreign keys ON
- Migration system (auto-create tables on first run)
- Generic query helpers

### Database Schema (default tables)
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  plan TEXT NOT NULL DEFAULT 'free',
  api_key TEXT UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  domain TEXT,
  api_key TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Pages
- `/` — Landing page (marketing, features, pricing teaser, CTA)
- `/login` — Login form
- `/register` — Register form
- `/dashboard` — Main dashboard (list projects, stats overview)
- `/dashboard/projects/[id]` — Project detail
- `/dashboard/settings` — Account settings, change password, API key
- `/admin` — Admin panel (user list, stats) — admin role only

### UI Components (`/src/components/`)
- `Navbar` — responsive nav with auth state
- `Sidebar` — dashboard sidebar navigation
- `ProjectCard` — reusable project card
- `StatsCard` — stat display card
- `DataTable` — simple data table
- `Modal` — dialog/modal
- `Toast` — notification toast
- `Button`, `Input`, `Select` — form primitives

### API Patterns
- All API routes under `/api/`
- Auth middleware pattern (reusable `requireAuth()` wrapper)
- CORS headers for public API endpoints
- Rate limiting helper (in-memory, upgradeable to Redis)
- API key validation helper for external API access

### Config & Environment
```env
JWT_SECRET=<generated>
DATABASE_URL=./data/template.db
APP_NAME=MyTool
APP_URL=http://localhost:3000
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

### Developer Experience
- `npm run dev` — start development
- `npm run build` — production build
- `npm run seed` — seed demo data
- `npm run migrate` — run migrations
- Docker support (Dockerfile + docker-compose.yml)
- `.env.example` with all variables documented
- `README.md` with setup instructions

### Deployment
- Dockerfile (multi-stage, standalone output)
- docker-compose.yml (app + optional db)
- pm2 ecosystem config as alternative
- Health check endpoint: GET `/api/health`

## What to EXCLUDE (tool-specific)
- No i18n (add per tool if needed)
- No specific business logic
- No tool-specific API routes
- No Mollie/Stripe (add per tool)
- No WYSIWYG editors
- No external widget scripts

## Style Guide
- Clean, modern UI (inspired by Fluister's landing page)
- Purple/blue gradient accent (#667eea → #764ba2)
- System font stack
- Responsive (mobile-first)
- Dark mode support via Tailwind

## File Structure
```
/src
  /app
    /api
      /auth (login, register, logout, me, change-password)
      /health
      /projects (CRUD)
    /dashboard
      /projects/[id]
      /settings
      page.tsx (overview)
    /admin
    /login
    /register
    layout.tsx
    page.tsx (landing)
    globals.css
  /components
    Navbar.tsx
    Sidebar.tsx
    ProjectCard.tsx
    StatsCard.tsx
    DataTable.tsx
    Modal.tsx
    Toast.tsx
    ui/ (Button, Input, Select)
  /lib
    auth.ts
    db.ts
    middleware.ts (requireAuth, requireAdmin)
    utils.ts
    email.ts (stub)
/public
/data (SQLite db files, gitignored)
docker-compose.yml
Dockerfile
.env.example
tailwind.config.ts
tsconfig.json
package.json
README.md
```
