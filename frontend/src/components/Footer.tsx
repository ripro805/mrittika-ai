import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Sprout,
  ShieldCheck,
  Heart,
  ExternalLink,
  BookOpen,
  Award,
  AlertTriangle,
} from "lucide-react";

export const Footer: React.FC = () => {
  const { t, i18n } = useTranslation();

  return (
    <footer className="bg-[#fbfbfd] border-t border-black/[0.06] mt-20 text-[#86868b]">
      {/* Prominent Agricultural Research Disclaimer Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/15 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2.5 text-xs text-amber-950 font-medium text-center">
          <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
          <span>{t("disclaimer")}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Col 1: Brand & National Initiative (2 cols wide on desktop) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-xs">
                <Sprout className="w-5 h-5 text-emerald-100" />
              </div>
              <span className="text-xl font-bold text-[#1d1d1f] tracking-tight">
                মৃত্তিকা এআই (Mrittika AI)
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-[#86868b] leading-relaxed max-w-sm">
              {i18n.language === "bn"
                ? "বাংলাদেশের কৃষকদের জন্য কৃত্রিম বুদ্ধিমত্তা ও জাতীয় কৃষি গবেষণা তথ্যের সমন্বয়ে তৈরি আধুনিক, নির্ভরযোগ্য ও নিরপেক্ষ সিদ্ধান্ত সহায়ক প্ল্যাটফর্ম।"
                : "A modern, reliable agricultural decision-support platform designed for Bangladeshi farmers using AI and national research guidelines."}
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>BARC, BRRI ও BARI সরকারি সুপারিশ নির্দেশিকা সম্মত</span>
            </div>
          </div>

          {/* Col 2: Intelligent Modules */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {i18n.language === "bn" ? "কৃষি মডিউল" : "Core Modules"}
            </h4>
            <ul className="space-y-2 text-xs font-medium text-slate-600">
              <li>
                <Link to="/crop" className="hover:text-emerald-700 transition">
                  {i18n.language === "bn" ? "সেরা ফসল নির্বাচন" : "Crop Suitability"}
                </Link>
              </li>
              <li>
                <Link to="/fertilizer" className="hover:text-emerald-700 transition">
                  {i18n.language === "bn" ? "সুষম সারের হিসাব" : "Fertilizer Calculator"}
                </Link>
              </li>
              <li>
                <Link to="/assistant" className="hover:text-emerald-700 transition">
                  {i18n.language === "bn" ? "বাংলা কৃষি সহকারী" : "Bangla AI Assistant"}
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-emerald-700 transition">
                  {i18n.language === "bn" ? "সংরক্ষিত পরামর্শ ইতিহাস" : "Saved Advisories"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Three Dedicated Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {i18n.language === "bn" ? "ব্যবহারকারী পোর্টাল" : "User Portals"}
            </h4>
            <ul className="space-y-2 text-xs font-medium text-slate-600">
              <li>
                <Link to="/farmer/overview" className="hover:text-emerald-700 transition flex items-center gap-1.5">
                  <span>{i18n.language === "bn" ? "কৃষক ডিজিটাল পোর্টাল" : "Farmer Portal"}</span>
                </Link>
              </li>
              <li>
                <Link to="/officer/overview" className="hover:text-teal-700 transition flex items-center gap-1.5">
                  <span>{i18n.language === "bn" ? "উপজেলা কর্মকর্তা পোর্টাল" : "Officer Portal"}</span>
                </Link>
              </li>
              <li>
                <Link to="/admin-portal/overview" className="hover:text-purple-700 transition flex items-center gap-1.5">
                  <span>{i18n.language === "bn" ? "অ্যাডমিন কমান্ড সেন্টার" : "Admin Command"}</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-slate-900 transition">
                  {i18n.language === "bn" ? "মডেল ও কারিগরি বিবরণ" : "Model Architecture"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: National Scientific Backing */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {i18n.language === "bn" ? "গবেষণা সহযোগী" : "Research Citations"}
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-600">
              <li>BARC — সার নির্দেশিকা ২০২৪</li>
              <li>BRRI — ব্রি আধুনিক ধানের চাষ</li>
              <li>BARI — সবজি ও ডালফসল গাইড</li>
              <li>DAE — কৃষি সম্প্রসারণ অধিদপ্তর</li>
              <li>BMD — ৩০টি কৃষি পরিবেশ অঞ্চল (AEZ)</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-600 font-bangla">
          <p>
            © {new Date().getFullYear()} Mrittika AI (মৃত্তিকা এআই) • সর্বস্বত্ব সংরক্ষিত।
          </p>

          <p className="flex items-center gap-1.5">
            <span>তৈরি করা হয়েছে</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>দিয়ে বাংলাদেশের কৃষকদের সমৃদ্ধির লক্ষ্যে</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
