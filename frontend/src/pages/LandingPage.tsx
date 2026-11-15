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
} from "lucide-react";

export const LandingPage: React.FC = () => {
  const { t, i18n } = useTranslation();

  return (
    <div className="space-y-16 lg:space-y-24 py-4">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-slate-950 to-emerald-950 text-white border border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.3)] px-6 py-12 sm:px-10 sm:py-16 lg:px-12">
        {/* Subtle grid pattern & ambient glows */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headlines & CTA */}
          <div className="lg:col-span-7 space-y-6">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-semibold backdrop-blur-md badge-3d">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {i18n.language === "bn"
                  ? "বাংলাদেশ কৃষি গবেষণা কাউন্সিল (BARC) মানসম্মত এআই প্রযুক্তি"
                  : "BARC Fertilizer Recommendation Standards Compliant"}
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-5.5xl font-extrabold tracking-tight leading-[1.15] text-white">
              {i18n.language === "bn" ? (
                <>
                  মাটির পুষ্টি ও আবহাওয়ায় <br />
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
                    বিজ্ঞানভিত্তিক স্মার্ট চাষাবাদ
                  </span>
                </>
              ) : (
                <>
                  Scientific Precision Agriculture <br />
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
                    Powered by Soil & Climate AI
                  </span>
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-xl">
              {i18n.language === "bn"
                ? "আপনার জমির N-P-K মাত্রা, পিএইচ ও আবহাওয়া বিশ্লেষণ করে সর্বোচ্চ উপযোগী ফসল, সুষম সারের সময়সূচী এবং সরকারি নির্দেশিকা ভিত্তিক তাৎক্ষণিক বাংলা পরামর্শ।"
                : "Analyze soil nutrients, pH, and local weather to receive top crop recommendations, stage-by-stage fertilizer dosages, and research-grounded Bangla agricultural advice."}
            </p>

            {/* Primary & Secondary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/crop"
                className="btn-3d-emerald inline-flex items-center gap-2 font-bold px-6 py-3.5 rounded-xl shadow-md text-sm sm:text-base group cursor-pointer"
              >
                <Sprout className="w-5 h-5 text-white" />
                <span>{i18n.language === "bn" ? "সেরা ফসল নির্বাচন শুরু করুন" : "Start Crop Advisory"}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/assistant"
                className="inline-flex items-center gap-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-semibold px-5 py-3.5 rounded-xl border border-slate-700/80 transition-all hover:-translate-y-0.5 text-sm sm:text-base shadow-sm"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>{i18n.language === "bn" ? "কৃষি সহকারীকে জিজ্ঞাসা করুন" : "Ask AI Assistant"}</span>
              </Link>
            </div>

            {/* Telemetry Highlights */}
            <div className="pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-400 font-medium">
              <div className="space-y-0.5">
                <p className="text-xl font-extrabold text-white">২৪ টি ফসল</p>
                <p className="text-[11px] text-slate-400">ক্যানোনিকাল শ্রেণিবিভাগ</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xl font-extrabold text-white">৩০ টি AEZ</p>
                <p className="text-[11px] text-slate-400">আঞ্চলিক জলবায়ু উপাত্ত</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xl font-extrabold text-white">৯৪.৮%</p>
                <p className="text-[11px] text-slate-400">মডেল একুরেসি স্কোর</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xl font-extrabold text-white">১০০%</p>
                <p className="text-[11px] text-slate-400">যাচাইকৃত নথি সূত্র</p>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Live Agricultural Telemetry Card */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="card-3d p-6 rounded-3xl bg-slate-900/90 backdrop-blur-xl border border-emerald-500/30 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_1px_1px_rgba(255,255,255,0.1)_inset] space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    🌱
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">রিয়েলটাইম এআই সিমুলেটর</h3>
                    <p className="text-[10px] text-slate-400">বগুড়া, রাজশাহী • খরিফ-২ মৌসুম</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  সক্রিয় সেন্সর
                </span>
              </div>

              {/* Nutrients Gauges */}
              <div className="space-y-2.5">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  মাটির পুষ্টি উপাদান মাত্রা (N-P-K):
                </p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1">
                    <span className="text-[10px] text-slate-400">নাইট্রোজেন (N)</span>
                    <p className="text-sm font-extrabold text-emerald-400 font-mono">৯০ kg/ha</p>
                    <div className="w-full bg-slate-700 h-1 rounded-full overflow-hidden">
                      <div className="bg-emerald-400 h-full w-[75%]" />
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1">
                    <span className="text-[10px] text-slate-400">ফসফরাস (P)</span>
                    <p className="text-sm font-extrabold text-teal-400 font-mono">৪৫ kg/ha</p>
                    <div className="w-full bg-slate-700 h-1 rounded-full overflow-hidden">
                      <div className="bg-teal-400 h-full w-[65%]" />
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1">
                    <span className="text-[10px] text-slate-400">পটাশিয়াম (K)</span>
                    <p className="text-sm font-extrabold text-amber-400 font-mono">৬০ kg/ha</p>
                    <div className="w-full bg-slate-700 h-1 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full w-[80%]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommended Top Result Card */}
              <div className="p-4 rounded-2xl bg-linear-to-r from-emerald-950/80 via-slate-800/80 to-teal-950/80 border border-emerald-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    শীর্ষ প্রস্তাবিত ফসল
                  </span>
                  <span className="text-xs font-extrabold text-emerald-400 font-mono">
                    ৯৬.৪% সামঞ্জস্য
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-extrabold text-white">আমন ধান (Aman Rice)</h4>
                    <p className="text-[10px] text-slate-300">দোআঁশ মাটি • পিএইচ ৬.৫ • ২৫০মিমি বৃষ্টিপাত</p>
                  </div>
                  <Link
                    to="/crop"
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-xs"
                  >
                    যাচাই করুন →
                  </Link>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <CloudSun className="w-3.5 h-3.5 text-amber-400" />
                  আবহাওয়া: ২৭°C • আর্দ্রতা ৮০%
                </span>
                <span className="text-emerald-400 font-medium">লাইভ সিঙ্ক সম্পন্ন</span>
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
            <span>সমন্বিত কৃষি প্রযুক্তি প্ল্যাটফর্ম</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            তিনটি ধাপে সম্পূর্ণ ডিজিটাল কৃষি সমাধান
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            এক মডিউলের মাটির তথ্য সরাসরি পরবর্তী ধাপে স্থানান্তরিত হয়—একই তথ্য বারবার লেখার ঝামেলা নেই।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Crop Selection */}
          <div className="card-3d card-3d-interactive p-7 sm:p-8 rounded-3xl border border-emerald-100/90 bg-white/95 shadow-md hover:border-emerald-400/80 flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-700/25 border border-emerald-400/40 group-hover:scale-105 transition-transform">
                <Sprout className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider badge-3d">মডিউল ১</span>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-emerald-950 transition-colors">মাটি ও আবহাওয়ায় সেরা ফসল</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-bangla">
                জমির N, P, K মাত্রা, মাটির পিএইচ এবং জেলার আবহাওয়ার তথ্যে এআই মডেল বিশ্লেষণ করে সেরা ৩টি লাভজনক ফসলের তালিকা তৈরি করে।
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Link
                to="/crop"
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1.5 group-hover:translate-x-1 transition-transform"
              >
                <span>ফসল নির্বাচন করুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Fertilizer Dosage */}
          <div className="card-3d card-3d-interactive p-7 sm:p-8 rounded-3xl border border-amber-100/90 bg-white/95 shadow-md hover:border-amber-400/80 flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-amber-600/25 border border-amber-400/40 group-hover:scale-105 transition-transform">
                <FlaskConical className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 uppercase tracking-wider badge-3d">মডিউল ২</span>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-amber-950 transition-colors">সুষম সারের সঠিক মাত্রা</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-bangla">
                নির্বাচিত ফসলের পুষ্টি চাহিদা অনুসারে বিঘা ও শতক এককে ইউরিয়া, টিএসপি, পটাশ ও জিপসাম সারের কিস্তিভিত্তিক সঠিক ডোজ ও সময়সূচী।
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Link
                to="/fertilizer"
                className="text-xs font-bold text-amber-800 hover:text-amber-950 inline-flex items-center gap-1.5 group-hover:translate-x-1 transition-transform"
              >
                <span>সারের মাত্রা গণনা করুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3: AI Assistant */}
          <div className="card-3d card-3d-interactive p-7 sm:p-8 rounded-3xl border border-blue-100/90 bg-white/95 shadow-md hover:border-blue-400/80 flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-600/25 border border-blue-400/40 group-hover:scale-105 transition-transform">
                <Bot className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 uppercase tracking-wider badge-3d">মডিউল ৩</span>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-blue-950 transition-colors">বাংলা এআই কৃষি সহকারী</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-bangla">
                পোকা দমন, রোগ প্রতিরোধ ও রাসায়নিক সুরক্ষায় বাংলায় প্রশ্ন করুন। সাথে পাবেন সরকারি গবেষণা হ্যান্ডবুকের পৃষ্ঠা নম্বরযুক্ত যাচাইকৃত তথ্যসূত্র।
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Link
                to="/assistant"
                className="text-xs font-bold text-blue-800 hover:text-blue-950 inline-flex items-center gap-1.5 group-hover:translate-x-1 transition-transform"
              >
                <span>সহকারীকে জিজ্ঞাসা করুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Three Dedicated Portals Showcase */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-8 sm:p-12 text-white border border-slate-800 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold border border-white/10">
              <Users className="w-3.5 h-3.5" />
              <span>ভূমিকাভিত্তিক ৩টি সমন্বিত পোর্টাল</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              কৃষক, কর্মকর্তা ও প্রশাসকের জন্য নির্দিষ্ট ওয়ার্কস্পেস
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              প্রত্যেক ব্যবহারকারীর দায়িত্ব ও প্রয়োজন অনুসারে তৈরি করা হয়েছে ডেডিকেটেড ইন্টারফেস।
            </p>
          </div>

          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition"
          >
            <span>পোর্টালে প্রবেশ করুন</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {/* Farmer Portal Card */}
          <div className="card-3d bg-slate-800/90 border border-emerald-500/30 rounded-2xl p-6 space-y-4 hover:border-emerald-400 hover:-translate-y-1 transition-all shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-emerald-600 to-emerald-900 text-emerald-200 border border-emerald-500/40 flex items-center justify-center font-bold text-xl shadow-md">
              🌾
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">কৃষক ডিজিটাল পোর্টাল</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-bangla">
                স্থানীয় আবহাওয়া, জমির পরিমাপ অনুযায়ী সারের ডোজ, সংরক্ষিত সুপারিশের ইতিহাস এবং ১-ক্লিকে পিডিএফ প্রিন্ট।
              </p>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 pt-2 font-bangla">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>ব্যক্তিগত খামার ড্যাশবোর্ড ও পরামর্শ লগ</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>অফলাইন সংরক্ষণের জন্য পিডিএফ রিপোর্ট</span>
              </li>
            </ul>
          </div>

          {/* Extension Officer Portal Card */}
          <div className="card-3d bg-slate-800/90 border border-teal-500/30 rounded-2xl p-6 space-y-4 hover:border-teal-400 hover:-translate-y-1 transition-all shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-teal-600 to-teal-900 text-teal-200 border border-teal-500/40 flex items-center justify-center font-bold text-xl shadow-md">
              🛡️
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">উপজেলা কর্মকর্তা পোর্টাল</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-bangla">
                এআই মডেলের ভুল বা অস্পষ্ট উত্তর নিরীক্ষা কেন্দ্র, মাঠপর্যায়ের বৈজ্ঞানিক নোট সংযোজন ও আঞ্চলিক প্রবণতা বিশ্লেষণ।
              </p>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 pt-2 font-bangla">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                <span>ফ্ল্যাগকৃত প্রশ্নোত্তর সংশোধন ও অনুমোদন</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                <span>আঞ্চলিক পুষ্টি ঘাটতি ও ফসল পরিসংখ্যান</span>
              </li>
            </ul>
          </div>

          {/* Admin Command Center Card */}
          <div className="card-3d bg-slate-800/90 border border-purple-500/30 rounded-2xl p-6 space-y-4 hover:border-purple-400 hover:-translate-y-1 transition-all shadow-lg">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-purple-600 to-purple-900 text-purple-200 border border-purple-500/40 flex items-center justify-center font-bold text-xl shadow-md">
              👑
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">অ্যাডমিন কমান্ড সেন্টার</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-bangla">
                সমগ্র প্ল্যাটফর্মের ইউজার ম্যানেজমেন্ট, কর্মকর্তা স্বীকৃতি অনুমোদন, RAG গবেষণা নথি ব্যবস্থাপনা ও অডিট ট্রেইল।
              </p>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 pt-2 font-bangla">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                <span>মডেল আর্কিটেকচার ও আরএজি রি-ইন্ডেক্স</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                <span>জাতীয় কৃষি কার্যক্রমের সম্পূর্ণ অডিট লগ</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. Scientific Rigor & Credibility */}
      <section className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-card space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            নির্ভরযোগ্যতার নিশ্চয়তা ও জাতীয় মানদণ্ড
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            আমরা অনুমাননির্ভর পরামর্শ পরিহার করে বৈজ্ঞানিক তথ্য ও সরকারি গবেষণার আলোকেই উত্তর প্রদান করি।
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto sm:mx-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">হ্যালুসিনেশন-মুক্ত আরএজি (RAG)</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              চ্যাটবট স্বতঃপ্রণোদিত কোনো উত্তর বানায় না; সংরক্ষিত গবেষণা নথির সাদৃশ্যমান ৮৫%-এর বেশি হলেই কেবল তথ্যসূত্রসহ উত্তর দেয়।
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mx-auto sm:mx-0">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">উপজেলা কৃষি কর্মকর্তা রেফারেল</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              উচ্চ-ঝুঁকি বা বিষাক্ত কীটনাশকের ক্ষেত্রে সরাসরি সরকারি লাইসেন্সধারী কর্মকর্তা বা উপজেলা কৃষি অফিসের সাথে যোগাযোগের পরামর্শ দেওয়া হয়।
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto sm:mx-0">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">স্থানীয় একক ও ফর্ম্যাট সাপোর্ট</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              বিঘা (৩৩ শতক), শতাংশ ও হেক্টর এককে নিখুঁত রূপান্তর এবং কৃষকের সংরক্ষণযোগ্য আনুষ্ঠানিক পিডিএফ প্রত্যয়নপত্র তৈরি।
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
