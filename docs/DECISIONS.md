# Architectural Decision Records (ADRs) - Mrittika AI

This document logs significant technical, architectural, and design choices made during the development of Mrittika AI, adhering to the principle of autonomous execution and safe, verifiable choices.

---

### ADR-001: Monorepo Structure and Isolation
- **Context**: The project requires a full-stack system with Django backend, React frontend, ML models, RAG documents, and documentation.
- **Decision**: Adopt a clear monorepo structure with `/backend`, `/frontend`, `/docs`, and root orchestration (`docker-compose.yml`, `README.md`).
- **Rationale**: Simplifies co-located end-to-end testing, unified CI/CD, shared documentation, and atomic versioning.

### ADR-002: Authentication Architecture & Token Security
- **Context**: Both mobile/PWA web clients and API consumers require secure session management with role-based access (Farmer, Officer, Admin) and guest access.
- **Decision**: 
  - Access tokens (lifetime: 15 minutes) are passed in Authorization headers.
  - Refresh tokens are transmitted and rotated via `httpOnly`, `SameSite=Lax`, `Secure` (in production) cookies to eliminate XSS token theft.
  - SimpleJWT Token Blacklist is enabled to ensure complete revocation upon logout.
  - Argon2 password hashing is configured as the default password hasher in Django.

### ADR-003: Model Storage, Checksums, and Hugging Face Download Strategy
- **Context**: The ML models reside in the Hugging Face repository `ripro805/mrittika-ai`. Models must be downloaded safely without executing arbitrary remote code or allowing unverified files.
- **Decision**:
  - The repository ID `ripro805/mrittika-ai` is strictly allow-listed in the code.
  - Models are downloaded via `huggingface_hub.hf_hub_download` using the pinned revision (default `main`).
  - Expected SHA-256 digests are recorded in `backend/ml_models/models.lock`.
  - Upon startup or manual fetch, the checksum of each pickle file is verified before `joblib.load()` is executed. If a hash mismatch occurs, loading immediately terminates with a security error.

### ADR-004: Canonical Crop & Soil Normalization Layer
- **Context**: The crop recommendation model outputs 24 crop classes (e.g., "Aman Rice", "Wheat", etc.), while the fertilizer model only supports a subset with different naming conventions (e.g., "Rice_Aman", "Rice_Aus", "Rice_Boro"). Similarly, soil names exhibit casing and spelling differences ("Silty Loam" vs "Silt Loam").
- **Decision**:
  - Implement a centralized `CanonicalCropRegistry` mapping standard slugs (e.g. `rice_aman`, `wheat`, `potato`) to Bangla display names, English names, Crop Model labels, and Fertilizer Model labels.
  - If a recommended crop is not in the fertilizer training domain, return a clear Bangla message: *"এই ফসলের জন্য সারের পরামর্শ এখনো যুক্ত হয়নি"* and disable the direct fertilizer transition button in the UI.
  - Implement a soil normalization dictionary converting variants to exact categorical values expected by each model pipeline.

### ADR-005: Fertilizer Safety Capping and Unit Conversion
- **Context**: Regressors can occasionally produce anomalous out-of-distribution values or negative numbers. Furthermore, Bangladeshi farmers measure land in Bigha and Decimal, whereas models predict in kg/ha.
- **Decision**:
  - Calculate empirical upper bounds per crop for each fertilizer from the training CSV (`bangladesh_fertilizer_recommendation.csv`) multiplied by a 1.05 safety buffer.
  - Clip all negative predictions to 0.0.
  - Provide exact standard conversions: $1\text{ ha} = 7.4878\text{ bigha} \implies 1\text{ kg/ha} = 0.13355\text{ kg/bigha}$; $1\text{ ha} = 247.105\text{ decimals} \implies 1\text{ kg/ha} = 0.004047\text{ kg/decimal}$.
  - Support user land area multipliers for total requirement calculation.
  - Attach an explicit agricultural disclaimer to all outputs.

### ADR-006: RAG Vector Store & Provider Abstraction
- **Context**: The Bangla Assistant requires grounded Q&A over agricultural extension documents. Offline and automated test environments must run without external network or API keys.
- **Decision**:
  - Use ChromaDB embedded in local persistent mode (`backend/chroma_db`).
  - Use `sentence-transformers` with multilingual embedding models (`intfloat/multilingual-e5-large` or fallback `paraphrase-multilingual-MiniLM-L12-v2`) with query/passage task prefixes.
  - Provide a pluggable LLM provider layer supporting `mock` (deterministic, rule-based answering from retrieved chunks), `gemini`, `anthropic`, and `openai_compatible`.
  - Implement prompt-injection defenses: document text and user queries are strictly interpolated as passive data tags (`<context>`, `<question>`), never system instructions.
  - Enforce fallback to Upazila Agriculture Officer whenever retrieval confidence is below threshold or out-of-domain.

### ADR-007: Bangla PDF Font Rendering
- **Context**: Reports generated with ReportLab fail to render Indic/Bangla scripts properly unless TTF fonts with proper Unicode character mapping are registered.
- **Decision**:
  - Embed the open-source `Noto Sans Bengali` (SIL Open Font License) directly in the backend repository.
  - Register the font with ReportLab's `pdfmetrics` and wrap strings with proper formatting.
  - Provide automated tests verifying that the resulting PDF contains embedded Bengali subset fonts and valid glyph streams.

### ADR-008: Dual Free-Tier LLM Architecture (Groq + Gemini) with Circuit Breaker and Soft Limits
- **Context**: Mrittika AI must run autonomously on free-tier LLM providers without user friction or unexpected 500 errors when free limits (RPM/RPD) are encountered.
- **Decision**:
  - Implement a prioritized failover router (`GroqProvider` -> `GeminiProvider` -> `Mock/Retrieval-only`).
  - Introduce in-process sliding-window soft counters (`GROQ_RPM_SOFT`, `GEMINI_RPM_SOFT`, `GROQ_RPD_SOFT`, `GEMINI_RPD_SOFT`) to skip providers before hard 429 locks.
  - Implement a 5-failure / 60-second circuit breaker and 1x jittered retry.
  - Cache identical responses (query + context hash) for 1 hour using Django's cache framework.
  - Suffix with automatic degradation to structured source excerpts with Upazila Agriculture Officer fallback (`fallback=True`) if all APIs are exhausted.

### ADR-009: Pre-LLM PII Sanitization, Token Budgeting, and Injection Defense
- **Context**: User messages may inadvertently contain personal identifiers (phone numbers, emails, NIDs). Furthermore, LLM context windows must respect Groq's ~8k TPM free-tier quota while protecting against prompt injections.
- **Decision**:
  - Sanitize all user messages with regex scrubbers before any LLM prompt construction; explicitly omit user names, phone numbers, and coordinates.
  - Enforce strict token budgeting ($top\_k = 4$ chunks, maximum 4 history turns, $MAX\_PROMPT\_TOKENS = 3000$, $MAX\_OUTPUT\_TOKENS = 600$).
  - System prompt rigorously tags user input and document content as passive data blocks, with strict refusal for pesticide dosing and medical inquiries.

### ADR-010: Hybrid Session Persistence Strategy
- **Context**: Logged-in users require conversational continuity and history recall, whereas guest visitors should enjoy low latency without database clutter.
- **Decision**:
  - For authenticated requests (`User.is_authenticated`), persist sessions (`AssistantSession`) and messages (`AssistantMessage`) in the database with strict IDOR ownership controls.
  - For unauthenticated/guest sessions, handle statefully on the client with transient in-memory session IDs, saving DB writes.

### ADR-011: Streaming Transport via Server-Sent Events (SSE)
- **Context**: Low-latency token streaming is required for interactive Bangla responses over standard HTTP/1.1 and HTTP/2 without the overhead of WebSocket state management.
- **Decision**:
  - Implement `/api/v1/assistant/chat/stream/` emitting Server-Sent Events (`event: token`, `event: sources`, `event: done`, `event: error`).
  - Standardize frontend client consumption using native `fetch` and `ReadableStream` with `AbortController` cancellation.


### ADR-012: Environment Variable Standardization & check_env Management Command
- **Context**: The application relies on multiple configurations across Django, database, Hugging Face, Groq, Gemini, and ChromaDB. Mismatches, missing variables, or insecure production settings can lead to runtime crashes or security vulnerabilities.
- **Decision**:
  - Centralize configuration into `.env.example` templates for root, `backend/`, and `frontend/`.
  - Strictly ignore all `.env` files in git across all directories via `.gitignore` (`.env`, `**/.env`, `**/.env.*`).
  - Introduce `python manage.py check_env` to validate required settings, warn on weak keys when `DEBUG=False`, report LLM status, and check ML model availability.
  - Implement contract tests (`test_env_contract.py`) ensuring every `os.getenv` in code is documented in `backend/.env.example`.
