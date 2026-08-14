# ENV_REFERENCE.md
## Prism Environment Variables — Local vs Production

> **Purpose:** Clarify exactly what connects to what in each environment.
> **The AI MUST read this before creating any .env file or deployment config.**

---

## 1. Main Backend Environment (apps/api/.env.local)

### Local Development
```bash
# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_A_REF].us-east.insforge.app:5432/postgres

# InsForge Auth
INSFORGE_URL=https://[PROJECT_A_REF].us-east.insforge.app
INSFORGE_SERVICE_KEY=[SERVICE_KEY_FROM_INSFORGE_DASHBOARD]
INSFORGE_JWT_SECRET=[JWT_SECRET_FROM_INSFORGE_DASHBOARD_SETTINGS]

# AI (External APIs)
GEMINI_API_KEY=[YOUR_GEMINI_API_KEY]
OPENROUTER_API_KEY=[YOUR_OPENROUTER_API_KEY]

# Redis (Upstash — same region as backend for low latency)
REDIS_URL=rediss://default:[PASSWORD]@[ENDPOINT]:6379

# Email (placeholder — will upgrade to Resend later)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=[YOUR_GMAIL]
SMTP_PASS=[APP_PASSWORD]

# Security
SECRET_KEY=[generate_random_32_char_string]
CRON_SECRET=[super-secret-cron-key]

# CORS (local)
ALLOWED_ORIGINS=http://localhost:3000
```

### Production
```bash
# Database (same — InsForge manages this)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_A_REF].us-east.insforge.app:5432/postgres

# InsForge Auth (same)
INSFORGE_URL=https://[PROJECT_A_REF].us-east.insforge.app
INSFORGE_SERVICE_KEY=[SERVICE_KEY]
INSFORGE_JWT_SECRET=[JWT_SECRET]

# AI (External APIs)
GEMINI_API_KEY=[YOUR_GEMINI_API_KEY]
OPENROUTER_API_KEY=[YOUR_OPENROUTER_API_KEY]

# Redis (same region as backend)
REDIS_URL=rediss://default:[PASSWORD]@[ENDPOINT]:6379

# Email (same placeholder)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=[YOUR_GMAIL]
SMTP_PASS=[APP_PASSWORD]

# Security (same — but use strong random strings)
SECRET_KEY=[strong_random_32_char]
CRON_SECRET=[strong_random_cron_secret]

# CORS (production — explicit domains only)
ALLOWED_ORIGINS=https://prism-web.vercel.app,https://prism-web-git-main.vercel.app
```

---

## 2. Main Frontend Environment (apps/web/.env.local)

### Local Development
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_INSFORGE_URL=https://[PROJECT_A_REF].us-east.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=[ANON_KEY]
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Production
```bash
NEXT_PUBLIC_APP_URL=https://prism-web.vercel.app
NEXT_PUBLIC_INSFORGE_URL=https://[PROJECT_A_REF].us-east.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=[ANON_KEY]
NEXT_PUBLIC_API_URL=https://[YOUR_FASTAPI_URL]
```

---

## 3. Admin Backend Environment (apps/admin-api/.env.local)

*(Note: In local development, due to Python 3.14 native module compilation constraints, `admin-api` shares the virtual environment of `apps/api`. Ensure `.env.local` is present directly in the `apps/admin-api` folder).*

### Local Development
```bash
# Database (Completely separate DB from main user app)
ADMIN_DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_B_REF].us-east.insforge.app:5432/postgres

# Security
ADMIN_SECRET_KEY=[generate_random_32_char_string]

# CORS (local admin web)
ALLOWED_ORIGINS=http://localhost:3001
```

### Production
```bash
ADMIN_DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_B_REF].us-east.insforge.app:5432/postgres
ADMIN_SECRET_KEY=[strong_random_32_char]
ALLOWED_ORIGINS=https://prism-admin-web.vercel.app
```

---

## 4. Admin Frontend Environment (apps/admin-web/.env.local)

### Local Development
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_INSFORGE_URL=https://[PROJECT_B_REF].us-east.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=[ADMIN_ANON_KEY]
NEXT_PUBLIC_API_URL=http://localhost:8001
```

### Production
```bash
NEXT_PUBLIC_APP_URL=https://prism-admin-web.vercel.app
NEXT_PUBLIC_INSFORGE_URL=https://[PROJECT_B_REF].us-east.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=[ADMIN_ANON_KEY]
NEXT_PUBLIC_API_URL=https://[YOUR_ADMIN_FASTAPI_URL]
```

---
## Connection Flow Diagram

### Local Development
```
Browser (localhost:3000 / localhost:3001)
    ↓
Next.js Dev Server (localhost:3000 / localhost:3001)
    ↓ API calls to localhost:8000 / localhost:8001
FastAPI Dev Server (localhost:8000 / localhost:8001)
    ↓
InsForge Postgres (US-East) ← ~200ms latency (acceptable for dev)
    ↓
Upstash Redis (US-East) ← ~1ms from backend
```

### Production
```
Browser (India)
    ↓ ~20ms (Vercel CDN India PoP)
Vercel Edge (Static assets cached)
    ↓ ~193ms (API call to US-East)
FastAPI (InsForge Compute / Your URL)
    ↓ ~1ms
InsForge Postgres (US-East)
    ↓ ~1ms
Upstash Redis (US-East)
```

## Important Notes
- **Never commit `.env.local` files.** They contain secrets.
- **Always commit `.env.example`** with dummy values so new devs know what to set.
- Backend and Redis are in the same region (US-East) for ~1ms latency between them.
- Frontend CDN is in India for fast static asset delivery.
- The ~193ms API hop is structural (India → US-East) and cannot be eliminated on free tiers. We optimize around it with caching and optimistic UI.

## AI Instructions
When the AI needs to create an environment file:
1. Check if it's for local or production
2. Use the correct values from this reference
3. Never generate real secrets — use placeholders like `[YOUR_VALUE_HERE]`
4. Always remind the user to fill in actual values from their InsForge dashboard
