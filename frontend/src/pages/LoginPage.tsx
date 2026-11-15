import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
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
  const { t } = useTranslation();
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
      title: "কৃষক পোর্টাল",
      roleLabel: "Farmer",
      name: "কৃষক মোকাদ্দেম বিশ্বাস",
      phone: "01720000001",
      pass: "Farmer@123456",
      icon: Wheat,
      color: "emerald",
      badgeText: "কৃষক",
      bgLight: "bg-emerald-50/90 hover:bg-emerald-100/90 border-emerald-200/90 text-emerald-950",
      btnBg: "bg-emerald-700 hover:bg-emerald-800 text-white",
      targetPath: "/farmer/overview",
    },
    {
      id: "officer",
      title: "কর্মকর্তা পোর্টাল",
      roleLabel: "Extension Officer",
      name: "মোস্তাফিজুর রহমান (SAAO)",
      phone: "01710000001",
      pass: "Officer@123456",
      icon: ShieldCheck,
      color: "teal",
      badgeText: "কর্মকর্তা",
      bgLight: "bg-teal-50/90 hover:bg-teal-100/90 border-teal-200/90 text-teal-950",
      btnBg: "bg-teal-700 hover:bg-teal-800 text-white",
      targetPath: "/officer/overview",
    },
    {
      id: "admin",
      title: "অ্যাডমিন পোর্টাল",
      roleLabel: "System Admin",
      name: "সিস্টেম অ্যাডমিনিস্ট্রেটর",
      phone: "01700000001",
      pass: "Admin@123456",
      icon: UserCheck,
      color: "purple",
      badgeText: "অ্যাডমিন",
      bgLight: "bg-purple-50/90 hover:bg-purple-100/90 border-purple-200/90 text-purple-950",
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
      const rawMsg =
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.response?.data?.message ||
        (err.response
          ? "মোবাইল নম্বর বা পাসওয়ার্ড ভুল হয়েছে।"
          : "সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি (Network Error)। ব্যাকএন্ড চালু আছে কি না পরীক্ষা করুন।");

      let msg = "মোবাইল নম্বর বা পাসওয়ার্ড ভুল হয়েছে। দয়া করে পুনরায় সঠিক তথ্য দিন।";
      if (typeof rawMsg === "string") {
        const lower = rawMsg.toLowerCase();
        if (lower.includes("token")) {
          msg = "আপনার পূর্ববর্তী সেশনের মেয়াদ শেষ হয়েছে। অনুগ্রহ করে পুনরায় লগইন করুন।";
        } else if (lower.includes("network error") || lower.includes("err_failed") || !err.response) {
          msg = "সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি। ইন্টারনেট সংযোগ পরীক্ষা করুন।";
        } else if (lower.includes("invalid") || lower.includes("incorrect") || lower.includes("ভুল")) {
          msg = "মোবাইল নম্বর বা পাসওয়ার্ড ভুল হয়েছে।";
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
    <div className="max-w-6xl mx-auto py-4 sm:py-8 px-2 sm:px-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: 3D Agritech Showcase & Security Telemetry Panel */}
        <div className="lg:col-span-5 card-3d p-6 sm:p-8 rounded-3xl bg-linear-to-br from-slate-900 via-slate-950 to-emerald-950 text-white border border-slate-800 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden">
          {/* Subtle glowing orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-5">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold backdrop-blur-md badge-3d">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>নিরাপদ কৃষি প্ল্যাটফর্ম (Verified Auth)</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                বাংলাদেশের আধুনিক কৃষি বিপ্লবে{" "}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
                  স্মার্ট এআই প্রযুক্তি
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-bangla">
                একটি অ্যাকাউন্টের মাধ্যমে সংরক্ষিত ফসলের হিসাব, সার প্রয়োগ পরিকল্পনা এবং এআই কৃষি সহকারীর সাথে পূর্ববর্তী আলোচনার ইতিহাস পর্যালোচনা করুন।
              </p>
            </div>

            {/* 3 Dedicated Portals Preview */}
            <div className="space-y-3 pt-2">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 backdrop-blur-xs">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Wheat className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">কৃষক পোর্টাল</h4>
                  <p className="text-[11px] text-slate-400">মাটি বিশ্লেষণ, সারের সাশ্রয়ী হিসাব ও সংরক্ষিত পরামর্শ</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 backdrop-blur-xs">
                <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">কর্মকর্তা পোর্টাল (SAAO / UAO)</h4>
                  <p className="text-[11px] text-slate-400">মাঠপর্যায়ের কৃষকের আবেদন ও এআই প্রতিক্রিয়া অডিট</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 backdrop-blur-xs">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">অ্যাডমিন কনসোল</h4>
                  <p className="text-[11px] text-slate-400">নলেজবেস পরিচালনা, ক্যাশ নিয়ন্ত্রণ ও নিরাপত্তা লগ</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Telemetry Footer */}
          <div className="relative z-10 pt-4 border-t border-slate-800 grid grid-cols-2 gap-3 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>JWT নিরাপদ প্রমাণীকরণ</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>১০০% গোপনীয়তা নিশ্চিত</span>
            </div>
          </div>
        </div>

        {/* Right Column: 3D Glassmorphic Auth Card */}
        <div className="lg:col-span-7 card-3d p-6 sm:p-8 rounded-3xl bg-white/95 border border-emerald-100 shadow-[0_20px_50px_-10px_rgba(6,78,59,0.12)] space-y-6">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-700/25 border border-emerald-400/40">
              <LogIn className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">লগইন করুন (Account Login)</h1>
            <p className="text-xs text-slate-500">
              সংরক্ষিত ফসলের হিসাব ও ইতিহাস দেখতে আপনার অ্যাকাউন্টে প্রবেশ করুন
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2.5 shadow-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* 1-Click Quick Login Cards */}
          <div className="bg-linear-to-b from-emerald-50/80 via-teal-50/50 to-slate-50 p-4 sm:p-5 rounded-2xl border border-emerald-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-950 uppercase tracking-wider">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
                ১-ক্লিক ডেমো লগইন (Quick Access)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/60 text-emerald-900 badge-3d">
                সরাসরি প্রবেশ
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed font-bangla">
              যেকোনো ভূমিকায় তাৎক্ষণিক প্রবেশ করতে নিচের ৩টি বাটনের যেকোনো একটিতে চাপুন:
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
                    className={`group text-left p-3 rounded-2xl border transition-all shadow-xs hover:shadow-md flex flex-col justify-between gap-2.5 ${acc.bgLight} disabled:opacity-60 cursor-pointer card-3d-interactive`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-white shadow-2xs flex items-center justify-center">
                          <IconComp className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold">{acc.title}</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] font-medium opacity-85 truncate">{acc.name}</p>
                      <p className="text-[10px] font-mono opacity-70 tracking-tight">{acc.phone}</p>
                    </div>

                    <div
                      className={`w-full py-1.5 px-2 rounded-xl ${acc.btnBg} text-[11px] font-bold flex items-center justify-center gap-1 shadow-2xs group-hover:scale-[1.02] transition-transform`}
                    >
                      {isLoggingThis ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>প্রবেশ হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <span>প্রবেশ করুন</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
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
            <span className="shrink mx-4 text-slate-400 text-[11px] font-medium">
              বা মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে লগইন করুন
            </span>
            <div className="grow border-t border-slate-200"></div>
          </div>

          {/* Manual Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ১১ ডিজিটের মোবাইল নম্বর (Phone)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="01712345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                পাসওয়ার্ড (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl btn-3d-emerald text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading && !activeRoleLoggingIn && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>লগইন করুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            অ্যাকাউন্ট নেই?{" "}
            <Link to="/register" className="font-bold text-emerald-800 hover:text-emerald-950 underline">
              নতুন কৃষক বা কর্মকর্তা হিসেবে বিনামূল্যে নিবন্ধন করুন
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
