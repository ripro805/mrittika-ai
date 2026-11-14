"""
ML Model Loader with SHA-256 integrity verification against models.lock.
Loads models strictly into an in-memory singleton.
"""

import hashlib
import json
from pathlib import Path
from typing import Any, Dict

import joblib
from django.conf import settings

_CROP_BUNDLE: Dict[str, Any] = None
_FERT_BUNDLE: Dict[str, Any] = None


def sha256_of_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while chunk := f.read(8192 * 1024):
            h.update(chunk)
    return h.hexdigest()


def verify_file_checksum(file_path: Path, filename: str):
    lock_file = settings.ML_MODELS_DIR / "models.lock"
    if not lock_file.exists():
        raise RuntimeError("Integrity check failed: models.lock file is missing.")

    with open(lock_file, "r", encoding="utf-8") as f:
        lock_data = json.load(f)

    if filename not in lock_data:
        raise RuntimeError(f"Integrity check failed: {filename} not listed in models.lock.")

    expected_sha = lock_data[filename]["sha256"]
    actual_sha = sha256_of_file(file_path)

    if actual_sha != expected_sha:
        raise ValueError(
            f"Security Alert: SHA-256 mismatch for {filename}!\n"
            f"Expected: {expected_sha}\n"
            f"Actual:   {actual_sha}"
        )


def get_crop_bundle() -> Dict[str, Any]:
    global _CROP_BUNDLE
    if _CROP_BUNDLE is not None:
        return _CROP_BUNDLE

    model_path = settings.ML_MODELS_DIR / "mrittika_crop_model.pkl"
    if not model_path.exists():
        raise FileNotFoundError(f"Crop model file not found at {model_path}.")

    verify_file_checksum(model_path, "mrittika_crop_model.pkl")
    _CROP_BUNDLE = joblib.load(model_path)
    return _CROP_BUNDLE


def get_fertilizer_bundle() -> Dict[str, Any]:
    global _FERT_BUNDLE
    if _FERT_BUNDLE is not None:
        return _FERT_BUNDLE

    model_path = settings.ML_MODELS_DIR / "mrittika_fertilizer_model.pkl"
    if not model_path.exists():
        raise FileNotFoundError(f"Fertilizer model file not found at {model_path}.")

    verify_file_checksum(model_path, "mrittika_fertilizer_model.pkl")
    _FERT_BUNDLE = joblib.load(model_path)
    return _FERT_BUNDLE
