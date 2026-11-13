import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { UserPlus, User, Lock, Phone, MapPin, AlertCircle, Loader2 } from "lucide-react";

export const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    district: "Bogra",
    upazila: "Sherpur",
    role: "FARMER",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await register(formData);
      navigate("/profile");
    } catch (err: any) {
      const fieldErrors = err.response?.data;
      let msg = "নিবন্ধন সম্পন্ন করা যায়নি।";
      if (fieldErrors?.phone) {
        msg = fieldErrors.phone[0];
      } else if (fieldErrors?.password) {
        msg = fieldErrors.password[0];
      } else if (typeof fieldErrors?.error === "string") {
        msg = fieldErrors.error;
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-8">
      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-mrittika-100 text-mrittika-800 flex items-center justify-center mx-auto shadow-sm">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">নতুন অ্যাকাউন্ট তৈরি করুন</h1>
          <p className="text-xs text-gray-500">
            মৃত্তিকা এআই প্ল্যাটফর্মে বিনামূল্যে কৃষক বা কৃষি কর্মকর্তা হিসেবে যুক্ত হোন
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              আপনার পূর্ণ নাম (Full Name)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                name="name"
                placeholder="যেমন: কৃষক আকমল হোসেন"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-mrittika-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              ১১ ডিজিটের মোবাইল নম্বর (Phone)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                name="phone"
                placeholder="01712345678"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-mrittika-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              পাসওয়ার্ড (Password - অন্তত ৮ অক্ষর)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                minLength={8}
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-mrittika-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                জেলা (District)
              </label>
              <input
                type="text"
                name="district"
                placeholder="Bogra / বগুড়া"
                value={formData.district}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                উপজেলা (Upazila)
              </label>
              <input
                type="text"
                name="upazila"
                placeholder="Sherpur / শেরপুর"
                value={formData.upazila}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              ব্যবহারকারীর ভূমিকা (Role)
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold"
            >
              <option value="FARMER">কৃষক (Farmer)</option>
              <option value="OFFICER">কৃষি কর্মকর্তা (Extension Officer - অ্যাডমিন দ্বারা যাচাইকরণ প্রয়োজন)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-mrittika-800 hover:bg-mrittika-900 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>নিবন্ধন সম্পন্ন করুন</span>
          </button>
        </form>

        <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
          ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
          <Link to="/login" className="font-bold text-mrittika-800 hover:underline">
            লগইন করুন
          </Link>
        </div>
      </div>
    </div>
  );
};
