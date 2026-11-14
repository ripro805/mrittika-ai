# Disaster Recovery & Circuit Breakers

## 1. High Availability Strategy
To guarantee uninterrupted service across rural Bangladesh where network connectivity is intermittent, Mrittika AI implements multi-tiered fault tolerance:

---

## 2. LLM Failover & Circuit Breaker Guard
```
[User Chat Request]
         │
         ▼
[Circuit Breaker Status Check]
         │
    ┌────┴──────────────────────────┐
    │ CLOSED (Normal Operation)     │ OPEN (5 consecutive failures)
    ▼                               ▼
[Groq openai/gpt-oss-120b]      [Google Gemini gemini-2.5-flash-lite]
    │                               │
    ├─► Success: Return Stream      ├─► Success: Return Stream
    │                               │
    └─► Error: Increment Failure ───┴─► Exhausted: Upazila Officer Referral
```
- **Circuit Breaker Threshold**: 5 consecutive upstream failures.
- **Cool-off Duration**: 60 seconds before testing the primary provider with a canary probe.
- **Safety Fallback**: Hardcoded Bangla agricultural safety disclaimer with the local Upazila Agriculture Office contact instructions.

---

## 3. Weather API Fallback Architecture
If the external Open-Meteo forecast API experiences timeout or rate limiting:
- **District Climatology Table**: Immediately returns historical 30-year seasonal baselines (BMD/BARC) tailored to the specific district's Agro-Ecological Zone (AEZ).
- **Client Indication**: UI displays `আঞ্চলিক জলবায়ু উপাত্ত` rather than `Open-Meteo লাইভ আবহাওয়া` to maintain full transparency.

---

## 4. Database Resilience
- **Neon Cloud Postgres**: Automated serverless branch point-in-time recovery (PITR).
- **Connection Health Checks**: `conn_health_checks=True` ensures stale TCP sockets from poolers are silently discarded before executing queries.
