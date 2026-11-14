# ML Model Contract - Mrittika AI

This document establishes the verified machine learning contract for the Mrittika AI advisory engine, based on direct inspection of artifacts from Hugging Face repository `ripro805/mrittika-ai`.

---

## 1. Pinned Library Versions
The serialized pickles require the following library versions to avoid deserialization corruption (specifically avoiding XGBoost 3.x C-API buffer incompatibility):

| Library | Inspected / Pinned Version | Notes |
|---|---|---|
| `python` | 3.11 / 3.13 compatible | Developed against Python 3.11+ |
| `scikit-learn` | `1.6.1` (or `>=1.5.0,<=1.6.1`) | Pipeline, ColumnTransformer, SimpleImputer, OneHotEncoder, MultiOutputRegressor, ExtraTrees |
| `xgboost` | `>=2.0.0,<3.0.0` (pinned `2.1.4`) | **Critical**: XGBoost 3.x throws `XGBoosterUnserializeFromBuffer: input stream corrupted` |
| `lightgbm` | `4.7.0` (or `>=4.0.0`) | `LGBMRegressor` inside `MultiOutputRegressor` |
| `joblib` | `1.4.2` | Artifact persistence loader |
| `numpy` | `>=1.26.0,<3.0.0` (inspected `2.1.3`) | Array conversions & index manipulations |
| `pandas` | `>=2.2.0,<3.0.0` (inspected `2.2.3`) | Tabular data framing |

---

## 2. Artifact Integrity (`models.lock`)
All model weights are locked to exact SHA-256 hashes:

| Filename | Size (bytes) | SHA-256 Checksum |
|---|---|---|
| `mrittika_crop_model.pkl` | 11,418,090 | `860256b36d332aac6f7bf287661b03885d5bc1ebc806554bfeec7ee09bfbfa7d` |
| `mrittika_fertilizer_model.pkl` | 2,934,500 | `6db7628bcd35e13dd70ce61bf961448b1d9bf59bb139ff578a1bc1b6973eeb95` |
| `metrics.json` | 625 | `c0bfd963f225acfb623ba997e3aee453c2b8109bf95d9859f5f0b5d19a278ec6` |
| `fertilizer_metrics.json` | 1,069 | `9fc09edec11daf481414446fe31422fa753b8b1db41065ba18645ce4ec1c64eb` |
| `bangladesh_crop_recommendation.csv` | 480,351 | `34f08736a33bd524d7831ecf048d0a202c659d4865aa4e7bf94943fcfef0f8e9` |
| `bangladesh_fertilizer_recommendation.csv` | 739,705 | `425ec5ff2d04a5e3ec9e41982cf61a33a39e3ec5349e59d997feecf4f4f72782` |

---

## 3. Crop Recommendation Model Contract

### Bundle Structure
- Object Type: `dict`
- Keys: `['model', 'label_encoder', 'features', 'classes', 'metrics']`
  - `'model'`: `sklearn.pipeline.Pipeline`
    - Step 1 `pre`: `ColumnTransformer`
      - `num`: `SimpleImputer(strategy='median')` on `['N', 'P', 'K', 'pH', 'temperature', 'humidity', 'rainfall']`
      - `cat`: `Pipeline(SimpleImputer(strategy='most_frequent') -> OneHotEncoder(handle_unknown='ignore'))` on `['season', 'soil_type']`
    - Step 2 `clf`: `ExtraTreesClassifier(min_samples_leaf=2, n_estimators=200, n_jobs=-1, random_state=42)`
  - `'label_encoder'`: `sklearn.preprocessing.LabelEncoder`
  - `'features'`: `['N', 'P', 'K', 'pH', 'temperature', 'humidity', 'rainfall', 'season', 'soil_type']`
  - `'classes'`: 24 classes
  - `'metrics'`: ExtraTrees test accuracy: 86.13%, top-3 accuracy: 97.59%

### Expected Inputs & Dtypes
| Feature | Type | Expected Bounds | Description |
|---|---|---|---|
| `N` | float | 0 – 300 | Available Nitrogen in soil (kg/ha equivalent) |
| `P` | float | 0 – 200 | Available Phosphorus (kg/ha equivalent) |
| `K` | float | 0 – 300 | Available Potassium (kg/ha equivalent) |
| `pH` | float | 3.5 – 9.5 | Soil pH level |
| `temperature`| float | 5.0 – 50.0 | Ambient temperature (°C) |
| `humidity` | float | 10.0 – 100.0 | Relative humidity (%) |
| `rainfall` | float | 0.0 – 1000.0 | Rainfall / precipitation (mm) |
| `season` | string | Categorical | `Kharif-1`, `Kharif-2`, `Perennial`, `Rabi`, `Year-round` |
| `soil_type` | string | Categorical | `Clay`, `Clay Loam`, `Loam`, `Loam (Acidic Hill Soil)`, `Sandy`, `Sandy Loam`, `Silty Clay`, `Silty Loam` |

### Output Contract
- Method: `model.predict_proba(df[features])`
- Shape: `(N, 24)`
- Post-processing: Extract top-3 crops with confidence percentages.
- Classes (24): `Aman Rice`, `Aus Rice`, `Banana`, `Boro Rice`, `Brinjal`, `Cauliflower/Cabbage`, `Chilli`, `Garlic`, `Groundnut`, `Jute`, `Lentil`, `Maize`, `Mango`, `Mungbean`, `Mustard`, `Onion`, `Papaya`, `Potato`, `Pumpkin`, `Sesame`, `Sugarcane`, `Tea`, `Tomato`, `Wheat`.

---

## 4. Fertilizer Recommendation Model Contract

### Bundle Structure
- Object Type: `dict`
- Keys: `['classifier', 'regressor', 'label_encoder', 'features', 'dose_columns', 'classes', 'crops', 'metrics']`
  - `'classifier'`: `sklearn.pipeline.Pipeline`
    - Step 1 `pre`: `ColumnTransformer` (SimpleImputer + OneHotEncoder)
    - Step 2 `clf`: `XGBClassifier` (objective=`multi:softprob`, n_estimators=250)
  - `'regressor'`: `sklearn.pipeline.Pipeline`
    - Step 1 `pre`: `ColumnTransformer`
    - Step 2 `reg`: `MultiOutputRegressor(estimator=LGBMRegressor(n_estimators=300, learning_rate=0.08))`
  - `'label_encoder'`: `LabelEncoder` for fertilizer plan classes
  - `'features'`: `['N', 'P', 'K', 'S', 'Zn', 'pH', 'organic_matter', 'temperature', 'humidity', 'rainfall', 'crop', 'season', 'soil_type']`
  - `'dose_columns'`: `['urea_kg_ha', 'tsp_kg_ha', 'mop_kg_ha', 'gypsum_kg_ha', 'zinc_sulphate_kg_ha', 'lime_kg_ha', 'compost_kg_ha']`
  - `'classes'`: 8 fertilizer plan classes (`Maintenance_Dose`, `MoP`, `TSP`, `TSP+MoP`, `Urea`, `Urea+MoP`, `Urea+TSP`, `Urea+TSP+MoP`)
  - `'crops'`: 13 supported crops: `['Rice_Boro', 'Rice_Aman', 'Rice_Aus', 'Wheat', 'Maize', 'Potato', 'Jute', 'Mustard', 'Lentil', 'Tomato', 'Brinjal', 'Onion', 'Chilli']`

### Expected Inputs & Dtypes
| Feature | Type | Required? | Default / Imputation |
|---|---|---|---|
| `N` | float | Yes | Median imputer |
| `P` | float | Yes | Median imputer |
| `K` | float | Yes | Median imputer |
| `S` | float | Optional | Median imputer (can be `NaN`) |
| `Zn` | float | Optional | Median imputer (can be `NaN`) |
| `pH` | float | Yes | Median imputer |
| `organic_matter` | float | Optional | Median imputer (can be `NaN`) |
| `temperature` | float | Yes | From weather service / manual |
| `humidity` | float | Yes | From weather service / manual |
| `rainfall` | float | Yes | From weather service / manual |
| `crop` | string | Yes | Normalized to fertilizer model name |
| `season` | string | Yes | `Kharif-1`, `Kharif-2`, `Rabi` |
| `soil_type` | string | Yes | Normalized (`Silt Loam` in fertilizer vs `Silty Loam` in crop) |

---

## 5. Mismatches & Adapter Specifications

### a) Crop Name Mapping & Scope Discrepancy
The crop model outputs 24 crops, while the fertilizer model only supports 13:

| Canonical Slug | Bangla Name | Crop Model Class | Fertilizer Model Class | Fertilizer Supported? |
|---|---|---|---|---|
| `rice_aman` | আমন ধান | `Aman Rice` | `Rice_Aman` | **Yes** |
| `rice_aus` | আউশ ধান | `Aus Rice` | `Rice_Aus` | **Yes** |
| `rice_boro` | বোরো ধান | `Boro Rice` | `Rice_Boro` | **Yes** |
| `wheat` | গম | `Wheat` | `Wheat` | **Yes** |
| `maize` | ভুট্টা | `Maize` | `Maize` | **Yes** |
| `potato` | আলু | `Potato` | `Potato` | **Yes** |
| `jute` | পাট | `Jute` | `Jute` | **Yes** |
| `mustard` | সরিষা | `Mustard` | `Mustard` | **Yes** |
| `lentil` | মসুর ডাল | `Lentil` | `Lentil` | **Yes** |
| `tomato` | টমেটো | `Tomato` | `Tomato` | **Yes** |
| `brinjal` | বেগুন | `Brinjal` | `Brinjal` | **Yes** |
| `onion` | পেঁয়াজ | `Onion` | `Onion` | **Yes** |
| `chilli` | মরিচ | `Chilli` | `Chilli` | **Yes** |
| `banana` | কলা | `Banana` | None | No |
| `cauliflower_cabbage` | ফুলকপি / বাঁধাকপি | `Cauliflower/Cabbage` | None | No |
| `garlic` | রসুন | `Garlic` | None | No |
| `groundnut` | চিনাবাদাম | `Groundnut` | None | No |
| `mango` | আম | `Mango` | None | No |
| `mungbean` | মুগ ডাল | `Mungbean` | None | No |
| `papaya` | পেঁপে | `Papaya` | None | No |
| `pumpkin` | মিষ্টি কুমড়া | `Pumpkin` | None | No |
| `sesame` | তিল | `Sesame` | None | No |
| `sugarcane` | আখ | `Sugarcane` | None | No |
| `tea` | চা | `Tea` | None | No |

**Behavior**: If the user selects a crop that is unsupported by the fertilizer model (e.g. Banana, Tea, Sugarcane), the backend returns:
`{"error": "এই ফসলের জন্য সারের পরামর্শ এখনো যুক্ত হয়নি", "supported": false}`
and the UI disables the fertilizer button with that exact Bangla explanation.

### b) Soil Type Spelling Discrepancy
- In Crop Model: `Silty Loam`
- In Fertilizer Model: `Silt Loam`
- Adapter Normalization:
  - If target is crop model: `"Silt Loam" -> "Silty Loam"`
  - If target is fertilizer model: `"Silty Loam" -> "Silt Loam"`, `"Loam (Acidic Hill Soil)" -> "Loam"`, `"Silty Clay" -> "Clay"`, `"Sandy" -> "Sandy Loam"`.

### c) Missing Values Handling
- Inputs for `S`, `Zn`, and `organic_matter` can be omitted by the farmer (or entered as None/empty).
- The adapter passes `np.nan` which is handled by the pre-trained `SimpleImputer(strategy='median')`.

### d) Unit Conversions
Model outputs dosages in `kg/ha`. The adapter provides conversions:
- $\text{kg/bigha} = x \times 0.13355$
- $\text{kg/decimal} = x \times 0.004047$
- If `land_area` and `land_unit` are provided:
  - Total requirement = per-unit rate $\times$ `land_area`.

### e) Safety Guardrail & Capping Layer
1. **Non-negativity**: Clip all raw regressor outputs to $\ge 0.0$.
2. **Safety Capping**: Each dose is capped at $1.05 \times \max(\text{training dose for that crop})$ loaded from `fertilizer_caps.json`.
3. **Relevance Threshold**: Secondary micronutrients (`gypsum_kg_ha`, `zinc_sulphate_kg_ha`, `lime_kg_ha`, `compost_kg_ha`) are only displayed when non-zero and above agronomic threshold (> 1.0 kg/ha).
4. **Mandatory Disclaimer**: Every recommendation attaches:
   `"পরামর্শটি এআই এবং গবেষণা তথ্যের ভিত্তিতে একটি সম্ভাব্য গাইড। স্থানীয় আবহাওয়া, মাটির সঠিক গুণাগুণ এবং উপসহকারী কৃষি কর্মকর্তার পরামর্শ অনুযায়ী চূড়ান্ত সার প্রয়োগ করুন।"`

### f) Rule-Based Indicative Application Schedule & Soil-Health Notes
- Categorized by agronomic crop groups:
  - **Rice (Aman, Aus, Boro)**: 3 splits for Urea (basal, tillering, panicle initiation); TSP, MoP, Gypsum, Zinc as 100% basal at final land prep.
  - **Wheat & Maize**: Urea in 2–3 splits (basal, crown root / knee-high); TSP, MoP as basal.
  - **Potato**: Half Urea + all TSP, MoP, Gypsum, Zinc at planting; remaining half Urea at 30–35 days with earthing-up.
  - **Jute**: Urea in 2 splits (basal and 40–45 days); others basal.
  - **Vegetables (Brinjal, Tomato, Chilli, Cauliflower)**: Urea & MoP in 3 equal splits; basal application of organic compost and TSP.
  - **Pulses & Oilseeds (Lentil, Mustard, Mungbean, Groundnut)**: Full dose basal, rhizobium inoculum advisory.
- Soil-health notes based on pH and organic matter:
  - pH < 5.5: Acidic soil warning; advice on agricultural lime (dolomite).
  - pH > 8.0: Alkaline soil warning; avoid excessive lime.
  - Organic matter < 1.5%: Low organic matter warning; encourage green manure / compost.
