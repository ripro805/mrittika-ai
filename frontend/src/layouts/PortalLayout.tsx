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
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
      accentBg: "bg-emerald-700",
      accentHover: "hover:bg-emerald-50 text-emerald-800",
      activeNav: "bg-emerald-800 text-white font-bold shadow-xs",
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
      badgeColor: "bg-teal-100 text-teal-800 border-teal-300",
      accentBg: "bg-teal-700",
      accentHover: "hover:bg-teal-50 text-teal-800",
      activeNav: "bg-teal-800 text-white font-bold shadow-xs",
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
      badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
      accentBg: "bg-purple-700",
      accentHover: "hover:bg-purple-50 text-purple-800",
      activeNav: "bg-purple-800 text-white font-bold shadow-xs",
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
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row text-gray-900 font-sans">
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl text-gray-700 hover:bg-gray-100 focus:outline-none"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link to="/" className="font-extrabold text-lg text-emerald-800 flex items-center gap-1.5">
            <Sprout className="w-5 h-5 text-emerald-600" />
            <span>মৃত্তিকা এআই</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 border border-gray-300 hover:bg-gray-200 transition"
          >
            {i18n.language === "bn" ? "English" : "বাংলা"}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:inset-auto flex flex-col shadow-lg md:shadow-none ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-gray-900 text-base leading-tight block">
                মৃত্তিকা এআই
              </span>
              <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase block">
                Mrittika AI • BD
              </span>
            </div>
          </Link>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Portal Role Indicator */}
        <div className="px-5 py-3.5 bg-gray-50/80 border-b border-gray-100">
          <div className={`px-2.5 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 ${roleConfig.badgeColor}`}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
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
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? roleConfig.activeNav
                    : `text-gray-700 hover:bg-gray-100`
                }`}
              >
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? "text-white" : "text-gray-500"}`} />
                <span className="truncate">
                  {i18n.language === "bn" ? item.labelBn : item.labelEn}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Public Home Link */}
        <div className="px-4 py-2 border-t border-gray-100">
          <Link
            to="/"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-100 transition"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
              <span>{i18n.language === "bn" ? "পাবলিক হোমপেজ" : "Public Homepage"}</span>
            </span>
            <ChevronRight className="w-3 h-3 text-gray-400" />
          </Link>
        </div>

        {/* User Card & Logout in Sidebar Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center flex-shrink-0">
                {user?.name ? user.name.slice(0, 2) : "AI"}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-gray-900 truncate">{user?.name || "ব্যবহারকারী"}</p>
                <p className="text-[10px] text-gray-500 truncate">{user?.district ? `${user.district}, ${user.upazila}` : user?.phone}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="লগআউট"
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Desktop Top Nav */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
            <Link to="/" className="hover:text-emerald-700 transition">
              {i18n.language === "bn" ? "হোম" : "Home"}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-700">
              {i18n.language === "bn" ? roleConfig.portalNameBn : roleConfig.portalNameEn}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-emerald-800 font-bold">
              {i18n.language === "bn" ? pageTitleBn : pageTitleEn}
            </span>
          </div>

          {/* Right Tools: Language + Profile */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 transition"
            >
              <Globe className="w-3.5 h-3.5 text-gray-500" />
              <span>{i18n.language === "bn" ? "English" : "বাংলা"}</span>
            </button>

            <div className="h-5 w-px bg-gray-200" />

            <div className="flex items-center gap-2">
              <div className="text-right">
                <span className="text-xs font-bold text-gray-800 block leading-tight">{user?.name}</span>
                <span className="text-[10px] text-gray-500 block leading-tight">{user?.role}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition"
              >
                {i18n.language === "bn" ? "লগআউট" : "Logout"}
              </button>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden"
        />
      )}
    </div>
  );
};
