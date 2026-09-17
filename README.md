# Qylo

An AI-based interactive quantum algorithm learning platform (SIH26140, for Egreen Quanta).

The build is happening in five phases — **Learn → Build → Test → Track** — and this repo
is currently at the end of **Phase 1: Foundation**: auth, roles, the full database schema,
and an empty, deployed shell for every page later phases will fill in.

## Repo layout

```
/frontend   Next.js 16 (App Router, TypeScript, Tailwind) — the web app
/backend    FastAPI (Python) — the API, home to the quantum SDKs from Phase 3 onward
/supabase   SQL migrations for the Postgres schema (Auth + Database both live in Supabase)
```

## Prerequisites

- Node.js 20+ and npm
- Python 3.11+
- A free [Supabase](https://supabase.com) project

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com/dashboard).
2. In the SQL Editor, run [`supabase/migrations/0002_fix_users_and_complete_schema.sql`](supabase/migrations/0002_fix_users_and_complete_schema.sql)
   (it supersedes `0001` — see the note at the top of that file for why).
   This creates every table (`users`, `classes`, `class_members`, `lessons`, `circuits`,
   `challenges`, `submissions`, `progress`), row-level security policies, and the trigger
   that turns a signup into a `public.users` profile row with the chosen role. It's
   idempotent, so re-running it is harmless.
3. In **Project Settings → API**, copy the **Project URL** and **anon public key** — you'll
   need them for the frontend `.env.local` below.
4. **Email confirmation**: by default Supabase requires users to confirm their email before
   a session is issued. For local/demo testing you can turn this off under
   **Authentication → Providers → Email → Confirm email**, or just click the confirmation
   link Supabase emails on signup.

## 2. Run the frontend

```bash
cd frontend
cp .env.local.example .env.local   # fill in the Supabase URL + anon key
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## 3. Run the backend

```bash
cd backend
python -m venv .venv
./.venv/Scripts/activate   # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Visit [http://localhost:8000/health](http://localhost:8000/health) — should return `{"status": "ok"}`.
The frontend doesn't call the backend yet; that starts in Phase 3 (circuit execution) and
Phase 4 (the AI tutor).

## Roles

There are exactly two roles, chosen at signup: **learner** and **instructor**. A logged-out
visitor can't reach any dashboard route; a learner lands on `/dashboard`, an instructor on
`/instructor-dashboard` (each redirects away from the other's page).

## Routes

| Route | Status |
|---|---|
| `/` | Live — landing page |
| `/login`, `/signup` | Live — Supabase email/password auth |
| `/learn` | Placeholder — Phase 2 |
| `/circuit-builder` | Placeholder — Phase 3 |
| `/challenges` | Placeholder — Phase 5 |
| `/dashboard` | Placeholder — Phase 5 (learner) |
| `/instructor-dashboard` | Placeholder — Phase 5 (instructor) |

## Deployment

- **Frontend → Vercel**: import this repo, set the project root to `frontend/`, and add the
  same env vars from `frontend/.env.local.example`.
- **Backend → Railway or Render**: point it at this repo with the service root set to
  `backend/` (a `Dockerfile` is included), and set `FRONTEND_URL` to the deployed Vercel URL.
