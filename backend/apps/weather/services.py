"""
Weather service integrating Open-Meteo API with 30-min cache, 5s timeout, and graceful fallback.
"""

import datetime
import os
from typing import Any, Dict

import requests
from django.core.cache import cache

from apps.crops.registry import BANGLADESH_DISTRICTS

CACHE_TTL = 1800  # 30 minutes
TIMEOUT_SECONDS = 5


def get_seasonal_fallback() -> Dict[str, float]:
    month = datetime.datetime.now().month
    if month in (11, 12, 1, 2):  # Rabi / Winter
        return {"temperature": 22.5, "humidity": 65.0, "rainfall": 20.0, "season": "Rabi"}
    elif month in (3, 4, 5):      # Kharif-1 / Summer
        return {"temperature": 32.0, "humidity": 70.0, "rainfall": 120.0, "season": "Kharif-1"}
    else:                         # Kharif-2 / Monsoon
        return {"temperature": 29.0, "humidity": 85.0, "rainfall": 320.0, "season": "Kharif-2"}


def fetch_weather_for_district(district_name: str) -> Dict[str, Any]:
    cleaned = district_name.strip().title() if district_name else "Dhaka"

    # Match district coordinates
    dist_meta = None
    for d in BANGLADESH_DISTRICTS:
        if d["name_en"].lower() == cleaned.lower() or d["name_bn"] == district_name.strip():
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
    base_url = os.getenv("OPEN_METEO_API_URL", "https://api.open-meteo.com/v1/forecast").rstrip("/")
    url = (
        f"{base_url}"
        f"?latitude={lat}&longitude={lon}"
        f"&current=temperature_2m,relative_humidity_2m,precipitation"
        f"&daily=precipitation_sum"
        f"&timezone=Asia%2FDhaka"
    )

    try:
        resp = requests.get(url, timeout=TIMEOUT_SECONDS)
        if resp.status_code == 200:
            data = resp.json()
            current = data.get("current", {})
            daily = data.get("daily", {})

            temp = current.get("temperature_2m", 25.0)
            hum = current.get("relative_humidity_2m", 75.0)
            # Estimate monthly rainfall from daily sum or current
            rain_daily = daily.get("precipitation_sum", [10.0])
            est_monthly_rain = round(sum(rain_daily[:7]) * 4, 1) if rain_daily else 100.0

            fallback_data = get_seasonal_fallback()
            result = {
                "district": dist_meta["name_en"],
                "district_bn": dist_meta["name_bn"],
                "temperature": float(temp),
                "humidity": float(hum),
                "rainfall": float(est_monthly_rain),
                "season": fallback_data["season"],
                "source": "Open-Meteo",
                "fallback": False,
            }
            cache.set(cache_key, result, CACHE_TTL)
            return result
    except Exception as err:
        import logging
        logging.getLogger(__name__).debug("Open-Meteo request failed, using fallback: %s", err)

    # Graceful failure fallback
    fallback = get_seasonal_fallback()
    fallback_result = {
        "district": dist_meta["name_en"],
        "district_bn": dist_meta["name_bn"],
        "temperature": fallback["temperature"],
        "humidity": fallback["humidity"],
        "rainfall": fallback["rainfall"],
        "season": fallback["season"],
        "source": "Seasonal Climatology (Fallback)",
        "fallback": True,
        "note_bn": "আবহাওয়া সার্ভারের সংযোগ বিঘ্নিত হওয়ায় ঋতুভিত্তিক গড় তাপমাত্রা ও বৃষ্টিপাত ব্যবহার করা হয়েছে।",
    }
    return fallback_result
