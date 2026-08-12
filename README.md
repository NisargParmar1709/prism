# Prism

> See your money clearly. An expense tracker, budget manager, and financial assistant built specifically for Indian students.

Prism is a modern, full-stack application managed as a monorepo. It features a Next.js frontend, a FastAPI backend, and utilizes [InsForge](https://insforge.dev) for its database, authentication, and backend-as-a-service infrastructure.

## 🏗️ Project Structure

This project uses `pnpm` workspaces for monorepo management.

```text
prism/
├── apps/
│   ├── web/        # Next.js 14 frontend (App Router, Tailwind CSS)
│   └── api/        # FastAPI backend (Python, SQLAlchemy)
├── packages/
│   └── shared/     # Shared TypeScript types and constants
├── docs/           # Project documentation and specifications
└── pnpm-workspace.yaml
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **pnpm** (v8 or higher)
- **Python** (v3.11 or higher)
- **InsForge CLI** (optional, for backend management)

### 1. Installation

Install all frontend and workspace dependencies from the root directory:
```bash
pnpm install
```

Set up the Python virtual environment for the backend:
```bash
cd apps/api
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
# source .venv/bin/activate

pip install -r requirements.txt
cd ../..
```

### 2. Environment Variables

We use `.env.example` as a template for required environment variables.

1. Create a `.env.local` file in the root directory (or inside `apps/web/` and `apps/api/` as needed):
   ```bash
   cp .env.example .env.local
   ```
2. Fill in your specific InsForge URL, API keys, and Database credentials.

> ⚠️ **Important**: Never commit your `.env.local` file to version control.

### 3. Running Locally

You can run both servers simultaneously in separate terminal windows.

#### Start the Frontend (Next.js)
From the root directory, you can use the workspace script:
```bash
pnpm dev
```
*The frontend will be available at [http://localhost:3000](http://localhost:3000)*

#### Start the Backend (FastAPI)
Open a new terminal, navigate to the API directory, and activate your virtual environment:
```bash
cd apps/api

# Activate venv (Windows)
.venv\Scripts\activate

# Start Uvicorn
python -m uvicorn app.main:app --reload
```
*The backend API will be available at [http://localhost:8000](http://localhost:8000)*
*API Documentation (Swagger UI) is automatically available at [http://localhost:8000/docs](http://localhost:8000/docs)*

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS 3.4, React Query, React Hook Form, Recharts, Framer Motion.
- **Backend**: FastAPI, Python, SQLAlchemy 2.0 (Async), Pydantic.
- **Infrastructure**: InsForge (PostgreSQL, Auth, Edge Functions).

## 📄 Documentation

For detailed architectural decisions, design tokens, and project phases, refer to the `/docs` directory. Start with `MASTER_INDEX.md` for a complete overview.

i just mean plan B 
still buggy i think i force fully fix some of bugs over security and other requirements 
for the production i will switch it to other service 
Yes but still don't test it on harsh testing on it still remaining mostly bugs ans security gateways will find out for sure 
i mean i don't want plan c current plan B
Yes i want remaining weeks roadmap
Yes
that you have to find ut mostly ai don't have access of third party service like auth and redis so it always do gueess work at the end most of bugs and errors accrued due to that bcz it don't have latest docs and context and how to use it update
