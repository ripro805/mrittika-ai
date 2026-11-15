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
  const [quickOpen, setQuickOpen] = useState(false);
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
    <nav className="sticky top-0 z-50 bg-white/80 supports-[backdrop-filter]:bg-white/70 backdrop-blur-xl border-b border-black/[0.06] shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex-shrink-0 transition-all">
      <div className="max-w-[1680px] 2xl:max-w-[1760px] w-full mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="flex items-center justify-between min-h-[68px] py-2.5">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group flex-shrink-0 select-none overflow-visible">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center shadow-xs border border-emerald-700/50 group-hover:scale-105 transition-all flex-shrink-0">
              <Sprout className="w-5 h-5 text-emerald-100" />
            </div>
            <div className="flex flex-col justify-center flex-shrink-0 overflow-visible py-0.5">
              <div className="flex items-center gap-1.5 whitespace-nowrap overflow-visible">
                <span className="font-bold text-base sm:text-[17px] text-[#1d1d1f] tracking-tight leading-normal whitespace-nowrap pt-0.5">
                  {t("app_name")}
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 leading-none whitespace-nowrap">
                  v2.0
                </span>
              </div>
              <span className="text-[11px] font-medium text-[#86868b] tracking-normal block leading-normal whitespace-nowrap">
                {i18n.language === "en" ? "Smart Agriculture Advisory" : "স্মার্ট কৃষি পরামর্শ প্ল্যাটফর্ম"}
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links (Apple Segmented Pill Styling) */}
          <div className="hidden lg:flex items-center p-1 bg-black/[0.03] rounded-full border border-black/[0.04] space-x-0.5 flex-shrink-0">
            {navLinks.map((link) => {
              if (link.authOnly && !isAuthenticated) return null;
              const Icon = link.icon;
              const active = location.pathname === link.to;

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                    active
                      ? "bg-white text-[#1d1d1f] font-semibold shadow-xs border border-black/[0.04]"
                      : "text-[#1d1d1f]/70 hover:text-[#1d1d1f] hover:bg-black/[0.03]"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${active ? "text-emerald-700" : "text-[#86868b]"}`} />
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
                id="quick-login-toggle"
                type="button"
                onClick={() => setQuickOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-black/[0.08] bg-white hover:bg-[#f5f5f7] text-xs font-semibold text-[#1d1d1f] transition-all shadow-2xs cursor-pointer active:scale-98"
                title={i18n.language === "en" ? "1-Click Role Switch" : "১-ক্লিকে ভূমিকা পরীক্ষা করুন"}
              >
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>
                  {navLoggingRole
                    ? (i18n.language === "en" ? "Entering..." : "প্রবেশ হচ্ছে...")
                    : (i18n.language === "en" ? "Quick Login" : "কুইক লগইন")}
                </span>
                <ChevronDown className={`w-3 h-3 text-[#86868b] transition-transform ${quickOpen ? "rotate-180" : "group-hover:rotate-180"}`} />
              </button>

              {/* Hover & Click Dropdown */}
              <div
                id="quick-login-menu"
                className={`absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-2xl rounded-2xl border border-black/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.12)] p-2 z-50 ${
                  quickOpen ? "block" : "hidden group-hover:block hover:block"
                }`}
              >
                <div className="px-2.5 py-1.5 border-b border-black/[0.05] mb-1">
                  <p className="text-[10px] font-bold text-[#1d1d1f] uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    {i18n.language === "en" ? "1-Click Role Switch" : "১-ক্লিক ভূমিকা নির্বাচন"}
                  </p>
                  <p className="text-[10px] text-[#86868b]">
                    {i18n.language === "en" ? "No password entry required" : "পাসওয়ার্ড টাইপ করার প্রয়োজন নেই"}
                  </p>
                </div>

                <button
                  id="quick-role-farmer"
                  type="button"
                  disabled={!!navLoggingRole}
                  onClick={() => {
                    setQuickOpen(false);
                    handleNavQuickLogin("01720000001", "Farmer@123456", "/farmer/overview", "farmer");
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-emerald-50 text-[#1d1d1f] transition-colors group/item cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <Wheat className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#1d1d1f]">
                        {i18n.language === "en" ? "🌾 Farmer" : "🌾 কৃষক (Farmer)"}
                      </p>
                      <p className="text-[10px] text-[#86868b] font-mono">01720000001</p>
                    </div>
                  </div>
                  {navLoggingRole === "farmer" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-[#86868b] group-hover/item:translate-x-0.5 transition-transform" />
                  )}
                </button>

                <button
                  id="quick-role-officer"
                  type="button"
                  disabled={!!navLoggingRole}
                  onClick={() => {
                    setQuickOpen(false);
                    handleNavQuickLogin("01710000001", "Officer@123456", "/officer/overview", "officer");
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-teal-50 text-[#1d1d1f] transition-colors group/item cursor-pointer mt-1"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#1d1d1f]">
                        {i18n.language === "en" ? "🛡️ Extension Officer" : "🛡️ কর্মকর্তা (Officer)"}
                      </p>
                      <p className="text-[10px] text-[#86868b] font-mono">01710000001</p>
                    </div>
                  </div>
                  {navLoggingRole === "officer" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-700" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-[#86868b] group-hover/item:translate-x-0.5 transition-transform" />
                  )}
                </button>

                <button
                  id="quick-role-admin"
                  type="button"
                  disabled={!!navLoggingRole}
                  onClick={() => {
                    setQuickOpen(false);
                    handleNavQuickLogin("01700000001", "Admin@123456", "/admin-portal/overview", "admin");
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-purple-50 text-[#1d1d1f] transition-colors group/item cursor-pointer mt-1"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#1d1d1f]">
                        {i18n.language === "en" ? "👑 System Admin" : "👑 অ্যাডমিন (Admin)"}
                      </p>
                      <p className="text-[10px] text-[#86868b] font-mono">01700000001</p>
                    </div>
                  </div>
                  {navLoggingRole === "admin" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-700" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-[#86868b] group-hover/item:translate-x-0.5 transition-transform" />
                  )}
                </button>
              </div>
            </div>

            {/* Apple Segmented Language Switcher */}
            <div className="inline-flex items-center p-0.5 bg-black/[0.04] rounded-full border border-black/[0.04]">
              <button
                onClick={() => i18n.language !== "bn" && toggleLanguage()}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  i18n.language === "bn"
                    ? "bg-white text-[#1d1d1f] shadow-2xs font-bold"
                    : "text-[#86868b] hover:text-[#1d1d1f]"
                }`}
              >
                বাংলা
              </button>
              <button
                onClick={() => i18n.language !== "en" && toggleLanguage()}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  i18n.language === "en"
                    ? "bg-white text-[#1d1d1f] shadow-2xs font-bold"
                    : "text-[#86868b] hover:text-[#1d1d1f]"
                }`}
              >
                EN
              </button>
            </div>

            <div className="h-4 w-px bg-black/[0.08]" />

            {/* Auth States */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to={getPortalTarget()}
                  className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border transition-all shadow-2xs active:scale-98 ${
                    role === "ADMIN"
                      ? "bg-purple-50 text-purple-900 border-purple-200/80 hover:bg-purple-100"
                      : role === "OFFICER"
                      ? "bg-teal-50 text-teal-900 border-teal-200/80 hover:bg-teal-100"
                      : "bg-emerald-50 text-emerald-900 border-emerald-200/80 hover:bg-emerald-100"
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-current" />
                  <span>{getPortalLabel()}</span>
                  <ChevronRight className="w-3 h-3 opacity-60" />
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full text-[#86868b] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title={t("nav.logout")}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-[#1d1d1f] hover:text-black px-3.5 py-1.5 rounded-full hover:bg-black/[0.04] transition-colors"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  to="/register"
                  className="app-btn-primary text-xs px-4 py-1.5 rounded-full"
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
              className="px-3 py-1 rounded-full border border-black/[0.08] text-xs font-semibold text-[#1d1d1f] bg-white shadow-2xs cursor-pointer active:scale-95"
            >
              {i18n.language === "bn" ? "EN" : "বাং"}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-full text-[#1d1d1f] hover:bg-black/[0.05] focus:outline-none cursor-pointer transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Drawer (Apple iOS style sheet) */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-black/[0.06] bg-white/95 backdrop-blur-2xl px-4 pt-3 pb-5 space-y-2 shadow-xl">
          {navLinks.map((link) => {
            if (link.authOnly && !isAuthenticated) return null;
            const Icon = link.icon;
            const active = location.pathname === link.to;

            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                  active ? "bg-emerald-50 text-emerald-950 font-bold border border-emerald-200/60" : "text-[#1d1d1f] hover:bg-black/[0.03]"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-emerald-700" : "text-[#86868b]"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {/* Quick Login Bar on Mobile */}
          <div className="pt-2 pb-1 border-t border-black/[0.06]">
            <p className="text-[11px] font-bold text-[#1d1d1f] uppercase px-1 mb-1.5 flex items-center gap-1 font-bangla">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              {i18n.language === "en" ? "1-Click Quick Login:" : "১-ক্লিক দ্রুত লগইন:"}
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleNavQuickLogin("01720000001", "Farmer@123456", "/farmer/overview", "farmer")}
                className="py-1.5 px-1 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-900 text-center active:scale-95 transition-transform"
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
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 text-emerald-950 font-bold text-sm border border-emerald-200/60"
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
                  className="w-full text-left px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition"
                >
                  {t("nav.logout")}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-center py-2.5 text-xs font-semibold text-[#1d1d1f] border border-black/[0.08] rounded-full bg-white hover:bg-[#f5f5f7] transition-all shadow-2xs"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="app-btn-primary text-center py-2.5 text-xs rounded-full"
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
