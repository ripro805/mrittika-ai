import React from "react";
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
} from "lucide-react";

export const LandingPage: React.FC = () => {
  const { t, i18n } = useTranslation();

  return (
    <div className="space-y-16 lg:space-y-24 py-2 sm:py-4">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl px-6 py-12 sm:px-10 sm:py-16 lg:px-12">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headlines & CTA */}
          <div className="lg:col-span-7 space-y-6">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {i18n.language === "bn"
                  ? "বাংলাদেশ কৃষি গবেষণা কাউন্সিল (BARC) সার নির্দেশিকা মানসম্মত"
                  : "BARC Fertilizer Recommendation Standards Compliant"}
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-5.5xl font-extrabold tracking-tight leading-[1.2] text-white">
              {i18n.language === "bn" ? (
                <>
                  মাটির পুষ্টি ও আবহাওয়ায় <br />
                  <span className="text-emerald-400">
                    বিজ্ঞানভিত্তিক স্মার্ট চাষাবাদ
                  </span>
                </>
              ) : (
                <>
                  Scientific Precision Agriculture <br />
                  <span className="text-emerald-400">
                    Powered by Soil & Climate AI
                  </span>
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed max-w-xl font-bangla">
              {i18n.language === "bn"
                ? "আপনার জমির N-P-K মাত্রা, পিএইচ ও আবহাওয়া বিশ্লেষণ করে সর্বোচ্চ উপযোগী ফসল, সুষম সারের সময়সূচী এবং সরকারি নির্দেশিকা ভিত্তিক তাৎক্ষণিক বাংলা পরামর্শ।"
                : "Analyze soil nutrients, pH, and local weather to receive top crop recommendations, stage-by-stage fertilizer dosages, and research-grounded Bangla agricultural advice."}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/crop"
                className="app-btn-primary px-6 py-3.5 text-sm sm:text-base group cursor-pointer"
              >
                <Sprout className="w-5 h-5 text-white" />
                <span>{i18n.language === "bn" ? "সেরা ফসল নির্বাচন শুরু করুন" : "Start Crop Advisory"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/assistant"
                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-5 py-3.5 rounded-xl border border-slate-700 transition-colors text-sm sm:text-base shadow-2xs"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>{i18n.language === "bn" ? "কৃষি সহকারীকে জিজ্ঞাসা করুন" : "Ask AI Assistant"}</span>
              </Link>
            </div>

            {/* Telemetry Highlights */}
            <div className="pt-6 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium">
              <div className="space-y-0.5">
                <p className="text-xl font-extrabold text-white">{i18n.language === "en" ? "24 Crops" : "২৪ টি ফসল"}</p>
                <p className="text-[11px] text-slate-300 font-medium">{i18n.language === "en" ? "Canonical Crops" : "ক্যানোনিকাল শ্রেণিবিভাগ"}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xl font-extrabold text-white">{i18n.language === "en" ? "30 AEZs" : "৩০ টি AEZ"}</p>
                <p className="text-[11px] text-slate-300 font-medium">{i18n.language === "en" ? "Agro-Ecological Zones" : "আঞ্চলিক জলবায়ু উপাত্ত"}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xl font-extrabold text-white">{i18n.language === "en" ? "98.4%" : "৯৮.৪%"}</p>
                <p className="text-[11px] text-slate-300 font-medium">{i18n.language === "en" ? "Model Accuracy Score" : "মডেল একুরেসি স্কোর"}</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xl font-extrabold text-white">{i18n.language === "en" ? "100%" : "১০০%"}</p>
                <p className="text-[11px] text-slate-300 font-medium">{i18n.language === "en" ? "Verified Research Docs" : "যাচাইকৃত নথি সূত্র"}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Live Agricultural Telemetry Card */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 text-white shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    🌱
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      {i18n.language === "en" ? "Live Agritech Simulator" : "লাইভ কৃষি সিমুলেটর (Live Model Preview)"}
                    </h3>
                    <p className="text-[10px] text-slate-300">
                      {i18n.language === "en" ? "District: Bogra • Loam Soil" : "জেলা: বগুড়া • দোআঁশ মাটি"}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-mono border border-emerald-500/40 font-bold">
                  {i18n.language === "en" ? "Active" : "সক্রিয়"}
                </span>
              </div>

              {/* Nutrients Gauges */}
              <div className="space-y-2.5">
                <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  {i18n.language === "en" ? "Soil Nutrient Telemetry (N-P-K):" : "মাটির পুষ্টি উপাদান মাত্রা (N-P-K):"}
                </p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-300 font-medium">{i18n.language === "en" ? "Nitrogen (N)" : "নাইট্রোজেন (N)"}</span>
                    <p className="text-sm font-extrabold text-emerald-400 font-mono">90 kg/ha</p>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full w-[75%]" />
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-300 font-medium">{i18n.language === "en" ? "Phosphorus (P)" : "ফসফরাস (P)"}</span>
                    <p className="text-sm font-extrabold text-teal-400 font-mono">45 kg/ha</p>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-teal-400 h-full w-[65%]" />
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-300 font-medium">{i18n.language === "en" ? "Potassium (K)" : "পটাশিয়াম (K)"}</span>
                    <p className="text-sm font-extrabold text-amber-400 font-mono">60 kg/ha</p>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full w-[80%]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommended Top Result Card */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    {i18n.language === "en" ? "Top Recommended Crop" : "শীর্ষ প্রস্তাবিত ফসল"}
                  </span>
                  <span className="text-xs font-extrabold text-emerald-400 font-mono">
                    {i18n.language === "en" ? "96.4% Match" : "৯৬.৪% সামঞ্জস্য"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-extrabold text-white">
                      {i18n.language === "en" ? "Aman Rice (আমন ধান)" : "আমন ধান (Aman Rice)"}
                    </h4>
                    <p className="text-[11px] text-slate-200">
                      {i18n.language === "en" ? "Loam Soil • pH 6.5 • 250mm Rainfall" : "দোআঁশ মাটি • পিএইচ ৬.৫ • ২৫০মিমি বৃষ্টিপাত"}
                    </p>
                  </div>
                  <Link
                    to="/crop"
                    className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-2xs"
                  >
                    {i18n.language === "en" ? "Verify Crop →" : "যাচাই করুন →"}
                  </Link>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1">
                <span className="flex items-center gap-1">
                  <CloudSun className="w-3.5 h-3.5 text-amber-400" />
                  {i18n.language === "en" ? "Weather: 25.7°C • Humidity 72%" : "আবহাওয়া: ২৫.৭°C • আর্দ্রতা ৭২%"}
                </span>
                <span className="text-emerald-400 font-medium">
                  {i18n.language === "en" ? "Live Sync Complete ✓" : "লাইভ সিঙ্ক সম্পন্ন"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Core Connected Modules (Interactive Workflow) */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{i18n.language === "en" ? "Integrated Agritech Platform" : "সমন্বিত কৃষি প্রযুক্তি প্ল্যাটফর্ম"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {i18n.language === "en" ? "Three Intelligent Agricultural Modules" : "তিনটি ধাপে সম্পূর্ণ ডিজিটাল কৃষি সমাধান"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-bangla">
            {i18n.language === "en"
              ? "Soil data and field telemetry automatically flow into the next steps — no repetitive inputs required."
              : "এক মডিউলের মাটির তথ্য সরাসরি পরবর্তী ধাপে স্থানান্তরিত হয়—একই তথ্য বারবার লেখার কোনো ঝামেলা নেই।"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Crop Selection */}
          <div className="app-card app-card-interactive p-6 sm:p-7 flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg border border-emerald-200 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                <Sprout className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider">
                  {i18n.language === "en" ? "Module 1" : "মডিউল ১"}
                </span>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                  {i18n.language === "en" ? "Crop Suitability Advisory" : "মাটি ও আবহাওয়ায় সেরা ফসল"}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-bangla">
                {i18n.language === "en"
                  ? "AI analyzes soil N, P, K levels, pH, and district climate data to recommend the top 3 highest-yielding crops."
                  : "জমির N, P, K মাত্রা, মাটির পিএইচ এবং জেলার আবহাওয়ার তথ্যে এআই মডেল বিশ্লেষণ করে সেরা ৩টি লাভজনক ফসলের তালিকা তৈরি করে।"}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Link
                to="/crop"
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1.5 group-hover:translate-x-1 transition-transform"
              >
                <span>{i18n.language === "en" ? "Find Best Crops" : "ফসল নির্বাচন করুন"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Fertilizer Dosage */}
          <div className="app-card app-card-interactive p-6 sm:p-7 flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg border border-amber-200 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <FlaskConical className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 uppercase tracking-wider">
                  {i18n.language === "en" ? "Module 2" : "মডিউল ২"}
                </span>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                  {i18n.language === "en" ? "Balanced Fertilizer Dosage" : "সুষম সারের সঠিক মাত্রা"}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-bangla">
                {i18n.language === "en"
                  ? "Stage-by-stage split schedule for Urea, TSP, MoP, and Gypsum based on target crop and land measurement in Bigha or Decimal."
                  : "নির্বাচিত ফসলের পুষ্টি চাহিদা অনুসারে বিঘা ও শতক এককে ইউরিয়া, টিএসপি, পটাশ ও জিপসাম সারের কিস্তিভিত্তিক সঠিক ডোজ ও সময়সূচী।"}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Link
                to="/fertilizer"
                className="text-xs font-bold text-amber-800 hover:text-amber-950 inline-flex items-center gap-1.5 group-hover:translate-x-1 transition-transform"
              >
                <span>{i18n.language === "en" ? "Calculate Fertilizer" : "সারের মাত্রা গণনা করুন"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3: AI Assistant */}
          <div className="app-card app-card-interactive p-6 sm:p-7 flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-lg border border-teal-200 group-hover:bg-teal-700 group-hover:text-white transition-colors">
                <Bot className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 uppercase tracking-wider">
                  {i18n.language === "en" ? "Module 3" : "মডিউল ৩"}
                </span>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                  {i18n.language === "en" ? "Bangla AI Agricultural Assistant" : "বাংলা এআই কৃষি সহকারী"}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-bangla">
                {i18n.language === "en"
                  ? "Real-time answers on crop diseases, pest remedies, and agro guidelines grounded in BARC & BRRI official research manuals."
                  : "পোকা দমন, রোগ প্রতিরোধ ও রাসায়নিক সুরক্ষায় বাংলায় প্রশ্ন করুন। সাথে পাবেন সরকারি গবেষণা হ্যান্ডবুকের পৃষ্ঠা নম্বরযুক্ত যাচাইকৃত তথ্যসূত্র।"}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Link
                to="/assistant"
                className="text-xs font-bold text-teal-800 hover:text-teal-950 inline-flex items-center gap-1.5 group-hover:translate-x-1 transition-transform"
              >
                <span>{i18n.language === "en" ? "Ask Assistant" : "সহকারীকে জিজ্ঞাসা করুন"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Three Dedicated Portals Showcase */}
      <section className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white border border-slate-800 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold border border-white/10">
              <Users className="w-3.5 h-3.5" />
              <span>{i18n.language === "en" ? "Role-Based Unified Portals" : "ভূমিকাভিত্তিক ৩টি সমন্বিত পোর্টাল"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {i18n.language === "en"
                ? "Dedicated Portals for Farmers, Officers & Admins"
                : "কৃষক, কর্মকর্তা ও প্রশাসকের জন্য নির্দিষ্ট ওয়ার্কস্পেস"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 font-medium font-bangla">
              {i18n.language === "en"
                ? "Specialized interfaces tailored to each role's specific workflows, authority, and data needs."
                : "প্রত্যেক ব্যবহারকারীর দায়িত্ব ও প্রয়োজন অনুসারে তৈরি করা হয়েছে ডেডিকেটেড ইন্টারফেস।"}
            </p>
          </div>

          <Link
            to="/login"
            className="app-btn-primary px-4 py-2.5 text-xs font-bold"
          >
            <span>{i18n.language === "en" ? "Enter Portal" : "পোর্টালে প্রবেশ করুন"}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Farmer Portal Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-emerald-500/50 transition-colors shadow-md">
            <div className="w-10 h-10 rounded-xl bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 flex items-center justify-center font-bold text-lg">
              🌾
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white font-bangla">
                {i18n.language === "en" ? "Farmer Digital Portal" : "কৃষক ডিজিটাল পোর্টাল"}
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed font-bangla font-medium">
                {i18n.language === "en"
                  ? "Localized weather, field-level fertilizer plans, advisory history, and 1-click PDF download."
                  : "স্থানীয় আবহাওয়া, জমির পরিমাপ অনুযায়ী সারের ডোজ, সংরক্ষিত সুপারিশের ইতিহাস এবং ১-ক্লিকে পিডিএফ প্রিন্ট।"}
              </p>
            </div>
            <ul className="text-xs text-slate-200 space-y-1.5 pt-2 font-bangla font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>{i18n.language === "en" ? "Personal Farm Dashboard & Advisory Logs" : "ব্যক্তিগত খামার ড্যাশবোর্ড ও পরামর্শ লগ"}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>{i18n.language === "en" ? "PDF Advisory Export for Offline Record-Keeping" : "অফলাইন সংরক্ষণের জন্য পিডিএফ রিপোর্ট"}</span>
              </li>
            </ul>
          </div>

          {/* Extension Officer Portal Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-teal-500/50 transition-colors shadow-md">
            <div className="w-10 h-10 rounded-xl bg-teal-900/60 text-teal-300 border border-teal-700/60 flex items-center justify-center font-bold text-lg">
              🛡️
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white font-bangla">
                {i18n.language === "en" ? "Extension Officer Portal" : "উপজেলা কর্মকর্তা পোর্টাল"}
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed font-bangla font-medium">
                {i18n.language === "en"
                  ? "Audit AI responses, add field-level scientific notes, and track regional agronomic patterns."
                  : "এআই মডেলের ভুল বা অস্পষ্ট উত্তর নিরীক্ষা কেন্দ্র, মাঠপর্যায়ের বৈজ্ঞানিক নোট সংযোজন ও আঞ্চলিক প্রবণতা বিশ্লেষণ।"}
              </p>
            </div>
            <ul className="text-xs text-slate-200 space-y-1.5 pt-2 font-bangla font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                <span>{i18n.language === "en" ? "Audit and Resolve Flagged Advisory Feedback" : "ফ্ল্যাগকৃত প্রশ্নোত্তর সংশোধন ও অনুমোদন"}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                <span>{i18n.language === "en" ? "Regional Nutrient Deficiencies & Crop Analytics" : "আঞ্চলিক পুষ্টি ঘাটতি ও ফসল পরিসংখ্যান"}</span>
              </li>
            </ul>
          </div>

          {/* Admin Command Center Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-purple-500/50 transition-colors shadow-md">
            <div className="w-10 h-10 rounded-xl bg-purple-900/60 text-purple-300 border border-purple-700/60 flex items-center justify-center font-bold text-lg">
              👑
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white font-bangla">
                {i18n.language === "en" ? "Admin Command Center" : "অ্যাডমিন কমান্ড সেন্টার"}
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed font-bangla font-medium">
                {i18n.language === "en"
                  ? "Manage user accounts, officer verification, RAG knowledge indexing, and system security audit trails."
                  : "সমগ্র প্ল্যাটফর্মের ইউজার ম্যানেজমেন্ট, কর্মকর্তা স্বীকৃতি অনুমোদন, RAG গবেষণা নথি ব্যবস্থাপনা ও অডিট ট্রেইল।"}
              </p>
            </div>
            <ul className="text-xs text-slate-200 space-y-1.5 pt-2 font-bangla font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                <span>{i18n.language === "en" ? "AI Model Registry & Vector Database Re-indexing" : "মডেল আর্কিটেকচার ও আরএজি রি-ইন্ডেক্স"}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                <span>{i18n.language === "en" ? "Full Activity Logs & System Telemetry" : "জাতীয় কৃষি কার্যক্রমের সম্পূর্ণ অডিট লগ"}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. Scientific Rigor & Credibility */}
      <section className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xs space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            {i18n.language === "en" ? "Scientific Rigor & National Accreditation" : "নির্ভরযোগ্যতার নিশ্চয়তা ও জাতীয় মানদণ্ড"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-bangla">
            {i18n.language === "en"
              ? "We eliminate speculative recommendations by strictly adhering to scientific research and government agro publications."
              : "আমরা অনুমাননির্ভর পরামর্শ পরিহার করে বৈজ্ঞানিক তথ্য ও সরকারি গবেষণার আলোকেই উত্তর প্রদান করি।"}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto sm:mx-0 font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">
              {i18n.language === "en" ? "Hallucination-Free RAG" : "হ্যালুসিনেশন-মুক্ত আরএজি (RAG)"}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-bangla">
              {i18n.language === "en"
                ? "The AI assistant never fabricates advice; it strictly cites verified pages from official BARC & BRRI research manuals."
                : "চ্যাটবট স্বতঃপ্রণোদিত কোনো উত্তর বানায় না; সংরক্ষিত গবেষণা নথির নির্ভরযোগ্যতার ভিত্তিতে কেবল তথ্যসূত্রসহ উত্তর দেয়।"}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mx-auto sm:mx-0 font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">
              {i18n.language === "en" ? "Officer Escalation Protocol" : "উপজেলা কৃষি কর্মকর্তা রেফারেল"}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-bangla">
              {i18n.language === "en"
                ? "High-risk pesticide queries advise direct consultation with licensed Upazila Agricultural Extension Officers."
                : "উচ্চ-ঝুঁকি বা বিষাক্ত কীটনাশকের ক্ষেত্রে সরাসরি সরকারি লাইসেন্সধারী কর্মকর্তা বা উপজেলা কৃষি অফিসের সাথে যোগাযোগের পরামর্শ দেওয়া হয়।"}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto sm:mx-0 font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">
              {i18n.language === "en" ? "Local Units & Official PDF Export" : "স্থানীয় একক ও ফর্ম্যাট সাপোর্ট"}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-bangla">
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
