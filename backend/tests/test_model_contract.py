"""
Model Contract tests loading the REAL model pickles and testing against 20 sampled CSV rows.
"""

import numpy as np
import pandas as pd
from django.conf import settings

from apps.recommendations.model_loader import get_crop_bundle, get_fertilizer_bundle

CROP_CSV_PATH = settings.ML_MODELS_DIR / "bangladesh_crop_recommendation.csv"
FERT_CSV_PATH = settings.ML_MODELS_DIR / "bangladesh_fertilizer_recommendation.csv"


def test_real_crop_model_contract_20_rows():
    bundle = get_crop_bundle()
    pipeline = bundle["model"]
    classes = bundle["classes"]
    features = bundle["features"]

    assert len(classes) == 24
    assert len(features) == 9

    df = pd.read_csv(CROP_CSV_PATH)
    sample_df = df.sample(n=20, random_state=42)

    X = sample_df[features]
    probs = pipeline.predict_proba(X)

    # 1. Output shape assertion
    assert probs.shape == (20, 24), f"Expected shape (20, 24), got {probs.shape}"

    # 2. Probabilities sum to ~1.0 for every row
    row_sums = probs.sum(axis=1)
    np.testing.assert_allclose(row_sums, 1.0, atol=1e-5)

    # 3. Top-3 sorted in descending order
    for i in range(20):
        row_probs = probs[i]
        top3_idx = np.argsort(row_probs)[-3:][::-1]
        p1, p2, p3 = row_probs[top3_idx[0]], row_probs[top3_idx[1]], row_probs[top3_idx[2]]
        assert p1 >= p2 >= p3, f"Top-3 not sorted descending: {p1}, {p2}, {p3}"

    # 4. No NaN in predictions
    assert not np.isnan(probs).any()


def test_real_fertilizer_model_contract_20_rows():
    bundle = get_fertilizer_bundle()
    cls_pipeline = bundle["classifier"]
    reg_pipeline = bundle["regressor"]
    le = bundle["label_encoder"]
    features = bundle["features"]
    dose_cols = bundle["dose_columns"]
    classes = bundle["classes"]

    assert len(dose_cols) == 7
    assert len(classes) == 8

    df = pd.read_csv(FERT_CSV_PATH)
    sample_df = df.sample(n=20, random_state=42)

    X = sample_df[features]

    # Test classification output
    cls_preds = cls_pipeline.predict(X)
    if isinstance(cls_preds[0], (int, np.integer)):
        plan_names = le.inverse_transform(cls_preds)
    else:
        plan_names = cls_preds

    assert len(plan_names) == 20
    for name in plan_names:
        assert name in classes, f"Unexpected plan '{name}'"

    # Test regression output
    reg_preds = reg_pipeline.predict(X)
    assert reg_preds.shape == (20, 7), f"Expected shape (20, 7), got {reg_preds.shape}"
    assert not np.isnan(reg_preds).any()


def test_fertilizer_missing_values_handled_without_crash():
    bundle = get_fertilizer_bundle()
    cls_pipeline = bundle["classifier"]
    reg_pipeline = bundle["regressor"]
    features = bundle["features"]

    df = pd.read_csv(FERT_CSV_PATH)
    sample_df = df.sample(n=20, random_state=123).copy()

    # Artificially set S, Zn, and organic_matter to NaN
    sample_df["S"] = np.nan
    sample_df["Zn"] = np.nan
    sample_df["organic_matter"] = np.nan

    X = sample_df[features]

    cls_preds = cls_pipeline.predict(X)
    reg_preds = reg_pipeline.predict(X)

    assert len(cls_preds) == 20
    assert reg_preds.shape == (20, 7)
    assert not np.isnan(reg_preds).any()
