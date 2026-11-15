import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Sprout,
  FlaskConical,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Database,
  CloudSun,
  FileText,
  Sparkles,
  BarChart3,
  ChevronRight,
  Zap,
  Wheat,
  Layers,
  Check,
  Calendar,
  Compass,
  Award,
  ArrowUpRight,
} from "lucide-react";
import { SCENIC_IMAGES, CROP_IMAGES, FERTILIZER_IMAGES } from "../utils/agroImages";

export const LandingPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [activeCropFilter, setActiveCropFilter] = useState<string>("all");
  const [activeScenarioIdx, setActiveScenarioIdx] = useState<number>(0);
  const [fertilizerUnit, setFertilizerUnit] = useState<"bigha" | "shotok" | "hectare">("bigha");

  // 1. Live Interactive Agro-Climatic Scenarios for Hero Preview
  const HERO_SCENARIOS = [
    {
      id: "bogra-boro",
      districtEn: "Bogra",
      districtBn: "বগুড়া",
      soilEn: "Medium High Land • Loam Soil",
      soilBn: "মাঝারি উঁচু জমি • দোআঁশ মাটি",
      seasonEn: "Rabi Season (Boro)",
      seasonBn: "রবি মৌসুম (বোরো)",
      n: 95,
      p: 48,
      k: 62,
      ph: 6.4,
      topCropKey: "rice_boro",
      topCropEn: "BRRI dhan29 (Boro Rice)",
      topCropBn: "ব্রি ধান২৯ (বোরো ধান)",
      matchPct: 97.2,
      fertilizerSummaryEn: "Urea 3 splits • Basal TSP/MoP",
      fertilizerSummaryBn: "ইউরিয়া ৩ কিস্তিতে • বেসাল টিএসপি/এমওপি",
    },
    {
      id: "dinajpur-maize",
      districtEn: "Dinajpur",
      districtBn: "দিনাজপুর",
      soilEn: "Old Himalayan Piedmont • Sandy Loam",
      soilBn: "পুরাতন হিমালয় পললভূমি • বেলে দোআঁশ",
      seasonEn: "Rabi Season (Maize)",
      seasonBn: "রবি মৌসুম (ভুট্টা)",
      n: 110,
      p: 55,
      k: 70,
      ph: 6.1,
      topCropKey: "maize",
      topCropEn: "Hybrid Yellow Maize",
      topCropBn: "হাইব্রিড হলুদ ভুট্টা",
      matchPct: 96.5,
      fertilizerSummaryEn: "High Nitrogen & Zinc requirement",
      fertilizerSummaryBn: "উচ্চ নাইট্রোজেন ও জিংক প্রয়োজন",
    },
    {
      id: "jessore-mustard",
      districtEn: "Jessore",
      districtBn: "যশোর",
      soilEn: "High Ganges Floodplain • Calcareous",
      soilBn: "গঙ্গা পললভূমি • চুনযুক্ত পলি দোআঁশ",
      seasonEn: "Winter Rabi (Mustard)",
      seasonBn: "শীতকালীন রবি (সরিষা)",
      n: 80,
      p: 40,
      k: 50,
      ph: 7.2,
      topCropKey: "mustard",
      topCropEn: "BARI Sarisha-14 (Mustard)",
      topCropBn: "বারি সরিষা-১৪ (হলুদ সরিষা)",
      matchPct: 95.8,
      fertilizerSummaryEn: "Sulfur/Gypsum critical for oil content",
      fertilizerSummaryBn: "তৈল বৃদ্ধির জন্য জিপসাম/সালফার আবশ্যক",
    },
  ];

  const currentScenario = HERO_SCENARIOS[activeScenarioIdx];

  // 2. All 24 Crops Filtered List
  const cropList = Object.entries(CROP_IMAGES).map(([slug, data]) => ({
    slug,
    ...data,
  }));

  const filteredCrops = cropList.filter((crop) => {
    if (activeCropFilter === "all") return true;
    if (activeCropFilter === "cereal") return crop.categoryEn.includes("Cereal");
    if (activeCropFilter === "vegetable") return crop.categoryEn.includes("Vegetable") || crop.categoryEn.includes("Spice");
    if (activeCropFilter === "cash") return crop.categoryEn.includes("Cash") || crop.categoryEn.includes("Fiber") || crop.categoryEn.includes("Sugar");
    if (activeCropFilter === "fruit") return crop.categoryEn.includes("Fruit") || crop.categoryEn.includes("Perennial");
    if (activeCropFilter === "pulse_oil") return crop.categoryEn.includes("Pulse") || crop.categoryEn.includes("Oilseed");
    return true;
  });

  // Fertilizer Unit Calculation Multipliers (baseline Bigha = 33 Shotok)
  const unitMultiplier = fertilizerUnit === "bigha" ? 1 : fertilizerUnit === "shotok" ? 1 / 33 : 2.47;
  const ureaDosage = Math.round(36 * unitMultiplier);
  const tspDosage = Math.round(18 * unitMultiplier);
  const mopDosage = Math.round(20 * unitMultiplier);
  const gypsumDosage = Math.round(12 * unitMultiplier);

  return (
    <div className="w-full bg-[#fbfbfd] text-[#1d1d1f] selection:bg-emerald-100 selection:text-emerald-900 font-sans">
      
      {/* =========================================================================
          SECTION 1: THE HERO EXPERIENCE (Editorial Agricultural Storytelling)
          ========================================================================= */}
      <section className="relative overflow-hidden pt-8 pb-16 sm:pt-14 sm:pb-24 border-b border-black/[0.05] bg-gradient-to-b from-[#f5f5f7] via-[#fbfbfd] to-[#ffffff]">
        {/* Subtle Ambient Radial Warmth */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Top Status & Accreditation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-8 sm:pb-12 border-b border-black/[0.06]">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/[0.03] border border-black/[0.06] text-xs font-semibold text-[#1d1d1f]">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>
                {i18n.language === "bn"
                  ? "বাংলাদেশ কৃষি গবেষণা কাউন্সিল (BARC) সার নির্দেশিকা মানসম্মত"
                  : "BARC Fertilizer Recommendation Standards 2018 Compliant"}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-4 text-xs font-medium text-[#86868b]">
              <span>{i18n.language === "bn" ? "৩০টি কৃষি-পরিবেশ অঞ্চল (AEZ)" : "30 Agro-Ecological Zones Calibrated"}</span>
              <span>•</span>
              <span>{i18n.language === "bn" ? "২৪টি প্রধান জাতীয় ফসল" : "24 Canonical Crops"}</span>
            </div>
          </div>

          {/* Main Asymmetric Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pt-8 sm:pt-12">
            
            {/* Left Column (7 cols): Editorial Typography & Direct Action */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8">
              <div className="space-y-4">
                <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-emerald-800 font-mono">
                  {i18n.language === "bn" ? "জাতীয় ডিজিটাল কৃষি বুদ্ধিমত্তা" : "National Agritech Intelligence Platform"}
                </span>

                <h1 className="text-4xl sm:text-6xl lg:text-[64px] font-black tracking-tight leading-[1.05] text-[#1d1d1f]">
                  {i18n.language === "bn" ? (
                    <>
                      মাটির পুষ্টি ও আবহাওয়ায় <br />
                      <span className="text-emerald-700">বিজ্ঞানভিত্তিক স্মার্ট চাষাবাদ</span>
                    </>
                  ) : (
                    <>
                      Precision Agriculture <br />
                      <span className="text-emerald-700">Grounded in Soil Science</span>
                    </>
                  )}
                </h1>

                <p className="text-base sm:text-lg text-[#55555b] max-w-2xl leading-relaxed font-bangla font-normal">
                  {i18n.language === "bn"
                    ? "আপনার জমির নির্দিষ্ট N-P-K মাত্রা, মাটির পিএইচ ও আঞ্চলিক আবহাওয়া বিশ্লেষণ করে সর্বোচ্চ ফলনশীল ফসল নির্বাচন, সুষম সারের কিস্তিভিত্তিক ডোজ এবং সরকারি গবেষণা প্রকাশনা উদ্ধৃত বাংলা পরামর্শ।"
                    : "Empowering 16.5 million Bangladeshi farmers across 30 Agro-Ecological Zones with site-specific crop matching, stage-wise balanced fertilizer formulations, and page-cited Bangla AI guidance."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  to="/crop"
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm sm:text-base shadow-apple hover:shadow-apple-hover transition-all active:scale-[0.98] cursor-pointer group"
                >
                  <Sprout className="w-5 h-5 text-emerald-200" />
                  <span>{i18n.language === "bn" ? "সেরা ফসল নির্বাচন করুন" : "Start Crop Advisory"}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/fertilizer"
                  className="inline-flex items-center gap-2.5 px-7 py-4 rounded-full bg-white hover:bg-[#f5f5f7] text-[#1d1d1f] font-semibold text-sm sm:text-base border border-black/10 shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
                >
                  <FlaskConical className="w-4 h-4 text-amber-600" />
                  <span>{i18n.language === "bn" ? "সারের সঠিক মাত্রা হিসাব" : "Calculate Fertilizer"}</span>
                </Link>

                <Link
                  to="/assistant"
                  className="inline-flex items-center gap-2 px-5 py-4 rounded-full text-xs sm:text-sm font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>{i18n.language === "bn" ? "বাংলা এআই সহকারী" : "Bangla AI Assistant"}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Minimalist Horizontal Proof Points Strip */}
              <div className="pt-6 sm:pt-8 border-t border-black/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-[#1d1d1f] font-mono tracking-tight">24</p>
                  <p className="text-xs text-[#86868b] font-medium mt-0.5">{i18n.language === "bn" ? "প্রধান ফসল" : "Canonical Crops"}</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-[#1d1d1f] font-mono tracking-tight">30</p>
                  <p className="text-xs text-[#86868b] font-medium mt-0.5">{i18n.language === "bn" ? "কৃষি-পরিবেশ অঞ্চল" : "Agro-Ecological Zones"}</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-[#1d1d1f] font-mono tracking-tight">98.4%</p>
                  <p className="text-xs text-[#86868b] font-medium mt-0.5">{i18n.language === "bn" ? "মডেল নির্ভুলতা" : "Cross-Val Accuracy"}</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono tracking-tight">100%</p>
                  <p className="text-xs text-[#86868b] font-medium mt-0.5">{i18n.language === "bn" ? "বিনামূল্যে উন্মুক্ত" : "Free & Open Access"}</p>
                </div>
              </div>
            </div>

            {/* Right Column (5 cols): Layered Editorial Photography & Live Simulator */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Primary Curated Agro-Photograph */}
              <div className="relative rounded-[28px] overflow-hidden border border-black/[0.08] shadow-apple group bg-black">
                <img
                  src={SCENIC_IMAGES.homepageHero.url}
                  alt={SCENIC_IMAGES.homepageHero.altEn}
                  className="w-full h-56 sm:h-64 object-cover object-center group-hover:scale-105 transition-all duration-700"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute top-3.5 left-3.5 flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-white/20 text-xs font-semibold text-[#1d1d1f] shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>{i18n.language === "bn" ? "মাঠপর্যায়ে ফসলের নিবিড় পরিচর্যা" : "Field Telemetry Active"}</span>
                </div>

                <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between text-xs text-white">
                  <div>
                    <p className="font-bold text-sm tracking-tight">{i18n.language === "bn" ? "বাংলাদেশ কৃষি অঞ্চল ও সুষম সার মডেল" : "Bangladesh Agro-Zone Model"}</p>
                    <p className="text-[10px] text-white/70 font-mono">AEZ-12 & AEZ-25 • BRRI Benchmark</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-600/90 text-white font-mono text-[10px] font-bold">
                    GPS Synced
                  </span>
                </div>
              </div>

              {/* Minimalist Live Interactive Calibration Card */}
              <div className="p-5 sm:p-6 rounded-[28px] bg-white border border-black/[0.08] shadow-apple space-y-4">
                
                {/* Interactive Scenario Pill Switcher */}
                <div className="flex items-center justify-between border-b border-black/[0.05] pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#86868b] block">
                      {i18n.language === "bn" ? "লাইভ মডেল ক্যালিব্রেশন পরীক্ষা" : "Interactive Agro-Zone Test"}
                    </span>
                    <span className="text-xs font-extrabold text-[#1d1d1f]">
                      {i18n.language === "bn" ? currentScenario.districtBn : currentScenario.districtEn} • {i18n.language === "bn" ? currentScenario.soilBn : currentScenario.soilEn}
                    </span>
                  </div>

                  <div className="inline-flex rounded-full bg-black/[0.03] p-1 border border-black/[0.04]">
                    {HERO_SCENARIOS.map((s, idx) => (
                      <button
                        key={s.id}
                        onClick={() => setActiveScenarioIdx(idx)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                          activeScenarioIdx === idx
                            ? "bg-white text-emerald-800 shadow-2xs"
                            : "text-[#86868b] hover:text-[#1d1d1f]"
                        }`}
                      >
                        {i18n.language === "bn" ? s.districtBn : s.districtEn}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nutrients Gauges */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-[#fbfbfd] border border-black/[0.04]">
                    <span className="text-[10px] text-[#86868b] block font-medium">Nitrogen</span>
                    <span className="text-xs font-bold text-emerald-800 font-mono">{currentScenario.n} kg</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#fbfbfd] border border-black/[0.04]">
                    <span className="text-[10px] text-[#86868b] block font-medium">Phosphorus</span>
                    <span className="text-xs font-bold text-teal-800 font-mono">{currentScenario.p} kg</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#fbfbfd] border border-black/[0.04]">
                    <span className="text-[10px] text-[#86868b] block font-medium">Potassium</span>
                    <span className="text-xs font-bold text-amber-800 font-mono">{currentScenario.k} kg</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#fbfbfd] border border-black/[0.04]">
                    <span className="text-[10px] text-[#86868b] block font-medium">Soil pH</span>
                    <span className="text-xs font-bold text-[#1d1d1f] font-mono">{currentScenario.ph}</span>
                  </div>
                </div>

                {/* Recommended Top Result Row */}
                <div className="p-3.5 rounded-2xl bg-[#f5f5f7] border border-black/[0.04] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={CROP_IMAGES[currentScenario.topCropKey]?.url || CROP_IMAGES["rice_boro"].url}
                      alt={currentScenario.topCropEn}
                      className="w-12 h-12 rounded-xl object-cover border border-emerald-600/30"
                      loading="lazy"
                    />
                    <div>
                      <span className="text-[10px] font-bold text-emerald-800 flex items-center gap-1 uppercase tracking-wider">
                        <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
                        {currentScenario.matchPct}% {i18n.language === "bn" ? "উপযোগিতা" : "Suitability Match"}
                      </span>
                      <h4 className="text-xs sm:text-sm font-extrabold text-[#1d1d1f]">
                        {i18n.language === "bn" ? currentScenario.topCropBn : currentScenario.topCropEn}
                      </h4>
                      <p className="text-[10px] text-[#86868b] truncate max-w-[180px]">
                        {i18n.language === "bn" ? currentScenario.fertilizerSummaryBn : currentScenario.fertilizerSummaryEn}
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/crop"
                    className="px-3.5 py-2 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-2xs whitespace-nowrap active:scale-95 cursor-pointer"
                  >
                    {i18n.language === "bn" ? "যাচাই করুন" : "Verify →"}
                  </Link>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>


      {/* =========================================================================
          SECTION 2: EDITORIAL BRAND NARRATIVE (The Science & The Soil)
          ========================================================================= */}
      <section className="py-16 sm:py-24 border-b border-black/[0.05] bg-white">
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
          
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 font-mono">
              {i18n.language === "bn" ? "কৃষি বিজ্ঞান ও কৃত্রিম বুদ্ধিমত্তা" : "The Agronomic Foundation"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#1d1d1f] tracking-tight leading-tight">
              {i18n.language === "bn"
                ? "সনাতন গড় হিসাবের যুগ শেষ। আধুনিক চাষাবাদে চাই প্লটভিত্তিক নিখুঁত বিজ্ঞান।"
                : "Traditional farming relied on regional averages. Modern agriculture demands plot-by-plot precision."}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
            
            {/* Left Column Text */}
            <div className="lg:col-span-6 space-y-4 text-sm sm:text-base text-[#55555b] leading-relaxed font-bangla">
              <p>
                {i18n.language === "bn"
                  ? "বাংলাদেশের ৩০টি কৃষি-পরিবেশ অঞ্চল (AEZ) ভৌগোলিক ও রাসায়নিকভাবে সম্পূর্ণ বৈচিত্র্যময়। বরেন্দ্র অঞ্চলের লাল মাটির পিএইচ ও ফসফরাস ধারণক্ষমতার সাথে যমুনা অববাহিকার পলি দোআঁশ মাটির পুষ্টি চাহিদা কখনোই এক হতে পারে না।"
                  : "Bangladesh's 30 Agro-Ecological Zones exhibit dramatic nutritional divergence. The acidic red clays of the Barind Tract require vastly different liming and phosphorus management compared to the fertile silt-loam of the Jamuna active floodplains."}
              </p>
              <p>
                {i18n.language === "bn"
                  ? "ঐতিহাসিকভাবে জমিতে মাত্রাতিরিক্ত ইউরিয়া প্রয়োগ এবং জিপসাম ও দস্তার মতো গুরুত্বপূর্ণ অণুপুষ্টির অবহেলায় প্রতি বছর মাটির উর্বরতা ক্ষয় এবং কৃষকের উৎপাদন খরচ অযথা বৃদ্ধি পাচ্ছিল।"
                  : "Historically, arbitrary application of Urea combined with neglect of secondary nutrients like Gypsum and Zinc has caused soil acidification and inflated input costs for millions of smallholders."}
              </p>
            </div>

            {/* Right Column Text */}
            <div className="lg:col-span-6 space-y-4 text-sm sm:text-base text-[#55555b] leading-relaxed font-bangla">
              <p>
                {i18n.language === "bn"
                  ? "মৃত্তিকা এআই এই ব্যবধান ঘোচাতে বাংলাদেশ কৃষি গবেষণা কাউন্সিল (BARC)-এর সার নির্দেশিকা ২০১৮ এবং বাংলাদেশ ধান গবেষণা ইনস্টিটিউট (BRRI)-এর গবেষণা ম্যানুয়ালকে সরাসরি মেশিন লার্নিং ও ভেক্টর সার্চের সাথে সমন্বিত করেছে।"
                  : "Mrittika AI resolves this disparity by directly encoding the official Fertilizer Recommendation Guide (BARC 2018) and BRRI agronomic datasets into calibrated LightGBM, XGBoost, and ChromaDB vector embeddings."}
              </p>
              <div className="p-5 rounded-2xl bg-[#f5f5f7] border border-black/[0.04] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  <Award className="w-4 h-4 text-emerald-700" />
                  <span>{i18n.language === "bn" ? "জাতীয় কৃষি গবেষণা মানদণ্ড" : "Government Research Grounding"}</span>
                </div>
                <p className="text-xs text-[#1d1d1f] font-medium leading-relaxed font-bangla">
                  {i18n.language === "bn"
                    ? "কোনো কাল্পনিক অনুমান নয়; প্রতিটি হিসাব ও পরামর্শ সরাসরি জাতীয় গবেষণাগারের অনুমোদিত নথিপত্র এবং উপজেলা কৃষি কর্মকর্তার নিরীক্ষা কাঠামোর সাথে সংযুক্ত।"
                    : "Zero synthetic guesswork. Every recommendation cites authoritative research literature and feeds into the Upazila Agricultural Officer review loop."}
                </p>
              </div>
            </div>

          </div>

          {/* Full-Width Editorial Photographic Accent Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            <div className="relative rounded-[24px] overflow-hidden border border-black/[0.06] group aspect-[16/10]">
              <img
                src={SCENIC_IMAGES.ruralLandscape.url}
                alt="Fertile Loam Soil"
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-5">
                <span className="text-xs font-bold text-white">
                  {i18n.language === "bn" ? "উর্বর দোআঁশ মাটির প্রোফাইল বিশ্লেষণ" : "Soil Health & Nutrient Profiling"}
                </span>
              </div>
            </div>

            <div className="relative rounded-[24px] overflow-hidden border border-black/[0.06] group aspect-[16/10]">
              <img
                src={FERTILIZER_IMAGES.application.url}
                alt="Scientific Fertilizer Application"
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-5">
                <span className="text-xs font-bold text-white">
                  {i18n.language === "bn" ? "সুষম সার কিস্তির সঠিক সময়সূচী" : "Precision Fertilizer Split Scheduling"}
                </span>
              </div>
            </div>

            <div className="relative rounded-[24px] overflow-hidden border border-black/[0.06] group aspect-[16/10]">
              <img
                src={SCENIC_IMAGES.pestInspection.url}
                alt="Field Agronomic Inspection"
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-5">
                <span className="text-xs font-bold text-white">
                  {i18n.language === "bn" ? "মাঠপর্যায়ে ফসলের রোগ নিরীক্ষা" : "Field-Level Disease & Pest Scouting"}
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>


      {/* =========================================================================
          SECTION 3: THREE CORE AI CAPABILITIES (Distinct Asymmetric Presentations)
          ========================================================================= */}
      <section className="py-16 sm:py-24 border-b border-black/[0.05] bg-[#fbfbfd]">
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-20 sm:space-y-28">
          
          <div className="max-w-2xl space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 font-mono">
              {i18n.language === "bn" ? "তিনটি সমন্বিত স্তম্ভ" : "The Core Technology Stack"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#1d1d1f] tracking-tight">
              {i18n.language === "bn" ? "কৃষকের সিদ্ধান্ত গ্রহণে তিনটি শক্তিশালী ইঞ্জিন" : "Three Dedicated Engines Designed for Agricultural Reality"}
            </h2>
          </div>

          {/* -------------------------------------------------------------------
              CAPABILITY 1: CROP RECOMMENDATION (Editorial Split-Screen Showcase)
              ------------------------------------------------------------------- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            
            {/* Left 6 cols: High-Res Crop Field Visual Showcase */}
            <div className="lg:col-span-6 relative rounded-[32px] overflow-hidden border border-black/[0.08] shadow-apple group">
              <img
                src={CROP_IMAGES["rice_boro"].url}
                alt="BRRI Research Field"
                className="w-full h-80 sm:h-96 lg:h-[460px] object-cover group-hover:scale-105 transition-all duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              
              <div className="absolute top-4 left-4">
                <span className="px-3.5 py-1.5 rounded-full bg-white/95 text-[#1d1d1f] text-xs font-bold border border-black/[0.08] shadow-2xs backdrop-blur-md">
                  {i18n.language === "bn" ? "স্তম্ভ ০১ • ফসল উপযোগিতা মডেল" : "Pillar 01 • Crop Suitability Model"}
                </span>
              </div>

              <div className="absolute bottom-5 left-5 right-5 text-white space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  {i18n.language === "bn" ? "২৪টি প্রধান আঞ্চলিক ফসলের জন্য ক্যালিব্রেটেড" : "Calibrated for 24 Canonical Crops"}
                </span>
                <h4 className="text-lg sm:text-xl font-bold">
                  {i18n.language === "bn" ? "আমন, বোরো, গম, ভুট্টা, আলু, সরিষা ও ডাল" : "Aman & Boro Rice, Wheat, Maize, Potato, Mustard & Pulses"}
                </h4>
              </div>
            </div>

            {/* Right 6 cols: Deep Editorial Narrative & Action */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-mono">
                  01 / Intelligent Crop Selection
                </span>
                <h3 className="text-2xl sm:text-4xl font-black text-[#1d1d1f] tracking-tight">
                  {i18n.language === "bn"
                    ? "মাটির পুষ্টি ও আবহাওয়া মিলিয়ে সেরা ৩টি লাভজনক ফসল"
                    : "Predict Highest-Yielding Crops Matching Your Exact Soil Chemistry"}
                </h3>
                <p className="text-sm sm:text-base text-[#55555b] leading-relaxed font-bangla">
                  {i18n.language === "bn"
                    ? "জমির নাইট্রোজেন (N), ফসফরাস (P), পটাশিয়াম (K), মাটির পিএইচ (pH) এবং জেলার তাপমাত্রা ও বৃষ্টিপাতের ডেটাসেট বিশ্লেষণ করে এআই মডেল আপনার মাটির জন্য সর্বোচ্চ সামঞ্জস্যপূর্ণ ফসলের র্যাঙ্ক তালিকা প্রদান করে।"
                    : "By ingesting N, P, K parts-per-million, soil pH, and local seasonal rainfall telemetry, our model generates a ranked suitability index with top-3 crop recommendations and confidence metrics."}
                </p>
              </div>

              <div className="space-y-3 border-t border-black/[0.06] pt-4 text-xs sm:text-sm text-[#1d1d1f]">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">{i18n.language === "bn" ? "পুষ্টি সামঞ্জস্য স্কোর (Suitability %)" : "Nutrient Fit Confidence Score"}</strong>
                    <span className="text-[#86868b]">{i18n.language === "bn" ? "কোন ফসল আপনার মাটির পুষ্টিতে সবচেয়ে বেশি সাড়া দেবে তা শতাংশে প্রদর্শন।" : "See exactly how well each crop fits your land's specific fertility profile."}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">{i18n.language === "bn" ? "সরাসরি সার গণনায় অটো-ফ্লো" : "1-Click Direct Flow to Fertilizer Plan"}</strong>
                    <span className="text-[#86868b]">{i18n.language === "bn" ? "নির্বাচিত ফসলের তথ্য পুনরায় না লিখে এক ক্লিকে সার হিসাব পেজে স্থানান্তর।" : "Input soil data once; it automatically flows into fertilizer stage splitting."}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/crop"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm transition-all shadow-apple active:scale-[0.98] cursor-pointer"
                >
                  <span>{i18n.language === "bn" ? "ফসল নির্বাচন শুরু করুন" : "Find Best Crops for Your Land"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>


          {/* -------------------------------------------------------------------
              CAPABILITY 2: SMART FERTILIZER ENGINE (Horizontal Interactive Layout)
              ------------------------------------------------------------------- */}
          <div className="p-8 sm:p-12 rounded-[36px] bg-white border border-black/[0.06] shadow-apple space-y-8">
            
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-black/[0.05] pb-6">
              <div className="space-y-2 max-w-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 font-mono">
                  02 / Balanced Fertilizer Engine
                </span>
                <h3 className="text-2xl sm:text-4xl font-black text-[#1d1d1f] tracking-tight">
                  {i18n.language === "bn" ? "সুষম সারের সঠিক মাত্রা ও কিস্তিভিত্তিক প্রয়োগ" : "BARC-Standard Stage-by-Stage Fertilizer Splitting"}
                </h3>
                <p className="text-xs sm:text-sm text-[#55555b] font-bangla">
                  {i18n.language === "bn"
                    ? "ইউরিয়া, টিএসপি, এমওপি ও জিপসাম সারের অপচয় রোধে সঠিক কিস্তির সময়সূচী।"
                    : "Prevent toxic over-fertilization and nutrient runoff with precision split timing for Urea, TSP, MoP, and Gypsum."}
                </p>
              </div>

              {/* Interactive Unit Switcher Pill */}
              <div className="p-1 bg-[#f5f5f7] rounded-full border border-black/[0.05] inline-flex items-center">
                <button
                  onClick={() => setFertilizerUnit("bigha")}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    fertilizerUnit === "bigha"
                      ? "bg-white text-[#1d1d1f] shadow-2xs"
                      : "text-[#86868b] hover:text-[#1d1d1f]"
                  }`}
                >
                  {i18n.language === "bn" ? "১ বিঘা (৩৩ শতক)" : "1 Bigha (33 Decimal)"}
                </button>
                <button
                  onClick={() => setFertilizerUnit("shotok")}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    fertilizerUnit === "shotok"
                      ? "bg-white text-[#1d1d1f] shadow-2xs"
                      : "text-[#86868b] hover:text-[#1d1d1f]"
                  }`}
                >
                  {i18n.language === "bn" ? "১ শতক (Decimal)" : "1 Decimal"}
                </button>
                <button
                  onClick={() => setFertilizerUnit("hectare")}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    fertilizerUnit === "hectare"
                      ? "bg-white text-[#1d1d1f] shadow-2xs"
                      : "text-[#86868b] hover:text-[#1d1d1f]"
                  }`}
                >
                  {i18n.language === "bn" ? "১ হেক্টর (Hectare)" : "1 Hectare"}
                </button>
              </div>
            </div>

            {/* Horizontal Split Schedule Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="p-5 rounded-2xl bg-[#fbfbfd] border border-black/[0.05] space-y-2">
                <div className="flex items-center justify-between text-xs text-[#86868b]">
                  <span className="font-bold text-blue-700">Urea (ইউরিয়া)</span>
                  <span className="font-mono">46% N</span>
                </div>
                <p className="text-3xl font-black text-[#1d1d1f] font-mono">{ureaDosage} kg</p>
                <p className="text-[11px] text-[#86868b] font-bangla font-medium">
                  {i18n.language === "bn" ? "৩ সমান কিস্তিতে প্রয়োগ (বেসাল, কুশি ও থোড় আসার আগে)" : "Apply in 3 equal splits (Basal, Tillering, Panicle)"}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#fbfbfd] border border-black/[0.05] space-y-2">
                <div className="flex items-center justify-between text-xs text-[#86868b]">
                  <span className="font-bold text-slate-700">TSP (টিএসপি)</span>
                  <span className="font-mono">46% P2O5</span>
                </div>
                <p className="text-3xl font-black text-[#1d1d1f] font-mono">{tspDosage} kg</p>
                <p className="text-[11px] text-[#86868b] font-bangla font-medium">
                  {i18n.language === "bn" ? "জমি তৈরির শেষ চাষে সম্পূর্ণ প্রয়োগ" : "100% applied at final land preparation (Basal)"}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#fbfbfd] border border-black/[0.05] space-y-2">
                <div className="flex items-center justify-between text-xs text-[#86868b]">
                  <span className="font-bold text-red-700">MoP (পটাশ)</span>
                  <span className="font-mono">60% K2O</span>
                </div>
                <p className="text-3xl font-black text-[#1d1d1f] font-mono">{mopDosage} kg</p>
                <p className="text-[11px] text-[#86868b] font-bangla font-medium">
                  {i18n.language === "bn" ? "৫০% বেসাল + ৫০% দ্বিতীয় ইউরিয়া কিস্তির সাথে" : "50% Basal + 50% with second Urea split"}
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#fbfbfd] border border-black/[0.05] space-y-2">
                <div className="flex items-center justify-between text-xs text-[#86868b]">
                  <span className="font-bold text-amber-800">Gypsum (জিপসাম)</span>
                  <span className="font-mono">18% S</span>
                </div>
                <p className="text-3xl font-black text-[#1d1d1f] font-mono">{gypsumDosage} kg</p>
                <p className="text-[11px] text-[#86868b] font-bangla font-medium">
                  {i18n.language === "bn" ? "সালফার ঘাটতি পূরণে জমি তৈরির সময়" : "Basal application for sulfur & calcium uptake"}
                </p>
              </div>

            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <span className="text-xs text-[#86868b] font-bangla">
                {i18n.language === "bn"
                  ? "* বাংলাদেশ কৃষি গবেষণা কাউন্সিল (BARC) সার নির্দেশিকা অনুসারে স্বয়ংক্রিয় হিসাব।"
                  : "* Calculated according to official BARC national fertilizer dosage guidelines."}
              </span>

              <Link
                to="/fertilizer"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-all shadow-apple active:scale-[0.98] cursor-pointer"
              >
                <span>{i18n.language === "bn" ? "সারের পূর্ণাঙ্গ শিডিউল তৈরি করুন" : "Open Fertilizer Dosage Calculator"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>


          {/* -------------------------------------------------------------------
              CAPABILITY 3: BANGLA AI ASSISTANT (Conversational Research RAG)
              ------------------------------------------------------------------- */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            
            {/* Left 6 cols: Research RAG Narrative */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800 font-mono">
                  03 / Conversational Agricultural RAG
                </span>
                <h3 className="text-2xl sm:text-4xl font-black text-[#1d1d1f] tracking-tight">
                  {i18n.language === "bn"
                    ? "বাংলা ভাষায় সরকারি গবেষণা তথ্যসূত্রসহ নির্ভুল কৃষি পরামর্শ"
                    : "Bangla AI Agriculture Assistant with Exact Page-Cited Evidence"}
                </h3>
                <p className="text-sm sm:text-base text-[#55555b] leading-relaxed font-bangla">
                  {i18n.language === "bn"
                    ? "আমাদের চ্যাটবট ইন্টারনেট থেকে ভুল তথ্য বানায় না। এটি বাংলাদেশ ধান গবেষণা ইনস্টিটিউট (BRRI) ও কৃষি গবেষণা কাউন্সিল (BARC)-এর স্বীকৃত প্রকাশনা থেকে পৃষ্ঠা নম্বরসহ নির্ভরযোগ্য সমাধান প্রদান করে।"
                    : "Zero fabricated advice. Grounded in ChromaDB vector embeddings indexing authoritative research manuals from BRRI, BARC, and DAE, complete with page-specific source citations."}
                </p>
              </div>

              <div className="space-y-3 border-t border-black/[0.06] pt-4 text-xs sm:text-sm text-[#1d1d1f]">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">{i18n.language === "bn" ? "বাংলা ভয়েস ইনপুট ও সহজ কথোপকথন" : "Bangla Voice-to-Text Recognition"}</strong>
                    <span className="text-[#86868b]">{i18n.language === "bn" ? "টাইপ করার ঝামেলা নেই; বাংলায় মুখে বলে তাৎক্ষণিক সমাধান পান।" : "Speak directly in Bangla to ask questions regarding pests, diseases, or weather."}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">{i18n.language === "bn" ? "উপজেলা কর্মকর্তা রেফারেল ও অডিট" : "Extension Officer Escalation Protocol"}</strong>
                    <span className="text-[#86868b]">{i18n.language === "bn" ? "উচ্চ-ঝুঁকি বা বিষাক্ত কীটনাশকের ক্ষেত্রে স্থানীয় কর্মকর্তার পরামর্শের রেফারেন্স।" : "High-toxicity pesticide queries automatically advise direct SAAO consultation."}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/assistant"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-teal-800 hover:bg-teal-900 text-white font-semibold text-sm transition-all shadow-apple active:scale-[0.98] cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{i18n.language === "bn" ? "সহকারীকে বাংলায় জিজ্ঞাসা করুন" : "Open Bangla AI Assistant"}</span>
                </Link>
              </div>
            </div>

            {/* Right 6 cols: Realistic Conversational Card Simulation */}
            <div className="lg:col-span-6 p-6 sm:p-8 rounded-[32px] bg-white border border-black/[0.08] shadow-apple space-y-4">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-black/[0.05] pb-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    🌾
                  </div>
                  <div>
                    <h5 className="font-bold text-[#1d1d1f]">Mrittika AI Assistant</h5>
                    <span className="text-[10px] text-emerald-700 flex items-center gap-1 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      BRRI Vector Knowledge Base Active
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-[#86868b] font-mono">v2.0 RAG</span>
              </div>

              {/* Chat Bubble: Farmer Question */}
              <div className="flex justify-end">
                <div className="max-w-[85%] p-3.5 rounded-2xl rounded-tr-xs bg-emerald-700 text-white text-xs sm:text-sm font-bangla leading-relaxed shadow-2xs">
                  {i18n.language === "bn"
                    ? "ধানের পাতায় বাদামি ও চোখ আকৃতির দাগ দেখা যাচ্ছে। এর সঠিক সমাধান ও স্প্রে কী?"
                    : "My rice leaves have spindle-shaped brown spots with grey centers. What is the approved treatment?"}
                </div>
              </div>

              {/* Chat Bubble: AI Verified Answer */}
              <div className="flex justify-start">
                <div className="max-w-[92%] p-4 rounded-2xl rounded-tl-xs bg-[#f5f5f7] border border-black/[0.04] text-xs sm:text-sm text-[#1d1d1f] font-bangla leading-relaxed space-y-2.5">
                  <p className="font-semibold text-emerald-950">
                    {i18n.language === "bn"
                      ? "এটি ধানের ব্লাস্ট রোগ (Rice Blast - Pyricularia oryzae)। তাৎক্ষণিক করণীয়:"
                      : "This symptom indicates Rice Blast (Pyricularia oryzae). Immediate field protocol:"}
                  </p>
                  <ul className="space-y-1 text-xs text-[#55555b] list-disc list-inside">
                    <li>{i18n.language === "bn" ? "ইউরিয়া সারের উপরিপ্রয়োগ সাময়িক বন্ধ রাখুন।" : "Suspend nitrogen top-dressing immediately."}</li>
                    <li>{i18n.language === "bn" ? "জমিতে পানি ধরে রাখুন এবং প্রতি শতকে ট্রাইসাইক্লাজোল জাতীয় ছত্রাকনাশক অনুমোদিত মাত্রায় স্প্রে করুন।" : "Maintain continuous standing water depth of 2-3 inches."}</li>
                  </ul>

                  {/* Citing Pill */}
                  <div className="pt-2 border-t border-black/[0.06] flex items-center gap-1.5 text-[11px] font-mono text-emerald-800 font-bold">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Source: BRRI Modern Rice Production Handbook, Page 42</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>


      {/* =========================================================================
          SECTION 4: HOW IT WORKS (Clean, Numbered Linear Process)
          ========================================================================= */}
      <section className="py-16 sm:py-24 border-b border-black/[0.05] bg-white">
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="max-w-2xl space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 font-mono">
              {i18n.language === "bn" ? "ব্যবহারবিধি" : "Simple 4-Step Process"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#1d1d1f] tracking-tight">
              {i18n.language === "bn" ? "মাটি বিশ্লেষণ থেকে মাঠপর্যায়ে বাস্তবায়ন" : "From Soil Telemetry to Harvest Execution"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            
            {/* Step 1 */}
            <div className="space-y-3 relative">
              <span className="text-5xl font-black text-black/10 font-mono block">01</span>
              <h4 className="text-lg font-bold text-[#1d1d1f] tracking-tight">
                {i18n.language === "bn" ? "মাটি ও এলাকার তথ্য দিন" : "Input Field Telemetry"}
              </h4>
              <p className="text-xs sm:text-sm text-[#55555b] leading-relaxed font-bangla">
                {i18n.language === "bn"
                  ? "আপনার জেলা ও উপজেলা নির্বাচন করুন। মাটির N-P-K মাত্রা ও পিএইচ লিখুন, অথবা আমাদের AEZ আঞ্চলিক গড় গ্রহণ করুন।"
                  : "Select your district and upazila. Enter basic soil test values or utilize our pre-calibrated AEZ defaults."}
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-3 relative">
              <span className="text-5xl font-black text-emerald-800/20 font-mono block">02</span>
              <h4 className="text-lg font-bold text-[#1d1d1f] tracking-tight">
                {i18n.language === "bn" ? "এআই ক্যালিব্রেশন ও বিশ্লেষণ" : "Model Ingestion & Scoring"}
              </h4>
              <p className="text-xs sm:text-sm text-[#55555b] leading-relaxed font-bangla">
                {i18n.language === "bn"
                  ? "মডেল আপনার মাটির রাসায়নিক মাত্রা ও স্থানীয় জলবায়ু উপাত্ত জাতীয় বার্ক নির্দেশিকার সাথে তুলনা করে।"
                  : "Algorithms calibrate nutrient parts-per-million against national BARC agronomic thresholds."}
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-3 relative">
              <span className="text-5xl font-black text-amber-800/20 font-mono block">03</span>
              <h4 className="text-lg font-bold text-[#1d1d1f] tracking-tight">
                {i18n.language === "bn" ? "সঠিক ফসল ও সার শিডিউল" : "Stage-Wise Advisory Generation"}
              </h4>
              <p className="text-xs sm:text-sm text-[#55555b] leading-relaxed font-bangla">
                {i18n.language === "bn"
                  ? "শীর্ষ ৩টি লাভজনক ফসলের তালিকা এবং বিঘা বা শতক এককে ইউরিয়া ও পটাশের কিস্তিভিত্তিক ডোজ পান।"
                  : "Receive rank-ordered crop suitability percentages and exact basal vs top-dress fertilizer dates."}
              </p>
            </div>

            {/* Step 4 */}
            <div className="space-y-3 relative">
              <span className="text-5xl font-black text-teal-800/20 font-mono block">04</span>
              <h4 className="text-lg font-bold text-[#1d1d1f] tracking-tight">
                {i18n.language === "bn" ? "মাঠে বাস্তবায়ন ও পিডিএফ প্রিন্ট" : "Field Execution & PDF Report"}
              </h4>
              <p className="text-xs sm:text-sm text-[#55555b] leading-relaxed font-bangla">
                {i18n.language === "bn"
                  ? "১-ক্লিকে আনুষ্ঠানিক পিডিএফ প্রত্যয়নপত্র ডাউনলোড করুন এবং প্রয়োজনবোধে উপজেলা কর্মকর্তার পরামর্শ নিন।"
                  : "Print official PDF advisory certificates for offline record-keeping or agricultural bank loans."}
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* =========================================================================
          SECTION 5: AGRICULTURAL VISUAL SHOWCASE (Celebrating All 24 Crops)
          ========================================================================= */}
      <section className="py-16 sm:py-24 border-b border-black/[0.05] bg-[#fbfbfd]">
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-black/[0.06] pb-6">
            <div className="space-y-2 max-w-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 font-mono">
                {i18n.language === "bn" ? "জাতীয় কৃষি ফসল নেটওয়ার্ক" : "Nationwide Agricultural Biodiversity"}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#1d1d1f] tracking-tight">
                {i18n.language === "bn" ? "বাংলাদেশের ২৪টি প্রধান আঞ্চলিক ফসলের ক্যাটালগ" : "Visual Catalog of All 24 Canonical Supported Crops"}
              </h2>
              <p className="text-xs sm:text-sm text-[#55555b] font-bangla">
                {i18n.language === "bn"
                  ? "যে কোনো ফসলে ক্লিক করে মাটির উপযোগিতা বিশ্লেষণ ও সুষম সারের সময়সূচী দেখুন।"
                  : "Click any crop to inspect its soil nutrient thresholds, regional AEZ adaptability, and split dosages."}
              </p>
            </div>

            {/* Apple Segmented Filter Pill Group */}
            <div className="p-1 bg-[#f5f5f7] rounded-full border border-black/[0.04] inline-flex flex-wrap gap-1">
              {[
                { id: "all", en: "All (24)", bn: "সবগুলো (২৪)" },
                { id: "cereal", en: "Cereals", bn: "দানাশস্য" },
                { id: "vegetable", en: "Vegetables", bn: "সবজি ও মশলা" },
                { id: "cash", en: "Cash Crops", bn: "অর্থকরী" },
                { id: "fruit", en: "Fruits", bn: "ফলমূল" },
                { id: "pulse_oil", en: "Pulses & Oils", bn: "ডাল ও তেল" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveCropFilter(f.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeCropFilter === f.id
                      ? "bg-white text-[#1d1d1f] shadow-2xs"
                      : "text-[#86868b] hover:text-[#1d1d1f]"
                  }`}
                >
                  {i18n.language === "en" ? f.en : f.bn}
                </button>
              ))}
            </div>
          </div>

          {/* Crops Masonry Gallery Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredCrops.map((crop) => (
              <Link
                key={crop.slug}
                to="/crop"
                className="group rounded-[22px] overflow-hidden border border-black/[0.06] bg-white hover:border-emerald-600/40 hover:shadow-apple transition-all duration-300 flex flex-col cursor-pointer"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                  <img
                    src={crop.url}
                    alt={i18n.language === "en" ? crop.altEn : crop.altBn}
                    className="w-full h-full object-cover group-hover:scale-108 transition-all duration-500 ease-out"
                    loading="lazy"
                  />
                  <span className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-black/60 text-white backdrop-blur-md border border-white/20">
                    {i18n.language === "en" ? crop.categoryEn : crop.categoryBn}
                  </span>
                </div>
                <div className="p-3.5 text-center flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#1d1d1f] group-hover:text-emerald-700 transition-colors line-clamp-1">
                      {i18n.language === "en"
                        ? crop.altEn.split(" ")[0] + " " + (crop.altEn.split(" ")[1] || "")
                        : crop.altBn.split(" ")[0] + " " + (crop.altBn.split(" ")[1] || "")}
                    </h4>
                    <p className="text-[10px] text-[#86868b] font-mono mt-0.5 capitalize">
                      {crop.slug.replace("_", " ")}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 mt-2 inline-flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>{i18n.language === "en" ? "Advisory" : "পরামর্শ"}</span>
                    <span>→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>


      {/* =========================================================================
          SECTION 6: SCIENTIFIC RIGOR & CREDIBILITY (Dark Forest Keynote Spread)
          ========================================================================= */}
      <section className="py-16 sm:py-24 bg-[#0c0c0e] text-white border-b border-white/10 relative overflow-hidden">
        {/* Specular Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
          
          <div className="max-w-2xl space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
              {i18n.language === "bn" ? "নির্ভরযোগ্যতার নিশ্চয়তা" : "Scientific Rigor & Accreditation"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {i18n.language === "bn" ? "কেন মৃত্তিকা এআই-এর পরামর্শ নির্ভরযোগ্য?" : "Engineered for Scientific Accountability, Not Hallucination"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            <div className="space-y-3.5 border-t border-white/10 pt-6">
              <div className="w-10 h-10 rounded-xl bg-white/10 text-emerald-400 flex items-center justify-center border border-white/10">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white tracking-tight">
                {i18n.language === "bn" ? "সরকারি বার্ক নির্দেশিকা মানসম্মত" : "BARC 2018 Guidelines"}
              </h4>
              <p className="text-xs sm:text-sm text-[#a1a1a6] leading-relaxed font-bangla">
                {i18n.language === "bn"
                  ? "বাংলাদেশ কৃষি গবেষণা কাউন্সিল প্রণীত জাতীয় সার নির্দেশিকা অনুসরণ করে সার প্রয়োগের হিসাব গণনা করা হয়।"
                  : "All fertilizer dosage equations strictly reflect the official BARC Fertilizer Recommendation Guide 2018."}
              </p>
            </div>

            <div className="space-y-3.5 border-t border-white/10 pt-6">
              <div className="w-10 h-10 rounded-xl bg-white/10 text-teal-400 flex items-center justify-center border border-white/10">
                <Database className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white tracking-tight">
                {i18n.language === "bn" ? "হ্যালুসিনেশন-মুক্ত ভেক্টর আরএজি" : "Hallucination-Free Vector RAG"}
              </h4>
              <p className="text-xs sm:text-sm text-[#a1a1a6] leading-relaxed font-bangla">
                {i18n.language === "bn"
                  ? "চ্যাটবটের প্রতিটি উত্তর বিআরআরআই ও বার্কের স্বীকৃত প্রকাশনা থেকে পৃষ্ঠা নম্বরসহ তথ্যসূত্র উদ্ধৃত করে।"
                  : "Answers are grounded in ChromaDB vector stores citing page-referenced government agriculture manuals."}
              </p>
            </div>

            <div className="space-y-3.5 border-t border-white/10 pt-6">
              <div className="w-10 h-10 rounded-xl bg-white/10 text-amber-400 flex items-center justify-center border border-white/10">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white tracking-tight">
                {i18n.language === "bn" ? "উপজেলা কর্মকর্তা রেফারেল ও অডিট" : "Officer Verification Loop"}
              </h4>
              <p className="text-xs sm:text-sm text-[#a1a1a6] leading-relaxed font-bangla">
                {i18n.language === "bn"
                  ? "মাঠপর্যায়ের উপ-সহকারী কৃষি কর্মকর্তা (SAAO) প্রশ্নের সত্যতা যাচাই ও বৈজ্ঞানিক সংশোধনী প্রদান করতে পারেন।"
                  : "Extension officers review flagged user feedback and provide verified field-level agronomic notes."}
              </p>
            </div>

            <div className="space-y-3.5 border-t border-white/10 pt-6">
              <div className="w-10 h-10 rounded-xl bg-white/10 text-purple-400 flex items-center justify-center border border-white/10">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white tracking-tight">
                {i18n.language === "bn" ? "অফিসিয়াল পিডিএফ প্রত্যয়নপত্র" : "Certified PDF Advisory Export"}
              </h4>
              <p className="text-xs sm:text-sm text-[#a1a1a6] leading-relaxed font-bangla">
                {i18n.language === "bn"
                  ? "প্রতিটি সার ও ফসল পরামর্শের জন্য ১-ক্লিকে প্রিন্টযোগ্য প্রাতিষ্ঠানিক পিডিএফ প্রত্যয়নপত্র তৈরি হয়।"
                  : "Instant 1-click printable PDF advisory certificates suitable for farmer records and credit documentation."}
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* =========================================================================
          SECTION 7: THREE DEDICATED PORTALS (Role-Based Ecosystem)
          ========================================================================= */}
      <section className="py-16 sm:py-24 border-b border-black/[0.05] bg-white">
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-black/[0.06] pb-6">
            <div className="space-y-2 max-w-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 font-mono">
                {i18n.language === "bn" ? "সমন্বিত রোলভিত্তিক পোর্টাল" : "Role-Based Agritech Ecosystem"}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#1d1d1f] tracking-tight">
                {i18n.language === "bn" ? "কৃষক, কর্মকর্তা ও প্রশাসকের জন্য নির্দিষ্ট ওয়ার্কস্পেস" : "Dedicated Workspaces for Farmers, Extension Officers & Admins"}
              </h2>
            </div>

            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-6 py-3 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs active:scale-95 transition-all shadow-apple cursor-pointer"
            >
              <span>{i18n.language === "bn" ? "পোর্টালে লগইন করুন" : "Access Your Portal"}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Farmer Portal */}
            <div className="p-7 rounded-[28px] bg-[#fbfbfd] border border-black/[0.06] space-y-4 hover:shadow-apple transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl font-bold border border-emerald-200">
                🌾
              </div>
              <h3 className="text-xl font-bold text-[#1d1d1f]">
                {i18n.language === "bn" ? "কৃষক ডিজিটাল পোর্টাল" : "Farmer Digital Portal"}
              </h3>
              <p className="text-xs sm:text-sm text-[#55555b] leading-relaxed font-bangla">
                {i18n.language === "bn"
                  ? "স্থানীয় আবহাওয়ার পূর্বাভাস, নিজস্ব জমির সারের ডোজ, সংরক্ষিত ইতিহাস এবং ১-ক্লিকে পিডিএফ প্রিন্ট।"
                  : "Localized weather forecasts, personalized land nutrient histories, split schedules, and PDF print exports."}
              </p>
              <ul className="text-xs text-[#1d1d1f] space-y-2 pt-2 border-t border-black/[0.05]">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span>{i18n.language === "bn" ? "ব্যক্তিগত খামার ড্যাশবোর্ড ও পরামর্শ লগ" : "Personal Farm Dashboard & Logs"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span>{i18n.language === "bn" ? "অফলাইন ব্যবহারের জন্য পিডিএফ এক্সপোর্ট" : "Offline Record-Keeping PDF Export"}</span>
                </li>
              </ul>
            </div>

            {/* Extension Officer Portal */}
            <div className="p-7 rounded-[28px] bg-[#fbfbfd] border border-black/[0.06] space-y-4 hover:shadow-apple transition-all">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center text-xl font-bold border border-teal-200">
                🛡️
              </div>
              <h3 className="text-xl font-bold text-[#1d1d1f]">
                {i18n.language === "bn" ? "উপজেলা কৃষি কর্মকর্তা পোর্টাল" : "Extension Officer Portal"}
              </h3>
              <p className="text-xs sm:text-sm text-[#55555b] leading-relaxed font-bangla">
                {i18n.language === "bn"
                  ? "কৃষকের আবেদন নিরীক্ষা, এআই উত্তরের বৈজ্ঞানিক মূল্যায়ন ও আঞ্চলিক পুষ্টি ঘাটতি পর্যালোচনা।"
                  : "Audit farmer queries, verify AI agronomic responses, and track regional soil deficiency patterns."}
              </p>
              <ul className="text-xs text-[#1d1d1f] space-y-2 pt-2 border-t border-black/[0.05]">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-700" />
                  <span>{i18n.language === "bn" ? "ফ্ল্যাগকৃত প্রশ্নোত্তর সংশোধন ও অনুমোদন" : "Audit Flagged Farmer Feedbacks"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-700" />
                  <span>{i18n.language === "bn" ? "আঞ্চলিক সার চাহিদা বিশ্লেষণ চার্ট" : "Regional Soil Deficiencies Analytics"}</span>
                </li>
              </ul>
            </div>

            {/* Admin Command Portal */}
            <div className="p-7 rounded-[28px] bg-[#fbfbfd] border border-black/[0.06] space-y-4 hover:shadow-apple transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center text-xl font-bold border border-purple-200">
                👑
              </div>
              <h3 className="text-xl font-bold text-[#1d1d1f]">
                {i18n.language === "bn" ? "সিস্টেম অ্যাডমিন কমান্ড সেন্টার" : "Admin Command Center"}
              </h3>
              <p className="text-xs sm:text-sm text-[#55555b] leading-relaxed font-bangla">
                {i18n.language === "bn"
                  ? "ব্যবহারকারী নিয়ন্ত্রণ, কর্মকর্তা অনুমোদন, গবেষণা নলেজবেস ইনডেক্সিং এবং অডিট লগ ট্র্যাকিং।"
                  : "Centrally manage 275+ users, approve officer credentials, curate vector RAG corpora, and view audit logs."}
              </p>
              <ul className="text-xs text-[#1d1d1f] space-y-2 pt-2 border-t border-black/[0.05]">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-700" />
                  <span>{i18n.language === "bn" ? "ব্যবহারকারী রোল ব্যবস্থাপনা ও অনুমোদন" : "User Roles & Officer Verifications"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-700" />
                  <span>{i18n.language === "bn" ? "ভেক্টর আরএজি ডকুমেন্ট ইনজেশন" : "Knowledge Base Vector Re-indexing"}</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>


      {/* =========================================================================
          SECTION 8: FINAL CALL TO ACTION (Memorable Closing Experience)
          ========================================================================= */}
      <section className="relative overflow-hidden py-20 sm:py-28 bg-[#042412] text-white">
        {/* Scenic Harvest Photographic Overlay */}
        <div className="absolute inset-0 z-0 opacity-25 pointer-events-none">
          <img
            src={SCENIC_IMAGES.homepageHero.url}
            alt="Bangladesh Agriculture"
            className="w-full h-full object-cover object-center filter blur-[1px]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#042412] via-[#042412]/95 to-[#042412]/85" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-emerald-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{i18n.language === "bn" ? "বিনামূল্যে আজই শুরু করুন" : "Start Free Precision Agriculture Today"}</span>
            </span>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              {i18n.language === "bn"
                ? "বিজ্ঞানভিত্তিক স্মার্ট কৃষিতে আপনার খামারের যাত্রা শুরু হোক আজই"
                : "Transform Your Farm's Harvest with Real Soil Science & Artificial Intelligence"}
            </h2>

            <p className="text-sm sm:text-base text-emerald-100/80 max-w-2xl mx-auto leading-relaxed font-bangla">
              {i18n.language === "bn"
                ? "কোনো সাবস্ক্রিপশন ফি বা জটিলতা নেই। আপনার জমির পুষ্টি উপাত্ত দিয়ে এখনই সেরা ফসল ও সুষম সারের সময়সূচী তৈরি করুন।"
                : "No subscription fees or complicated setup. Enter your plot's soil measurements and receive certified agronomic guidance in seconds."}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/crop"
              className="px-8 py-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-[#042412] font-extrabold text-sm sm:text-base transition-all shadow-xl active:scale-[0.98] cursor-pointer"
            >
              {i18n.language === "bn" ? "সেরা ফসল নির্বাচন শুরু করুন" : "Start Free Crop Advisory"}
            </Link>

            <Link
              to="/register"
              className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm sm:text-base border border-white/20 backdrop-blur-md transition-all active:scale-[0.98] cursor-pointer"
            >
              {i18n.language === "bn" ? "বিনামূল্যে অ্যাকাউন্ট খুলুন" : "Create Free Account"}
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
