# Mrittika AI (মৃত্তিকা এআই) - Execution Plan

> "Right Crop, Right Fertilizer, Right Guidance - Smarter Farming with AI"
> Bangla-first smart agriculture advisory platform for Bangladeshi farmers.

---

## 1. Project Overview & Architecture
Mrittika AI is a unified agronomic intelligence application comprising:
1. **Crop Recommendation**: Soil & weather input $\rightarrow$ Top-3 crop recommendations with confidence and agronomic rationales.
2. **Smart Fertilizer Advisory**: Crop + soil nutrients $\rightarrow$ Target fertilizer dosages in localized units (kg/bigha, kg/decimal, kg/ha), rule-based application schedules, and soil-health advisories.
3. **Bangla Agricultural Assistant (RAG)**: Retrieval-Augmented Generation chatbot referencing verified agricultural guides with citations and safety fallbacks.
4. **Unified Workflow**: One-tap transition preserving contextual data from Crop Recommendation $\rightarrow$ Fertilizer Advisory $\rightarrow$ AI Assistant.

### High-Level Monorepo Structure
```
mrittika-ai/
├── backend/
│   ├── manage.py
│   ├── mrittika/                 # Project configuration (settings, urls, asgi, wsgi)
│   ├── apps/
│   │   ├── core/                 # Health, readiness, model info, base utils
│   │   ├── accounts/             # Custom user (phone auth), JWT + cookie, RBAC
│   │   ├── crops/                # Canonical crop registry, soil normalizers
│   │   ├── recommendations/      # ML inference, history, reports, safety bounds
│   │   ├── assistant/            # RAG ChromaDB, vector ingest, LLM providers
│   │   ├── weather/              # Open-Meteo client, caching, fallback
│   │   └── feedback/             # User feedback, officer review & corrections
│   ├── ml_models/                # Downloaded weights & lockfile (models.lock)
│   ├── scripts/
│   │   ├── inspect_models.py     # Step 0 inspection of HF pickles
│   │   ├── fetch_models.py       # Management cmd / standalone HF downloader
│   │   ├── compute_caps.py       # Fertilizer upper bound calculation from CSV
│   │   └── eval_rag.py           # Evaluation pipeline for RAG with metrics
│   ├── tests/                    # Pytest suite (unit, model contract, api, security)
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── assets/               # Fonts, logos, icons
│   │   ├── components/           # UI elements (Navbar, Footer, Modals, Badges)
│   │   ├── pages/                # Landing, Crop, Fertilizer, Assistant, History, etc.
│   │   ├── context/              # Auth, Language (i18n), UnifiedFlow
│   │   ├── services/             # Axios API clients
│   │   └── locales/              # bn and en translation files
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── Dockerfile
├── docs/
│   ├── PLAN.md                   # This master plan
│   ├── DECISIONS.md              # Architectural and design decision records
│   ├── MODEL_CONTRACT.md         # Inspected ML pickle schema and versions
│   ├── SECURITY.md               # Threat model, RBAC matrix, security controls
│   ├── TESTING.md                # Real test execution logs & coverage reports
│   ├── LIMITATIONS.md            # Agronomic and synthetic data limitations
│   ├── ACKNOWLEDGEMENTS.md       # Attribution of models, tools, and data
│   ├── KNOWN_GAPS.md             # Documented compromises or offline fallbacks
│   └── eval_questions.jsonl      # 20 Bangla evaluation questions for RAG
├── docker-compose.yml
└── README.md
```

---

## 2. Implementation Phases

### Phase 0: Mandatory Inspection & Contract (Step 0)
- Write `backend/scripts/inspect_models.py`.
- Download `mrittika_crop_model.pkl`, `mrittika_fertilizer_model.pkl`, `metrics.json`, `fertilizer_metrics.json`, and CSV fixtures from Hugging Face (`ripro805/mrittika-ai`) using the provided access token.
- Inspect object types, pipeline transformers, feature names, dtypes, target classes, and framework versions.
- Compute SHA-256 digests and create `backend/ml_models/models.lock`.
- Generate `docs/MODEL_CONTRACT.md` detailing the contract and exact dependencies.
- Compute safety caps from `bangladesh_fertilizer_recommendation.csv` and export to `backend/apps/recommendations/data/fertilizer_caps.json`.

### Phase 1: Environment & Dependency Management
- Setup Python environment with exact pinned dependencies matching model requirements (`scikit-learn`, `xgboost`, `lightgbm`, `joblib`, `pandas`, `numpy`, `django`, `djangorestframework`, `djangorestframework-simplejwt`, `django-cors-headers`, `django-csp`, `drf-spectacular`, `argon2-cffi`, `reportlab`, `chromadb`, `sentence-transformers`, `pytest`, `ruff`, `bandit`).
- Initialize frontend with Vite + React 18 + TypeScript + Tailwind CSS + Lucide icons + TanStack Query + React Router + i18next + Recharts.

### Phase 2: Data Models & Backend Architecture
- Custom User model: Phone number as primary identifier/username, full name, district, upazila, role (`FARMER`, `OFFICER`, `ADMIN`), `is_verified` boolean for officers.
- Canonical Crop Registry: Slug, Bangla name, English name, crop model name, fertilizer model name, supported flags.
- Recommendations & History: `CropRecommendation` and `FertilizerPlan` with input snapshots, predicted top-3 / fertilizer amounts, rule outputs.
- Feedback & Correction: Feedback entries with ratings, flags, officer correction notes.

### Phase 3: ML Inference Engine & Safety Guardrails
- Model Loader: Strict Hugging Face download verification against `models.lock`, singleton in-memory caching.
- Canonical Crop Normalizer & Soil Type Normalizer handling mismatches (e.g., "Aman Rice" $\leftrightarrow$ "Rice_Aman", "Silty Loam" $\leftrightarrow$ "Silt Loam").
- Crop Inference: Pipeline execution, `predict_proba`, top-3 sorting with percentage confidence.
- Fertilizer Inference: XGBoost plan classifier + LightGBM multi-target regressor with missing value imputation.
- Unit Conversion: kg/ha $\rightarrow$ kg/bigha ($\times 0.13355$) and kg/decimal ($\times 0.004047$), total area multiplier.
- Safety Layer: Negative clipping ($\ge 0$), cap enforcement ($1.05 \times \text{train\_max}$), contextual conditional display (gypsum/zinc/lime/compost), mandatory agronomic disclaimer.
- Rule-based indicative application schedules and soil-health recommendations based on crop groups.

### Phase 4: Weather Integration
- Open-Meteo API client fetching temperature, relative humidity, and precipitation forecast by district coordinates.
- In-memory/Redis 30-minute caching.
- 5-second timeout with graceful fallback to default seasonal climatology on network failure.

### Phase 5: Bangla Agricultural Assistant (RAG)
- ChromaDB vector storage with multilingual embedding model (`sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` or `intfloat/multilingual-e5-large` with passage/query prefixes).
- Ingestion management command: `python manage.py ingest_docs <path>` supporting chunking with overlap and source metadata.
- Provider abstraction: `mock` (deterministic for offline/tests), `gemini`, `openai_compatible`, `anthropic`.
- Grounded prompt enforcing strict adherence to retrieved text, citation formatting `[source, page]`, pesticide safety boundaries, and Upazila Agriculture Officer fallback.
- Evaluation script `eval_rag.py` running benchmark questions from `docs/eval_questions.jsonl`.

### Phase 6: PDF Advisory Generation
- Single-page agronomic advisory PDF generator using ReportLab.
- Embedded open-source `Noto Sans Bengali` font with Bengali HarfBuzz/bidi complex text rendering.
- Unit test verifying embedded Bengali glyph rendering.

### Phase 7: REST API & Security
- Endpoints: Auth (register, login, refresh, logout, me), Meta options, Crop recommend, Fertilizer recommend, Weather, Chat, Feedback, Officer review, History, PDF download, Ready/Health, Model info.
- Authentication: Short-lived access JWT (15m), httpOnly SameSite=Lax refresh cookie with rotation & blacklist.
- Throttling: IP-based rate limiting on anonymous ML/Chat endpoints.
- Role-Based Access Control (RBAC) tests and IDOR checks.

### Phase 8: Frontend Implementation
- Mobile-first, responsive, accessible UI in Tailwind CSS with earthy green/soil palette.
- Bangla-first UI with instant English toggle (`react-i18next`).
- Unified Workflow: Crop result $\rightarrow$ Prefill Fertilizer $\rightarrow$ Carry context to Assistant.
- Unit conversion switch (kg/bigha, kg/decimal, kg/ha).
- District weather auto-fill button.
- Web Speech API integration for Bangla voice input.
- Officer dashboard for auditing flagged responses.

### Phase 9: Testing & Verification
- Pytest test suite: Unit tests, Model Contract tests (20 sample rows from real CSVs), API validation & throttling tests, RBAC/IDOR tests, PDF test, weather fallback.
- Smoke test comparing crop model accuracy on CSV with `metrics.json`.
- Frontend Vitest + RTL tests.
- Playwright E2E smoke tests for core workflows.
- Static analysis: Ruff, Bandit, ESLint, TypeScript check.

### Phase 10: Containerization & Final Verification
- Dockerfile for backend, frontend, and PostgreSQL in `docker-compose.yml`.
- GitHub Actions CI workflow.
- Seed command generating demo users.
- Live verification and comprehensive verification report.
