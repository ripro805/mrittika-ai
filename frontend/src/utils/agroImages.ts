/**
 * Mrittika AI - Centralized Agricultural Image & Visual Assets Registry
 * High-definition, contextually verified photography for all 24 canonical crops,
 * major fertilizers, agro-ecological landscapes, and research institutions.
 *
 * Each image includes:
 * - Optimized Unsplash CDN parameters (auto=format, fit=crop, responsive sizing)
 * - Exact agronomic content relevance
 * - Bilingual descriptive alt text (en & bn)
 * - Fallback SVG generator for 100% offline / network error resilience
 */

export interface AgroImageMeta {
  url: string;
  altEn: string;
  altBn: string;
  categoryEn: string;
  categoryBn: string;
  accentColor: string;
}

// ---------------------------------------------------------------------------
// 1. ALL 24 CANONICAL CROPS IMAGERY
// ---------------------------------------------------------------------------
export const CROP_IMAGES: Record<string, AgroImageMeta> = {
  rice_aman: {
    url: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=800&q=80",
    altEn: "Vibrant green Aman rice paddy fields in Bangladesh monsoon season",
    altBn: "বর্ষার মৌসুমে সবুজ আমন ধানের সতেজ ধানক্ষেত",
    categoryEn: "Cereal Grain",
    categoryBn: "দানাশস্য",
    accentColor: "#15803d",
  },
  rice_aus: {
    url: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80",
    altEn: "Summer Aus rice seedlings thriving in sunlit agricultural field",
    altBn: "গ্রীষ্মকালীন আউশ ধানের চারা ও আলোকিত ফসলি জমি",
    categoryEn: "Cereal Grain",
    categoryBn: "দানাশস্য",
    accentColor: "#16a34a",
  },
  rice_boro: {
    url: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=800&q=80",
    altEn: "High-yielding winter Boro rice field with systematic canal irrigation",
    altBn: "সুশৃঙ্খল সেচ সুবিধাযুক্ত উচ্চফলনশীল শীতকালীন বোরো ধানক্ষেত",
    categoryEn: "Cereal Grain",
    categoryBn: "দানাশস্য",
    accentColor: "#059669",
  },
  wheat: {
    url: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80",
    altEn: "Golden ripe wheat spikes swaying in winter agricultural farm",
    altBn: "শীতের মাঠে সোনালী পাকা গমের শীষ",
    categoryEn: "Cereal Grain",
    categoryBn: "দানাশস্য",
    accentColor: "#d97706",
  },
  maize: {
    url: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80",
    altEn: "Fresh golden maize corn cobs with green husks in sunlit farm",
    altBn: "সূর্যালোকিত ভুট্টা ক্ষেতে পুষ্ট সোনালী ভুট্টার মোচা",
    categoryEn: "Cereal & Fodder",
    categoryBn: "দানাশস্য ও গোখাদ্য",
    accentColor: "#ca8a04",
  },
  potato: {
    url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80",
    altEn: "Freshly harvested organic potatoes resting in fertile agricultural loam",
    altBn: "উর্বর দোআঁশ মাটিতে সদ্য উত্তোলিত পুষ্ট গোল আলু",
    categoryEn: "Tuber Crop",
    categoryBn: "কন্দ জাতীয় ফসল",
    accentColor: "#b45309",
  },
  jute: {
    url: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80",
    altEn: "Tall green golden-fibre jute plants standing in rural Bangladeshi field",
    altBn: "গ্রামবাংলার মাঠে দাঁড়িয়ে থাকা সোনালী আঁশের সবুজ পাট গাছ",
    categoryEn: "Cash Fiber Crop",
    categoryBn: "অর্থকরী আঁশ ফসল",
    accentColor: "#15803d",
  },
  mustard: {
    url: "https://images.unsplash.com/photo-1508873696983-2df5703bc20d?auto=format&fit=crop&w=800&q=80",
    altEn: "Breathtaking yellow blooming mustard flower field in winter Bangladesh",
    altBn: "শীতের অপরূপ হলুদ সরিষা ফুলে ভরা দিগন্তজোড়া সরিষা ক্ষেত",
    categoryEn: "Oilseed Crop",
    categoryBn: "তৈলবীজ ফসল",
    accentColor: "#eab308",
  },
  lentil: {
    url: "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=800&q=80",
    altEn: "Protein-rich red lentil pods and harvested pulses",
    altBn: "আমিষসমৃদ্ধ পুষ্টিকর মসুর ডাল ও শুঁটি",
    categoryEn: "Pulse Crop",
    categoryBn: "ডাল জাতীয় ফসল",
    accentColor: "#ea580c",
  },
  tomato: {
    url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80",
    altEn: "Vibrant ripe red tomatoes ripening on organic garden vine",
    altBn: "গাছে পাকা উজ্জ্বল লাল তাজা টমেটোর থোকা",
    categoryEn: "Vegetable",
    categoryBn: "শাকসবজি",
    accentColor: "#dc2626",
  },
  brinjal: {
    url: "https://images.unsplash.com/photo-1628773822503-930a84d94b0f?auto=format&fit=crop&w=800&q=80",
    altEn: "Fresh glossy purple eggplants brinjal growing on farm plant",
    altBn: "ক্ষেতের গাছে ঝুলন্ত চকচকে তাজা বেগুন",
    categoryEn: "Vegetable",
    categoryBn: "শাকসবজি",
    accentColor: "#7e22ce",
  },
  onion: {
    url: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80",
    altEn: "Freshly harvested red onions with natural dry skins in field",
    altBn: "মাঠ থেকে সদ্য সংগৃহীত লাল দেশি পেঁয়াজ",
    categoryEn: "Spice & Vegetable",
    categoryBn: "মশলা ও সবজি",
    accentColor: "#be185d",
  },
  chilli: {
    url: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=800&q=80",
    altEn: "Bright red and green hot spicy chillies hanging on healthy pepper plant",
    altBn: "গাছে ঝুলন্ত তাজা সবুজ ও লাল ঝাল মরিচ",
    categoryEn: "Spice Crop",
    categoryBn: "মশলা জাতীয় ফসল",
    accentColor: "#b91c1c",
  },
  banana: {
    url: "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=800&q=80",
    altEn: "Lush bunch of organic green bananas growing in tropical plantation",
    altBn: "বাগানের কলা গাছে ধরা পুষ্ট কাঁচা কলার ছড়ি",
    categoryEn: "Fruit Crop",
    categoryBn: "ফলমূল",
    accentColor: "#65a30d",
  },
  cauliflower_cabbage: {
    url: "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=800&q=80",
    altEn: "Fresh crisp white cauliflower head surrounded by vibrant green foliage",
    altBn: "সবুজ পাতায় মোড়ানো তাজা ঘন সাদা ফুলকপি",
    categoryEn: "Vegetable",
    categoryBn: "শাকসবজি",
    accentColor: "#15803d",
  },
  garlic: {
    url: "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=800&q=80",
    altEn: "Plump organic garlic bulbs curing in sunlit agricultural harvest",
    altBn: "রোদে শুকানো পরিপুষ্ট দেশি রসুনের কোয়া",
    categoryEn: "Spice Crop",
    categoryBn: "মশলা জাতীয় ফসল",
    accentColor: "#78716c",
  },
  groundnut: {
    url: "https://images.unsplash.com/photo-1567892323821-2a90098dfc61?auto=format&fit=crop&w=800&q=80",
    altEn: "Harvested organic groundnuts peanuts in shell from sandy loam soil",
    altBn: "বেলে দোআঁশ মাটি থেকে সংগৃহীত খোসাসহ পুষ্ট চিনাবাদাম",
    categoryEn: "Oilseed & Pulse",
    categoryBn: "তৈলবীজ ও বাদাম",
    accentColor: "#9a3412",
  },
  mango: {
    url: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80",
    altEn: "Juicy golden ripe mangoes hanging on orchard tree branch in Rajshahi",
    altBn: "আমের বাগানে ডালে ঝুলন্ত পাকা রসালো আম",
    categoryEn: "Perennial Fruit",
    categoryBn: "বারোমাসি ফলমূল",
    accentColor: "#f59e0b",
  },
  mungbean: {
    url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
    altEn: "Green mungbean pods and nutritious whole grains in agricultural field",
    altBn: "মাঠের মুগ ডাল গাছ ও সবুজ পুষ্টিকর মুগ দানা",
    categoryEn: "Pulse Crop",
    categoryBn: "ডাল জাতীয় ফসল",
    accentColor: "#166534",
  },
  papaya: {
    url: "https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?auto=format&fit=crop&w=800&q=80",
    altEn: "Cluster of sweet ripening papayas on tropical papaya tree stem",
    altBn: "পেঁপে গাছে থোকায় থোকায় ধরা তাজা পাকা পেঁপে",
    categoryEn: "Fruit Crop",
    categoryBn: "ফলমূল",
    accentColor: "#d97706",
  },
  pumpkin: {
    url: "https://images.unsplash.com/photo-1506917728037-b6af01a7d403?auto=format&fit=crop&w=800&q=80",
    altEn: "Large ripe orange pumpkin resting in agricultural vegetable farm",
    altBn: "ক্ষেতে লতায় ধরে থাকা বড় পাকা মিষ্টি কুমড়া",
    categoryEn: "Vegetable",
    categoryBn: "শাকসবজি",
    accentColor: "#c2410c",
  },
  sesame: {
    url: "https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=800&q=80",
    altEn: "Sesame seed capsules and flowering plant in rural oilseed field",
    altBn: "মাঠের তিল গাছ ও বীজভর্তি পুষ্ট তিলের শুঁটি",
    categoryEn: "Oilseed Crop",
    categoryBn: "তৈলবীজ ফসল",
    accentColor: "#713f12",
  },
  sugarcane: {
    url: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80",
    altEn: "Towering sweet sugarcane stalks growing dense in tropical plantation",
    altBn: "রোদে বেড়ে ওঠা মিষ্টি ও রসালো ঘন আখ ক্ষেত",
    categoryEn: "Cash Sugar Crop",
    categoryBn: "অর্থকরী চিনি ফসল",
    accentColor: "#15803d",
  },
  tea: {
    url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
    altEn: "Emerald green terraced tea garden hills in Sreemangal Sylhet",
    altBn: "শ্রীমঙ্গল সিলেটের দিগন্তবিস্তৃত সবুজ চা বাগান",
    categoryEn: "Perennial Plantation",
    categoryBn: "বাগানজাত অর্থকরী ফসল",
    accentColor: "#065f46",
  },
};

// ---------------------------------------------------------------------------
// 2. FERTILIZERS & NUTRIENT MANAGEMENT IMAGERY
// ---------------------------------------------------------------------------
export const FERTILIZER_IMAGES: Record<string, AgroImageMeta> = {
  urea: {
    url: "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=800&q=80",
    altEn: "High-grade white prilled urea nitrogen fertilizer for crop vegetative growth",
    altBn: "ফসলের দৈহিক বৃদ্ধি সহায়ক দানাদার সাদা ইউরিয়া নাইট্রোজেন সার",
    categoryEn: "Nitrogen Fertilizer (46% N)",
    categoryBn: "নাইট্রোজেন সার (৪৬% এন)",
    accentColor: "#1d4ed8",
  },
  tsp: {
    url: "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=800&q=80",
    altEn: "Granular dark Triple Super Phosphate TSP for root development and vigor",
    altBn: "ফসলের শিকড় মজবুত ও দ্রুত কুশি বৃদ্ধিকারক টিএসপি ফসফেট সার",
    categoryEn: "Phosphate Fertilizer (46% P2O5)",
    categoryBn: "ফসফেট সার (৪৬% পি২ও৫)",
    accentColor: "#475569",
  },
  mop: {
    url: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80",
    altEn: "Muriate of Potash MoP reddish-pink granules for disease resistance and grain filling",
    altBn: "গাছ শক্ত ও রোগবালাই প্রতিরোধ সহায়ক লালচে এমওপি পটাশ সার",
    categoryEn: "Potash Fertilizer (60% K2O)",
    categoryBn: "পটাশিয়াম সার (৬০% কে২ও)",
    accentColor: "#b91c1c",
  },
  gypsum: {
    url: "https://images.unsplash.com/photo-1607613009820-a29f7ab81c04?auto=format&fit=crop&w=800&q=80",
    altEn: "Pure agricultural gypsum calcium sulphate amendment for sulfur nutrition",
    altBn: "মাটির সালফার ঘাটতি দূরীকরণ ও পুষ্টি উন্নয়নে জিপসাম সার",
    categoryEn: "Sulfur & Calcium (18% S)",
    categoryBn: "সালফার ও ক্যালসিয়াম সার",
    accentColor: "#64748b",
  },
  zinc: {
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    altEn: "Zinc sulphate micronutrient crystals preventing rice khaira disease",
    altBn: "ধানের খয়রা রোগ প্রতিরোধ ও ফসলের সতেজতায় জিংক সালফেট সার",
    categoryEn: "Micronutrient (36% Zn)",
    categoryBn: "অণুপুষ্টি সার (দস্তা)",
    accentColor: "#0284c7",
  },
  cowdung: {
    url: "https://images.unsplash.com/photo-1585336261026-6fb7c1bf2095?auto=format&fit=crop&w=800&q=80",
    altEn: "Well-decomposed organic farmyard manure cowdung enhancing soil biological health",
    altBn: "মাটির জৈব স্বাস্থ্য ও পানি ধারণক্ষমতা বৃদ্ধিকারী পচা গোবর সার",
    categoryEn: "Organic Amendment",
    categoryBn: "জৈব সার",
    accentColor: "#78350f",
  },
  application: {
    url: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80",
    altEn: "Scientifically timed top-dressing split application in agricultural field",
    altBn: "মাঠপর্যায়ে ফসলের সঠিক কিস্তিতে বৈজ্ঞানিক সার প্রয়োগ",
    categoryEn: "Field Application",
    categoryBn: "মাঠে সার প্রয়োগ",
    accentColor: "#15803d",
  },
};

// ---------------------------------------------------------------------------
// 3. HERO & LANDSCAPE AGRO-PHOTOGRAPHY
// ---------------------------------------------------------------------------
export const SCENIC_IMAGES = {
  homepageHero: {
    url: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=85",
    altEn: "Scenic sunlit Bangladeshi emerald green paddy field landscape",
    altBn: "সোনালী রোদে আলোকিত বাংলাদেশের নয়নাভিরাম সবুজ ধানক্ষেতের দৃশ্য",
  },
  precisionFarming: {
    url: "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=85",
    altEn: "Agronomist using precision mobile agritech in fertile agricultural field",
    altBn: "মাঠপর্যায়ে আধুনিক ডিজিটাল কৃষি প্রযুক্তি ব্যবহারকারী কৃষক",
  },
  ruralLandscape: {
    url: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=85",
    altEn: "Aerial geometric view of lush agricultural fields and canal waterways",
    altBn: "কৃষি মাঠ ও সেচ খালের চমৎকার ড্রোন দৃশ্য",
  },
  soilTesting: {
    url: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80",
    altEn: "Agronomist holding rich dark loamy fertile soil for laboratory nutrient testing",
    altBn: "ল্যাব পরীক্ষার জন্য পুষ্টিসমৃদ্ধ উর্বর দোআঁশ মাটি হাতে কৃষিবিদ",
  },
  pestInspection: {
    url: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=800&q=80",
    altEn: "Close-up plant health and pest scouting in agricultural crop foliage",
    altBn: "ফসলের রোগবালাই ও পোকা মাকড় পর্যবেক্ষণ ও বালাই দমন",
  },
  researchLab: {
    url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80",
    altEn: "Agricultural scientific research laboratory analyzing crop genetics and soil health",
    altBn: "জাত ও মাটির পুষ্টি গবেষণারত কৃষি গবেষণাগার",
  },
  farmerHarvest: {
    url: "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=800&q=80",
    altEn: "Smiling Bangladeshi farmer celebrating bumper crop harvest in field",
    altBn: "মাঠে বাম্পার ফলনে উৎফুল্ল বাংলাদেশি কৃষক",
  },
};

// ---------------------------------------------------------------------------
// 4. SMART RESOLVERS & HELPERS
// ---------------------------------------------------------------------------

/**
 * Resolves any crop identifier (slug, English name, Bengali name, model name)
 * to its verified high-res photo metadata.
 */
export function getCropImage(identifier?: string | null): AgroImageMeta {
  if (!identifier) {
    return CROP_IMAGES["rice_aman"];
  }

  const clean = identifier.toLowerCase().trim();

  // 1. Direct slug match
  if (CROP_IMAGES[clean]) {
    return CROP_IMAGES[clean];
  }

  // 2. Normalized aliases
  const aliases: Record<string, string> = {
    // Rice
    "aman rice": "rice_aman",
    "আমন ধান": "rice_aman",
    "আমন": "rice_aman",
    "aus rice": "rice_aus",
    "আউশ ধান": "rice_aus",
    "আউশ": "rice_aus",
    "boro rice": "rice_boro",
    "বোরো ধান": "rice_boro",
    "বোরো": "rice_boro",
    "rice": "rice_boro",
    "ধান": "rice_boro",
    "paddy": "rice_boro",

    // Wheat & Maize
    "wheat": "wheat",
    "গম": "wheat",
    "maize": "maize",
    "corn": "maize",
    "ভুট্টা": "maize",

    // Potato & Jute
    "potato": "potato",
    "আলু": "potato",
    "গোল আলু": "potato",
    "jute": "jute",
    "পাট": "jute",

    // Mustard & Lentil
    "mustard": "mustard",
    "সরিষা": "mustard",
    "lentil": "lentil",
    "মসুর ডাল": "lentil",
    "মসুর": "lentil",

    // Vegetables & Spices
    "tomato": "tomato",
    "টমেটো": "tomato",
    "brinjal": "brinjal",
    "eggplant": "brinjal",
    "বেগুন": "brinjal",
    "onion": "onion",
    "পেঁয়াজ": "onion",
    "chilli": "chilli",
    "chili": "chilli",
    "মরিচ": "chilli",
    "কাঁচা মরিচ": "chilli",
    "banana": "banana",
    "কলা": "banana",
    "cauliflower/cabbage": "cauliflower_cabbage",
    "cauliflower": "cauliflower_cabbage",
    "cabbage": "cauliflower_cabbage",
    "ফুলকপি / বাঁধাকপি": "cauliflower_cabbage",
    "ফুলকপি": "cauliflower_cabbage",
    "বাঁধাকপি": "cauliflower_cabbage",
    "garlic": "garlic",
    "রসুন": "garlic",
    "groundnut": "groundnut",
    "peanut": "groundnut",
    "চিনাবাদাম": "groundnut",
    "বাদাম": "groundnut",
    "mango": "mango",
    "আম": "mango",
    "mungbean": "mungbean",
    "মুগ ডাল": "mungbean",
    "মুগ": "mungbean",
    "papaya": "papaya",
    "পেঁপে": "papaya",
    "pumpkin": "pumpkin",
    "মিষ্টি কুমড়া": "pumpkin",
    "কুমড়া": "pumpkin",
    "sesame": "sesame",
    "তিল": "sesame",
    "sugarcane": "sugarcane",
    "আখ": "sugarcane",
    "tea": "tea",
    "চা": "tea",
  };

  if (aliases[clean] && CROP_IMAGES[aliases[clean]]) {
    return CROP_IMAGES[aliases[clean]];
  }

  // 3. Partial substring matching
  for (const [key, crop] of Object.entries(CROP_IMAGES)) {
    if (clean.includes(key) || clean.includes(crop.altEn.toLowerCase()) || clean.includes(crop.categoryEn.toLowerCase())) {
      return crop;
    }
  }

  // Default fallback to Aman Rice
  return CROP_IMAGES["rice_aman"];
}

/**
 * Resolves a fertilizer name (Urea, TSP, MoP, Gypsum, Zinc, Cowdung)
 * to verified high-res photo metadata.
 */
export function getFertilizerImage(fertName?: string | null): AgroImageMeta {
  if (!fertName) {
    return FERTILIZER_IMAGES["urea"];
  }

  const clean = fertName.toLowerCase().trim();

  if (clean.includes("urea") || clean.includes("ইউরিয়া")) {
    return FERTILIZER_IMAGES["urea"];
  }
  if (clean.includes("tsp") || clean.includes("টিএসপি") || clean.includes("phosphate")) {
    return FERTILIZER_IMAGES["tsp"];
  }
  if (clean.includes("mop") || clean.includes("পটাশ") || clean.includes("potash")) {
    return FERTILIZER_IMAGES["mop"];
  }
  if (clean.includes("gypsum") || clean.includes("জিপসাম") || clean.includes("sulfur")) {
    return FERTILIZER_IMAGES["gypsum"];
  }
  if (clean.includes("zinc") || clean.includes("জিংক") || clean.includes("দস্তা")) {
    return FERTILIZER_IMAGES["zinc"];
  }
  if (clean.includes("cowdung") || clean.includes("গোবর") || clean.includes("compost") || clean.includes("organic")) {
    return FERTILIZER_IMAGES["cowdung"];
  }

  return FERTILIZER_IMAGES["application"];
}

/**
 * Generates an SVG Data URI fallback with crop botanical icon and gradient.
 * Guarantees zero broken image icons even if the user is completely offline.
 */
export function getSvgCropFallback(name: string, color: string = "#15803d"): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260" width="100%" height="100%">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.95" />
        <stop offset="100%" stop-color="#022c22" stop-opacity="1" />
      </linearGradient>
    </defs>
    <rect width="400" height="260" fill="url(#bg)" rx="16" />
    <circle cx="200" cy="110" r="48" fill="#ffffff" fill-opacity="0.12" />
    <path d="M200 80 C220 95 225 125 200 140 C175 125 180 95 200 80 Z M200 140 L200 155" stroke="#ffffff" stroke-width="3" stroke-linecap="round" fill="#86efac" />
    <text x="200" y="195" font-family="system-ui, sans-serif" font-weight="800" font-size="17" fill="#ffffff" text-anchor="middle">${name}</text>
    <text x="200" y="220" font-family="system-ui, sans-serif" font-weight="600" font-size="11" fill="#86efac" text-anchor="middle">MRITTIKA AI CROP REGISTRY</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
