# Mrittika AI (মৃত্তিকা এআই) - Environment Configuration Guide

This document provides a comprehensive reference for all environment variables used across the Mrittika AI full-stack platform (Django backend, React + Vite frontend, and Docker Compose deployment).

---

## 1. Quick Start

### Local Development Setup
1. Copy the example files:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   cp .env.example .env
   ```
2. Verify configuration health:
   ```bash
   python backend/manage.py check_env
   ```
3. Test your LLM keys (when configured):
   ```bash
   python backend/manage.py check_llm
   ```

> [!NOTE]
> `.env` files in any directory are strictly ignored by Git (`.gitignore`). Never commit API keys, passwords, or production secret keys to version control.

---

## 2. Obtaining Free LLM API Keys

Mrittika AI runs on zero-cost, free-tier LLM APIs with deterministic offline fallbacks.

### A. Groq API Key (Primary Provider)
1. Go to [https://console.groq.com/keys](https://console.groq.com/keys).
2. Sign up or log in with GitHub / Google.
3. Click **Create API Key**, name it `mrittika-dev`, and copy the generated key (`gsk_...`).
4. Paste the key into `backend/.env`:
   ```env
   GROQ_API_KEY=gsk_...
   GROQ_MODEL=openai/gpt-oss-120b
   ```
*Free tier quota*: ~30 requests/minute, ~14,400 requests/day, ~8,000 tokens/minute.

### B. Google Gemini API Key (Secondary Failover Provider)
1. Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey).
2. Sign in with your Google account.
3. Click **Create API Key** and copy the generated key (`AIzaSy...`).
4. Paste the key into `backend/.env`:
   ```env
   GEMINI_API_KEY=AIzaSy...
   GEMINI_MODEL=gemini-2.5-flash-lite
   ```
*Free tier quota*: 15 requests/minute, 1,500 requests/day.

---

## 3. Backend Environment Variables Reference

| Variable Name | Type | Default Value | Description |
|---|---|---|---|
| **Django & Security** | | | |
| `DEBUG` | Boolean | `True` (dev) / `False` (prod) | Enables Django debug mode and stack traces. |
| `SECRET_KEY` | String | `django-insecure-...` | Cryptographic secret for signing sessions and tokens. Must be 50+ chars in production. |
| `ALLOWED_HOSTS` | Comma List | `localhost,127.0.0.1,0.0.0.0,[::1]` | Host/domain names that this Django site can serve. |
| `CORS_ALLOWED_ORIGINS` | Comma List | `http://localhost:5173,http://localhost:3000` | Origins permitted to make cross-origin browser requests. |
| `CSRF_TRUSTED_ORIGINS` | Comma List | `http://localhost:5173,http://localhost:8000` | Origins trusted for unsafe HTTP requests (POST/PUT/DELETE). |
| **Database** | | | |
| `POSTGRES_DB` | String | *(empty = SQLite)* | Name of PostgreSQL database. If empty, Django uses `db.sqlite3`. |
| `POSTGRES_USER` | String | `mrittika_user` | PostgreSQL database username. |
| `POSTGRES_PASSWORD` | String | `mrittika_secure_password_replace_in_prod` | PostgreSQL database user password. |
| `POSTGRES_HOST` | String | `localhost` (dev) / `postgres` (docker) | PostgreSQL host address. |
| `POSTGRES_PORT` | Integer | `5432` | PostgreSQL port number. |
| `DATABASE_URL` | String | *(empty)* | Optional database URL format for 12-factor deployments. |
| **Hugging Face & ML** | | | |
| `HF_REPO_ID` | String | `ripro805/mrittika-ai` | Verified Hugging Face model repository. |
| `HF_REVISION` | String | `main` | Git commit SHA or branch on Hugging Face Hub. |
| `HF_TOKEN` | String | *(empty)* | Optional Hugging Face token for higher download rate limits. |
| `MODEL_DIR` | String / Path | `ml_models` | Local directory storing `.pkl` ML model artifacts. |
| **LLM Provider Layer** | | | |
| `LLM_PROVIDER_ORDER` | Comma List | `groq,gemini` | Priority order for LLM routing and automatic failover. |
| `GROQ_API_KEY` | String | *(empty)* | Groq Cloud API bearer key (`gsk_...`). |
| `GROQ_MODEL` | String | `openai/gpt-oss-120b` | Target Groq model identifier. |
| `GROQ_RPM_SOFT` | Integer | `25` | Soft requests/minute limit before preemptively skipping Groq. |
| `GROQ_RPD_SOFT` | Integer | `13000` | Soft requests/day limit before preemptively skipping Groq. |
| `GROQ_TIMEOUT_SECONDS`| Float | `15.0` | Socket timeout for Groq API calls before retrying/failing over. |
| `GEMINI_API_KEY` | String | *(empty)* | Google AI Studio API key (`AIzaSy...`). |
| `GEMINI_MODEL` | String | `gemini-2.5-flash-lite` | Target Gemini model identifier. |
| `GEMINI_RPM_SOFT` | Integer | `12` | Soft requests/minute limit before preemptively skipping Gemini. |
| `GEMINI_RPD_SOFT` | Integer | `1400` | Soft requests/day limit before preemptively skipping Gemini. |
| `GEMINI_TIMEOUT_SECONDS`| Float | `15.0` | Socket timeout for Gemini API calls before retrying/failing over. |
| `MAX_PROMPT_TOKENS` | Integer | `3000` | Maximum token budget for user context and conversation history. |
| `MAX_OUTPUT_TOKENS` | Integer | `600` | Maximum tokens to generate per reply. |
| **RAG Pipeline & ChromaDB** | | | |
| `EMBEDDING_PROVIDER` | String | `local` | Embedding backend (`local` using `sentence-transformers`). |
| `EMBEDDING_MODEL` | String | `intfloat/multilingual-e5-large` | Sentence Transformer embedding model. |
| `CHROMA_DIR` | String / Path | `chroma_db` | Persistent directory for ChromaDB vector embeddings. |
| `RAG_MIN_SCORE` | Float | `0.85` | Cosine distance threshold. Below threshold triggers Upazila Officer fallback with NO LLM call. |
| `RAG_TOP_K` | Integer | `4` | Number of context chunks retrieved per query. |
| **Throttling & Caps** | | | |
| `CHAT_GLOBAL_RPD` | Integer | `5000` | Daily cap on chat queries across all users to protect free quotas. |
| `THROTTLE_CHAT_ANON` | String | `10/min` | Anonymous user chat rate limit. |
| `THROTTLE_CHAT_USER` | String | `30/min` | Authenticated user chat rate limit. |
| **Weather API** | | | |
| `OPEN_METEO_API_URL` | String | `https://api.open-meteo.com/v1/forecast` | Open-Meteo endpoint for hyperlocal weather. |

---

## 4. Frontend Environment Variables Reference

| Variable Name | Type | Default Value | Description |
|---|---|---|---|
| `VITE_API_BASE_URL` | String | `/api/v1` | Backend API base URL. Use `/api/v1` with Vite proxy or `http://localhost:8000/api/v1`. |
| `VITE_APP_NAME` | String | `Mrittika AI` | Display name of the application. |
| `VITE_APP_VERSION` | String | `1.0.0` | Application release version. |
| `VITE_ENABLE_VOICE_INPUT`| Boolean | `true` | Enables Bangla speech recognition button if Web Speech API is supported. |
| `VITE_ENABLE_SAMPLE_BADGES`| Boolean | `true` | Displays `[নমুনা নথি - যাচাইকৃত নয়]` warning on sample knowledge sources. |

---

## 5. Verification Commands

1. **Audit Environment & Configuration**:
   ```bash
   python backend/manage.py check_env
   ```
2. **Audit LLM Connectivity & Model Availability**:
   ```bash
   python backend/manage.py check_llm
   ```
3. **Ingest Agricultural Knowledge Base**:
   ```bash
   python backend/manage.py ingest_docs backend/apps/assistant/sample_docs/ --reindex
   ```
4. **Evaluate RAG Benchmark**:
   ```bash
   python backend/scripts/eval_rag.py
   ```
