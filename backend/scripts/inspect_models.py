"""
Model inspection script for Mrittika AI (Step 0 mandatory requirement).
Downloads artifacts from HF repo ripro805/mrittika-ai, computes checksums,
and inspects the internal structures, schemas, and library versions.
"""

import hashlib
import json
import os
import shutil
from pathlib import Path

HF_REPO_ID = "ripro805/mrittika-ai"
HF_TOKEN = os.getenv("HF_TOKEN", "")
DEST_DIR = Path(__file__).resolve().parent.parent / "ml_models"

FILES_TO_DOWNLOAD = [
    "mrittika_crop_model.pkl",
    "mrittika_fertilizer_model.pkl",
    "metrics.json",
    "fertilizer_metrics.json",
    "bangladesh_crop_recommendation.csv",
    "bangladesh_fertilizer_recommendation.csv",
]


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while chunk := f.read(8192 * 1024):
            h.update(chunk)
    return h.hexdigest()


def download_artifacts():
    DEST_DIR.mkdir(parents=True, exist_ok=True)
    from huggingface_hub import hf_hub_download

    print(f"[*] Downloading artifacts from {HF_REPO_ID} to {DEST_DIR}...")
    hashes = {}
    for filename in FILES_TO_DOWNLOAD:
        target_file = DEST_DIR / filename
        print(f"    - Downloading {filename}...")
        downloaded_path = hf_hub_download(
            repo_id=HF_REPO_ID,
            filename=filename,
            token=HF_TOKEN,
            revision=os.getenv("HF_REVISION", "main"),
        )
        # Copy to our destination
        if downloaded_path != str(target_file):
            shutil.copyfile(downloaded_path, target_file)
        digest = sha256_file(target_file)
        hashes[filename] = {
            "sha256": digest,
            "size_bytes": os.path.getsize(target_file),
        }
        print(f"      Downloaded {filename} ({hashes[filename]['size_bytes']} bytes, SHA256: {digest[:16]}...)")

    lock_path = DEST_DIR / "models.lock"
    with open(lock_path, "w", encoding="utf-8") as f:
        json.dump(hashes, f, indent=2)
    print(f"[+] Created lockfile at {lock_path}")
    return hashes


def inspect():
    import joblib
    import pandas as pd

    print("\n" + "=" * 60)
    print("METRICS INSPECTION")
    print("=" * 60)
    for mfile in ["metrics.json", "fertilizer_metrics.json"]:
        mpath = DEST_DIR / mfile
        if mpath.exists():
            print(f"\n--- {mfile} ---")
            with open(mpath, "r", encoding="utf-8") as f:
                content = json.load(f)
                print(json.dumps(content, indent=2))

    print("\n" + "=" * 60)
    print("DATASET / CSV INSPECTION")
    print("=" * 60)
    for csvfile in ["bangladesh_crop_recommendation.csv", "bangladesh_fertilizer_recommendation.csv"]:
        cpath = DEST_DIR / csvfile
        if cpath.exists():
            print(f"\n--- {csvfile} ---")
            df = pd.read_csv(cpath)
            print(f"Shape: {df.shape}")
            print(f"Columns: {list(df.columns)}")
            print(f"Dtypes:\n{df.dtypes}")
            if "crop" in df.columns or "label" in df.columns:
                col = "crop" if "crop" in df.columns else "label"
                print(f"Unique {col} ({df[col].nunique()}): {sorted(df[col].unique().tolist())}")
            if "soil_type" in df.columns:
                print(f"Unique soil_type: {sorted(df['soil_type'].unique().tolist())}")
            if "season" in df.columns:
                print(f"Unique season: {sorted(df['season'].unique().tolist())}")
            print("First 2 rows:")
            print(df.head(2).to_dict(orient="records"))

    print("\n" + "=" * 60)
    print("CROP MODEL PICKLE INSPECTION")
    print("=" * 60)
    crop_path = DEST_DIR / "mrittika_crop_model.pkl"
    try:
        crop_obj = joblib.load(crop_path)
        print(f"Crop model object type: {type(crop_obj)}")
        if isinstance(crop_obj, dict):
            print(f"Keys: {list(crop_obj.keys())}")
            for k, v in crop_obj.items():
                print(f"  Key '{k}': type={type(v)}")
                if k in ["features", "feature_names", "columns"]:
                    print(f"    Features: {v}")
                elif k in ["classes", "classes_", "labels"]:
                    print(f"    Classes: {v}")
                elif k in ["metrics", "scores"]:
                    print(f"    Metrics: {v}")
                elif hasattr(v, "steps"):
                    print(f"    Pipeline steps: {v.steps}")
        elif hasattr(crop_obj, "steps"):
            print(f"Pipeline steps: {crop_obj.steps}")
            if hasattr(crop_obj, "classes_"):
                print(f"Classes: {crop_obj.classes_}")
            if hasattr(crop_obj, "feature_names_in_"):
                print(f"feature_names_in_: {crop_obj.feature_names_in_}")
    except Exception as e:
        print(f"Error loading crop model: {e}")

    print("\n" + "=" * 60)
    print("FERTILIZER MODEL PICKLE INSPECTION")
    print("=" * 60)
    fert_path = DEST_DIR / "mrittika_fertilizer_model.pkl"
    try:
        fert_obj = joblib.load(fert_path)
        print(f"Fertilizer model object type: {type(fert_obj)}")
        if isinstance(fert_obj, dict):
            print(f"Keys: {list(fert_obj.keys())}")
            for k, v in fert_obj.items():
                print(f"  Key '{k}': type={type(v)}")
                if k in ["features", "feature_names", "columns"]:
                    print(f"    Features: {v}")
                elif k in ["classes", "classes_", "labels", "targets"]:
                    print(f"    Classes/Targets: {v}")
                elif hasattr(v, "steps"):
                    print(f"    Pipeline steps: {v.steps}")
                elif hasattr(v, "estimators_"):
                    print(f"    Estimators: {len(v.estimators_)}")
        elif hasattr(fert_obj, "steps"):
            print(f"Pipeline steps: {fert_obj.steps}")
    except Exception as e:
        print(f"Error loading fertilizer model: {e}")


if __name__ == "__main__":
    download_artifacts()
    inspect()
