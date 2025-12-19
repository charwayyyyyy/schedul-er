# Schedul-er

Schedul-er is a modern class scheduling system for schools. It provides role-based access for admins, teachers, and students, supports Google sign-in, and persists data to Supabase Postgres through Prisma.

## Features
- Authentication
  - Credentials login and registration
  - Optional Google Sign-In via NextAuth
  - Role-based access (Admin, Teacher, Student) with protected routes
- Class Management
  - Create, edit, delete classes
  - Assign teachers and enroll students
  - Start/end times and day-of-week scheduling
- Profiles
  - Customize name, image, school, class, and bio
- Dashboard
  - Classes overview and quick actions for teachers/students

## Tech Stack
- Frontend: Next.js App Router, React, TailwindCSS
- Auth: NextAuth.js (Credentials + Google)
- Database: Supabase Postgres via Prisma ORM
- Runtime: Node.js 18+

## Demo Credentials
Use these to sign in without a real database:
- Email: `demo@scheduler.local`
- Password: `demo123`
- Role: `ADMIN`

Demo login is enabled when `DEMO_LOGIN=true`. In development this is typically enabled; disable it in production.

## Environment Variables
Create a `.env` file in the project root and configure:

```
# Required for NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-a-random-string

# Demo login
DEMO_LOGIN=true
DEMO_EMAIL=demo@scheduler.local
DEMO_PASSWORD=demo123
DEMO_ROLE=ADMIN

# Google OAuth (optional; enables Google button)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_GOOGLE_AUTH=false

# Database (choose one approach)
# 1) Direct DATABASE_URL (preferred)
DATABASE_URL=postgresql://postgres:<PASSWORD>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require&pgbouncer=true&connection_limit=1

# 2) Or use SUPABASE_* to auto-build the URL
SUPABASE_PASSWORD=
SUPABASE_PROJECT_REF=<project-ref>
# Or set SUPABASE_HOST directly (overrides PROJECT_REF)
SUPABASE_HOST=db.<project-ref>.supabase.co
```

## Getting Started
1. Install dependencies
   ```
   npm install
   ```
2. Generate Prisma client
   ```
   npx prisma generate
   ```
3. Run migrations (Supabase Postgres)
   ```
   npx prisma migrate dev --name supabase_init
   ```
4. Start development server
   ```
   npm run dev
   ```
5. Open `http://localhost:3000`

## Google Sign-In
- Create an OAuth Client ID in Google Cloud Console (type: Web Application).
- Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
- Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`.
- Set `NEXT_PUBLIC_GOOGLE_AUTH=true` to show the Google button in the UI.

## Prisma Models
Key models used by the app (see `prisma/schema.prisma`):
- `User`: name, email, password (for credentials), role, school, profileClass, bio
- `Account` and `Session`: NextAuth adapter tables
- `Class`: name, description, startTime, endTime, dayOfWeek, teacher relationship, students
- `Role`: `ADMIN`, `TEACHER`, `STUDENT`

## Project Structure
```
src/
├── app/
│   ├── api/                    # API routes (auth, classes, profile)
│   ├── dashboard/              # Authenticated pages
│   ├── login/                  # Sign-in page
│   └── signup/                 # Registration page
├── lib/                        # Prisma and NextAuth configuration
└── prisma/                     # Schema and migrations
```

## Troubleshooting
- Prisma P1001 (cannot reach database):
  - Verify host format: `db.<project-ref>.supabase.co`
  - Ensure `sslmode=require` in the connection string
  - Confirm password and project ref in Supabase settings
- `@prisma/client did not initialize yet`:
  - Run `npx prisma generate` and restart the dev server
- Google button not visible:
  - Set `NEXT_PUBLIC_GOOGLE_AUTH=true` and provide client ID/secret

## Contributing
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-change`
3. Commit: `git commit -m "Your change"`
4. Push: `git push origin feature/your-change`
5. Open a Pull Request

## License
Open source; you may use and modify with attribution.
