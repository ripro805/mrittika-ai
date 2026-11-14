# API Reference: OpenAPI & REST Endpoints

All endpoints are versioned under `/api/v1/` and documented via OpenAPI 3.0 at `/api/docs/`.

---

## 1. Authentication & Profile
- `POST /api/v1/auth/register`: Register new farmer or officer account.
- `POST /api/v1/auth/login`: Authenticate via phone and password; returns JWT access token and sets httpOnly refresh cookie.
- `POST /api/v1/auth/refresh`: Rotate refresh token and obtain fresh access token.
- `POST /api/v1/auth/logout`: Blacklist refresh token and clear auth cookies.
- `GET /api/v1/me`: Retrieve current user profile.
- `PATCH /api/v1/me`: Update user district, upazila, or name.

---

## 2. Core Metadata & Health
- `GET /api/v1/health/`: Service liveness probe (200 OK).
- `GET /api/v1/ready/`: Readiness probe checking Neon database connection and ML model artifacts.
- `GET /api/v1/model-info/`: Active ML model architectures, versions, and validation metrics.
- `GET /api/v1/meta/options`: Canonical crop list, 20 Bangladesh districts, soil types, and seasons.
- `GET /api/v1/weather?district=<name>`: Live Open-Meteo or regional AEZ climate data.

---

## 3. Advisory & Recommendations
- `POST /api/v1/crop/recommend`: Predict top-3 crops given soil nutrients and environmental parameters.
- `POST /api/v1/fertilizer/recommend`: Compute Urea, TSP, MoP, and Compost dosages, stage splits, and costs.
- `GET /api/v1/history`: List saved recommendations for authenticated user.
- `GET /api/v1/history/<id>`: Detailed inputs and outputs for specific recommendation.
- `GET /api/v1/report/<id>.pdf`: Download formal agricultural advisory PDF.

---

## 4. Portals Scoped Endpoints
- `GET /api/v1/farmer/overview`: Farmer KPI metrics, district weather, seasonal tip, recent recommendations.
- `GET /api/v1/officer/overview`: Officer KPI summary, pending flagged answers, resolution metrics.
- `GET /api/v1/officer/feedback/flagged`: Filterable list of flagged chatbot responses.
- `POST /api/v1/officer/feedback/<id>/correction`: Submit authoritative officer correction.
- `GET /api/v1/officer/analytics`: Regional crop query frequency and rating distribution.
- `GET /api/v1/admin/overview`: Executive platform statistics, model status, recent audit logs.
- `GET /api/v1/admin/users`: Searchable and role-filtered user management list.
- `PATCH /api/v1/admin/users/<id>`: Toggle user active status, update role, or verify officer.
- `GET /api/v1/admin/documents/`: RAG document registry and chunk telemetry.
- `POST /api/v1/admin/reindex/`: Trigger full vector store re-indexing.
- `GET /api/v1/admin/activity-logs`: Comprehensive system activity audit logs.
