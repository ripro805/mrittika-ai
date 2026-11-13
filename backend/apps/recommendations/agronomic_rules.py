"""
Agronomic rule-based engine for indicative application schedules and soil-health diagnostics.
"""

from typing import Any, Dict, List


def generate_application_schedule(crop_slug: str, group: str, plan_name: str) -> List[Dict[str, Any]]:
    """Generates an indicative split schedule based on crop agronomy."""
    if group == "rice":
        return [
            {
                "stage": "জমি তৈরির শেষ চাষ (Basal Application)",
                "timing": "চারা রোপণের আগে জমি প্রস্তুতকালে",
                "instructions_bn": "সমস্ত টিএসপি, জিপসাম, জিংক সালফেট এবং ৫০% এমওপি (পটাশ) মাটির সাথে ভালোভাবে মিশিয়ে দিন।",
                "applicable_fertilizers": ["TSP", "MoP (50%)", "Gypsum", "Zinc Sulphate", "Compost"],
            },
            {
                "stage": "১ম কিস্তি উপরিপ্রয়োগ (First Top Dressing)",
                "timing": "চারা রোপণের ১৫-২০ দিন পর (কুশি গজানোর সময়)",
                "instructions_bn": "মোট ইউরিয়া সারের এক-তৃতীয়াংশ (১/৩ অংশ) জমিতে ছিটান। এসময় জমিতে হালকা পানি থাকা ভালো।",
                "applicable_fertilizers": ["Urea (33%)"],
            },
            {
                "stage": "২য় কিস্তি উপরিপ্রয়োগ (Second Top Dressing)",
                "timing": "চারা রোপণের ৩৫-৪০ দিন পর (সর্বোচ্চ কুশি পর্যায়)",
                "instructions_bn": "মোট ইউরিয়ার এক-তৃতীয়াংশ (১/৩ অংশ) সমানভাবে জমিতে প্রয়োগ করুন।",
                "applicable_fertilizers": ["Urea (33%)"],
            },
            {
                "stage": "৩য় কিস্তি উপরিপ্রয়োগ (Third Top Dressing)",
                "timing": "কাইচ থোড় আসার ৫-৭ দিন আগে (ফুল ফোটার পূর্বে)",
                "instructions_bn": "অবশিষ্ট এক-তৃতীয়াংশ ইউরিয়া এবং বাকি ৫০% এমওপি প্রয়োগ করুন। এটি দানার পুষ্টি বৃদ্ধি করে।",
                "applicable_fertilizers": ["Urea (34%)", "MoP (50%)"],
            },
        ]
    elif group == "potato":
        return [
            {
                "stage": "জমি তৈরির শেষ চাষ (Basal)",
                "timing": "আলুর বীজ রোপণের পূর্বে",
                "instructions_bn": "সম্পূর্ণ টিএসপি, জিপসাম, জিংক এবং মোট ইউরিয়া ও পটাশের অর্ধেক (৫০%) জমি তৈরির সময় দিন।",
                "applicable_fertilizers": ["TSP", "Gypsum", "Zinc Sulphate", "Urea (50%)", "MoP (50%)"],
            },
            {
                "stage": "গোড়ায় মাটি তুলে দেওয়ার সময় (Earthing Up)",
                "timing": "রোপণের ৩০-৩৫ দিন পর",
                "instructions_bn": "অবশিষ্ট ৫০% ইউরিয়া ও ৫০% পটাশ সার গাছের সারির দুই পাশে দিয়ে গাছের গোড়ায় মাটি তুলে দিন এবং সেচ দিন।",
                "applicable_fertilizers": ["Urea (50%)", "MoP (50%)"],
            },
        ]
    elif group == "wheat_maize":
        return [
            {
                "stage": "জমি তৈরি (Basal)",
                "timing": "বীজ বপনের সময়",
                "instructions_bn": "সম্পূর্ণ টিএসপি, এমওপি, জিপসাম এবং এক-তৃতীয়াংশ ইউরিয়া জমি তৈরির শেষ চাষে প্রয়োগ করুন।",
                "applicable_fertilizers": ["TSP", "MoP", "Gypsum", "Urea (33%)"],
            },
            {
                "stage": "প্রথম সেচ পর্যায় (CRI / Knee-high Stage)",
                "timing": "বপনের ২০-২৫ দিন পর (১ম সেচের সময়)",
                "instructions_bn": "এক-তৃতীয়াংশ ইউরিয়া উপরিপ্রয়োগ করুন।",
                "applicable_fertilizers": ["Urea (33%)"],
            },
            {
                "stage": "শীষ বের হওয়ার পূর্বাবস্থায় (Booting Stage)",
                "timing": "বপনের ৫০-৫৫ দিন পর",
                "instructions_bn": "অবশিষ্ট এক-তৃতীয়াংশ ইউরিয়া প্রয়োগ করুন।",
                "applicable_fertilizers": ["Urea (34%)"],
            },
        ]
    elif group == "vegetables":
        return [
            {
                "stage": "জমি প্রস্তুতি ও মাদার গর্ত তৈরি (Basal)",
                "timing": "চারা রোপণের ৫-৭ দিন আগে",
                "instructions_bn": "সম্পূর্ণ জৈব সার/কম্পোস্ট, টিএসপি এবং জিপসাম মাদার মাটির সাথে মিশিয়ে দিন।",
                "applicable_fertilizers": ["Compost", "TSP", "Gypsum"],
            },
            {
                "stage": "১ম কিস্তি উপরিপ্রয়োগ",
                "timing": "চারা রোপণের ১৫-২০ দিন পর",
                "instructions_bn": "মোট ইউরিয়া ও পটাশের এক-তৃতীয়াংশ গাছের গোড়া থেকে ৫-৬ ইঞ্চি দূরে রিং পদ্ধতিতে প্রয়োগ করুন।",
                "applicable_fertilizers": ["Urea (33%)", "MoP (33%)"],
            },
            {
                "stage": "২য় ও ৩য় কিস্তি উপরিপ্রয়োগ",
                "timing": "ফুল আসার সময় এবং ফল ধরার পর (৩৫ ও ৫০ দিন পর)",
                "instructions_bn": "অবশিষ্ট ইউরিয়া ও পটাশ সমান দুই ভাগে উপরিপ্রয়োগ করে সেচ দিন।",
                "applicable_fertilizers": ["Urea (67%)", "MoP (67%)"],
            },
        ]
    elif group == "jute":
        return [
            {
                "stage": "জমি প্রস্তুতি (Basal)",
                "timing": "বীজ বপনের সময়",
                "instructions_bn": "সম্পূর্ণ টিএসপি, এমওপি এবং অর্ধেক ইউরিয়া জমি তৈরির সময় মাটিতে মিশিয়ে দিন।",
                "applicable_fertilizers": ["TSP", "MoP", "Urea (50%)"],
            },
            {
                "stage": "নিড়ানি ও পাতলাকরণের পর (Top Dressing)",
                "timing": "বপনের ৪০-৪৫ দিন পর",
                "instructions_bn": "বাকি ৫০% ইউরিয়া মাটিতে উপযুক্ত রস থাকা অবস্থায় উপরিপ্রয়োগ করুন।",
                "applicable_fertilizers": ["Urea (50%)"],
            },
        ]
    else:  # Pulses, Oilseeds, Perennial fallback
        return [
            {
                "stage": "জমি তৈরির শেষ চাষ (Basal Application)",
                "timing": "বীজ বপনের সময়",
                "instructions_bn": "অনুমোদিত সমস্ত সার জমি তৈরির শেষ চাষের সময় মাটির সাথে ভালোভাবে মিশিয়ে প্রয়োগ করুন।",
                "applicable_fertilizers": ["Urea", "TSP", "MoP", "Gypsum", "Compost"],
            }
        ]


def generate_soil_health_notes(
    ph: float,
    organic_matter: float = None,
    s: float = None,
    zn: float = None,
) -> List[Dict[str, str]]:
    """Generates soil health alerts and recommendations based on chemical indicators."""
    notes = []

    # pH Diagnostics
    if ph < 5.5:
        notes.append({
            "type": "warning",
            "parameter": "pH",
            "title_bn": "মাটি অতিরিক্ত অম্লীয় (Acidic Soil)",
            "message_bn": f"আপনার মাটির pH {ph:.2f}, যা অম্লীয়। এতে উদ্ভিদের খাদ্য উপাদান গ্রহণ ব্যাহত হয়। ফসল বপনের অন্তত ২-৩ সপ্তাহ আগে বিঘা প্রতি ৩০-৪০ কেজি ডলোমাইট চুন প্রয়োগ করুন।",
        })
    elif ph > 8.0:
        notes.append({
            "type": "warning",
            "parameter": "pH",
            "title_bn": "মাটি ক্ষারীয় (Alkaline Soil)",
            "message_bn": f"আপনার মাটির pH {ph:.2f}, যা ক্ষারীয়। কোনো অবস্থাতেই জমিতে চুন প্রয়োগ করবেন না। অতিরিক্ত জৈব সার ব্যবহারে মাটির ভারসাম্য ফিরে আসবে।",
        })
    else:
        notes.append({
            "type": "success",
            "parameter": "pH",
            "title_bn": "মাটির পিএইচ (pH) আদর্শ মাত্রায় রয়েছে",
            "message_bn": f"মাটির pH {ph:.2f} ফসল উৎপাদনের জন্য অত্যন্ত অনুকূল।",
        })

    # Organic Matter Diagnostics
    if organic_matter is not None:
        if organic_matter < 1.5:
            notes.append({
                "type": "warning",
                "parameter": "organic_matter",
                "title_bn": "জৈব পদার্থের তীব্র ঘাটতি",
                "message_bn": f"মাটিতে জৈব পদার্থ মাত্র {organic_matter:.2f}%, যেখানে আদর্শ মাত্রা ২.৫% থেকে ৫%। প্রতি মৌসুমে জমিতে ধইঞ্চা সবুজ সার বা ভার্মিকম্পোস্ট প্রয়োগ করুন।",
            })
        else:
            notes.append({
                "type": "success",
                "parameter": "organic_matter",
                "title_bn": "সন্তোষজনক জৈব পদার্থ",
                "message_bn": f"জৈব পদার্থের পরিমাণ {organic_matter:.2f}%, যা মাটির আর্দ্রতা ও অনুজীব রক্ষায় সহায়ক।",
            })

    # Micronutrient Diagnostics
    if s is not None and s < 10.0:
        notes.append({
            "type": "info",
            "parameter": "sulfur",
            "title_bn": "সালফার / গন্ধকের ঘাটতি",
            "message_bn": "মাটিতে সালফারের মাত্রা কম থাকায় পাতা হলুদ হতে পারে। অনুমোদিত মাত্রায় জিপসাম সার ব্যবহার করুন।",
        })

    if zn is not None and zn < 1.0:
        notes.append({
            "type": "info",
            "parameter": "zinc",
            "title_bn": "দস্তা / জিঙ্কের ঘাটতি",
            "message_bn": "দস্তার ঘাটতিতে ধানের পাতার গোড়া লালচে-বাদামী হতে পারে। জমি তৈরিতে জিংক সালফেট প্রয়োগ নিশ্চিত করুন।",
        })

    return notes
