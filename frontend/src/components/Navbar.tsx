import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import {
  Sprout,
  FlaskConical,
  MessageSquare,
  History,
  ShieldCheck,
  Info,
  User,
  LogOut,
  Menu,
  X,
  Globe,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Zap,
  Wheat,
  UserCheck,
  Loader2,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, role, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navLoggingRole, setNavLoggingRole] = useState<string | null>(null);

  const toggleLanguage = () => {
    const nextLang = i18n.language === "bn" ? "en" : "bn";
    i18n.changeLanguage(nextLang);
  };

  const navLinks = [
    { to: "/crop", label: t("nav.crop"), icon: Sprout },
    { to: "/fertilizer", label: t("nav.fertilizer"), icon: FlaskConical },
    { to: "/assistant", label: t("nav.assistant"), icon: MessageSquare },
    { to: "/history", label: t("nav.history"), icon: History, authOnly: true },
    { to: "/about", label: t("nav.about"), icon: Info },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleNavQuickLogin = async (phoneVal: string, passVal: string, targetPath: string, roleKey: string) => {
    try {
      setNavLoggingRole(roleKey);
      await login(phoneVal, passVal);
      navigate(targetPath);
      setMobileOpen(false);
    } catch {
      navigate("/login");
    } finally {
      setNavLoggingRole(null);
    }
  };

  const getPortalTarget = () => {
    if (role === "ADMIN") return "/admin-portal/overview";
    if (role === "OFFICER") return "/officer/overview";
    return "/farmer/overview";
  };

  const getPortalLabel = () => {
    if (role === "ADMIN") return "অ্যাডমিন পোর্টাল";
    if (role === "OFFICER") return "কর্মকর্তা পোর্টাল";
    return "কৃষক পোর্টাল";
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-linear-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
              <Sprout className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight leading-none">
                  মৃত্তিকা এআই
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono">
                  v2.0
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 tracking-wide block mt-0.5">
                Mrittika AI Agriculture
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex md:items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              if (link.authOnly && !isAuthenticated) return null;
              const Icon = link.icon;
              const active = location.pathname === link.to;

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    active
                      ? "bg-emerald-50 text-emerald-900 font-bold border border-emerald-200/60 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-emerald-700" : "text-slate-400"}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Actions: Quick Login, Language Switch & Auth */}
          <div className="hidden md:flex md:items-center space-x-2.5">
            {/* Quick 1-Click Role Login Dropdown */}
            <div className="relative group">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50/90 hover:bg-amber-100 text-xs font-bold text-amber-950 transition-all shadow-2xs cursor-pointer"
                title="১-ক্লিকে ভূমিকা পরীক্ষা করুন"
              >
                <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                <span>{navLoggingRole ? "প্রবেশ হচ্ছে..." : "কুইক লগইন"}</span>
                <ChevronDown className="w-3 h-3 text-amber-700 opacity-70 group-hover:rotate-180 transition-transform" />
              </button>

              {/* Hover Dropdown */}
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-2xl border border-gray-200 shadow-xl p-2 hidden group-hover:block hover:block z-50">
                <div className="px-2 py-1.5 border-b border-gray-100 mb-1">
                  <p className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    ১-ক্লিক ভূমিকা নির্বাচন
                  </p>
                  <p className="text-[10px] text-gray-500">পাসওয়ার্ড টাইপ করার প্রয়োজন নেই</p>
                </div>

                <button
                  type="button"
                  disabled={!!navLoggingRole}
                  onClick={() => handleNavQuickLogin("01720000001", "Farmer@123456", "/farmer/overview", "farmer")}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-emerald-50 text-emerald-950 transition-colors group/item cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <Wheat className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-950">🌾 কৃষক (Farmer)</p>
                      <p className="text-[10px] text-gray-500 font-mono">01720000001</p>
                    </div>
                  </div>
                  {navLoggingRole === "farmer" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover/item:translate-x-0.5 transition-transform" />
                  )}
                </button>

                <button
                  type="button"
                  disabled={!!navLoggingRole}
                  onClick={() => handleNavQuickLogin("01710000001", "Officer@123456", "/officer/overview", "officer")}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-teal-50 text-teal-950 transition-colors group/item cursor-pointer mt-1"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-teal-950">🛡️ কর্মকর্তা (Officer)</p>
                      <p className="text-[10px] text-gray-500 font-mono">01710000001</p>
                    </div>
                  </div>
                  {navLoggingRole === "officer" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-700" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover/item:translate-x-0.5 transition-transform" />
                  )}
                </button>

                <button
                  type="button"
                  disabled={!!navLoggingRole}
                  onClick={() => handleNavQuickLogin("01700000001", "Admin@123456", "/admin-portal/overview", "admin")}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-purple-50 text-purple-950 transition-colors group/item cursor-pointer mt-1"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-purple-950">👑 অ্যাডমিন (Admin)</p>
                      <p className="text-[10px] text-gray-500 font-mono">01700000001</p>
                    </div>
                  </div>
                  {navLoggingRole === "admin" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-700" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover/item:translate-x-0.5 transition-transform" />
                  )}
                </button>
              </div>
            </div>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-all shadow-2xs cursor-pointer"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{i18n.language === "bn" ? "English" : "বাংলা"}</span>
            </button>

            <div className="h-5 w-px bg-slate-200" />

            {/* Auth States */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to={getPortalTarget()}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all shadow-xs ${
                    role === "ADMIN"
                      ? "bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100"
                      : role === "OFFICER"
                      ? "bg-teal-50 text-teal-900 border-teal-200 hover:bg-teal-100"
                      : "bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100"
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-current" />
                  <span>{getPortalLabel()}</span>
                  <ChevronRight className="w-3 h-3 opacity-60" />
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50/80 transition-colors cursor-pointer"
                  title={t("nav.logout")}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-bold text-slate-700 hover:text-emerald-800 px-3 py-2 rounded-xl hover:bg-slate-100/70 transition-all"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-bold bg-emerald-800 text-white hover:bg-emerald-900 px-4 py-2 rounded-xl shadow-xs hover:shadow-sm transition-all"
                >
                  {t("nav.register")}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center md:hidden gap-2">
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50"
            >
              {i18n.language === "bn" ? "EN" : "বাং"}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200/80 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
          {navLinks.map((link) => {
            if (link.authOnly && !isAuthenticated) return null;
            const Icon = link.icon;
            const active = location.pathname === link.to;

            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold ${
                  active ? "bg-emerald-50 text-emerald-900 font-bold" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-emerald-700" : "text-slate-400"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {/* Quick Login Bar on Mobile */}
          <div className="pt-2 pb-1 border-t border-slate-100">
            <p className="text-[10px] font-bold text-gray-500 uppercase px-1 mb-1.5 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500 fill-amber-400" />
              ১-ক্লিক দ্রুত লগইন:
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleNavQuickLogin("01720000001", "Farmer@123456", "/farmer/overview", "farmer")}
                className="py-1.5 px-1 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-900 text-center"
              >
                🌾 কৃষক
              </button>
              <button
                type="button"
                onClick={() => handleNavQuickLogin("01710000001", "Officer@123456", "/officer/overview", "officer")}
                className="py-1.5 px-1 rounded-xl bg-teal-50 border border-teal-200 text-[11px] font-bold text-teal-900 text-center"
              >
                🛡️ কর্মকর্তা
              </button>
              <button
                type="button"
                onClick={() => handleNavQuickLogin("01700000001", "Admin@123456", "/admin-portal/overview", "admin")}
                className="py-1.5 px-1 rounded-xl bg-purple-50 border border-purple-200 text-[11px] font-bold text-purple-900 text-center"
              >
                👑 অ্যাডমিন
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  to={getPortalTarget()}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 text-emerald-900 font-bold text-sm"
                >
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{getPortalLabel()}</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-emerald-700" />
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  {t("nav.logout")}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-center py-2.5 text-xs font-bold text-slate-800 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="text-center py-2.5 text-xs font-bold bg-emerald-800 text-white rounded-xl shadow-xs hover:bg-emerald-900"
                >
                  {t("nav.register")}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
