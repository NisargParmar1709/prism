# API_CONTRACT_v2.md
## Prism Backend API — Complete Contract (Wireframe-Aligned)

> **Base URL:** `https://[project-ref].insforge.dev/api/v1`
> **Auth:** Bearer token (JWT from InsForge Auth) in `Authorization: Bearer <token>`
> **Content-Type:** `application/json`

---

## 1. Error Response Shape (Universal)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description",
    "field_errors": {
      "amount": ["Amount must be greater than 0"]
    },
    "request_id": "req_abc123xyz"
  }
}
```

| Code | HTTP | Meaning |
|------|------|---------|
| `VALIDATION_ERROR` | 422 | Request body failed validation |
| `AUTHENTICATION_ERROR` | 401 | Missing/invalid/expired token |
| `AUTHORIZATION_ERROR` | 403 | Valid token, not allowed |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## 2. Authentication (InsForge Auth)

Registration, login, password reset, email verification handled by **InsForge Auth** directly.
Our FastAPI validates the JWT.

### POST /auth/refresh
```json
// Request
{ "refresh_token": "string" }

// Response
{ "access_token": "eyJ...", "expires_in": 3600 }
```

---

## 3. Profiles (Onboarding & Settings)

### GET /users/me
Get current user profile.

**Response:**
```json
{
  "id": "uuid",
  "email": "rahul@iitb.ac.in",
  "full_name": "Rahul Sharma",
  "college": "IIT Bombay",
  "avatar_url": "https://...",
  "currency": "INR",
  "created_at": "2026-08-01T10:00:00Z",
  "onboarding_completed": true
}
```

### PATCH /users/me
Update profile.

**Request:**
```json
{
  "full_name": "Rahul Sharma",
  "college": "IIT Bombay",
  "avatar_url": "https://...",
  "currency": "INR"
}
```

### DELETE /users/me
Delete account and all data. Requires confirmation.

---

## 4. Accounts

### GET /accounts
List accounts.

**Query:** `?include_archived=false`

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "HDFC Savings",
      "type": "bank",
      "last_4_digits": "4821",
      "opening_balance": "5000.00",
      "current_balance": "284350.00",
      "currency": "INR",
      "is_archived": false,
      "is_emergency_fund": false,
      "emergency_target": null,
      "created_at": "2026-08-01T10:00:00Z"
    }
  ],
  "meta": { "total": 3 }
}
```

### POST /accounts
```json
{
  "name": "PhonePe Wallet",
  "type": "wallet",
  "last_4_digits": null,
  "opening_balance": "4500.00",
  "currency": "INR",
  "is_emergency_fund": false,
  "emergency_target": null
}
```

**Types:** `cash`, `bank`, `wallet`, `fd`, `savings`, `emergency`

### GET /accounts/{id}
Includes last 10 transactions.

### PATCH /accounts/{id}
Cannot change `type` after creation.

### DELETE /accounts/{id}
Soft-delete (archive).

---

## 5. Transactions

### GET /transactions
**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `limit` | int | 20 | Items per page (max 100) |
| `account_id` | uuid | — | Filter by account |
| `category_id` | uuid | — | Filter by category |
| `type` | string | — | `income` or `expense` |
| `start_date` | date | — | ISO 8601 |
| `end_date` | date | — | ISO 8601 |
| `search` | string | — | Search description, category, tags |
| `tags` | string[] | — | Filter by tags |
| `status` | string | — | `completed`, `pending` |
| `sort_by` | string | `date` | `date`, `amount`, `created_at` |
| `sort_order` | string | `desc` | `asc` or `desc` |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "account_id": "uuid",
      "account_name": "HDFC Savings",
      "account_type": "bank",
      "category_id": "uuid",
      "category_name": "Food & Dining",
      "category_icon": "🍔",
      "type": "expense",
      "amount": "320.00",
      "date": "2026-08-11",
      "note": "Dinner with friends",
      "tags": ["dining", "weekend"],
      "status": "completed",
      "payment_method": "UPI",
      "created_at": "2026-08-11T19:30:00Z"
    }
  ],
  "meta": {
    "page": 1, "limit": 20, "total": 156, "total_pages": 8,
    "has_next": true, "has_prev": false
  }
}
```

### POST /transactions
```json
{
  "account_id": "uuid",
  "category_id": "uuid",
  "type": "expense",
  "amount": "320.00",
  "date": "2026-08-11",
  "note": "Dinner with friends",
  "tags": ["dining"],
  "status": "completed",
  "payment_method": "UPI"
}
```

**Side Effects:** Recalculate balance, check budget thresholds, invalidate cache.

### GET /transactions/{id}
### PATCH /transactions/{id}
**Cannot change `type` (income↔expense).**

### DELETE /transactions/{id}
Soft delete. Creates audit entry.

---

## 6. Categories

### GET /categories
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Food & Dining",
      "icon": "🍔",
      "color": "#F87171",
      "type": "expense",
      "is_default": true,
      "transaction_count": 45
    }
  ]
}
```

### POST /categories
```json
{
  "name": "Gym",
  "icon": "💪",
  "color": "#A78BFA",
  "type": "expense"
}
```

---

## 7. Budgets

### GET /budgets
**Query:** `?period=2026-08` (YYYY-MM format)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "category_id": "uuid",
      "category_name": "Food & Dining",
      "category_icon": "🍔",
      "amount": "7000.00",
      "spent": "4800.00",
      "remaining": "2200.00",
      "percentage": 68.5,
      "status": "healthy",
      "period": "2026-08"
    }
  ],
  "summary": {
    "total_budgeted": "15000.00",
    "total_spent": "10240.00",
    "total_remaining": "4760.00",
    "days_remaining": 8,
    "daily_allowance": "1733.00"
  }
}
```

**Status logic:**
- `healthy`: < 80%
- `warning`: 80-99%
- `over_limit`: ≥ 100%

### POST /budgets
```json
{
  "category_id": "uuid",
  "amount": "7000.00",
  "period": "2026-08"
}
```

### DELETE /budgets/{id}

---

## 8. Dashboard

### GET /dashboard
**Response:**
```json
{
  "greeting": "Good afternoon, Rahul",
  "date": "2026-07-30",
  "period": "2026-07",

  "primary_account": {
    "id": "uuid",
    "name": "HDFC Savings",
    "type": "bank",
    "last_4_digits": "4821",
    "balance": "284350.00",
    "card_brand": "visa"
  },

  "stats": {
    "total_balance": "44320.00",
    "balance_change": "2400.00",
    "balance_change_type": "increase",
    "income_this_month": "8000.00",
    "income_change": "500.00",
    "spent_this_month": "12800.00",
    "spent_change": "1200.00",
    "savings_rate": 35,
    "savings_amount": "2800.00"
  },

  "budget_health": {
    "spent": "67430.00",
    "limit": "100000.00",
    "percentage": 67.4,
    "days_remaining": 12,
    "daily_allowance": "1733.00"
  },

  "category_distribution": [
    { "name": "Shopping", "amount": "12000.00", "percentage": 18.5 },
    { "name": "Food & Dining", "amount": "8000.00", "percentage": 12.3 },
    { "name": "Utilities", "amount": "5000.00", "percentage": 7.7 },
    { "name": "Transport", "amount": "3000.00", "percentage": 4.6 },
    { "name": "Entertainment", "amount": "2000.00", "percentage": 3.1 }
  ],

  "spending_overview": {
    "period": "July 2026",
    "data": [
      { "date": "2026-07-01", "income": "0", "expense": "2500" },
      { "date": "2026-07-02", "income": "0", "expense": "1800" }
    ]
  },

  "accounts": [
    {
      "id": "uuid",
      "name": "HDFC Savings",
      "type": "bank",
      "balance": "284350.00",
      "change": "12400.00",
      "change_type": "increase"
    }
  ],

  "recent_transactions": [
    {
      "id": "uuid",
      "description": "Swiggy",
      "category": "Food & Dining",
      "category_icon": "🍔",
      "account": "HDFC Savings",
      "type": "expense",
      "amount": "450.00",
      "date": "2026-07-28",
      "status": "completed",
      "payment_method": "UPI"
    }
  ],

  "split_bills": [
    {
      "id": "uuid",
      "name": "Goa Trip Planning",
      "member_count": 4,
      "total": "3400.00",
      "your_balance": "2400.00",
      "balance_type": "owed_to_you"
    }
  ],

  "upcoming": [
    {
      "id": "uuid",
      "name": "Netflix",
      "type": "recurring",
      "frequency": "monthly",
      "amount": "649.00",
      "due_in_days": 2
    },
    {
      "id": "uuid",
      "name": "HDFC FD",
      "type": "fd_maturity",
      "amount": "50000.00",
      "interest": "2340.00",
      "matures_in_days": 23
    }
  ],

  "savings_goals": [
    {
      "id": "uuid",
      "name": "Emergency Fund",
      "icon": "🛡️",
      "target": "300000.00",
      "saved": "185000.00",
      "percentage": 62,
      "monthly_contribution": "15000.00",
      "monthly_target": "15000.00",
      "status": "on_track"
    }
  ]
}
```

---

## 9. Analytics

### GET /analytics/overview
**Query:** `?period=6months&account_id=`

**Response:**
```json
{
  "period": "6months",
  "income_vs_expense": [
    { "month": "Feb 2026", "income": "15000", "expense": "12000" },
    { "month": "Mar 2026", "income": "15000", "expense": "14000" }
  ],
  "spending_breakdown": [
    { "category": "Food", "amount": "4100", "percentage": 32 }
  ],
  "top_categories": [
    { "category": "Food", "amount": "4100", "bar_width": 100 },
    { "category": "Transport", "amount": "2304", "bar_width": 56 }
  ]
}
```

### GET /analytics/spending
**Query:** `?period=month`

**Response:**
```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "Food & Dining",
      "icon": "🍔",
      "total": "4100.00",
      "percentage": 32,
      "transactions": [
        { "description": "Swiggy", "date": "2026-07-28", "amount": "450.00" }
      ]
    }
  ]
}
```

### GET /analytics/trends
**Query:** `?period=month`

**Response:**
```json
{
  "current_month": [
    { "date": "2026-07-01", "amount": "2500" }
  ],
  "previous_month": [
    { "date": "2026-06-01", "amount": "1800" }
  ]
}
```

---

## 10. AI Features

### POST /ai/summary
```json
// Request
{ "period": "2026-08" }

// Response
{
  "summary": "You spent 18% more on food this month, mostly on weekends.",
  "insights": [
    {
      "type": "spending_pattern",
      "message": "Weekend food spending is 2.3x weekday average",
      "severity": "info"
    }
  ],
  "suggestions": [
    "Consider meal prepping on weekdays to reduce delivery costs"
  ],
  "generated_at": "2026-08-11T20:00:00Z"
}
```

### POST /ai/query
```json
// Request
{ "query": "How much did I spend on transport last month?" }

// Response
{
  "query": "How much did I spend on transport last month?",
  "answer": "You spent ₹2,340 on transport in July 2026. This is 15% less than June.",
  "sql_query": "SELECT SUM(amount) FROM transactions WHERE user_id = ? AND category = 'Transport' AND date >= '2026-07-01' AND date < '2026-08-01'",
  "data_source": "verified",
  "confidence": 0.95,
  "generated_at": "2026-08-11T20:00:00Z"
}
```

**Constraints:**
- Max 5 seconds response
- If AI fails: returns `{ "answer": null, "error": "AI temporarily unavailable" }` with 200
- Never exposes raw transaction data

---

## 11. Savings Goals

### GET /savings-goals
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Emergency Fund",
      "icon": "🛡️",
      "target_amount": "300000.00",
      "current_amount": "185000.00",
      "percentage": 62,
      "monthly_contribution": "15000.00",
      "monthly_target": "15000.00",
      "status": "on_track",
      "deadline": "2027-03-01"
    }
  ]
}
```

### POST /savings-goals
```json
{
  "name": "MacBook",
  "icon": "💻",
  "target_amount": "150000.00",
  "monthly_contribution": "10000.00",
  "deadline": "2027-06-01"
}
```

### PATCH /savings-goals/{id}/contribute
```json
{ "amount": "5000.00" }
```

---

## 12. Recurring Rules & Upcoming

### GET /recurring-rules
### POST /recurring-rules
```json
{
  "account_id": "uuid",
  "category_id": "uuid",
  "type": "expense",
  "amount": "649.00",
  "frequency": "monthly",
  "start_date": "2026-08-01",
  "end_date": null,
  "note": "Netflix subscription"
}
```

**Frequency:** `daily`, `weekly`, `biweekly`, `monthly`, `quarterly`, `yearly`

### GET /recurring-rules/upcoming
Returns next 5 upcoming payments + FD maturities.

---

## 13. Notifications

### GET /notifications
**Query:** `?unread_only=false&page=1&limit=20`

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "budget_alert",
      "title": "Budget Warning",
      "message": "You've spent 80% of your Food budget",
      "is_read": false,
      "created_at": "2026-08-11T14:00:00Z",
      "action_url": "/budgets"
    }
  ],
  "unread_count": 3
}
```

### PATCH /notifications/{id}/read
### PATCH /notifications/read-all

---

## 14. Settings

### GET /settings/notifications
```json
{
  "preferences": [
    {
      "alert_type": "budget_80",
      "email": true,
      "in_app": true
    },
    {
      "alert_type": "budget_exceeded",
      "email": true,
      "in_app": true
    },
    {
      "alert_type": "low_balance",
      "email": true,
      "in_app": false
    },
    {
      "alert_type": "recurring_reminder",
      "email": false,
      "in_app": true
    },
    {
      "alert_type": "weekly_summary",
      "email": true,
      "in_app": false
    },
    {
      "alert_type": "ai_insights",
      "email": false,
      "in_app": true
    }
  ]
}
```

### PATCH /settings/notifications
```json
{
  "preferences": [
    { "alert_type": "budget_80", "email": true, "in_app": true }
  ]
}
```

---

## 15. Groups (v2)

### GET /groups
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Hostel Room 204",
      "icon": "🏠",
      "member_count": 4,
      "total_spend": "3400.00",
      "your_balance": "800.00",
      "balance_type": "owed_to_you",
      "member_avatars": ["url1", "url2"]
    }
  ],
  "summary": {
    "total_owed_to_you": "1200.00",
    "total_you_owe": "450.00",
    "active_groups": 3
  }
}
```

### POST /groups
```json
{
  "name": "Goa Trip",
  "icon": "🏖",
  "member_emails": ["riya@example.com", "arjun@example.com"]
}
```

### GET /groups/{id}
### GET /groups/{id}/members
### GET /groups/{id}/expenses

### POST /groups/{id}/expenses
```json
{
  "description": "Dinner",
  "total_amount": "800.00",
  "paid_by": "uuid",
  "category_id": "uuid",
  "split_type": "equal",
  "splits": [
    { "user_id": "uuid", "share_amount": "200.00" }
  ]
}
```

### POST /groups/{id}/settlements
```json
{
  "to_user_id": "uuid",
  "amount": "450.00"
}
```

---

## 16. Admin Endpoints (Separate Base URL)

**Base:** `https://[admin-ref].insforge.dev/admin/api/v1`
**Auth:** Separate JWT secret.

### GET /admin/metrics
```json
{
  "total_users": 142,
  "active_users_7d": 89,
  "active_users_30d": 120,
  "total_transactions": 4520,
  "new_signups_today": 3,
  "last_sync_at": "2026-08-11T19:45:00Z"
}
```

### GET /admin/users
### POST /admin/users/{id}/suspend
### GET /admin/logs
### GET /admin/health

---

## 17. Data Export

### GET /export/transactions.csv
**Query:** `?start_date=2026-07-01&end_date=2026-07-31&account_id=`

**Response:** `text/csv` attachment
```csv
date,account,category,type,amount,note,tags,status
2026-07-28,HDFC Savings,Food & Dining,expense,450.00,Swiggy,dining,completed
```

---

## Pagination Convention

All list endpoints:
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

---

## Rate Limits

| Endpoint Group | Limit | Window |
|----------------|-------|--------|
| Auth | 5 | 15 min per IP + user |
| AI (/ai/*) | 10 | 1 hour per user |
| General API | 100 | 1 min per user |
| Admin | 30 | 1 min per admin |
| Export | 3 | 1 hour per user |
