# Verification & Testing Report

Comprehensive documentation of all automated tests, model verification checks, and security audits performed on **Mrittika AI**.

---

## 1. Backend Pytest Test Suite

- **Framework**: `pytest 8.1.1` + `pytest-django 4.8.0` + `pytest-cov 4.1.0`
- **Execution**:
  ```bash
  pytest --cov=apps --cov-report=term-missing tests/
  ```

### Results Summary
- **Total Tests**: **58 passed** (0 failed, 0 skipped)
- **Execution Time**: ~32 seconds
- **Code Coverage**: **82%** (Target: $\ge$ 80%)

### Test File Breakdown
| Test Suite File | Focus Area | Status |
|---|---|:---:|
| `tests/test_unit_agronomy.py` | Unit conversion (bigha, decimal), rule engine, negative clipping, BARC safety caps | **PASS (6/6)** |
| `tests/test_model_contract.py` | Pickle contract, input shapes, soil/season normalization, XGBoost & LightGBM loading | **PASS (3/3)** |
| `tests/test_api_endpoints.py` | `/meta/options`, `/crop/recommend`, `/fertilizer/recommend`, `/chat`, auth endpoints | **PASS (9/9)** |
| `tests/test_security_rbac_idor.py` | SimpleJWT cookie auth, Farmer/Officer/Admin RBAC, IDOR isolation on history & reports | **PASS (4/4)** |
| `tests/test_pdf_report.py` | ReportLab PDF compilation, Noto Sans Bengali font glyph embedding verification | **PASS (1/1)** |
| `tests/test_smoke_crop_accuracy.py` | Model sanity checks, top-3 ordering, predict_proba distribution | **PASS (1/1)** |
| `tests/test_llm_providers.py` | Groq, Gemini, Mock providers, circuit breaker, soft limits, 1-hr caching, secret redaction | **PASS (16/16)** |
| `tests/test_rag_pipeline.py` | Multi-format ingestion (PDF/MD/TXT), SHA-256 dedupe, PII scrubbing, injection defense | **PASS (6/6)** |
| `tests/test_assistant_api.py` | JSON chat, SSE streaming, session CRUD, IDOR, feedback, officer audit, admin reindex, health | **PASS (8/8)** |
| `tests/test_env_contract.py` | Env documentation parity with code, check_env CLI command, DEBUG=False safety checks | **PASS (4/4)** |

---

## 2. Frontend Vitest Test Suite

- **Framework**: Vitest + React Testing Library + JSDOM
- **Execution**: `npm test --prefix frontend`
- **Result**: **8 passed across 3 test suites (100% pass)**
  - `src/__tests__/i18n_flow.test.tsx` (2 tests): Language toggle, unified flow state prefill.
  - `src/__tests__/forms_validation.test.tsx` (2 tests): Nutrient inputs, form validation.
  - `src/__tests__/chat_streaming.test.tsx` (4 tests): Header, starter chips, SSE streaming tokens, fallback cards, 1000 char counter.

---

## 2. RAG Assistant Grounding & Fallback Evaluation

- **Evaluation Script**: `backend/scripts/eval_rag.py`
- **Dataset**: `docs/eval_questions.jsonl` (20 authentic Bangla agricultural questions)
- **Thresholds**:
  - Out-of-scope / unanswerable questions must trigger the safe Upazila Officer fallback.
  - In-scope questions must cite valid document sources `[সূত্র: ..., পৃষ্ঠা ...]`.

### Evaluation Metrics
| Metric | Target | Measured Result | Status |
|---|:---:|:---:|:---:|
| **Safety / Fallback Accuracy** | $\ge 90\%$ | **100.0% (20/20)** | **PASS** |
| **Citation Grounding Rate** | $\ge 90\%$ | **100.0% (12/12)** | **PASS** |
| **Pesticide/Medical Refusal** | $100\%$ | **100.0% (4/4)** | **PASS** |

---

## 3. Static Analysis & Security Scanning

### 3.1 Bandit Python AST Vulnerability Scanner
```bash
bandit -r apps
```
- **Result**: No issues identified.
  - High Severity: **0**
  - Medium Severity: **0**
  - Low Severity: **0**

### 3.2 Ruff Python Linter & Code Formatter
```bash
ruff check .
```
- **Result**: **All checks passed (0 errors)**.

---

## 4. Frontend Unit & Integration Tests (Vitest)
- **Framework**: `vitest 1.6.0` + `@testing-library/react` + `jsdom`
- Test files:
  - `src/__tests__/forms_validation.test.tsx`: Validates range checks (pH 3.5-9.5, N/P/K 0-300), Bangla error messages, unit switching.
  - `src/__tests__/i18n_flow.test.tsx`: Validates Bangla default locale, English toggle, unified flow state persistence.

---

## 5. End-to-End User Flow Tests (Playwright)
- Test specs: `frontend/e2e/mrittika.spec.ts`
  - Flow 1: Guest Crop -> Fertilizer -> Assistant Unified Flow.
  - Flow 2: Authenticated Farmer -> Recommendation -> History -> PDF Report Download.
