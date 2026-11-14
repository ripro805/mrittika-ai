import React, { useEffect, useState } from "react";
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
        setError("অ্যানালিটিক্স ডাটা লোড করতে ব্যর্থ হয়েছে।");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-teal-700" />
        <span className="text-xs text-gray-500 font-medium">আঞ্চলিক কৃষিতাত্ত্বিক পরিসংখ্যান লোড হচ্ছে...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-sm flex items-center gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
        <span>{error || "উপাত্ত লোড ব্যর্থ হয়েছে।"}</span>
      </div>
    );
  }

  const { top_crops, ratings_distribution, module_feedback_counts } = data;
  const maxCropCount = Math.max(...top_crops.map((c: any) => c.query_count), 1);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-teal-700" />
          <span>আঞ্চলিক কৃষিতাত্ত্বিক উপাত্ত ও ফসলের প্রবণতা</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          কৃষকদের সুপারিশ ইতিহাস এবং মডেল মূল্যায়নের ভিত্তিতে পুষ্টি ও ফসলের চাহিদা বিশ্লেষণ
        </p>
      </div>

      {/* Grid: Top Crops Bar Chart & Feedback Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Crops Query Frequency */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Sprout className="w-4 h-4 text-emerald-700" />
              <h2 className="text-sm font-bold text-gray-900">সর্বাধিক অনুসন্ধানকৃত ফসলসমূহ</h2>
            </div>
            <span className="text-xs text-gray-400">সুপারিশ ফ্রিকোয়েন্সি</span>
          </div>

          <div className="space-y-3 pt-2">
            {top_crops.map((crop: any) => {
              const pct = Math.round((crop.query_count / maxCropCount) * 100);
              return (
                <div key={crop.crop_slug} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-gray-800">{crop.crop_name_bn || crop.crop_slug}</span>
                    <span className="text-teal-800 font-bold">{crop.query_count} টি সুপারিশ</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-600 to-emerald-600 transition-all duration-500"
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
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <h2 className="text-sm font-bold text-gray-900">কৃষক সন্তুষ্টি রেটিং বণ্টন</h2>
            </div>

            <div className="space-y-2.5">
              {ratings_distribution.map((r: any) => (
                <div key={r.rating} className="flex items-center gap-3 text-xs">
                  <div className="w-14 flex items-center gap-1 font-bold text-gray-700">
                    <span>{r.rating}</span>
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  </div>
                  <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${Math.min(100, r.count * 1.5)}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-bold text-gray-600">{r.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Module Breakdown Card */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <TrendingUp className="w-4 h-4 text-teal-700" />
              <h2 className="text-sm font-bold text-gray-900">মডিউলভিত্তিক প্রতিক্রিয়া</h2>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              {module_feedback_counts.map((m: any) => (
                <div key={m.module_type} className="p-3 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                  <p className="text-xs text-gray-500 font-medium">
                    {m.module_type === "CHAT" ? "কৃষি সহকারী" : m.module_type === "CROP" ? "ফসল নির্বাচন" : "সারের হিসাব"}
                  </p>
                  <p className="text-lg font-extrabold text-teal-900 mt-0.5">{m.count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
