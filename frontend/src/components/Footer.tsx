import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { AlertTriangle, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      {/* Prominent Agricultural Disclaimer */}
      <div className="bg-amber-50 border-b border-amber-200 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-xs sm:text-sm text-amber-900 font-medium text-center">
          <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
          <span>{t("disclaimer")}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center md:text-left">
          <div>
            <span className="text-lg font-bold text-mrittika-900 block">মৃত্তিকা এআই (Mrittika AI)</span>
            <p className="text-xs text-gray-500 mt-1">
              বাংলাদেশের কৃষকদের জন্য কৃত্রিম বুদ্ধিমত্তানির্ভর আধুনিক কৃষি উপদেষ্টা প্ল্যাটফর্ম।
            </p>
          </div>

          <div className="flex justify-center space-x-6 text-xs font-semibold text-gray-600">
            <Link to="/crop" className="hover:text-mrittika-800">ফসল নির্বাচন</Link>
            <Link to="/fertilizer" className="hover:text-mrittika-800">সারের হিসাব</Link>
            <Link to="/assistant" className="hover:text-mrittika-800">কৃষি সহকারী</Link>
            <Link to="/about" className="hover:text-mrittika-800">মডেল ও ডেটাসেট</Link>
          </div>

          <div className="text-xs text-gray-500 md:text-right">
            <p className="flex items-center justify-center md:justify-end gap-1">
              তৈরি করা হয়েছে <Heart className="w-3.5 h-3.5 text-red-500 inline fill-current" /> দিয়ে বাংলাদেশের কৃষকদের জন্য
            </p>
            <p className="mt-1">গবেষণা ও সিদ্ধান্ত সহায়ক সিস্টেম • ২০২৬</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
