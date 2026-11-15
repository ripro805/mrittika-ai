import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  const { t, i18n } = useTranslation();
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
        setError(i18n.language === "en" ? "Failed to load admin overview data." : "অ্যাডমিন ওভারভিউ ডাটা লোড করা যায়নি।");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [i18n.language]);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-purple-700" />
        <span className="text-sm text-slate-700 font-bold font-bangla">
          {i18n.language === "en" ? "Loading System Admin Command Center..." : "সিস্টেম অ্যাডমিন কমান্ড সেন্টার লোড হচ্ছে..."}
        </span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-sm flex items-center gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
        <span>{error || (i18n.language === "en" ? "Data loading failed." : "তথ্য লোড ব্যর্থ হয়েছে।")}</span>
      </div>
    );
  }

  const { users, recommendations, assistant, audits, system_health, recent_activity } = data;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Executive Command Banner */}
      <div
        className="banner-admin-hero relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-card border border-purple-800"
        style={{
          background: "linear-gradient(135deg, #2e1065 0%, #3b0764 50%, #0f172a 100%)",
          backgroundColor: "#2e1065",
        }}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold text-purple-200 border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
              <span>
                {i18n.language === "en"
                  ? "System Administration Command Platform"
                  : "সিস্টেম অ্যাডমিনিস্ট্রেশন কমান্ড প্ল্যাটফর্ম"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {i18n.language === "en"
                ? "Mrittika AI Core Executive Dashboard"
                : "মৃত্তিকা এআই কোর এক্সিকিউটিভ ড্যাশবোর্ড"}
            </h1>
            <p className="text-purple-200 text-xs sm:text-sm max-w-xl font-bangla leading-relaxed">
              {i18n.language === "en"
                ? "Centrally manage nationwide farmers, extension officer networks, recommendation engines, AI assistants, and system security."
                : "সমগ্র বাংলাদেশের কৃষক ও কর্মকর্তা নেটওয়ার্ক, সুপারিশ ইঞ্জিন, এআই চ্যাটবট এবং সিস্টেম সিকিউরিটি কেন্দ্রীয়ভাবে পরিচালনা করুন।"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin-portal/users"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-purple-950 text-xs font-bold hover:bg-purple-50 transition shadow-sm cursor-pointer"
            >
              <Users className="w-4 h-4 text-purple-700" />
              <span>
                {i18n.language === "en" ? `Users (${users.total})` : `ব্যবহারকারী (${users.total})`}
              </span>
            </Link>
            <Link
              to="/admin-portal/knowledge"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-800/80 hover:bg-purple-800 text-white text-xs font-bold border border-white/20 transition cursor-pointer"
            >
              <Layers className="w-4 h-4 text-purple-300" />
              <span>
                {i18n.language === "en" ? "Knowledge Base (RAG)" : "নথি ব্যবস্থাপনা (RAG)"}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards: Platform Totals */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="app-card-interactive p-5 rounded-2xl border border-slate-200 bg-white shadow-card space-y-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-700">
              {i18n.language === "en" ? "Registered Users" : "নিবন্ধিত ব্যবহারকারী"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">{users.total}</p>
          <p className="text-[11px] text-slate-500 font-medium font-bangla">
            {i18n.language === "en"
              ? `${users.farmers} Farmers • ${users.officers} Officers • ${users.admins} Admins`
              : `${users.farmers} কৃষক • ${users.officers} কর্মকর্তা • ${users.admins} অ্যাডমিন`}
          </p>
        </div>

        <div className="app-card-interactive p-5 rounded-2xl border border-slate-200 bg-white shadow-card space-y-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-700">
              {i18n.language === "en" ? "Total AI Recommendations" : "মোট এআই সুপারিশ"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <Sprout className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">{recommendations.total}</p>
          <p className="text-[11px] text-slate-500 font-medium font-bangla">
            {i18n.language === "en"
              ? `${recommendations.crop} Crop • ${recommendations.fertilizer} Fertilizer Plans`
              : `${recommendations.crop} ফসল • ${recommendations.fertilizer} সার পরিকল্পনা`}
          </p>
        </div>

        <div className="app-card-interactive p-5 rounded-2xl border border-slate-200 bg-white shadow-card space-y-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-700">
              {i18n.language === "en" ? "Agri Assistant Messages" : "কৃষি সহকারী বার্তা বিনিময়"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">{assistant.messages}</p>
          <p className="text-[11px] text-slate-500 font-medium font-bangla">
            {i18n.language === "en"
              ? `${assistant.sessions} active discussion sessions`
              : `${assistant.sessions} টি সক্রিয় আলোচনা সেশন`}
          </p>
        </div>

        <div className="app-card-interactive p-5 rounded-2xl border border-slate-200 bg-white shadow-card space-y-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold text-slate-700">
              {i18n.language === "en" ? "Audits & Corrections" : "পর্যালোচনা ও সংশোধন"}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">{audits.resolved} / {audits.flagged}</p>
          <p className="text-[11px] text-slate-500 font-medium font-bangla">
            {i18n.language === "en"
              ? `${audits.pending} pending reviews`
              : `${audits.pending} টি অপেক্ষমাণ পর্যালোচনা`}
          </p>
        </div>
      </div>

      {/* System Telemetry & Model Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 app-card bg-white p-6 rounded-3xl border border-slate-200 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-700" />
              <h2 className="text-sm font-extrabold text-slate-900">
                {i18n.language === "en" ? "AI/ML Core Architecture Telemetry" : "এআই/এমএল কোর সিস্টেম আর্কিটেকচার"}
              </h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-[10px] font-bold">
              {i18n.language === "en" ? "Service Active (Healthy)" : "সার্ভিস সক্রিয় (Healthy)"}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <p className="font-bold text-slate-900">
                  {i18n.language === "en" ? "Crop Recommendation Model" : "ফসল সুপারিশ মডেল"}
                </p>
                <p className="text-slate-600 text-[11px] font-mono">{system_health.ml_crop_model}</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <p className="font-bold text-slate-900">
                  {i18n.language === "en" ? "Balanced Fertilizer Prediction Model" : "সুষম সার প্রেডিকশন মডেল"}
                </p>
                <p className="text-slate-600 text-[11px] font-mono">{system_health.ml_fertilizer_model}</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <p className="font-bold text-slate-900">
                  {i18n.language === "en" ? "Vector Database (RAG)" : "ভেক্টর ডাটাবেজ (RAG)"}
                </p>
                <p className="text-slate-600 text-[11px] font-mono">{system_health.rag_vector_db}</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <p className="font-bold text-slate-900">
                  {i18n.language === "en" ? "Primary LLM Provider" : "প্রাইমারি এলএলএম প্রোভাইডার"}
                </p>
                <p className="text-slate-600 text-[11px] font-mono">{system_health.llm_primary}</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-900 border border-purple-200 text-[10px] font-bold font-mono">Groq Active</span>
            </div>
          </div>
        </div>

        {/* Live System Activity Feed */}
        <div className="lg:col-span-6 app-card bg-white p-6 rounded-3xl border border-slate-200 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-700" />
              <h2 className="text-sm font-extrabold text-slate-900">
                {i18n.language === "en" ? "Recent Platform Audit Log" : "সাম্প্রতিক প্ল্যাটফর্ম অডিট লগ"}
              </h2>
            </div>
            <Link
              to="/admin-portal/activity-logs"
              className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
            >
              <span>{i18n.language === "en" ? "View All Logs" : "সব লগ দেখুন"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {recent_activity.map((log: any) => (
              <div key={log.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-900">{log.action}: </span>
                  <span className="text-slate-700 font-medium">{log.description}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                  {new Date(log.created_at).toLocaleTimeString(i18n.language === "en" ? "en-US" : "bn-BD", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
