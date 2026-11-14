# RAG Agricultural Assistant & Chatbot Pipeline

## 1. Overview
The Mrittika AI Bangla Agricultural Assistant provides contextual agronomic advisory grounded in official research publications from BARC, BRRI, and BARI.

---

## 2. RAG Retrieval Architecture
```
User Query (Bangla/English)
         │
         ▼
[Embedding Model: multilingual-e5-large] ───► [1024-dim Vector]
                                                     │
                                                     ▼
                                           [ChromaDB Local Vector DB]
                                                     │
                                            (Cosine Similarity > 0.85)
                                                     │
                             ┌───────────────────────┴───────────────────────┐
                             │ Top-4 Context Chunks                          │ Below Threshold / General Query
                             ▼                                               ▼
               [SYSTEM_PROMPT_RAG_BN]                          [SYSTEM_PROMPT_GENERAL_BN]
                             │                                               │
                             └───────────────────────┬───────────────────────┘
                                                     ▼
                                          [LLM Failover Router]
                                                     │
                                     ┌───────────────┴───────────────┐
                                     │ Primary                       │ Failover
                                     ▼                               ▼
                           Groq (gpt-oss-120b)              Google Gemini (2.5-flash-lite)
                                     │                               │
                                     └───────────────┬───────────────┘
                                                     ▼
                                      Streaming SSE Response to Client
```

---

## 3. Grounded Knowledge Base
The assistant indexes authoritative publications:
1. `BARC_Fertilizer_Recommendation_Guide_2024.pdf`: Soil health guidelines, nutrient management across 30 AEZs.
2. `BRRI_Modern_Rice_Cultivation_Guide.pdf`: Pest, disease, and seedling management for Aman, Boro, and Aus.
3. `BARI_Vegetable_Production_Manual.pdf`: High-value horticultural crops and IPM practices.
4. `DAE_Agricultural_Extension_Manual.pdf`: Upazila-level agronomic advisories and weather precautions.

---

## 4. LLM Router & Circuit Breaker Guard
- **Primary LLM**: Groq Free-Tier running `openai/gpt-oss-120b` (low-latency inference, ~400ms TTFT).
- **Secondary LLM**: Google Gemini `gemini-2.5-flash-lite`.
- **Circuit Breaker**: If 5 consecutive requests fail or time out (>15s), the circuit opens for 60 seconds and requests automatically fall back to Gemini.
- **Safety Fallback**: Any query involving hazardous chemical toxicity or off-label pesticide usage prompts an immediate referral to the local Upazila Agriculture Officer.
