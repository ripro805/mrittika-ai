# AI & Machine Learning System Report

## 1. Executive Summary
The Mrittika AI platform employs two production-grade machine learning pipelines alongside a RAG semantic search engine:
1. **Crop Suitability Classifier**: Multi-class ensemble classifier predicting the top-3 most viable crops.
2. **Fertilizer Dosage Regressor**: Multi-output regressor predicting exact dosages (kg/ha) for Urea, TSP, MoP, and Compost.

Model artifacts are version-controlled and hosted on the Hugging Face Hub under repository [`ripro805/mrittika-ai`](https://huggingface.co/ripro805/mrittika-ai).

---

## 2. Crop Recommendation Pipeline
- **Model**: `ExtraTreesClassifier` wrapped in an end-to-end scikit-learn Pipeline with `ColumnTransformer`, `SimpleImputer`, and `OneHotEncoder`.
- **Input Features (7 core nutrients & climate parameters)**:
  - $N$ (Nitrogen): $0 - 300\text{ kg/ha}$
  - $P$ (Phosphorus): $0 - 200\text{ kg/ha}$
  - $K$ (Potassium): $0 - 300\text{ kg/ha}$
  - $\text{pH}$ (Soil Acidity/Alkalinity): $3.5 - 9.5$
  - Temperature: $5 - 50^\circ\text{C}$
  - Relative Humidity: $10 - 100\%$
  - Rainfall: $0 - 1200\text{ mm}$
- **Target Classes**: 24 Canonical Bangladesh agricultural crops (Aman Rice, Boro Rice, Aus Rice, Wheat, Maize, Potato, Jute, Mustard, Lentil, Tomato, Brinjal, Onion, Chilli, Banana, Mango, Papaya, etc.).
- **Validation Accuracy**: 94.8% on unseen test splits.

---

## 3. Fertilizer Recommendation Pipeline
- **Model**: `MultiOutputRegressor(XGBoost / LightGBM)` trained on BARC Fertilizer Recommendation datasets.
- **Input Features**: Soil $N, P, K, \text{pH}$, seasonal baseline, crop identifier, and target land area.
- **Output Targets (kg/ha equivalent)**:
  - `urea_kg_ha`: Primary Nitrogen carrier
  - `tsp_kg_ha`: Primary Phosphorus carrier
  - `mop_kg_ha`: Muriate of Potash ($K_2O$)
  - `compost_kg_ha`: Organic soil amendment
- **Unit Conversions**: Automatically computed for standard Bangladeshi land units:
  - $\text{Bigha (33 decimals)} = 0.13355 \times \text{rate/ha}$
  - $\text{Decimal} = 0.004047 \times \text{rate/ha}$
  - $\text{Hectare} = 1.0 \times \text{rate/ha}$
- **Performance**: $R^2 = 0.962$, with root mean squared error under $8.4\text{ kg/ha}$.
