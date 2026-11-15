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
    url: "/images/crops/rice_aman.jpg",
    altEn: "Vibrant green Aman rice seedlings reflecting in flooded rural Bangladesh field",
    altBn: "গ্রামবাংলার শান্ত জলে প্রতিফলিত সতেজ আমন ধানের চারা ও ফসলি জমি",
    categoryEn: "Cereal Grain",
    categoryBn: "দানাশস্য",
    accentColor: "#15803d",
  },
  rice_aus: {
    url: "/images/crops/rice_aus.jpg",
    altEn: "Farmer transplanting sunlit green Aus rice seedlings in terraced paddy",
    altBn: "আউশ মৌসুমে ফসলি জমিতে ধানের চারা রোপণরত কৃষক",
    categoryEn: "Cereal Grain",
    categoryBn: "দানাশস্য",
    accentColor: "#16a34a",
  },
  rice_boro: {
    url: "/images/crops/rice_boro.jpg",
    altEn: "Bangladeshi farmer working in high-yielding Boro rice research field at BRRI",
    altBn: "বাংলাদেশ ধান গবেষণা ইনস্টিটিউট (BRRI) গবেষণা মাঠে বোরো ধান পরিচর্যারত কৃষক",
    categoryEn: "Cereal Grain",
    categoryBn: "দানাশস্য",
    accentColor: "#059669",
  },
  wheat: {
    url: "/images/crops/wheat.jpg",
    altEn: "Golden ripe wheat spikes swaying in winter agricultural farm",
    altBn: "শীতের মাঠে সোনালী পাকা গমের শীষ",
    categoryEn: "Cereal Grain",
    categoryBn: "দানাশস্য",
    accentColor: "#d97706",
  },
  maize: {
    url: "/images/crops/maize.jpg",
    altEn: "Fresh golden maize corn cobs with green husks in sunlit farm",
    altBn: "সূর্যালোকিত ভুট্টা ক্ষেতে পুষ্ট সোনালী ভুট্টার মোচা",
    categoryEn: "Cereal & Fodder",
    categoryBn: "দানাশস্য ও গোখাদ্য",
    accentColor: "#ca8a04",
  },
  potato: {
    url: "/images/crops/potato.jpg",
    altEn: "Freshly harvested organic potatoes resting in fertile agricultural loam",
    altBn: "উর্বর দোআঁশ মাটিতে সদ্য উত্তোলিত পুষ্ট গোল আলু",
    categoryEn: "Tuber Crop",
    categoryBn: "কন্দ জাতীয় ফসল",
    accentColor: "#b45309",
  },
  jute: {
    url: "/images/crops/jute.jpg",
    altEn: "DAE modern jute demonstration plot in rural Bangladesh riverine tract",
    altBn: "কৃষি সম্প্রসারণ অধিদপ্তরের আধুনিক পাট চাষের প্রদর্শনী প্লট",
    categoryEn: "Cash Fiber Crop",
    categoryBn: "অর্থকরী আঁশ ফসল",
    accentColor: "#15803d",
  },
  mustard: {
    url: "/images/crops/mustard.jpg",
    altEn: "Breathtaking endless blooming yellow mustard flower field in Bangladesh",
    altBn: "শীতের দিগন্তবিস্তৃত হলুদ সরিষা ফুলে ভরা নয়নাভিরাম সরিষা ক্ষেত",
    categoryEn: "Oilseed Crop",
    categoryBn: "তৈলবীজ ফসল",
    accentColor: "#eab308",
  },
  lentil: {
    url: "/images/crops/lentil.jpg",
    altEn: "Protein-rich whole and split red lentils pulses",
    altBn: "আমিষসমৃদ্ধ পুষ্টিকর গোটা ও ভাঙা লাল মসুর ডাল",
    categoryEn: "Pulse Crop",
    categoryBn: "ডাল জাতীয় ফসল",
    accentColor: "#ea580c",
  },
  tomato: {
    url: "/images/crops/tomato.jpg",
    altEn: "Vibrant ripe red tomatoes ripening on organic garden vine",
    altBn: "গাছে পাকা উজ্জ্বল লাল তাজা টমেটোর থোকা",
    categoryEn: "Vegetable",
    categoryBn: "শাকসবজি",
    accentColor: "#dc2626",
  },
  brinjal: {
    url: "/images/crops/brinjal.jpg",
    altEn: "Fresh glossy purple eggplant brinjal developing on farm plant",
    altBn: "ক্ষেতের গাছে সতেজ বৃদ্ধিমান চকচকে বেগুন",
    categoryEn: "Vegetable",
    categoryBn: "শাকসবজি",
    accentColor: "#7e22ce",
  },
  onion: {
    url: "/images/crops/onion.jpg",
    altEn: "Freshly harvested red onions with natural dry skins in field",
    altBn: "মাঠ থেকে সদ্য সংগৃহীত লাল দেশি পেঁয়াজ",
    categoryEn: "Spice & Vegetable",
    categoryBn: "মশলা ও সবজি",
    accentColor: "#be185d",
  },
  chilli: {
    url: "/images/crops/chilli.jpg",
    altEn: "Bright red and green hot spicy chillies hanging on healthy pepper plant",
    altBn: "গাছে ঝুলন্ত তাজা সবুজ ও লাল ঝাল মরিচ",
    categoryEn: "Spice Crop",
    categoryBn: "মশলা জাতীয় ফসল",
    accentColor: "#b91c1c",
  },
  banana: {
    url: "/images/crops/banana.jpg",
    altEn: "Lush bunch of developing green bananas with flower cone on plantation tree",
    altBn: "কলা গাছে মোচাসহ থোকায় বেড়ে ওঠা পুষ্ট কাঁচা কলার ছড়ি",
    categoryEn: "Fruit Crop",
    categoryBn: "ফলমূল",
    accentColor: "#65a30d",
  },
  cauliflower_cabbage: {
    url: "/images/crops/cauliflower_cabbage.jpg",
    altEn: "Fresh crisp white cauliflower head surrounded by vibrant green foliage",
    altBn: "সবুজ পাতায় মোড়ানো তাজা ঘন সাদা ফুলকপি",
    categoryEn: "Vegetable",
    categoryBn: "শাকসবজি",
    accentColor: "#15803d",
  },
  garlic: {
    url: "/images/crops/garlic.jpg",
    altEn: "Plump organic garlic bulbs curing in sunlit agricultural harvest",
    altBn: "রোদে শুকানো পরিপুষ্ট দেশি রসুনের কোয়া",
    categoryEn: "Spice Crop",
    categoryBn: "মশলা জাতীয় ফসল",
    accentColor: "#78716c",
  },
  groundnut: {
    url: "/images/crops/groundnut.jpg",
    altEn: "Harvested organic groundnuts peanuts in shell basket",
    altBn: "মাঠ থেকে উত্তোলিত খোসাসহ পুষ্ট চিনাবাদামের ডালি",
    categoryEn: "Oilseed & Pulse",
    categoryBn: "তৈলবীজ ও বাদাম",
    accentColor: "#9a3412",
  },
  mango: {
    url: "/images/crops/mango.jpg",
    altEn: "Fresh healthy green mangoes hanging on orchard tree branch in Rajshahi",
    altBn: "রাজশাহীর বাগানে গাছে ডালে ঝুলন্ত পুষ্ট তাজা কাঁচা আম",
    categoryEn: "Perennial Fruit",
    categoryBn: "বারোমাসি ফলমূল",
    accentColor: "#16a34a",
  },
  mungbean: {
    url: "/images/crops/mungbean.jpg",
    altEn: "Green mungbean whole grains and nutritious pulse seeds",
    altBn: "পুষ্টিকর গোটা সবুজ মুগ ডালের দানা",
    categoryEn: "Pulse Crop",
    categoryBn: "ডাল জাতীয় ফসল",
    accentColor: "#166534",
  },
  papaya: {
    url: "/images/crops/papaya.jpg",
    altEn: "Fresh sweet sliced ripening papaya with natural seeds",
    altBn: "পুষ্টিকর মিষ্টি তাজা পাকা পেঁপের ফল",
    categoryEn: "Fruit Crop",
    categoryBn: "ফলমূল",
    accentColor: "#d97706",
  },
  pumpkin: {
    url: "/images/crops/pumpkin.jpg",
    altEn: "Large ripe orange pumpkin resting in agricultural vegetable farm",
    altBn: "ক্ষেতে লতায় ধরে থাকা বড় পাকা মিষ্টি কুমড়া",
    categoryEn: "Vegetable",
    categoryBn: "শাকসবজি",
    accentColor: "#c2410c",
  },
  sesame: {
    url: "/images/crops/sesame.jpg",
    altEn: "Sesame plant with healthy seed capsules and flowers in oilseed field",
    altBn: "মাঠের তিল গাছ ও বীজভর্তি পুষ্ট তিলের শুঁটি",
    categoryEn: "Oilseed Crop",
    categoryBn: "তৈলবীজ ফসল",
    accentColor: "#713f12",
  },
  sugarcane: {
    url: "/images/crops/sugarcane.jpg",
    altEn: "Bangladeshi farmers harvesting and loading sweet sugarcane stalks in field",
    altBn: "মাঠ থেকে মিষ্টি আখ সংগ্রহ ও পরিবহনে কৃষকদের কর্মব্যস্ততা",
    categoryEn: "Cash Sugar Crop",
    categoryBn: "অর্থকরী চিনি ফসল",
    accentColor: "#15803d",
  },
  tea: {
    url: "/images/crops/tea.jpg",
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
    url: "/images/fertilizers/urea.svg",
    altEn: "High-grade white prilled urea nitrogen fertilizer (46% N) for crop vegetative growth",
    altBn: "ফসলের দৈহিক বৃদ্ধি সহায়ক দানাদার সাদা ইউরিয়া নাইট্রোজেন সার (৪৬% এন)",
    categoryEn: "Nitrogen Fertilizer (46% N)",
    categoryBn: "নাইট্রোজেন সার (৪৬% এন)",
    accentColor: "#1d4ed8",
  },
  tsp: {
    url: "/images/fertilizers/tsp.svg",
    altEn: "Granular dark Triple Super Phosphate TSP (46% P2O5) for root development and vigor",
    altBn: "ফসলের শিকড় মজবুত ও দ্রুত কুশি বৃদ্ধিকারক টিএসপি ফসফেট সার (৪৬% পি২ও৫)",
    categoryEn: "Phosphate Fertilizer (46% P2O5)",
    categoryBn: "ফসফেট সার (৪৬% পি২ও৫)",
    accentColor: "#475569",
  },
  mop: {
    url: "/images/fertilizers/mop.svg",
    altEn: "Muriate of Potash MoP reddish-pink granules (60% K2O) for disease resistance",
    altBn: "গাছ শক্ত ও রোগবালাই প্রতিরোধ সহায়ক লালচে এমওপি পটাশ সার (৬০% কে২ও)",
    categoryEn: "Potash Fertilizer (60% K2O)",
    categoryBn: "পটাশিয়াম সার (৬০% কে২ও)",
    accentColor: "#b91c1c",
  },
  gypsum: {
    url: "/images/fertilizers/gypsum.svg",
    altEn: "Pure agricultural gypsum calcium sulphate amendment for sulfur nutrition",
    altBn: "মাটির সালফার ঘাটতি দূরীকরণ ও পুষ্টি উন্নয়নে জিপসাম সার",
    categoryEn: "Sulfur & Calcium (18% S)",
    categoryBn: "সালফার ও ক্যালসিয়াম সার",
    accentColor: "#64748b",
  },
  zinc: {
    url: "/images/fertilizers/zinc.svg",
    altEn: "Zinc sulphate micronutrient crystals (36% Zn) preventing rice khaira disease",
    altBn: "ধানের খয়রা রোগ প্রতিরোধ ও ফসলের সতেজতায় জিংক সালফেট সার",
    categoryEn: "Micronutrient (36% Zn)",
    categoryBn: "অণুপুষ্টি সার (দস্তা)",
    accentColor: "#0284c7",
  },
  cowdung: {
    url: "/images/fertilizers/cowdung.svg",
    altEn: "Well-decomposed organic farmyard manure and vermicompost for soil health",
    altBn: "মাটির জৈব স্বাস্থ্য ও পানি ধারণক্ষমতা বৃদ্ধিকারী পচা গোবর সার",
    categoryEn: "Organic Amendment",
    categoryBn: "জৈব সার",
    accentColor: "#78350f",
  },
  application: {
    url: "/images/fertilizers/application.jpg",
    altEn: "Scientifically timed fertilizer distribution and top-dressing in agricultural field",
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
    url: "/images/scenic/homepageHero.jpg",
    altEn: "Sunset over lush green rice paddy reflection in rural Bangladesh landscape",
    altBn: "গ্রামবাংলার সোনালী ধানক্ষেতে নয়নাভিরাম রক্তিম সূর্যাস্ত ও প্রকৃতির দৃশ্য",
  },
  precisionFarming: {
    url: "/images/scenic/precisionFarming.jpg",
    altEn: "Agronomist using precision mobile agritech in fertile agricultural field",
    altBn: "মাঠপর্যায়ে আধুনিক ডিজিটাল কৃষি প্রযুক্তি ব্যবহারকারী কৃষক",
  },
  ruralLandscape: {
    url: "/images/scenic/ruralLandscape.jpg",
    altEn: "Hands holding rich fertile agricultural soil with young green sprout",
    altBn: "উর্বর দোআঁশ মাটিতে সতেজ চারা রোপণের দৃশ্য",
  },
  soilTesting: {
    url: "/images/scenic/soilTesting.jpg",
    altEn: "Agricultural scientific soil profile sampling and soil nutrient testing",
    altBn: "ল্যাব পরীক্ষার জন্য বৈজ্ঞানিক পদ্ধতিতে মাটির নমুনা সংগ্রহ ও প্রোফাইল পরীক্ষা",
  },
  pestInspection: {
    url: "/images/scenic/pestInspection.jpg",
    altEn: "Agricultural extension officer scouting and inspecting crop foliage in field",
    altBn: "মাঠপর্যায়ে ফসলের রোগবালাই ও বালাই দমন নিরীক্ষায় কৃষি কর্মকর্তা",
  },
  researchLab: {
    url: "/images/scenic/researchLab.jpg",
    altEn: "Agricultural scientific research laboratory analyzing crop genetics and soil health",
    altBn: "জাত ও মাটির পুষ্টি গবেষণারত কৃষি গবেষণাগার",
  },
  farmerHarvest: {
    url: "/images/scenic/farmerHarvest.jpg",
    altEn: "Bangladeshi farmer working in BRRI research paddy field",
    altBn: "মাঠপর্যায়ে ধান গবেষণা ও উচ্চফলনশীল ফসল পরিচর্যায় কৃষক",
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
