import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import apiClient from "../services/api";
import { AgroImage } from "../components/AgroImage";
import { getCropImage, getFertilizerImage } from "../utils/agroImages";
import {
  History as HistoryIcon,
  Download,
  Trash2,
  Calendar,
  Sprout,
  FlaskConical,
  Loader2,
  AlertCircle,
} from "lucide-react";

export const HistoryPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get("/history");
      setHistoryList(res.data || []);
    } catch {
      // Handled
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [i18n.language]);

  const handleDelete = async (id: number) => {
    const confirmMsg = i18n.language === "en"
      ? "Are you sure you want to permanently delete this recommendation record?"
      : "আপনি কি নিশ্চিতভাবে এই রেকর্ডটি মুছে ফেলতে চান?";
    if (!window.confirm(confirmMsg)) return;
    try {
      await apiClient.delete(`/history/${id}`);
      setHistoryList((prev) => prev.filter((item) => item.id !== id));
    } catch {
      alert(i18n.language === "en" ? "Failed to delete record." : "রেকর্ডটি মোছা যায়নি।");
    }
  };

  const handleDownloadPdf = async (id: number) => {
    setDownloadingId(id);
    try {
      const res = await apiClient.get(`/report/${id}.pdf`, { responseType: "blob" });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `mrittika_advisory_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert(i18n.language === "en" ? "PDF download failed." : "পিডিএফ ডাউনলোড ব্যর্থ হয়েছে।");
    } finally {
      setDownloadingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-mrittika-700" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <HistoryIcon className="w-6 h-6 text-emerald-700" />
            <span>
              {i18n.language === "en" ? "Saved Agricultural Advisory History" : "সংরক্ষিত কৃষি পরামর্শ ইতিহাস"}
            </span>
          </h1>
          <p className="text-xs text-slate-600 mt-1 font-bangla">
            {i18n.language === "en"
              ? "All past crop selections and balanced fertilizer plans associated with your account."
              : "আপনার অ্যাকাউন্টে পূর্বের ফসল ও সারের সুপারিশসমূহ।"}
          </p>
        </div>
      </div>

      {historyList.length === 0 ? (
        <div className="bg-white rounded-[28px] p-12 text-center border border-black/[0.06] space-y-4 shadow-apple">
          <AlertCircle className="w-12 h-12 text-[#86868b] mx-auto" />
          <h3 className="text-base font-bold text-[#1d1d1f] tracking-tight">
            {i18n.language === "en" ? "No Saved Advisories Yet" : "কোনো সংরক্ষিত পরামর্শ নেই"}
          </h3>
          <p className="text-xs text-[#86868b] max-w-sm mx-auto font-bangla">
            {i18n.language === "en"
              ? "You have not saved any crop or fertilizer calculations yet. Run a recommendation now."
              : "আপনি এখনও কোনো ফসল বা সারের হিসাব সংরক্ষণ করেননি। এখনই পরামর্শ গ্রহণ করুন।"}
          </p>
          <div className="pt-2">
            <Link
              to="/crop"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition active:scale-98"
            >
              <span>{i18n.language === "en" ? "Get Crop Recommendation" : "নতুন ফসল পরামর্শ নিন"}</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {historyList.map((item) => {
            const isCrop = item.rec_type === "CROP";
            const dateStr = new Date(item.created_at).toLocaleDateString(
              i18n.language === "en" ? "en-US" : "bn-BD",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }
            );

            const cropName = i18n.language === "en"
              ? (item.crop_name_en || item.crop_slug || "Agricultural Advisory")
              : (item.crop_name_bn || item.crop_slug || "সার্বিক পরামর্শ");

            const cropData = getCropImage(item.crop_slug || item.crop_name_en);

            return (
              <div
                key={item.id}
                className="app-card bg-white p-5 sm:p-6 rounded-[24px] border border-black/[0.06] shadow-apple hover:shadow-apple-hover flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden flex-shrink-0 shadow-2xs border border-black/[0.05]">
                    <AgroImage
                      crop={cropData}
                      lang={i18n.language === "en" ? "en" : "bn"}
                      aspect="square"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-semibold border ${
                          isCrop
                            ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                            : "bg-amber-50 text-amber-900 border-amber-200"
                        }`}
                      >
                        {isCrop ? <Sprout className="w-3.5 h-3.5 text-emerald-700" /> : <FlaskConical className="w-3.5 h-3.5 text-amber-700" />}
                        {isCrop
                          ? (i18n.language === "en" ? "Crop Recommendation" : "ফসলের সুপারিশ")
                          : (i18n.language === "en" ? "Fertilizer Plan" : "সারের সুপারিশ")}
                      </span>
                      <span className="text-xs text-[#86868b] flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5" />
                        {dateStr}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-[#1d1d1f] tracking-tight">
                      {cropName}
                      {item.fertilizer_plan && (
                        <span className="text-sm font-normal text-[#86868b] ml-2">
                          ({item.fertilizer_plan})
                        </span>
                      )}
                    </h3>

                    <div className="text-xs text-[#86868b] space-x-3 font-medium">
                      <span>
                        {i18n.language === "en" ? "Season: " : "মৌসুম: "}
                        {item.inputs?.season || (i18n.language === "en" ? "Rabi" : "রবি")}
                      </span>
                      <span>•</span>
                      <span>
                        {i18n.language === "en" ? "Soil: " : "মাটি: "}
                        {item.inputs?.soil_type || (i18n.language === "en" ? "Loam" : "দোআঁশ")}
                      </span>
                      {item.inputs?.land_area && (
                        <>
                          <span>•</span>
                          <span>
                            {i18n.language === "en" ? "Area: " : "জমি: "}
                            {item.inputs.land_area}{" "}
                            {item.inputs.land_unit === "bigha"
                              ? (i18n.language === "en" ? "Bigha" : "বিঘা")
                              : (i18n.language === "en" ? "Decimal" : "শতক")}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0">
                  <button
                    onClick={() => handleDownloadPdf(item.id)}
                    disabled={downloadingId === item.id}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#fbfbfd] hover:bg-emerald-50 text-[#1d1d1f] hover:text-emerald-950 text-xs font-semibold border border-black/[0.08] hover:border-emerald-300 transition-all shadow-2xs active:scale-98 cursor-pointer"
                  >
                    {downloadingId === item.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                    ) : (
                      <Download className="w-4 h-4 text-emerald-700" />
                    )}
                    <span>{i18n.language === "en" ? "PDF Report" : "পিডিএফ রিপোর্ট"}</span>
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2.5 rounded-full border border-black/[0.08] hover:border-red-200 text-[#86868b] hover:text-red-600 hover:bg-red-50/50 transition shadow-2xs active:scale-98 cursor-pointer"
                    title={i18n.language === "en" ? "Delete Record" : "মুছে ফেলুন"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
