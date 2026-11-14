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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <ScrollText className="w-6 h-6 text-purple-700" />
            <span>সিস্টেম অডিট ও অ্যাক্টিভিটি লগ (System Activity Logs)</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            ব্যবহারকারী অ্যাকশন, মডেল ইনফারেন্স, কর্মকর্তা সংশোধন এবং নিরাপত্তা সংক্রান্ত সম্পূর্ণ অডিট ট্রেইল
          </p>
        </div>

        {/* Action Filters */}
        <div className="inline-flex rounded-xl bg-gray-100 p-1 border border-gray-200 text-xs font-semibold overflow-x-auto max-w-full">
          <button
            onClick={() => setActionFilter("")}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
              actionFilter === "" ? "bg-white text-gray-900 shadow-xs" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            সব লগ ({totalCount})
          </button>
          <button
            onClick={() => setActionFilter("USER_LOGIN")}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
              actionFilter === "USER_LOGIN" ? "bg-white text-purple-800 shadow-xs" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            লগইন
          </button>
          <button
            onClick={() => setActionFilter("CROP_RECOMMEND")}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
              actionFilter === "CROP_RECOMMEND" ? "bg-white text-emerald-800 shadow-xs" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            ফসল সুপারিশ
          </button>
          <button
            onClick={() => setActionFilter("FERTILIZER_RECOMMEND")}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
              actionFilter === "FERTILIZER_RECOMMEND" ? "bg-white text-amber-800 shadow-xs" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            সার হিসাব
          </button>
          <button
            onClick={() => setActionFilter("OFFICER_CORRECTION")}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
              actionFilter === "OFFICER_CORRECTION" ? "bg-white text-teal-800 shadow-xs" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            কর্মকর্তা সংশোধন
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="বিবরণ বা আইপি অ্যাড্রেস দিয়ে লগ খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            <span>অডিট লগ লোড হচ্ছে...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400">কোনো লগ রেকর্ড পাওয়া যায়নি।</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50/75 text-gray-600 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3.5">অ্যাকশন টাইপ</th>
                  <th className="px-6 py-3.5">বিবরণ (Audit Event)</th>
                  <th className="px-6 py-3.5">আইপি অ্যাড্রেস</th>
                  <th className="px-6 py-3.5 text-right">সময় ও তারিখ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          log.action === "USER_LOGIN"
                            ? "bg-purple-100 text-purple-800"
                            : log.action === "CROP_RECOMMEND"
                            ? "bg-emerald-100 text-emerald-800"
                            : log.action === "FERTILIZER_RECOMMEND"
                            ? "bg-amber-100 text-amber-800"
                            : log.action === "OFFICER_CORRECTION"
                            ? "bg-teal-100 text-teal-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-800 font-medium max-w-md">
                      {log.description}
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                      {log.ip || "127.0.0.1"}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-400 text-xs">
                      {new Date(log.created_at).toLocaleString("bn-BD")}
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
