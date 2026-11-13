import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import apiClient from "../services/api";
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
  const { t } = useTranslation();
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
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই রেকর্ডটি মুছে ফেলতে চান?")) return;
    try {
      await apiClient.delete(`/history/${id}`);
      setHistoryList((prev) => prev.filter((item) => item.id !== id));
    } catch {
      alert("রেকর্ডটি মোছা যায়নি।");
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
      alert("পিডিএফ ডাউনলোড ব্যর্থ হয়েছে।");
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
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HistoryIcon className="w-6 h-6 text-mrittika-800" />
            <span>সংরক্ষিত কৃষি পরামর্শ ইতিহাস</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            আপনার অ্যাকাউন্টে পূর্বের ফসল ও সারের সুপারিশসমূহ।
          </p>
        </div>
      </div>

      {historyList.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 space-y-4">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-700">কোনো সংরক্ষিত পরামর্শ নেই</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            আপনি এখনও কোনো ফসল বা সারের হিসাব সংরক্ষণ করেননি। এখনই পরামর্শ গ্রহণ করুন।
          </p>
          <div className="pt-2">
            <Link
              to="/crop"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-mrittika-800 text-white text-xs font-bold shadow-sm"
            >
              <span>নতুন ফসল পরামর্শ নিন</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {historyList.map((item) => {
            const isCrop = item.rec_type === "CROP";
            const dateStr = new Date(item.created_at).toLocaleDateString("bn-BD", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={item.id}
                className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-md transition-shadow"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isCrop
                          ? "bg-mrittika-100 text-mrittika-900"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {isCrop ? <Sprout className="w-3.5 h-3.5" /> : <FlaskConical className="w-3.5 h-3.5" />}
                      {isCrop ? "ফসলের সুপারিশ" : "সারের সুপারিশ"}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {dateStr}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900">
                    {item.crop_name_bn || item.crop_slug || "সার্বিক পরামর্শ"}
                    {item.fertilizer_plan && (
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        ({item.fertilizer_plan})
                      </span>
                    )}
                  </h3>

                  <div className="text-xs text-gray-600 space-x-3">
                    <span>মৌসুম: {item.inputs?.season || "রবি"}</span>
                    <span>•</span>
                    <span>মাটি: {item.inputs?.soil_type || "দোআঁশ"}</span>
                    {item.inputs?.land_area && (
                      <>
                        <span>•</span>
                        <span>জমি: {item.inputs.land_area} {item.inputs.land_unit === "bigha" ? "বিঘা" : "শতক"}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0">
                  <button
                    onClick={() => handleDownloadPdf(item.id)}
                    disabled={downloadingId === item.id}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-mrittika-50 text-mrittika-800 hover:bg-mrittika-100 text-xs font-bold border border-mrittika-200 transition-colors"
                  >
                    {downloadingId === item.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-mrittika-800" />
                    ) : (
                      <Download className="w-4 h-4 text-mrittika-800" />
                    )}
                    <span>পিডিএফ রিপোর্ট</span>
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="মুছে ফেলুন"
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
