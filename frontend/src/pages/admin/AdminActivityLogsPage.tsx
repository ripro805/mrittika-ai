import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { i18n } = useTranslation();
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
        setError(i18n.language === "en" ? "Failed to load activity logs." : "অ্যাক্টিভিটি লগ লোড করা যায়নি।");
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
    <div className="space-y-6 w-full max-w-[1680px] 2xl:max-w-[1760px] mx-auto">
      {/* Title & Action Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-800 text-xs font-bold border border-purple-200/80 mb-2">
            <Shield className="w-3.5 h-3.5 text-purple-600" />
            <span>{i18n.language === "en" ? "System Audit Trail" : "সিস্টেম অডিট ট্রেইল"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1d1d1f] tracking-tight font-bangla flex items-center gap-2.5">
            <ScrollText className="w-7 h-7 text-purple-700 shrink-0" />
            <span>{i18n.language === "en" ? "System Audit & Activity Logs" : "সিস্টেম অডিট ও অ্যাক্টিভিটি লগ"}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#86868b] font-bangla mt-1">
            {i18n.language === "en"
              ? "Comprehensive audit trail of user actions, model inferences, officer corrections, and security events"
              : "ব্যবহারকারী অ্যাকশন, মডেল ইনফারেন্স, কর্মকর্তা সংশোধন এবং নিরাপত্তা সংক্রান্ত সম্পূর্ণ অডিট ট্রেইল"}
          </p>
        </div>

        {/* Action Filters (Apple Segmented Pill Container) */}
        <div className="inline-flex rounded-full bg-black/[0.04] p-1 border border-black/[0.04] text-xs font-semibold overflow-x-auto max-w-full">
          <button
            onClick={() => setActionFilter("")}
            className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
              actionFilter === ""
                ? "bg-white text-[#1d1d1f] shadow-2xs font-bold"
                : "text-[#86868b] hover:text-[#1d1d1f]"
            }`}
          >
            {i18n.language === "en" ? `All Logs (${totalCount})` : `সব লগ (${totalCount})`}
          </button>
          <button
            onClick={() => setActionFilter("USER_LOGIN")}
            className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
              actionFilter === "USER_LOGIN"
                ? "bg-purple-700 text-white shadow-2xs font-bold"
                : "text-[#86868b] hover:text-[#1d1d1f]"
            }`}
          >
            {i18n.language === "en" ? "Login" : "লগইন"}
          </button>
          <button
            onClick={() => setActionFilter("CROP_RECOMMEND")}
            className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
              actionFilter === "CROP_RECOMMEND"
                ? "bg-emerald-700 text-white shadow-2xs font-bold"
                : "text-[#86868b] hover:text-[#1d1d1f]"
            }`}
          >
            {i18n.language === "en" ? "Crop Recommendation" : "ফসল সুপারিশ"}
          </button>
          <button
            onClick={() => setActionFilter("FERTILIZER_RECOMMEND")}
            className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
              actionFilter === "FERTILIZER_RECOMMEND"
                ? "bg-amber-700 text-white shadow-2xs font-bold"
                : "text-[#86868b] hover:text-[#1d1d1f]"
            }`}
          >
            {i18n.language === "en" ? "Fertilizer Plan" : "সার হিসাব"}
          </button>
          <button
            onClick={() => setActionFilter("OFFICER_CORRECTION")}
            className={`px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
              actionFilter === "OFFICER_CORRECTION"
                ? "bg-teal-700 text-white shadow-2xs font-bold"
                : "text-[#86868b] hover:text-[#1d1d1f]"
            }`}
          >
            {i18n.language === "en" ? "Officer Correction" : "কর্মকর্তা সংশোধন"}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-[24px] border border-black/[0.06] shadow-apple">
        <div className="relative">
          <Search className="w-4 h-4 text-[#86868b] absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder={i18n.language === "en" ? "Search audit logs by description or IP address..." : "বিবরণ বা আইপি অ্যাড্রেস দিয়ে অডিট লগ খুঁজুন..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#fbfbfd] border border-black/10 rounded-2xl text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 focus:bg-white transition-all font-bangla"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-[28px] border border-black/[0.06] shadow-apple overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-[#86868b] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-purple-700" />
            <span className="text-sm font-semibold font-bangla">
              {i18n.language === "en" ? "Loading audit logs..." : "অডিট লগ লোড হচ্ছে..."}
            </span>
          </div>
        ) : error ? (
          <div className="p-10 text-center flex flex-col items-center justify-center gap-2 text-rose-700 font-semibold font-bangla">
            <AlertCircle className="w-8 h-8" />
            <span>{error}</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-[#86868b] font-medium font-bangla text-sm">
            {i18n.language === "en" ? "No audit log records found." : "কোনো অডিট লগ রেকর্ড পাওয়া যায়নি।"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#fbfbfd] text-[#1d1d1f] font-bold border-b border-black/[0.05]">
                <tr>
                  <th className="px-6 py-4">{i18n.language === "en" ? "Action Type" : "অ্যাকশন টাইপ"}</th>
                  <th className="px-6 py-4">{i18n.language === "en" ? "Audit Event Description" : "বিবরণ (Audit Event)"}</th>
                  <th className="px-6 py-4">{i18n.language === "en" ? "IP Address" : "আইপি অ্যাড্রেস"}</th>
                  <th className="px-6 py-4 text-right">{i18n.language === "en" ? "Timestamp" : "সময় ও তারিখ"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-black/[0.02] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                          log.action === "USER_LOGIN"
                            ? "bg-purple-50 text-purple-800 border-purple-200/80"
                            : log.action === "CROP_RECOMMEND"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200/80"
                            : log.action === "FERTILIZER_RECOMMEND"
                            ? "bg-amber-50 text-amber-800 border-amber-200/80"
                            : log.action === "OFFICER_CORRECTION"
                            ? "bg-teal-50 text-teal-800 border-teal-200/80"
                            : "bg-black/[0.04] text-[#1d1d1f] border-black/[0.06]"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#1d1d1f] font-medium font-bangla max-w-md leading-relaxed">
                      {log.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-mono text-xs bg-black/[0.03] text-[#1d1d1f] px-2.5 py-1 rounded-full border border-black/[0.06]">
                        <Laptop className="w-3 h-3 text-[#86868b]" />
                        {log.ip || "127.0.0.1"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap text-[#86868b] font-mono text-xs">
                      <div className="flex items-center justify-end gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#86868b]" />
                        <span>{new Date(log.created_at).toLocaleString(i18n.language === "en" ? "en-US" : "bn-BD")}</span>
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