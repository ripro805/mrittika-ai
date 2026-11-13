import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import apiClient from "../services/api";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Send,
  MessageSquare,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export const OfficerDashboardPage: React.FC = () => {
  const { role, user } = useAuth();
  const [flaggedList, setFlaggedList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [correctionTexts, setCorrectionTexts] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<number | null>(null);

  const fetchFlagged = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get("/officer/feedback/flagged");
      setFlaggedList(res.data || []);
    } catch {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlagged();
  }, []);

  const handleCorrectionSubmit = async (id: number) => {
    const text = correctionTexts[id];
    if (!text || text.trim().length < 5) {
      alert("সংশোধন বার্তা অন্তত ৫ অক্ষরের হতে হবে।");
      return;
    }

    setIsSubmitting(id);
    try {
      await apiClient.post(`/officer/feedback/${id}/correction`, {
        officer_correction: text.trim(),
      });
      alert("সংশোধন সফলভাবে সংরক্ষিত হয়েছে।");
      fetchFlagged();
    } catch {
      alert("সংশোধন সংরক্ষণ করা যায়নি।");
    } finally {
      setIsSubmitting(null);
    }
  };

  if (role !== "OFFICER" && role !== "ADMIN") {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-600 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900">অননুমোদিত প্রবেশাধিকার</h2>
        <p className="text-xs text-gray-500">
          এই পৃষ্ঠাটি শুধুমাত্র যাচাইকৃত উপজেলা কৃষি কর্মকর্তা ও প্রশাসকদের জন্য সংরক্ষিত।
        </p>
      </div>
    );
  }

  // Aggregate Chart Data
  const resolvedCount = flaggedList.filter((f) => f.is_resolved).length;
  const pendingCount = flaggedList.filter((f) => !f.is_resolved).length;
  const chartData = [
    { name: "অপেক্ষমান (Pending)", count: pendingCount, color: "#f59e0b" },
    { name: "যাচাইকৃত (Resolved)", count: resolvedCount, color: "#10b981" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mrittika-100 text-mrittika-900 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-mrittika-800" />
            <span>উপজেলা কৃষি কর্মকর্তা ড্যাশবোর্ড</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            কৃষক ফিডব্যাক ও এআই পরামর্শ নিরীক্ষা
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            কৃষকদের ফ্ল্যাগ করা প্রশ্ন এবং মডেলের উত্তর পর্যালোচনা করে সঠিক কৃষি বার্তা যুক্ত করুন।
          </p>
        </div>
      </div>

      {/* Aggregate Statistics Chart */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-mrittika-800" />
          <span>পর্যালোচনা পরিসংখ্যান (Audit Analytics)</span>
        </h3>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 40, right: 40 }}>
              <XAxis type="number" allowDecimals={false} />
              <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Flagged Items List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-gray-900">
          পর্যালোচনার জন্য অপেক্ষমান প্রশ্নোত্তর ({flaggedList.length})
        </h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-mrittika-700" />
          </div>
        ) : flaggedList.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center border border-gray-200 text-gray-500 text-sm">
            বর্তমানে কোনো ফ্ল্যাগ করা প্রতিক্রিয়া পর্যালোচনার অপেক্ষায় নেই।
          </div>
        ) : (
          <div className="space-y-4">
            {flaggedList.map((item) => (
              <div
                key={item.id}
                className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
                      মডিউল: {item.module_type}
                    </span>
                    <span className="text-xs text-gray-400">
                      কৃষক: {item.user_name || "অতিথি কৃষক"} ({item.user_phone || "N/A"})
                    </span>
                  </div>

                  {item.is_resolved ? (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-200">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>যাচাই সম্পন্ন</span>
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full flex items-center gap-1 border border-amber-200">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>অপেক্ষমান</span>
                    </span>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs sm:text-sm text-gray-800 space-y-1">
                  <span className="font-bold text-gray-500 text-[11px] block">কৃষকের মন্তব্য বা সমস্যা:</span>
                  <p>{item.comment || "সিস্টেম রেটিং কম থাকায় পর্যালোচনার জন্য এসেছে।"}</p>
                </div>

                {/* Existing correction if resolved */}
                {item.officer_correction && (
                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-xs sm:text-sm text-emerald-950 space-y-1">
                    <span className="font-bold text-emerald-800 text-[11px] block">
                      কর্মকর্তার প্রদত্ত সঠিক নির্দেশনা (প্রদানকারী: {item.corrected_by_name || "কৃষি কর্মকর্তা"}):
                    </span>
                    <p>{item.officer_correction}</p>
                  </div>
                )}

                {/* Correction input form */}
                {!item.is_resolved && (
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <label className="block text-xs font-bold text-gray-700">
                      কর্মকর্তার আনুষ্ঠানিক সংশোধন ও সুপারিশ লিখুন:
                    </label>
                    <textarea
                      rows={2}
                      value={correctionTexts[item.id] || ""}
                      onChange={(e) =>
                        setCorrectionTexts({ ...correctionTexts, [item.id]: e.target.value })
                      }
                      placeholder="সঠিক সার, উপযুক্ত কীটনাশক ব্যবস্থাপনা বা সতর্কতা প্রদান করুন..."
                      className="w-full p-3 border border-gray-300 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-mrittika-500"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleCorrectionSubmit(item.id)}
                        disabled={isSubmitting === item.id}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-mrittika-800 hover:bg-mrittika-900 text-white text-xs font-bold shadow-sm"
                      >
                        {isSubmitting === item.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span>সংশোধন জমা দিন</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
