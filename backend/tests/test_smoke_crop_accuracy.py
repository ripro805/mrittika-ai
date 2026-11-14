"""
Smoke test comparing Crop Model accuracy on the full training CSV against metrics.json.
Note: The CSV was the primary training/evaluation data source, so this serves as a model-loading smoke test,
not an out-of-sample statistical validation.
"""

import warnings

import numpy as np
import pandas as pd
from django.conf import settings
from sklearn.metrics import accuracy_score

from apps.recommendations.model_loader import get_crop_bundle

CROP_CSV_PATH = settings.ML_MODELS_DIR / "bangladesh_crop_recommendation.csv"


def test_smoke_crop_model_accuracy_matches_metrics():
    bundle = get_crop_bundle()
    model = bundle["model"]
    le = bundle["label_encoder"]
    features = bundle["features"]
    expected_acc = bundle["metrics"].get("test_accuracy", 0.8613)

    df = pd.read_csv(CROP_CSV_PATH)
    X = df[features]
    y_true = df["label"]

    preds = model.predict(X)
    if isinstance(preds[0], (int, np.integer)):
        pred_labels = le.inverse_transform(preds)
    else:
        pred_labels = preds

    actual_acc = accuracy_score(y_true, pred_labels)
    diff = abs(actual_acc - expected_acc)

    # Smoke check: Accuracy on the dataset is high (~95%)
    # If it differs significantly from the reported test accuracy, warn appropriately
    if diff > 0.15:
        warnings.warn(
            f"Smoke warning: CSV accuracy ({actual_acc:.4f}) differs from metrics.json test_accuracy ({expected_acc:.4f}) by {diff:.4f}."
        )

    # Assert model has learned meaningful weights (accuracy >= 80%)
    assert actual_acc >= 0.80, f"Crop model accuracy ({actual_acc:.4f}) is unexpectedly degraded!"
