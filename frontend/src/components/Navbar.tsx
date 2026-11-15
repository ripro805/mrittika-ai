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
    if (role === "ADMIN") return i18n.language === "en" ? "Admin Portal" : "অ্যাডমিন পোর্টাল";
    if (role === "OFFICER") return i18n.language === "en" ? "Officer Portal" : "কর্মকর্তা পোর্টাল";
    return i18n.language === "en" ? "Farmer Portal" : "কৃষক পোর্টাল";
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs flex-shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group flex-shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs border border-emerald-800 group-hover:bg-emerald-800 transition-colors flex-shrink-0">
              <Sprout className="w-5 h-5 text-emerald-100" />
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight leading-none whitespace-nowrap">
                  {t("app_name")}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 leading-none whitespace-nowrap">
                  v2.0
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-500 tracking-wide block mt-1 leading-none whitespace-nowrap">
                {i18n.language === "en" ? "Smart Agriculture Advisory" : "স্মার্ট কৃষি পরামর্শ প্ল্যাটফর্ম"}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-1 flex-shrink-0">
            {navLinks.map((link) => {
              if (link.authOnly && !isAuthenticated) return null;
              const Icon = link.icon;
              const active = location.pathname === link.to;

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 xl:gap-2 px-2.5 xl:px-3.5 py-2 rounded-xl text-xs xl:text-sm font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
                    active
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200/90 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-emerald-700" : "text-slate-500"}`} />
                  <span className="whitespace-nowrap">{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Actions: Quick Login, Language Switch & Auth */}
          <div className="hidden lg:flex items-center space-x-2 xl:space-x-2.5 flex-shrink-0">
            {/* Quick 1-Click Role Login Dropdown */}
            <div className="relative group">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors shadow-2xs cursor-pointer"
                title={i18n.language === "en" ? "1-Click Role Switch" : "১-ক্লিকে ভূমিকা পরীক্ষা করুন"}
              >
                <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                <span>
                  {navLoggingRole
                    ? (i18n.language === "en" ? "Entering..." : "প্রবেশ হচ্ছে...")
                    : (i18n.language === "en" ? "Quick Login" : "কুইক লগইন")}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-500 group-hover:rotate-180 transition-transform" />
              </button>

              {/* Hover Dropdown */}
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 hidden group-hover:block hover:block z-50">
                <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1">
                  <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    {i18n.language === "en" ? "1-Click Role Switch" : "১-ক্লিক ভূমিকা নির্বাচন"}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {i18n.language === "en" ? "No password entry required" : "পাসওয়ার্ড টাইপ করার প্রয়োজন নেই"}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={!!navLoggingRole}
                  onClick={() => handleNavQuickLogin("01720000001", "Farmer@123456", "/farmer/overview", "farmer")}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-emerald-50 text-slate-900 transition-colors group/item cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <Wheat className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {i18n.language === "en" ? "🌾 Farmer" : "🌾 কৃষক (Farmer)"}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">01720000001</p>
                    </div>
                  </div>
                  {navLoggingRole === "farmer" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover/item:translate-x-0.5 transition-transform" />
                  )}
                </button>

                <button
                  type="button"
                  disabled={!!navLoggingRole}
                  onClick={() => handleNavQuickLogin("01710000001", "Officer@123456", "/officer/overview", "officer")}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-teal-50 text-slate-900 transition-colors group/item cursor-pointer mt-1"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {i18n.language === "en" ? "🛡️ Extension Officer" : "🛡️ কর্মকর্তা (Officer)"}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">01710000001</p>
                    </div>
                  </div>
                  {navLoggingRole === "officer" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-700" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover/item:translate-x-0.5 transition-transform" />
                  )}
                </button>

                <button
                  type="button"
                  disabled={!!navLoggingRole}
                  onClick={() => handleNavQuickLogin("01700000001", "Admin@123456", "/admin-portal/overview", "admin")}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-purple-50 text-slate-900 transition-colors group/item cursor-pointer mt-1"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {i18n.language === "en" ? "👑 System Admin" : "👑 অ্যাডমিন (Admin)"}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">01700000001</p>
                    </div>
                  </div>
                  {navLoggingRole === "admin" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-700" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover/item:translate-x-0.5 transition-transform" />
                  )}
                </button>
              </div>
            </div>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
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
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-colors shadow-2xs ${
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
                  className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title={t("nav.logout")}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  to="/register"
                  className="app-btn-primary text-xs px-4 py-1.5"
                >
                  {t("nav.register")}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile / Tablet hamburger */}
          <div className="flex items-center lg:hidden gap-2">
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 cursor-pointer"
            >
              {i18n.language === "bn" ? "EN" : "বাং"}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200/80 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
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
                <Icon className={`w-4 h-4 ${active ? "text-emerald-700" : "text-slate-500"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {/* Quick Login Bar on Mobile */}
          <div className="pt-2 pb-1 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-700 uppercase px-1 mb-1.5 flex items-center gap-1 font-bangla">
              <Zap className="w-3 h-3 text-amber-500 fill-amber-400" />
              {i18n.language === "en" ? "1-Click Quick Login:" : "১-ক্লিক দ্রুত লগইন:"}
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleNavQuickLogin("01720000001", "Farmer@123456", "/farmer/overview", "farmer")}
                className="py-1.5 px-1 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-900 text-center"
              >
                {i18n.language === "en" ? "🌾 Farmer" : "🌾 কৃষক"}
              </button>
              <button
                type="button"
                onClick={() => handleNavQuickLogin("01710000001", "Officer@123456", "/officer/overview", "officer")}
                className="py-1.5 px-1 rounded-xl bg-teal-50 border border-teal-200 text-[11px] font-bold text-teal-900 text-center"
              >
                {i18n.language === "en" ? "🛡️ Officer" : "🛡️ কর্মকর্তা"}
              </button>
              <button
                type="button"
                onClick={() => handleNavQuickLogin("01700000001", "Admin@123456", "/admin-portal/overview", "admin")}
                className="py-1.5 px-1 rounded-xl bg-purple-50 border border-purple-200 text-[11px] font-bold text-purple-900 text-center"
              >
                {i18n.language === "en" ? "👑 Admin" : "👑 অ্যাডমিন"}
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
                  className="text-center py-2 text-xs font-semibold text-slate-800 border border-slate-300 rounded-xl bg-white hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="app-btn-primary text-center py-2 text-xs"
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
