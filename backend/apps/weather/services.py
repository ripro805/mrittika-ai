"""
Weather service integrating Open-Meteo API with 30-min cache, 10s timeout, custom User-Agent,
and district-specific climatological baselines based on BMD / BARC agro-ecological zones.
"""

import datetime
import logging
import os
from typing import Any, Dict

import requests
from django.core.cache import cache

from apps.crops.registry import BANGLADESH_DISTRICTS

logger = logging.getLogger(__name__)

CACHE_TTL = 1800  # 30 minutes
TIMEOUT_SECONDS = 10

# District-level climatological baselines based on Bangladesh Meteorological Department (BMD)
# & BARC Agro-Ecological Zones (AEZ).
# Format: (temperature_celsius, relative_humidity_pct, estimated_monthly_rainfall_mm)
DISTRICT_CLIMATOLOGY = {
    "Dinajpur":    {"rabi": (18.1, 73.0, 10.0), "k1": (32.5, 68.0, 95.0),  "k2": (29.2, 84.0, 310.0)},
    "Rangpur":     {"rabi": (18.4, 74.0, 11.0), "k1": (32.2, 69.0, 110.0), "k2": (29.0, 85.0, 330.0)},
    "Bogra":       {"rabi": (19.8, 73.0, 12.0), "k1": (33.0, 70.0, 115.0), "k2": (29.5, 84.0, 290.0)},
    "Rajshahi":    {"rabi": (19.2, 71.0, 9.0),  "k1": (35.5, 64.0, 90.0),  "k2": (30.1, 83.0, 260.0)},
    "Pabna":       {"rabi": (20.1, 72.0, 13.0), "k1": (34.0, 68.0, 105.0), "k2": (29.8, 84.0, 280.0)},
    "Kushtia":     {"rabi": (20.4, 72.0, 14.0), "k1": (34.2, 67.0, 110.0), "k2": (29.6, 84.0, 275.0)},
    "Jessore":     {"rabi": (21.2, 74.0, 16.0), "k1": (34.8, 69.0, 120.0), "k2": (29.4, 85.0, 300.0)},
    "Khulna":      {"rabi": (21.8, 79.0, 22.0), "k1": (33.5, 74.0, 135.0), "k2": (29.0, 87.0, 350.0)},
    "Barisal":     {"rabi": (22.8, 82.0, 26.0), "k1": (32.8, 76.0, 145.0), "k2": (28.8, 88.0, 380.0)},
    "Patuakhali":  {"rabi": (23.1, 83.0, 30.0), "k1": (32.5, 78.0, 160.0), "k2": (28.5, 89.0, 420.0)},
    "Dhaka":       {"rabi": (22.5, 68.0, 18.0), "k1": (33.2, 71.0, 130.0), "k2": (29.2, 85.0, 340.0)},
    "Gazipur":     {"rabi": (22.2, 69.0, 18.0), "k1": (33.0, 71.0, 128.0), "k2": (29.1, 85.0, 335.0)},
    "Tangail":     {"rabi": (21.2, 70.0, 17.0), "k1": (33.4, 70.0, 125.0), "k2": (29.3, 85.0, 320.0)},
    "Faridpur":    {"rabi": (21.9, 72.0, 19.0), "k1": (33.6, 71.0, 130.0), "k2": (29.4, 85.0, 315.0)},
    "Mymensingh":  {"rabi": (20.8, 75.0, 22.0), "k1": (32.0, 72.0, 140.0), "k2": (28.9, 86.0, 360.0)},
    "Jamalpur":    {"rabi": (20.2, 74.0, 18.0), "k1": (32.6, 71.0, 130.0), "k2": (29.0, 85.0, 345.0)},
    "Sylhet":      {"rabi": (20.5, 76.0, 35.0), "k1": (31.0, 75.0, 220.0), "k2": (28.2, 88.0, 520.0)},
    "Comilla":     {"rabi": (22.3, 72.0, 20.0), "k1": (32.5, 72.0, 140.0), "k2": (28.9, 86.0, 350.0)},
    "Noakhali":    {"rabi": (23.5, 79.0, 27.0), "k1": (32.2, 77.0, 160.0), "k2": (28.6, 88.0, 410.0)},
    "Chittagong":  {"rabi": (23.8, 77.0, 28.0), "k1": (32.0, 76.0, 175.0), "k2": (28.4, 87.0, 480.0)},
}


def get_district_seasonal_baseline(district_en: str) -> Dict[str, Any]:
    """
    Returns unique, district-specific seasonal climatological baseline data.
    """
    month = datetime.datetime.now().month
    if month in (11, 12, 1, 2):
        season_key = "rabi"
        season_name = "Rabi"
    elif month in (3, 4, 5):
        season_key = "k1"
        season_name = "Kharif-1"
    else:
        season_key = "k2"
        season_name = "Kharif-2"

    dist_profile = DISTRICT_CLIMATOLOGY.get(district_en)
    if not dist_profile:
        # Generic Bangladesh fallback if district is unknown
        temp, hum, rain = (22.5, 68.0, 20.0) if season_key == "rabi" else (32.5, 72.0, 130.0) if season_key == "k1" else (29.0, 86.0, 340.0)
    else:
        temp, hum, rain = dist_profile[season_key]

    return {
        "temperature": float(temp),
        "humidity": float(hum),
        "rainfall": float(rain),
        "season": season_name,
    }


def fetch_weather_for_district(district_name: str) -> Dict[str, Any]:
    cleaned = district_name.strip() if district_name else "Dhaka"

    # Match district metadata
    dist_meta = None
    for d in BANGLADESH_DISTRICTS:
        if (
            d["name_en"].lower() == cleaned.lower()
            or d["name_bn"] == cleaned
            or cleaned.lower() in d["name_en"].lower()
            or cleaned in d["name_bn"]
        ):
            dist_meta = d
            break

    if not dist_meta:
        dist_meta = BANGLADESH_DISTRICTS[1]  # Default to Dhaka

    cache_key = f"weather_openmeteo_{dist_meta['name_en'].lower()}"
    cached = cache.get(cache_key)
    if cached:
        return cached

    lat = dist_meta["lat"]
    lon = dist_meta["lon"]
    raw_url = os.getenv("OPEN_METEO_API_URL") or "https://api.open-meteo.com/v1/forecast"
    base_url = raw_url.strip("\"' ").rstrip("/")

    url = (
        f"{base_url}"
        f"?latitude={lat}&longitude={lon}"
        f"&current=temperature_2m,relative_humidity_2m,precipitation"
        f"&daily=precipitation_sum"
        f"&timezone=Asia%2FDhaka"
    )

    baseline = get_district_seasonal_baseline(dist_meta["name_en"])

    headers = {
        "User-Agent": "MrittikaAI/1.0 (Agricultural Intelligence Platform; contact@mrittika.ai)",
        "Accept": "application/json",
    }

    try:
        resp = requests.get(url, headers=headers, timeout=TIMEOUT_SECONDS)
        if resp.status_code == 200:
            data = resp.json()
            current = data.get("current", {})
            daily = data.get("daily", {})

            temp = current.get("temperature_2m", baseline["temperature"])
            hum = current.get("relative_humidity_2m", baseline["humidity"])

            # Estimate monthly rainfall from 7-day precipitation sum or current reading
            rain_daily = daily.get("precipitation_sum", [])
            if rain_daily:
                est_monthly_rain = round(sum(rain_daily[:7]) * 4.3, 1)
            else:
                est_monthly_rain = baseline["rainfall"]

            result = {
                "district": dist_meta["name_en"],
                "district_bn": dist_meta["name_bn"],
                "temperature": float(temp),
                "humidity": float(hum),
                "rainfall": float(est_monthly_rain),
                "season": baseline["season"],
                "source": "Open-Meteo",
                "fallback": False,
            }
            cache.set(cache_key, result, CACHE_TTL)
            return result
        else:
            logger.warning(
                "Open-Meteo returned status %d for %s (url: %s): %s",
                resp.status_code,
                dist_meta["name_en"],
                url,
                resp.text[:150],
            )
    except Exception as err:
        logger.warning("Open-Meteo request failed for %s, using district baseline: %s", dist_meta["name_en"], err)

    # Graceful district-specific climatological fallback
    fallback_result = {
        "district": dist_meta["name_en"],
        "district_bn": dist_meta["name_bn"],
        "temperature": baseline["temperature"],
        "humidity": baseline["humidity"],
        "rainfall": baseline["rainfall"],
        "season": baseline["season"],
        "source": "District Climatology (BMD/BARC)",
        "fallback": True,
        "note_bn": f"{dist_meta['name_bn']} জেলার গড় আঞ্চলিক তাপমাত্রা ও বৃষ্টিপাতের উপাত্ত ব্যবহার করা হয়েছে।",
    }
    # Cache fallback for 5 minutes so rapid reloads are fast
    cache.set(cache_key, fallback_result, 300)
    return fallback_result
