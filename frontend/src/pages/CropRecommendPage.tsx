import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUnifiedFlow } from "../context/UnifiedFlowContext";
import apiClient from "../services/api";
import {
  Sprout,
  CloudSun,
  Loader2,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Wheat,
} from "lucide-react";
import { getCropImage } from "../utils/agroImages";

export const CropRecommendPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { prefillFertilizerFromCrop } = useUnifiedFlow();

  // Form states with sensible default agronomic values
  const [formData, setFormData] = useState({
    N: 90.0,
    P: 45.0,
    K: 60.0,
    pH: 6.5,
    temperature: 25.0,
    humidity: 75.0,
    rainfall: 150.0,
    season: "Rabi",
    soil_type: "Loam",
    district: "Bogra",
  });

  const [districts, setDistricts] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [soilTypes, setSoilTypes] = useState<any[]>([]);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [weatherMeta, setWeatherMeta] = useState<{ source?: string; district_bn?: string; fallback?: boolean } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch metadata options
  useEffect(() => {
    apiClient
      .get("/meta/options")
      .then((res) => {
        setDistricts(res.data.districts || []);
        setSeasons(res.data.seasons || []);
        setSoilTypes(res.data.soil_types || []);
      })
      .catch(() => {});
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: e.target.type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const fetchWeatherForDistrict = async (districtName: string) => {
    if (!districtName) return;
    setIsLoadingWeather(true);
    setErrorMessage(null);
    try {
      const res = await apiClient.get(`/weather?district=${encodeURIComponent(districtName)}`);
      setFormData((prev) => ({
        ...prev,
        district: districtName,
        temperature: res.data.temperature,
        humidity: res.data.humidity,
        rainfall: res.data.rainfall,
        season: res.data.season || prev.season,
      }));
      setWeatherMeta({
        source: res.data.source,
        district_bn: res.data.district_bn,
        fallback: res.data.fallback,
      });
    } catch {
      setErrorMessage("আবহাওয়া তথ্য লোড করা যায়নি। দয়া করে ম্যানুয়ালি ইনপুট দিন।");
    } finally {
      setIsLoadingWeather(false);
    }
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDistrict = e.target.value;
    handleInputChange(e);
    fetchWeatherForDistrict(newDistrict);
  };

  const handleAutofillWeather = () => {
    fetchWeatherForDistrict(formData.district);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await apiClient.post("/crop/recommend", formData);
      setResult(res.data);
    } catch (err: any) {
      const msg = err.response?.data?.message_bn || err.response?.data?.error || "সুপারিশ পেতে সমস্যা হয়েছে। ইনপুট যাচাই করুন।";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectCropForFertilizer = (cropItem: any) => {
    prefillFertilizerFromCrop(cropItem, formData);
    navigate("/fertilizer");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div className="text-center space-y-2.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-850 text-xs font-bold border border-emerald-200 shadow-2xs">
          <Sprout className="w-3.5 h-3.5 text-emerald-700" />
          <span>{i18n.language === "en" ? "Module 1: Crop Suitability Advisory" : "মডিউল ১: ফসল নির্বাচন"}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {i18n.language === "en" ? "Best Crops for Soil & Climate" : "মাটি ও আবহাওয়ার ভিত্তিতে সেরা ফসল"}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed font-bangla">
          {i18n.language === "en"
            ? "Enter your soil test nutrients and local climate; AI will analyze and recommend the top 3 highest-yielding crops."
            : "আপনার জমির পুষ্টির মাত্রা এবং স্থানীয় আবহাওয়া প্রদান করুন; এআই মডেল বিশ্লেষণ করে সেরা ৩টি ফসল সুপারিশ করবে।"}
        </p>

        {/* Quick Visual Badges of Popular Supported Crops */}
        <div className="flex items-center justify-center gap-2.5 overflow-x-auto no-scrollbar pt-2">
          {[
            { slug: "rice_boro", nameBn: "বোরো ধান", nameEn: "Boro Rice" },
            { slug: "wheat", nameBn: "গম", nameEn: "Wheat" },
            { slug: "potato", nameBn: "আলু", nameEn: "Potato" },
            { slug: "maize", nameBn: "ভুট্টা", nameEn: "Maize" },
            { slug: "mustard", nameBn: "সরিষা", nameEn: "Mustard" },
            { slug: "jute", nameBn: "পাট", nameEn: "Jute" },
          ].map((c) => {
            const img = getCropImage(c.slug);
            return (
              <div
                key={c.slug}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs shrink-0"
              >
                <img src={img.url} alt={c.nameEn} className="w-5 h-5 rounded-full object-cover border border-emerald-500/40" loading="lazy" />
                <span className="text-xs font-bold text-slate-800">{i18n.language === "en" ? c.nameEn : c.nameBn}</span>
              </div>
            );
          })}
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-sm flex items-center gap-2.5 shadow-2xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <span className="font-medium font-bangla">{errorMessage}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="app-card p-6 sm:p-9 rounded-[28px] sm:rounded-[36px] border border-black/[0.06] bg-white shadow-apple space-y-6">
        {/* District & Weather Autofill */}
        <div className="bg-[#fbfbfd] p-5 rounded-[22px] border border-black/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-1/2">
            <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5">
              {i18n.language === "en" ? "Select Your District" : "আপনার জেলা নির্বাচন করুন"}
            </label>
            <select
              name="district"
              value={formData.district}
              onChange={handleDistrictChange}
              className="w-full px-3.5 py-2.5 bg-white border border-black/[0.1] rounded-2xl text-sm font-semibold text-[#1d1d1f] focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 focus:outline-none shadow-2xs transition-all"
            >
              {districts.map((d) => (
                <option key={d.name_en} value={d.name_en}>
                  {i18n.language === "en" ? `${d.name_en} (${d.name_bn})` : `${d.name_bn} (${d.name_en})`}
                </option>
              ))}
            </select>
            {weatherMeta && (
              <p className="mt-2 text-[11px] text-[#86868b] flex items-center gap-1 font-medium font-bangla">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>
                  {i18n.language === "en" ? formData.district : (weatherMeta.district_bn || formData.district)}: {
                    weatherMeta.fallback
                      ? (i18n.language === "en" ? "Regional Historical Average" : "আঞ্চলিক জলবায়ু উপাত্ত")
                      : (i18n.language === "en" ? "Open-Meteo Live Telemetry" : "Open-Meteo লাইভ আবহাওয়া")
                  }
                </span>
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleAutofillWeather}
            disabled={isLoadingWeather}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white border border-black/[0.08] text-xs font-semibold text-[#1d1d1f] hover:bg-[#f5f5f7] transition-all shadow-2xs hover:shadow-xs active:scale-98 cursor-pointer"
          >
            {isLoadingWeather ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
            ) : (
              <CloudSun className="w-4 h-4 text-blue-600" />
            )}
            <span>{t("buttons.autofill_weather")}</span>
          </button>
        </div>

        {/* Soil Nutrients Grid */}
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-200 pb-2 mb-4">
            {i18n.language === "en" ? "1. Soil Nutrients (NPK & pH)" : "১. মাটির উপাদান (Soil Nutrients)"}
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
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-600/15 focus:border-emerald-600 focus:outline-none"
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
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-600/15 focus:border-emerald-600 focus:outline-none"
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
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-600/15 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {i18n.language === "en" ? "Soil pH" : "মাটির পিএইচ (pH)"} <span className="text-slate-500 font-mono text-[10px] font-normal">3.5-9.5</span>
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
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-600/15 focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Environmental Factors Grid */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-2 mb-4 gap-2">
            <h3 className="text-sm font-extrabold text-slate-900">
              {i18n.language === "en" ? "2. Weather & Environment" : "২. পরিবেশ ও আবহাওয়া (Climate & Environment)"}
            </h3>
            {weatherMeta && (
              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200 font-bold w-fit">
                <CloudSun className="w-3.5 h-3.5 text-blue-700" />
                <span>
                  {i18n.language === "en" ? formData.district : (weatherMeta.district_bn || formData.district)} ({weatherMeta.fallback ? (i18n.language === "en" ? "Regional Avg" : "আঞ্চলিক গড়") : (i18n.language === "en" ? "Live" : "লাইভ")})
                </span>
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {i18n.language === "en" ? "Temperature (°C)" : "তাপমাত্রা (°C)"}
              </label>
              <input
                type="number"
                name="temperature"
                min="5"
                max="50"
                step="0.1"
                value={formData.temperature}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-600/15 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {i18n.language === "en" ? "Humidity (%)" : "বায়ুর আর্দ্রতা (%)"}
              </label>
              <input
                type="number"
                name="humidity"
                min="10"
                max="100"
                step="0.1"
                value={formData.humidity}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-600/15 focus:border-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {i18n.language === "en" ? "Rainfall (mm)" : "বৃষ্টিপাত (মিলিমিটার)"}
              </label>
              <input
                type="number"
                name="rainfall"
                min="0"
                max="1200"
                step="0.1"
                value={formData.rainfall}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-600/15 focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Season & Soil Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              {i18n.language === "en" ? "Season" : "মৌসুম (Season)"}
            </label>
            <select
              name="season"
              value={formData.season}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-600/15 focus:border-emerald-600 focus:outline-none"
            >
              {seasons.map((s) => (
                <option key={s.id} value={s.id}>
                  {i18n.language === "en" ? (s.name_en || s.id) : (s.name_bn || s.id)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              {i18n.language === "en" ? "Soil Type" : "মাটির ধরন (Soil Type)"}
            </label>
            <select
              name="soil_type"
              value={formData.soil_type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-600/15 focus:border-emerald-600 focus:outline-none"
            >
              {soilTypes.map((st) => (
                <option key={st.id} value={st.id}>
                  {i18n.language === "en" ? (st.name_en || st.id) : (st.name_bn || st.id)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            ) : (
              <Sparkles className="w-5 h-5 text-amber-300" />
            )}
            <span>{t("buttons.recommend_crop")}</span>
          </button>
        </div>
      </form>

      {/* Results Section */}
      {result && result.recommendations && (
        <div className="space-y-6 pt-4 animate-in fade-in duration-300">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1d1d1f] flex items-center justify-center gap-2 tracking-tight">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
              <span>{i18n.language === "en" ? "Top 3 Recommended Crops" : "প্রস্তাবিত শীর্ষ ৩টি ফসল"}</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#86868b] font-bangla">
              {i18n.language === "en"
                ? "Ranked based on your soil nutrients and local climate compatibility score."
                : "আপনার জমির পুষ্টি ও আবহাওয়া অনুসারে সম্ভাব্য উৎপাদনশীলতার ভিত্তিতে সাজানো।"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {result.recommendations.map((item: any) => {
              const cropImg = getCropImage(item.crop_slug || item.crop_name_en || item.crop_name_bn);

              return (
                <div
                  key={item.crop_slug}
                  className={`app-card overflow-hidden rounded-[28px] flex flex-col justify-between transition-all bg-white group shadow-apple hover:shadow-apple-hover duration-300 ${
                    item.rank === 1
                      ? "border-2 border-emerald-600 shadow-[0_16px_40px_-8px_rgba(5,150,105,0.22)]"
                      : "border border-black/[0.06]"
                  }`}
                >
                  <div>
                    {/* Real Agricultural Crop Photograph */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 border-b border-black/[0.04]">
                      <img
                        src={cropImg.url}
                        alt={i18n.language === "en" ? cropImg.altEn : cropImg.altBn}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
                      
                      {/* Priority Rank Badge */}
                      <span className="absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-white border border-white/20 shadow-xs">
                        {i18n.language === "en" ? `Rank #${item.rank}` : `অগ্রাধিকার #${item.rank}`}
                      </span>

                      {/* Match Percentage Pill */}
                      <span className="absolute top-3 right-3 text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-white border border-emerald-400/40 shadow-xs">
                        {item.confidence_percentage}% {i18n.language === "en" ? "Match" : "সামঞ্জস্য"}
                      </span>

                      {/* Crop Botanical Category */}
                      <span className="absolute bottom-2.5 left-3 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-emerald-300 border border-white/10">
                        {i18n.language === "en" ? cropImg.categoryEn : cropImg.categoryBn}
                      </span>
                    </div>

                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-[#1d1d1f] group-hover:text-emerald-700 transition-colors tracking-tight">
                          {i18n.language === "en" ? (item.crop_name_en || item.crop_name_bn) : item.crop_name_bn}
                        </h3>
                        <p className="text-xs text-[#86868b] font-medium font-mono mt-0.5">
                          {i18n.language === "en" ? item.crop_name_bn : item.crop_name_en}
                        </p>
                      </div>

                      {/* Confidence Progress Meter */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-semibold text-[#86868b]">
                          <span>{i18n.language === "en" ? "Agro-Ecological Fit" : "মাটি ও জলবায়ু সামঞ্জস্যতা"}</span>
                          <span className="font-mono text-emerald-700 font-bold">{item.confidence_percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-black/[0.04]">
                          <div
                            className="bg-emerald-600 h-full rounded-full transition-all duration-700"
                            style={{ width: `${item.confidence_percentage}%` }}
                          />
                        </div>
                      </div>

                      <p className="text-xs text-[#1d1d1f] leading-relaxed bg-[#fbfbfd] p-4 rounded-2xl border border-black/[0.05] font-bangla">
                        {i18n.language === "en" ? (item.reason_en || item.reason_bn) : item.reason_bn}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    {item.fertilizer_supported ? (
                      <button
                        type="button"
                        onClick={() => handleSelectCropForFertilizer(item)}
                        className="w-full py-2.5 px-4 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98 cursor-pointer"
                      >
                        <span>{i18n.language === "en" ? "Calculate Fertilizer" : "সারের হিসাব দেখুন"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <div className="text-center py-2.5 px-3 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-black/[0.05]">
                        {i18n.language === "en" ? "Fertilizer model not available for this crop" : "এই ফসলের সারের মডেল যুক্ত হয়নি"}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Disclaimer Banner */}
          <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl text-xs text-amber-950 leading-relaxed font-bangla">
            {i18n.language === "en" ? (result.disclaimer_en || result.disclaimer_bn) : result.disclaimer_bn}
          </div>
        </div>
      )}
    </div>
  );
};
