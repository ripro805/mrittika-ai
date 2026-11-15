import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import apiClient from "../services/api";
import { User, Phone, MapPin, ShieldCheck, Trash2, Edit3, Check, Loader2 } from "lucide-react";

export const ProfilePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, refreshProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [district, setDistrict] = useState(user?.district || "");
  const [upazila, setUpazila] = useState(user?.upazila || "");
  const [isLoading, setIsLoading] = useState(false);

  if (!user) {
    return null;
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiClient.patch("/me", { name, district, upazila });
      await refreshProfile();
      setIsEditing(false);
    } catch {
      alert(i18n.language === "en" ? "Failed to update profile." : "প্রোফাইল আপডেট করা যায়নি।");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmMsg = i18n.language === "en"
      ? "Warning: Your account and all saved recommendation records will be permanently deleted. Are you sure?"
      : "সতর্কতা: আপনার অ্যাকাউন্ট এবং সমস্ত সংরক্ষিত তথ্য স্থায়ীভাবে মুছে যাবে। আপনি কি নিশ্চিত?";
    if (!window.confirm(confirmMsg)) {
      return;
    }

    try {
      await apiClient.delete("/me");
      await logout();
      navigate("/");
    } catch {
      alert(i18n.language === "en" ? "Failed to delete account." : "অ্যাকাউন্ট মোছা যায়নি।");
    }
  };

  const roleBadge = () => {
    if (user.role === "ADMIN") return i18n.language === "en" ? "System Admin" : "সিস্টেম অ্যাডমিন";
    if (user.role === "OFFICER") return i18n.language === "en" ? "Extension Officer" : "কৃষি কর্মকর্তা";
    return i18n.language === "en" ? "Farmer" : "কৃষক";
  };

  return (
    <div className="max-w-xl mx-auto py-8 space-y-6">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-card space-y-6">
        <div className="flex items-center justify-between pb-6 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xl shadow-sm">
              {user.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200">
                  {roleBadge()}
                </span>
                {user.role === "OFFICER" && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border ${
                      user.is_verified
                        ? "bg-green-50 text-green-900 border-green-200"
                        : "bg-amber-50 text-amber-900 border-amber-200"
                    }`}
                  >
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    {user.is_verified
                      ? (i18n.language === "en" ? "Verified Officer" : "যাচাইকৃত কর্মকর্তা")
                      : (i18n.language === "en" ? "Pending Verification" : "অপেক্ষমান যাচাইকরণ")}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            title={i18n.language === "en" ? "Edit Profile" : "প্রোফাইল সম্পাদনা"}
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {i18n.language === "en" ? "Full Name" : "পূর্ণ নাম"}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-600/15 focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {i18n.language === "en" ? "District" : "জেলা"}
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-600/15 focus:border-emerald-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {i18n.language === "en" ? "Upazila" : "উপজেলা"}
                </label>
                <input
                  type="text"
                  value={upazila}
                  onChange={(e) => setUpazila(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-600/15 focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Check className="w-4 h-4" />}
                <span>{i18n.language === "en" ? "Save Changes" : "সংরক্ষণ করুন"}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                {i18n.language === "en" ? "Cancel" : "বাতিল"}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <Phone className="w-4 h-4 text-slate-500" />
              <div>
                <span className="text-[11px] text-slate-500 block font-bold">
                  {i18n.language === "en" ? "Mobile Number" : "মোবাইল নম্বর"}
                </span>
                <span className="font-semibold text-slate-900 font-mono">{user.phone}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <MapPin className="w-4 h-4 text-slate-500" />
              <div>
                <span className="text-[11px] text-slate-500 block font-bold">
                  {i18n.language === "en" ? "Region / Address" : "এলাকা / ঠিকানা"}
                </span>
                <span className="font-semibold text-slate-900 font-bangla">
                  {user.upazila ? `${user.upazila}, ` : ""}
                  {user.district || (i18n.language === "en" ? "Bangladesh" : "বাংলাদেশ")}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleDeleteAccount}
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1.5 p-2 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>{i18n.language === "en" ? "Delete Account" : "অ্যাকাউন্ট মুছে ফেলুন"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
