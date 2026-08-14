# INSFORGE_CONSTRAINTS.md
## Verified Capabilities & Hard Limits (August 2026)

> **Source:** Official InsForge documentation, changelogs, and direct platform verification. 
> **Purpose:** Prevent the AI from hallucinating outdated architecture decisions.

---

## What InsForge Actually Provides

### 1. Authentication (GoTrue)
| Feature | Status | Notes |
|---------|--------|-------|
| Email/password registration | ✅ Available | Includes email verification |
| OAuth (Google, GitHub, etc.) | ✅ Available | Configurable in dashboard |
| JWT sessions | ✅ Available | Short-lived access + refresh tokens |
| Password reset | ✅ Available | Email-based with expiry |
| 2FA / MFA | ⚠️ Check at build time | May require Edge Function workaround |
| Rate limiting on auth | ❌ NOT built-in | Must implement via Upstash Redis |

**AI Rule:** Do NOT build custom auth. Use InsForge Auth. Validate JWTs in FastAPI middleware.

### 2. Database (PostgreSQL)
| Feature | Status | Notes |
|---------|--------|-------|
| Postgres 15+ | ✅ | Full SQL support |
| Row Level Security (RLS) | ✅ | Critical for multi-tenant data isolation |
| Realtime subscriptions | ✅ | For live notification updates |
| Backups | ✅ | Daily automated, point-in-time recovery |
| Connection pooling | ✅ | Via PgBouncer |
| Extensions (pgcrypto, uuid-ossp) | ✅ | Enable as needed |

**AI Rule:** Enable RLS on ALL user-facing tables. Policies must check `auth.uid()`.

### 3. Model Gateway (AI) [CANCELLED]
> [!CAUTION]
> **[OVERRIDE]** We are NOT using the InsForge Model Gateway. We will communicate directly with external APIs (e.g. Gemini API, OpenRouter). Expect `GEMINI_API_KEY` or `OPENROUTER_API_KEY`.

### 4. Edge Functions
| Feature | Status | Notes |
|---------|--------|-------|
| Deno/TypeScript runtime | ✅ | v1.40+ |
| HTTP triggers | ✅ | REST endpoints |
| Scheduled (cron) jobs | ✅ | Up to 1-minute granularity |
| Database triggers | ✅ | Invoke on INSERT/UPDATE/DELETE |
| Background jobs | ✅ | Long-running (up to 400s) |
| Streaming | ✅ | SSE supported |

**AI Rule:** Use Edge Functions ONLY for:
- Recurring transaction generation (cron)
- Admin sync job (cron, every 15 min)
- Database webhooks (if needed)

Do NOT put business logic in Edge Functions. Keep financial calculations in FastAPI.

### 5. Compute (Containers)
| Feature | Status | Notes |
|---------|--------|-------|
| Docker containers | ✅ | Custom Dockerfile |
| Persistent running | ⚠️ Free tier: 120 hrs/month | Not truly 24/7 |
| Auto-pause | ⚠️ After ~7 days inactivity | Must ping to keep warm |
| Regions | ⚠️ US/EU only | No India/APAC option on free tier |
| Environment variables | ✅ | Encrypted at rest |
| Health checks | ✅ | Configurable endpoint |

**AI Rule:** FastAPI app runs in Compute. Implement `/health` endpoint. Use UptimeRobot (free) to ping every 5 minutes to prevent pause.

### 6. Storage
| Feature | Status | Notes |
|---------|--------|-------|
| Object storage (S3-compatible) | ✅ | For receipt images, exports |
| CDN delivery | ✅ | Public/private buckets |
| Free tier limit | ⚠️ Check at build | Usually 1GB |

---

## Hard Limits (Non-Negotiable)

| Limit | Value | Impact |
|-------|-------|--------|
| Compute hours (free) | 120 hrs/month | ~4 hrs/day average. NOT 24/7 |
| Inactivity pause | ~7 days | Instance sleeps. First request wakes it (cold start ~2-5s) |
| DB connections | 60 (direct) / 200 (pooler) | Use SQLAlchemy async pool, don't leak connections |
| Edge Function exec time | 400s | Long enough for sync jobs |
| Edge Function memory | 256MB | Don't process huge datasets in Edge Functions |
| Storage (free) | ~1GB | Receipt images must be compressed |

---

## Two-Instance Strategy (User + Admin) [CANCELLED]

> [!CAUTION]
> **[OVERRIDE]** The Admin Panel is now a completely separate application in this monorepo (`apps/admin-api` and `apps/admin-web`). Do NOT build admin databases or admin APIs in the main `apps/api` app.

---

## MCP Integration (AntiGravity IDE)

Your AntiGravity IDE connects to InsForge via MCP. This means:
- The AI can create tables, manage auth, deploy Edge Functions via tool calls
- The AI does NOT need to write SQL to create tables — it can use MCP
- BUT: The AI must still write migration files (Alembic) for version control

**AI Rule:** Always generate Alembic migration scripts even when using MCP. MCP is for convenience; migrations are for correctness.

---

## Verified Connection Strings

```
# User Instance (Project A)
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# AI (External APIs)
GEMINI_API_KEY=[your_gemini_key]
OPENROUTER_API_KEY=[your_openrouter_key]

# Redis (Upstash)
REDIS_URL=rediss://default:[password]@[endpoint]:6379
```

**AI Rule:** Never hardcode these. Use `.env.local` for dev, InsForge secrets for prod.
