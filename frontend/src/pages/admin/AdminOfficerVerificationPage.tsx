import React, { useEffect, useState } from "react";
import apiClient from "../../services/api";
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  MapPin,
  Loader2,
  AlertCircle,
  Check,
  Search,
} from "lucide-react";

export const AdminOfficerVerificationPage: React.FC = () => {
  const [officers, setOfficers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchOfficers = () => {
    setIsLoading(true);
    apiClient
      .get("/admin/users?role=OFFICER&limit=100")
      .then((res) => {
        setOfficers(res.data.users || []);
      })
      .catch(() => {
        setError("কর্মকর্তা তালিকা লোড করা যায়নি।");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchOfficers();
  }, []);

  const handleToggleVerification = async (officerId: number, currentStatus: boolean) => {
    setUpdatingId(officerId);
    setSuccessMessage(null);
    setError(null);
    try {
      await apiClient.patch(`/admin/users/${officerId}`, {
        is_verified: !currentStatus,
      });
      setSuccessMessage(
        !currentStatus
          ? "কর্মকর্তা সফলভাবে সরকারিভাবে যাচাইকৃত ও অনুমোদিত হয়েছেন।"
          : "কর্মকর্তার যাচাইকরণ প্রত্যাহার করা হয়েছে।"
      );
      fetchOfficers();
    } catch {
      setError("যাচাইকরণ স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-teal-700" />
          <span>উপজেলা কৃষি কর্মকর্তা যাচাই ও অনুমোদন কেন্দ্র</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          কৃষি কর্মকর্তাদের অফিসিয়াল পরিচয়, কর্মএলাকা ও নিরীক্ষা প্রদানের সনদ অনুমোদন করুন
        </p>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Officers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full p-12 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
            <span>কর্মকর্তা তালিকা প্রস্তুত হচ্ছে...</span>
          </div>
        ) : officers.length === 0 ? (
          <div className="col-span-full p-12 text-center text-xs text-gray-400">
            কোনো কর্মকর্তা অ্যাকাউন্ট পাওয়া যায়নি।
          </div>
        ) : (
          officers.map((officer) => (
            <div
              key={officer.id}
              className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-teal-200 transition"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 font-extrabold text-sm flex items-center justify-center">
                    {officer.name.slice(0, 2)}
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      officer.is_verified
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : "bg-amber-100 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {officer.is_verified ? "যাচাইকৃত কর্মকর্তা" : "অনুমোদন অপেক্ষমাণ"}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900">{officer.name}</h3>
                  <p className="text-xs text-gray-500">{officer.phone}</p>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                  <span>
                    {officer.district || "বগুড়া"}, {officer.upazila || "শেরপুর"}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleToggleVerification(officer.id, officer.is_verified)}
                  disabled={updatingId === officer.id}
                  className={`w-full py-2 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                    officer.is_verified
                      ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                      : "bg-teal-700 text-white hover:bg-teal-800 shadow-xs"
                  }`}
                >
                  {updatingId === officer.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : officer.is_verified ? (
                    <XCircle className="w-3.5 h-3.5" />
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {officer.is_verified ? "যাচাইকরণ প্রত্যাহার করুন" : "যাচাই ও অনুমোদন করুন"}
                  </span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
