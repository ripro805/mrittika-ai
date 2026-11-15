import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { SCENIC_IMAGES } from "../utils/agroImages";
import {
  LogIn,
  Lock,
  Phone,
  AlertCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
  Wheat,
  UserCheck,
  ArrowRight,
  Zap,
  CheckCircle2,
} from "lucide-react";

export const LoginPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeRoleLoggingIn, setActiveRoleLoggingIn] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const DEMO_ACCOUNTS = [
    {
      id: "farmer",
      title: i18n.language === "en" ? "Farmer Portal" : "কৃষক পোর্টাল",
      roleLabel: "Farmer",
      name: i18n.language === "en" ? "Mokaddem Biswas (Farmer)" : "কৃষক মোকাদ্দেম বিশ্বাস",
      phone: "01720000001",
      pass: "Farmer@123456",
      icon: Wheat,
      color: "emerald",
      badgeText: i18n.language === "en" ? "Farmer" : "কৃষক",
      bgLight: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-950",
      btnBg: "bg-emerald-700 hover:bg-emerald-800 text-white",
      targetPath: "/farmer/overview",
    },
    {
      id: "officer",
      title: i18n.language === "en" ? "Officer Portal" : "কর্মকর্তা পোর্টাল",
      roleLabel: "Extension Officer",
      name: i18n.language === "en" ? "Dr. Md. Rafiqul Islam (SAAO)" : "মোস্তাফিজুর রহমান (SAAO)",
      phone: "01710000001",
      pass: "Officer@123456",
      icon: ShieldCheck,
      color: "teal",
      badgeText: i18n.language === "en" ? "Officer" : "কর্মকর্তা",
      bgLight: "bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-950",
      btnBg: "bg-teal-700 hover:bg-teal-800 text-white",
      targetPath: "/officer/overview",
    },
    {
      id: "admin",
      title: i18n.language === "en" ? "Admin Portal" : "অ্যাডমিন পোর্টাল",
      roleLabel: "System Admin",
      name: i18n.language === "en" ? "System Administrator" : "সিস্টেম অ্যাডমিনিস্ট্রেটর",
      phone: "01700000001",
      pass: "Admin@123456",
      icon: UserCheck,
      color: "purple",
      badgeText: i18n.language === "en" ? "Admin" : "অ্যাডমিন",
      bgLight: "bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-950",
      btnBg: "bg-purple-700 hover:bg-purple-800 text-white",
      targetPath: "/admin-portal/overview",
    },
  ];

  const performLogin = async (phoneVal: string, passVal: string, targetPath?: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const loggedUser = await login(phoneVal, passVal);
      if (targetPath) {
        navigate(targetPath);
      } else if (loggedUser.role === "ADMIN") {
        navigate("/admin-portal/overview");
      } else if (loggedUser.role === "OFFICER") {
        navigate("/officer/overview");
      } else {
        navigate("/farmer/overview");
      }
    } catch (err: any) {
      const isEn = i18n.language === "en";
      const rawMsg =
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.response?.data?.message ||
        (err.response
          ? (isEn ? "Invalid phone number or password." : "মোবাইল নম্বর বা পাসওয়ার্ড ভুল হয়েছে।")
          : (isEn ? "Cannot connect to server. Please verify backend is running." : "সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি (Network Error)।"));

      let msg = isEn
        ? "Invalid mobile number or password. Please try again."
        : "মোবাইল নম্বর বা পাসওয়ার্ড ভুল হয়েছে। দয়া করে পুনরায় সঠিক তথ্য দিন।";

      if (typeof rawMsg === "string") {
        const lower = rawMsg.toLowerCase();
        if (lower.includes("token")) {
          msg = isEn ? "Session expired. Please log in again." : "আপনার পূর্ববর্তী সেশনের মেয়াদ শেষ হয়েছে। অনুগ্রহ করে পুনরায় লগইন করুন।";
        } else if (lower.includes("network error") || lower.includes("err_failed") || !err.response) {
          msg = isEn ? "Network error. Please check your internet connection." : "সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি। ইন্টারনেট সংযোগ পরীক্ষা করুন।";
        } else if (lower.includes("invalid") || lower.includes("incorrect") || lower.includes("ভুল")) {
          msg = isEn ? "Invalid phone number or password." : "মোবাইল নম্বর বা পাসওয়ার্ড ভুল হয়েছে।";
        } else {
          msg = rawMsg;
        }
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
      setActiveRoleLoggingIn(null);
    }
  };

  const handleQuickLogin = (acc: (typeof DEMO_ACCOUNTS)[0]) => {
    setActiveRoleLoggingIn(acc.id);
    setPhone(acc.phone);
    setPassword(acc.pass);
    performLogin(acc.phone, acc.pass, acc.targetPath);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(phone, password);
  };

  return (
    <div className="max-w-6xl mx-auto py-2 sm:py-6 px-2 sm:px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Agritech Showcase & Security Telemetry Panel */}
        <div className="lg:col-span-5 relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-lg flex flex-col justify-between space-y-6">
          {/* Authentic Agricultural Photographic Backdrop */}
          <img
            src={SCENIC_IMAGES.ruralLandscape.url}
            alt={i18n.language === "en" ? SCENIC_IMAGES.ruralLandscape.altEn : SCENIC_IMAGES.ruralLandscape.altBn}
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-20 pointer-events-none"
            loading="lazy"
          />

          <div className="relative z-10 space-y-5">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {i18n.language === "en" ? "Verified Agritech Security (Verified Auth)" : "নিরাপদ কৃষি প্ল্যাটফর্ম (Verified Auth)"}
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                {i18n.language === "en" ? (
                  <>
                    Smart AI Technology in Bangladesh's{" "}
                    <span className="text-emerald-400">Agritech Revolution</span>
                  </>
                ) : (
                  <>
                    বাংলাদেশের আধুনিক কৃষি বিপ্লবে{" "}
                    <span className="text-emerald-400">স্মার্ট এআই প্রযুক্তি</span>
                  </>
                )}
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed font-bangla">
                {i18n.language === "en"
                  ? "Access your saved crop history, balanced fertilizer application schedules, and past advisory dialogs from a single authenticated account."
                  : "একটি অ্যাকাউন্টের মাধ্যমে সংরক্ষিত ফসলের হিসাব, সার প্রয়োগ পরিকল্পনা এবং এআই কৃষি সহকারীর সাথে পূর্ববর্তী আলোচনার ইতিহাস পর্যালোচনা করুন।"}
              </p>
            </div>

            {/* 3 Dedicated Portals Preview */}
            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-900/80 text-emerald-300 flex items-center justify-center shrink-0">
                  <Wheat className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-bangla">
                    {i18n.language === "en" ? "Farmer Portal" : "কৃষক পোর্টাল"}
                  </h4>
                  <p className="text-[11px] text-slate-200 font-medium font-bangla">
                    {i18n.language === "en"
                      ? "Soil analysis, balanced fertilizer plans, and saved advisory history"
                      : "মাটি বিশ্লেষণ, সারের সাশ্রয়ী হিসাব ও সংরক্ষিত পরামর্শ"}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-900/80 text-teal-300 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-bangla">
                    {i18n.language === "en" ? "Extension Officer Portal (SAAO / UAO)" : "কর্মকর্তা পোর্টাল (SAAO / UAO)"}
                  </h4>
                  <p className="text-[11px] text-slate-200 font-medium font-bangla">
                    {i18n.language === "en"
                      ? "Field-level farmer queries and AI responses scientific audit"
                      : "মাঠপর্যায়ের কৃষকের আবেদন ও এআই প্রতিক্রিয়া অডিট"}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-900/80 text-purple-300 flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-bangla">
                    {i18n.language === "en" ? "Admin Console" : "অ্যাডমিন কনসোল"}
                  </h4>
                  <p className="text-[11px] text-slate-200 font-medium font-bangla">
                    {i18n.language === "en"
                      ? "Knowledge base curation, cache management, and audit logs"
                      : "নলেজবেস পরিচালনা, ক্যাশ নিয়ন্ত্রণ ও নিরাপত্তা লগ"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Telemetry Footer */}
          <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-3 text-[11px] text-slate-200 font-medium font-bangla">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{i18n.language === "en" ? "JWT Secure Auth" : "JWT নিরাপদ প্রমাণীকরণ"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{i18n.language === "en" ? "100% Privacy Protected" : "১০০% গোপনীয়তা নিশ্চিত"}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Clean Auth Card */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center mx-auto shadow-xs border border-emerald-800">
              <LogIn className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              {i18n.language === "en" ? "Sign In (Account Login)" : "লগইন করুন (Account Login)"}
            </h1>
            <p className="text-xs text-slate-500">
              {i18n.language === "en"
                ? "Enter your credentials to access your personalized agricultural dashboard"
                : "সংরক্ষিত ফসলের হিসাব ও ইতিহাস দেখতে আপনার অ্যাকাউন্টে প্রবেশ করুন"}
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2.5 shadow-2xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span className="font-semibold">{errorMessage}</span>
            </div>
          )}

          {/* 1-Click Quick Login Cards */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
                {i18n.language === "en" ? "1-Click Demo Login (Quick Access)" : "১-ক্লিক ডেমো লগইন (Quick Access)"}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {i18n.language === "en" ? "Instant Access" : "সরাসরি প্রবেশ"}
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed font-bangla">
              {i18n.language === "en"
                ? "Click any of the 3 role presets below to immediately sign in as that user:"
                : "যেকোনো ভূমিকায় তাৎক্ষণিক প্রবেশ করতে নিচের ৩টি বাটনের যেকোনো একটিতে চাপুন:"}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {DEMO_ACCOUNTS.map((acc) => {
                const IconComp = acc.icon;
                const isLoggingThis = activeRoleLoggingIn === acc.id;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleQuickLogin(acc)}
                    disabled={isLoading}
                    className={`text-left p-3 rounded-xl border transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between gap-2.5 ${acc.bgLight} disabled:opacity-60 cursor-pointer`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-white shadow-2xs flex items-center justify-center">
                          <IconComp className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-900">{acc.title}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] font-medium text-slate-800 truncate">{acc.name}</p>
                      <p className="text-[10px] font-mono text-slate-500 tracking-tight">{acc.phone}</p>
                    </div>

                    <div
                      className={`w-full py-1.5 px-2 rounded-lg ${acc.btnBg} text-[11px] font-bold flex items-center justify-center gap-1 shadow-2xs`}
                    >
                      {isLoggingThis ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>{i18n.language === "en" ? "Entering..." : "প্রবেশ হচ্ছে..."}</span>
                        </>
                      ) : (
                        <>
                          <span>{i18n.language === "en" ? "Sign In" : "প্রবেশ করুন"}</span>
                          <ArrowRight className="w-3 h-3" />
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="grow border-t border-slate-200"></div>
            <span className="shrink mx-4 text-slate-500 text-[11px] font-semibold">
              {i18n.language === "en" ? "Or sign in with phone number & password" : "বা মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে লগইন করুন"}
            </span>
            <div className="grow border-t border-slate-200"></div>
          </div>

          {/* Manual Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 font-bangla">
                {i18n.language === "en" ? "11-digit Mobile Number (Phone)" : "১১ ডিজিটের মোবাইল নম্বর (Phone)"}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="01712345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-600/15 focus:border-emerald-600 focus:outline-none transition-all font-mono font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 font-bangla">
                {i18n.language === "en" ? "Password (Password)" : "পাসওয়ার্ড (Password)"}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-600/15 focus:border-emerald-600 focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl app-btn-primary text-white font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading && !activeRoleLoggingIn && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{i18n.language === "en" ? "Sign In" : "লগইন করুন"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-slate-600 pt-2 border-t border-slate-100">
            {i18n.language === "en" ? "Don't have an account? " : "অ্যাকাউন্ট নেই? "}
            <Link to="/register" className="font-bold text-emerald-800 hover:text-emerald-950 underline">
              {i18n.language === "en"
                ? "Register for free as a Farmer or Extension Officer"
                : "নতুন কৃষক বা কর্মকর্তা হিসেবে বিনামূল্যে নিবন্ধন করুন"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
