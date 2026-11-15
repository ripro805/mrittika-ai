import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Sprout,
  FlaskConical,
  Bot,
  History,
  UserCheck,
  LogOut,
  Menu,
  X,
  Globe,
  ChevronRight,
  ShieldAlert,
  BarChart3,
  Users,
  ShieldCheck,
  BookOpenCheck,
  Cpu,
  ScrollText,
  Database,
  ExternalLink,
} from "lucide-react";

interface PortalLayoutProps {
  portalRole: "FARMER" | "OFFICER" | "ADMIN";
  children: React.ReactNode;
}

export const PortalLayout: React.FC<PortalLayoutProps> = ({ portalRole, children }) => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleLanguage = () => {
    const nextLang = i18n.language === "bn" ? "en" : "bn";
    i18n.changeLanguage(nextLang);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Role metadata and navigation items
  const roleConfig = {
    FARMER: {
      portalNameBn: "কৃষক ডিজিটাল পোর্টাল",
      portalNameEn: "Farmer Digital Portal",
      badgeColor: "bg-emerald-50 text-emerald-900 border-emerald-200",
      accentBg: "bg-emerald-700",
      accentHover: "hover:bg-emerald-50 text-emerald-800",
      activeNav: "bg-emerald-700 text-white font-bold shadow-sm",
      navItems: [
        { path: "/farmer/overview", labelBn: "ওভারভিউ ও আবহাওয়া", labelEn: "Overview & Weather", icon: LayoutDashboard },
        { path: "/farmer/crop-recommend", labelBn: "সেরা ফসল নির্বাচন", labelEn: "Crop Recommendation", icon: Sprout },
        { path: "/farmer/fertilizer-plan", labelBn: "সুষম সার পরিকল্পনা", labelEn: "Fertilizer Calculator", icon: FlaskConical },
        { path: "/farmer/assistant", labelBn: "এআই কৃষি সহকারী চ্যাট", labelEn: "AI Farm Assistant", icon: Bot },
        { path: "/farmer/history", labelBn: "সংরক্ষিত পরামর্শ ইতিহাস", labelEn: "Recommendation History", icon: History },
        { path: "/farmer/profile", labelBn: "খামার ও প্রোফাইল তথ্য", labelEn: "Farm Profile", icon: UserCheck },
      ],
    },
    OFFICER: {
      portalNameBn: "উপজেলা কৃষি কর্মকর্তা পোর্টাল",
      portalNameEn: "Extension Officer Portal",
      badgeColor: "bg-teal-50 text-teal-900 border-teal-200",
      accentBg: "bg-teal-700",
      accentHover: "hover:bg-teal-50 text-teal-800",
      activeNav: "bg-teal-700 text-white font-bold shadow-sm",
      navItems: [
        { path: "/officer/overview", labelBn: "কর্মকর্তা ওভারভিউ", labelEn: "Officer Overview", icon: LayoutDashboard },
        { path: "/officer/review", labelBn: "ফ্ল্যাগকৃত প্রশ্নোত্তর নিরীক্ষা", labelEn: "Flagged Answers Audit", icon: ShieldAlert },
        { path: "/officer/analytics", labelBn: "আঞ্চলিক পুষ্টি ও ফসল উপাত্ত", labelEn: "Regional Analytics", icon: BarChart3 },
        { path: "/officer/profile", labelBn: "কর্মকর্তা প্রোফাইল ও এলাকা", labelEn: "Officer Profile", icon: UserCheck },
      ],
    },
    ADMIN: {
      portalNameBn: "সিস্টেম অ্যাডমিন কমান্ড সেন্টার",
      portalNameEn: "Admin Executive Command",
      badgeColor: "bg-purple-50 text-purple-900 border-purple-200",
      accentBg: "bg-purple-700",
      accentHover: "hover:bg-purple-50 text-purple-800",
      activeNav: "bg-purple-700 text-white font-bold shadow-sm",
      navItems: [
        { path: "/admin-portal/overview", labelBn: "এক্সিকিউটিভ ওভারভিউ", labelEn: "Executive Overview", icon: LayoutDashboard },
        { path: "/admin-portal/users", labelBn: "ব্যবহারকারী ব্যবস্থাপনা", labelEn: "User Management", icon: Users },
        { path: "/admin-portal/officers", labelBn: "কর্মকর্তা যাচাই ও অনুমোদন", labelEn: "Officer Verifications", icon: ShieldCheck },
        { path: "/admin-portal/knowledge", labelBn: "কৃষি গবেষণা নথিপত্র (RAG)", labelEn: "Knowledge Base", icon: BookOpenCheck },
        { path: "/admin-portal/cache", labelBn: "এআই ক্যাশ ও অপ্টিমাইজেশন", labelEn: "AI Response Cache", icon: Database },
        { path: "/admin-portal/models", labelBn: "এআই মডেল আর্কিটেকচার", labelEn: "Model Registry", icon: Cpu },
        { path: "/admin-portal/activity-logs", labelBn: "সিস্টেম অডিট ও লগ", labelEn: "System Activity Logs", icon: ScrollText },
      ],
    },
  }[portalRole];

  // Derive current page title for breadcrumb
  const currentNav = roleConfig.navItems.find((item) => location.pathname.startsWith(item.path));
  const pageTitleBn = currentNav ? currentNav.labelBn : "ওয়ার্কস্পেস";
  const pageTitleEn = currentNav ? currentNav.labelEn : "Workspace";

  return (
    <div className="min-h-screen bg-agro-clean flex flex-col md:flex-row text-slate-900 font-sans relative selection:bg-emerald-100 selection:text-emerald-900">
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-xl border-b border-black/[0.06] sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl text-[#1d1d1f] hover:bg-black/[0.04] focus:outline-none"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link to="/" className="font-bold text-lg text-[#1d1d1f] flex items-center gap-1.5">
            <Sprout className="w-5 h-5 text-emerald-600" />
            <span>মৃত্তিকা এআই</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="px-3 py-1 text-xs font-semibold rounded-full bg-black/[0.04] border border-black/[0.06] text-[#1d1d1f] hover:bg-black/[0.08] transition"
          >
            {i18n.language === "bn" ? "English" : "বাংলা"}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#fbfbfd]/95 backdrop-blur-2xl border-r border-black/[0.06] transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto flex flex-col shadow-2xl md:shadow-none ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-black/[0.05] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center font-bold text-lg shadow-xs group-hover:scale-105 transition-all">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-[#1d1d1f] text-base leading-tight block tracking-tight">
                {t("app_name")}
              </span>
              <span className="text-[10px] text-[#86868b] font-medium tracking-wider uppercase block mt-0.5">
                Mrittika AI • Apple Edition
              </span>
            </div>
          </Link>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-full text-[#86868b] hover:text-[#1d1d1f] hover:bg-black/[0.04]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Portal Role Indicator */}
        <div className="px-5 py-3.5 bg-black/[0.02] border-b border-black/[0.05]">
          <div className={`px-3 py-1 rounded-full text-xs font-semibold border inline-flex items-center gap-1.5 ${roleConfig.badgeColor}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            <span>{i18n.language === "bn" ? roleConfig.portalNameBn : roleConfig.portalNameEn}</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {roleConfig.navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? `${roleConfig.activeNav} shadow-xs`
                    : `text-[#1d1d1f] hover:bg-black/[0.04]`
                }`}
              >
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? "text-white" : "text-[#86868b]"}`} />
                <span className="truncate">
                  {i18n.language === "bn" ? item.labelBn : item.labelEn}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Public Home Link */}
        <div className="px-4 py-2 border-t border-black/[0.05]">
          <Link
            to="/"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#1d1d1f] hover:bg-black/[0.04] transition"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-[#86868b]" />
              <span>{i18n.language === "bn" ? "পাবলিক হোমপেজ" : "Public Homepage"}</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#86868b]" />
          </Link>
        </div>

        {/* User Card & Logout in Sidebar Footer */}
        <div className="p-4 border-t border-black/[0.05] bg-black/[0.02]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-center flex-shrink-0 border border-emerald-200">
                {user?.name ? user.name.slice(0, 2) : "AI"}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-[#1d1d1f] truncate">{user?.name || "ব্যবহারকারী"}</p>
                <p className="text-[10px] text-[#86868b] truncate font-mono font-medium">{user?.district ? `${user.district}, ${user.upazila}` : user?.phone}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="লগআউট"
              className="p-2 rounded-full text-[#86868b] hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Desktop Top Nav */}
        <header className="hidden md:flex items-center justify-between px-8 py-3.5 bg-white/80 backdrop-blur-xl border-b border-black/[0.06] sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-medium text-[#86868b]">
            <Link to="/" className="hover:text-emerald-700 transition">
              {i18n.language === "bn" ? "হোম" : "Home"}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-black/30" />
            <span className="text-[#1d1d1f] font-semibold">
              {i18n.language === "bn" ? roleConfig.portalNameBn : roleConfig.portalNameEn}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-black/30" />
            <span className="text-emerald-800 font-bold">
              {i18n.language === "bn" ? pageTitleBn : pageTitleEn}
            </span>
          </div>

          {/* Right Tools: Language + Profile */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-black/[0.03] border border-black/[0.06] text-[#1d1d1f] hover:bg-black/[0.06] transition cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#86868b]" />
              <span>{i18n.language === "bn" ? "English" : "বাংলা"}</span>
            </button>

            <div className="h-4 w-px bg-black/[0.08]" />

            <div className="flex items-center gap-2.5">
              <div className="text-right">
                <span className="text-xs font-bold text-[#1d1d1f] block leading-tight">{user?.name}</span>
                <span className="text-[10px] text-[#86868b] block leading-tight font-mono">{user?.role}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-3.5 py-1.5 rounded-full border border-black/[0.08] text-xs font-semibold text-[#1d1d1f] hover:text-red-600 hover:border-red-200 hover:bg-red-50/50 transition cursor-pointer"
              >
                {i18n.language === "bn" ? "লগআউট" : "Logout"}
              </button>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 2xl:p-10 w-full max-w-[1680px] 2xl:max-w-[1760px] mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
        />
      )}
    </div>
  );
};
