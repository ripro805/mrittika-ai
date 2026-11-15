import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import apiClient from "../../services/api";
import {
  Database,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Sparkles,
  TrendingUp,
  Cpu,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check,
  ShieldCheck,
  Eye,
  FileText,
  Tag,
  Hash,
} from "lucide-react";

interface CacheStats {
  total_cached: number;
  active_cached: number;
  expired_cached: number;
  invalidated_cached: number;
  verified_cached: number;
  flagged_cached: number;
  total_cache_hits: number;
  direct_api_calls: number;
  api_calls_saved: number;
  cache_hit_rate_percent: number;
  category_breakdown: Array<{ category: string; count: number; hits: number }>;
  top_questions: Array<any>;
}

interface CacheItem {
  id: string;
  original_question: string;
  normalized_question: string;
  language: string;
  category: string;
  category_display: string;
  crop_name: string;
  matching_type: string;
  model_name: string;
  hit_count: number;
  is_active: boolean;
  is_verified: boolean;
  verification_status: "VERIFIED" | "UNVERIFIED" | "FLAGGED" | "INVALIDATED";
  verification_status_display: string;
  verified_by?: string;
  invalidation_reason?: string;
  officer_notes?: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
  last_accessed_at: string;
  is_expired: boolean;
  has_embedding: boolean;
  response_text?: string;
  source_references?: any[];
  response_metadata?: any;
  fingerprint?: string;
  question_hash?: string;
  context_hash?: string;
}

export const AdminCacheManagementPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [items, setItems] = useState<CacheItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");

  // Inspection Modal
  const [activeModalItem, setActiveModalItem] = useState<CacheItem | null>(null);
  const [invalidationReason, setInvalidationReason] = useState("");
  const [officerNote, setOfficerNote] = useState("");

  const fetchStats = async () => {
    try {
      const res = await apiClient.get("/admin/cache/stats/");
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch cache stats:", err);
    }
  };

  const fetchCacheList = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const params: any = { page };
      if (search.trim()) params.search = search.trim();
      if (selectedCategory !== "all") params.category = selectedCategory;
      if (selectedStatus !== "all") params.status = selectedStatus;
      if (selectedLanguage !== "all") params.language = selectedLanguage;

      const res = await apiClient.get("/admin/cache/", { params });
      setItems(res.data.results || []);
      setTotalCount(res.data.total_count || 0);
      setTotalPages(res.data.total_pages || 1);
      setCurrentPage(res.data.current_page || 1);
    } catch (err: any) {
      setError("ক্যাশ উপাত্ত লোড করতে ব্যর্থ হয়েছে।");
      console.error("Failed to fetch cache list:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchCacheList(1);
  }, [selectedCategory, selectedStatus, selectedLanguage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCacheList(1);
  };

  const handleAction = async (id: string, action: "verify" | "invalidate" | "flag" | "delete") => {
    setIsActionLoading(true);
    setActionSuccess(null);
    setError(null);
    try {
      if (action === "delete") {
        await apiClient.delete(`/admin/cache/${id}/`);
        setActionSuccess("ক্যাশ এন্ট্রি সফলভাবে মুছে ফেলা হয়েছে।");
      } else {
        const payload: any = { action };
        if (action === "invalidate") {
          payload.reason = invalidationReason || "অ্যাডমিন ম্যানুয়াল ইনভ্যালিডেশন";
        }
        if (action === "flag") {
          payload.notes = officerNote || "পর্যালোচনার জন্য চিহ্নিত";
        }
        const res = await apiClient.post(`/admin/cache/${id}/action/`, payload);
        setActionSuccess(res.data.message || "সফলভাবে হালনাগাদ করা হয়েছে।");
      }

      if (activeModalItem?.id === id) {
        setActiveModalItem(null);
        setInvalidationReason("");
        setOfficerNote("");
      }

      await fetchStats();
      await fetchCacheList(currentPage);
    } catch (err: any) {
      setError(err.response?.data?.error || "অ্যাকশন সম্পন্ন করা যায়নি।");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleClearExpired = async () => {
    if (!window.confirm("আপনি কি নিশ্চিত যে সমস্ত মেয়াদোত্তীর্ণ ক্যাশ মুছে ফেলতে চান?")) return;
    setIsActionLoading(true);
    try {
      const res = await apiClient.post("/admin/cache/clear-expired/");
      setActionSuccess(res.data.message || "মেয়াদোত্তীর্ণ ক্যাশ মোছা হয়েছে।");
      fetchStats();
      fetchCacheList(1);
    } catch (err: any) {
      setError("মেয়াদোত্তীর্ণ ক্যাশ মুছতে ব্যর্থ হয়েছে।");
    } finally {
      setIsActionLoading(false);
    }
  };

  const getStatusBadge = (item: CacheItem) => {
    if (item.is_expired) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
          <Clock className="w-3.5 h-3.5 text-slate-600" /> মেয়াদোত্তীর্ণ (Expired)
        </span>
      );
    }
    switch (item.verification_status) {
      case "VERIFIED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> যাচাইকৃত (Verified)
          </span>
        );
      case "FLAGGED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> নিরীক্ষাধীন (Flagged)
          </span>
        );
      case "INVALIDATED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
            <XCircle className="w-3 h-3 text-red-600" /> বাতিলকৃত (Invalidated)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Sparkles className="w-3 h-3 text-blue-500" /> সক্রিয় (Active)
          </span>
        );
    }
  };

  const getCategoryLabel = (cat: string) => {
    const map: Record<string, string> = {
      GENERAL_FAQ: "সাধারণ কৃষি জিজ্ঞাসা",
      CROP_CULTIVATION: "ফসল চাষাবাদ",
      FERTILIZER_GUIDE: "সুষম সার নির্দেশিকা",
      PEST_DISEASE: "রোগ ও বালাই দমন",
      SEASONAL: "মৌসুমী পরামর্শ",
      WEATHER: "আবহাওয়া সতর্কতা",
      PERSONALIZED: "ব্যক্তিগত মাটি বিশ্লেষণ",
    };
    return map[cat] || cat;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="app-card bg-white rounded-3xl p-6 border border-slate-200 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-900 border border-purple-200 mb-2">
            <Database className="w-3.5 h-3.5 text-purple-700" />{" "}
            <span>{i18n.language === "en" ? "AI Infrastructure & Response Caching" : "এআই অবকাঠামো ও রেসপন্স ক্যাশিং"}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {i18n.language === "en"
              ? "Shared AI Response Cache & Latency Optimization"
              : "শেয়ার্ড এআই রেসপন্স ক্যাশ ও এপিআই অপ্টিমাইজেশন"}
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl font-bangla leading-relaxed">
            {i18n.language === "en"
              ? "Prevent duplicate external LLM calls, maximize sub-second query latency, and verify authoritative agronomic knowledge."
              : "একই প্রশ্নের বারবার এআই এপিআই কল প্রতিরোধ, দ্রুততম উত্তর প্রদান এবং কৃষিতাত্ত্বিক সঠিকতা নিশ্চিতে কেন্দ্রীয় ক্যাশ ব্যবস্থাপনা।"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleClearExpired}
            disabled={isActionLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-900 text-sm font-bold rounded-xl border border-red-200 transition-all cursor-pointer"
            title={i18n.language === "en" ? "Purge expired cache entries" : "মেয়াদোত্তীর্ণ ক্যাশ মুছে ডাটাবেস হালকা করুন"}
          >
            <Trash2 className="w-4 h-4 text-red-700" />
            {i18n.language === "en" ? "Purge Expired" : "মেয়াদোত্তীর্ণ মুছুন"}
          </button>
          <button
            onClick={() => {
              fetchStats();
              fetchCacheList(currentPage);
            }}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-sm font-bold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            {i18n.language === "en" ? "Refresh" : "রিফ্রেশ"}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-bold flex items-center justify-between font-bangla">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-700 hover:text-emerald-950 font-bold cursor-pointer">
            ×
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-sm font-bold flex items-center justify-between font-bangla">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-700 hover:text-red-950 font-bold cursor-pointer">
            ×
          </button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Cached */}
        <div className="app-card bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {i18n.language === "en" ? "Total Cached Q&A" : "মোট ক্যাশ প্রশ্ন"}
            </span>
            <div className="p-2 bg-purple-50 text-purple-700 rounded-xl border border-purple-200">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">{stats?.total_cached ?? 0}</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
            <span className="text-emerald-800 font-bold">{stats?.active_cached ?? 0}</span>{" "}
            {i18n.language === "en" ? "active cache entries" : "সক্রিয় ক্যাশ"}
          </div>
        </div>

        {/* Total Cache Hits / API Calls Saved */}
        <div className="app-card bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              {i18n.language === "en" ? "API Calls Saved" : "এপিআই কল সাশ্রয়"}
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-900 font-mono">
            {stats?.total_cache_hits ?? 0} {i18n.language === "en" ? "hits" : "বার"}
          </div>
          <div className="text-xs text-emerald-800 mt-1 font-semibold">
            {i18n.language === "en"
              ? `${stats?.api_calls_saved ?? 0} external LLM calls saved`
              : `${stats?.api_calls_saved ?? 0} টি বাহ্যিক এআই কল বাঁচানো হয়েছে`}
          </div>
        </div>

        {/* Hit Rate */}
        <div className="app-card bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
              {i18n.language === "en" ? "Cache Hit Rate" : "ক্যাশ হিট রেট"}
            </span>
            <div className="p-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-200">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-blue-900 font-mono">{stats?.cache_hit_rate_percent ?? 0}%</div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden border border-slate-200">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, stats?.cache_hit_rate_percent ?? 0)}%` }}
            />
          </div>
        </div>

        {/* Direct AI Calls */}
        <div className="app-card bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              {i18n.language === "en" ? "Direct LLM Calls" : "সরাসরি এআই কল"}
            </span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-950 font-mono">{stats?.direct_api_calls ?? 0}</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">
            {i18n.language === "en" ? "Unique/novel queries" : "নতুন বা অনুলিপিহীন প্রশ্ন"}
          </div>
        </div>

        {/* Verification Status */}
        <div className="app-card bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-800">
              {i18n.language === "en" ? "Audit & Verification" : "যাচাই ও নিরীক্ষা"}
            </span>
            <div className="p-2 bg-purple-50 text-purple-700 rounded-xl border border-purple-200">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900 flex items-center gap-2 font-mono">
            <span className="text-emerald-800 font-bold">{stats?.verified_cached ?? 0}</span>
            <span className="text-xs text-slate-400">/</span>
            <span className="text-amber-800 font-bold">{stats?.flagged_cached ?? 0}</span>
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">
            {i18n.language === "en" ? "Verified / Flagged reviews" : "যাচাইকৃত / ফ্ল্যাগকৃত নিরীক্ষা"}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="app-card bg-white p-4 rounded-2xl border border-slate-200 shadow-card space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="প্রশ্ন, ফসল বা উত্তরের বিবরণ দিয়ে খুঁজুন..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 focus:bg-white transition-all font-bangla"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white text-sm font-bold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            অনুসন্ধান
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-200 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 font-bold">
            <Filter className="w-3.5 h-3.5" /> ফিল্টার:
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-purple-600 cursor-pointer"
          >
            <option value="all">সকল ক্যাটাগরি (All Categories)</option>
            <option value="GENERAL_FAQ">সাধারণ কৃষি জিজ্ঞাসা</option>
            <option value="CROP_CULTIVATION">ফসল চাষাবাদ</option>
            <option value="FERTILIZER_GUIDE">সুষম সার নির্দেশিকা</option>
            <option value="PEST_DISEASE">রোগ ও বালাই দমন</option>
            <option value="SEASONAL">মৌসুমী পরামর্শ</option>
            <option value="WEATHER">আবহাওয়া সতর্কতা</option>
            <option value="PERSONALIZED">ব্যক্তিগত মাটি বিশ্লেষণ</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-purple-600 cursor-pointer"
          >
            <option value="all">সকল অবস্থা (All Status)</option>
            <option value="ACTIVE">সক্রিয় (Active)</option>
            <option value="VERIFIED">যাচাইকৃত (Verified)</option>
            <option value="UNVERIFIED">অযাচাইকৃত (Unverified)</option>
            <option value="FLAGGED">নিরীক্ষাধীন (Flagged)</option>
            <option value="INVALIDATED">বাতিলকৃত (Invalidated)</option>
            <option value="EXPIRED">মেয়াদোত্তীর্ণ (Expired)</option>
          </select>

          {/* Language Filter */}
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-purple-600 cursor-pointer"
          >
            <option value="all">ভাষা: সকল (All)</option>
            <option value="bn">বাংলা (bn)</option>
            <option value="en">English (en)</option>
          </select>

          <span className="ml-auto text-slate-600 font-medium">
            মোট ফলাফল: <strong className="text-slate-900 font-mono">{totalCount}</strong>
          </span>
        </div>
      </div>

      {/* Cache Table */}
      <div className="app-card overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-600 font-bangla">
            <RefreshCw className="w-8 h-8 text-purple-700 animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold">ক্যাশ ডাটা লোড হচ্ছে...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-slate-600 font-bangla">
            <Database className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-800">কোনো ক্যাশ এন্ট্রি পাওয়া যায়নি</p>
            <p className="text-xs text-slate-500 mt-1">
              ব্যবহারকারীরা চ্যাটবটে প্রশ্ন জিজ্ঞেস করলে উত্তর এখানে স্বয়ংক্রিয়ভাবে সংরক্ষিত হবে।
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <th className="py-3.5 px-4">প্রশ্ন ও ক্যাটাগরি</th>
                  <th className="py-3.5 px-3">ভাষা / ফসল</th>
                  <th className="py-3.5 px-3 text-center">হিট সংখ্যা</th>
                  <th className="py-3.5 px-3">অবস্থা</th>
                  <th className="py-3.5 px-3">মেয়াদ শেষ</th>
                  <th className="py-3.5 px-4 text-right">পদক্ষেপ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 max-w-md">
                      <div className="font-bold text-slate-900 line-clamp-1 font-bangla">{item.original_question}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                          {getCategoryLabel(item.category)}
                        </span>
                        {item.has_embedding && (
                          <span className="text-[10px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                            ভেক্টর ইনডেক্সড
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="text-xs font-bold text-slate-800">
                        {item.language === "bn" ? "বাংলা" : "English"}
                      </div>
                      <div className="text-xs font-medium text-slate-500">{item.crop_name || "সার্বজনীন"}</div>
                    </td>

                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {item.hit_count} বার
                      </span>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">{getStatusBadge(item)}</td>

                    <td className="py-3.5 px-3 text-xs font-medium text-slate-600 whitespace-nowrap">
                      {item.expires_at ? new Date(item.expires_at).toLocaleDateString("bn-BD") : "সীমাহীন"}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setActiveModalItem(item)}
                          className="p-1.5 text-slate-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all cursor-pointer"
                          title="বিস্তারিত পরিদর্শন করুন"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {!item.is_verified && item.verification_status !== "INVALIDATED" && (
                          <button
                            onClick={() => handleAction(item.id, "verify")}
                            disabled={isActionLoading}
                            className="p-1.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition-all cursor-pointer"
                            title="যাচাইকৃত হিসেবে মার্ক করুন"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleAction(item.id, "delete")}
                          disabled={isActionLoading}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="py-3 px-4 border-t border-slate-200 flex items-center justify-between text-xs font-medium text-slate-700 bg-slate-50 font-bangla">
            <div>
              পৃষ্ঠা <strong className="text-slate-900 font-bold">{currentPage}</strong> এর <strong className="text-slate-900 font-bold">{totalPages}</strong> (মোট {totalCount} টি প্রশ্ন)
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => fetchCacheList(currentPage - 1)}
                disabled={currentPage <= 1 || isLoading}
                className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer text-slate-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => fetchCacheList(currentPage + 1)}
                disabled={currentPage >= totalPages || isLoading}
                className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 transition-all cursor-pointer text-slate-700"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details & Invalidation Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="app-card max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {getStatusBadge(activeModalItem)}
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                    {getCategoryLabel(activeModalItem.category)}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 font-bangla">ক্যাশ এন্ট্রি বিস্তারিত ও পরিদর্শন</h3>
              </div>
              <button
                onClick={() => setActiveModalItem(null)}
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Questions Comparison */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1">মূল প্রশ্ন (Original Query):</span>
                <p className="text-sm font-bold text-slate-900 font-bangla">{activeModalItem.original_question}</p>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  নরমালাইজড প্রশ্ন (Normalized Text):
                </span>
                <p className="font-mono text-xs text-slate-800 bg-white p-2 rounded border border-slate-200">{activeModalItem.normalized_question}</p>
              </div>
              <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-4 text-slate-700 font-bangla">
                <div>
                  <span className="font-bold text-slate-900">মডেল:</span> {activeModalItem.model_name || "Groq / Gemini"}
                </div>
                <div>
                  <span className="font-bold text-slate-900">হিট সংখ্যা:</span> {activeModalItem.hit_count} বার
                </div>
                <div>
                  <span className="font-bold text-slate-900">মেয়াদ শেষ:</span>{" "}
                  {new Date(activeModalItem.expires_at).toLocaleString("bn-BD")}
                </div>
              </div>
            </div>

            {/* Cached AI Response */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-purple-700" /> সংরক্ষিত এআই উত্তর (Cached Answer):
              </span>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm leading-relaxed text-slate-800 font-bangla whitespace-pre-wrap max-h-60 overflow-y-auto">
                {activeModalItem.response_text}
              </div>
            </div>

            {/* Source References */}
            {activeModalItem.source_references && activeModalItem.source_references.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  কৃষি গবেষণা তথ্যসূত্র (Sources & Citations):
                </span>
                <div className="space-y-1.5 font-bangla">
                  {activeModalItem.source_references.map((src, i) => (
                    <div key={i} className="text-xs p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-800">
                      <strong className="text-slate-900 font-bold">{src.filename || src.source}</strong> (পৃষ্ঠা: {src.page || "১"}): {src.snippet}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={invalidationReason}
                  onChange={(e) => setInvalidationReason(e.target.value)}
                  placeholder="বাতিলের কারণ লিখুন (যদি বাতিল করতে চান)..."
                  className="app-input flex-1 text-slate-900 placeholder:text-slate-400 font-bangla text-xs"
                />
                <button
                  onClick={() => handleAction(activeModalItem.id, "invalidate")}
                  disabled={isActionLoading}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  উত্তর বাতিল করুন (Invalidate)
                </button>
              </div>

              <div className="flex justify-end gap-3 font-bangla">
                <button
                  onClick={() => setActiveModalItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl cursor-pointer"
                >
                  বন্ধ করুন
                </button>
                {!activeModalItem.is_verified && (
                  <button
                    onClick={() => handleAction(activeModalItem.id, "verify")}
                    disabled={isActionLoading}
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> সঠিক ও যাচাইকৃত মার্ক করুন
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
