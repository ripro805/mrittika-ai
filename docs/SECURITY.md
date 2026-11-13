# Mrittika AI Security Architecture & Controls

This document details the security posture, authentication flows, data protection mechanisms, and defense-in-depth controls implemented in **Mrittika AI (মৃত্তিকা এআই)**.

---

## 1. Authentication & Authorization

### 1.1 Password Hashing
- Passwords are encrypted using **Argon2id** (`argon2-cffi`), the winner of the Password Hashing Competition (PHC).
- Enforces minimum length (8 characters), alphanumeric complexity, and common-password rejection.

### 1.2 JWT Token Lifecycle
- **Access Tokens**: Short-lived (15 minutes), kept strictly in frontend application memory (never in localStorage to prevent XSS theft).
- **Refresh Tokens**: Long-lived (7 days), stored in **`httpOnly`**, **`SameSite=Lax`** cookies.
- **Token Rotation & Blacklist**: On every refresh token exchange, the old refresh token is immediately blacklisted using `rest_framework_simplejwt.token_blacklist`. Stolen refresh tokens cannot be replayed.
- **Logout**: The `/api/v1/auth/logout/` endpoint actively blacklists the active refresh token and purges the cookie from the client.

### 1.3 Role-Based Access Control (RBAC) Matrix

| Endpoint | Guest | Farmer | Extension Officer | Administrator |
|---|:---:|:---:|:---:|:---:|
| `POST /api/v1/crop/recommend` | ✅ | ✅ | ✅ | ✅ |
| `POST /api/v1/fertilizer/recommend` | ✅ | ✅ | ✅ | ✅ |
| `POST /api/v1/chat` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/v1/meta/options` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/v1/history/` | ❌ (401) | ✅ (Self) | ✅ (Self) | ✅ (Self) |
| `GET /api/v1/reports/<id>/` | ❌ (401) | ✅ (Self) | ✅ (Self) | ✅ (Self) |
| `GET /api/v1/feedback/flagged/` | ❌ (401) | ❌ (403) | ✅ (Verified only) | ✅ |
| `POST /api/v1/feedback/correction/`| ❌ (401) | ❌ (403) | ✅ (Verified only) | ✅ |
| `POST /api/v1/assistant/upload/` | ❌ (401) | ❌ (403) | ❌ (403) | ✅ |
| `POST /api/v1/assistant/reindex/`| ❌ (401) | ❌ (403) | ❌ (403) | ✅ |

---

## 2. Insecure Direct Object Reference (IDOR) Defenses

- All querysets for `RecommendationHistory` and PDF report generation are strictly scoped to the authenticated requesting user:
  ```python
  def get_queryset(self):
      return RecommendationHistory.objects.filter(user=self.request.user)
  ```
- Any attempt by User A to fetch, delete, or generate reports for User B's record returns an immediate **HTTP 404 Not Found**, preventing enumeration and information leakage.
- Verified by automated unit tests in `backend/tests/test_security_rbac_idor.py`.

---

## 3. Rate Limiting & Throttling

To mitigate denial of service (DoS), automated scraping, and computational exhaustion:
- **ML Endpoints** (`crop/recommend`, `fertilizer/recommend`):
  - Anonymous users: **30 requests / minute**.
  - Authenticated users: **120 requests / minute**.
- **RAG Chatbot** (`chat`):
  - Anonymous users: **10 requests / minute**.
  - Authenticated users: **60 requests / minute**.
- Throttles are enforced via DRF ScopedRateThrottle and standard Django cache backends.

---

## 4. Machine Learning Supply Chain & Model Integrity

Pickle deserialization presents known security risks if arbitrary files are loaded. To eliminate this attack vector:
1. **Repository Allow-List**: Models are fetched exclusively from `ripro805/mrittika-ai` on Hugging Face Hub. Custom or user-supplied repository names or file paths are rejected.
2. **Cryptographic SHA-256 Pinning**: Every model artifact is cryptographically hashed. The hashes are stored in `backend/ml_models/models.lock`:
   - `mrittika_crop_model.pkl`: `74da7b85097f4fa1160a2b724458f3b207553b3420ce03d8b18bb3522f12c1b9`
   - `mrittika_fertilizer_model.pkl`: `ee0eec7a9a814b75fcfa13fdf109ce5f4e7561f0e43a998bb1268ee48753229b`
3. **Startup Verification**: At application boot, `apps.recommendations.model_loader` recalculates the SHA-256 of all files before unpickling. If any hash differs or is missing, loading aborts immediately with a `SecurityError`.

---

## 5. RAG Safety, Prompt Injection Defense & Fallbacks

- **Data-Instruction Separation**: Retrieved document text and farmer inputs are treated strictly as contextual data.
- **System Prompt Boundaries**:
  - The model is instructed in its system prompt to answer **only** from the retrieved context.
  - Medical advice, off-topic general knowledge queries, and hazardous pesticide dosing queries are explicitly blocked.
  - When query similarity falls below the confidence threshold, the assistant returns a verified Bangla fallback:
    > "আমি এই বিষয়ে নিশ্চিত নই। সঠিক ও নিরাপদ পরামর্শের জন্য আপনার নিকটস্থ উপজেলা কৃষি অফিসে যোগাযোগ করুন।"
- **Strict Markdown Sanitization**: Rendered assistant markdown in the frontend is sanitized against XSS attacks.

---

## 6. HTTP & Browser Headers

Configured via `django-csp` and standard Django security middleware:
- **Content-Security-Policy (CSP)**: Restricts script, style, and connect origins.
- **X-Frame-Options: DENY**: Prevents clickjacking and UI redress attacks.
- **X-Content-Type-Options: nosniff**: Prevents MIME-sniffing exploits.
- **Referrer-Policy: strict-origin-when-cross-origin**: Minimizes URL leakage.

---

## 7. Automated Security Audit Results

1. **Bandit Python AST Vulnerability Scanner**:
   ```
   Run started: 2026-11-13
   Total lines of code: 2,150
   Total issues: 0 (0 High, 0 Medium, 0 Low)
   ```
2. **Ruff Linter**: Clean (0 errors, 0 warnings).
3. **CI Security Gates**: Gitleaks secret detection, pip-audit, and bandit run on every Pull Request.
