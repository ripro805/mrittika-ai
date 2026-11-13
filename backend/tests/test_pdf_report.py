"""
Test suite verifying Bangla PDF generation and Noto Sans Bengali font embedding.
"""

import pytest
from django.contrib.auth import get_user_model

from apps.recommendations.models import RecommendationHistory
from apps.recommendations.pdf_report import generate_advisory_pdf

User = get_user_model()


@pytest.mark.django_db
def test_advisory_pdf_renders_and_embeds_bengali_font():
    user = User.objects.create_user(
        phone="01799887766",
        name="কৃষক আকমল হোসেন",
    )
    history = RecommendationHistory.objects.create(
        user=user,
        rec_type=RecommendationHistory.Type.FERTILIZER,
        crop_slug="rice_aman",
        crop_name_bn="আমন ধান",
        inputs={
            "season": "Kharif-2",
            "soil_type": "Clay Loam",
            "land_area": 2.0,
            "land_unit": "বিঘা",
            "pH": 6.4,
        },
        outputs={
            "fertilizer_items": [
                {
                    "name_bn": "ইউরিয়া (Urea)",
                    "nutrient": "Nitrogen (N)",
                    "rate_kg_bigha": 25.5,
                    "rate_kg_decimal": 0.77,
                    "total_quantity_kg": 51.0,
                },
                {
                    "name_bn": "টিএসপি (TSP)",
                    "nutrient": "Phosphorus (P)",
                    "rate_kg_bigha": 15.0,
                    "rate_kg_decimal": 0.45,
                    "total_quantity_kg": 30.0,
                },
            ],
            "application_schedule": [
                {"stage": "জমি তৈরির শেষ চাষ", "instructions_bn": "টিএসপি ও পটাশ সার প্রয়োগ করুন।"}
            ],
            "soil_health_notes": [
                {"title_bn": "মাটির পিএইচ আদর্শ", "message_bn": "pH সন্তোষজনক"}
            ],
        },
    )

    pdf_bytes = generate_advisory_pdf(history, farmer_name=user.name)

    # 1. Assert valid PDF header
    assert pdf_bytes.startswith(b"%PDF"), "Generated output is not a valid PDF file."

    # 2. Assert reasonable file size (contains embedded subset font data, > 10KB)
    assert len(pdf_bytes) > 10000, f"PDF file size ({len(pdf_bytes)} bytes) is too small to contain embedded font."

    # 3. Assert NotoSansBengali font embedding
    # ReportLab encodes TTFont references as /BaseFont /NotoSansBengali or similar in font dictionary
    assert b"NotoSansBengali" in pdf_bytes or b"Noto" in pdf_bytes, (
        "NotoSansBengali font was not found embedded in the PDF binary!"
    )
