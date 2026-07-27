# CampusQ&A

A community Q&A and events platform built for a college campus, students ask and answer questions, run polls, and admins post official event announcements. Includes two AI-assisted features and role-based moderation.

## Features

- Ask/answer questions with tags, upvotes, and comments
- Polls with optional anonymity and expiry
- Event announcements (poster upload, date, venue, coordinators) - admin-only
- Three roles: Student, Student Admin, Super Admin, with server-side permission checks
- Admin dashboard: user management, bans, audit log of every moderation action
- Public profile pages with reputation tiers
- AI Question Improver - rewrites a vague question, shows before/after
- AI Answer Summarizer - TL;DR once a question crosses 10 answers, cached until enough new answers arrive
- Email verification, password reset, JWT auth with refresh tokens
- Rate limiting on auth, AI, and general API traffic

## Stack

- **Frontend:** React (Vite), Tailwind CSS, React Router
- **Backend:** Node.js, Express, Prisma
- **Database:** PostgreSQL (Neon)
- **Auth:** JWT and bcrypt
- **Media:** Cloudinary
- **AI:** LLM APIs
- **Hosting:** Vercel (frontend), Render (backend)

## Local Setup

### Backend

```bash
cd server
cp .env.example .env   
npm install
npx prisma migrate dev
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

Runs on `localhost:5173`, proxies API calls to `localhost:5000`.

## Environment Variables

See `server/.env.example` for the full list. At minimum you'll need:

- `DATABASE_URL` - Postgres connection string
- `JWT_SECRET`
- `GROQ_API_KEY` or `GEMINI_API_KEY`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- SMTP credentials for email verification / password reset

## Secret Scanning

A pre-commit hook scans staged changes for API keys, private keys, Cloudinary URLs, and PostgreSQL connection strings before they can be committed. Enable it once after cloning:

```powershell
git config core.hooksPath .githooks
```

Run the same check manually at any time:

```powershell
cd server
npm run secrets:check
```

This is a safety net, not a replacement for keeping `server/.env` untracked. If a real credential is ever committed, revoke or rotate it immediately.

## Roles

New signups default to Student. The first Super Admin is created directly in the database; every other admin is promoted by an existing Super Admin from the admin dashboard.

## Deployment

- Frontend deployed on Vercel (`VITE_API_URL` pointing at the backend)
- Backend deployed on Render (`npx prisma migrate deploy` runs on build)
- Database on Neon, pooled connection string
- `CLIENT_ORIGIN` on the backend must match the deployed frontend URL for CORS

## Security Notes

- Passwords hashed with bcrypt; JWT access tokens are short-lived with refresh token rotation
- Ownership checks enforced server-side on every question/answer/poll/vote mutation
- Per-user and per-IP rate limiting on auth, AI, and content-creation endpoints
- Admin actions (deletions, bans, role changes) are logged to an audit trail


---

Built by **Praveena K R**