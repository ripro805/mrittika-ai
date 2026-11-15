import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import apiClient from "../services/api";
import { SCENIC_IMAGES } from "../utils/agroImages";
import { Info, AlertTriangle, ShieldCheck, Database, Cpu, Award } from "lucide-react";

export const AboutModelInfoPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [modelInfo, setModelInfo] = useState<any | null>(null);

  useEffect(() => {
    apiClient.get("/model-info/").then((res) => {
      setModelInfo(res.data);
    }).catch(() => {});
  }, [i18n.language]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Title */}
      <div className="text-center space-y-2.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-900 text-xs font-bold border border-blue-200 shadow-2xs">
          <Info className="w-3.5 h-3.5 text-blue-700" />
          <span>
            {i18n.language === "en" ? "Technical Specifications & Model Metrics" : "প্রযুক্তিগত পরিচিতি ও মডেল মেট্রিক্স"}
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {i18n.language === "en"
            ? "Mrittika AI: Model Architecture & Scientific Limitations"
            : "মৃত্তিকা এআই: মডেল আর্কিটেকচার ও সীমাবদ্ধতা"}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed font-bangla">
          {i18n.language === "en"
            ? "Machine learning pipelines, training evaluations, dataset telemetry, and synthetic data transparency declarations."
            : "মেশিন লার্নিং মডেলের কাঠামো, প্রশিক্ষণ ফলাফল, ডেটাসেট পরিসংখ্যান ও সিন্থেটিক তথ্যের সীমাবদ্ধতার বিবরণ।"}
        </p>
      </div>

      {/* Prominent Synthetic Data Warning */}
      <div className="p-6 rounded-3xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-2.5 shadow-card">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-amber-700 flex-shrink-0" />
          <h2 className="text-base font-extrabold text-amber-950">
            {i18n.language === "en"
              ? "Important Notice: Synthetic Dataset Calibration & Advisory Limitations"
              : "গুরুত্বপূর্ণ বিজ্ঞপ্তি: সিন্থেটিক ডেটাসেট সীমাবদ্ধতা"}
          </h2>
        </div>
        <p className="text-xs sm:text-sm leading-relaxed pl-8 font-bangla text-amber-950">
          {i18n.language === "en" ? (
            <>
              Datasets used in the current models (
              <code className="bg-amber-100/90 px-1.5 py-0.5 rounded font-mono text-xs text-amber-950 font-bold">
                bangladesh_crop_recommendation.csv
              </code>{" "}
              and{" "}
              <code className="bg-amber-100/90 px-1.5 py-0.5 rounded font-mono text-xs text-amber-950 font-bold">
                bangladesh_fertilizer_recommendation.csv
              </code>
              ) are calibrated synthetic agronomic data. These outputs serve as a decision-support guide for farmers. Always verify with your local Upazila Agriculture Officer or SAAO prior to field chemical application.
            </>
          ) : (
            <>
              বর্তমান মডেলগুলোতে ব্যবহৃত ডেটাসেট (
              <code className="bg-amber-100/90 px-1.5 py-0.5 rounded font-mono text-xs text-amber-950 font-bold">
                bangladesh_crop_recommendation.csv
              </code>{" "}
              ও{" "}
              <code className="bg-amber-100/90 px-1.5 py-0.5 rounded font-mono text-xs text-amber-950 font-bold">
                bangladesh_fertilizer_recommendation.csv
              </code>
              ) কৃত্রিম বা সিন্থেটিক তথ্যের সমন্বয়ে তৈরি। এই সুপারিশগুলো কৃষকদের মাঠপর্যায়ে সহায়তার জন্য একটি সিদ্ধান্ত-সহায়ক প্রোটোটাইপ গাইড। জমিতে সার ও কীটনাশক ব্যবহারের পূর্বে সর্বদা স্থানীয় উপজেলা কৃষি কর্মকর্তা বা এসএএও (SAAO) এর পরামর্শ গ্রহণ করুন।
            </>
          )}
        </p>
      </div>

      {/* Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Crop Recommendation Model */}
        <div className="app-card bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden space-y-4">
          <div className="relative h-32 w-full overflow-hidden">
            <img
              src={SCENIC_IMAGES.precisionFarming.url}
              alt="Crop Selection Model"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent flex items-end p-4">
              <span className="text-white text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-600/90 border border-emerald-400/40">
                {i18n.language === "en" ? "24 Regional Crops Multi-Class" : "২৪টি আঞ্চলিক ফসল ক্লাসিফায়ার"}
              </span>
            </div>
          </div>

          <div className="p-6 pt-0 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200 shrink-0">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  {i18n.language === "en" ? "1. Crop Selection Model" : "১. ফসল নির্বাচন মডেল"}
                </h3>
                <span className="text-xs text-slate-500 font-mono">ExtraTrees Classifier Bundle</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-700 font-bangla">
              <p>
                <strong>{i18n.language === "en" ? "Input Variables: " : "ইনপুট ভ্যারিয়েবল: "}</strong>
                {i18n.language === "en"
                  ? "N, P, K, pH, Temperature, Humidity, Rainfall, Season, Soil Type"
                  : "N, P, K, pH, তাপমাত্রা, আর্দ্রতা, বৃষ্টিপাত, মৌসুম, মাটির ধরন"}
              </p>
              <p>
                <strong>{i18n.language === "en" ? "Target Classes: " : "আউটপুট ক্লাস: "}</strong>
                {i18n.language === "en" ? "24 Bangladeshi Agricultural Crops" : "২৪টি বাংলাদেশি ফসল"}
              </p>
              <p>
                <strong>{i18n.language === "en" ? "Pipeline: " : "পাইপলাইন: "}</strong>
                ColumnTransformer (SimpleImputer median + OHE) + ExtraTreesClassifier
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5 font-medium">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">
                  {i18n.language === "en" ? "Test Accuracy:" : "পরীক্ষণ নির্ভুলতা (Test Accuracy):"}
                </span>
                <span className="font-extrabold text-emerald-800 font-mono">86.13%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">
                  {i18n.language === "en" ? "Top-3 Accuracy:" : "শীর্ষ-৩ নির্ভুলতা (Top-3 Accuracy):"}
                </span>
                <span className="font-extrabold text-emerald-800 font-mono">97.59%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-600">
                  {i18n.language === "en" ? "Macro F1 Score:" : "ম্যাক্রো F1 স্কোর:"}
                </span>
                <span className="font-extrabold text-emerald-800 font-mono">0.8599</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fertilizer Recommendation Model */}
        <div className="app-card bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden space-y-4">
          <div className="relative h-32 w-full overflow-hidden">
            <img
              src={SCENIC_IMAGES.soilTesting.url}
              alt="Fertilizer Recommendation Model"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent flex items-end p-4">
              <span className="text-white text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-600/90 border border-amber-400/40">
                {i18n.language === "en" ? "Balanced Nutrient Dosage Regressor" : "সুষম সার মাত্রা রিগ্রেসর"}
              </span>
            </div>
          </div>

          <div className="p-6 pt-0 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200 shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  {i18n.language === "en" ? "2. Balanced Fertilizer Prediction Model" : "২. সারের সুপারিশ মডেল"}
                </h3>
                <span className="text-xs text-slate-500 font-mono">XGBoost Clf + LightGBM Reg</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-700 font-bangla">
              <p>
                <strong>{i18n.language === "en" ? "Input Variables: " : "ইনপুট ভ্যারিয়েবল: "}</strong>
                {i18n.language === "en"
                  ? "N, P, K, S, Zn, pH, Organic Carbon, Weather, Crop, Season, Soil Type"
                  : "N, P, K, S, Zn, pH, জৈব পদার্থ, আবহাওয়া, ফসল, মৌসুম, মাটি"}
              </p>
              <p>
                <strong>{i18n.language === "en" ? "Output: " : "আউটপুট: "}</strong>
                {i18n.language === "en"
                  ? "8 Fertilizer Packages and 7 Nutrient Doses (kg/ha)"
                  : "৮টি সার পরিকল্পনা এবং ৭টি সারের মাত্রা (কেজি/হেক্টর)"}
              </p>
              <p>
                <strong>{i18n.language === "en" ? "Safety Guardrails: " : "সুরক্ষা স্তর: "}</strong>
                {i18n.language === "en"
                  ? "Negative dosage clipping (≥0) & 105% cap of training maximums"
                  : "নেগেটিভ ক্লিপিং (≥0) ও প্রশিক্ষণ উপাত্তের সর্বোচ্চ মাত্রার ১০৫% ক্যাপ"}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5 font-medium">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">
                {i18n.language === "en" ? "Classifier Accuracy:" : "শ্রেণিকরণ নির্ভুলতা (Classifier Acc):"}
              </span>
              <span className="font-extrabold text-amber-900 font-mono">96.17%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">
                {i18n.language === "en" ? "Regressor R² Score:" : "রিগ্রেশন R² স্কোর (Regressor R²):"}
              </span>
              <span className="font-extrabold text-amber-900 font-mono">0.9740</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">
                {i18n.language === "en" ? "Mean Absolute Error (MAE):" : "গড় পরম ত্রুটি (MAE):"}
              </span>
              <span className="font-extrabold text-amber-900 font-mono">29.22 kg/ha</span>
            </div>
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
            <h3 className="font-extrabold text-slate-900 text-base">
              {i18n.language === "en"
                ? "3. Agri Assistant (RAG) & Vector Database"
                : "৩. কৃষি সহকারী (RAG) ও ভেক্টর স্টোর"}
            </h3>
            <span className="text-xs text-slate-500 font-mono">ChromaDB + Multilingual E5 Embeddings</span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-bangla">
          {i18n.language === "en"
            ? "Mrittika AI's agricultural assistant is not an open-ended chatbot. It operates on a strictly bounded Retrieval-Augmented Generation (RAG) pipeline sourcing verified publications from the Bangladesh Agricultural Research Council (BARC), Bangladesh Rice Research Institute (BRRI), and the Department of Agricultural Extension (DAE), citing specific source documents."
            : "মৃত্তিকা এআই-এর কৃষি সহকারী কোনো সাধারণ আড্ডাবাজ বট নয়। এটি একটি কঠোরভাবে সীমারেখাযুক্ত আরএজি (RAG) আর্কিটেকচার যা বাংলাদেশ কৃষি গবেষণা কাউন্সিল (BARC), বাংলাদেশ ধান গবেষণা ইনস্টিটিউট (BRRI) ও কৃষি সম্প্রসারণ অধিদপ্তর (DAE)-এর নথি থেকে তথ্য সংগ্রহ করে পৃষ্ঠা নম্বরসহ উত্তর উপস্থাপন করে।"}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-center">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-bold block">
              {i18n.language === "en" ? "Vector Store" : "ভেক্টর স্টোর"}
            </span>
            <span className="text-xs font-bold text-slate-900">ChromaDB Persistent</span>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-bold block">
              {i18n.language === "en" ? "Embedding Model" : "এমবেডিং মডেল"}
            </span>
            <span className="text-xs font-bold text-slate-900">Multilingual MiniLM / E5</span>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <span className="text-[11px] text-slate-500 font-bold block">
              {i18n.language === "en" ? "Safety & Fallback" : "সুরক্ষা ও ফলব্যাক"}
            </span>
            <span className="text-xs font-bold text-slate-900">
              {i18n.language === "en" ? "Extension Officer Referral" : "উপজেলা কৃষি কর্মকর্তা রেফারেল"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
