# PLAN OVERRIDES

> [!CAUTION]
> This document contains critical overrides to the original project plan. **AI Agents MUST read and follow these rules before writing any code.** If other documentation conflicts with this file, this file takes precedence.

## 1. Admin Panel is Decoupled (Separate Apps in Monorepo)
- **Previous Plan:** Build admin dashboard within the user web app, and build admin API routes (`/admin`) in the existing backend.
- **NEW OVERRIDE:** The Admin Panel is a separate frontend and backend application within this monorepo (`apps/admin-web` and `apps/admin-api`).
- **Action:** DO NOT create admin routes, admin databases, or admin authentications in the main `apps/api` or `apps/web`. Build them entirely in the `admin-api` and `admin-web` directories instead.

## 2. PWA & Offline Sync Queue Cancelled
- **Previous Plan:** Implement `next-pwa` and a custom offline transaction sync queue (originally slated for Week 4).
- **NEW OVERRIDE:** PWA and offline features are entirely cancelled.
- **Action:** DO NOT implement Service Workers, IndexedDB offline caching, or offline sync queues. Ignore any instructions regarding PWA offline capabilities.

## 3. AI Gateway Changed
- **Previous Plan:** Use the built-in InsForge Model Gateway (proxy) for all AI interactions to hide keys.
- **NEW OVERRIDE:** We will NOT use the InsForge API Gateway for AI. We will use direct APIs (e.g., Gemini API, OpenRouter API) in our backend.
- **Action:** Expect external API keys (`GEMINI_API_KEY`, `OPENROUTER_API_KEY`) and communicate directly with these providers instead of routing through InsForge Model Gateway.
