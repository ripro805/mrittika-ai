import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../services/api";
import {
  Users,
  Sprout,
  Bot,
  ShieldCheck,
  Cpu,
  Activity,
  ArrowRight,
  Database,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Layers,
} from "lucide-react";

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    apiClient
      .get("/admin/overview")
      .then((res) => {
        setData(res.data);
      })
      .catch(() => {
        setError("অ্যাডমিন ওভারভিউ ডাটা লোড করা যায়নি।");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-purple-700" />
        <span className="text-xs text-gray-500 font-medium">সিস্টেম অ্যাডমিন কমান্ড সেন্টার লোড হচ্ছে...</span>
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

  const { users, recommendations, assistant, audits, system_health, recent_activity } = data;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Executive Command Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-200" />
              <span>সিস্টেম অ্যাডমিনিস্ট্রেশন কমান্ড প্ল্যাটফর্ম</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              মৃত্তিকা এআই কোর এক্সিকিউটিভ ড্যাশবোর্ড
            </h1>
            <p className="text-purple-200 text-xs sm:text-sm max-w-xl">
              সমগ্র বাংলাদেশের কৃষক ও কর্মকর্তা নেটওয়ার্ক, সুপারিশ ইঞ্জিন, এআই চ্যাটবট এবং সিস্টেম সিকিউরিটি কেন্দ্রীয়ভাবে পরিচালনা করুন।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin-portal/users"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-purple-950 text-xs font-bold hover:bg-purple-50 transition shadow-sm"
            >
              <Users className="w-4 h-4 text-purple-700" />
              <span>ব্যবহারকারী ({users.total})</span>
            </Link>
            <Link
              to="/admin-portal/knowledge"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-800/80 hover:bg-purple-800 text-white text-xs font-bold border border-white/20 transition"
            >
              <Layers className="w-4 h-4 text-purple-300" />
              <span>নথি ব্যবস্থাপনা (RAG)</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards: Platform Totals */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="card-3d card-3d-interactive p-5 rounded-2xl border border-purple-100/90 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold">নিবন্ধিত ব্যবহারকারী</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">{users.total}</p>
          <p className="text-[11px] text-gray-500">
            {users.farmers} কৃষক • {users.officers} কর্মকর্তা • {users.admins} অ্যাডমিন
          </p>
        </div>

        <div className="card-3d card-3d-interactive p-5 rounded-2xl border border-emerald-100/90 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold">মোট এআই সুপারিশ</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Sprout className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">{recommendations.total}</p>
          <p className="text-[11px] text-gray-500">
            {recommendations.crop} ফসল • {recommendations.fertilizer} সার পরিকল্পনা
          </p>
        </div>

        <div className="card-3d card-3d-interactive p-5 rounded-2xl border border-blue-100/90 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold">কৃষি সহকারী বার্তা আদান-প্রদান</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">{assistant.messages}</p>
          <p className="text-[11px] text-gray-500">{assistant.sessions} টি সক্রিয় আলোচনা সেশন</p>
        </div>

        <div className="card-3d card-3d-interactive p-5 rounded-2xl border border-amber-100/90 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold">পর্যালোচনা ও সংশোধন</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">{audits.resolved} / {audits.flagged}</p>
          <p className="text-[11px] text-gray-500">
            {audits.pending} টি অপেক্ষমাণ পর্যালোচনা
          </p>
        </div>
      </div>

      {/* System Telemetry & Model Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-700" />
              <h2 className="text-sm font-bold text-gray-900">এআই/এমএল কোর সিস্টেম আর্কিটেকচার</h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              সার্ভিস সক্রিয় (Healthy)
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
              <div>
                <p className="font-bold text-gray-900">ফসল সুপারিশ মডেল</p>
                <p className="text-gray-500 text-[11px]">{system_health.ml_crop_model}</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
              <div>
                <p className="font-bold text-gray-900">সুষম সার প্রেডিকশন মডেল</p>
                <p className="text-gray-500 text-[11px]">{system_health.ml_fertilizer_model}</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
              <div>
                <p className="font-bold text-gray-900">ভেক্টর ডাটাবেজ (RAG)</p>
                <p className="text-gray-500 text-[11px]">{system_health.rag_vector_db}</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
              <div>
                <p className="font-bold text-gray-900">প্রাইমারি এলএলএম প্রোভাইডার</p>
                <p className="text-gray-500 text-[11px]">{system_health.llm_primary}</p>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-bold">Groq Active</span>
            </div>
          </div>
        </div>

        {/* Live System Activity Feed */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-700" />
              <h2 className="text-sm font-bold text-gray-900">সাম্প্রতিক প্ল্যাটফর্ম অডিট লগ</h2>
            </div>
            <Link
              to="/admin-portal/activity-logs"
              className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1"
            >
              <span>সব লগ দেখুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
            {recent_activity.map((log: any) => (
              <div key={log.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-gray-900">{log.action}: </span>
                  <span className="text-gray-600">{log.description}</span>
                </div>
                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                  {new Date(log.created_at).toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
