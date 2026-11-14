import React from "react";
import {
  Cpu,
  Layers,
  Database,
  ExternalLink,
  CheckCircle2,
  TrendingUp,
  Brain,
  ShieldAlert,
} from "lucide-react";

export const AdminModelRegistryPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <Cpu className="w-6 h-6 text-purple-700" />
          <span>এআই ও মেশিন লার্নিং মডেল রেজিস্ট্রি (Model Architecture)</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          প্ল্যাটফর্মের ব্যাকএন্ডে ব্যবহৃত ক্লাসিফায়ার, রিগ্রেসর এবং এলএলএম রাউটিং স্পেসিফিকেশন
        </p>
      </div>

      {/* Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Crop Recommendation Model */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-emerald-700" />
              <h2 className="text-base font-bold text-gray-900">ফসল নির্বাচন ক্লাসিফায়ার</h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              সক্রিয় (Active)
            </span>
          </div>

          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="font-semibold text-gray-700">অ্যালগরিদম:</span>
              <span className="font-mono text-gray-900 font-bold">ExtraTreesClassifier</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="font-semibold text-gray-700">ইনপুট বৈশিষ্ট্য (Features):</span>
              <span className="text-gray-900">N, P, K, pH, তাপমাত্রা, আর্দ্রতা, বৃষ্টিপাত</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="font-semibold text-gray-700">আউটপুট ক্লাস:</span>
              <span className="font-bold text-emerald-800">২৪টি বাংলাদেশি ক্যানোনিকাল ফসল</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="font-semibold text-gray-700">মডেল একুরেসি (Validation):</span>
              <span className="font-bold text-gray-900">৯৪.৮%</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="font-semibold text-gray-700">আর্টিফ্যাক্ট ফাইল:</span>
              <span className="font-mono text-gray-700">mrittika_crop_model.pkl</span>
            </div>
          </div>
        </div>

        {/* Fertilizer Recommendation Model */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-700" />
              <h2 className="text-base font-bold text-gray-900">সুষম সার প্রেডিকশন রিগ্রেসর</h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
              সক্রিয় (Active)
            </span>
          </div>

          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="font-semibold text-gray-700">অ্যালগরিদম:</span>
              <span className="font-mono text-gray-900 font-bold">MultiOutputRegressor (XGBoost)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="font-semibold text-gray-700">লক্ষ্য উপাদান (Targets):</span>
              <span className="text-gray-900">Urea, TSP, MoP, Compost (kg/ha)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="font-semibold text-gray-700">সহায়ক প্রধান ফসল:</span>
              <span className="font-bold text-amber-800">১৩টি প্রধান খাদ্য ও অর্থকরী ফসল</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="font-semibold text-gray-700">মডেল স্কোর (R² Score):</span>
              <span className="font-bold text-gray-900">০.৯৬২</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="font-semibold text-gray-700">আর্টিফ্যাক্ট ফাইল:</span>
              <span className="font-mono text-gray-700">mrittika_fertilizer_model.pkl</span>
            </div>
          </div>
        </div>

        {/* Vector Embedding (RAG) */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-700" />
              <h2 className="text-base font-bold text-gray-900">ভেক্টর এমবেডিং ও সেমান্টিক সার্চ</h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
              ChromaDB
            </span>
          </div>

          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="font-semibold text-gray-700">এমবেডিং মডেল:</span>
              <span className="font-mono text-gray-900 font-bold">intfloat/multilingual-e5-large</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="font-semibold text-gray-700">ভেক্টর ডাইমেনশন:</span>
              <span className="text-gray-900 font-bold">1024 float32</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="font-semibold text-gray-700">সাদৃশ্য থ্রেশহোল্ড (Cosine Score):</span>
              <span className="text-gray-900 font-bold">০.৮৫ (উচ্চ নির্ভুলতা)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="font-semibold text-gray-700">টপ-কে চাঙ্ক নির্বাচন:</span>
              <span className="text-gray-900 font-bold">Top-4 Chunks per query</span>
            </div>
          </div>
        </div>

        {/* LLM Failover Router */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-purple-700" />
              <h2 className="text-base font-bold text-gray-900">এলএলএম রাউটার ও সার্কিট ব্রেকার</h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
              স্বয়ংক্রিয় ফেইলওভার
            </span>
          </div>

          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="font-semibold text-gray-700">প্রাইমারি প্রোভাইডার:</span>
              <span className="font-bold text-gray-900">Groq (openai/gpt-oss-120b)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="font-semibold text-gray-700">ব্যাকআপ প্রোভাইডার:</span>
              <span className="font-bold text-gray-900">Google Gemini (gemini-2.5-flash-lite)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="font-semibold text-gray-700">সার্কিট ব্রেকার নিয়ম:</span>
              <span className="text-gray-900">৫টি ব্যর্থতার পর ৬০ সেকেন্ড কুলডাউন</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="font-semibold text-gray-700">হস্তক্ষেপ ব্যাকআপ:</span>
              <span className="font-bold text-teal-800">উপজেলা কৃষি কর্মকর্তা রেফারেল</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hugging Face Hub Banner */}
      <div className="p-6 rounded-3xl bg-gray-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-base font-bold">Hugging Face মডেল রিপোজিটরি</h3>
          <p className="text-xs text-gray-400">
            মডেল ভার্সনিং এবং সাইকেল আপডেট ট্র্যাক করুন সরাসরি অফিসিয়াল Hugging Face রিপোজিটরিতে
          </p>
        </div>
        <a
          href="https://huggingface.co/ripro805/mrittika-ai"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-gray-900 text-xs font-bold hover:bg-gray-100 transition shadow-sm"
        >
          <span>Hugging Face রিপো খুলুন</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
