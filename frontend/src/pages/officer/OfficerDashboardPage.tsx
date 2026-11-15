import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../services/api";
import {
  ShieldAlert,
  CheckCircle2,
  Clock,
  Award,
  ArrowRight,
  TrendingUp,
  MapPin,
  AlertCircle,
  Loader2,
  FileText,
} from "lucide-react";

export const OfficerDashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    apiClient
      .get("/officer/overview")
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        setError("কর্মকর্তা ড্যাশবোর্ড তথ্য লোড করা যায়নি।");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-teal-700" />
        <span className="text-xs text-gray-500 font-medium">উপজেলা কৃষি কর্মকর্তা উপাত্ত প্রস্তুত হচ্ছে...</span>
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

  const { officer, stats, recent_pending, recent_resolved } = data;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Officer Jurisdiction Banner */}
      <div className="relative overflow-hidden bg-linear-to-r from-teal-950 via-teal-900 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-card border border-teal-800/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold text-teal-200 border border-white/10">
              <MapPin className="w-3.5 h-3.5 text-teal-300" />
              <span>
                উপজেলা: {officer.upazila || "শেরপুর"} • জেলা: {officer.district || "বগুড়া"}
              </span>
              {officer.is_verified && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                  যাচাইকৃত কর্মকর্তা
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {officer.name || "কৃষি কর্মকর্তা"}
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm max-w-xl font-bangla leading-relaxed">
              এআই মডেলের ভুল বা অস্পষ্ট উত্তর নিরীক্ষা করুন, কৃষকের সঠিক সার ও রোগবালাই পরামর্শ প্রদানে মাঠ পর্যায়ের বৈজ্ঞানিক সংশোধন যুক্ত করুন।
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/officer/review"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-teal-950 text-xs font-bold hover:bg-teal-50 transition shadow-sm cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              <span>অপেক্ষমাণ রিভিউ ({stats.pending_reviews})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="app-card-interactive p-5 rounded-2xl border border-slate-200 bg-white shadow-card space-y-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-700">মোট ফ্ল্যাগকৃত প্রশ্নোত্তর</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">{stats.total_flagged}</p>
          <p className="text-[11px] text-slate-500 font-medium">কৃষক কর্তৃক চিহ্নিত বা পর্যালোচনার দাবি</p>
        </div>

        <div className="app-card-interactive p-5 rounded-2xl border border-slate-200 bg-white shadow-card space-y-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-700">অপেক্ষমাণ নিরীক্ষা (Pending)</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-700 flex items-center justify-center border border-red-200">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-red-700 font-mono">{stats.pending_reviews}</p>
          <p className="text-[11px] text-slate-500 font-medium">অবিলম্বে কৃষিতাত্ত্বিক পর্যবেক্ষণ প্রয়োজন</p>
        </div>

        <div className="app-card-interactive p-5 rounded-2xl border border-slate-200 bg-white shadow-card space-y-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-700">সমাধানকৃত (Resolved)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-800 font-mono">{stats.resolved_reviews}</p>
          <p className="text-[11px] text-slate-500 font-medium">কর্মকর্তা কর্তৃক সংশোধিত ও অনুমোদিত</p>
        </div>

        <div className="app-card-interactive p-5 rounded-2xl border border-slate-200 bg-white shadow-card space-y-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-700">সমাধানের হার (Resolution)</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center border border-teal-200">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">{stats.resolution_rate_percent}%</p>
          <p className="text-[11px] text-slate-500 font-medium">মোট চিহ্নিত প্রশ্নের কার্যকারিতা</p>
        </div>
      </div>

      {/* Pending Reviews Table / Feed */}
      <div className="app-card bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">পর্যালোচনার জন্য অপেক্ষমাণ প্রশ্নোত্তর</h2>
              <p className="text-xs text-slate-500">এআই মডেলের যেসব উত্তরে কৃষক বা সিস্টেম ফ্ল্যাগ করেছে</p>
            </div>
          </div>
          <Link
            to="/officer/review"
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
          >
            <span>সব দেখুন ও সংশোধন করুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recent_pending && recent_pending.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {recent_pending.map((item: any) => (
              <div key={item.id} className="p-6 hover:bg-slate-50/70 transition space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-900 border border-red-200 text-[11px] font-bold">
                      অপেক্ষমাণ
                    </span>
                    <span className="text-xs font-semibold text-slate-600 font-mono">
                      মডিউল: {item.module_type} • রেটিং: {item.rating}★
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    {new Date(item.created_at).toLocaleDateString("bn-BD")}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-slate-800">
                    ❓ কৃষকের প্রশ্ন / প্রেক্ষাপট:
                  </p>
                  <p className="text-xs sm:text-sm text-slate-900 bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-bangla font-medium">
                    {item.context_data?.question || item.comment || "প্রশ্নের বিবরণ উপলব্ধ নেই।"}
                  </p>
                </div>

                {item.context_data?.assistant_response && (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-700">
                      🤖 এআই মডেলের প্রাথমিক উত্তর:
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-2 font-bangla">
                      {item.context_data.assistant_response}
                    </p>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <Link
                    to="/officer/review"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    <span>সংশোধন প্রদান করুন</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500 font-medium">
            বর্তমানে কোনো অপেক্ষমাণ ফ্ল্যাগকৃত প্রশ্ন নেই। সকল প্রশ্ন সমাধান করা হয়েছে।
          </div>
        )}
      </div>
    </div>
  );
};
