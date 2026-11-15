import React, { useEffect, useState } from "react";
import apiClient from "../../services/api";
import {
  ScrollText,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  Clock,
  Shield,
  Activity,
  Laptop,
} from "lucide-react";

export const AdminActivityLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [actionFilter, setActionFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = () => {
    setIsLoading(true);
    let url = `/admin/activity-logs?limit=100`;
    if (actionFilter) url += `&action=${actionFilter}`;
    if (searchQuery.trim()) url += `&search=${encodeURIComponent(searchQuery.trim())}`;

    apiClient
      .get(url)
      .then((res) => {
        setLogs(res.data.logs || []);
        setTotalCount(res.data.total || 0);
      })
      .catch(() => {
        setError("অ্যাক্টিভিটি লগ লোড করা যায়নি।");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
    }, 200);
    return () => clearTimeout(timer);
  }, [actionFilter, searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-800 text-xs font-bold border border-purple-200 mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>সিস্টেম অডিট ট্রেইল (Audit Trail)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-bangla flex items-center gap-2.5">
            <ScrollText className="w-7 h-7 text-purple-700 shrink-0" />
            <span>সিস্টেম অডিট ও অ্যাক্টিভিটি লগ</span>
          </h1>
          <p className="text-sm text-slate-600 font-medium font-bangla mt-1">
            ব্যবহারকারী অ্যাকশন, মডেল ইনফারেন্স, কর্মকর্তা সংশোধন এবং নিরাপত্তা সংক্রান্ত সম্পূর্ণ অডিট ট্রেইল
          </p>
        </div>

        {/* Action Filters */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1.5 border border-slate-200 text-xs font-bold overflow-x-auto max-w-full shadow-inner">
          <button
            onClick={() => setActionFilter("")}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              actionFilter === ""
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            সব লগ ({totalCount})
          </button>
          <button
            onClick={() => setActionFilter("USER_LOGIN")}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              actionFilter === "USER_LOGIN"
                ? "bg-purple-700 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            লগইন
          </button>
          <button
            onClick={() => setActionFilter("CROP_RECOMMEND")}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              actionFilter === "CROP_RECOMMEND"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            ফসল সুপারিশ
          </button>
          <button
            onClick={() => setActionFilter("FERTILIZER_RECOMMEND")}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              actionFilter === "FERTILIZER_RECOMMEND"
                ? "bg-amber-700 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            সার হিসাব
          </button>
          <button
            onClick={() => setActionFilter("OFFICER_CORRECTION")}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              actionFilter === "OFFICER_CORRECTION"
                ? "bg-teal-700 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            কর্মকর্তা সংশোধন
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="app-card p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="বিবরণ বা আইপি অ্যাড্রেস দিয়ে অডিট লগ খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="app-input pl-10 text-slate-900 placeholder:text-slate-500 font-bangla text-sm"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="app-card overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-600 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-purple-700" />
            <span className="text-sm font-semibold font-bangla">অডিট লগ লোড হচ্ছে...</span>
          </div>
        ) : error ? (
          <div className="p-10 text-center flex flex-col items-center justify-center gap-2 text-rose-700 font-semibold font-bangla">
            <AlertCircle className="w-8 h-8" />
            <span>{error}</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-medium font-bangla text-sm">
            কোনো অডিট লগ রেকর্ড পাওয়া যায়নি।
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">অ্যাকশন টাইপ</th>
                  <th className="px-6 py-4">বিবরণ (Audit Event)</th>
                  <th className="px-6 py-4">আইপি অ্যাড্রেস</th>
                  <th className="px-6 py-4 text-right">সময় ও তারিখ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                          log.action === "USER_LOGIN"
                            ? "bg-purple-50 text-purple-800 border-purple-200"
                            : log.action === "CROP_RECOMMEND"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : log.action === "FERTILIZER_RECOMMEND"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : log.action === "OFFICER_CORRECTION"
                            ? "bg-teal-50 text-teal-800 border-teal-200"
                            : "bg-slate-100 text-slate-800 border-slate-200"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-800 font-medium font-bangla max-w-md leading-relaxed">
                      {log.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                        <Laptop className="w-3 h-3 text-slate-400" />
                        {log.ip || "127.0.0.1"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap text-slate-500 font-bangla text-xs">
                      <div className="flex items-center justify-end gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(log.created_at).toLocaleString("bn-BD")}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
