"""
Compute safety caps for fertilizers from the training CSV.
Cap = max(dose in training data) * 1.05 per crop and per fertilizer.
"""

import json
from pathlib import Path

import pandas as pd

DOSE_COLUMNS = [
    "urea_kg_ha",
    "tsp_kg_ha",
    "mop_kg_ha",
    "gypsum_kg_ha",
    "zinc_sulphate_kg_ha",
    "lime_kg_ha",
    "compost_kg_ha",
]

BASE_DIR = Path(__file__).resolve().parent.parent
CSV_PATH = BASE_DIR / "ml_models" / "bangladesh_fertilizer_recommendation.csv"
OUTPUT_PATH = BASE_DIR / "apps" / "recommendations" / "data" / "fertilizer_caps.json"


def compute_caps():
    df = pd.read_csv(CSV_PATH)
    crops = df["crop"].unique().tolist()
    caps = {}

    for crop in sorted(crops):
        crop_df = df[df["crop"] == crop]
        caps[crop] = {}
        for col in DOSE_COLUMNS:
            max_val = float(crop_df[col].max())
            capped_val = round(max_val * 1.05, 2)
            caps[crop][col] = capped_val

    # Global caps as fallback
    global_caps = {}
    for col in DOSE_COLUMNS:
        global_caps[col] = round(float(df[col].max()) * 1.05, 2)

    result = {
        "metadata": {
            "source": "bangladesh_fertilizer_recommendation.csv",
            "buffer_multiplier": 1.05,
            "dose_columns": DOSE_COLUMNS,
        },
        "per_crop": caps,
        "global_fallback": global_caps,
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)

    print(f"[+] Computed caps for {len(caps)} crops. Written to {OUTPUT_PATH}")
    return result


if __name__ == "__main__":
    compute_caps()
