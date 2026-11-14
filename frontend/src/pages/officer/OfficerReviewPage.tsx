import React, { useEffect, useState } from "react";
import apiClient from "../../services/api";
import {
  ShieldAlert,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  Check,
} from "lucide-react";

export const OfficerReviewPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "resolved">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeItem, setActiveItem] = useState<any | null>(null);
  const [correctionText, setCorrectionText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchItems = () => {
    setIsLoading(true);
    apiClient
      .get("/officer/feedback/flagged")
      .then((res) => {
        setItems(res.data || []);
        if (res.data && res.data.length > 0 && !activeItem) {
          setActiveItem(res.data[0]);
          setCorrectionText(res.data[0].officer_correction || "");
        }
      })
      .catch(() => {
        setErrorMessage("ফ্ল্যাগকৃত ডাটা লোড করতে সমস্যা হয়েছে।");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSelectItem = (item: any) => {
    setActiveItem(item);
    setCorrectionText(item.officer_correction || "");
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleSubmitCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem || !correctionText.trim()) return;

    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await apiClient.post(`/officer/feedback/${activeItem.id}/correction`, {
        officer_correction: correctionText.trim(),
      });
      setSuccessMessage("সংশোধনী সফলভাবে সংরক্ষিত ও অনুমোদিত হয়েছে!");
      // Update item in local list
      setItems((prev) =>
        prev.map((it) => (it.id === activeItem.id ? res.data.feedback : it))
      );
      setActiveItem(res.data.feedback);
    } catch {
      setErrorMessage("সংশোধনী সংরক্ষণ ব্যর্থ হয়েছে। দয়া করে পুনরায় চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = items.filter((it) => {
    if (filterStatus === "pending" && it.is_resolved) return false;
    if (filterStatus === "resolved" && !it.is_resolved) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const question = it.context_data?.question?.toLowerCase() || "";
      const comment = it.comment?.toLowerCase() || "";
      return question.includes(q) || comment.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-600" />
            <span>ফ্ল্যাগকৃত প্রশ্নোত্তর নিরীক্ষা ও সংশোধন কেন্দ্র</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            কৃষকের চিহ্নিত ত্রুটিপূর্ণ উত্তরসমূহ বৈজ্ঞানিকভাবে যাচাই করুন এবং সঠিক দিকনির্দেশনা প্রদান করুন।
          </p>
        </div>

        {/* Filter Pills */}
        <div className="inline-flex rounded-xl bg-gray-100 p-1 border border-gray-200 text-xs font-semibold">
          <button
            onClick={() => setFilterStatus("pending")}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterStatus === "pending" ? "bg-white text-red-700 shadow-xs" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            অপেক্ষমাণ ({items.filter((i) => !i.is_resolved).length})
          </button>
          <button
            onClick={() => setFilterStatus("resolved")}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterStatus === "resolved" ? "bg-white text-emerald-700 shadow-xs" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            সমাধানকৃত ({items.filter((i) => i.is_resolved).length})
          </button>
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterStatus === "all" ? "bg-white text-gray-900 shadow-xs" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            সব ({items.length})
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: List of Flagged Items */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden flex flex-col h-[700px]">
          {/* Search box */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="প্রশ্ন বা মন্তব্য খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Items list */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-gray-400">লোড হচ্ছে...</div>
            ) : filteredItems.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">কোনো প্রশ্নোত্তর মেলেনি।</div>
            ) : (
              filteredItems.map((item) => {
                const isSelected = activeItem?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className={`w-full text-left p-4 transition flex flex-col gap-1.5 ${
                      isSelected
                        ? "bg-teal-50/80 border-l-4 border-teal-700"
                        : "hover:bg-gray-50/70"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.is_resolved
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.is_resolved ? "সমাধানকৃত" : "অপেক্ষমাণ"}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {new Date(item.created_at).toLocaleDateString("bn-BD")}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-gray-900 line-clamp-2">
                      {item.context_data?.question || item.comment || `ফিডব্যাক #${item.id}`}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      মডিউল: {item.module_type} • রেটিং: {item.rating}★
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Inspector and Correction Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-200 shadow-xs p-6 space-y-6">
          {activeItem ? (
            <>
              {/* Feedback Status Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      activeItem.is_resolved
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {activeItem.is_resolved ? "সমাধান সম্পন্ন হয়েছে" : "পর্যালোচনা অপেক্ষমাণ"}
                  </span>
                  <span className="text-xs font-medium text-gray-500">
                    আইডি: #{activeItem.id}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  তারিখ: {new Date(activeItem.created_at).toLocaleString("bn-BD")}
                </span>
              </div>

              {/* Farmer's Context */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  ১. কৃষকের মূল প্রশ্ন / প্রেক্ষাপট
                </h3>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-900 leading-relaxed">
                  {activeItem.context_data?.question || activeItem.comment || "বিবরণ উপলব্ধ নেই।"}
                </div>
              </div>

              {/* AI's Generated Answer */}
              {activeItem.context_data?.assistant_response && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    ২. এআই মডেলের প্রাথমিক উত্তর (যা ফ্ল্যাগ করা হয়েছে)
                  </h3>
                  <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 text-xs sm:text-sm text-gray-800 leading-relaxed max-h-48 overflow-y-auto">
                    {activeItem.context_data.assistant_response}
                  </div>
                </div>
              )}

              {/* Alert Feedback Messages */}
              {successMessage && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Officer Correction Form */}
              <form onSubmit={handleSubmitCorrection} className="space-y-4 pt-2 border-t border-gray-100">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-teal-900 uppercase tracking-wider">
                    ৩. কৃষি কর্মকর্তার অনুমোদিত সঠিক পরামর্শ (Authoritative Agronomic Note)
                  </label>
                  <textarea
                    rows={4}
                    value={correctionText}
                    onChange={(e) => setCorrectionText(e.target.value)}
                    placeholder="মাঠ পর্যায়ের বাস্তব অভিজ্ঞতা ও বাংলাদেশ কৃষি গবেষণা কাউন্সিল (BARC) অনুসারে সঠিক ডোজ, পদ্ধতি ও সময়সূচী লিখুন..."
                    className="w-full p-4 rounded-2xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-teal-600 focus:outline-none"
                    required
                  />
                  <p className="text-[11px] text-gray-500">
                    এই সংশোধনীটি সংরক্ষিত হবে এবং স্থানীয় কৃষকদের সতর্কবার্তা প্রদানে ব্যবহৃত হবে।
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !correctionText.trim()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition disabled:opacity-50 shadow-sm"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>সংশোধনী অনুমোদন ও সংরক্ষণ করুন</span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="p-12 text-center text-gray-400 text-xs">
              বাম পাশের তালিকা থেকে একটি ফ্ল্যাগকৃত প্রশ্ন নির্বাচন করুন।
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
