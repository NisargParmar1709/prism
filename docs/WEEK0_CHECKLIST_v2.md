# WEEK0_CHECKLIST_v2.md
## Prism — Week 0: Foundation & Design System (Wireframe-Aligned)

> **Duration:** 3 days (Days 1–3)
> **Goal:** Empty-but-correctly-structured project that deploys, with light-mode design tokens and wireframe-matched base components.
> **Exit Gate:** Fresh clone → running locally in < 15 minutes. Vercel deploys. InsForge instances reachable. Base components match wireframe screenshot.

---

## Pre-Reading (Do This First)
Before starting any task, read these files in order:
1. `PROJECT_CONTEXT_v2.md`
2. `INSFORGE_CONSTRAINTS.md`
3. `FINANCIAL_SAFETY_RULES.md`
4. `DESIGN_SYSTEM_v2.md`
5. `PAGES_SPEC.md`
6. `API_CONTRACT_v2.md`
7. `FRONTEND_OPTIMIZATION_GUIDE.md`

---

## Day 1: Repository & Tooling Setup

### Task 1.1: Initialize Repository

**AntiGravity Prompt:**
```markdown
## CONTEXT
Read /PROJECT_CONTEXT_v2.md, /INSFORGE_CONSTRAINTS.md, and /FINANCIAL_SAFETY_RULES.md before proceeding.

## TASK
Initialize a new Git repository for "Prism" with the following structure:

```
prism/
├── apps/
│   ├── web/                    # Next.js 14 frontend
│   │   ├── app/                # App Router
│   │   │   ├── (dashboard)/    # Dashboard layout group
│   │   │   │   ├── dashboard/
│   │   │   │   ├── transactions/
│   │   │   │   ├── accounts/
│   │   │   │   ├── budgets/
│   │   │   │   ├── analytics/
│   │   │   │   ├── assistant/
│   │   │   │   ├── groups/
│   │   │   │   └── settings/
│   │   │   ├── onboarding/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── layout.tsx      # Root layout
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── ui/             # Base components (buttons, cards, inputs)
│   │   │   ├── layout/         # AppShell, Sidebar, BottomNav
│   │   │   ├── dashboard/      # Dashboard-specific components
│   │   │   ├── transactions/   # Transaction components
│   │   │   └── shared/         # Shared across pages
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Utilities, query client, api client
│   │   ├── types/              # TypeScript types
│   │   └── public/
│   └── api/                    # FastAPI backend
│       ├── app/
│       ├── models/
│       ├── schemas/
│       ├── services/
│       ├── routers/
│       ├── dependencies/
│       └── alembic/
├── packages/
│   └── shared/                 # Shared types/constants
├── docs/                       # Project documentation
└── scripts/                    # Deployment scripts
```

## CONSTRAINTS
- Use pnpm workspaces for monorepo
- Next.js 14 with App Router
- TypeScript everywhere
- Tailwind CSS configured with light-mode design tokens from DESIGN_SYSTEM_v2.md
- FastAPI with async SQLAlchemy 2.0
- .gitignore must include: .env, .env.local, node_modules, __pycache__, .venv
- Create .env.example with dummy values

## VERIFICATION
1. `pnpm install` completes without errors
2. `cd apps/web && pnpm dev` starts Next.js on port 3000
3. `cd apps/api && python -m uvicorn app.main:app --reload` starts FastAPI on port 8000
4. `git status` shows no uncommitted files
```

**Human Check:** Verify folder structure matches. Check .gitignore covers secrets.

---

### Task 1.2: Configure Tailwind with Prism Light-Mode Design Tokens

**AntiGravity Prompt:**
```markdown
## CONTEXT
Read /DESIGN_SYSTEM_v2.md Sections 2 (Color Palette) and 3 (Typography).

## TASK
Configure Tailwind CSS in apps/web with the Prism light-mode design system.

Create:
1. `apps/web/tailwind.config.ts` with:
   - Custom colors matching DESIGN_SYSTEM_v2.md exactly (light mode: white bg, slate text, violet accents)
   - Custom font sizes (text-display, text-h1, text-h2, text-h3, text-body, text-small, text-xs)
   - Custom spacing scale
   - Custom border-radius (10px buttons, 16px cards)
   - Custom animations (pulse-slow for skeletons, progress-fill for budget bars)
   - Dark accent card colors (for account hero cards)

2. `apps/web/app/globals.css` with:
   - Light mode as default (`color-scheme: light`)
   - CSS custom properties for all prism colors
   - Font imports (Inter from next/font, JetBrains Mono)
   - Base body styles (bg-white, text-slate-900)
   - Scrollbar styling (thin, light)
   - Amount display utility classes (tabular-nums, mono font)

3. `apps/web/app/layout.tsx` with:
   - Inter font loaded via next/font/google
   - Light mode html class
   - TanStack Query provider wrapper
   - React Hot Toast provider (bottom-center mobile, top-right desktop)

## CONSTRAINTS
- Colors must match DESIGN_SYSTEM_v2.md hex codes exactly
- NO dark mode as default — wireframe is light mode
- No arbitrary values in components — all must use design tokens
- Mobile-first breakpoints
- Amount text must use tabular-nums and JetBrains Mono

## VERIFICATION
1. Run `pnpm dev` and open localhost:3000
2. Create a test page `/test-design` with:
   - Color swatches for all prism colors
   - Typography scale samples
   - A SurfaceCard and a DarkHeroCard
   - A ProgressBar and a StatusPill
3. Verify all match DESIGN_SYSTEM_v2.md
4. Verify light mode is active (white background)
5. Check that JetBrains Mono is used for amounts
```

**Human Check:** Open browser, verify light mode, colors match wireframe screenshot, cards look correct.

---

### Task 1.3: Install & Configure Core Dependencies

**AntiGravity Prompt:**
```markdown
## CONTEXT
Read /PROJECT_CONTEXT_v2.md Section "Stack (LOCKED)".

## TASK
Install all dependencies.

Frontend packages (apps/web):
- @tanstack/react-query
- axios
- react-hook-form
- zod
- @hookform/resolvers
- lucide-react
- recharts
- framer-motion
- react-hot-toast
- next-pwa
- currency.js
- date-fns

Backend packages (apps/api):
- fastapi
- uvicorn[standard]
- sqlalchemy[asyncio]
- alembic
- asyncpg
- pydantic
- pydantic-settings
- python-jose[cryptography]
- passlib[argon2]
- redis
- httpx
- python-multipart
- email-validator

## CONSTRAINTS
- Use exact versions (pin in package.json and requirements.txt)
- Create requirements.txt for backend
- Create package.json with exact versions for frontend

## VERIFICATION
1. `pnpm install` in apps/web succeeds
2. `pip install -r requirements.txt` in apps/api succeeds
3. Import test: create a file that imports from each package, verify no errors
```

**Human Check:** Run both install commands. Check for version conflicts.

---

## Day 2: InsForge Setup & Connection

### Task 2.1: Create InsForge Projects via MCP

**Manual Steps (You do this, not AI):**
1. Open AntiGravity IDE with InsForge MCP connected
2. Create Project A (User): `prism-user`
3. Create Project B (Admin): `prism-admin`
4. Enable Auth on Project A
5. Enable Model Gateway on Project A
6. Note down all credentials

**AntiGravity Prompt (after manual setup):**
```markdown
## CONTEXT
Read /INSFORGE_CONSTRAINTS.md Section "Verified Connection Strings".

## TASK
Create `.env.local` files for both frontend and backend.

apps/web/.env.local:
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_INSFORGE_URL=https://[PROJECT_A_REF].insforge.dev
NEXT_PUBLIC_INSFORGE_ANON_KEY=[ANON_KEY]
```

apps/api/.env.local:
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_A_REF].insforge.dev:5432/postgres
ADMIN_DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_B_REF].insforge.dev:5432/postgres
INSFORGE_URL=https://[PROJECT_A_REF].insforge.dev
INSFORGE_SERVICE_KEY=[SERVICE_KEY]
INSFORGE_JWT_SECRET=[JWT_SECRET]
REDIS_URL=[UPSTASH_REDIS_URL]
AI_BASE_URL=https://modelgateway.insforge.dev/v1
AI_API_KEY=[ANON_KEY]
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SECRET_KEY=[generate_random_32_char_string]
ADMIN_SECRET_KEY=[generate_different_32_char_string]
```

## CONSTRAINTS
- Never commit .env.local files
- .env.example must exist with dummy values
- Generate two DIFFERENT random 32-char strings for SECRET_KEY and ADMIN_SECRET_KEY

## VERIFICATION
1. Verify .env.local is in .gitignore
2. Verify .env.example exists and is NOT gitignored
3. Test connection to InsForge from backend using a simple Python script
```

**Human Check:** Run the connection test script. Verify both DBs are reachable.

---

### Task 2.2: Set Up FastAPI Skeleton

**AntiGravity Prompt:**
```markdown
## CONTEXT
Read /PROJECT_CONTEXT_v2.md and /API_CONTRACT_v2.md Section 1 (Error Response Shape).

## TASK
Create the FastAPI skeleton in apps/api with:

1. `app/main.py`:
   - FastAPI app instance with title="Prism API", version="1.0"
   - CORS middleware (allow origins from env, NOT wildcard in prod)
   - Structured logging middleware (request_id, timestamp, path, method, duration, user_id)
   - Global exception handler returning standard error shape
   - Health check endpoint: GET /health

2. `app/config.py`:
   - Pydantic Settings class loading from .env.local
   - All env vars typed and validated

3. `app/dependencies.py`:
   - get_db() dependency for SQLAlchemy async session
   - get_current_user() dependency for JWT validation (validate InsForge JWT)
   - get_redis() dependency for Redis connection
   - get_admin_user() dependency (separate JWT secret for admin)

4. `app/middleware/logging.py`:
   - Request ID generation (uuid4)
   - Log every request: method, path, status, duration, user_id, request_id
   - JSON structured logging

5. `app/routers/__init__.py`:
   - Include pattern for all routers

## CONSTRAINTS
- Use async everywhere
- Never use sync database calls
- All errors return standard error shape
- Request ID must be in response headers (X-Request-ID)
- Admin auth uses separate secret from user auth

## VERIFICATION
1. `uvicorn app.main:app --reload` starts without errors
2. GET /health returns 200
3. GET /nonexistent returns 404 with standard error shape
4. Request ID header present in all responses
5. Logs are structured JSON
```

**Human Check:** Hit all three endpoints with curl. Verify response shapes.

---

## Day 3: Deploy & Validate

### Task 3.1: Deploy Empty Next.js App to Vercel

**AntiGravity Prompt:**
```markdown
## CONTEXT
Read /FRONTEND_OPTIMIZATION_GUIDE.md Section 1 (Vercel Configuration).

## TASK
1. Create `vercel.json` in apps/web with:
   - regions: ["sin1"]
   - Cache headers for static assets
   - Headers for API routes

2. Create `apps/web/next.config.js` with:
   - experimental.ppr: true
   - images configuration
   - modularizeImports for lucide-react and recharts
   - trailingSlash: false

3. Create a simple landing page at `/`:
   - "Prism" heading with gradient text (violet gradient)
   - "See your money clearly" tagline
   - A SurfaceCard component using design tokens
   - A DarkHeroCard sample (account card style)
   - Light background, white cards, purple accents

4. Push to GitHub and connect to Vercel

## CONSTRAINTS
- Must use light mode design tokens (NOT dark)
- Must show the glass/surface card effect
- Must include a dark hero card sample (for account display)

## VERIFICATION
1. Deploy succeeds on Vercel
2. Open deployed URL on mobile — verify light mode, cards, gradient text
3. Check Network tab — static assets served from CDN
4. Verify X-Vercel-Id header shows sin1 region
```

**Human Check:** Open on phone. Screenshot and verify design matches wireframe aesthetic.

---

### Task 3.2: Deploy FastAPI to InsForge Compute

**AntiGravity Prompt:**
```markdown
## CONTEXT
Read /INSFORGE_CONSTRAINTS.md Section 5 (Compute).

## TASK
1. Create `apps/api/Dockerfile`:
   - Python 3.11 slim base
   - Install requirements
   - Copy app code
   - CMD: uvicorn app.main:app --host 0.0.0.0 --port 8000

2. Create `apps/api/.dockerignore`

3. Deploy to InsForge Compute:
   - Use InsForge MCP or dashboard
   - Point to Dockerfile in apps/api/
   - Set environment variables from .env.local
   - Expose port 8000

4. Verify: GET https://[PROJECT_A_REF].insforge.dev/health returns 200

## CONSTRAINTS
- Multi-stage build for smaller image
- Never include .env.local in Docker context
- Health endpoint must work

## VERIFICATION
1. Docker build succeeds locally
2. InsForge Compute deployment succeeds
3. Health endpoint returns 200 from deployed URL
4. Set up UptimeRobot to ping /health every 5 minutes
```

**Human Check:** Verify health endpoint from your phone.

---

### Task 3.3: Create Base Component Library (Wireframe-Matched)

**AntiGravity Prompt:**
```markdown
## CONTEXT
Read /DESIGN_SYSTEM_v2.md Sections 5 (Component Specifications) and /PAGES_SPEC.md.

## TASK
Create the base component library in apps/web/components/ui/:

1. `SurfaceCard.tsx` — White card with subtle shadow, 16px radius, 24px padding
2. `DarkHeroCard.tsx` — Dark gradient card for account display (HDFC card style)
3. `PrismButton.tsx` — All variants: Primary (violet), Secondary (violet-50), Outline, Danger, Text
4. `PrismInput.tsx` — Text input with label, error state, focus ring (violet)
5. `AmountInput.tsx` — Specialized: ₹ prefix, right-aligned, JetBrains Mono, large text
6. `ProgressBar.tsx` — 8px height, color changes by percentage (<80% violet, 80-99% amber, 100%+ red)
7. `CircularProgress.tsx` — SVG ring for savings goals (120px, animated)
8. `TransactionRow.tsx` — Grid layout: icon | details | account | amount | status
9. `StatusPill.tsx` — 24px height, rounded-full, color-coded (success/warning/danger/info)
10. `SectionHeader.tsx` — Title + subtitle + action button
11. `QuickAddFAB.tsx` — Fixed bottom-right, 56px, violet, plus icon
12. `EmptyState.tsx` — Icon + title + description + action button
13. `Skeleton.tsx` — Card, text, circle variants with shimmer animation

## CONSTRAINTS
- Every component must use Tailwind design tokens only
- Every component must have TypeScript props interface
- Mobile-first: test at 360px width
- Use Framer Motion for animations (ProgressBar fill, CircularProgress draw)
- Amount components must use tabular-nums and JetBrains Mono
- Status pills must match exact colors from DESIGN_SYSTEM_v2.md

## VERIFICATION
1. Create a test page `/test-components` showcasing all 13 components
2. Verify each matches DESIGN_SYSTEM_v2.md and wireframe screenshot
3. Test on mobile viewport (Chrome DevTools 360px)
4. Verify animations work
5. Verify light mode renders correctly
6. Compare with wireframe screenshot — should feel visually similar
```

**Human Check:** Open `/test-components` on phone. Verify all 13 components render correctly. Compare side-by-side with wireframe screenshot.

---

## Week 0 Exit Gate Checklist

Before proceeding to Week 1, ALL of these must be true:

- [ ] Git repo initialized with correct monorepo structure (including all 11 page folders)
- [ ] `pnpm install` works from fresh clone
- [ ] `pip install -r requirements.txt` works from fresh clone
- [ ] Next.js dev server runs on localhost:3000
- [ ] FastAPI dev server runs on localhost:8000
- [ ] Tailwind design tokens match DESIGN_SYSTEM_v2.md exactly (LIGHT MODE)
- [ ] InsForge Project A (user) created and reachable
- [ ] InsForge Project B (admin) created and reachable
- [ ] FastAPI deployed to InsForge Compute, /health returns 200
- [ ] Next.js deployed to Vercel, loads correctly on mobile
- [ ] UptimeRobot pinging /health every 5 minutes
- [ ] All 13 base UI components created and tested
- [ ] Test page `/test-components` matches wireframe aesthetic
- [ ] `.env.local` files exist and are gitignored
- [ ] `.env.example` files exist and are NOT gitignored
- [ ] `PROJECT_CONTEXT_v2.md` updated with actual project refs

---

## Week 0 Anti-Hallucination Checks

The AI will try to do these wrong things. Stop it:

| # | AI Mistake | Your Correction |
|---|-----------|----------------|
| 1 | Create custom `users` table | Use `auth.users` from InsForge |
| 2 | Use `FLOAT` for money | `NUMERIC(12,2)` everywhere |
| 3 | Store `balance` as column | Computed from transactions only |
| 4 | Put JWT in localStorage | httpOnly cookie only |
| 5 | Use naive timestamps | `TIMESTAMPTZ` (UTC) |
| 6 | Hard-delete accounts | `is_archived` soft-delete |
| 7 | Dump raw data to LLM | SQL-first, result-only to LLM |
| 8 | In-memory rate limit | Upstash Redis only |
| 9 | CORS wildcard in prod | Explicit origins |
| 10 | Merge admin/user auth | Separate JWT secrets |
| 11 | **Use dark mode by default** | **LIGHT MODE per wireframe** |
| 12 | **Use rainbow charts** | **Monochromatic purple only** |
| 13 | **Build Tremor default UI** | **Custom Recharts wrappers** |
| 14 | Skip `/test-components` page | Must create for visual verification |
| 15 | Forget mobile viewport test | Must test at 360px width |

---

## Next: Week 1
Once Week 0 exit gate is passed, proceed to:
- **Week 1:** Auth, Onboarding, Profiles & Account Management
- Read `WEEK1_CHECKLIST_v2.md` (to be generated after Week 0 approval)
