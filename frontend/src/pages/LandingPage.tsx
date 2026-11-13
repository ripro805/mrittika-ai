import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Sprout,
  FlaskConical,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Zap,
  BookOpen,
} from "lucide-react";

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-mrittika-900 via-mrittika-800 to-clay-900 text-white shadow-xl px-6 py-16 sm:px-12 sm:py-20 lg:px-16">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-mrittika-200 text-xs font-semibold backdrop-blur-sm border border-white/10">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span>বাংলাদেশি কৃষকদের জন্য বাংলা-প্রথম এআই</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            সঠিক ফসল, সঠিক সার, সঠিক পরামর্শ
          </h1>

          <p className="text-base sm:text-xl text-mrittika-100 font-normal leading-relaxed">
            মাটির গুণাগুণ ও আবহাওয়ার তথ্য বিশ্লেষণ করে আপনার জমির জন্য সর্বোত্তম ফসল ও সারের সঠিক মাত্রা জেনে নিন এক ক্লিকেই।
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              to="/crop"
              className="inline-flex items-center gap-2 bg-white text-mrittika-900 hover:bg-mrittika-50 font-bold px-6 py-3.5 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 text-base"
            >
              <Sprout className="w-5 h-5 text-mrittika-700" />
              <span>ফসল সুপারিশ শুরু করুন</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/assistant"
              className="inline-flex items-center gap-2 bg-mrittika-700/60 hover:bg-mrittika-700 font-semibold px-6 py-3.5 rounded-xl border border-white/20 backdrop-blur-sm transition-colors text-base text-white"
            >
              <MessageSquare className="w-5 h-5 text-mrittika-200" />
              <span>কৃষি সহকারীকে জিজ্ঞাসা করুন</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3 Connected Modules Flow */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            তিনটি সংযুক্ত মডিউলে আধুনিক চাষাবাদ
          </h2>
          <p className="text-sm text-gray-600">
            এক মডিউলের তথ্য সরাসরি অন্য মডিউলে সংযুক্ত - সময় ও খরচ দুটোই বাঁচায়।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Module 1 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-mrittika-100 flex items-center justify-center text-mrittika-800">
                <Sprout className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">১. স্মার্ট ফসল নির্বাচন</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                মাটির নাইট্রোজেন, ফসফরাস, পটাশ, পিএইচ এবং স্থানীয় আবহাওয়া বিশ্লেষণ করে সর্বোচ্চ ফলনশীল ৩টি ফসলের তালিকা।
              </p>
            </div>
            <div className="pt-6">
              <Link
                to="/crop"
                className="text-xs font-bold text-mrittika-800 hover:text-mrittika-900 inline-flex items-center gap-1"
              >
                <span>ফসল নির্বাচন করুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Module 2 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
                <FlaskConical className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">২. সঠিক সারের হিসাব</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                নির্বাচিত ফসলের জন্য ইউরিয়া, টিএসপি, পটাশ ও জিপসাম সারের মাত্রা বিঘা ও শতক এককে প্রয়োগের সময়সূচীসহ।
              </p>
            </div>
            <div className="pt-6">
              <Link
                to="/fertilizer"
                className="text-xs font-bold text-amber-800 hover:text-amber-900 inline-flex items-center gap-1"
              >
                <span>সারের মাত্রা গণনা করুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Module 3 */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-800">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">৩. বাংলা কৃষি সহকারী</h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                প্রাকৃতিক বালাই দমন, সার প্রয়োগের কৌশল ও রোগ প্রতিরোধে প্রশ্ন করুন। সাথে নির্ভরযোগ্য নথির পৃষ্ঠা নম্বরযুক্ত তথ্যসূত্র।
              </p>
            </div>
            <div className="pt-6">
              <Link
                to="/assistant"
                className="text-xs font-bold text-blue-800 hover:text-blue-900 inline-flex items-center gap-1"
              >
                <span>সহকারীর সাথে কথা বলুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Trust Feature Grid */}
      <section className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-10 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-mrittika-100 text-mrittika-800 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-gray-900 text-sm">নিরাপত্তা ও সীমারক্ষা</h4>
            <p className="text-xs text-gray-500">
              ক্ষতিকর রাসায়নিকের মাত্রাতিরিক্ত প্রয়োগ রোধে সুরক্ষা গণ্ডি এবং কর্মকর্তা যাচাইকরণ।
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-clay-100 text-clay-800 flex items-center justify-center mx-auto">
              <BookOpen className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-gray-900 text-sm">যাচাইকৃত নথি থেকে উত্তর</h4>
            <p className="text-xs text-gray-500">
              RAG প্রযুক্তির মাধ্যমে কেবল নির্দেশিকা ভিত্তিক তথ্য, অনুমানমূলক কিছু নয়।
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <Sprout className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-gray-900 text-sm">স্থানীয় একক সুবিধা</h4>
            <p className="text-xs text-gray-500">
              বিঘা ও শতক (ডেসিমাল) এককে সহজ রূপান্তর এবং ওয়ান-ক্লিক পিডিএফ প্রিন্ট।
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
