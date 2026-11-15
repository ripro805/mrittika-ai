import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import apiClient from "../../services/api";
import {
  Sprout,
  FlaskConical,
  Bot,
  CloudSun,
  History,
  FileDown,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Calendar,
  MapPin,
  AlertCircle,
  Loader2,
} from "lucide-react";

export const FarmerDashboardPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    apiClient
      .get("/farmer/overview")
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        setError("ড্যাশবোর্ড তথ্য লোড করা যায়নি। দয়া করে পুনরায় চেষ্টা করুন।");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-700" />
        <span className="text-xs text-gray-500 font-medium">কৃষক ড্যাশবোর্ড উপাত্ত প্রস্তুত হচ্ছে...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-sm flex items-center gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
        <span>{error || "তথ্য লোড ব্যর্থ হয়েছে।"}</span>
      </div>
    );
  }

  const { farmer, stats, weather, recent_recommendations, seasonal_tip } = data;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Farmer Greeting Banner */}
      <div className="relative overflow-hidden bg-linear-to-r from-emerald-950 via-emerald-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-card border border-emerald-800/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold text-emerald-200 border border-white/10">
              <MapPin className="w-3.5 h-3.5 text-emerald-300" />
              <span>
                {farmer.district || "বাংলাদেশ"} {farmer.upazila ? `• ${farmer.upazila}` : ""}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              স্বাগতম, {farmer.name || "সম্মানিত কৃষক"}!
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm max-w-xl font-bangla leading-relaxed">
              আপনার জমির পুষ্টি বিশ্লেষণ, রবি/খরিপ মৌসুমের সুষম সারের ডোজ এবং আধুনিক এআই কৃষি বিশেষজ্ঞের পরামর্শ এক নজরে দেখুন।
            </p>
          </div>

          {/* Quick Action Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/farmer/crop-recommend"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-emerald-900 text-xs font-bold hover:bg-emerald-50 transition shadow-sm cursor-pointer"
            >
              <Sprout className="w-4 h-4 text-emerald-700" />
              <span>নতুন ফসল খুঁজুন</span>
            </Link>
            <Link
              to="/farmer/fertilizer-plan"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 text-white text-xs font-bold border border-white/20 transition cursor-pointer"
            >
              <FlaskConical className="w-4 h-4 text-emerald-300" />
              <span>সার হিসাব করুন</span>
            </Link>
          </div>
        </div>

        {/* Ambient background leaf shape */}
        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 opacity-10 pointer-events-none">
          <Sprout className="w-72 h-72 text-white" />
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="app-card-interactive p-5 rounded-2xl border border-slate-200 bg-white shadow-card space-y-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-700">মোট সংরক্ষিত পরামর্শ</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">{stats.total_recommendations}</p>
          <p className="text-[11px] text-slate-500 font-medium">ফসল ও সার সুপারিশ ইতিহাস</p>
        </div>

        <div className="app-card-interactive p-5 rounded-2xl border border-slate-200 bg-white shadow-card space-y-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-700">সেরা ফসল নির্বাচন</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center border border-blue-200">
              <Sprout className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">{stats.crop_recommendations}</p>
          <p className="text-[11px] text-slate-500 font-medium">মাটি ও আবহাওয়া ভিত্তিক পরীক্ষা</p>
        </div>

        <div className="app-card-interactive p-5 rounded-2xl border border-slate-200 bg-white shadow-card space-y-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-700">সুষম সার পরিকল্পনা</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200">
              <FlaskConical className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">{stats.fertilizer_plans}</p>
          <p className="text-[11px] text-slate-500 font-medium">ইউরিয়া, টিএসপি, এমওপি হিসাব</p>
        </div>

        <div className="app-card-interactive p-5 rounded-2xl border border-slate-200 bg-white shadow-card space-y-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-700">কৃষি সহকারী আলোচনা</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center border border-purple-200">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">{stats.chat_sessions}</p>
          <p className="text-[11px] text-slate-500 font-medium">রোগবালাই ও পুষ্টি সমাধান সেশন</p>
        </div>
      </div>

      {/* Weather & Seasonal Advice Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Weather Card */}
        <div className="app-card p-6 rounded-3xl border border-slate-200 bg-white shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center border border-blue-200">
                <CloudSun className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">স্থানীয় আবহাওয়া</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 font-bold border border-blue-200">
              {weather.fallback ? "আঞ্চলিক উপাত্ত" : "লাইভ আবহাওয়া"}
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-2">
            <div>
              <span className="text-4xl font-extrabold text-slate-900 font-mono">{weather.temperature}°C</span>
              <p className="text-xs text-slate-600 mt-1 font-semibold">{weather.district_bn || farmer.district} অঞ্চল</p>
            </div>
            <div className="text-right text-xs space-y-1 text-slate-700 font-medium">
              <p>আর্দ্রতা: <span className="font-bold text-slate-900 font-mono">{weather.humidity}%</span></p>
              <p>বৃষ্টিপাত: <span className="font-bold text-slate-900 font-mono">{weather.rainfall} মিমি</span></p>
              <p>মৌসুম: <span className="font-bold text-emerald-800">{weather.season || "Rabi"}</span></p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <Link
              to="/farmer/crop-recommend"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group"
            >
              <span>এই আবহাওয়ার ভিত্তিতে সেরা ফসল দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Seasonal Tip Card */}
        <div className="md:col-span-2 bg-emerald-50/70 p-6 rounded-3xl border border-emerald-200 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-bold border border-emerald-200">
              <Calendar className="w-3 h-3 text-emerald-800" />
              <span>{seasonal_tip.title_bn}</span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
              মাঠ পর্যায়ের সুপরামর্শ ও সেচ সতর্কতা
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-bangla">
              {seasonal_tip.content_bn}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-emerald-200">
            <div className="flex items-center gap-2 text-xs text-emerald-900 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>বাংলাদেশ কৃষি গবেষণা কাউন্সিল (BARC) মানসম্মত নির্দেশিকা</span>
            </div>
            <Link
              to="/farmer/assistant"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-sm"
            >
              সহকারীকে জিজ্ঞাসা করুন
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Recommendations Table */}
      <div className="app-card rounded-3xl border border-slate-200 bg-white shadow-card overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">সাম্প্রতিক সংরক্ষিত পরামর্শ</h2>
              <p className="text-xs text-slate-500">আপনার সংরক্ষিত ফসল ও সুষম সারের হিসাব তালিকা</p>
            </div>
          </div>
          <Link
            to="/farmer/history"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>সব দেখুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recent_recommendations && recent_recommendations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">পরামর্শের ধরন</th>
                  <th className="px-6 py-3.5">ফসলের নাম</th>
                  <th className="px-6 py-3.5">পুষ্টি উপাদান / সার</th>
                  <th className="px-6 py-3.5">তারিখ</th>
                  <th className="px-6 py-3.5 text-right">পিডিএফ রিপোর্ট</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recent_recommendations.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          item.rec_type === "CROP"
                            ? "bg-blue-50 text-blue-900 border-blue-200"
                            : "bg-amber-50 text-amber-900 border-amber-200"
                        }`}
                      >
                        {item.rec_type === "CROP" ? "ফসল নির্বাচন" : "সারের হিসাব"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {item.crop_name_bn || item.crop_slug || "সাধারণ"}
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {item.rec_type === "CROP"
                        ? `N: ${item.inputs?.N || 0}, P: ${item.inputs?.P || 0}, K: ${item.inputs?.K || 0}`
                        : item.fertilizer_plan || "সুষম সার ডোজ"}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs font-mono">
                      {new Date(item.created_at).toLocaleDateString("bn-BD", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a
                        href={`/api/v1/report/${item.id}.pdf`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 text-xs font-bold transition border border-slate-300 hover:border-emerald-300"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>পিডিএফ</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center space-y-3">
            <p className="text-xs text-slate-500">আপনার কোনো সংরক্ষিত পরামর্শের রেকর্ড নেই।</p>
            <Link
              to="/farmer/crop-recommend"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition"
            >
              প্রথম ফসল পরামর্শ নিন
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
