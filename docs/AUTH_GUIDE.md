# AUTH_GUIDE.md
## Prism Auth Architecture — AntiGravity Reference

> **Purpose:** Prevent the AI from ever getting confused about auth again.
> **Rule:** The AI MUST read this file BEFORE touching any auth-related code.

---

## The Golden Rule

**FastAPI NEVER creates JWTs. FastAPI NEVER checks passwords. FastAPI ONLY validates JWTs issued by InsForge Auth (GoTrue).**

If the AI tries to:
- Create a `users` table → STOP IT
- Hash passwords with bcrypt/argon2 → STOP IT
- Issue JWT tokens → STOP IT
- Build a login endpoint that checks email+password → STOP IT

InsForge Auth handles ALL of that.

---

## Architecture Flow
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│   Browser   │────▶│  InsForge Auth  │────▶│  auth.users │
│             │     │  (GoTrue/JWT)   │     │  (managed)  │
└─────────────┘     └─────────────────┘     └─────────────┘
│
│ 1. User registers on InsForge Auth
│ 2. User verifies email via InsForge
│ 3. User logs in via InsForge Auth
│ 4. InsForge returns: access_token + refresh_token
│
▼
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│   Next.js   │────▶│     FastAPI     │────▶│   profiles  │
│  (Frontend) │     │  (Validator)    │     │  (extended) │
└─────────────┘     └─────────────────┘     └─────────────┘
plain

---

## What Each Layer Does

### 1. InsForge Auth (GoTrue)
- Email/password registration
- Email verification (mandatory)
- Password reset
- OAuth (Google, GitHub)
- Issues JWT access_token (short-lived, ~1 hour)
- Issues JWT refresh_token (long-lived, ~1 week)
- Manages `auth.users` table (DO NOT TOUCH)

### 2. Next.js Frontend
- Calls InsForge Auth JS client for register/login/reset
- Stores JWT in **localStorage** (current implementation — to be migrated to httpOnly cookies in Week 6)
- Sends JWT in `Authorization: Bearer <token>` header to FastAPI
- Handles auth state changes (login, logout, token refresh)

### 3. FastAPI Backend
- **NEVER creates JWTs**
- **NEVER checks passwords**
- Extracts `Authorization: Bearer <token>` header
- Validates token signature using `INSFORGE_JWT_SECRET`
- Extracts `user_id` (sub) from token payload
- Looks up `profiles` table for extended user data
- Returns 401 if token invalid/expired
- Returns 403 if user not authorized

### 4. profiles Table (YOU create this)
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,  -- References auth.users(id), NOT enforced as FK
    full_name TEXT,
    college TEXT,
    avatar_url TEXT,
    currency TEXT DEFAULT 'INR',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy
CREATE POLICY "Users can only access their own profile"
    ON profiles FOR ALL
    USING (user_id = auth.uid());
CRITICAL: user_id references auth.users(id) logically, but DO NOT create a foreign key constraint. InsForge manages auth.users in a separate schema. Use application-level validation.
JWT Validation in FastAPI
Python
# apps/api/app/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from jwt.exceptions import InvalidTokenError
import os

security = HTTPBearer()

INSFORGE_JWT_SECRET = os.getenv("INSFORGE_JWT_SECRET")
INSFORGE_URL = os.getenv("INSFORGE_URL")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    token = credentials.credentials
    
    try:
        payload = jwt.decode(
            token,
            INSFORGE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
            issuer=INSFORGE_URL
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: no subject")
        return user_id
    except InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {str(e)}"
        )

async def get_db():
    # Your async SQLAlchemy session dependency
    pass
Admin Auth (Completely Separate)
Admin endpoints use a different JWT secret and different middleware:
Python
# apps/api/app/dependencies.py
ADMIN_SECRET_KEY = os.getenv("ADMIN_SECRET_KEY")

async def get_admin_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    token = credentials.credentials
    
    try:
        payload = jwt.decode(token, ADMIN_SECRET_KEY, algorithms=["HS256"])
        admin_id = payload.get("sub")
        if not admin_id:
            raise HTTPException(status_code=401, detail="Invalid admin token")
        # Additional check: is this user in admin whitelist?
        return admin_id
    except InvalidTokenError:
        raise HTTPException(status_code=403, detail="Invalid admin credentials")
Admin JWTs are issued by a separate admin login flow (not InsForge Auth). This could be:
A simple password-protected endpoint that issues admin JWTs
Or InsForge Auth with a separate project/role
For v1, use a simple admin login:
Python
# POST /admin/login
# Body: { "username": "admin", "password": "from env" }
# Returns: { "access_token": "admin-jwt", "token_type": "bearer" }
Current Implementation Notes
JWT Storage (Temporary — Week 6 Fix)
Current: localStorage (as shown in audit)
Planned Week 6: httpOnly cookie
For now: Keep localStorage, but document the security risk
Token Refresh
Frontend should use InsForge Auth's onAuthStateChange listener
When access_token expires, use refresh_token to get new one
InsForge JS client handles this automatically
Logout
Call supabase.auth.signOut() in frontend
Remove token from localStorage
Optional: Add token to Redis blacklist (for immediate invalidation)
Anti-Hallucination Checklist
Before accepting ANY auth code from the AI, verify:
[ ] NO users table created in FastAPI models
[ ] NO password hashing (bcrypt, argon2, etc.)
[ ] NO JWT creation/issuing in FastAPI
[ ] NO email/password verification in FastAPI
[ ] profiles table has user_id (not id) as link to auth.users
[ ] RLS policy exists on profiles table
[ ] get_current_user validates token, doesn't create one
[ ] Admin auth uses separate secret (ADMIN_SECRET_KEY)
[ ] Admin endpoints use get_admin_user, not get_current_user
Env Vars Required
bash
# Backend (.env.local)
INSFORGE_URL=https://[PROJECT_A_REF].us-east.insforge.app
INSFORGE_JWT_SECRET=[JWT_SECRET_FROM_INSFORGE_DASHBOARD]
INSFORGE_SERVICE_KEY=[SERVICE_KEY]
ADMIN_SECRET_KEY=[generate_random_32_char_string]

# Frontend (.env.local)
NEXT_PUBLIC_INSFORGE_URL=https://[PROJECT_A_REF].us-east.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=[ANON_KEY]
NEXT_PUBLIC_FASTAPI_URL=https://[YOUR_FASTAPI_URL]
Common AI Mistakes & Corrections
Table
Mistake	What AI Says	Correct Response
"I'll create a users table"	STOP. Use auth.users from InsForge. Create profiles table only.
"I'll hash the password"	STOP. InsForge Auth hashes passwords. You never see the plaintext.
"I'll issue a JWT"	STOP. Validate InsForge JWT only. Use jwt.decode(), not jwt.encode().
"I'll build a login endpoint"	STOP. Login is handled by InsForge Auth JS client in frontend.
"The users table needs email"	STOP. Email is in auth.users. Extended data goes in profiles.
