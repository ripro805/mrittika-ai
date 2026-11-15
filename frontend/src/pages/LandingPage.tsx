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
  Bot,
  ChevronRight,
  Zap,
  Wheat,
  Layers,
} from "lucide-react";
import { SCENIC_IMAGES, CROP_IMAGES, FERTILIZER_IMAGES, AgroImageMeta } from "../utils/agroImages";
import { AgroImage } from "../components/AgroImage";

export const LandingPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [activeCropFilter, setActiveCropFilter] = useState<string>("all");

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

  return (
    <div className="space-y-12 lg:space-y-16 py-2">
      {/* 1. Apple Pro Keynote Hero Section */}
      <section className="relative overflow-hidden rounded-[32px] sm:rounded-[40px] bg-[#0c0c0e] text-white border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] px-6 py-10 sm:px-12 sm:py-16 lg:px-14 lg:py-18">
        {/* Apple Atmospheric Radial Specular Glow */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <img
            src={SCENIC_IMAGES.homepageHero.url}
            alt={SCENIC_IMAGES.homepageHero.altEn}
            className="w-full h-full object-cover object-center filter blur-[1px]"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0c0c0e] via-[#0c0c0e]/95 to-[#0c0c0e]/80" />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headlines & CTA */}
          <div className="lg:col-span-7 space-y-6">
            {/* Apple Status Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-emerald-300 text-xs font-semibold backdrop-blur-xl shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {i18n.language === "bn"
                  ? "বাংলাদেশ কৃষি গবেষণা কাউন্সিল (BARC) সার নির্দেশিকা মানসম্মত"
                  : "BARC Fertilizer Recommendation Standards Compliant"}
              </span>
            </div>

            {/* Apple Display Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight leading-[1.08] text-white">
              {i18n.language === "bn" ? (
                <>
                  মাটির পুষ্টি ও আবহাওয়ায় <br />
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                    বিজ্ঞানভিত্তিক স্মার্ট চাষাবাদ
                  </span>
                </>
              ) : (
                <>
                  Scientific Precision Agriculture <br />
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                    Powered by Soil & Climate AI
                  </span>
                </>
              )}
            </h1>

            {/* Mobile Hero Visual Preview */}
            <div className="lg:hidden relative rounded-[24px] overflow-hidden border border-white/15 shadow-lg my-4">
              <img
                src={SCENIC_IMAGES.precisionFarming.url}
                alt="Bangladeshi modern agritech farming"
                className="w-full h-48 object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex items-end p-4">
                <span className="text-xs font-semibold text-emerald-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  {i18n.language === "en" ? "24 Regional Crops & Live N-P-K Calibration" : "২৪টি আঞ্চলিক ফসল ও লাইভ N-P-K বিশ্লেষণ"}
                </span>
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-[17px] text-[#a1a1a6] font-normal leading-relaxed max-w-xl font-bangla">
              {i18n.language === "bn"
                ? "আপনার জমির N-P-K মাত্রা, পিএইচ ও আবহাওয়া বিশ্লেষণ করে সর্বোচ্চ উপযোগী ফসল, সুষম সারের সময়সূচী এবং সরকারি নির্দেশিকা ভিত্তিক তাৎক্ষণিক বাংলা পরামর্শ।"
                : "Analyze soil nutrients, pH, and local weather to receive top crop recommendations, stage-by-stage fertilizer dosages, and research-grounded Bangla agricultural advice."}
            </p>

            {/* Apple Action Pill Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                to="/crop"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm sm:text-base shadow-lg hover:shadow-emerald-900/40 transition-all active:scale-[0.98] cursor-pointer group"
              >
                <Sprout className="w-5 h-5 text-emerald-100" />
                <span>{i18n.language === "bn" ? "সেরা ফসল নির্বাচন শুরু করুন" : "Start Crop Advisory"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/assistant"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold text-sm sm:text-base border border-white/20 backdrop-blur-xl transition-all active:scale-[0.98] cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>{i18n.language === "bn" ? "কৃষি সহকারীকে জিজ্ঞাসা করুন" : "Ask AI Assistant"}</span>
              </Link>
            </div>

            {/* Apple Keynote Telemetry Highlights */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium">
              <div className="space-y-0.5">
                <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{i18n.language === "en" ? "24 Crops" : "২৪ টি ফসল"}</p>
                <p className="text-[11px] text-[#86868b] font-medium">{i18n.language === "en" ? "Canonical Crops" : "ক্যানোনিকাল শ্রেণিবিভাগ"}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{i18n.language === "en" ? "30 AEZs" : "৩০ টি AEZ"}</p>
                <p className="text-[11px] text-[#86868b] font-medium">{i18n.language === "en" ? "Agro-Ecological Zones" : "আঞ্চলিক জলবায়ু উপাত্ত"}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{i18n.language === "en" ? "98.4%" : "৯৮.৪%"}</p>
                <p className="text-[11px] text-[#86868b] font-medium">{i18n.language === "en" ? "Model Accuracy Score" : "মডেল একুরেসি স্কোর"}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{i18n.language === "en" ? "100%" : "১০০%"}</p>
                <p className="text-[11px] text-[#86868b] font-medium">{i18n.language === "en" ? "Verified Research Docs" : "যাচাইকৃত নথি সূত্র"}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Apple iPad / macOS Glass Simulator */}
          <div className="lg:col-span-5 hidden lg:block space-y-4">
            {/* Visual Photography Window */}
            <div className="relative rounded-[26px] overflow-hidden border border-white/15 shadow-2xl group">
              <img
                src={SCENIC_IMAGES.precisionFarming.url}
                alt={SCENIC_IMAGES.precisionFarming.altEn}
                className="w-full h-56 object-cover object-center group-hover:scale-105 transition-all duration-700"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              
              {/* Floating Top Badge */}
              <div className="absolute top-3.5 left-3.5 flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 text-xs font-semibold text-white shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>{i18n.language === "en" ? "Lush Field Agronomy" : "মাঠপর্যায়ে ফসলের নিবিড় পরিচর্যা"}</span>
              </div>

              {/* Floating Location Overlay */}
              <div className="absolute bottom-3.5 left-3.5 right-3.5 flex items-center justify-between text-xs text-white">
                <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                  <Sprout className="w-3.5 h-3.5 text-emerald-400" />
                  {i18n.language === "en" ? "Bangladesh Agro-Zone Model" : "বাংলাদেশ কৃষি অঞ্চল ও সুষম সার মডেল"}
                </span>
                <span className="text-[10px] text-[#a1a1a6] font-mono">AEZ-12 & AEZ-25</span>
              </div>
            </div>

            {/* Apple macOS Glass Simulator Window */}
            <div className="p-5 rounded-[26px] bg-white/[0.06] backdrop-blur-2xl border border-white/12 text-white shadow-2xl space-y-4">
              {/* Window Header with Traffic Lights */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 mr-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      {i18n.language === "en" ? "Live Agritech Simulator" : "লাইভ কৃষি সিমুলেটর (Live Model Preview)"}
                    </h3>
                    <p className="text-[10px] text-[#a1a1a6] font-medium">
                      {i18n.language === "en" ? "District: Bogra • Loam Soil" : "জেলা: বগুড়া • দোআঁশ মাটি"}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/40 font-bold">
                  {i18n.language === "en" ? "Active" : "সক্রিয়"}
                </span>
              </div>

              {/* Nutrients Gauges with Apple Continuous Rounded Bars */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                  <span className="text-[10px] text-[#a1a1a6] font-medium">{i18n.language === "en" ? "Nitrogen (N)" : "নাইট্রোজেন (N)"}</span>
                  <p className="text-xs font-extrabold text-emerald-400 font-mono">90 kg/ha</p>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full w-[75%] rounded-full" />
                  </div>
                </div>
                <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                  <span className="text-[10px] text-[#a1a1a6] font-medium">{i18n.language === "en" ? "Phosphorus (P)" : "ফসফরাস (P)"}</span>
                  <p className="text-xs font-extrabold text-teal-400 font-mono">45 kg/ha</p>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-teal-400 h-full w-[65%] rounded-full" />
                  </div>
                </div>
                <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                  <span className="text-[10px] text-[#a1a1a6] font-medium">{i18n.language === "en" ? "Potassium (K)" : "পটাশিয়াম (K)"}</span>
                  <p className="text-xs font-extrabold text-amber-400 font-mono">60 kg/ha</p>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full w-[80%] rounded-full" />
                  </div>
                </div>
              </div>

              {/* Recommended Top Result Row with Crop Image */}
              <div className="p-3 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={CROP_IMAGES["rice_aman"].url}
                    alt="Aman Rice"
                    className="w-11 h-11 rounded-xl object-cover border border-emerald-500/40"
                    loading="lazy"
                  />
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 uppercase tracking-wider">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      {i18n.language === "en" ? "Top Crop (96.4% Match)" : "শীর্ষ ফসল (৯৬.৪% সামঞ্জস্য)"}
                    </span>
                    <h4 className="text-sm font-extrabold text-white">
                      {i18n.language === "en" ? "Aman Rice (আমন ধান)" : "আমন ধান (Aman Rice)"}
                    </h4>
                  </div>
                </div>
                <Link
                  to="/crop"
                  className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs whitespace-nowrap cursor-pointer active:scale-95"
                >
                  {i18n.language === "en" ? "Verify →" : "যাচাই →"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* 2. Apple Bento Grid: Three Connected Core Modules */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200/60 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{i18n.language === "en" ? "Integrated Agritech Platform" : "সমন্বিত কৃষি প্রযুক্তি প্ল্যাটফর্ম"}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-[#1d1d1f] tracking-tight">
            {i18n.language === "en" ? "Three Intelligent Agricultural Modules" : "তিনটি ধাপে সম্পূর্ণ ডিজিটাল কৃষি সমাধান"}
          </h2>
          <p className="text-sm sm:text-base text-[#86868b] leading-relaxed font-bangla font-normal">
            {i18n.language === "en"
              ? "Soil data and field telemetry automatically flow into the next steps — no repetitive inputs required."
              : "এক মডিউলের মাটির তথ্য সরাসরি পরবর্তী ধাপে স্থানান্তরিত হয়—একই তথ্য বারবার লেখার কোনো ঝামেলা নেই।"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Card 1: Crop Selection Bento */}
          <div className="app-card app-card-interactive overflow-hidden rounded-[28px] flex flex-col justify-between group border border-black/[0.06] shadow-apple hover:shadow-apple-hover bg-white">
            <div>
              <div className="relative h-60 sm:h-64 lg:h-64 overflow-hidden rounded-[22px] m-3 bg-[#f5f5f7]">
                <img
                  src={CROP_IMAGES["rice_boro"].url}
                  alt={CROP_IMAGES["rice_boro"].altEn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <span className="absolute top-3.5 left-3.5 text-xs font-semibold text-[#1d1d1f] bg-white/95 backdrop-blur-md px-3.5 py-1 rounded-full border border-black/[0.06] shadow-2xs">
                  {i18n.language === "en" ? "Module 1" : "মডিউল ১"}
                </span>
                <span className="absolute bottom-3.5 left-4 text-xs font-bold text-white tracking-wide">
                  {i18n.language === "en" ? "24 Regional Crops Supported" : "২৪টি আঞ্চলিক ফসল সমর্থিত"}
                </span>
              </div>
              <div className="p-6 sm:p-7 space-y-4">
                <h3 className="text-xl sm:text-2xl font-bold text-[#1d1d1f] group-hover:text-emerald-700 transition-colors tracking-tight">
                  {i18n.language === "en" ? "Crop Suitability Advisory" : "মাটি ও আবহাওয়ায় সেরা ফসল"}
                </h3>
                <p className="text-sm text-[#86868b] leading-relaxed font-bangla">
                  {i18n.language === "en"
                    ? "AI analyzes soil N, P, K levels, pH, and district climate data to recommend the top 3 highest-yielding crops."
                    : "জমির N, P, K মাত্রা, মাটির পিএইচ এবং জেলার আবহাওয়ার তথ্যে এআই মডেল বিশ্লেষণ করে সেরা ৩টি লাভজনক ফসলের তালিকা তৈরি করে।"}
                </p>
                <ul className="space-y-2 pt-1 text-xs sm:text-sm text-[#1d1d1f]/85 font-bangla font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{i18n.language === "en" ? "Top-3 suitability match confidence" : "শীর্ষ ৩ ফসলের পুষ্টি সামঞ্জস্য স্কোর"}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{i18n.language === "en" ? "Seamless 1-click flow to fertilizer plan" : "সার গণনায় মাটির তথ্য স্বয়ংক্রিয় স্থানান্তর"}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-6 sm:p-7 pt-0">
              <Link
                to="/crop"
                className="w-full py-3.5 px-6 rounded-full bg-[#f5f5f7] hover:bg-emerald-600 hover:text-white text-[#1d1d1f] border border-black/[0.04] text-xs font-bold inline-flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-2xs cursor-pointer group/btn"
              >
                <span>{i18n.language === "en" ? "Find Best Crops" : "ফসল নির্বাচন শুরু করুন"}</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 2: Fertilizer Dosage Bento */}
          <div className="app-card app-card-interactive overflow-hidden rounded-[28px] flex flex-col justify-between group border border-black/[0.06] shadow-apple hover:shadow-apple-hover bg-white">
            <div>
              <div className="relative h-60 sm:h-64 lg:h-64 overflow-hidden rounded-[22px] m-3 bg-[#f5f5f7]">
                <img
                  src={FERTILIZER_IMAGES["application"].url}
                  alt={FERTILIZER_IMAGES["application"].altEn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <span className="absolute top-3.5 left-3.5 text-xs font-semibold text-[#1d1d1f] bg-white/95 backdrop-blur-md px-3.5 py-1 rounded-full border border-black/[0.06] shadow-2xs">
                  {i18n.language === "en" ? "Module 2" : "মডিউল ২"}
                </span>
                <span className="absolute bottom-3.5 left-4 text-xs font-bold text-white tracking-wide">
                  {i18n.language === "en" ? "BARC Guideline Balanced Splitting" : "বার্ক নির্দেশিকা অনুযায়ী সার কিস্তি"}
                </span>
              </div>
              <div className="p-6 sm:p-7 space-y-4">
                <h3 className="text-xl sm:text-2xl font-bold text-[#1d1d1f] group-hover:text-amber-700 transition-colors tracking-tight">
                  {i18n.language === "en" ? "Balanced Fertilizer Dosage" : "সুষম সারের সঠিক মাত্রা"}
                </h3>
                <p className="text-sm text-[#86868b] leading-relaxed font-bangla">
                  {i18n.language === "en"
                    ? "Stage-by-stage split schedule for Urea, TSP, MoP, and Gypsum based on target crop and land measurement in Bigha or Decimal."
                    : "নির্বাচিত ফসলের পুষ্টি চাহিদা অনুসারে বিঘা ও শতক এককে ইউরিয়া, টিএসপি, পটাশ ও জিপসাম সারের কিস্তিভিত্তিক সঠিক ডোজ ও সময়সূচী।"}
                </p>
                <ul className="space-y-2 pt-1 text-xs sm:text-sm text-[#1d1d1f]/85 font-bangla font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>{i18n.language === "en" ? "Stage-by-stage split schedules (Basal/Splits)" : "প্রাথমিক ও কিস্তিভিত্তিক সার প্রয়োগের দিনক্ষণ"}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>{i18n.language === "en" ? "Decimal, Bigha, Acre and Hectare support" : "শতাংশ, বিঘা ও একরে তাৎক্ষণিক রূপান্তর"}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-6 sm:p-7 pt-0">
              <Link
                to="/fertilizer"
                className="w-full py-3.5 px-6 rounded-full bg-[#f5f5f7] hover:bg-amber-600 hover:text-white text-[#1d1d1f] border border-black/[0.04] text-xs font-bold inline-flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-2xs cursor-pointer group/btn"
              >
                <span>{i18n.language === "en" ? "Calculate Fertilizer" : "সারের মাত্রা হিসাব করুন"}</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 3: AI Assistant Bento */}
          <div className="app-card app-card-interactive overflow-hidden rounded-[28px] flex flex-col justify-between group border border-black/[0.06] shadow-apple hover:shadow-apple-hover bg-white">
            <div>
              <div className="relative h-60 sm:h-64 lg:h-64 overflow-hidden rounded-[22px] m-3 bg-[#f5f5f7]">
                <img
                  src={SCENIC_IMAGES.soilTesting.url}
                  alt={SCENIC_IMAGES.soilTesting.altEn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <span className="absolute top-3.5 left-3.5 text-xs font-semibold text-[#1d1d1f] bg-white/95 backdrop-blur-md px-3.5 py-1 rounded-full border border-black/[0.06] shadow-2xs">
                  {i18n.language === "en" ? "Module 3" : "মডিউল ৩"}
                </span>
                <span className="absolute bottom-3.5 left-4 text-xs font-bold text-white tracking-wide">
                  {i18n.language === "en" ? "Page-Citing Research RAG" : "পৃষ্ঠা নম্বরযুক্ত সরকারি আরএজি"}
                </span>
              </div>
              <div className="p-6 sm:p-7 space-y-4">
                <h3 className="text-xl sm:text-2xl font-bold text-[#1d1d1f] group-hover:text-teal-700 transition-colors tracking-tight">
                  {i18n.language === "en" ? "Bangla AI Agricultural Assistant" : "বাংলা এআই কৃষি সহকারী"}
                </h3>
                <p className="text-sm text-[#86868b] leading-relaxed font-bangla">
                  {i18n.language === "en"
                    ? "Real-time answers on crop diseases, pest remedies, and agro guidelines grounded in BARC & BRRI official research manuals."
                    : "পোকা দমন, রোগ প্রতিরোধ ও রাসায়নিক সুরক্ষায় বাংলায় প্রশ্ন করুন। সাথে পাবেন সরকারি গবেষণা হ্যান্ডবুকের পৃষ্ঠা নম্বরযুক্ত যাচাইকৃত তথ্যসূত্র।"}
                </p>
                <ul className="space-y-2 pt-1 text-xs sm:text-sm text-[#1d1d1f]/85 font-bangla font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span>{i18n.language === "en" ? "Official BARC/BRRI guide citation pages" : "অফিসিয়াল সরকারি গবেষণার পৃষ্ঠা নম্বর রেফারেন্স"}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span>{i18n.language === "en" ? "Bangla voice input with instant translation" : "বাংলা ভয়েস ইনপুট ও সহজ সমাধান"}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-6 sm:p-7 pt-0">
              <Link
                to="/assistant"
                className="w-full py-3.5 px-6 rounded-full bg-[#f5f5f7] hover:bg-teal-700 hover:text-white text-[#1d1d1f] border border-black/[0.04] text-xs font-bold inline-flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-2xs cursor-pointer group/btn"
              >
                <span>{i18n.language === "en" ? "Ask Assistant" : "সহকারীকে জিজ্ঞাসা করুন"}</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2.5 ALL 24 SUPPORTED CROPS INTERACTIVE VISUAL EXPLORER (Apple Bento Tile Grid) */}
      <section className="space-y-6 bg-white p-7 sm:p-10 rounded-[32px] border border-black/[0.06] shadow-apple">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-black/[0.05] pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200/60 shadow-2xs">
              <Wheat className="w-3.5 h-3.5 text-emerald-700" />
              <span>{i18n.language === "en" ? "Nationwide Crop Coverage" : "জাতীয় কৃষি ফসল নেটওয়ার্ক"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1d1d1f] tracking-tight">
              {i18n.language === "en" ? "Explore All 24 Supported Regional Crops" : "সমর্থিত ২৪টি আঞ্চলিক ফসলের ভিজ্যুয়াল ক্যাটালগ"}
            </h2>
            <p className="text-xs sm:text-sm text-[#86868b] max-w-xl font-bangla font-normal">
              {i18n.language === "en"
                ? "Click any crop to inspect agronomic requirements and generate custom fertilizer dosage recommendations."
                : "যে কোনো ফসলে ক্লিক করে মাটির পুষ্টি উপযোগিতা যাচাই ও সুষম সারের ডোজ হিসাব করুন।"}
            </p>
          </div>

          {/* Apple Segmented Filter Pill Group */}
          <div className="p-1 bg-[#f5f5f7] rounded-full border border-black/[0.04] inline-flex flex-wrap gap-1">
            {[
              { id: "all", en: "All (24)", bn: "সবগুলো (২৪)" },
              { id: "cereal", en: "Cereals", bn: "দানাশস্য" },
              { id: "vegetable", en: "Vegetables & Spices", bn: "সবজি ও মশলা" },
              { id: "cash", en: "Cash Crops", bn: "অর্থকরী" },
              { id: "fruit", en: "Fruits", bn: "ফলমূল" },
              { id: "pulse_oil", en: "Pulses & Oils", bn: "ডাল ও তেল" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveCropFilter(f.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                  activeCropFilter === f.id
                    ? "bg-white text-[#1d1d1f] shadow-xs font-bold"
                    : "text-[#86868b] hover:text-[#1d1d1f]"
                }`}
              >
                {i18n.language === "en" ? f.en : f.bn}
              </button>
            ))}
          </div>
        </div>

        {/* Crops Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {filteredCrops.map((crop) => (
            <Link
              key={crop.slug}
              to="/crop"
              className="group app-card-interactive rounded-[22px] overflow-hidden border border-black/[0.05] bg-[#fbfbfd] hover:border-emerald-500/50 hover:shadow-apple transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1"
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
                    {i18n.language === "en" ? crop.altEn.split(" ")[0] + " " + (crop.altEn.split(" ")[1] || "") : crop.altBn.split(" ")[0] + " " + (crop.altBn.split(" ")[1] || "")}
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
      </section>

      {/* 3. Three Dedicated Portals Showcase (Apple Pro Space-Black Bento) */}
      <section className="bg-[#161617] rounded-[36px] p-8 sm:p-14 text-white border border-white/10 shadow-2xl space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold border border-white/10 backdrop-blur-md">
              <Users className="w-3.5 h-3.5" />
              <span>{i18n.language === "en" ? "Role-Based Unified Portals" : "ভূমিকাভিত্তিক ৩টি সমন্বিত পোর্টাল"}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              {i18n.language === "en"
                ? "Dedicated Portals for Farmers, Officers & Admins"
                : "কৃষক, কর্মকর্তা ও প্রশাসকের জন্য নির্দিষ্ট ওয়ার্কস্পেস"}
            </h2>
            <p className="text-xs sm:text-sm text-[#a1a1a6] font-normal font-bangla">
              {i18n.language === "en"
                ? "Specialized interfaces tailored to each role's specific workflows, authority, and data needs."
                : "প্রত্যেক ব্যবহারকারীর দায়িত্ব ও প্রয়োজন অনুসারে তৈরি করা হয়েছে ডেডিকেটেড ইন্টারফেস।"}
            </p>
          </div>

          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <span>{i18n.language === "en" ? "Enter Portal" : "পোর্টালে প্রবেশ করুন"}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Farmer Portal Card */}
          <div className="bg-[#1d1d1f] border border-white/10 rounded-[26px] overflow-hidden hover:border-emerald-500/50 transition-all duration-300 shadow-xl flex flex-col justify-between group hover:-translate-y-1">
            <div className="relative h-48 sm:h-52 overflow-hidden">
              <img
                src={SCENIC_IMAGES.farmerHarvest.url}
                alt={SCENIC_IMAGES.farmerHarvest.altEn}
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1d1d1f] via-[#1d1d1f]/40 to-transparent" />
              <div className="absolute bottom-3 left-4 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 flex items-center justify-center font-bold text-base backdrop-blur-md">
                  🌾
                </div>
                <h3 className="text-lg font-bold text-white font-bangla">
                  {i18n.language === "en" ? "Farmer Digital Portal" : "কৃষক ডিজিটাল পোর্টাল"}
                </h3>
              </div>
            </div>
            <div className="p-6 space-y-3.5">
              <p className="text-xs sm:text-sm text-[#a1a1a6] leading-relaxed font-bangla font-normal">
                {i18n.language === "en"
                  ? "Localized weather, field-level fertilizer plans, advisory history, and 1-click PDF download."
                  : "স্থানীয় আবহাওয়া, জমির পরিমাপ অনুযায়ী সারের ডোজ, সংরক্ষিত সুপারিশের ইতিহাস এবং ১-ক্লিকে পিডিএফ প্রিন্ট।"}
              </p>
              <ul className="text-xs sm:text-sm text-[#a1a1a6] space-y-2 pt-1 font-bangla font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{i18n.language === "en" ? "Personal Farm Dashboard & Advisory Logs" : "ব্যক্তিগত খামার ড্যাশবোর্ড ও পরামর্শ লগ"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{i18n.language === "en" ? "PDF Advisory Export for Offline Record-Keeping" : "অফলাইন সংরক্ষণের জন্য পিডিএফ রিপোর্ট"}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Extension Officer Portal Card */}
          <div className="bg-[#1d1d1f] border border-white/10 rounded-[26px] overflow-hidden hover:border-teal-500/50 transition-all duration-300 shadow-xl flex flex-col justify-between group hover:-translate-y-1">
            <div className="relative h-48 sm:h-52 overflow-hidden">
              <img
                src={SCENIC_IMAGES.pestInspection.url}
                alt={SCENIC_IMAGES.pestInspection.altEn}
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1d1d1f] via-[#1d1d1f]/40 to-transparent" />
              <div className="absolute bottom-3 left-4 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-teal-900/80 text-teal-300 border border-teal-700/60 flex items-center justify-center font-bold text-base backdrop-blur-md">
                  🛡️
                </div>
                <h3 className="text-lg font-bold text-white font-bangla">
                  {i18n.language === "en" ? "Extension Officer Portal" : "উপজেলা কর্মকর্তা পোর্টাল"}
                </h3>
              </div>
            </div>
            <div className="p-6 space-y-3.5">
              <p className="text-xs sm:text-sm text-[#a1a1a6] leading-relaxed font-bangla font-normal">
                {i18n.language === "en"
                  ? "Audit AI responses, add field-level scientific notes, and track regional agronomic patterns."
                  : "এআই মডেলের ভুল বা অস্পষ্ট উত্তর নিরীক্ষা কেন্দ্র, মাঠপর্যায়ের বৈজ্ঞানিক নোট সংযোজন ও আঞ্চলিক প্রবণতা বিশ্লেষণ।"}
              </p>
              <ul className="text-xs sm:text-sm text-[#a1a1a6] space-y-2 pt-1 font-bangla font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  <span>{i18n.language === "en" ? "Audit and Resolve Flagged Advisory Feedback" : "ফ্ল্যাগকৃত প্রশ্নোত্তর সংশোধন ও অনুমোদন"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  <span>{i18n.language === "en" ? "Regional Nutrient Deficiencies & Crop Analytics" : "আঞ্চলিক পুষ্টি ঘাটতি ও ফসল পরিসংখ্যান"}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Admin Command Center Card */}
          <div className="bg-[#1d1d1f] border border-white/10 rounded-[26px] overflow-hidden hover:border-purple-500/50 transition-all duration-300 shadow-xl flex flex-col justify-between group hover:-translate-y-1">
            <div className="relative h-48 sm:h-52 overflow-hidden">
              <img
                src={SCENIC_IMAGES.researchLab.url}
                alt={SCENIC_IMAGES.researchLab.altEn}
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1d1d1f] via-[#1d1d1f]/40 to-transparent" />
              <div className="absolute bottom-3 left-4 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-purple-900/80 text-purple-300 border border-purple-700/60 flex items-center justify-center font-bold text-base backdrop-blur-md">
                  ⚡
                </div>
                <h3 className="text-lg font-bold text-white font-bangla">
                  {i18n.language === "en" ? "Admin Executive Portal" : "সিস্টেম অ্যাডমিন কমান্ড পোর্টাল"}
                </h3>
              </div>
            </div>
            <div className="p-6 space-y-3.5">
              <p className="text-xs sm:text-sm text-[#a1a1a6] leading-relaxed font-bangla font-normal">
                {i18n.language === "en"
                  ? "Manage 275+ users, approve agricultural officer credentials, and manage research knowledge bases."
                  : "ব্যবহারকারী নিয়ন্ত্রণ, কর্মকর্তা যাচাইকরণ, আরএজি নথি ম্যানেজমেন্ট ও ক্যাশ পারফরম্যান্স পর্যবেক্ষণ।"}
              </p>
              <ul className="text-xs sm:text-sm text-[#a1a1a6] space-y-2 pt-1 font-bangla font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>{i18n.language === "en" ? "User Roles, Permissions & Officer Approvals" : "ব্যবহারকারী রোল ব্যবস্থাপনা ও কর্মকর্তা অনুমোদন"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>{i18n.language === "en" ? "Knowledge Vector Ingestion & System Auditing" : "কৃষি গবেষণা নথিপত্র ভেক্টরাইজেশন ও সিস্টেম লগ"}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Scientific Rigor & Credibility (Apple Pristine Card) */}
      <section className="bg-white rounded-[32px] border border-black/[0.06] p-8 sm:p-12 shadow-apple space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1d1d1f] tracking-tight">
            {i18n.language === "en" ? "Scientific Rigor & National Accreditation" : "নির্ভরযোগ্যতার নিশ্চয়তা ও জাতীয় মানদণ্ড"}
          </h2>
          <p className="text-xs sm:text-sm text-[#86868b] font-bangla font-normal">
            {i18n.language === "en"
              ? "We eliminate speculative recommendations by strictly adhering to scientific research and government agro publications."
              : "আমরা অনুমাননির্ভর পরামর্শ পরিহার করে বৈজ্ঞানিক তথ্য ও সরকারি গবেষণার আলোকেই উত্তর প্রদান করি।"}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-7 rounded-[24px] bg-[#fbfbfd] border border-black/[0.05] space-y-3.5 text-center sm:text-left hover:shadow-apple transition-all duration-300">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center mx-auto sm:mx-0 font-bold border border-emerald-200/50 shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-[#1d1d1f] text-sm tracking-tight">
              {i18n.language === "en" ? "Hallucination-Free RAG" : "হ্যালুসিনেশন-মুক্ত আরএজি (RAG)"}
            </h4>
            <p className="text-xs text-[#86868b] leading-relaxed font-bangla font-normal">
              {i18n.language === "en"
                ? "The AI assistant never fabricates advice; it strictly cites verified pages from official BARC & BRRI research manuals."
                : "চ্যাটবট স্বতঃপ্রণোদিত কোনো উত্তর বানায় না; সংরক্ষিত গবেষণা নথির নির্ভরযোগ্যতার ভিত্তিতে কেবল তথ্যসূত্রসহ উত্তর দেয়।"}
            </p>
          </div>

          <div className="p-7 rounded-[24px] bg-[#fbfbfd] border border-black/[0.05] space-y-3.5 text-center sm:text-left hover:shadow-apple transition-all duration-300">
            <div className="w-11 h-11 rounded-2xl bg-teal-100/80 text-teal-800 flex items-center justify-center mx-auto sm:mx-0 font-bold border border-teal-200/50 shadow-2xs">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-[#1d1d1f] text-sm tracking-tight">
              {i18n.language === "en" ? "Officer Escalation Protocol" : "উপজেলা কৃষি কর্মকর্তা রেফারেল"}
            </h4>
            <p className="text-xs text-[#86868b] leading-relaxed font-bangla font-normal">
              {i18n.language === "en"
                ? "High-risk pesticide queries advise direct consultation with licensed Upazila Agricultural Extension Officers."
                : "উচ্চ-ঝুঁকি বা বিষাক্ত কীটনাশকের ক্ষেত্রে সরাসরি সরকারি লাইসেন্সধারী কর্মকর্তা বা উপজেলা কৃষি অফিসের সাথে যোগাযোগের পরামর্শ দেওয়া হয়।"}
            </p>
          </div>

          <div className="p-7 rounded-[24px] bg-[#fbfbfd] border border-black/[0.05] space-y-3.5 text-center sm:text-left hover:shadow-apple transition-all duration-300">
            <div className="w-11 h-11 rounded-2xl bg-amber-100/80 text-amber-800 flex items-center justify-center mx-auto sm:mx-0 font-bold border border-amber-200/50 shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-[#1d1d1f] text-sm tracking-tight">
              {i18n.language === "en" ? "Local Units & Official PDF Export" : "স্থানীয় একক ও ফর্ম্যাট সাপোর্ট"}
            </h4>
            <p className="text-xs text-[#86868b] leading-relaxed font-bangla font-normal">
              {i18n.language === "en"
                ? "Precise conversion across Bigha (33 Shotok), Decimal, and Hectare, with 1-click printable PDF advisory certificates."
                : "বিঘা (৩৩ শতক), শতাংশ ও হেক্টর এককে নিখুঁত রূপান্তর এবং কৃষকের সংরক্ষণযোগ্য আনুষ্ঠানিক পিডিএফ প্রত্যয়নপত্র তৈরি।"}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
