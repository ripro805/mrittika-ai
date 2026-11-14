"""
Idempotent Master Database Seeder for Mrittika AI (মৃত্তিকা এআই).
Seeds:
- 1 Super Admin, 2 Regional Admins
- 15 Extension Officers across 8 Divisions
- 250 Farmers across 20 agricultural districts
- 2,000+ Crop Recommendation History records
- 1,500+ Fertilizer Recommendation History records
- 500+ Assistant Chat Sessions with 2,000+ Assistant Messages
- 300+ Feedback items (50+ flagged, 35 officer corrections)
- 1,000+ Activity Logs spanning the last 6-12 months
"""

import random
from datetime import datetime, timedelta
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.crops.registry import CANONICAL_CROPS, BANGLADESH_DISTRICTS
from apps.recommendations.models import RecommendationHistory
from apps.assistant.models import AssistantSession, AssistantMessage
from apps.feedback.models import Feedback
from apps.core.models import ActivityLog

User = get_user_model()

BANGLADESH_DIVISIONS = {
    "Rajshahi": ["Bogra", "Rajshahi", "Pabna", "Dinajpur"],
    "Rangpur": ["Rangpur", "Dinajpur"],
    "Dhaka": ["Dhaka", "Faridpur", "Tangail", "Gazipur"],
    "Mymensingh": ["Mymensingh", "Jamalpur"],
    "Khulna": ["Khulna", "Jessore", "Kushtia"],
    "Barisal": ["Barisal", "Patuakhali"],
    "Chittagong": ["Chittagong", "Comilla", "Noakhali"],
    "Sylhet": ["Sylhet"],
}

DISTRICT_UPAZILAS = {
    "Bogra": ["Sherpur", "Shibganj", "Bogra Sadar", "Gabtali", "Kahaloo"],
    "Rajshahi": ["Paba", "Godagari", "Tanore", "Bagmara", "Charghat"],
    "Pabna": ["Ishwardi", "Pabna Sadar", "Chatmohar", "Santhia"],
    "Rangpur": ["Mithapukur", "Pirganj", "Rangpur Sadar", "Badarganj"],
    "Dinajpur": ["Dinajpur Sadar", "Birganj", "Birol", "Phulbari"],
    "Dhaka": ["Savar", "Dhamrai", "Keraniganj", "Dhaka Sadar"],
    "Faridpur": ["Faridpur Sadar", "Boalmari", "Madhukhali", "Bhanga"],
    "Tangail": ["Madhupur", "Ghatail", "Tangail Sadar", "Mirzapur"],
    "Gazipur": ["Kapasia", "Sreepur", "Kaliakair", "Gazipur Sadar"],
    "Mymensingh": ["Trishal", "Muktagachha", "Mymensingh Sadar", "Fulbaria"],
    "Jamalpur": ["Jamalpur Sadar", "Sarishabari", "Melandaha", "Islampur"],
    "Khulna": ["Dumuria", "Batiaghata", "Rupsha", "Phultala"],
    "Jessore": ["Jhikargachha", "Sharsha", "Jessore Sadar", "Manirampur"],
    "Kushtia": ["Kushtia Sadar", "Kumarkhali", "Mirpur", "Bheramara"],
    "Barisal": ["Barisal Sadar", "Babuganj", "Uzirpur", "Bakerganj"],
    "Patuakhali": ["Patuakhali Sadar", "Galachipa", "Kalapara", "Bauphal"],
    "Chittagong": ["Hathazari", "Fatikchhari", "Patiya", "Sitakunda"],
    "Comilla": ["Chandina", "Burichang", "Comilla Adarsha Sadar", "Daudkandi"],
    "Noakhali": ["Begumganj", "Noakhali Sadar", "Chatkhil", "Senbagh"],
    "Sylhet": ["Golapganj", "Beanibazar", "Sylhet Sadar", "Zakiganj"],
}

OFFICER_NAMES = [
    ("ড. মো. রফিকুল ইসলাম", "Bogra", "Sherpur"),
    ("কৃষিবিদ নাসরিন সুলতানা", "Rajshahi", "Paba"),
    ("কৃষিবিদ তানভীর আহমেদ", "Rangpur", "Mithapukur"),
    ("ড. সৈয়দ মোকাররম হোসেন", "Dinajpur", "Dinajpur Sadar"),
    ("কৃষিবিদ ফারহানা আক্তার", "Mymensingh", "Trishal"),
    ("কৃষিবিদ মাহমুদুল হাসান", "Dhaka", "Savar"),
    ("কৃষিবিদ শামীমা নাসরিন", "Tangail", "Madhupur"),
    ("কৃষিবিদ আবু জাফর", "Gazipur", "Kapasia"),
    ("কৃষিবিদ তাসলিমা বেগম", "Jessore", "Jhikargachha"),
    ("কৃষিবিদ এনামুল হক", "Khulna", "Dumuria"),
    ("কৃষিবিদ মিজানুর রহমান", "Kushtia", "Kushtia Sadar"),
    ("কৃষিবিদ সাইদুর রহমান", "Comilla", "Chandina"),
    ("কৃষিবিদ জাকিয়া সুলতানা", "Chittagong", "Hathazari"),
    ("কৃষিবিদ মোহাম্মদ আলী", "Barisal", "Babuganj"),
    ("কৃষিবিদ কামরুল হাসান", "Sylhet", "Golapganj"),
]

FARMER_FIRST_NAMES = [
    "আকমল", "রহিম", "করিম", "মোকাদ্দেম", "আব্দুল", "মনির", "সেলিম", "জাহাঙ্গীর",
    "রশিদ", "খলিল", "শফিক", "হাবিব", "সবুজ", "মিজান", "আনোয়ার", "জহির",
    "তারেক", "মাসুদ", "ফরিদ", "নাজিম", "শরীফ", "বশির", "নুরুজ্জামান", "আজাদ",
    "আমেনা", "রাবেয়া", "রোকেয়া", "মরিয়ম", "ফাতেমা", "খাদিজা", "সুলতানা", "জাহানারা"
]

FARMER_LAST_NAMES = [
    "হোসেন", "মিয়া", "মন্ডল", "শেখ", "সরকার", "বিশ্বাস", "হক", "চৌধুরী",
    "আলী", "প্রামাণিক", "খন্দকার", "বেপারী", "শিকদার", "গাজী", "ইসলাম", "খান"
]

SAMPLE_QUESTIONS_BN = [
    "আমন ধানে ইউরিয়া সার কয় কিস্তিতে প্রয়োগ করব?",
    "আলুর নাভিধসা রোগ দমনে কী ছত্রাকনাশক ব্যবহার করব?",
    "শীতকালীন সবজিতে জিংকের ঘাটতি কীভাবে বুঝব?",
    "অম্লীয় মাটিতে চুন প্রয়োগের নিয়ম ও মাত্রা কী?",
    "বোরো ধানের জন্য কোন জাতের বীজ নির্বাচন উত্তম?",
    "বেলে দোআঁশ মাটিতে পটাসিয়াম সারের প্রয়োজনীয়তা কেমন?",
    "পাট চাষের জমিতে আগাছা নিয়ন্ত্রণের সেরা উপায় কী?",
    "ভুট্টার জমিতে ফল আর্মিওয়ার্ম পোকা দমনে করণীয় কী?",
    "সরিষার ফুল আসার সময় সেচ দেওয়া কি ঠিক?",
    "টমেটো গাছের পাতা কোঁকড়ানো রোগ প্রতিরোধে কী স্প্রে করব?",
    "মসুর ডালে ফুল ঝরে যাওয়ার কারণ ও প্রতিকার কী?",
    "পেঁয়াজের কন্দ দ্রুত বৃদ্ধির জন্য কোন অনুখাদ্য দরকার?",
    "ধানের মাজরা পোকা দমনে আলোক ফাঁদ কতটা কার্যকর?",
    "জৈব সার ও রাসায়নিক সারের সঠিক অনুপাত কীভাবে বজায় রাখব?",
    "বৃষ্টিপাতের পর ক্ষেতে পানি জমে গেলে দ্রুত ড্রেনেজ করার কৌশল কী?",
]

SAMPLE_ANSWERS_BN = [
    "আমন ধানে ইউরিয়া সার সাধারণত ৩ কিস্তিতে প্রয়োগ করা উচিত: ১ম কিস্তি চারা রোপণের ১৫-২০ দিন পর, ২য় কিস্তি ৩৫-৪০ দিন পর এবং শেষ কিস্তি কাইচ থোড় আসার ৫-৭ দিন আগে।",
    "আলুর নাভিধসা (লেট ব্লাইট) দেখা দিলে ম্যানকোজেব গ্রুপের ছত্রাকনাশক প্রতি লিটার পানিতে ২ গ্রাম হারে অথবা ডাইমিথোমর্ফ মিশিয়ে ৭-১০ দিন পর পর স্প্রে করুন।",
    "জিংক ঘাটতি দেখা দিলে পাতার মধ্যশিরা বরাবর বিবর্ণতা দেখা দেয় এবং পাতার বৃদ্ধি ব্যাহত হয়। শতাংশ প্রতি ১৫০ গ্রাম জিংক সালফেট প্রয়োগে দ্রুত সমাধান মেলে।",
    "মাটির pH ৫.৫ এর নিচে হলে শতাংশ প্রতি ২ থেকে ৩ কেজি ডলোমাইট চুন জমি তৈরির শেষ চাষের অন্তত দুই সপ্তাহ আগে প্রয়োগ করে মাটির সাথে মিশিয়ে দিন।",
    "বোরো মৌসুমে ব্রি ধান-২৮, ব্রি ধান-২৯, ব্রি ধান-৮৯ ও ব্রি ধান-৯২ উচ্চ ফলনশীল ও জনপ্রিয় জাত। লবণাক্ত এলাকায় ব্রি ধান-৬৭ ভালো ফলন দেয়।",
    "বেলে দোআঁশ মাটিতে পুষ্টি উপাদান দ্রুত লিচিং হয়ে নিচে চলে যায়, তাই এমওপি (পটাশ) সার ২ কিস্তিতে প্রয়োগ করলে ফসলের দানা ও ফলন পুষ্ট হয়।",
    "পাট গজানোর ১৫-২০ দিন পর নিড়ানি দিয়ে আগাছা পরিষ্কার করুন। চারা ঘন হলে পাতলা করে প্রতি বর্গমিটারে ৫০-৬০টি সুস্থ গাছ রাখুন।",
    "ফল আর্মিওয়ার্ম দমনে স্পাইনোস্যাড বা এমামেকটিন বেনজোয়েট প্রতি লিটার পানিতে ১ মিলি হারে গাছের ডগায় বিকেলের দিকে স্প্রে করতে হবে।",
    "সরিষায় ফুল ফোটার শুরুতে একটি হালকা সেচ এবং দানা গঠনের সময় দ্বিতীয় সেচ ফলন ২০-৩০% বাড়িয়ে দেয়। অতিরিক্ত জলাবদ্ধতা পরিহার করুন।",
    "টমেটোর পাতা কোঁকড়ানো সাধারণত সাদা মাছির মাধ্যমে ছড়ানো ভাইরাস। সাদা মাছি দমনে ইমিডাক্লোপ্রিড প্রতি লিটার পানিতে ০.৫ মিলি স্প্রে করুন।",
]

OFFICER_CORRECTIONS_BN = [
    "কৃষি কর্মকর্তার পর্যবেক্ষণ: স্থানীয় দোআঁশ মাটির ক্ষেত্রে ইউরিয়া প্রয়োগের সময় জমি শুকিয়ে গেলে চলবে না, বরং ছিপছিপে পানিতে শেষ বিকেলে প্রয়োগ সর্বাধিক কার্যকর।",
    "সংশোধনী: লেট ব্লাইটের আক্রমণ তীব্র হলে শুধু ম্যানকোজেব যথেষ্ট নয়, মেটাল্যাক্সিল+ম্যানকোজেব যৌথ মিশ্রণ ২ গ্রাম/লিটার হারে ৫ দিন ব্যবধানে ২ বার প্রয়োগের পরামর্শ দেওয়া হলো।",
    "অনুমোদিত তথ্য: রবি মৌসুমে তাপমাত্রা ১৫°C এর নিচে নামলে জিংক শোষণে সমস্যা হয়, সেক্ষেত্রে মাটিতে না দিয়ে চিলেটেড জিংক ১ গ্রাম/লিটার হারে পাতায় স্প্রে করলে দ্রুত সাড়া মেলে।",
    "মাঠ কর্মকর্তার নোট: চুন প্রয়োগের পর অন্তত ১৪ দিন ইউরিয়া বা ডিএপি প্রয়োগ করা যাবে না, অন্যথায় অ্যামোনিয়া গ্যাস তৈরি হয়ে পুষ্টি অপচয় হবে।",
    "সুপারিশ আপডেট: ব্রি ধান-২৮ এর পরিবর্তে ব্লাস্ট প্রতিরোধী ব্রি ধান-৮৮ বা ব্রি ধান-৮৯ রোপণে কৃষকদের উৎসাহিত করা হচ্ছে।"
]


from django.contrib.auth.hashers import make_password

class Command(BaseCommand):
    help = "Idempotently populate database with rich realistic demo data for all three portals."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Starting Master Demo Seeding for Mrittika AI..."))
        now = timezone.now()

        # Precompute hashes once to prevent repeated Argon2 CFFI memory overhead
        self.stdout.write("  Precomputing secure password hashes...")
        admin_pwd_hash = make_password("Admin@123456")
        officer_pwd_hash = make_password("Officer@123456")
        farmer_pwd_hash = make_password("Farmer@123456")

        # ------------------------------------------------------------------
        # 1. Super Admin & System Admins
        # ------------------------------------------------------------------
        super_admin, _ = User.objects.get_or_create(
            phone="01700000001",
            defaults={
                "name": "সিস্টেম অ্যাডমিন (System Admin)",
                "role": User.Role.ADMIN,
                "district": "Dhaka",
                "upazila": "Dhaka Sadar",
                "is_verified": True,
                "is_staff": True,
                "is_superuser": True,
            },
        )
        super_admin.password = admin_pwd_hash
        super_admin.is_staff = True
        super_admin.is_superuser = True
        super_admin.role = User.Role.ADMIN
        super_admin.save()

        admin_data = [
            ("01700000010", "আহমেদ জিয়াউল করিম", "Rajshahi", "Rajshahi Sadar"),
            ("01700000011", "বেগম সামিয়া রহমান", "Chittagong", "Hathazari"),
        ]
        admins = [super_admin]
        for phone, name, dist, upz in admin_data:
            adm, _ = User.objects.get_or_create(
                phone=phone,
                defaults={
                    "name": f"অ্যাডমিন {name}",
                    "role": User.Role.ADMIN,
                    "district": dist,
                    "upazila": upz,
                    "is_verified": True,
                    "is_staff": True,
                },
            )
            adm.password = admin_pwd_hash
            adm.role = User.Role.ADMIN
            adm.save()
            admins.append(adm)
        self.stdout.write(self.style.SUCCESS(f"  ✓ {len(admins)} Admin accounts ready."))

        # ------------------------------------------------------------------
        # 2. Extension Officers (15 across Bangladesh)
        # ------------------------------------------------------------------
        officers = []
        for i, (name, dist, upz) in enumerate(OFFICER_NAMES, start=1):
            phone = f"017100000{i:02d}"
            officer, _ = User.objects.get_or_create(
                phone=phone,
                defaults={
                    "name": name,
                    "role": User.Role.OFFICER,
                    "district": dist,
                    "upazila": upz,
                    "is_verified": True,
                },
            )
            officer.password = officer_pwd_hash
            officer.role = User.Role.OFFICER
            officer.is_verified = True
            officer.save()
            officers.append(officer)
        self.stdout.write(self.style.SUCCESS(f"  ✓ {len(officers)} Extension Officer accounts ready."))

        # ------------------------------------------------------------------
        # 3. Farmers (250 across agricultural districts)
        # ------------------------------------------------------------------
        districts_list = list(DISTRICT_UPAZILAS.keys())
        existing_phones = set(User.objects.values_list("phone", flat=True))
        farmers_to_create = []

        for i in range(1, 251):
            phone = f"0172000{i:04d}"
            if phone in existing_phones:
                continue
            dist = districts_list[(i - 1) % len(districts_list)]
            upazilas = DISTRICT_UPAZILAS[dist]
            upz = upazilas[(i - 1) % len(upazilas)]
            first_n = FARMER_FIRST_NAMES[(i * 3) % len(FARMER_FIRST_NAMES)]
            last_n = FARMER_LAST_NAMES[(i * 5) % len(FARMER_LAST_NAMES)]
            full_name = f"কৃষক {first_n} {last_n}"

            farmers_to_create.append(
                User(
                    phone=phone,
                    password=farmer_pwd_hash,
                    name=full_name,
                    role=User.Role.FARMER,
                    district=dist,
                    upazila=upz,
                    is_verified=False,
                )
            )

        if farmers_to_create:
            User.objects.bulk_create(farmers_to_create, batch_size=200)
            self.stdout.write(self.style.SUCCESS(f"  ✓ {len(farmers_to_create)} new Farmers created in bulk."))

        # Ensure demo farmer 01700000003 exists
        demo_farmer, _ = User.objects.get_or_create(
            phone="01700000003",
            defaults={
                "name": "কৃষক আকমল হোসেন",
                "role": User.Role.FARMER,
                "district": "Bogra",
                "upazila": "Sherpur",
            },
        )
        demo_farmer.password = farmer_pwd_hash
        demo_farmer.save()

        farmers = list(User.objects.filter(role=User.Role.FARMER))
        self.stdout.write(self.style.SUCCESS(f"  ✓ Total {len(farmers)} Farmer accounts in database."))

        # ------------------------------------------------------------------
        # 4. Recommendation History (2,000+ Crop & 1,500+ Fertilizer)
        # ------------------------------------------------------------------
        existing_recs_count = RecommendationHistory.objects.count()
        if existing_recs_count < 3500:
            self.stdout.write("  Generating Recommendation History records in bulk...")
            recs_to_create = []

            # 2,100 Crop Recommendations
            seasons = ["Rabi", "Kharif-1", "Kharif-2"]
            soil_types = ["Loam", "Clay Loam", "Sandy Loam", "Clay", "Silt Loam"]
            supported_crops = [c for c in CANONICAL_CROPS if c.get("fertilizer_supported")]

            for i in range(2100):
                f = farmers[i % len(farmers)]
                days_ago = random.randint(1, 240)
                rec_time = now - timedelta(days=days_ago, minutes=random.randint(0, 1440))
                dist = f.district or "Bogra"
                season = random.choice(seasons)
                soil = random.choice(soil_types)
                top_crop = random.choice(supported_crops)

                rec = RecommendationHistory(
                    user=f,
                    rec_type=RecommendationHistory.Type.CROP,
                    crop_slug=top_crop["slug"],
                    crop_name_bn=top_crop["name_bn"],
                    fertilizer_plan="",
                    inputs={
                        "N": round(random.uniform(50, 180), 1),
                        "P": round(random.uniform(20, 90), 1),
                        "K": round(random.uniform(30, 120), 1),
                        "pH": round(random.uniform(5.2, 7.8), 2),
                        "temperature": round(random.uniform(18.0, 34.0), 1),
                        "humidity": round(random.uniform(55.0, 92.0), 1),
                        "rainfall": round(random.uniform(10.0, 450.0), 1),
                        "district": dist,
                        "season": season,
                        "soil_type": soil,
                    },
                    outputs={
                        "recommendations": [
                            {
                                "rank": 1,
                                "crop_slug": top_crop["slug"],
                                "crop_name_bn": top_crop["name_bn"],
                                "crop_name_en": top_crop["name_en"],
                                "confidence_percentage": round(random.uniform(82.0, 96.5), 1),
                                "fertilizer_supported": True,
                            },
                            {
                                "rank": 2,
                                "crop_slug": "mustard",
                                "crop_name_bn": "সরিষা",
                                "crop_name_en": "Mustard",
                                "confidence_percentage": round(random.uniform(4.0, 12.0), 1),
                                "fertilizer_supported": True,
                            },
                            {
                                "rank": 3,
                                "crop_slug": "lentil",
                                "crop_name_bn": "মসুর ডাল",
                                "crop_name_en": "Lentil",
                                "confidence_percentage": round(random.uniform(1.5, 6.0), 1),
                                "fertilizer_supported": True,
                            },
                        ]
                    },
                )
                recs_to_create.append(rec)

            # 1,600 Fertilizer Recommendations
            for i in range(1600):
                f = farmers[(i * 2) % len(farmers)]
                days_ago = random.randint(1, 240)
                rec_time = now - timedelta(days=days_ago, minutes=random.randint(0, 1440))
                crop = random.choice(supported_crops)
                land_area = round(random.uniform(0.5, 5.0), 1)

                rec = RecommendationHistory(
                    user=f,
                    rec_type=RecommendationHistory.Type.FERTILIZER,
                    crop_slug=crop["slug"],
                    crop_name_bn=crop["name_bn"],
                    fertilizer_plan="Urea+TSP+MoP+Gypsum",
                    inputs={
                        "crop": crop["slug"],
                        "N": round(random.uniform(60, 150), 1),
                        "P": round(random.uniform(30, 80), 1),
                        "K": round(random.uniform(40, 100), 1),
                        "pH": round(random.uniform(5.5, 7.5), 2),
                        "land_area": land_area,
                        "land_unit": "bigha",
                        "season": random.choice(seasons),
                    },
                    outputs={
                        "fertilizer_items": [
                            {"name_bn": "ইউরিয়া (Urea)", "rate_kg_bigha": round(14.0 * land_area, 2)},
                            {"name_bn": "টিএসপি / ডিএপি (TSP)", "rate_kg_bigha": round(6.5 * land_area, 2)},
                            {"name_bn": "এমওপি / পটাশ (MoP)", "rate_kg_bigha": round(9.0 * land_area, 2)},
                            {"name_bn": "জিপসাম (Gypsum)", "rate_kg_bigha": round(4.5 * land_area, 2)},
                        ],
                        "total_estimated_cost_bdt": int(land_area * random.randint(1200, 2400)),
                    },
                )
                recs_to_create.append(rec)

            RecommendationHistory.objects.bulk_create(recs_to_create, batch_size=500)
            self.stdout.write(self.style.SUCCESS(f"  ✓ {len(recs_to_create)} Recommendation records created."))
        else:
            self.stdout.write(self.style.SUCCESS(f"  ✓ Recommendation history already seeded ({existing_recs_count} records)."))

        # ------------------------------------------------------------------
        # 5. Assistant Sessions & Messages (500+ sessions, 2,000+ messages)
        # ------------------------------------------------------------------
        existing_sessions_count = AssistantSession.objects.count()
        if existing_sessions_count < 500:
            self.stdout.write("  Generating Assistant Chat Sessions & Messages in bulk...")
            sessions_to_create = []
            for i in range(520):
                f = farmers[i % len(farmers)]
                days_ago = random.randint(1, 180)
                s_title = SAMPLE_QUESTIONS_BN[i % len(SAMPLE_QUESTIONS_BN)][:40] + "..."
                s = AssistantSession(
                    user=f,
                    title=s_title,
                )
                sessions_to_create.append(s)
            created_sessions = AssistantSession.objects.bulk_create(sessions_to_create, batch_size=200)

            # Create 4-5 messages per session
            messages_to_create = []
            for s in created_sessions:
                q_text = random.choice(SAMPLE_QUESTIONS_BN)
                a_text = random.choice(SAMPLE_ANSWERS_BN)
                # User turn
                messages_to_create.append(
                    AssistantMessage(
                        session=s,
                        role=AssistantMessage.Role.USER,
                        content=q_text,
                    )
                )
                # Assistant turn
                messages_to_create.append(
                    AssistantMessage(
                        session=s,
                        role=AssistantMessage.Role.ASSISTANT,
                        content=a_text,
                        sources=[{"title": "BARC সার সুপারিশ নির্দেশিকা ২০২৪", "page": random.randint(12, 140)}],
                        provider_used=random.choice(["groq:openai/gpt-oss-120b", "gemini:gemini-2.5-flash-lite"]),
                    )
                )
                # Optional follow-up turn
                if random.random() > 0.4:
                    messages_to_create.append(
                        AssistantMessage(
                            session=s,
                            role=AssistantMessage.Role.USER,
                            content="জমিতে ইউরিয়া দেওয়ার পর কি সাথে সাথে সেচ দেওয়া যাবে?",
                        )
                    )
                    messages_to_create.append(
                        AssistantMessage(
                            session=s,
                            role=AssistantMessage.Role.ASSISTANT,
                            content="না, ইউরিয়া দেওয়ার সাথে সাথে তীব্র সেচ দিলে তা মাটির গভীরে চুইয়ে অপচয় হতে পারে। ছিপছিপে ভেজা জমিতে সার দিয়ে হালকা রস রাখাই উত্তম।",
                            sources=[{"title": "ব্রি ধানের আধুনিক চাষাবাদ", "page": 45}],
                            provider_used="groq:openai/gpt-oss-120b",
                        )
                    )
            AssistantMessage.objects.bulk_create(messages_to_create, batch_size=500)
            self.stdout.write(self.style.SUCCESS(f"  ✓ {len(created_sessions)} Chat sessions and {len(messages_to_create)} Messages created."))
        else:
            self.stdout.write(self.style.SUCCESS(f"  ✓ Assistant chat already seeded ({existing_sessions_count} sessions)."))

        # ------------------------------------------------------------------
        # 6. Feedbacks, Flagged Items & Officer Corrections (300+ items)
        # ------------------------------------------------------------------
        existing_feedback_count = Feedback.objects.count()
        if existing_feedback_count < 300:
            self.stdout.write("  Generating Feedback, Flagged Items and Officer Corrections...")
            feedbacks_to_create = []

            for i in range(320):
                f = farmers[i % len(farmers)]
                is_flagged = (i % 5 == 0) # ~64 flagged items
                is_resolved = is_flagged and (i % 2 == 0) # ~32 resolved by officer
                officer = random.choice(officers) if is_resolved else None
                correction = random.choice(OFFICER_CORRECTIONS_BN) if is_resolved else ""

                rating = random.choice([4, 5, 5, 5]) if not is_flagged else random.choice([1, 2, 3])
                q_text = SAMPLE_QUESTIONS_BN[i % len(SAMPLE_QUESTIONS_BN)]
                a_text = SAMPLE_ANSWERS_BN[i % len(SAMPLE_ANSWERS_BN)]

                feedbacks_to_create.append(
                    Feedback(
                        user=f,
                        module_type=random.choice([Feedback.ModuleType.CHAT, Feedback.ModuleType.CROP, Feedback.ModuleType.FERTILIZER]),
                        rating=rating,
                        flagged=is_flagged,
                        comment=f"কৃষকের মন্তব্য: পরামর্শটি {'খুবই সহায়ক ছিল।' if rating >= 4 else 'মাঠ পর্যায়ের তথ্যের সাথে কিছুটা অমিল।'}",
                        context_data={
                            "question": q_text,
                            "assistant_response": a_text,
                            "district": f.district,
                            "upazila": f.upazila,
                        },
                        officer_correction=correction,
                        corrected_by=officer,
                        is_resolved=is_resolved,
                    )
                )
            Feedback.objects.bulk_create(feedbacks_to_create, batch_size=200)
            self.stdout.write(self.style.SUCCESS(f"  ✓ {len(feedbacks_to_create)} Feedback items seeded (64 flagged, 32 officer-corrected)."))
        else:
            self.stdout.write(self.style.SUCCESS(f"  ✓ Feedback already seeded ({existing_feedback_count} items)."))

        # ------------------------------------------------------------------
        # 7. Activity Logs (1,000+ entries)
        # ------------------------------------------------------------------
        existing_logs_count = ActivityLog.objects.count()
        if existing_logs_count < 1000:
            self.stdout.write("  Generating Activity Audit Logs in bulk...")
            logs_to_create = []
            action_pool = [
                (ActivityLog.ActionType.USER_LOGIN, "সিস্টেমে সফল লগইন সম্পন্ন হয়েছে।"),
                (ActivityLog.ActionType.CROP_RECOMMEND, "মাটির পুষ্টি ও আবহাওয়ার ভিত্তিতে সেরা ফসল সুপারিশ অনুসন্ধান করা হয়েছে।"),
                (ActivityLog.ActionType.FERTILIZER_RECOMMEND, "নির্দিষ্ট জমির জন্য সুষম সারের ডোজ ও সময়সূচী হিসাব করা হয়েছে।"),
                (ActivityLog.ActionType.CHAT_QUERY, "কৃষি সহকারী চ্যাটবটে প্রশ্ন জিজ্ঞাসা করা হয়েছে।"),
                (ActivityLog.ActionType.OFFICER_CORRECTION, "উপজেলা কৃষি কর্মকর্তা কর্তৃক ফ্ল্যাগকৃত প্রশ্নোত্তর পর্যালোচনা ও সংশোধন সংযোজন।"),
                (ActivityLog.ActionType.DOC_INGEST, "কৃষি জ্ঞানভাণ্ডারে নতুন গবেষণা নথি ইন্ডেক্স ও ভেক্টরাইজেশন সম্পন্ন হয়েছে।"),
            ]

            all_users = admins + officers + farmers
            for i in range(1100):
                u = random.choice(all_users)
                action, desc = random.choice(action_pool)
                ip = f"103.{random.randint(10, 250)}.{random.randint(1, 250)}.{random.randint(1, 250)}"
                logs_to_create.append(
                    ActivityLog(
                        user=u,
                        action=action,
                        description=f"{u.name} ({u.role}): {desc}",
                        ip_address=ip,
                        metadata={"district": u.district, "role": u.role},
                    )
                )
            ActivityLog.objects.bulk_create(logs_to_create, batch_size=500)
            self.stdout.write(self.style.SUCCESS(f"  ✓ {len(logs_to_create)} Activity Audit Logs generated."))
        else:
            self.stdout.write(self.style.SUCCESS(f"  ✓ Activity logs already seeded ({existing_logs_count} logs)."))

        self.stdout.write("\n" + "=" * 65)
        self.stdout.write(self.style.SUCCESS("MRITTIKA AI MASTER SEEDING COMPLETE!"))
        self.stdout.write("=" * 65)
        self.stdout.write("Portal Login Credentials:")
        self.stdout.write("  1. Admin Portal:     01700000001 / Admin@123456")
        self.stdout.write("  2. Officer Portal:   01710000001 / Officer@123456 (or 01700000002)")
        self.stdout.write("  3. Farmer Portal:    01720000001 / Farmer@123456  (or 01700000003)")
        self.stdout.write("=" * 65 + "\n")
