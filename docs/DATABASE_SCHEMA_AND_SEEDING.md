# Database Schema & Idempotent Seeding Report

## 1. Cloud Database Infrastructure
- **Engine**: PostgreSQL 16 (Hosted on Neon Serverless Cloud).
- **Pooling**: AWS us-west-2 pooler endpoint with SSL mode enabled.
- **ORM**: Django 5.1 with connection pooling and health checks.

---

## 2. Relational Schema & Models

```
 ┌────────────────┐         1:N         ┌─────────────────────────┐
 │   accounts     │ ──────────────────► │  recommendations_history│
 │     User       │                     └─────────────────────────┘
 └───────┬────────┘
         │
         │ 1:N                      1:N
         ├────────────────────► ┌─────────────────────────┐
         │                      │    assistant_session    │
         │                      └────────────┬────────────┘
         │                                   │ 1:N
         │                                   ▼
         │                      ┌─────────────────────────┐
         │                      │    assistant_message    │
         │                      └─────────────────────────┘
         │ 1:N
         ├────────────────────► ┌─────────────────────────┐
         │                      │        feedback         │
         │                      │  (flagged & corrected)  │
         │                      └─────────────────────────┘
         │ 1:N
         └────────────────────► ┌─────────────────────────┐
                                │       activity_log      │
                                └─────────────────────────┘
```

---

## 3. Seed Execution Metrics (`seed_master_demo.py`)
The idempotent seeding command `python manage.py seed_master_demo` successfully generated:

- **Users**: 270 Accounts
  - 1 Super Admin (`01700000001` / `Admin@123456`)
  - 2 Regional Admins (`01700000010`, `01700000011` / `Admin@123456`)
  - 15 Extension Officers across 8 Divisions (`01710000001` - `01710000015` / `Officer@123456`)
  - 251 Farmers across 20 Agricultural Districts (`01720000001` - `01720000250` / `Farmer@123456`)
- **Recommendations**: 3,707 Records
  - 2,104 Crop suitability recommendations
  - 1,603 Fertilizer dosage plans
- **Assistant Conversations**:
  - 523 Persistent chat sessions
  - 1,702 Conversational turns
- **Quality & Feedback**:
  - 320 Feedback submissions
  - 64 Flagged items
  - 32 Officer-reviewed and resolved corrections
- **Audit Logs**:
  - 1,100 Activity audit entries spanning user logins, model inferences, and officer reviews.
