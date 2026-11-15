import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import {
  UserPlus,
  User,
  Lock,
  Phone,
  MapPin,
  AlertCircle,
  Loader2,
  Wheat,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";

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
      let msg = "নিবন্ধন সম্পন্ন করা যায়নি। অনুগ্রহ করে সঠিক তথ্য প্রদান করুন।";
      if (fieldErrors?.phone) {
        msg = Array.isArray(fieldErrors.phone) ? fieldErrors.phone[0] : fieldErrors.phone;
      } else if (fieldErrors?.password) {
        msg = Array.isArray(fieldErrors.password) ? fieldErrors.password[0] : fieldErrors.password;
      } else if (typeof fieldErrors?.error === "string") {
        msg = fieldErrors.error;
      } else if (typeof fieldErrors?.detail === "string") {
        msg = fieldErrors.detail;
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-8 px-2 sm:px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: 3D Showcase Panel */}
        <div className="lg:col-span-5 card-3d p-6 sm:p-8 rounded-3xl bg-linear-to-br from-slate-900 via-slate-950 to-emerald-950 text-white border border-slate-800 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold backdrop-blur-md badge-3d">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>বিনামূল্যে সদস্যপদ (Free Membership)</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                মৃত্তিকা এআই নেটওয়ার্কে{" "}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
                  যুক্ত হোন
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-bangla">
                একটি নিবন্ধিত অ্যাকাউন্টের মাধ্যমে আপনার জমির মাটির বিশ্লেষণ ও ফসলের ইতিহাস আজীবন নিরাপদ রাখুন।
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3 backdrop-blur-xs">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Wheat className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">ব্যক্তিগত ফসল হিসাব সংরক্ষণ</h4>
                  <p className="text-[11px] text-slate-400">প্রতিটি মৌসুমের সার প্রয়োগ ও খরচ বিবরণী সহজে পর্যবেক্ষণ</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3 backdrop-blur-xs">
                <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">কর্মকর্তা দ্বারা দ্রুত সাড়া</h4>
                  <p className="text-[11px] text-slate-400">স্থানীয় উপ-সহকারী কৃষি কর্মকর্তা (SAAO) সরাসরি পরামর্শ ও অডিট</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3 backdrop-blur-xs">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">২৪/৭ স্মার্ট বাংলা এআই সহায়তা</h4>
                  <p className="text-[11px] text-slate-400">সরকারি নলেজবেস থেকে নির্ভুল রোগ ও পোকা দমনের সমাধান</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>কোনো গোপনীয় চার্জ নেই</span>
            </span>
            <span className="text-emerald-400 font-bold">১০০% ফ্রি রেজিস্ট্রেশন</span>
          </div>
        </div>

        {/* Right Column: 3D Form Card */}
        <div className="lg:col-span-7 card-3d p-6 sm:p-8 rounded-3xl bg-white/95 border border-emerald-100 shadow-[0_20px_50px_-10px_rgba(6,78,59,0.12)] space-y-6">
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-700/25 border border-emerald-400/40">
              <UserPlus className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">নতুন অ্যাকাউন্ট তৈরি করুন</h1>
            <p className="text-xs text-slate-500">
              কৃষক বা কৃষি কর্মকর্তা হিসেবে বিনামূল্যে প্ল্যাটফর্মে যুক্ত হোন
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2.5 shadow-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                আপনার পূর্ণ নাম (Full Name)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="name"
                  placeholder="যেমন: কৃষক আকমল হোসেন"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ১১ ডিজিটের মোবাইল নম্বর (Phone)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="phone"
                  placeholder="01712345678"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                পাসওয়ার্ড (Password - অন্তত ৮ অক্ষর)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  minLength={8}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  জেলা (District)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    name="district"
                    placeholder="Bogra / বগুড়া"
                    value={formData.district}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  উপজেলা (Upazila)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    name="upazila"
                    placeholder="Sherpur / শেরপুর"
                    value={formData.upazila}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ব্যবহারকারীর ভূমিকা (Role Selection)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, role: "FARMER" }))}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                    formData.role === "FARMER"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20 font-bold"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-medium"
                  }`}
                >
                  <Wheat className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold">কৃষক (Farmer)</p>
                    <p className="text-[10px] text-slate-500">তাৎক্ষণিক এক্সেস</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, role: "OFFICER" }))}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                    formData.role === "OFFICER"
                      ? "bg-teal-50 border-teal-500 text-teal-950 ring-2 ring-teal-500/20 font-bold"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-medium"
                  }`}
                >
                  <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold">কৃষি কর্মকর্তা</p>
                    <p className="text-[10px] text-slate-500">অ্যাডমিন অডিট সাপেক্ষে</p>
                  </div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl btn-3d-emerald text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>নিবন্ধন সম্পন্ন করুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
            <Link to="/login" className="font-bold text-emerald-800 hover:text-emerald-950 underline">
              লগইন করুন
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
