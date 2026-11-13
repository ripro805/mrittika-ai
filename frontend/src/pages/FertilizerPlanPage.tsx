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
  const { t } = useTranslation();
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
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
          <FlaskConical className="w-3.5 h-3.5" />
          <span>মডিউল ২: সারের হিসাব ও প্রয়োগপদ্ধতি</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900">
          সুষম সারের সঠিক মাত্রা নির্ধারণ
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto">
          ফসলের পুষ্টির চাহিদা ও মাটির স্বাস্থ্য বিচার করে সুনির্দিষ্ট সারের পরিমাণ, প্রয়োগের সময়সূচী ও জমি অনুযায়ী মোট সারের হিসাব।
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        {/* Crop Selection & Area */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label className="block text-xs font-bold text-gray-700 mb-1">
              উদ্দিষ্ট ফসল (Target Crop)
            </label>
            <select
              name="crop"
              value={formData.crop}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {crops.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name_bn} {c.fertilizer_supported ? "" : " (সারের মডেল যুক্ত হয়নি)"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              জমির পরিমাণ (Land Area)
            </label>
            <input
              type="number"
              name="land_area"
              min="0.1"
              step="0.1"
              value={formData.land_area}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              জমির একক (Unit)
            </label>
            <select
              name="land_unit"
              value={formData.land_unit}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="bigha">বিঘা (৩৩ শতক)</option>
              <option value="decimal">শতক / ডেসিমাল</option>
              <option value="hectare">হেক্টর</option>
            </select>
          </div>
        </div>

        {!isCropSupported && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs sm:text-sm font-medium flex items-center gap-2">
            <Info className="w-5 h-5 flex-shrink-0 text-amber-700" />
            <span>এই ফসলের জন্য সারের পরামর্শ এখনো যুক্ত হয়নি (ধান, গম, ভুট্টা, আলু, পাট, সরিষা, মসুর, টমেটো, বেগুন, মরিচ ও পেঁয়াজ নির্বাচন করুন)।</span>
          </div>
        )}

        {/* Primary Nutrients */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
            ১. প্রাথমিক পুষ্টি ও মাটির মান (Primary Nutrients & pH)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">নাইট্রোজেন (N)</label>
              <input
                type="number"
                name="N"
                min="0"
                max="300"
                step="0.1"
                value={formData.N}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">ফসফরাস (P)</label>
              <input
                type="number"
                name="P"
                min="0"
                max="200"
                step="0.1"
                value={formData.P}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">পটাশিয়াম (K)</label>
              <input
                type="number"
                name="K"
                min="0"
                max="300"
                step="0.1"
                value={formData.K}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">মাটির pH</label>
              <input
                type="number"
                name="pH"
                min="3.5"
                max="9.5"
                step="0.01"
                value={formData.pH}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
              />
            </div>
          </div>
        </div>

        {/* Secondary Nutrients (Optional) */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
            ২. গৌণ উপাদান ও জৈব পদার্থ (ঐচ্ছিক / Optional)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                সালফার / গন্ধক (S) <span className="text-gray-400 font-normal">kg/ha</span>
              </label>
              <input
                type="number"
                name="S"
                min="0"
                max="100"
                step="0.1"
                placeholder="না জানা থাকলে খালি রাখুন"
                value={formData.S}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                জিংক / দস্তা (Zn) <span className="text-gray-400 font-normal">kg/ha</span>
              </label>
              <input
                type="number"
                name="Zn"
                min="0"
                max="20"
                step="0.1"
                placeholder="না জানা থাকলে খালি রাখুন"
                value={formData.Zn}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                জৈব পদার্থ (OM %)
              </label>
              <input
                type="number"
                name="organic_matter"
                min="0"
                max="10"
                step="0.01"
                placeholder="না জানা থাকলে খালি রাখুন"
                value={formData.organic_matter}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !isCropSupported}
            className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5 ${
              isCropSupported
                ? "bg-amber-700 hover:bg-amber-800 text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <FlaskConical className="w-5 h-5" />
            )}
            <span>{t("buttons.get_fertilizer")}</span>
          </button>
        </div>
      </form>

      {/* Results Section */}
      {result && result.supported && (
        <div className="space-y-8 animate-fade-in">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-amber-700 to-amber-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-amber-200 font-bold block mb-1">
                সুপারিশকৃত সারের প্যাকেজ
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold">
                {result.crop_name_bn} - {result.fertilizer_plan}
              </h2>
              <p className="text-xs text-amber-100 mt-1">
                জমির পরিমাপ: {formData.land_area} {formData.land_unit === "bigha" ? "বিঘা" : formData.land_unit === "decimal" ? "শতক" : "হেক্টর"}
              </p>
            </div>

            <button
              onClick={handleAskAssistant}
              className="inline-flex items-center gap-2 bg-white text-amber-900 hover:bg-amber-50 px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-amber-700" />
              <span>সহকারীকে প্রশ্ন করুন</span>
            </button>
          </div>

          {/* Unit Switcher */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200">
            <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <TableIcon className="w-4 h-4 text-amber-700" />
              <span>সারের হার প্রদর্শন একক:</span>
            </span>
            <div className="inline-flex rounded-xl p-1 bg-gray-100">
              <button
                type="button"
                onClick={() => setActiveUnit("bigha")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeUnit === "bigha" ? "bg-white text-amber-800 shadow-sm" : "text-gray-600"
                }`}
              >
                বিঘা (৩৩ শতক)
              </button>
              <button
                type="button"
                onClick={() => setActiveUnit("decimal")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeUnit === "decimal" ? "bg-white text-amber-800 shadow-sm" : "text-gray-600"
                }`}
              >
                শতক (ডেসিমাল)
              </button>
              <button
                type="button"
                onClick={() => setActiveUnit("ha")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeUnit === "ha" ? "bg-white text-amber-800 shadow-sm" : "text-gray-600"
                }`}
              >
                হেক্টর
              </button>
            </div>
          </div>

          {/* Fertilizer Dosages Table */}
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 font-bold text-gray-700">সারের নাম</th>
                    <th className="px-6 py-4 font-bold text-gray-700">প্রধান পুষ্টি</th>
                    <th className="px-6 py-4 font-bold text-gray-700">
                      হার ({activeUnit === "bigha" ? "কেজি/বিঘা" : activeUnit === "decimal" ? "কেজি/শতক" : "কেজি/হেক্টর"})
                    </th>
                    <th className="px-6 py-4 font-extrabold text-amber-900 bg-amber-50">
                      আপনার জমির মোট সার
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {result.fertilizer_items.map((item: any) => {
                    const rateDisplay =
                      activeUnit === "bigha"
                        ? `${item.rate_kg_bigha} কেজি`
                        : activeUnit === "decimal"
                        ? `${item.rate_kg_decimal} কেজি`
                        : `${item.rate_kg_ha} কেজি`;

                    return (
                      <tr key={item.key} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 font-bold text-gray-900">{item.name_bn}</td>
                        <td className="px-6 py-4 text-gray-500 text-xs">{item.nutrient}</td>
                        <td className="px-6 py-4 font-medium text-gray-800">{rateDisplay}</td>
                        <td className="px-6 py-4 font-bold text-amber-800 bg-amber-50/50">
                          {item.total_quantity_kg} কেজি
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
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-mrittika-700" />
                <span>সার প্রয়োগের নির্দেশনামূলক সময়সূচী</span>
              </h3>
              <div className="space-y-4">
                {result.application_schedule.map((step: any, idx: number) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1">
                    <span className="text-xs font-bold text-mrittika-800 uppercase tracking-wide">
                      {step.stage} • {step.timing}
                    </span>
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                      {step.instructions_bn}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Soil Health Alerts */}
          {result.soil_health_notes && result.soil_health_notes.length > 0 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-700" />
                <span>মাটির স্বাস্থ্য সতর্কতা ও পরামর্শ</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.soil_health_notes.map((note: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border ${
                      note.type === "warning"
                        ? "bg-red-50 border-red-200 text-red-900"
                        : note.type === "info"
                        ? "bg-blue-50 border-blue-200 text-blue-900"
                        : "bg-emerald-50 border-emerald-200 text-emerald-900"
                    }`}
                  >
                    <h4 className="font-bold text-xs sm:text-sm mb-1">{note.title_bn}</h4>
                    <p className="text-xs leading-relaxed opacity-90">{note.message_bn}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-900 leading-relaxed">
            {result.disclaimer_bn}
          </div>
        </div>
      )}
    </div>
  );
};
