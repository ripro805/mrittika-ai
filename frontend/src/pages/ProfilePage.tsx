import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import apiClient from "../services/api";
import { User, Phone, MapPin, ShieldCheck, Trash2, Edit3, Check, Loader2 } from "lucide-react";

export const ProfilePage: React.FC = () => {
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
      alert("প্রোফাইল আপডেট করা যায়নি।");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "সতর্কতা: আপনার অ্যাকাউন্ট এবং সমস্ত সংরক্ষিত তথ্য স্থায়ীভাবে মুছে যাবে। আপনি কি নিশ্চিত?"
      )
    ) {
      return;
    }

    try {
      await apiClient.delete("/me");
      await logout();
      navigate("/");
    } catch {
      alert("অ্যাকাউন্ট মোছা যায়নি।");
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 space-y-6">
      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-mrittika-800 text-white flex items-center justify-center font-bold text-xl shadow-md">
              {user.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-mrittika-100 text-mrittika-900">
                  {user.role === "ADMIN"
                    ? "সিস্টেম অ্যাডমিন"
                    : user.role === "OFFICER"
                    ? "কৃষি কর্মকর্তা"
                    : "কৃষক"}
                </span>
                {user.role === "OFFICER" && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      user.is_verified
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    <ShieldCheck className="w-3 h-3" />
                    {user.is_verified ? "যাচাইকৃত কর্মকর্তা" : "অপেক্ষমান যাচাইকরণ"}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
            title="প্রোফাইল সম্পাদনা"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">পূর্ণ নাম</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">জেলা</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">উপজেলা</label>
                <input
                  type="text"
                  value={upazila}
                  onChange={(e) => setUpazila(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2 rounded-xl bg-mrittika-800 text-white text-xs font-bold flex items-center justify-center gap-1.5"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>সংরক্ষণ করুন</span>
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-600"
              >
                বাতিল
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
              <Phone className="w-4 h-4 text-gray-400" />
              <div>
                <span className="text-[11px] text-gray-400 block font-bold">মোবাইল নম্বর</span>
                <span className="font-semibold text-gray-900">{user.phone}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
              <MapPin className="w-4 h-4 text-gray-400" />
              <div>
                <span className="text-[11px] text-gray-400 block font-bold">এলাকা / ঠিকানা</span>
                <span className="font-semibold text-gray-900">
                  {user.upazila ? `${user.upazila}, ` : ""}
                  {user.district || "বাংলাদেশ"}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={handleDeleteAccount}
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1.5 p-2 rounded-xl hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>অ্যাকাউন্ট মুছে ফেলুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};
