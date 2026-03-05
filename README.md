# Newlin Developer Tools Template

A complete Next.js template for building developer tool SaaS products. Production-ready with authentication, dashboard, admin panel, and project management.

## Features

- **Next.js 14** with App Router and TypeScript
- **Authentication** with JWT (jose) and bcrypt password hashing
- **Database** SQLite with better-sqlite3 (easily swappable to PostgreSQL)
- **Styling** Tailwind CSS with custom design system
- **Components** Reusable UI components and dashboard layouts
- **API Routes** RESTful APIs with rate limiting and validation
- **Admin Panel** User management and analytics
- **Docker Support** Production-ready containerization
- **Security** CORS, rate limiting, input validation

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` and set your environment variables:

```env
JWT_SECRET=your_jwt_secret_here_change_in_production
DATABASE_URL=./data/template.db
APP_NAME=MyTool
APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=MyTool
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Initialize Database

```bash
npm run migrate
npm run seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Default Accounts

After seeding, you can login with:

- **Admin:** admin@example.com / admin123
- **Demo User:** demo@example.com / demo123

## Project Structure

```
/src
  /app
    /api
      /auth          # Authentication endpoints
      /projects      # Project CRUD operations
      /health        # Health check
    /dashboard       # Protected dashboard pages
      /projects      # Project management
      /settings      # Account settings
    /admin           # Admin panel
    /login           # Login page
    /register        # Registration page
    layout.tsx       # Root layout
    page.tsx         # Landing page
    globals.css      # Global styles
  /components
    /ui              # Base UI components
    Navbar.tsx       # Navigation bar
    Sidebar.tsx      # Dashboard sidebar
    ProjectCard.tsx  # Project display card
    StatsCard.tsx    # Statistics card
    DataTable.tsx    # Data table component
  /lib
    auth.ts          # Authentication logic
    db.ts            # Database connection
    middleware.ts    # API middleware
    utils.ts         # Utility functions
    email.ts         # Email utilities
  /scripts
    migrate.ts       # Database migrations
    seed.ts          # Seed demo data
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed demo data
- `npm run lint` - Lint code

## Docker Deployment

### Build and Run

```bash
docker build -t newlin-template .
docker run -p 3000:3000 newlin-template
```

### Docker Compose

```bash
docker-compose up -d
```

## Production Deployment

### Environment Variables

Make sure to set these in production:

- `JWT_SECRET` - Strong random secret for JWT signing
- `DATABASE_URL` - Database connection string
- `APP_NAME` - Your application name
- `APP_URL` - Your application URL
- `SMTP_*` - Email service configuration (optional)

### Database Migration

The database will auto-initialize on first run. For production, you may want to run migrations manually:

```bash
npm run migrate
```

### SSL/HTTPS

The application is designed to work behind a reverse proxy (nginx, Traefik, etc.) that handles SSL termination.

## Customization

### Branding

1. Update `APP_NAME` in environment variables
2. Replace colors in `tailwind.config.ts`
3. Update the landing page content in `src/app/page.tsx`
4. Add your logo and favicon files

### Database

To switch to PostgreSQL:

1. Install `pg` and `@types/pg`
2. Update `src/lib/db.ts` with PostgreSQL connection
3. Adapt SQL queries for PostgreSQL syntax

### Email Service

Update `src/lib/email.ts` with your preferred email service:

- Nodemailer (SMTP)
- Resend
- SendGrid
- Amazon SES

### Payment Integration

Add payment processing by:

1. Installing Stripe/Mollie SDK
2. Creating billing API routes
3. Adding subscription management
4. Updating plan limits logic

## API Reference

### Authentication

- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

### Projects

- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/[id]` - Get project
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Health Check

- `GET /api/health` - Application health status

## Security Features

- JWT authentication with httpOnly cookies
- Password hashing with bcrypt
- Rate limiting on sensitive endpoints
- Input validation and sanitization
- CORS configuration
- SQL injection prevention

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please create an issue in this repository.

---

Built with ❤️ by the Newlin team