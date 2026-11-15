import React, { useState, useEffect } from "react";
import apiClient from "../services/api";
import { Info, AlertTriangle, ShieldCheck, Database, Cpu, Award } from "lucide-react";

export const AboutModelInfoPage: React.FC = () => {
  const [modelInfo, setModelInfo] = useState<any | null>(null);

  useEffect(() => {
    apiClient.get("/model-info/").then((res) => {
      setModelInfo(res.data);
    }).catch(() => {});
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Title */}
      <div className="text-center space-y-2.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-900 text-xs font-bold border border-blue-200 shadow-2xs">
          <Info className="w-3.5 h-3.5 text-blue-700" />
          <span>প্রযুক্তিগত পরিচিতি ও মডেল মেট্রিক্স</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          মৃত্তিকা এআই: মডেল আর্কিটেকচার ও সীমাবদ্ধতা
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed font-bangla">
          মেশিন লার্নিং মডেলের কাঠামো, প্রশিক্ষণ ফলাফল, ডেটাসেট পরিসংখ্যান ও সিন্থেটিক তথ্যের সীমাবদ্ধতার বিবরণ।
        </p>
      </div>

      {/* Prominent Synthetic Data Warning */}
      <div className="p-6 rounded-3xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-2.5 shadow-card">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-amber-700 flex-shrink-0" />
          <h2 className="text-base font-extrabold text-amber-950">গুরুত্বপূর্ণ বিজ্ঞপ্তি: সিন্থেটিক ডেটাসেট সীমাবদ্ধতা</h2>
        </div>
        <p className="text-xs sm:text-sm leading-relaxed pl-8 font-bangla text-amber-950">
          বর্তমান মডেলগুলোতে ব্যবহৃত ডেটাসেট (
          <code className="bg-amber-100/90 px-1.5 py-0.5 rounded font-mono text-xs text-amber-950 font-bold">
            bangladesh_crop_recommendation.csv
          </code>{" "}
          ও{" "}
          <code className="bg-amber-100/90 px-1.5 py-0.5 rounded font-mono text-xs text-amber-950 font-bold">
            bangladesh_fertilizer_recommendation.csv
          </code>
          ) কৃত্রিম বা সিন্থেটিক তথ্যের সমন্বয়ে তৈরি। এই সুপারিশগুলো কৃষকদের মাঠপর্যায়ে সহায়তার জন্য একটি সিদ্ধান্ত-সহায়ক প্রোটোটাইপ গাইড। জমিতে সার ও কীটনাশক ব্যবহারের পূর্বে সর্বদা স্থানীয় উপজেলা কৃষি কর্মকর্তা বা এসএএও (SAAO) এর পরামর্শ গ্রহণ করুন।
        </p>
      </div>

      {/* Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Crop Recommendation Model */}
        <div className="app-card bg-white p-6 rounded-3xl border border-slate-200 shadow-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">১. ফসল নির্বাচন মডেল</h3>
              <span className="text-xs text-slate-500 font-mono">ExtraTrees Classifier Bundle</span>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-700 font-bangla">
            <p><strong>ইনপুট ভ্যারিয়েবল:</strong> N, P, K, pH, তাপমাত্রা, আর্দ্রতা, বৃষ্টিপাত, মৌসুম, মাটির ধরন</p>
            <p><strong>আউটপুট ক্লাস:</strong> ২৪টি বাংলাদেশি ফসল</p>
            <p><strong>পাইপলাইন:</strong> ColumnTransformer (SimpleImputer median + OHE) + ExtraTreesClassifier</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5 font-medium">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">পরীক্ষণ নির্ভুলতা (Test Accuracy):</span>
              <span className="font-extrabold text-emerald-800 font-mono">86.13%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">শীর্ষ-৩ নির্ভুলতা (Top-3 Accuracy):</span>
              <span className="font-extrabold text-emerald-800 font-mono">97.59%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">ম্যাক্রো F1 স্কোর:</span>
              <span className="font-extrabold text-emerald-800 font-mono">0.8599</span>
            </div>
          </div>
        </div>

        {/* Fertilizer Recommendation Model */}
        <div className="app-card bg-white p-6 rounded-3xl border border-slate-200 shadow-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">২. সারের সুপারিশ মডেল</h3>
              <span className="text-xs text-slate-500 font-mono">XGBoost Clf + LightGBM Reg</span>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-700 font-bangla">
            <p><strong>ইনপুট ভ্যারিয়েবল:</strong> N, P, K, S, Zn, pH, জৈব পদার্থ, আবহাওয়া, ফসল, মৌসুম, মাটি</p>
            <p><strong>আউটপুট:</strong> ৮টি সার পরিকল্পনা এবং ৭টি সারের মাত্রা (কেজি/হেক্টর)</p>
            <p><strong>সুরক্ষা স্তর:</strong> নেগেটিভ ক্লিপিং (≥0) ও প্রশিক্ষণ উপাত্তের সর্বোচ্চ মাত্রার ১০৫% ক্যাপ</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5 font-medium">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">শ্রেণিকরণ নির্ভুলতা (Classifier Acc):</span>
              <span className="font-extrabold text-amber-900 font-mono">96.17%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">রিগ্রেশন R² স্কোর (Regressor R²):</span>
              <span className="font-extrabold text-amber-900 font-mono">0.9740</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">গড় পরম ত্রুটি (MAE):</span>
              <span className="font-extrabold text-amber-900 font-mono">29.22 kg/ha</span>
            </div>
          </div>
        </div>
      </div>

      {/* RAG & Embeddings */}
      <div className="app-card bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-card space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center border border-blue-200">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">৩. কৃষি সহকারী (RAG) ও ভেক্টর স্টোর</h3>
            <span className="text-xs text-slate-500 font-mono">ChromaDB + Multilingual E5 Embeddings</span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-bangla">
          মৃত্তিকা এআই-এর কৃষি সহকারী কোনো সাধারণ আড্ডাবাজ বট নয়। এটি একটি কঠোরভাবে সীমারেখাযুক্ত আরএজি (RAG) আর্কিটেকচার যা বাংলাদেশ কৃষি গবেষণা কাউন্সিল (BARC), বাংলাদেশ ধান গবেষণা ইনস্টিটিউট (BRRI) ও কৃষি সম্প্রসারণ অধিদপ্তর (DAE)-এর নথি থেকে তথ্য সংগ্রহ করে পৃষ্ঠা নম্বরসহ উত্তর উপস্থাপন করে।
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-center">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-bold block">ভেক্টর স্টোর</span>
            <span className="text-xs font-bold text-slate-900">ChromaDB Persistent</span>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-bold block">এমবেডিং মডেল</span>
            <span className="text-xs font-bold text-slate-900">Multilingual MiniLM / E5</span>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-bold block">সুরক্ষা ও ফলব্যাক</span>
            <span className="text-xs font-bold text-slate-900">উপজেলা কৃষি কর্মকর্তা রেফারেল</span>
          </div>
        </div>
      </div>
    </div>
  );
};
