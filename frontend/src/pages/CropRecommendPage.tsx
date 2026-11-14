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
} from "lucide-react";

export const CropRecommendPage: React.FC = () => {
  const { t } = useTranslation();
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch metadata options
  useEffect(() => {
    apiClient.get("/meta/options").then((res) => {
      setDistricts(res.data.districts || []);
      setSeasons(res.data.seasons || []);
      setSoilTypes(res.data.soil_types || []);
    }).catch(() => {});
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: e.target.type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleAutofillWeather = async () => {
    setIsLoadingWeather(true);
    setErrorMessage(null);
    try {
      const res = await apiClient.get(`/weather?district=${formData.district}`);
      setFormData((prev) => ({
        ...prev,
        temperature: res.data.temperature,
        humidity: res.data.humidity,
        rainfall: res.data.rainfall,
        season: res.data.season || prev.season,
      }));
    } catch {
      setErrorMessage("আবহাওয়া তথ্য লোড করা যায়নি। দয়া করে ম্যানুয়ালি ইনপুট দিন।");
    } finally {
      setIsLoadingWeather(false);
    }
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
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mrittika-100 text-mrittika-800 text-xs font-bold">
          <Sprout className="w-3.5 h-3.5" />
          <span>মডিউল ১: ফসল নির্বাচন</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900">
          মাটি ও আবহাওয়ার ভিত্তিতে সেরা ফসল
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto">
          আপনার জমির পুষ্টির মাত্রা এবং স্থানীয় আবহাওয়া প্রদান করুন; এআই মডেল বিশ্লেষণ করে সেরা ৩টি ফসল সুপারিশ করবে।
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        {/* District & Weather Autofill */}
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-1/2">
            <label className="block text-xs font-bold text-gray-700 mb-1">
              আপনার জেলা নির্বাচন করুন
            </label>
            <select
              name="district"
              value={formData.district}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-mrittika-500 focus:outline-none"
            >
              {districts.map((d) => (
                <option key={d.name_en} value={d.name_en}>
                  {d.name_bn} ({d.name_en})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleAutofillWeather}
            disabled={isLoadingWeather}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors shadow-sm"
          >
            {isLoadingWeather ? (
              <Loader2 className="w-4 h-4 animate-spin text-mrittika-700" />
            ) : (
              <CloudSun className="w-4 h-4 text-blue-600" />
            )}
            <span>{t("buttons.autofill_weather")}</span>
          </button>
        </div>

        {/* Soil Nutrients Grid */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
            ১. মাটির উপাদান (Soil Nutrients)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                নাইট্রোজেন (N) <span className="text-gray-400 font-normal">kg/ha</span>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-mrittika-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ফসফরাস (P) <span className="text-gray-400 font-normal">kg/ha</span>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-mrittika-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                পটাশিয়াম (K) <span className="text-gray-400 font-normal">kg/ha</span>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-mrittika-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                মাটির পিএইচ (pH) <span className="text-gray-400 font-normal">3.5-9.5</span>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-mrittika-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Environmental Factors Grid */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4">
            ২. পরিবেশ ও আবহাওয়া (Climate & Environment)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                তাপমাত্রা (°C)
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
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-mrittika-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                বায়ুর আর্দ্রতা (%)
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
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-mrittika-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                বৃষ্টিপাত (মিলিমিটার)
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
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-mrittika-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Season & Soil Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              মৌসুম (Season)
            </label>
            <select
              name="season"
              value={formData.season}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-mrittika-500 focus:outline-none"
            >
              {seasons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name_bn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              মাটির ধরন (Soil Type)
            </label>
            <select
              name="soil_type"
              value={formData.soil_type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-mrittika-500 focus:outline-none"
            >
              {soilTypes.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name_bn}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-xl bg-mrittika-800 hover:bg-mrittika-900 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5 text-yellow-300" />
            )}
            <span>{t("buttons.recommend_crop")}</span>
          </button>
        </div>
      </form>

      {/* Results Section */}
      {result && result.recommendations && (
        <div className="space-y-6 pt-4 animate-fade-in">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
              <CheckCircle className="w-6 h-6 text-mrittika-700" />
              <span>প্রস্তাবিত শীর্ষ ৩টি ফসল</span>
            </h2>
            <p className="text-xs text-gray-500">
              আপনার জমির পুষ্টি ও আবহাওয়া অনুসারে সম্ভাব্য উৎপাদনশীলতার ভিত্তিতে সাজানো।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {result.recommendations.map((item: any) => (
              <div
                key={item.crop_slug}
                className={`bg-white rounded-3xl border-2 p-6 shadow-sm flex flex-col justify-between transition-all ${
                  item.rank === 1
                    ? "border-mrittika-600 ring-2 ring-mrittika-100 shadow-md"
                    : "border-gray-200"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-mrittika-100 text-mrittika-900">
                      অগ্রাধিকার #{item.rank}
                    </span>
                    <span className="text-sm font-extrabold text-mrittika-800">
                      {item.confidence_percentage}% সামঞ্জস্য
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {item.crop_name_bn}
                    </h3>
                    <p className="text-xs text-gray-400 font-medium">
                      {item.crop_name_en}
                    </p>
                  </div>

                  {/* Confidence Bar */}
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-mrittika-600 h-2 rounded-full transition-all duration-700"
                      style={{ width: `${item.confidence_percentage}%` }}
                    />
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                    {item.reason_bn}
                  </p>
                </div>

                <div className="pt-6">
                  {item.fertilizer_supported ? (
                    <button
                      type="button"
                      onClick={() => handleSelectCropForFertilizer(item)}
                      className="w-full py-2.5 px-3 rounded-xl bg-mrittika-800 hover:bg-mrittika-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-transform hover:-translate-y-0.5"
                    >
                      <span>সারের হিসাব দেখুন</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="text-center py-2 px-3 rounded-xl bg-gray-100 text-gray-500 text-xs font-medium">
                      এই ফসলের সারের মডেল যুক্ত হয়নি
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Disclaimer Banner */}
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-900 leading-relaxed">
            {result.disclaimer_bn}
          </div>
        </div>
      )}
    </div>
  );
};
