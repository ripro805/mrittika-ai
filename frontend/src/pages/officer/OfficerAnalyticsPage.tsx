import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import apiClient from "../../services/api";
import {
  BarChart3,
  TrendingUp,
  Star,
  Sprout,
  Loader2,
  AlertCircle,
} from "lucide-react";

export const OfficerAnalyticsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    apiClient
      .get("/officer/analytics")
      .then((res) => {
        setData(res.data);
      })
      .catch(() => {
        setError(i18n.language === "en" ? "Failed to load analytics data." : "অ্যানালিটিক্স ডাটা লোড করতে ব্যর্থ হয়েছে।");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [i18n.language]);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-teal-700" />
        <span className="text-sm text-slate-700 font-bold font-bangla">
          {i18n.language === "en" ? "Loading regional agronomic telemetry..." : "আঞ্চলিক কৃষিতাত্ত্বিক পরিসংখ্যান লোড হচ্ছে..."}
        </span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-sm flex items-center gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
        <span>{error || (i18n.language === "en" ? "Data loading failed." : "উপাত্ত লোড ব্যর্থ হয়েছে।")}</span>
      </div>
    );
  }

  const { top_crops, ratings_distribution, module_feedback_counts } = data;
  const maxCropCount = Math.max(...top_crops.map((c: any) => c.query_count), 1);

  return (
    <div className="space-y-8 w-full max-w-[1680px] 2xl:max-w-[1760px] mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-teal-700" />
          <span>
            {i18n.language === "en"
              ? "Regional Agronomic Telemetry & Crop Trends"
              : "আঞ্চলিক কৃষিতাত্ত্বিক উপাত্ত ও ফসলের প্রবণতা"}
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-bangla">
          {i18n.language === "en"
            ? "Nutrient and crop demand analysis based on farmer recommendation history and model evaluations"
            : "কৃষকদের সুপারিশ ইতিহাস এবং মডেল মূল্যায়নের ভিত্তিতে পুষ্টি ও ফসলের চাহিদা বিশ্লেষণ"}
        </p>
      </div>

      {/* Grid: Top Crops Bar Chart & Feedback Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Crops Query Frequency */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-[28px] border border-black/[0.06] shadow-apple space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.05]">
            <div className="flex items-center gap-2">
              <Sprout className="w-4 h-4 text-emerald-700" />
              <h2 className="text-sm font-extrabold text-[#1d1d1f] tracking-tight">
                {i18n.language === "en" ? "Most Frequently Queried Crops" : "সর্বাধিক অনুসন্ধানকৃত ফসলসমূহ"}
              </h2>
            </div>
            <span className="text-xs text-[#86868b] font-mono">
              {i18n.language === "en" ? "Recommendation Volume" : "সুপারিশ ফ্রিকোয়েন্সি"}
            </span>
          </div>

          <div className="space-y-3.5 pt-2">
            {top_crops.map((crop: any) => {
              const pct = Math.round((crop.query_count / maxCropCount) * 100);
              const cropName = i18n.language === "en"
                ? (crop.crop_name_en || crop.crop_slug)
                : (crop.crop_name_bn || crop.crop_slug);
              return (
                <div key={crop.crop_slug} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#1d1d1f] font-bold">{cropName}</span>
                    <span className="text-teal-900 font-bold font-mono">
                      {crop.query_count} {i18n.language === "en" ? "recommendations" : "টি সুপারিশ"}
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-black/[0.04] overflow-hidden border border-black/[0.04]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-700 to-emerald-600 transition-all duration-500 shadow-2xs"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ratings and Module Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          {/* Ratings Distribution Card */}
          <div className="bg-white p-6 rounded-[28px] border border-black/[0.06] shadow-apple space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-black/[0.05]">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <h2 className="text-sm font-extrabold text-[#1d1d1f] tracking-tight">
                {i18n.language === "en" ? "Farmer Satisfaction Rating Spread" : "কৃষক সন্তুষ্টি রেটিং বণ্টন"}
              </h2>
            </div>

            <div className="space-y-2.5">
              {ratings_distribution.map((r: any) => (
                <div key={r.rating} className="flex items-center gap-3 text-xs">
                  <div className="w-14 flex items-center gap-1 font-bold text-[#1d1d1f]">
                    <span>{r.rating}</span>
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  </div>
                  <div className="flex-1 h-2.5 rounded-full bg-black/[0.04] overflow-hidden border border-black/[0.04]">
                    <div
                      className="h-full bg-amber-500 rounded-full shadow-2xs"
                      style={{ width: `${Math.min(100, r.count * 1.5)}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-bold text-[#1d1d1f] font-mono">{r.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Module Breakdown Card */}
          <div className="bg-white p-6 rounded-[28px] border border-black/[0.06] shadow-apple space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-black/[0.05]">
              <TrendingUp className="w-4 h-4 text-teal-700" />
              <h2 className="text-sm font-extrabold text-[#1d1d1f] tracking-tight">
                {i18n.language === "en" ? "Feedback Count by Module" : "মডিউলভিত্তিক প্রতিক্রিয়া"}
              </h2>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-2">
              {module_feedback_counts.map((m: any) => {
                let modLabel = m.module_type;
                if (m.module_type === "CHAT") {
                  modLabel = i18n.language === "en" ? "Agri Assistant" : "কৃষি সহকারী";
                } else if (m.module_type === "CROP") {
                  modLabel = i18n.language === "en" ? "Crop Selection" : "ফসল নির্বাচন";
                } else {
                  modLabel = i18n.language === "en" ? "Fertilizer Calc" : "সারের হিসাব";
                }

                return (
                  <div key={m.module_type} className="p-3 rounded-2xl bg-[#fbfbfd] border border-black/[0.05] text-center">
                    <p className="text-[11px] text-[#86868b] font-bold">{modLabel}</p>
                    <p className="text-lg font-extrabold text-teal-950 font-mono mt-0.5">{m.count}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
