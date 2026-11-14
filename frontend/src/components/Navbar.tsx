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
  Sparkles,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const getPortalTarget = () => {
    if (role === "ADMIN") return "/admin-portal/overview";
    if (role === "OFFICER") return "/officer/overview";
    return "/farmer/overview";
  };

  const getPortalLabel = () => {
    if (role === "ADMIN") return i18n.language === "bn" ? "অ্যাডমিন পোর্টাল" : "Admin Portal";
    if (role === "OFFICER") return i18n.language === "bn" ? "কর্মকর্তা পোর্টাল" : "Officer Portal";
    return i18n.language === "bn" ? "কৃষক পোর্টাল" : "Farmer Portal";
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 flex items-center justify-center text-white shadow-sm border border-emerald-700/30 group-hover:scale-[1.02] transition-transform">
                <Sprout className="w-5 h-5 text-emerald-300" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold text-slate-900 tracking-tight leading-tight group-hover:text-emerald-800 transition-colors">
                  {t("app_name")}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
                  Agricultural AI • BD
                </span>
              </div>
            </Link>
          </div>

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

          {/* Right Actions: Language Switch & Auth */}
          <div className="hidden md:flex md:items-center space-x-3">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-all shadow-2xs"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{i18n.language === "bn" ? "English" : "বাংলা"}</span>
            </button>

            <div className="h-5 w-px bg-slate-200" />

            {/* Auth States */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2.5">
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
                  className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50/80 transition-colors"
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

          <div className="pt-3 border-t border-slate-100">
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
