# MASTER_INDEX.md
## Prism — Document Quick Access for AntiGravity

> **Use this file as your starting point before EVERY AntiGravity session.**
> **The AI has zero memory between sessions. These documents ARE its memory.**

---

## 📋 Document Reading Order (Never Skip)

Before giving ANY task to AntiGravity, prepend these documents in this exact order:

### 1. PROJECT_CONTEXT_v2.md — The Bible
**What it is:** Living project memory. Stack, schema, phasing, feature checklist, known AI bugs.
**Why first:** The AI must know what exists, what's locked, and what to build next.
**When to update:** After every completed feature, change the "Built Features" checklist.

### 2. INSFORGE_CONSTRAINTS.md — Platform Reality
**What it is:** Verified InsForge capabilities, hard limits, connection strings.
**Why second:** Prevents AI from hallucinating outdated architecture (OpenRouter, custom auth, etc.).
**When to update:** If InsForge changes free-tier limits or adds features.

### 3. FINANCIAL_SAFETY_RULES.md — Non-Negotiables
**What it is:** 12 rules for money-handling code. Float = banned. Balance = computed. etc.
**Why third:** Financial bugs are silent and catastrophic. These rules override ANY AI suggestion.
**When to update:** If you discover a new AI mistake pattern.

### 4. DESIGN_SYSTEM_v2.md — Visual Language
**What it is:** Light mode, purple accent, all 13 component specs, typography, colors, animations.
**Why fourth:** The AI must match your wireframe aesthetic, not invent its own.
**When to update:** If you tweak colors, add components, or change spacing.

### 5. PAGES_SPEC.md — Page Blueprints
**What it is:** All 11 pages with ASCII wireframes, data requirements, states, interactions.
**Why fifth:** The AI must know exactly what each page looks like before coding it.
**When to update:** If you add/remove pages or change layouts.

### 6. API_CONTRACT_v2.md — Backend Contract
**What it is:** Every endpoint, request/response shape, error format, rate limits.
**Why sixth:** Both frontend and backend must speak the same API language.
**When to update:** Whenever an endpoint changes.

### 7. WEEK[X]_CHECKLIST_v2.md — Execution Plan
**What it is:** Day-by-day tasks with copy-paste AntiGravity prompts.
**Why last:** The specific task for today, with verification steps.
**When to update:** As you progress through weeks.

---

## 📥 Download All Documents

| # | Document | Download | Purpose |
|---|----------|----------|---------|
| 1 | PROJECT_CONTEXT_v2.md | [Download](sandbox:///mnt/agents/output/prism_docs_v2/PROJECT_CONTEXT_v2.md) | Living project memory |
| 2 | INSFORGE_CONSTRAINTS.md | [Download](sandbox:///mnt/agents/output/prism_docs_v2/INSFORGE_CONSTRAINTS.md) | Platform capabilities |
| 3 | FINANCIAL_SAFETY_RULES.md | [Download](sandbox:///mnt/agents/output/prism_docs_v2/FINANCIAL_SAFETY_RULES.md) | Money-handling rules |
| 4 | DESIGN_SYSTEM_v2.md | [Download](sandbox:///mnt/agents/output/prism_docs_v2/DESIGN_SYSTEM_v2.md) | Visual language |
| 5 | PAGES_SPEC.md | [Download](sandbox:///mnt/agents/output/prism_docs_v2/PAGES_SPEC.md) | Page blueprints |
| 6 | API_CONTRACT_v2.md | [Download](sandbox:///mnt/agents/output/prism_docs_v2/API_CONTRACT_v2.md) | API contract |
| 7 | WEEK0_CHECKLIST_v2.md | [Download](sandbox:///mnt/agents/output/prism_docs_v2/WEEK0_CHECKLIST_v2.md) | Week 0 execution |
| 8 | WEEK1_CHECKLIST_v2.md | [Download](sandbox:///mnt/agents/output/prism_docs_v2/WEEK1_CHECKLIST_v2.md) | Week 1 execution |

---

## 🚀 AntiGravity Session Starter Template

Copy-paste this into AntiGravity at the start of EVERY session:

```markdown
## CONTEXT — READ FIRST (Do NOT skip)
Read these files in order before doing anything:
1. /PROJECT_CONTEXT_v2.md
2. /INSFORGE_CONSTRAINTS.md
3. /FINANCIAL_SAFETY_RULES.md
4. /DESIGN_SYSTEM_v2.md
5. /PAGES_SPEC.md
6. /API_CONTRACT_v2.md

## CURRENT SPRINT
Week: [0 / 1 / 2 / 3 / 4]
Day: [1 / 2 / 3 / 4 / 5]
Last completed: [what you finished last session]

## TASK
[Describe the specific feature or component to build]

## CONSTRAINTS
- Use the stack defined in PROJECT_CONTEXT_v2.md
- All financial fields: NUMERIC(12,2), never FLOAT
- All timestamps: TIMESTAMPTZ (UTC), display in IST
- Balance: computed from transactions, never stored as column
- Auth: InsForge Auth only, httpOnly cookies
- Rate limiting: Upstash Redis, never in-memory
- Design: Light mode, purple accent, match DESIGN_SYSTEM_v2.md
- Components: Use design tokens, no arbitrary Tailwind values

## VERIFICATION
Before finishing, verify:
1. [Specific check 1]
2. [Specific check 2]
3. [Specific check 3]

## OUTPUT
Provide code, then provide "Verification Steps" section.
```

---

## ⚠️ Anti-Hallucination Quick Checklist

Before accepting ANY AI output, verify it doesn't do these:

- [ ] Did NOT create a custom `users` table
- [ ] Did NOT use `float` or `double` for money
- [ ] Did NOT store `balance` as a database column
- [ ] Did NOT put JWT in localStorage
- [ ] Did NOT use naive timestamps (no timezone)
- [ ] Did NOT hard-delete accounts (soft delete only)
- [ ] Did NOT dump raw transaction data to LLM prompts
- [ ] Did NOT implement in-memory rate limiting
- [ ] Did NOT use CORS wildcard in production
- [ ] Did NOT merge admin/user auth systems
- [ ] Did NOT use dark mode by default
- [ ] Did NOT use rainbow/multi-color charts
- [ ] Did NOT build Tremor default UI (custom Recharts wrappers)
- [ ] Did NOT limit savings goals to 1 (multiple per user)
- [ ] Did NOT skip RLS policies on user tables

---

## 📝 After Every Session — Update These

1. **PROJECT_CONTEXT_v2.md** — Mark completed features ✅, add new bugs found
2. **Git commit** — Small, focused commits with clear messages
3. **Test on mobile** — Chrome DevTools 360px width
4. **Verify no secrets leaked** — `git status` check before push

---

## 🆘 If AI Goes Off-Rails

If the AI starts doing something wrong mid-session:

1. **Stop immediately.** Don't let it generate more wrong code.
2. **Paste this:** `STOP. Read /FINANCIAL_SAFETY_RULES.md Rule #[number].`
3. **Paste this:** `STOP. Read /PROJECT_CONTEXT_v2.md "Known AI Bugs" section.`
4. **Start a fresh session** with the full context template above.

---

## 📁 File Locations (For Reference)

All documents are in: `/mnt/agents/output/prism_docs_v2/`

```
prism_docs_v2/
├── PROJECT_CONTEXT_v2.md          ← Start here, every time
├── INSFORGE_CONSTRAINTS.md        ← Platform reality
├── FINANCIAL_SAFETY_RULES.md      ← Money rules
├── DESIGN_SYSTEM_v2.md            ← Visual specs
├── PAGES_SPEC.md                  ← Page blueprints
├── API_CONTRACT_v2.md             ← Backend contract
├── WEEK0_CHECKLIST_v2.md          ← Week 0 tasks
├── WEEK1_CHECKLIST_v2.md          ← Week 1 tasks
└── MASTER_INDEX.md                ← This file
```

---

**Ready to start?** Open AntiGravity, paste the Session Starter Template, and begin Week 0 Day 1.
