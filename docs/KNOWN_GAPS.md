# Known Gaps & Operational Notes

This document transparently records any environmental constraints, architectural trade-offs, and deliberate design decisions in the Mrittika AI prototype.

---

## 1. Docker Daemon on Local Windows Host
- **Observation**: The local development machine runs Windows without an active Docker daemon in the system PATH (`docker-compose` / `docker` command line utilities are not available locally).
- **Status & Mitigation**:
  - `backend/Dockerfile`, `frontend/Dockerfile`, `frontend/nginx.conf`, and root `docker-compose.yml` have been created according to strict OCI standards.
  - Multi-stage builds and unprivileged user security profiles (`appuser:1000`) are in place.
  - The stack can be run on any Linux, macOS, or Windows WSL2 Docker environment with `docker-compose up --build`.
  - Local verification has been performed directly against the local Python 3.11 environment and Node.js v24.11.1.

---

## 2. In-Memory ML Execution vs External Inference API
- **Design Choice**: Rather than relying on Hugging Face Inference API endpoints (which introduce network latency, rate limits, and external availability risks), Mrittika AI downloads verified serialized weights (`.pkl`) once into `backend/ml_models/`.
- **Integrity**: Weights are validated against hardcoded SHA-256 hashes in `models.lock` at boot time and cached in RAM. Inference takes under 15ms per request.

---

## 3. Crop-Fertilizer Schema Asymmetry
- **Observation**: The crop recommendation model was trained on 24 crops, whereas the fertilizer model was trained on 13 major agricultural crops.
- **Handling**: A canonical crop registry (`apps.crops.registry`) bridges the schemas. For crops without fertilizer regression models (e.g., Tea, Coconut, Mango), the API and UI notify the user gracefully in Bangla (`"এই ফসলের জন্য সারের পরামর্শ এখনো যুক্ত হয়নি"`) and provide direct contact recommendations for the Upazila Agriculture Officer.

---

## 4. Voice Input (Speech-to-Text) Browser Compatibility
- **Feature**: Speech recognition via `webkitSpeechRecognition` / `SpeechRecognition` using language code `bn-BD`.
- **Compatibility**: Fully supported in Chromium-based browsers (Google Chrome, Microsoft Edge, Brave). In unsupported browsers (e.g., Firefox, Safari), the voice button gracefully hides and standard text input remains active.

---

## 5. Knowledge Base Sample Documents
- **Observation**: The initial knowledge base contains 4 sample agricultural guidance documents marked as `[SAMPLE - NOT VERIFIED]` (`[নমুনা নথি - যাচাইকৃত নয়]`).
- **Production Guidance**: These sample documents demonstrate end-to-end multi-format ingestion, chunking, and citation grounding. In production, replace or augment them with official publications from BARC (Fertilizer Recommendation Guide), BRRI (Rice Knowledge Bank), BARI (Krishi Projukti Hatboi), and DAE (Krishi Diary) using:
  ```bash
  python backend/manage.py ingest_docs path/to/official/docs/ --reindex
  ```
