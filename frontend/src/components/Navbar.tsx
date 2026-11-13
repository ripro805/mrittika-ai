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
    { to: "/officer", label: t("nav.officer_dash"), icon: ShieldCheck, officerOnly: true },
    { to: "/about", label: t("nav.about"), icon: Info },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isOfficerOrAdmin = role === "OFFICER" || role === "ADMIN";

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-mrittika-800 flex items-center justify-center text-white shadow-md">
                <Sprout className="w-6 h-6 text-mrittika-300" />
              </div>
              <div>
                <span className="text-xl font-bold text-mrittika-900 tracking-tight block leading-none">
                  মৃত্তিকা এআই
                </span>
                <span className="text-xs text-clay-600 font-medium tracking-wide">
                  Mrittika AI
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex md:items-center md:space-x-1 lg:space-x-3">
            {navLinks.map((link) => {
              if (link.authOnly && !isAuthenticated) return null;
              if (link.officerOnly && !isOfficerOrAdmin) return null;
              const Icon = link.icon;
              const active = location.pathname === link.to;

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-mrittika-100 text-mrittika-900 font-bold"
                      : "text-gray-700 hover:bg-gray-100 hover:text-mrittika-800"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-mrittika-800" : "text-gray-500"}`} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Actions: Language Switch & Auth */}
          <div className="hidden md:flex md:items-center md:space-x-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-mrittika-700" />
              {i18n.language === "bn" ? "English" : "বাংলা"}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-800 text-xs font-semibold hover:bg-gray-200 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-mrittika-800" />
                  <span className="max-w-[100px] truncate">{user?.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title={t("nav.logout")}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-bold text-mrittika-800 hover:text-mrittika-900 px-3 py-1.5"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-bold bg-mrittika-800 text-white hover:bg-mrittika-900 px-3.5 py-1.5 rounded-lg shadow-sm transition-colors"
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
              className="p-2 rounded-md text-gray-700 border border-gray-300 text-xs font-bold"
            >
              {i18n.language === "bn" ? "EN" : "বাং"}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            if (link.authOnly && !isAuthenticated) return null;
            if (link.officerOnly && !isOfficerOrAdmin) return null;
            const Icon = link.icon;
            const active = location.pathname === link.to;

            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium ${
                  active ? "bg-mrittika-100 text-mrittika-900 font-bold" : "text-gray-700"
                }`}
              >
                <Icon className="w-4 h-4 text-mrittika-800" />
                {link.label}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-gray-200">
            {isAuthenticated ? (
              <div className="flex items-center justify-between py-2">
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-semibold text-gray-800 flex items-center gap-1.5"
                >
                  <User className="w-4 h-4 text-mrittika-700" />
                  {user?.name}
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="text-xs font-bold text-red-600 hover:underline"
                >
                  {t("nav.logout")}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-center py-2 text-sm font-bold text-mrittika-800 border border-mrittika-800 rounded-md"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="text-center py-2 text-sm font-bold bg-mrittika-800 text-white rounded-md shadow-sm"
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
