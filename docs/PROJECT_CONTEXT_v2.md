# PROJECT_CONTEXT_v2.md
## Prism ExpenseTracker — Living Context for AI-Assisted Development

> **Rule:** Prepend this file to EVERY AntiGravity prompt. The agent has no memory between sessions. This file IS the memory.
> **Last Updated:** 2026-08-12
> **Wireframe Version:** v2 (11 pages, light mode, purple accent)
> **Approved Phasing:** Onboarding v1 | Core v1 | Savings Goals (multi) v1 | Analytics/AI v1.1 | Groups v2

---

## Project Identity
- **Name:** Prism
- **Tagline:** "See your money clearly"
- **Concept:** Light refracts into clarity. Your spending, broken down into visible, understandable patterns.
- **Target:** Indian students, 18–25, smartphone-first
- **Currency:** INR only (₹)
- **Design:** Light mode default, purple/violet primary accent, clean fintech aesthetic

---

## Current Sprint
| Field | Value |
|-------|-------|
| Sprint | Week 1 — Auth, Onboarding, Accounts & Savings Goals |
| Status | Ready to Start |
| Last Updated | 2026-08-12 |
| Next Milestone | Week 1 Exit Gate: User can register → onboard → create account → add transaction → see savings goal |

---

## Stack (LOCKED — Change Requires Explicit Approval)

### Frontend
| Concern | Choice | Why |
|---------|--------|-----|
| Framework | Next.js 14+ (App Router) | Streaming SSR, PPR, Vercel native |
| Language | TypeScript | Type safety across full stack |
| Styling | Tailwind CSS | Utility-first, design token friendly |
| State / Data | TanStack Query (React Query) v5 | Stale-while-revalidate, optimistic updates |
| Charts | Recharts | Custom Prism wrappers, NOT Tremor default style |
| Forms | React Hook Form + Zod | Performance + validation |
| Icons | Lucide React | Consistent, lightweight |
| Animations | Framer Motion | Onboarding transitions, micro-interactions |
| PWA | next-pwa | Offline transaction queue |
| Currency | currency.js | Exact decimal math for INR |

### Backend
| Concern | Choice | Why |
|---------|--------|-----|
| Framework | FastAPI (Python 3.11+) | Async, OpenAPI auto-gen, streaming |
| ORM | SQLAlchemy 2.0 (async) | Alembic migrations, RLS support |
| Validation | Pydantic v2 | Server-side validation |
| Auth | InsForge Auth (GoTrue) | Email/password, OAuth, JWT, email verify |
| JWT Validation | PyJWT + InsForge JWT secret | Verify tokens in FastAPI |
| Background Jobs | InsForge Edge Functions (Deno/TS) | Cron jobs, sync job |
| Compute | InsForge Compute (containers) | FastAPI app |

### Data & Infrastructure
| Concern | Choice | Why |
|---------|--------|-----|
| User DB | InsForge PostgreSQL (Project A) | Source of truth |
| Admin DB | InsForge PostgreSQL (Project B) | Aggregates only |
| Cache | Upstash Redis | Rate limiting, session cache, dashboard summaries |
| AI | InsForge Model Gateway | Built-in, OpenAI-compatible |
| Email | Any SMTP (placeholder) | Upgrade to Resend later |
| Analytics | PostHog (free tier) | 1M events/month |
| Error Tracking | Sentry (free tier) | Admin dashboard error log |
| Frontend Host | Vercel Hobby (sin1 region) | Closest APAC to India |
| Backend Host | InsForge Compute (US/EU) | Free tier constraint |

---

## Approved Phasing (User Confirmed 2026-08-12)

### v1 MVP (Weeks 1–4) — Must Ship First
| Feature | Week | Complexity |
|---------|------|------------|
| Auth (register, login, email verify, reset) | 1 | ⭐⭐⭐ |
| Onboarding (4-step wizard) | 1 | ⭐⭐⭐⭐⭐ |
| Profiles (name, college, avatar, currency) | 1 | ⭐⭐ |
| Account Management (CRUD, archive, computed balance) | 1 | ⭐⭐⭐⭐ |
| Savings Goals (MULTIPLE goals, circular progress) | 1 | ⭐⭐⭐ |
| Transaction Management (CRUD, quick-add, categories, tags) | 2 | ⭐⭐⭐⭐⭐ |
| Recurring Transactions | 2 | ⭐⭐⭐⭐ |
| Budgets (manual set, alerts at 80%/100%) | 3 | ⭐⭐⭐⭐ |
| Dashboard (stats, charts, recent txns, accounts, upcoming, savings goals) | 3 | ⭐⭐⭐⭐ |
| Settings (profile, notifications, data export, delete account) | 4 | ⭐⭐⭐⭐ |
| CSV Export | 4 | ⭐⭐ |
| PWA / Offline Support | 4 | ⭐⭐⭐ |

### v1.1 (Weeks 5–6) — Post-MVP Polish
| Feature | Week | Complexity |
|---------|------|------------|
| Analytics (Overview/Spending/Trends tabs) | 5 | ⭐⭐⭐⭐⭐ |
| AI Assistant (chat page, NLQ) | 5 | ⭐⭐⭐⭐⭐ |
| AI Monthly Summary | 5 | ⭐⭐⭐⭐ |
| Anomaly Detection | 6 | ⭐⭐⭐ |
| 2FA | 6 | ⭐⭐⭐ |
| CSV Bulk Import | 6 | ⭐⭐ |

### v2 (Future) — Not in Current Plan
| Feature | Complexity |
|---------|------------|
| Groups / Split Bills | ⭐⭐⭐⭐⭐ |
| Group Detail / Settlement | ⭐⭐⭐⭐⭐ |
| Multi-currency | ⭐⭐⭐ |
| Native Mobile Apps | ⭐⭐⭐⭐⭐ |

---

## Schema Version: v2.1 (Approved Phasing)

### Tables — User Plane (DB1) — v1 Tables
| Table | Purpose | Key Fields |
|-------|---------|------------|
| `users` | Managed by InsForge Auth | DO NOT CREATE MANUALLY. Use `auth.users` |
| `profiles` | Extended user data | `user_id` FK, `full_name`, `college`, `avatar_url`, `currency`, `onboarding_completed` |
| `accounts` | Financial containers | `user_id`, `name`, `type`, `opening_balance`, `currency`, `is_archived`, `is_emergency_fund`, `emergency_target`, `last_4_digits` |
| `transactions` | Money movements | `account_id`, `category_id`, `type`, `amount` NUMERIC(12,2), `date`, `note`, `tags`, `status`, `payment_method`, `group_expense_id` (nullable, v2) |
| `categories` | Spending classification | `user_id` (nullable for defaults), `name`, `icon`, `color`, `type` |
| `tags` | Free-form labels | `user_id`, `name` |
| `transaction_tags` | Many-to-many | `transaction_id`, `tag_id` |
| `budgets` | Spending limits | `user_id`, `category_id`, `amount` NUMERIC(12,2), `period` |
| `recurring_rules` | Auto-generation | `user_id`, `account_id`, `amount`, `category_id`, `frequency`, `next_run`, `end_date` |
| `notifications` | User alerts | `user_id`, `type`, `title`, `message`, `is_read`, `action_url` |
| `savings_goals` | Goal tracking (MULTIPLE) | `user_id`, `name`, `target_amount`, `current_amount`, `icon`, `monthly_contribution`, `deadline`, `status` |

### Tables — v1.1 (Future)
| Table | Purpose |
|-------|---------|
| `ai_conversations` | Chat history for AI Assistant |
| `ai_messages` | Individual messages |

### Tables — v2 (Future)
| Table | Purpose |
|-------|---------|
| `groups` | Expense groups |
| `group_members` | Group membership |
| `group_expenses` | Shared expenses |
| `group_expense_splits` | Per-member split |

### Tables — Admin Plane (DB2)
| Table | Purpose |
|-------|---------|
| `admin_metrics` | Aggregated counts |
| `users_summary` | Non-financial user list |
| `audit_logs` | Admin action trail |
| `sync_runs` | Sync job execution history |

---

## Page Inventory (11 Pages Total)

| # | Page | Route | Phase | Complexity | Status |
|---|------|-------|-------|------------|--------|
| 01 | Dashboard | `/dashboard` | v1 | ⭐⭐⭐⭐☆ | ❌ |
| 02 | Transactions | `/transactions` | v1 | ⭐⭐⭐⭐⭐ | ❌ |
| 03 | Accounts | `/accounts` | v1 | ⭐⭐⭐☆☆ | ❌ |
| 04 | Account Detail | `/accounts/[id]` | v1 | ⭐⭐⭐⭐☆ | ❌ |
| 05 | Budgets | `/budgets` | v1 | ⭐⭐⭐⭐☆ | ❌ |
| 06 | Analytics | `/analytics` | v1.1 | ⭐⭐⭐⭐⭐ | ❌ |
| 07 | AI Assistant | `/assistant` | v1.1 | ⭐⭐⭐⭐⭐ | ❌ |
| 08 | Groups | `/groups` | v2 | ⭐⭐⭐⭐☆ | ❌ |
| 09 | Group Detail | `/groups/[id]` | v2 | ⭐⭐⭐⭐⭐ | ❌ |
| 10 | Settings | `/settings` | v1 | ⭐⭐⭐⭐☆ | ❌ |
| 11 | Onboarding | `/onboarding` | v1 | ⭐⭐⭐⭐⭐ | ❌ |

---

## Built Features ✅ / ❌
- [ ] Auth (register, verify, login, reset)
- [ ] Onboarding (4-step wizard)
- [ ] Profiles (extended user data)
- [ ] Account management (CRUD, archive, computed balance)
- [ ] Transaction management (CRUD, quick-add, categories, tags)
- [ ] Recurring transactions
- [ ] Budgets (manual set, alerts at 80%/100%)
- [ ] Dashboard (stats, charts, recent txns, accounts, upcoming, savings goals)
- [ ] Savings Goals (MULTIPLE goals with circular progress)
- [ ] Settings (profile, notifications, data export, delete account)
- [ ] Analytics (Overview/Spending/Trends tabs)
- [ ] AI Assistant (chat interface, NLQ)
- [ ] AI monthly summary
- [ ] Anomaly detection
- [ ] Notifications (email + in-app)
- [ ] Admin dashboard
- [ ] Admin sync job
- [ ] CSV import/export
- [ ] PWA / offline support
- [ ] 2FA
- [ ] Groups / Split Bills

---

## Known AI Bugs (Fix Before Proceeding)
| # | Bug | Status | Fix |
|---|-----|--------|-----|
| 1 | Agent tries to create custom `users` table | BLOCKED | Use `auth.users` from InsForge |
| 2 | Agent uses `FLOAT` for money | BLOCKED | `NUMERIC(12,2)` everywhere |
| 3 | Agent stores `balance` as column | BLOCKED | Computed from transactions only |
| 4 | Agent puts JWT in localStorage | BLOCKED | httpOnly cookie only |
| 5 | Agent uses naive timestamps | BLOCKED | `TIMESTAMPTZ` (UTC) |
| 6 | Agent hard-deletes accounts | BLOCKED | `is_archived` soft-delete |
| 7 | Agent dumps raw data to LLM | BLOCKED | SQL-first, result-only to LLM |
| 8 | Agent implements in-memory rate limit | BLOCKED | Upstash Redis only |
| 9 | Agent allows CORS wildcard prod | BLOCKED | Explicit origins |
| 10 | Agent merges admin/user auth | BLOCKED | Separate JWT secrets/instances |
| 11 | Agent uses dark mode by default | BLOCKED | Light mode per wireframe |
| 12 | Agent uses rainbow charts | BLOCKED | Monochromatic purple only |
| 13 | Agent builds Tremor default UI | BLOCKED | Custom Recharts wrappers |
| 14 | Agent limits savings goals to 1 | BLOCKED | Multiple goals per user |

---

## Regional / Latency Context
| Hop | Latency | Mitigation |
|-----|---------|------------|
| User → Vercel (static) | ~20-50ms (Mumbai CDN) | Automatic |
| User → Vercel Function | ~50-100ms (sin1) | Pin region, ISR |
| Vercel → InsForge (API) | ~200-300ms (US/EU) | Cache-aside Redis, optimistic UI |
| InsForge → Model Gateway | ~100-200ms | Stream token-by-token |

---

## Next Immediate Task
Week 1 Day 1: Initialize repository, configure Tailwind with light-mode design tokens, create base components matching wireframe.
