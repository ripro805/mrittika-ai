# System Limitations & Agronomic Disclaimers

> **IMPORTANT NOTICE**:  
> The machine learning models and dataset utilized in this prototype are derived from synthetic and public benchmark agricultural distributions adapted for Bangladesh agro-climatic conditions. Recommendations are **indicative** and serve as decision-support guidance, not a certified agronomic prescription.

---

## 1. Synthetic Data & Model Coverage

### 1.1 Crop Recommendation Model
- Trained on 24 common crops across Bangladesh.
- Assumes balanced micro-nutrient availability and standard drainage.
- Soil and weather anomalies (e.g., severe flash flooding in Haor basins, cyclone storm surges, high soil salinity in coastal Satkhira/Khulna) require local field verification.

### 1.2 Fertilizer Recommendation Model
- The fertilizer model covers **13 major crops**:
  - `Rice_Aman`, `Rice_Aus`, `Rice_Boro`, `Wheat`, `Maize`, `Jute`, `Potato`, `Mustard`, `Lentil`, `Tomato`, `Brinjal`, `Chilli`, `Onion`.
- The remaining **11 crops** (Banana, Tea, Coffee, Mango, Grapes, Watermelon, Apple, Orange, Papaya, Coconut, Muskmelon) are recognized by the crop classifier, but do **not** have an automated fertilizer regression pipeline in the current model release.
- **Handling**: The system explicitly returns a Bangla advisory stating that fertilizer guidelines for this crop are pending (`"এই ফসলের জন্য সারের পরামর্শ এখনো যুক্ত হয়নি"`), disabling the calculation button to prevent erroneous dosing.

---

## 2. Fertilizer Dosing & Soil Health

- Dosing is computed based on macro-nutrients (N, P, K) and secondary nutrients (S, Zn).
- Missing micronutrient values default to regional medians.
- Soil salinity, organic carbon depletion, and heavy metal presence are not modeled by the regression network.
- Farmers are strongly advised to obtain periodic soil tests from the **Soil Resource Development Institute (SRDI / মৃত্তিকা সম্পদ উন্নয়ন ইনস্টিটিউট)** or Upazila Agriculture Offices before applying commercial fertilizers.

---

## 3. RAG Knowledge Base & LLM Boundaries

- In local development and automated CI testing, the assistant operates with a deterministic **Mock Provider** to ensure zero-cost, zero-latency, reproducible verification without requiring commercial API keys.
- Production deployments can switch to Google Gemini, Anthropic Claude, or local Ollama instances by setting `LLM_PROVIDER` in `.env`.
- The RAG system operates strictly on indexed documents (`sample_docs/`). For nationwide deployment, official publications from **BARC (Fertilizer Recommendation Guide 2018)**, **BRRI (Adhunik Dhaner Chash)**, and **BARI Krishi Projukti Hatboi** must be ingested.
- The assistant is explicitly forbidden from recommending chemical pesticide or herbicide dosages to prevent crop toxicity or chemical burns.

---

## 4. Weather Forecasts

- Weather data is retrieved dynamically via the **Open-Meteo API** based on the geographic center coordinates of Bangladesh's 64 districts.
- Caching is active for 30 minutes.
- If the Open-Meteo API is unreachable, the system gracefully falls back to seasonal 30-year climatological averages for the selected district and season.
