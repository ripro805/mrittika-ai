import React, { useState, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export const VoiceInputButton: React.FC<VoiceInputProps> = ({ onTranscript, disabled }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "bn-BD"; // Bangla (Bangladesh)

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onTranscript(transcript);
        }
        setIsListening(false);
      };

      rec.onerror = () => {
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
      setIsSupported(true);
    }
  }, [onTranscript]);

  if (!isSupported) {
    return null; // Gracefully hidden if browser lacks Web Speech API
  }

  const toggleListening = () => {
    if (disabled || !recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      disabled={disabled}
      className={`p-2.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        isListening
          ? "bg-rose-600 text-white animate-pulse focus:ring-rose-500 shadow-md"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 focus:ring-emerald-600"
      }`}
      title={isListening ? "ভয়েস রেকর্ড বন্ধ করুন (Stop)" : "বাংলায় মুখে বলুন (Speak in Bangla)"}
      aria-label="Voice input"
    >
      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-emerald-800" />}
    </button>
  );
};
