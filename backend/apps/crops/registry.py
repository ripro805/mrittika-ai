"""
Canonical Crop Registry, Soil & Season Normalizers, and District Geo Metadata.
"""

from typing import Any, Dict, Optional

CANONICAL_CROPS = [
    {
        "slug": "rice_aman",
        "name_bn": "আমন ধান",
        "name_en": "Aman Rice",
        "crop_model_name": "Aman Rice",
        "fert_model_name": "Rice_Aman",
        "fertilizer_supported": True,
        "group": "rice",
    },
    {
        "slug": "rice_aus",
        "name_bn": "আউশ ধান",
        "name_en": "Aus Rice",
        "crop_model_name": "Aus Rice",
        "fert_model_name": "Rice_Aus",
        "fertilizer_supported": True,
        "group": "rice",
    },
    {
        "slug": "rice_boro",
        "name_bn": "বোরো ধান",
        "name_en": "Boro Rice",
        "crop_model_name": "Boro Rice",
        "fert_model_name": "Rice_Boro",
        "fertilizer_supported": True,
        "group": "rice",
    },
    {
        "slug": "wheat",
        "name_bn": "গম",
        "name_en": "Wheat",
        "crop_model_name": "Wheat",
        "fert_model_name": "Wheat",
        "fertilizer_supported": True,
        "group": "wheat_maize",
    },
    {
        "slug": "maize",
        "name_bn": "ভুট্টা",
        "name_en": "Maize",
        "crop_model_name": "Maize",
        "fert_model_name": "Maize",
        "fertilizer_supported": True,
        "group": "wheat_maize",
    },
    {
        "slug": "potato",
        "name_bn": "আলু",
        "name_en": "Potato",
        "crop_model_name": "Potato",
        "fert_model_name": "Potato",
        "fertilizer_supported": True,
        "group": "potato",
    },
    {
        "slug": "jute",
        "name_bn": "পাট",
        "name_en": "Jute",
        "crop_model_name": "Jute",
        "fert_model_name": "Jute",
        "fertilizer_supported": True,
        "group": "jute",
    },
    {
        "slug": "mustard",
        "name_bn": "সরিষা",
        "name_en": "Mustard",
        "crop_model_name": "Mustard",
        "fert_model_name": "Mustard",
        "fertilizer_supported": True,
        "group": "pulses_oilseeds",
    },
    {
        "slug": "lentil",
        "name_bn": "মসুর ডাল",
        "name_en": "Lentil",
        "crop_model_name": "Lentil",
        "fert_model_name": "Lentil",
        "fertilizer_supported": True,
        "group": "pulses_oilseeds",
    },
    {
        "slug": "tomato",
        "name_bn": "টমেটো",
        "name_en": "Tomato",
        "crop_model_name": "Tomato",
        "fert_model_name": "Tomato",
        "fertilizer_supported": True,
        "group": "vegetables",
    },
    {
        "slug": "brinjal",
        "name_bn": "বেগুন",
        "name_en": "Brinjal",
        "crop_model_name": "Brinjal",
        "fert_model_name": "Brinjal",
        "fertilizer_supported": True,
        "group": "vegetables",
    },
    {
        "slug": "onion",
        "name_bn": "পেঁয়াজ",
        "name_en": "Onion",
        "crop_model_name": "Onion",
        "fert_model_name": "Onion",
        "fertilizer_supported": True,
        "group": "vegetables",
    },
    {
        "slug": "chilli",
        "name_bn": "মরিচ",
        "name_en": "Chilli",
        "crop_model_name": "Chilli",
        "fert_model_name": "Chilli",
        "fertilizer_supported": True,
        "group": "vegetables",
    },
    # The following 11 crops are supported in crop model but NOT in fertilizer model
    {
        "slug": "banana",
        "name_bn": "কলা",
        "name_en": "Banana",
        "crop_model_name": "Banana",
        "fert_model_name": None,
        "fertilizer_supported": False,
        "group": "perennial",
    },
    {
        "slug": "cauliflower_cabbage",
        "name_bn": "ফুলকপি / বাঁধাকপি",
        "name_en": "Cauliflower/Cabbage",
        "crop_model_name": "Cauliflower/Cabbage",
        "fert_model_name": None,
        "fertilizer_supported": False,
        "group": "vegetables",
    },
    {
        "slug": "garlic",
        "name_bn": "রসুন",
        "name_en": "Garlic",
        "crop_model_name": "Garlic",
        "fert_model_name": None,
        "fertilizer_supported": False,
        "group": "vegetables",
    },
    {
        "slug": "groundnut",
        "name_bn": "চিনাবাদাম",
        "name_en": "Groundnut",
        "crop_model_name": "Groundnut",
        "fert_model_name": None,
        "fertilizer_supported": False,
        "group": "pulses_oilseeds",
    },
    {
        "slug": "mango",
        "name_bn": "আম",
        "name_en": "Mango",
        "crop_model_name": "Mango",
        "fert_model_name": None,
        "fertilizer_supported": False,
        "group": "perennial",
    },
    {
        "slug": "mungbean",
        "name_bn": "মুগ ডাল",
        "name_en": "Mungbean",
        "crop_model_name": "Mungbean",
        "fert_model_name": None,
        "fertilizer_supported": False,
        "group": "pulses_oilseeds",
    },
    {
        "slug": "papaya",
        "name_bn": "পেঁপে",
        "name_en": "Papaya",
        "crop_model_name": "Papaya",
        "fert_model_name": None,
        "fertilizer_supported": False,
        "group": "perennial",
    },
    {
        "slug": "pumpkin",
        "name_bn": "মিষ্টি কুমড়া",
        "name_en": "Pumpkin",
        "crop_model_name": "Pumpkin",
        "fert_model_name": None,
        "fertilizer_supported": False,
        "group": "vegetables",
    },
    {
        "slug": "sesame",
        "name_bn": "তিল",
        "name_en": "Sesame",
        "crop_model_name": "Sesame",
        "fert_model_name": None,
        "fertilizer_supported": False,
        "group": "pulses_oilseeds",
    },
    {
        "slug": "sugarcane",
        "name_bn": "আখ",
        "name_en": "Sugarcane",
        "crop_model_name": "Sugarcane",
        "fert_model_name": None,
        "fertilizer_supported": False,
        "group": "perennial",
    },
    {
        "slug": "tea",
        "name_bn": "চা",
        "name_en": "Tea",
        "crop_model_name": "Tea",
        "fert_model_name": None,
        "fertilizer_supported": False,
        "group": "perennial",
    },
]

# Quick index maps
SLUG_TO_CROP = {c["slug"]: c for c in CANONICAL_CROPS}
CROP_MODEL_NAME_TO_CROP = {c["crop_model_name"]: c for c in CANONICAL_CROPS}
FERT_MODEL_NAME_TO_CROP = {c["fert_model_name"]: c for c in CANONICAL_CROPS if c["fert_model_name"]}


def get_crop_by_identifier(identifier: str) -> Optional[Dict[str, Any]]:
    if not identifier:
        return None
    ident = identifier.strip().lower()
    for c in CANONICAL_CROPS:
        if c["slug"].lower() == ident:
            return c
        if c["crop_model_name"].lower() == ident:
            return c
        if c["fert_model_name"] and c["fert_model_name"].lower() == ident:
            return c
        if c["name_en"].lower() == ident:
            return c
        if c["name_bn"] == identifier.strip():
            return c
    return None


# Normalizers for Soil Types
def normalize_soil_for_crop(soil: str) -> str:
    s = soil.strip().title()
    mapping = {
        "Silt Loam": "Silty Loam",
        "Silty Loam": "Silty Loam",
        "Clay": "Clay",
        "Clay Loam": "Clay Loam",
        "Loam": "Loam",
        "Loam (Acidic Hill Soil)": "Loam (Acidic Hill Soil)",
        "Sandy": "Sandy",
        "Sandy Loam": "Sandy Loam",
        "Silty Clay": "Silty Clay",
    }
    return mapping.get(s, "Loam")


def normalize_soil_for_fertilizer(soil: str) -> str:
    s = soil.strip().title()
    mapping = {
        "Silty Loam": "Silt Loam",
        "Silt Loam": "Silt Loam",
        "Clay": "Clay",
        "Clay Loam": "Clay Loam",
        "Loam": "Loam",
        "Loam (Acidic Hill Soil)": "Loam",
        "Sandy": "Sandy Loam",
        "Sandy Loam": "Sandy Loam",
        "Silty Clay": "Clay",
    }
    return mapping.get(s, "Loam")


# Normalizers for Seasons
def normalize_season_for_crop(season: str) -> str:
    mapping = {
        "kharif-1": "Kharif-1",
        "kharif-2": "Kharif-2",
        "rabi": "Rabi",
        "perennial": "Perennial",
        "year-round": "Year-round",
    }
    return mapping.get(season.strip().lower(), "Rabi")


def normalize_season_for_fertilizer(season: str) -> str:
    mapping = {
        "kharif-1": "Kharif-1",
        "kharif-2": "Kharif-2",
        "rabi": "Rabi",
        "perennial": "Rabi",      # closest agronomic proxy
        "year-round": "Kharif-1",
    }
    return mapping.get(season.strip().lower(), "Rabi")


# Districts with Coordinates
BANGLADESH_DISTRICTS = [
    {"name_en": "Bogra", "name_bn": "বগুড়া", "division": "Rajshahi", "lat": 24.8465, "lon": 89.3777},
    {"name_en": "Dhaka", "name_bn": "ঢাকা", "division": "Dhaka", "lat": 23.8103, "lon": 90.4125},
    {"name_en": "Chittagong", "name_bn": "চট্টগ্রাম", "division": "Chittagong", "lat": 22.3569, "lon": 91.7832},
    {"name_en": "Rajshahi", "name_bn": "রাজশাহী", "division": "Rajshahi", "lat": 24.3636, "lon": 88.6241},
    {"name_en": "Khulna", "name_bn": "খুলনা", "division": "Khulna", "lat": 22.8456, "lon": 89.5403},
    {"name_en": "Barisal", "name_bn": "বরিশাল", "division": "Barisal", "lat": 22.7010, "lon": 90.3535},
    {"name_en": "Sylhet", "name_bn": "সিলেট", "division": "Sylhet", "lat": 24.8949, "lon": 91.8687},
    {"name_en": "Rangpur", "name_bn": "রংপুর", "division": "Rangpur", "lat": 25.7439, "lon": 89.2752},
    {"name_en": "Mymensingh", "name_bn": "ময়মনসিংহ", "division": "Mymensingh", "lat": 24.7471, "lon": 90.4203},
    {"name_en": "Comilla", "name_bn": "কুমিল্লা", "division": "Chittagong", "lat": 23.4682, "lon": 91.1788},
    {"name_en": "Dinajpur", "name_bn": "দিনাজপুর", "division": "Rangpur", "lat": 25.6217, "lon": 88.6355},
    {"name_en": "Jessore", "name_bn": "যশোর", "division": "Khulna", "lat": 23.1664, "lon": 89.2081},
    {"name_en": "Faridpur", "name_bn": "ফরিদপুর", "division": "Dhaka", "lat": 23.6071, "lon": 89.8429},
    {"name_en": "Pabna", "name_bn": "পাবনা", "division": "Rajshahi", "lat": 24.0064, "lon": 89.2372},
    {"name_en": "Tangail", "name_bn": "টাঙ্গাইল", "division": "Dhaka", "lat": 24.2513, "lon": 89.9167},
    {"name_en": "Jamalpur", "name_bn": "জামালপুর", "division": "Mymensingh", "lat": 24.9375, "lon": 89.9378},
    {"name_en": "Kushtia", "name_bn": "কুষ্টিয়া", "division": "Khulna", "lat": 23.9013, "lon": 89.1205},
    {"name_en": "Noakhali", "name_bn": "নোয়াখালী", "division": "Chittagong", "lat": 22.8696, "lon": 91.0994},
    {"name_en": "Patuakhali", "name_bn": "পটুয়াখালী", "division": "Barisal", "lat": 22.3596, "lon": 90.3299},
    {"name_en": "Gazipur", "name_bn": "গাজীপুর", "division": "Dhaka", "lat": 24.0023, "lon": 90.4264},
]
