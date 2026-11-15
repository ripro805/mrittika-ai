import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t, i18n } = useTranslation();
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
        setErrorMessage(i18n.language === "en" ? "Failed to load flagged review items." : "ফ্ল্যাগকৃত ডাটা লোড করতে সমস্যা হয়েছে।");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchItems();
  }, [i18n.language]);

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
      setSuccessMessage(
        i18n.language === "en"
          ? "Agronomic correction successfully verified and saved!"
          : "সংশোধনী সফলভাবে সংরক্ষিত ও অনুমোদিত হয়েছে!"
      );
      // Update item in local list
      setItems((prev) =>
        prev.map((it) => (it.id === activeItem.id ? res.data.feedback : it))
      );
      setActiveItem(res.data.feedback);
    } catch {
      setErrorMessage(
        i18n.language === "en"
          ? "Failed to save correction. Please try again."
          : "সংশোধনী সংরক্ষণ ব্যর্থ হয়েছে। দয়া করে পুনরায় চেষ্টা করুন।"
      );
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
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-700" />
            <span>
              {i18n.language === "en"
                ? "Flagged Q&A Audit & Scientific Correction Hub"
                : "ফ্ল্যাগকৃত প্রশ্নোত্তর নিরীক্ষা ও সংশোধন কেন্দ্র"}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-bangla">
            {i18n.language === "en"
              ? "Scientifically verify flagged model queries and inject certified agronomist instructions for farmers."
              : "কৃষকের চিহ্নিত ত্রুটিপূর্ণ উত্তরসমূহ বৈজ্ঞানিকভাবে যাচাই করুন এবং সঠিক দিকনির্দেশনা প্রদান করুন।"}
          </p>
        </div>

        {/* Filter Pills (Apple Segmented Control) */}
        <div className="inline-flex rounded-full bg-black/[0.04] p-1 border border-black/[0.04] text-xs font-semibold">
          <button
            onClick={() => setFilterStatus("pending")}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              filterStatus === "pending" ? "bg-white text-red-700 shadow-2xs font-bold" : "text-[#86868b] hover:text-[#1d1d1f]"
            }`}
          >
            {i18n.language === "en"
              ? `Pending (${items.filter((i) => !i.is_resolved).length})`
              : `অপেক্ষমাণ (${items.filter((i) => !i.is_resolved).length})`}
          </button>
          <button
            onClick={() => setFilterStatus("resolved")}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              filterStatus === "resolved" ? "bg-white text-emerald-800 shadow-2xs font-bold" : "text-[#86868b] hover:text-[#1d1d1f]"
            }`}
          >
            {i18n.language === "en"
              ? `Resolved (${items.filter((i) => i.is_resolved).length})`
              : `সমাধানকৃত (${items.filter((i) => i.is_resolved).length})`}
          </button>
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              filterStatus === "all" ? "bg-white text-[#1d1d1f] shadow-2xs font-bold" : "text-[#86868b] hover:text-[#1d1d1f]"
            }`}
          >
            {i18n.language === "en" ? `All (${items.length})` : `সব (${items.length})`}
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: List of Flagged Items */}
        <div className="lg:col-span-5 bg-white rounded-[28px] border border-black/[0.06] shadow-apple overflow-hidden flex flex-col h-[700px]">
          {/* Search box */}
          <div className="p-4 border-b border-black/[0.05]">
            <div className="relative">
              <Search className="w-4 h-4 text-[#86868b] absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder={i18n.language === "en" ? "Search questions or notes..." : "প্রশ্ন বা মন্তব্য খুঁজুন..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#fbfbfd] border border-black/10 rounded-xl text-xs text-[#1d1d1f] placeholder:text-[#86868b] focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 focus:outline-none font-bangla"
              />
            </div>
          </div>

          {/* Items list */}
          <div className="flex-1 overflow-y-auto divide-y divide-black/[0.04]">
            {isLoading ? (
              <div className="p-8 text-center text-xs font-bold text-[#86868b] font-bangla">
                {i18n.language === "en" ? "Loading items..." : "লোড হচ্ছে..."}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-8 text-center text-xs font-semibold text-[#86868b] font-bangla">
                {i18n.language === "en" ? "No feedback items found." : "কোনো প্রশ্নোত্তর মেলেনি।"}
              </div>
            ) : (
              filteredItems.map((item) => {
                const isSelected = activeItem?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className={`w-full text-left p-4 transition-all flex flex-col gap-1.5 cursor-pointer ${
                      isSelected
                        ? "bg-teal-50/70 border-l-4 border-teal-700"
                        : "hover:bg-black/[0.02]"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          item.is_resolved
                            ? "bg-emerald-50 text-emerald-900 border-emerald-200/80"
                            : "bg-red-50 text-red-900 border-red-200/80"
                        }`}
                      >
                        {item.is_resolved
                          ? (i18n.language === "en" ? "Resolved" : "সমাধানকৃত")
                          : (i18n.language === "en" ? "Pending" : "অপেক্ষমাণ")}
                      </span>
                      <span className="text-[11px] text-[#86868b] font-mono">
                        {new Date(item.created_at).toLocaleDateString(i18n.language === "en" ? "en-US" : "bn-BD")}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[#1d1d1f] line-clamp-2 font-bangla">
                      {item.context_data?.question || item.comment || (i18n.language === "en" ? `Feedback #${item.id}` : `ফিডব্যাক #${item.id}`)}
                    </p>
                    <p className="text-[11px] text-[#86868b] truncate font-mono">
                      {i18n.language === "en"
                        ? `Module: ${item.module_type} • Rating: ${item.rating}★`
                        : `মডিউল: ${item.module_type} • রেটিং: ${item.rating}★`}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Inspector and Correction Form */}
        <div className="lg:col-span-7 bg-white rounded-[28px] border border-black/[0.06] shadow-apple p-6 sm:p-8 space-y-6">
          {activeItem ? (
            <>
              {/* Feedback Status Header */}
              <div className="flex items-center justify-between pb-4 border-b border-black/[0.05]">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      activeItem.is_resolved
                        ? "bg-emerald-50 text-emerald-900 border-emerald-200/80"
                        : "bg-red-50 text-red-900 border-red-200/80"
                    }`}
                  >
                    {activeItem.is_resolved
                      ? (i18n.language === "en" ? "Resolution Complete" : "সমাধান সম্পন্ন হয়েছে")
                      : (i18n.language === "en" ? "Awaiting Review" : "পর্যালোচনা অপেক্ষমাণ")}
                  </span>
                  <span className="text-xs font-semibold text-[#86868b] font-mono">
                    {i18n.language === "en" ? `ID: #${activeItem.id}` : `আইডি: #${activeItem.id}`}
                  </span>
                </div>
                <span className="text-xs text-[#86868b] font-mono">
                  {i18n.language === "en" ? "Date: " : "তারিখ: "}
                  {new Date(activeItem.created_at).toLocaleString(i18n.language === "en" ? "en-US" : "bn-BD")}
                </span>
              </div>

              {/* Farmer's Context */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-[#1d1d1f] uppercase tracking-wider">
                  {i18n.language === "en" ? "1. Farmer's Original Query / Context" : "১. কৃষকের মূল প্রশ্ন / প্রেক্ষাপট"}
                </h3>
                <div className="p-4 rounded-2xl bg-[#fbfbfd] border border-black/[0.05] text-sm font-semibold text-[#1d1d1f] leading-relaxed font-bangla">
                  {activeItem.context_data?.question || activeItem.comment || (i18n.language === "en" ? "No context details available." : "বিবরণ উপলব্ধ নেই।")}
                </div>
              </div>

              {/* AI's Generated Answer */}
              {activeItem.context_data?.assistant_response && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-[#1d1d1f] uppercase tracking-wider">
                    {i18n.language === "en"
                      ? "2. AI Model Initial Response (Flagged)"
                      : "২. এআই মডেলের প্রাথমিক উত্তর (যা ফ্ল্যাগ করা হয়েছে)"}
                  </h3>
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs sm:text-sm text-slate-800 leading-relaxed max-h-48 overflow-y-auto font-bangla">
                    {activeItem.context_data.assistant_response}
                  </div>
                </div>
              )}

              {/* Alert Feedback Messages */}
              {successMessage && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 font-bold font-bangla">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2 font-bold font-bangla">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Officer Correction Form */}
              <form onSubmit={handleSubmitCorrection} className="space-y-4 pt-2 border-t border-black/[0.05]">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-teal-900 uppercase tracking-wider">
                    {i18n.language === "en"
                      ? "3. Officer Certified Agronomic Recommendation (BARC Standard)"
                      : "৩. কৃষি কর্মকর্তার অনুমোদিত সঠিক পরামর্শ (Authoritative Agronomic Note)"}
                  </label>
                  <textarea
                    rows={4}
                    value={correctionText}
                    onChange={(e) => setCorrectionText(e.target.value)}
                    placeholder={
                      i18n.language === "en"
                        ? "Enter certified fertilizer dosage, split schedule, and management practices aligned with BARC guidelines..."
                        : "মাঠ পর্যায়ের বাস্তব অভিজ্ঞতা ও বাংলাদেশ কৃষি গবেষণা কাউন্সিল (BARC) অনুসারে সঠিক ডোজ, পদ্ধতি ও সময়সূচী লিখুন..."
                    }
                    className="w-full p-4 rounded-2xl border border-black/10 text-xs sm:text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 focus:outline-none font-bangla"
                    required
                  />
                  <p className="text-[11px] text-[#86868b] font-bangla">
                    {i18n.language === "en"
                      ? "This verified correction will be permanently logged and fed back into advisory guardrails."
                      : "এই সংশোধনীটি সংরক্ষিত হবে এবং স্থানীয় কৃষকদের সতর্কবার্তা প্রদানে ব্যবহৃত হবে।"}
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !correctionText.trim()}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all disabled:opacity-50 shadow-apple active:scale-[0.98] cursor-pointer"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <Send className="w-4 h-4 text-white" />
                    )}
                    <span>
                      {i18n.language === "en" ? "Approve & Save Correction" : "সংশোধনী অনুমোদন ও সংরক্ষণ করুন"}
                    </span>
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="p-12 text-center text-[#86868b] text-xs">
              {i18n.language === "en"
                ? "Select a flagged item from the left panel to review."
                : "বাম পাশের তালিকা থেকে একটি ফ্ল্যাগকৃত প্রশ্ন নির্বাচন করুন।"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
