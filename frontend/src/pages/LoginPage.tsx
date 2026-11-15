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
      bgLight: "bg-emerald-50/80 hover:bg-emerald-100/90 border-emerald-200 text-emerald-900",
      btnBg: "bg-emerald-800 hover:bg-emerald-900 text-white",
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
      bgLight: "bg-teal-50/80 hover:bg-teal-100/90 border-teal-200 text-teal-900",
      btnBg: "bg-teal-800 hover:bg-teal-900 text-white",
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
      bgLight: "bg-purple-50/80 hover:bg-purple-100/90 border-purple-200 text-purple-900",
      btnBg: "bg-purple-800 hover:bg-purple-900 text-white",
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
      const msg =
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.response?.data?.message ||
        (err.response
          ? "মোবাইল নম্বর বা পাসওয়ার্ড ভুল হয়েছে।"
          : "সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি (Network Error)। ব্যাকএন্ড চালু আছে কি না পরীক্ষা করুন।");
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
      setActiveRoleLoggingIn(null);
    }
  };

  const handleQuickLogin = (acc: typeof DEMO_ACCOUNTS[0]) => {
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
    <div className="max-w-xl mx-auto py-10 px-4">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-sm">
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">লগইন করুন</h1>
          <p className="text-xs text-gray-500">
            সংরক্ষিত ফসলের হিসাব ও ইতিহাস দেখতে আপনার অ্যাকাউন্টে প্রবেশ করুন
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1-Click Quick Login Cards */}
        <div className="bg-linear-to-b from-emerald-50/80 via-teal-50/50 to-slate-50 p-4 sm:p-5 rounded-2xl border border-emerald-200/70 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-950 uppercase tracking-wider">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
              ১-ক্লিক কুইক লগইন (Quick Login)
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-200/60 text-emerald-900">
              অটো-লগইন
            </span>
          </div>

          <p className="text-[11px] text-gray-600 leading-relaxed">
            যেকোনো ভূমিকায় সরাসরি প্রবেশ করতে নিচের কার্ডে চাপুন (পাসওয়ার্ড টাইপ করার প্রয়োজন নেই):
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
                  className={`group text-left p-3 rounded-xl border transition-all shadow-xs hover:shadow-md flex flex-col justify-between gap-2.5 ${acc.bgLight} disabled:opacity-60 cursor-pointer`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white/90 shadow-2xs flex items-center justify-center">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold">{acc.title}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-medium opacity-80 truncate">{acc.name}</p>
                    <p className="text-[10px] font-mono opacity-70 tracking-tight">{acc.phone}</p>
                  </div>

                  <div className={`w-full py-1.5 px-2 rounded-lg ${acc.btnBg} text-[11px] font-bold flex items-center justify-center gap-1 shadow-2xs group-hover:scale-[1.02] transition-transform`}>
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
          <div className="grow border-t border-gray-200"></div>
          <span className="shrink mx-4 text-gray-400 text-[11px] font-medium">বা মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে লগইন করুন</span>
          <div className="grow border-t border-gray-200"></div>
        </div>

        {/* Manual Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              মোবাইল নম্বর (Phone)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="01712345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              পাসওয়ার্ড (Password)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isLoading && !activeRoleLoggingIn && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>লগইন করুন</span>
          </button>
        </form>

        <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
          অ্যাকাউন্ট নেই?{" "}
          <Link to="/register" className="font-bold text-emerald-800 hover:underline">
            নতুন কৃষক বা কর্মকর্তা হিসেবে নিবন্ধন করুন
          </Link>
        </div>
      </div>
    </div>
  );
};
