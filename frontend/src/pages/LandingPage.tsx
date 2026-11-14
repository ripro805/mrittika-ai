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
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl px-6 py-14 sm:px-12 sm:py-20 lg:px-16">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {i18n.language === "bn"
                ? "বাংলাদেশ কৃষি গবেষণা কাউন্সিল (BARC) মানসম্মত এআই প্রযুক্তি"
                : "BARC Fertilizer Recommendation Standards Compliant"}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-white">
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
          <p className="text-sm sm:text-base lg:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl">
            {i18n.language === "bn"
              ? "আপনার জমির N-P-K মাত্রা, পিএইচ ও আবহাওয়া বিশ্লেষণ করে সর্বোচ্চ উপযোগী ফসল, সুষম সারের সময়সূচী এবং সরকারি নির্দেশিকা ভিত্তিক তাৎক্ষণিক বাংলা পরামর্শ।"
              : "Analyze soil nutrients, pH, and local weather to receive top crop recommendations, stage-by-stage fertilizer dosages, and research-grounded Bangla agricultural advice."}
          </p>

          {/* Primary & Secondary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/crop"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3.5 rounded-xl shadow-sm transition-all hover:shadow-md text-sm sm:text-base group"
            >
              <Sprout className="w-5 h-5 text-slate-950" />
              <span>{i18n.language === "bn" ? "সেরা ফসল নির্বাচন শুরু করুন" : "Start Crop Advisory"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/assistant"
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-5 py-3.5 rounded-xl border border-slate-700 transition-colors text-sm sm:text-base"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>{i18n.language === "bn" ? "কৃষি সহকারীকে জিজ্ঞাসা করুন" : "Ask AI Assistant"}</span>
            </Link>
          </div>

          {/* Telemetry Highlights */}
          <div className="pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-400 font-medium">
            <div className="space-y-0.5">
              <p className="text-lg font-extrabold text-white">২৪ টি ফসল</p>
              <p className="text-[11px] text-slate-400">ক্যানোনিকাল শ্রেণিবিভাগ</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-lg font-extrabold text-white">৩০ টি AEZ</p>
              <p className="text-[11px] text-slate-400">আঞ্চলিক জলবায়ু উপাত্ত</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-lg font-extrabold text-white">৯৪.৮%</p>
              <p className="text-[11px] text-slate-400">মডেল একুরেসি স্কোর</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-lg font-extrabold text-white">১০০%</p>
              <p className="text-[11px] text-slate-400">যাচাইকৃত নথি সূত্র</p>
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
          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-card hover:border-emerald-300 transition-all flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-lg border border-emerald-100 group-hover:scale-105 transition-transform">
                <Sprout className="w-6 h-6 text-emerald-700" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">মডিউল ১</span>
                <h3 className="text-lg font-bold text-slate-900">মাটি ও আবহাওয়ায় সেরা ফসল</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                জমির N, P, K মাত্রা, মাটির পিএইচ এবং জেলার আবহাওয়ার তথ্যে এআই মডেল বিশ্লেষণ করে সেরা ৩টি লাভজনক ফসলের তালিকা তৈরি করে।
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Link
                to="/crop"
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform"
              >
                <span>ফসল নির্বাচন করুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Fertilizer Dosage */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-card hover:border-amber-300 transition-all flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold text-lg border border-amber-100 group-hover:scale-105 transition-transform">
                <FlaskConical className="w-6 h-6 text-amber-700" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">মডিউল ২</span>
                <h3 className="text-lg font-bold text-slate-900">সুষম সারের সঠিক মাত্রা</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                নির্বাচিত ফসলের পুষ্টি চাহিদা অনুসারে বিঘা ও শতক এককে ইউরিয়া, টিএসপি, পটাশ ও জিপসাম সারের কিস্তিভিত্তিক সঠিক ডোজ ও সময়সূচী।
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Link
                to="/fertilizer"
                className="text-xs font-bold text-amber-800 hover:text-amber-950 inline-flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform"
              >
                <span>সারের মাত্রা গণনা করুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3: AI Assistant */}
          <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-card hover:border-blue-300 transition-all flex flex-col justify-between space-y-6 group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold text-lg border border-blue-100 group-hover:scale-105 transition-transform">
                <Bot className="w-6 h-6 text-blue-700" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">মডিউল ৩</span>
                <h3 className="text-lg font-bold text-slate-900">বাংলা এআই কৃষি সহকারী</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                পোকা দমন, রোগ প্রতিরোধ ও রাসায়নিক সুরক্ষায় বাংলায় প্রশ্ন করুন। সাথে পাবেন সরকারি গবেষণা হ্যান্ডবুকের পৃষ্ঠা নম্বরযুক্ত যাচাইকৃত তথ্যসূত্র।
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Link
                to="/assistant"
                className="text-xs font-bold text-blue-800 hover:text-blue-950 inline-flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform"
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
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 space-y-4 hover:border-emerald-500/50 transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-bold">
              🌾
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">কৃষক ডিজিটাল পোর্টাল</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                স্থানীয় আবহাওয়া, জমির পরিমাপ অনুযায়ী সারের ডোজ, সংরক্ষিত সুপারিশের ইতিহাস এবং ১-ক্লিকে পিডিএফ প্রিন্ট।
              </p>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 pt-2">
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
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 space-y-4 hover:border-teal-500/50 transition">
            <div className="w-10 h-10 rounded-xl bg-teal-950 text-teal-400 border border-teal-800 flex items-center justify-center font-bold">
              🛡️
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">উপজেলা কর্মকর্তা পোর্টাল</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                এআই মডেলের ভুল বা অস্পষ্ট উত্তর নিরীক্ষা কেন্দ্র, মাঠপর্যায়ের বৈজ্ঞানিক নোট সংযোজন ও আঞ্চলিক প্রবণতা বিশ্লেষণ।
              </p>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 pt-2">
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
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 space-y-4 hover:border-purple-500/50 transition">
            <div className="w-10 h-10 rounded-xl bg-purple-950 text-purple-400 border border-purple-800 flex items-center justify-center font-bold">
              👑
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">অ্যাডমিন কমান্ড সেন্টার</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                সমগ্র প্ল্যাটফর্মের ইউজার ম্যানেজমেন্ট, কর্মকর্তা স্বীকৃতি অনুমোদন, RAG গবেষণা নথি ব্যবস্থাপনা ও অডিট ট্রেইল।
              </p>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 pt-2">
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
