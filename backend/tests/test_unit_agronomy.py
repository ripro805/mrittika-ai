"""
Unit tests for agronomic rules, canonical crop registry, soil normalizers, and unit conversions.
"""

from apps.crops.registry import (
    CANONICAL_CROPS,
    get_crop_by_identifier,
    normalize_season_for_crop,
    normalize_season_for_fertilizer,
    normalize_soil_for_crop,
    normalize_soil_for_fertilizer,
)
from apps.recommendations.agronomic_rules import (
    generate_application_schedule,
    generate_soil_health_notes,
)
from apps.recommendations.services import get_safety_caps


def test_canonical_crop_registry_completeness():
    assert len(CANONICAL_CROPS) == 24
    supported = [c for c in CANONICAL_CROPS if c["fertilizer_supported"]]
    assert len(supported) == 13

    # Test identifiers
    aman = get_crop_by_identifier("rice_aman")
    assert aman is not None
    assert aman["name_bn"] == "আমন ধান"
    assert aman["fert_model_name"] == "Rice_Aman"

    wheat = get_crop_by_identifier("Wheat")
    assert wheat["slug"] == "wheat"

    tea = get_crop_by_identifier("tea")
    assert tea["fertilizer_supported"] is False


def test_soil_normalization():
    # Crop expects Silty Loam
    assert normalize_soil_for_crop("Silt Loam") == "Silty Loam"
    assert normalize_soil_for_crop("Silty Loam") == "Silty Loam"
    assert normalize_soil_for_crop("Loam") == "Loam"

    # Fertilizer expects Silt Loam
    assert normalize_soil_for_fertilizer("Silty Loam") == "Silt Loam"
    assert normalize_soil_for_fertilizer("Silt Loam") == "Silt Loam"
    assert normalize_soil_for_fertilizer("Loam (Acidic Hill Soil)") == "Loam"
    assert normalize_soil_for_fertilizer("Silty Clay") == "Clay"
    assert normalize_soil_for_fertilizer("Sandy") == "Sandy Loam"


def test_season_normalization():
    assert normalize_season_for_crop("kharif-1") == "Kharif-1"
    assert normalize_season_for_crop("rabi") == "Rabi"
    assert normalize_season_for_crop("perennial") == "Perennial"

    assert normalize_season_for_fertilizer("rabi") == "Rabi"
    assert normalize_season_for_fertilizer("perennial") == "Rabi"


def test_application_schedule_rules():
    rice_sched = generate_application_schedule("rice_aman", "rice", "Urea+TSP+MoP")
    assert len(rice_sched) == 4
    stages = [s["stage"] for s in rice_sched]
    assert any("১ম কিস্তি" in s for s in stages)
    assert any("২য় কিস্তি" in s for s in stages)
    assert any("৩য় কিস্তি" in s for s in stages)

    potato_sched = generate_application_schedule("potato", "potato", "Urea+TSP+MoP")
    assert len(potato_sched) == 2
    assert any("Earthing Up" in s["stage"] or "মাটি তুলে" in s["stage"] for s in potato_sched)


def test_soil_health_notes():
    # Acidic soil
    acidic_notes = generate_soil_health_notes(ph=4.8, organic_matter=1.0)
    assert any("অম্লীয়" in n["title_bn"] for n in acidic_notes)
    assert any("ঘাটতি" in n["title_bn"] for n in acidic_notes)

    # Alkaline soil
    alkaline_notes = generate_soil_health_notes(ph=8.4, organic_matter=3.0)
    assert any("ক্ষারীয়" in n["title_bn"] for n in alkaline_notes)
    assert any("সন্তোষজনক" in n["title_bn"] for n in alkaline_notes)


def test_safety_caps_loaded():
    caps = get_safety_caps()
    assert "per_crop" in caps
    assert "Rice_Aman" in caps["per_crop"]
    assert "urea_kg_ha" in caps["per_crop"]["Rice_Aman"]
    assert caps["per_crop"]["Rice_Aman"]["urea_kg_ha"] > 0
