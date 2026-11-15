import React, { useEffect, useState } from "react";
import apiClient from "../../services/api";
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Shield,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react";

export const AdminUserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchUsers = () => {
    setIsLoading(true);
    let url = `/admin/users?limit=100`;
    if (roleFilter) url += `&role=${roleFilter}`;
    if (searchQuery.trim()) url += `&search=${encodeURIComponent(searchQuery.trim())}`;

    apiClient
      .get(url)
      .then((res) => {
        setUsers(res.data.users || []);
        setTotalCount(res.data.total || 0);
      })
      .catch(() => {
        setError("ব্যবহারকারী তালিকা লোড করা যায়নি।");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 200);
    return () => clearTimeout(timer);
  }, [roleFilter, searchQuery]);

  const handleToggleActive = async (userId: number, currentActive: boolean) => {
    try {
      await apiClient.patch(`/admin/users/${userId}`, {
        is_active: !currentActive,
      });
      setActionSuccess("ব্যবহারকারীর সক্রিয়তা স্ট্যাটাস সফলভাবে পরিবর্তিত হয়েছে।");
      fetchUsers();
    } catch {
      setError("স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-700" />
            <span>ব্যবহারকারী ও ভূমিকা ব্যবস্থাপনা (User Management)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-bangla">
            সমগ্র প্ল্যাটফর্মের কৃষক, উপজেলা কৃষি কর্মকর্তা এবং অ্যাডমিন অ্যাকাউন্ট নিয়ন্ত্রণ ও পর্যবেক্ষণ
          </p>
        </div>

        {/* Role Filters */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setRoleFilter("")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              roleFilter === "" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            সব ({totalCount})
          </button>
          <button
            onClick={() => setRoleFilter("FARMER")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              roleFilter === "FARMER" ? "bg-white text-emerald-900 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            কৃষক
          </button>
          <button
            onClick={() => setRoleFilter("OFFICER")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              roleFilter === "OFFICER" ? "bg-white text-teal-900 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            কর্মকর্তা
          </button>
          <button
            onClick={() => setRoleFilter("ADMIN")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              roleFilter === "ADMIN" ? "bg-white text-purple-900 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            অ্যাডমিন
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 font-bold font-bangla">
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="app-card bg-white p-4 rounded-2xl border border-slate-200 shadow-card">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="নাম, মোবাইল নম্বর বা জেলা দিয়ে ব্যবহারকারী খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 focus:outline-none font-bangla"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="app-card bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-purple-700" />
            <span>ব্যবহারকারী তালিকা লোড হচ্ছে...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">কোনো ব্যবহারকারী পাওয়া যায়নি।</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">পূর্ণ নাম ও নম্বর</th>
                  <th className="px-6 py-3.5">ভূমিকা (Role)</th>
                  <th className="px-6 py-3.5">অঞ্চল (জেলা / উপজেলা)</th>
                  <th className="px-6 py-3.5">স্ট্যাটাস</th>
                  <th className="px-6 py-3.5 text-right">কার্যক্রম</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{u.name}</p>
                      <p className="text-xs text-slate-500 font-mono">{u.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          u.role === "ADMIN"
                            ? "bg-purple-50 text-purple-900 border-purple-200"
                            : u.role === "OFFICER"
                            ? "bg-teal-50 text-teal-900 border-teal-200"
                            : "bg-emerald-50 text-emerald-900 border-emerald-200"
                        }`}
                      >
                        {u.role === "ADMIN" ? "অ্যাডমিন" : u.role === "OFFICER" ? "কর্মকর্তা" : "কৃষক"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {u.district ? `${u.district}, ${u.upazila || "সদর"}` : "অনির্ধারিত"}
                    </td>
                    <td className="px-6 py-4">
                      {u.is_verified ? (
                        <span className="inline-flex items-center gap-1 text-emerald-800 font-bold text-xs">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>যাচাইকৃত</span>
                        </span>
                      ) : (
                        <span className="text-slate-700 text-xs font-bold font-bangla bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">সাধারণ</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleActive(u.id, true)}
                        className="px-3 py-1 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                      >
                        সম্পাদনা
                      </button>
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
