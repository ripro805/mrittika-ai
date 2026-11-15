import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { SCENIC_IMAGES } from "../utils/agroImages";
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
  const { t, i18n } = useTranslation();
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
      let msg = i18n.language === "en"
        ? "Registration could not be completed. Please enter valid information."
        : "নিবন্ধন সম্পন্ন করা যায়নি। অনুগ্রহ করে সঠিক তথ্য প্রদান করুন।";
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
    <div className="max-w-6xl mx-auto py-2 sm:py-6 px-2 sm:px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Showcase Panel */}
        <div className="lg:col-span-5 relative overflow-hidden p-6 sm:p-8 rounded-[28px] sm:rounded-[36px] bg-[#0c0c0e] text-white border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col justify-between space-y-6">
          {/* Authentic Agricultural Photographic Backdrop */}
          <img
            src={SCENIC_IMAGES.homepageHero.url}
            alt={i18n.language === "en" ? SCENIC_IMAGES.homepageHero.altEn : SCENIC_IMAGES.homepageHero.altBn}
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-20 pointer-events-none"
            loading="lazy"
          />

          <div className="relative z-10 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-emerald-300 text-xs font-semibold backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{i18n.language === "en" ? "Free Membership" : "বিনামূল্যে সদস্যপদ"}</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                {i18n.language === "en" ? (
                  <>
                    Join the Mrittika AI{" "}
                    <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                      Network
                    </span>
                  </>
                ) : (
                  <>
                    মৃত্তিকা এআই নেটওয়ার্কে{" "}
                    <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                      যুক্ত হোন
                    </span>
                  </>
                )}
              </h2>
              <p className="text-xs sm:text-sm text-[#a1a1a6] font-normal leading-relaxed font-bangla">
                {i18n.language === "en"
                  ? "Safeguard your farm soil analysis, crop yield history, and balanced nutrient calculations for lifetime access."
                  : "একটি নিবন্ধিত অ্যাকাউন্টের মাধ্যমে আপনার জমির মাটির বিশ্লেষণ ও ফসলের ইতিহাস আজীবন নিরাপদ রাখুন।"}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-md flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                  <Wheat className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-bangla">
                    {i18n.language === "en" ? "Personalized Crop Advisory History" : "ব্যক্তিগত ফসল হিসাব সংরক্ষণ"}
                  </h4>
                  <p className="text-[11px] text-[#a1a1a6] font-normal font-bangla">
                    {i18n.language === "en"
                      ? "Track seasonal fertilizer application and cost breakdown seamlessly"
                      : "প্রতিটি মৌসুমের সার প্রয়োগ ও খরচ বিবরণী সহজে পর্যবেক্ষণ"}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-md flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 mt-0.5 border border-teal-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-bangla">
                    {i18n.language === "en" ? "Direct Extension Officer Assistance" : "কর্মকর্তা দ্বারা দ্রুত সাড়া"}
                  </h4>
                  <p className="text-[11px] text-[#a1a1a6] font-normal font-bangla">
                    {i18n.language === "en"
                      ? "Direct agronomic review by local Sub-Assistant Agriculture Officers (SAAO)"
                      : "স্থানীয় উপ-সহকারী কৃষি কর্মকর্তা (SAAO) সরাসরি পরামর্শ ও অডিট"}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-md flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5 border border-purple-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-bangla">
                    {i18n.language === "en" ? "24/7 Smart Agronomic AI Support" : "২৪/৭ স্মার্ট বাংলা এআই সহায়তা"}
                  </h4>
                  <p className="text-[11px] text-[#a1a1a6] font-normal font-bangla">
                    {i18n.language === "en"
                      ? "Instant pest diagnosis and nutrient solutions grounded in BARC research"
                      : "সরকারি নলেজবেস থেকে নির্ভুল রোগ ও পোকা দমনের সমাধান"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-[#a1a1a6] font-medium font-bangla">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{i18n.language === "en" ? "No hidden charges" : "কোনো গোপনীয় চার্জ নেই"}</span>
            </span>
            <span className="text-emerald-400 font-bold">
              {i18n.language === "en" ? "100% Free Registration" : "১০০% ফ্রি রেজিস্ট্রেশন"}
            </span>
          </div>
        </div>

        {/* Right Column: Clean Apple Bento Card */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-[28px] sm:rounded-[36px] border border-black/[0.06] shadow-apple space-y-6">
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center mx-auto shadow-xs border border-emerald-800">
              <UserPlus className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#1d1d1f] tracking-tight">
              {i18n.language === "en" ? "Create an Account" : "নতুন অ্যাকাউন্ট তৈরি করুন"}
            </h1>
            <p className="text-xs text-[#86868b]">
              {i18n.language === "en"
                ? "Join the platform for free as a Farmer or Agricultural Extension Officer"
                : "কৃষক বা কৃষি কর্মকর্তা হিসেবে বিনামূল্যে প্ল্যাটফর্মে যুক্ত হোন"}
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2.5 shadow-2xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span className="font-semibold">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5 font-bangla">
                {i18n.language === "en" ? "Full Name" : "আপনার পূর্ণ নাম"}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#86868b] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="name"
                  placeholder={i18n.language === "en" ? "e.g. Akmol Hossain" : "যেমন: কৃষক আকমল হোসেন"}
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-black/10 rounded-2xl text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:ring-2 focus:ring-emerald-600/15 focus:border-emerald-600 focus:outline-none transition-all font-bangla"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5 font-bangla">
                {i18n.language === "en" ? "11-digit Mobile Number" : "১১ ডিজিটের মোবাইল নম্বর"}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#86868b] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="phone"
                  placeholder="01712345678"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-black/10 rounded-2xl text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:ring-2 focus:ring-emerald-600/15 focus:border-emerald-600 focus:outline-none transition-all font-mono font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5 font-bangla">
                {i18n.language === "en" ? "Password (at least 8 characters)" : "পাসওয়ার্ড (অন্তত ৮ অক্ষর)"}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#86868b] absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  minLength={8}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-black/10 rounded-2xl text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:ring-2 focus:ring-emerald-600/15 focus:border-emerald-600 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5 font-bangla">
                  {i18n.language === "en" ? "District" : "জেলা"}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#86868b] absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    name="district"
                    placeholder="Bogra / বগুড়া"
                    value={formData.district}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-black/10 rounded-2xl text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:ring-2 focus:ring-emerald-600/15 focus:border-emerald-600 focus:outline-none transition-all font-bangla"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5 font-bangla">
                  {i18n.language === "en" ? "Upazila" : "উপজেলা"}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#86868b] absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    name="upazila"
                    placeholder="Sherpur / শেরপুর"
                    value={formData.upazila}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-black/10 rounded-2xl text-sm text-[#1d1d1f] placeholder:text-[#86868b] focus:ring-2 focus:ring-emerald-600/15 focus:border-emerald-600 focus:outline-none transition-all font-bangla"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5">
                {i18n.language === "en" ? "Select Role" : "ব্যবহারকারীর ভূমিকা"}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, role: "FARMER" }))}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-2.5 cursor-pointer active:scale-[0.98] ${
                    formData.role === "FARMER"
                      ? "bg-emerald-50 border-emerald-600 text-emerald-950 ring-2 ring-emerald-600/15 font-bold shadow-2xs"
                      : "bg-[#fbfbfd] border-black/10 text-[#1d1d1f] hover:bg-[#f5f5f7] font-medium"
                  }`}
                >
                  <Wheat className="w-5 h-5 text-emerald-700 shrink-0" />
                  <div>
                    <p className="text-xs font-bold">{i18n.language === "en" ? "Farmer" : "কৃষক"}</p>
                    <p className="text-[10px] text-[#86868b]">
                      {i18n.language === "en" ? "Instant Access" : "তাৎক্ষণিক এক্সেস"}
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, role: "OFFICER" }))}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-2.5 cursor-pointer active:scale-[0.98] ${
                    formData.role === "OFFICER"
                      ? "bg-teal-50 border-teal-600 text-teal-950 ring-2 ring-teal-600/15 font-bold shadow-2xs"
                      : "bg-[#fbfbfd] border-black/10 text-[#1d1d1f] hover:bg-[#f5f5f7] font-medium"
                  }`}
                >
                  <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0" />
                  <div>
                    <p className="text-xs font-bold">{i18n.language === "en" ? "Extension Officer" : "কৃষি কর্মকর্তা"}</p>
                    <p className="text-[10px] text-[#86868b]">
                      {i18n.language === "en" ? "Requires Admin Audit" : "অ্যাডমিন অডিট সাপেক্ষে"}
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-full app-btn-primary text-white font-bold text-sm shadow-apple hover:shadow-apple-hover transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-[0.98]"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{i18n.language === "en" ? "Complete Registration" : "নিবন্ধন সম্পন্ন করুন"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-[#86868b] pt-2 border-t border-black/[0.05]">
            {i18n.language === "en" ? "Already have an account? " : "ইতিমধ্যে অ্যাকাউন্ট আছে? "}
            <Link to="/login" className="font-bold text-emerald-800 hover:text-emerald-950 underline">
              {i18n.language === "en" ? "Sign In" : "লগইন করুন"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
