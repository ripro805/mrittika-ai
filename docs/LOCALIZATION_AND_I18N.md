# Localization (i18n) & Bilingual Architecture

## 1. Overview
Mrittika AI provides complete bilingual coverage in **Bangla (বাংলা - `bn`)** and **English (`en`)** across all three portals and public advisory workflows.

---

## 2. Implementation Architecture
- **Engine**: `i18next` with `react-i18next`.
- **Locale Fallback**: Primary `bn`, fallback `en`.
- **State Preservation**: Language changes persist in `localStorage` across refreshes and route transitions without reloading the page or losing form inputs.
- **Agricultural Terminology**: Carefully localized to standard Bangladeshi agronomic parlance (e.g., `বিঘা (৩৩ শতক)`, `ইউরিয়া উপরিপ্রয়োগ`, `কাইচ থোড় আসার সময়`, `আমন ধান`, `নাভিধসা রোগ`).

---

## 3. Scope of Translation Coverage
1. **Public Navigation & Landing Page**: Hero, value propositions, advisory steps, FAQ, footer.
2. **Crop Recommendation Workspace**: Soil nutrients ($N, P, K, \text{pH}$), environmental parameters, comparison cards, seasonal warnings.
3. **Fertilizer Planning Workspace**: Land units, basal application, first/second/third top dressings, soil health notes.
4. **Farmer Portal**: Personalized dashboard greeting, weather cards, seasonal tips, recommendation history tables, profile settings.
5. **Extension Officer Portal**: Flagged query inspector, agronomic correction editor, resolution badges, regional analytics.
6. **System Admin Portal**: Platform KPI summaries, user roles, officer verification toggles, knowledge base telemetry, activity audit logs.
