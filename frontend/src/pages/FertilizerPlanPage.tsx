import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUnifiedFlow } from "../context/UnifiedFlowContext";
import apiClient from "../services/api";
import {
  FlaskConical,
  MessageSquare,
  Loader2,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle2,
  Table as TableIcon,
} from "lucide-react";

export const FertilizerPlanPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { selectedCrop, soilInputs, carryContextToAssistant } = useUnifiedFlow();

  const [crops, setCrops] = useState<any[]>([]);
  const [soilTypes, setSoilTypes] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    crop: selectedCrop ? selectedCrop.slug : "rice_aman",
    N: soilInputs?.N ?? 120.0,
    P: soilInputs?.P ?? 45.0,
    K: soilInputs?.K ?? 60.0,
    pH: soilInputs?.pH ?? 6.4,
    temperature: soilInputs?.temperature ?? 28.0,
    humidity: soilInputs?.humidity ?? 80.0,
    rainfall: soilInputs?.rainfall ?? 250.0,
    season: soilInputs?.season ?? "Kharif-2",
    soil_type: soilInputs?.soil_type ?? "Clay Loam",
    S: soilInputs?.S ?? "",
    Zn: soilInputs?.Zn ?? "",
    organic_matter: soilInputs?.organic_matter ?? "",
    land_area: 1.0,
    land_unit: "bigha",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeUnit, setActiveUnit] = useState<"bigha" | "decimal" | "ha">("bigha");

  useEffect(() => {
    apiClient.get("/meta/options").then((res) => {
      setCrops(res.data.crops || []);
      setSoilTypes(res.data.soil_types || []);
      setSeasons(res.data.seasons || []);
    }).catch(() => {});
  }, []);

  // Check if selected crop is supported
  const currentCropMeta = crops.find((c) => c.slug === formData.crop);
  const isCropSupported = currentCropMeta ? currentCropMeta.fertilizer_supported : true;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: e.target.type === "number" ? (value === "" ? "" : parseFloat(value)) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCropSupported) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const payload = {
      ...formData,
      N: parseFloat(formData.N as any) || 0,
      P: parseFloat(formData.P as any) || 0,
      K: parseFloat(formData.K as any) || 0,
      pH: parseFloat(formData.pH as any) || 6.5,
      temperature: parseFloat(formData.temperature as any) || 25,
      humidity: parseFloat(formData.humidity as any) || 75,
      rainfall: parseFloat(formData.rainfall as any) || 150,
      S: formData.S === "" ? null : parseFloat(formData.S as any),
      Zn: formData.Zn === "" ? null : parseFloat(formData.Zn as any),
      organic_matter: formData.organic_matter === "" ? null : parseFloat(formData.organic_matter as any),
      land_area: parseFloat(formData.land_area as any) || 1.0,
    };

    try {
      const res = await apiClient.post("/fertilizer/recommend", payload);
      setResult(res.data);
    } catch (err: any) {
      const msg = err.response?.data?.message_bn || err.response?.data?.error || "সারের হিসাব সম্পন্ন করা যায়নি।";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAskAssistant = () => {
    if (result) {
      carryContextToAssistant(result.crop_name_bn, result.fertilizer_plan);
    } else {
      carryContextToAssistant(currentCropMeta?.name_bn || formData.crop);
    }
    navigate("/assistant");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div className="text-center space-y-2.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200 shadow-2xs">
          <FlaskConical className="w-3.5 h-3.5 text-amber-700" />
          <span>{i18n.language === "en" ? "Module 2: Fertilizer Dosage & Timing" : "মডিউল ২: সারের হিসাব ও প্রয়োগপদ্ধতি"}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {i18n.language === "en" ? "Balanced Fertilizer Dosage Calculator" : "সুষম সারের সঠিক মাত্রা নির্ধারণ"}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed font-bangla">
          {i18n.language === "en"
            ? "Exact chemical and organic fertilizer dosages tailored to your crop nutrient needs, land area, and split schedules."
            : "ফসলের পুষ্টির চাহিদা ও মাটির স্বাস্থ্য বিচার করে সুনির্দিষ্ট সারের পরিমাণ, প্রয়োগের সময়সূচী ও জমি অনুযায়ী মোট সারের হিসাব।"}
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-sm flex items-center gap-2.5 shadow-2xs">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <span className="font-medium font-bangla">{errorMessage}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="app-card p-6 sm:p-8 rounded-3xl border border-slate-200/90 bg-white shadow-card space-y-6">
        {/* Crop Selection & Area */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label className="block text-xs font-bold text-slate-800 mb-1">
              {i18n.language === "en" ? "Target Crop" : "উদ্দিষ্ট ফসল (Target Crop)"}
            </label>
            <select
              name="crop"
              value={formData.crop}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500/15 focus:border-amber-600 focus:outline-none"
            >
              {crops.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {i18n.language === "en" ? (c.name_en || c.name_bn) : c.name_bn} {c.fertilizer_supported ? "" : (i18n.language === "en" ? " (model unavailable)" : " (সারের মডেল যুক্ত হয়নি)")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              {i18n.language === "en" ? "Land Area" : "জমির পরিমাণ (Land Area)"}
            </label>
            <input
              type="number"
              name="land_area"
              min="0.1"
              step="0.1"
              value={formData.land_area}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500/15 focus:border-amber-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              {i18n.language === "en" ? "Measurement Unit" : "জমির একক (Unit)"}
            </label>
            <select
              name="land_unit"
              value={formData.land_unit}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500/15 focus:border-amber-600 focus:outline-none"
            >
              <option value="bigha">{i18n.language === "en" ? "Bigha (33 Decimal)" : "বিঘা (৩৩ শতক)"}</option>
              <option value="decimal">{i18n.language === "en" ? "Decimal / Shotok" : "শতক / ডেসিমাল"}</option>
              <option value="hectare">{i18n.language === "en" ? "Hectare" : "হেক্টর"}</option>
            </select>
          </div>
        </div>

        {!isCropSupported && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs sm:text-sm font-semibold flex items-center gap-2 font-bangla">
            <Info className="w-5 h-5 flex-shrink-0 text-amber-700" />
            <span>
              {i18n.language === "en"
                ? "Fertilizer dosage is not yet mapped for this crop (Supported: Rice, Wheat, Maize, Potato, Jute, Mustard, Lentil, Tomato, Eggplant, Chili, Onion)."
                : "এই ফসলের জন্য সারের পরামর্শ এখনো যুক্ত হয়নি (ধান, গম, ভুট্টা, আলু, পাট, সরিষা, মসুর, টমেটো, বেগুন, মরিচ ও পেঁয়াজ নির্বাচন করুন)।"}
            </span>
          </div>
        )}

        {/* Primary Nutrients */}
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-200 pb-2 mb-4">
            {i18n.language === "en" ? "1. Primary Nutrients & pH" : "১. প্রাথমিক পুষ্টি ও মাটির মান (Primary Nutrients & pH)"}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {i18n.language === "en" ? "Nitrogen (N)" : "নাইট্রোজেন (N)"} <span className="text-slate-500 font-mono text-[10px] font-normal">kg/ha</span>
              </label>
              <input
                type="number"
                name="N"
                min="0"
                max="300"
                step="0.1"
                value={formData.N}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500/15 focus:border-amber-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {i18n.language === "en" ? "Phosphorus (P)" : "ফসফরাস (P)"} <span className="text-slate-500 font-mono text-[10px] font-normal">kg/ha</span>
              </label>
              <input
                type="number"
                name="P"
                min="0"
                max="200"
                step="0.1"
                value={formData.P}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500/15 focus:border-amber-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {i18n.language === "en" ? "Potassium (K)" : "পটাশিয়াম (K)"} <span className="text-slate-500 font-mono text-[10px] font-normal">kg/ha</span>
              </label>
              <input
                type="number"
                name="K"
                min="0"
                max="300"
                step="0.1"
                value={formData.K}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500/15 focus:border-amber-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {i18n.language === "en" ? "Soil pH" : "মাটির pH"} <span className="text-slate-500 font-mono text-[10px] font-normal">3.5-9.5</span>
              </label>
              <input
                type="number"
                name="pH"
                min="3.5"
                max="9.5"
                step="0.01"
                value={formData.pH}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500/15 focus:border-amber-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Secondary Nutrients (Optional) */}
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-200 pb-2 mb-4">
            {i18n.language === "en" ? "2. Secondary Nutrients & OM% (Optional)" : "২. গৌণ উপাদান ও জৈব পদার্থ (ঐচ্ছিক / Optional)"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {i18n.language === "en" ? "Sulfur (S)" : "সালফার / গন্ধক (S)"} <span className="text-slate-500 font-mono text-[10px] font-normal">kg/ha</span>
              </label>
              <input
                type="number"
                name="S"
                min="0"
                max="100"
                step="0.1"
                placeholder={i18n.language === "en" ? "Leave blank if unknown" : "না জানা থাকলে খালি রাখুন"}
                value={formData.S}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500/15 focus:border-amber-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {i18n.language === "en" ? "Zinc (Zn)" : "জিংক / দস্তা (Zn)"} <span className="text-slate-500 font-mono text-[10px] font-normal">kg/ha</span>
              </label>
              <input
                type="number"
                name="Zn"
                min="0"
                max="20"
                step="0.1"
                placeholder={i18n.language === "en" ? "Leave blank if unknown" : "না জানা থাকলে খালি রাখুন"}
                value={formData.Zn}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500/15 focus:border-amber-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {i18n.language === "en" ? "Organic Matter (OM %)" : "জৈব পদার্থ (OM %)"}
              </label>
              <input
                type="number"
                name="organic_matter"
                min="0"
                max="10"
                step="0.01"
                placeholder={i18n.language === "en" ? "Leave blank if unknown" : "না জানা থাকলে খালি রাখুন"}
                value={formData.organic_matter}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500/15 focus:border-amber-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !isCropSupported}
            className={`w-full py-3.5 px-6 rounded-xl font-extrabold text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all ${
              isCropSupported
                ? "bg-amber-700 hover:bg-amber-800 text-white shadow-amber-700/20 hover:-translate-y-0.5"
                : "bg-slate-200 text-slate-600 border border-slate-300 cursor-not-allowed font-bold"
            }`}
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            ) : (
              <FlaskConical className="w-5 h-5 text-amber-200" />
            )}
            <span>{t("buttons.get_fertilizer")}</span>
          </button>
        </div>
      </form>

      {/* Results Section */}
      {result && result.supported && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Header Card */}
          <div
            className="banner-fertilizer-hero p-6 sm:p-8 rounded-3xl shadow-card border border-amber-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white"
            style={{
              background: "linear-gradient(135deg, #451a03 0%, #78350f 50%, #431407 100%)",
              backgroundColor: "#451a03",
            }}
          >
            <div>
              <span className="text-xs uppercase tracking-wider text-amber-300 font-bold block mb-1">
                {i18n.language === "en" ? "Recommended Fertilizer Package" : "সুপারিশকৃত সারের প্যাকেজ"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {i18n.language === "en" ? (result.crop_name_en || result.crop_name_bn) : result.crop_name_bn} - {result.fertilizer_plan}
              </h2>
              <p className="text-xs text-amber-200 mt-1 font-bangla">
                {i18n.language === "en" ? "Land Area: " : "জমির পরিমাপ: "}
                {formData.land_area}{" "}
                {formData.land_unit === "bigha"
                  ? (i18n.language === "en" ? "Bigha" : "বিঘা")
                  : formData.land_unit === "decimal"
                  ? (i18n.language === "en" ? "Decimal" : "শতক")
                  : (i18n.language === "en" ? "Hectare" : "হেক্টর")}
              </p>
            </div>

            <button
              onClick={handleAskAssistant}
              className="inline-flex items-center gap-2 bg-white text-amber-950 hover:bg-amber-50 px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-amber-800" />
              <span>{i18n.language === "en" ? "Ask AI Assistant" : "সহকারীকে প্রশ্ন করুন"}</span>
            </button>
          </div>

          {/* Unit Switcher */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <TableIcon className="w-4 h-4 text-amber-700" />
              <span>{i18n.language === "en" ? "Display Unit Rate:" : "সারের হার প্রদর্শন একক:"}</span>
            </span>
            <div className="inline-flex rounded-xl p-1 bg-slate-100">
              <button
                type="button"
                onClick={() => setActiveUnit("bigha")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeUnit === "bigha" ? "bg-white text-amber-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {i18n.language === "en" ? "Bigha (33 Decimal)" : "বিঘা (৩৩ শতক)"}
              </button>
              <button
                type="button"
                onClick={() => setActiveUnit("decimal")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeUnit === "decimal" ? "bg-white text-amber-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {i18n.language === "en" ? "Decimal / Shotok" : "শতক (ডেসিমাল)"}
              </button>
              <button
                type="button"
                onClick={() => setActiveUnit("ha")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeUnit === "ha" ? "bg-white text-amber-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {i18n.language === "en" ? "Hectare" : "হেক্টর"}
              </button>
            </div>
          </div>

          {/* Fertilizer Dosages Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 font-extrabold text-slate-800">
                      {i18n.language === "en" ? "Fertilizer Name" : "সারের নাম"}
                    </th>
                    <th className="px-6 py-4 font-extrabold text-slate-800">
                      {i18n.language === "en" ? "Primary Nutrient" : "প্রধান পুষ্টি"}
                    </th>
                    <th className="px-6 py-4 font-extrabold text-slate-800">
                      {i18n.language === "en"
                        ? `Rate (${activeUnit === "bigha" ? "kg/bigha" : activeUnit === "decimal" ? "kg/decimal" : "kg/ha"})`
                        : `হার (${activeUnit === "bigha" ? "কেজি/বিঘা" : activeUnit === "decimal" ? "কেজি/শতক" : "কেজি/হেক্টর"})`}
                    </th>
                    <th className="px-6 py-4 font-extrabold text-amber-950 bg-amber-50">
                      {i18n.language === "en" ? "Total for Your Land" : "আপনার জমির মোট সার"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.fertilizer_items.map((item: any) => {
                    const kgUnit = i18n.language === "en" ? "kg" : "কেজি";
                    const rateDisplay =
                      activeUnit === "bigha"
                        ? `${item.rate_kg_bigha} ${kgUnit}`
                        : activeUnit === "decimal"
                        ? `${item.rate_kg_decimal} ${kgUnit}`
                        : `${item.rate_kg_ha} ${kgUnit}`;

                    return (
                      <tr key={item.key} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {i18n.language === "en" ? (item.name_en || item.name_bn) : item.name_bn}
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-xs font-medium">{item.nutrient}</td>
                        <td className="px-6 py-4 font-semibold text-slate-800">{rateDisplay}</td>
                        <td className="px-6 py-4 font-extrabold text-amber-950 bg-amber-50/60 font-mono">
                          {item.total_quantity_kg} {kgUnit}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Application Schedule */}
          {result.application_schedule && result.application_schedule.length > 0 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-card space-y-4">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-700" />
                <span>{i18n.language === "en" ? "Application Schedule & Split Timings" : "সার প্রয়োগের নির্দেশনামূলক সময়সূচী"}</span>
              </h3>
              <div className="space-y-4">
                {result.application_schedule.map((step: any, idx: number) => (
                  <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                      {step.stage} • {step.timing}
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-bangla">
                      {i18n.language === "en" ? (step.instructions_en || step.instructions_bn) : step.instructions_bn}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Soil Health Alerts */}
          {result.soil_health_notes && result.soil_health_notes.length > 0 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-card space-y-4">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-700" />
                <span>{i18n.language === "en" ? "Soil Health Alerts & Agronomic Tips" : "মাটির স্বাস্থ্য সতর্কতা ও পরামর্শ"}</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.soil_health_notes.map((note: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border ${
                      note.type === "warning"
                        ? "bg-red-50 border-red-200 text-red-950"
                        : note.type === "info"
                        ? "bg-blue-50 border-blue-200 text-blue-950"
                        : "bg-emerald-50 border-emerald-200 text-emerald-950"
                    }`}
                  >
                    <h4 className="font-bold text-xs sm:text-sm mb-1">
                      {i18n.language === "en" ? (note.title_en || note.title_bn) : note.title_bn}
                    </h4>
                    <p className="text-xs leading-relaxed opacity-90 font-bangla">
                      {i18n.language === "en" ? (note.message_en || note.message_bn) : note.message_bn}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl text-xs text-amber-950 leading-relaxed font-bangla">
            {i18n.language === "en" ? (result.disclaimer_en || result.disclaimer_bn) : result.disclaimer_bn}
          </div>
        </div>
      )}
    </div>
  );
};
