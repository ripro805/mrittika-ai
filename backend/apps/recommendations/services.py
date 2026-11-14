"""
ML Inference services for Crop Recommendation and Fertilizer Advisory.
Implements unit conversion, safety capping, missing value imputation, and rules.
"""

import json
from typing import Any, Dict, Optional

import numpy as np
import pandas as pd
from django.conf import settings

from apps.crops.registry import (
    get_crop_by_identifier,
    normalize_season_for_crop,
    normalize_season_for_fertilizer,
    normalize_soil_for_crop,
    normalize_soil_for_fertilizer,
)

from .agronomic_rules import generate_application_schedule, generate_soil_health_notes
from .model_loader import get_crop_bundle, get_fertilizer_bundle

# Load safety caps
CAPS_PATH = settings.BASE_DIR / "apps" / "recommendations" / "data" / "fertilizer_caps.json"
_SAFETY_CAPS = None

DISCLAIMER_BN = (
    "পরামর্শটি এআই এবং গবেষণা তথ্যের ভিত্তিতে একটি সম্ভাব্য গাইড। স্থানীয় আবহাওয়া, "
    "মাটির সঠিক গুণাগুণ এবং উপসহকারী কৃষি কর্মকর্তার পরামর্শ অনুযায়ী চূড়ান্ত সার প্রয়োগ করুন।"
)

# Friendly agronomic explanations in Bangla for top crops
CROP_REASONS_BN = {
    "Aman Rice": "বর্ষা ও খরিফ-২ মৌসুমের আর্দ্র আবহাওয়া এবং উপযুক্ত নাইট্রোজেন ও পিএইচ মাত্রার কারণে আমন ধান সর্বোত্তম উপযোগী।",
    "Aus Rice": "প্রাক-বর্ষা মৌসুমে মাঝারি বৃষ্টিপাত ও উষ্ণ আবহাওয়ায় আউশ ধানের ফলন চমৎকার হয়।",
    "Boro Rice": "শীতকালীন নিয়ন্ত্রিত আর্দ্রতা এবং উপযুক্ত পটাশ মাত্রায় বোরো ধান উচ্চ ফলনশীল।",
    "Wheat": "শীতকালীন মাঝারি তাপমাত্রা, সহনীয় আর্দ্রতা এবং দোআঁশ মাটিতে গম চাষ সবচেয়ে লাভজনক।",
    "Maize": "উচ্চ তাপমাত্রা সহনশীলতা এবং নাইট্রোজেন সমৃদ্ধ মাটিতে ভুট্টার দ্রুত বৃদ্ধি ও ফলন নিশ্চিত হয়।",
    "Potato": "ঠান্ডা আবহাওয়া ও দোআঁশ-বেলে দোআঁশ মাটিতে আলুর কন্দ পরিপুষ্ট হয়।",
    "Jute": "উচ্চ আর্দ্রতা ও পর্যাপ্ত বৃষ্টিপাতযুক্ত খরিফ মৌসুমে পাটের আঁশ উন্নত মানের হয়।",
    "Mustard": "কম সেচ ও রবি মৌসুমের শুষ্ক-ঠান্ডা আবহাওয়ায় সরিষার দানা পুষ্ট হয়।",
    "Lentil": "মাঝারি উর্বরতা ও শুষ্ক রবি মৌসুমে মসুর ডালের শিকড়ে নাইট্রোজেন গুটি তৈরি সহায়ক।",
    "Tomato": "রোদঝলমলে শীত ও মাঝারি তাপমাত্রা টমেটোর ফুল ও ফল ধারণে আদর্শ।",
    "Brinjal": "দীর্ঘমেয়াদী উষ্ণ ও আর্দ্র আবহাওয়ায় বেগুনের নিয়মিত ফলন পাওয়া যায়।",
    "Onion": "মাটির উত্তম নিষ্কাশন ও রবি মৌসুম পেঁয়াজের বাল্ব গঠনে অত্যন্ত উপযোগী।",
    "Chilli": "উষ্ণ ও রৌদ্রোজ্জ্বল আবহাওয়ায় মরিচের ঝাঁজ ও ফলন সর্বাধিক হয়।",
}


def get_safety_caps() -> Dict[str, Any]:
    global _SAFETY_CAPS
    if _SAFETY_CAPS is None and CAPS_PATH.exists():
        with open(CAPS_PATH, "r", encoding="utf-8") as f:
            _SAFETY_CAPS = json.load(f)
    return _SAFETY_CAPS or {}


def run_crop_recommendation(
    n: float,
    p: float,
    k: float,
    ph: float,
    temperature: float,
    humidity: float,
    rainfall: float,
    season: str,
    soil_type: str,
) -> Dict[str, Any]:
    """Runs Crop Recommendation model and returns top-3 with confidence."""
    bundle = get_crop_bundle()
    pipeline = bundle["model"]
    classes = bundle["classes"]

    norm_soil = normalize_soil_for_crop(soil_type)
    norm_season = normalize_season_for_crop(season)

    # Input dataframe strictly matching features
    features = bundle["features"]
    input_row = {
        "N": float(n),
        "P": float(p),
        "K": float(k),
        "pH": float(ph),
        "temperature": float(temperature),
        "humidity": float(humidity),
        "rainfall": float(rainfall),
        "season": norm_season,
        "soil_type": norm_soil,
    }
    df = pd.DataFrame([input_row])[features]

    # Model inference
    probs = pipeline.predict_proba(df)[0]
    top3_indices = np.argsort(probs)[-3:][::-1]

    recommendations = []
    for rank, idx in enumerate(top3_indices, start=1):
        crop_label = classes[idx]
        confidence = round(float(probs[idx]) * 100, 2)
        canonical = get_crop_by_identifier(crop_label)

        slug = canonical["slug"] if canonical else crop_label.lower().replace(" ", "_")
        name_bn = canonical["name_bn"] if canonical else crop_label
        name_en = canonical["name_en"] if canonical else crop_label
        fertilizer_supported = canonical["fertilizer_supported"] if canonical else False

        reason_bn = CROP_REASONS_BN.get(
            crop_label,
            f"মাটির পুষ্টি উপাদান (N:{n}, P:{p}, K:{k}) ও আবহাওয়ার সাথে {name_bn} চাষ সামঞ্জস্যপূর্ণ।"
        )

        recommendations.append({
            "rank": rank,
            "crop_slug": slug,
            "crop_name_bn": name_bn,
            "crop_name_en": name_en,
            "crop_model_label": crop_label,
            "confidence_percentage": confidence,
            "fertilizer_supported": fertilizer_supported,
            "reason_bn": reason_bn,
        })

    return {
        "recommendations": recommendations,
        "inputs": input_row,
        "disclaimer_bn": DISCLAIMER_BN,
    }


def run_fertilizer_recommendation(
    crop_slug: str,
    n: float,
    p: float,
    k: float,
    ph: float,
    temperature: float,
    humidity: float,
    rainfall: float,
    season: str,
    soil_type: str,
    s: Optional[float] = None,
    zn: Optional[float] = None,
    organic_matter: Optional[float] = None,
    land_area: Optional[float] = 1.0,
    land_unit: Optional[str] = "bigha",
) -> Dict[str, Any]:
    """Runs Fertilizer Recommendation model with safety clipping, capping, and scheduling."""
    canonical = get_crop_by_identifier(crop_slug)
    if not canonical:
        return {
            "supported": False,
            "error_bn": f"অননুমোদিত ফসল নির্বাচন ({crop_slug})।",
            "error_en": f"Unknown crop '{crop_slug}'.",
        }

    if not canonical["fertilizer_supported"] or not canonical["fert_model_name"]:
        return {
            "supported": False,
            "crop_slug": canonical["slug"],
            "crop_name_bn": canonical["name_bn"],
            "crop_name_en": canonical["name_en"],
            "message_bn": "এই ফসলের জন্য সারের পরামর্শ এখনো যুক্ত হয়নি (Fertilizer advice not yet available for this crop).",
            "message_en": "Fertilizer advisory model is not yet available for this crop.",
        }

    bundle = get_fertilizer_bundle()
    cls_pipeline = bundle["classifier"]
    reg_pipeline = bundle["regressor"]
    le = bundle["label_encoder"]
    features = bundle["features"]
    dose_cols = bundle["dose_columns"]

    fert_crop_name = canonical["fert_model_name"]
    norm_soil = normalize_soil_for_fertilizer(soil_type)
    norm_season = normalize_season_for_fertilizer(season)

    # Build input dict. S, Zn, organic_matter can be None -> np.nan
    input_row = {
        "N": float(n),
        "P": float(p),
        "K": float(k),
        "S": float(s) if s is not None and str(s).strip() != "" else np.nan,
        "Zn": float(zn) if zn is not None and str(zn).strip() != "" else np.nan,
        "pH": float(ph),
        "organic_matter": float(organic_matter) if organic_matter is not None and str(organic_matter).strip() != "" else np.nan,
        "temperature": float(temperature),
        "humidity": float(humidity),
        "rainfall": float(rainfall),
        "crop": fert_crop_name,
        "season": norm_season,
        "soil_type": norm_soil,
    }

    df = pd.DataFrame([input_row])[features]

    # 1. Plan classification
    cls_pred = cls_pipeline.predict(df)[0]
    if isinstance(cls_pred, (int, np.integer)):
        plan_name = le.inverse_transform([cls_pred])[0]
    else:
        plan_name = str(cls_pred)

    # 2. Dosage regression (kg/ha)
    raw_doses = reg_pipeline.predict(df)[0]

    # 3. Safety layer: Clip negatives to 0.0 and cap at max*1.05
    caps_data = get_safety_caps()
    per_crop_caps = caps_data.get("per_crop", {}).get(fert_crop_name, {})
    global_caps = caps_data.get("global_fallback", {})

    fertilizer_labels_bn = {
        "urea_kg_ha": {"name_bn": "ইউরিয়া (Urea)", "name_en": "Urea", "nutrient": "Nitrogen (N)"},
        "tsp_kg_ha": {"name_bn": "টিএসপি / ডিএপি (TSP)", "name_en": "TSP", "nutrient": "Phosphorus (P)"},
        "mop_kg_ha": {"name_bn": "এমওপি / পটাশ (MoP)", "name_en": "MoP", "nutrient": "Potassium (K)"},
        "gypsum_kg_ha": {"name_bn": "জিপসাম (Gypsum)", "name_en": "Gypsum", "nutrient": "Sulphur (S)"},
        "zinc_sulphate_kg_ha": {"name_bn": "জিংক সালফেট (Zinc Sulphate)", "name_en": "Zinc Sulphate", "nutrient": "Zinc (Zn)"},
        "lime_kg_ha": {"name_bn": "ডলোমাইট চুন (Agricultural Lime)", "name_en": "Lime", "nutrient": "pH buffer"},
        "compost_kg_ha": {"name_bn": "জৈব সার / কম্পোস্ট (Compost)", "name_en": "Compost", "nutrient": "Organic Matter"},
    }

    # Unit conversion rates from kg/ha:
    # 1 ha = 7.4878 bigha -> 1 kg/ha = 0.13355 kg/bigha
    # 1 ha = 247.105 decimals -> 1 kg/ha = 0.004047 kg/decimal
    RATE_BIGHA = 0.13355
    RATE_DECIMAL = 0.004047

    area = float(land_area) if land_area and float(land_area) > 0 else 1.0
    unit = (land_unit or "bigha").lower()
    if unit in ("bigha", "বিঘা"):
        area_multiplier = area * RATE_BIGHA
        active_unit_label_bn = f"{area} বিঘা"
    elif unit in ("decimal", "shotok", "শতক", "ডেসিমাল"):
        area_multiplier = area * RATE_DECIMAL
        active_unit_label_bn = f"{area} শতক"
    else:  # hectare
        area_multiplier = area
        active_unit_label_bn = f"{area} হেক্টর"

    items = []
    for col, raw_val in zip(dose_cols, raw_doses):
        # Clip negatives
        val = max(0.0, float(raw_val))
        cap = per_crop_caps.get(col, global_caps.get(col, 1500.0))
        # Cap
        val_capped = min(val, cap)

        # Skip secondary minerals if very low (<= 1.0 kg/ha)
        if col in ["gypsum_kg_ha", "zinc_sulphate_kg_ha", "lime_kg_ha", "compost_kg_ha"] and val_capped <= 1.0:
            continue

        meta = fertilizer_labels_bn.get(col, {"name_bn": col, "name_en": col, "nutrient": ""})
        dose_kg_ha = round(val_capped, 2)
        dose_kg_bigha = round(dose_kg_ha * RATE_BIGHA, 2)
        dose_kg_decimal = round(dose_kg_ha * RATE_DECIMAL, 3)
        total_quantity_kg = round(dose_kg_ha * area_multiplier, 2)

        items.append({
            "key": col,
            "name_bn": meta["name_bn"],
            "name_en": meta["name_en"],
            "nutrient": meta["nutrient"],
            "rate_kg_ha": dose_kg_ha,
            "rate_kg_bigha": dose_kg_bigha,
            "rate_kg_decimal": dose_kg_decimal,
            "total_quantity_kg": total_quantity_kg,
            "active_unit_label_bn": active_unit_label_bn,
        })

    # Rule-based schedule & soil-health notes
    schedule = generate_application_schedule(canonical["slug"], canonical["group"], plan_name)
    soil_notes = generate_soil_health_notes(
        ph=float(ph),
        organic_matter=float(organic_matter) if organic_matter is not None and str(organic_matter).strip() != "" else None,
        s=float(s) if s is not None and str(s).strip() != "" else None,
        zn=float(zn) if zn is not None and str(zn).strip() != "" else None,
    )

    clean_inputs = {k: v for k, v in input_row.items() if not (isinstance(v, float) and np.isnan(v))}
    clean_inputs["land_area"] = area
    clean_inputs["land_unit"] = unit

    return {
        "supported": True,
        "crop_slug": canonical["slug"],
        "crop_name_bn": canonical["name_bn"],
        "crop_name_en": canonical["name_en"],
        "fertilizer_plan": plan_name,
        "fertilizer_items": items,
        "application_schedule": schedule,
        "soil_health_notes": soil_notes,
        "inputs": clean_inputs,
        "disclaimer_bn": DISCLAIMER_BN,
    }
