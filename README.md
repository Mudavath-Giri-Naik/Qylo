<div align="center">

<img src="docs/assets/banner.svg" alt="Qylo — Learn. Build. Master. An AI-powered quantum computing learning platform." width="100%" />

<br/>

![SIH](https://img.shields.io/badge/Smart_India_Hackathon-SIH26140-f97316?style=for-the-badge&labelColor=0d1117)

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python_3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Qiskit](https://img.shields.io/badge/Qiskit-6929C4?style=for-the-badge&logo=qiskit&logoColor=white)
![Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)
![LangGraph](https://img.shields.io/badge/LangGraph-1C3C3C?style=for-the-badge&logoColor=white)
![Qdrant](https://img.shields.io/badge/Qdrant-DC244C?style=for-the-badge&logo=qdrant&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

</div>

## Description

**Qylo** is an AI-powered, multilingual quantum computing learning platform: structured lessons, a real
Qiskit-backed drag-and-drop circuit simulator, a LangGraph-orchestrated AI tutor grounded on the actual
course content, and gamified challenges — all in one connected loop, built for **Smart India Hackathon
(SIH26140)**.

## Problem

Learning quantum computing today means stitching together tools that were never built to teach:

- **Theory and practice live in different places.** Lecture notes/PDFs on one side, a bare-bones circuit
  simulator (built for researchers, not learners) on the other — with nothing connecting the two.
- **No feedback loop.** A student who builds a circuit that doesn't work has no one to ask *why* it's
  wrong, at the moment they're actually stuck.
- **One-size-fits-all pacing.** No sense of what a learner already knows, what they're struggling with,
  or what to study next.
- **English-only.** Most resources shut out students who think in Hindi, Telugu, or any language besides
  English — a real barrier at India's scale.
- **No hands-on grading.** Quizzes test recall, not whether a student can actually build a working circuit.

## Solution

Qylo answers each of those gaps directly:

- 📚 **Structured, multilingual modules** — Fundamentals → Circuit Design → Standard Algorithms →
  Variational/NISQ Algorithms, written in English, Hindi, and Telugu.
- ⚛️ **A real quantum simulator, not a toy** — drag-and-drop gates onto a composer that runs on actual
  **Qiskit + Qiskit Aer**, returning real measurement counts, statevectors, and Bloch-sphere data.
- 🤖 **An AI tutor that routes intelligently, not a generic chatbot** — a **LangGraph** agent that decides,
  per question, whether to answer from the lesson content (RAG over a **Qdrant** vector index), review the
  student's *actual* circuit, generate Qiskit code grounded in the lesson, or recommend the next lesson
  based on real progress — always in the learner's preferred language.
- 🏆 **Challenges with real grading** — quiz and live-circuit-execution challenges, graded automatically,
  with AI-written feedback explaining *why* a failed submission didn't pass.
- 📈 **Progress that's actually tracked** — streaks, qubits executed, achievements, a leaderboard, and a
  separate instructor view for managing classes and watching cohort-wide progress.

## Architecture

Three tiers: a Next.js frontend that talks to Supabase directly for data/auth, a FastAPI backend that owns
everything quantum and AI, and the AI/vector services that power the tutor.

```mermaid
flowchart TB
    subgraph Client["🖥️ Client — Browser"]
        UI["Next.js 16 App Router UI<br/>React 19 · TypeScript · Tailwind v4"]
    end

    subgraph Frontend["▲ Frontend — Vercel"]
        direction TB
        Pages["Pages & Server Components<br/>Dashboard · Learn · Circuit Builder · Challenges · Profile"]
        MW["Proxy / Middleware<br/>session refresh + route guards"]
        SupaSSR["@supabase/ssr client<br/>direct Postgres reads (RLS)"]
    end

    subgraph Auth["🔐 Supabase Auth"]
        AuthProviders["Email/Password + Google OAuth"]
        Trigger["on_auth_user_created trigger<br/>→ public.users row (role, language)"]
    end

    subgraph DB["🗄️ Supabase Postgres (RLS)"]
        Tables["users · classes · lessons · circuits<br/>challenges · submissions · progress"]
    end

    subgraph Backend["🐍 FastAPI Backend — Railway / Render (Docker)"]
        direction TB
        RCircuits["POST /circuits/run"]
        RChallenges["POST /challenges/:id/submit"]
        RAgent["POST /api/agent/ask"]
    end

    subgraph Quantum["⚛️ Quantum Engine"]
        Qiskit["Qiskit + Qiskit Aer<br/>statevector · counts · Bloch vector"]
    end

    subgraph AgentPipeline["🤖 AI Tutor — LangGraph"]
        direction TB
        Router{{"router_node<br/>classify intent"}}
        RAG["rag_node<br/>lesson Q&A"]
        Circ["circuit_node<br/>review student circuit"]
        RagCirc["rag_circuit_node<br/>grounded code-gen"]
        Progress["progress_node<br/>next-lesson recommendation"]
    end

    subgraph AIServices["✨ AI & Vector Services"]
        Gemini["Google Gemini<br/>gemini-embedding-001 + gemini-3.6-flash"]
        Qdrant["Qdrant Cloud<br/>qylo_lessons vectors (768-dim, cosine)"]
    end

    UI --> Pages
    Pages --> MW --> AuthProviders
    AuthProviders --> Trigger --> Tables
    Pages --> SupaSSR --> Tables
    UI -- fetch NEXT_PUBLIC_API_URL --> RCircuits & RChallenges & RAgent

    RCircuits --> Qiskit
    RChallenges --> Qiskit
    RChallenges -- on fail --> RAgent
    RChallenges -- REST, service role --> Tables

    RAgent --> Router
    Router -->|no circuit| RAG
    Router -->|circuit + question| Circ
    Router -->|circuit + write code| RagCirc
    Router -->|next-lesson ask| Progress

    RAG --> Gemini
    RAG --> Qdrant
    RagCirc --> Gemini
    RagCirc --> Qdrant
    Circ --> Gemini
    Progress --> Gemini
    Progress -- REST, service role --> Tables

    classDef client fill:#1d4ed8,color:#fff,stroke:#1e3a8a,stroke-width:1px;
    classDef frontend fill:#0ea5e9,color:#04121f,stroke:#0369a1,stroke-width:1px;
    classDef auth fill:#f97316,color:#2a1200,stroke:#c2410c,stroke-width:1px;
    classDef db fill:#22c55e,color:#04240f,stroke:#15803d,stroke-width:1px;
    classDef backend fill:#a855f7,color:#fff,stroke:#7e22ce,stroke-width:1px;
    classDef quantum fill:#ec4899,color:#fff,stroke:#be185d,stroke-width:1px;
    classDef agent fill:#eab308,color:#2a1f00,stroke:#a16207,stroke-width:1px;
    classDef ai fill:#14b8a6,color:#02201c,stroke:#0f766e,stroke-width:1px;

    class UI client
    class Pages,MW,SupaSSR frontend
    class AuthProviders,Trigger auth
    class Tables db
    class RCircuits,RChallenges,RAgent backend
    class Qiskit quantum
    class Router,RAG,Circ,RagCirc,Progress agent
    class Gemini,Qdrant ai
```

**Why it's split this way:** the frontend reads/writes Supabase directly for anything that's plain CRUD
(lessons, progress, profile) so those pages stay fast server components with no extra network hop. Only
the two things that need real compute — running a quantum circuit, and the AI tutor's reasoning — go to
the FastAPI backend, which is the only thing that talks to Qiskit, Gemini, and Qdrant.

## User Flow Diagram

```mermaid
flowchart TD
    Start(["Visitor lands on Qylo"]) --> HasAccount{"Have an account?"}
    HasAccount -- No --> SignupChoice{"Sign up with"}
    SignupChoice -- Email + Password --> SignupForm["Pick role: Learner or Instructor"]
    SignupChoice -- "Google (one click)" --> GoogleOAuth["Google OAuth<br/>auto-provisioned as Learner"]
    HasAccount -- Yes --> LoginChoice{"Log in with"}
    LoginChoice -- Email + Password --> LoginForm["Supabase session issued"]
    LoginChoice -- Google --> GoogleOAuth

    SignupForm --> RoleGate{"Role?"}
    LoginForm --> RoleGate
    GoogleOAuth --> RoleGate

    RoleGate -- Learner --> LearnerDash["Learner Dashboard<br/>streaks · qubits executed · leaderboard preview"]
    RoleGate -- Instructor --> InstructorDash["Instructor Dashboard<br/>manage classes · class-wide progress"]

    LearnerDash --> Learn["Learn — pick a module<br/>(EN / HI / TE)"]
    Learn --> Lesson["Read lesson<br/>markdown + LaTeX"]
    Lesson --> AskTutor{"Stuck? Ask the AI Tutor"}
    AskTutor -- Yes --> TutorRAG["Grounded answer via<br/>Gemini + Qdrant RAG"]
    TutorRAG --> Lesson
    AskTutor -- No --> Composer["Circuit Builder<br/>drag-and-drop gates"]

    Composer --> RunSim["Run on Qiskit Aer<br/>counts · statevector · Bloch sphere"]
    RunSim --> AskTutor2{"Ask tutor to review circuit?"}
    AskTutor2 -- Yes --> TutorCircuit["AI reviews circuit,<br/>flags mistakes, suggests fixes"]
    TutorCircuit --> Composer
    AskTutor2 -- No --> Challenge["Attempt a Challenge<br/>(quiz or circuit)"]

    Challenge --> Grade{"Submission graded"}
    Grade -- Pass --> ProgressUpdate["Progress + achievements updated<br/>module marked complete"]
    Grade -- Fail --> AIFeedback["AI feedback on what went wrong"]
    AIFeedback --> Composer

    ProgressUpdate --> More{"What next?"}
    More -- More modules --> Learn
    More -- Check standing --> Leaderboard["Leaderboard / Community"]
    More -- Review profile --> Profile["Profile — achievements, certificates, stats"]

    classDef entry fill:#1d4ed8,color:#fff,stroke:#1e3a8a;
    classDef decision fill:#f97316,color:#2a1200,stroke:#c2410c;
    classDef learn fill:#22c55e,color:#04240f,stroke:#15803d;
    classDef build fill:#a855f7,color:#fff,stroke:#7e22ce;
    classDef ai fill:#14b8a6,color:#02201c,stroke:#0f766e;
    classDef outcome fill:#eab308,color:#2a1f00,stroke:#a16207;

    class Start entry
    class HasAccount,SignupChoice,LoginChoice,RoleGate,AskTutor,AskTutor2,Grade,More decision
    class LearnerDash,InstructorDash,Learn,Lesson,Leaderboard,Profile learn
    class Composer,RunSim,Challenge build
    class TutorRAG,TutorCircuit,AIFeedback,GoogleOAuth ai
    class SignupForm,LoginForm,ProgressUpdate outcome
```

## How to Run

### 0. One-time project setup

1. Create a free project at [supabase.com](https://supabase.com/dashboard).
2. In the SQL Editor, run these migrations **in order** (skip `0001` — `0002` supersedes it):
   [`0002`](supabase/migrations/0002_fix_users_and_complete_schema.sql) →
   [`0003`](supabase/migrations/0003_seed_phase2_lessons.sql) →
   [`0004`](supabase/migrations/0004_phase5_classes_and_sharing.sql) →
   [`0005`](supabase/migrations/0005_seed_phase5_challenges.sql) →
   [`0006`](supabase/migrations/0006_fix_class_rls_recursion.sql).
   Every migration is idempotent, so re-running one is harmless.
3. Copy the **Project URL**, **anon public key**, and **service role key** from *Project Settings → API*.
4. *(Optional — Sign in with Google)* enable the Google provider under *Authentication → Providers*, and
   add `<your-app-url>/auth/callback` to the *Redirect URLs* allow-list.
5. Grab a free [Gemini API key](https://aistudio.google.com/apikey) and a free
   [Qdrant Cloud](https://cloud.qdrant.io) cluster URL + API key (both power the AI tutor).

### 1. Run the frontend and backend

| Step | 🖥️ Frontend (`/frontend`) | ⚙️ Backend (`/backend`) |
|---|---|---|
| **Prerequisites** | Node.js 20+, npm | Python 3.11+, pip |
| **1. Enter the folder** | `cd frontend` | `cd backend` |
| **2. Copy the env file** | `cp .env.local.example .env.local` | `cp .env.example .env` |
| **3. Fill in the values** | `NEXT_PUBLIC_SUPABASE_URL`<br/>`NEXT_PUBLIC_SUPABASE_ANON_KEY`<br/>`NEXT_PUBLIC_API_URL` | `SUPABASE_URL`<br/>`SUPABASE_SERVICE_ROLE_KEY`<br/>`GEMINI_API_KEY`<br/>`QDRANT_URL`, `QDRANT_API_KEY` |
| **4. Install dependencies** | `npm install` | `python -m venv .venv` → activate it → `pip install -r requirements.txt` |
| **5. Run the dev server** | `npm run dev` | `uvicorn app.main:app --reload --port 8000` |
| **6. Verify it's running** | [localhost:3000](http://localhost:3000) | [localhost:8000/health](http://localhost:8000/health) → `{"status":"ok"}` |

> **AI tutor, one extra step:** once lessons exist in Supabase (seeded by migration `0003`), run
> `python -m scripts.ingest_lessons` from `backend/` (venv active) to embed and index them into Qdrant —
> that's what the RAG-grounded tutor searches against.

## Tech Stack

<table>
<tr><td valign="top" width="50%">

**Frontend**

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Radix](https://img.shields.io/badge/Radix_UI_/_shadcn-161618?style=flat-square&logo=radixui&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Motion-0055FF?style=flat-square&logo=framer&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-22B5BF?style=flat-square&logoColor=white)

App Router, Server Components, KaTeX-rendered lesson markdown, Lenis smooth scroll.

</td><td valign="top" width="50%">

**Backend**

![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python_3.11-3776AB?style=flat-square&logo=python&logoColor=white)
![Uvicorn](https://img.shields.io/badge/Uvicorn-2A9D8F?style=flat-square&logoColor=white)
![Pydantic](https://img.shields.io/badge/Pydantic-E92063?style=flat-square&logo=pydantic&logoColor=white)

REST endpoints for circuit execution, AI tutoring, and challenge grading.

</td></tr>
<tr><td valign="top" width="50%">

**Quantum Computing**

![Qiskit](https://img.shields.io/badge/Qiskit-6929C4?style=flat-square&logo=qiskit&logoColor=white)
![Qiskit Aer](https://img.shields.io/badge/Qiskit_Aer-6929C4?style=flat-square&logoColor=white)

Real circuit simulation — statevectors, shot-based counts, single-qubit Bloch vectors.

</td><td valign="top" width="50%">

**AI / ML**

![Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=flat-square&logo=googlegemini&logoColor=white)
![LangGraph](https://img.shields.io/badge/LangGraph-1C3C3C?style=flat-square&logoColor=white)
![Qdrant](https://img.shields.io/badge/Qdrant-DC244C?style=flat-square&logo=qdrant&logoColor=white)

`gemini-embedding-001` for retrieval, `gemini-3.6-flash` for generation, a 4-intent LangGraph
router (RAG · circuit review · grounded code-gen · progress) over a Qdrant lesson index.

</td></tr>
<tr><td valign="top" width="50%">

**Database & Auth**

![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)

Managed Postgres with row-level security; Auth via Email/Password and Google OAuth.

</td><td valign="top" width="50%">

**Deployment**

![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=flat-square&logo=railway&logoColor=white)

Frontend on Vercel; backend containerized with Docker on Railway/Render.

</td></tr>
</table>
