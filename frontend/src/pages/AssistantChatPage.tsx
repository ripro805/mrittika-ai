import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useUnifiedFlow } from "../context/UnifiedFlowContext";
import apiClient from "../services/api";
import { VoiceInputButton } from "../components/VoiceInputButton";
import {
  MessageSquare,
  Send,
  Loader2,
  AlertTriangle,
  BookOpen,
  ThumbsUp,
  Flag,
  Sparkles,
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  sources?: any[];
  fallback?: boolean;
}

export const AssistantChatPage: React.FC = () => {
  const { t } = useTranslation();
  const { assistantContext } = useUnifiedFlow();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "নমস্কার / আসসালামু আলাইকুম! আমি মৃত্তিকা এআই কৃষি সহকারী। আপনার ফসলের রোগবালাই, সুষম সার বা জমি ব্যবস্থাপনা সংক্রান্ত যেকোনো প্রশ্ন বাংলায় করতে পারেন।",
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: textToSend.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const res = await apiClient.post("/chat", {
        message: textToSend.trim(),
        context: assistantContext || {},
      });

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: "bot",
        text: res.data.answer,
        sources: res.data.sources || [],
        fallback: res.data.fallback || false,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: "bot",
          text: "দুঃখিত, সংযোগ সমস্যার কারণে উত্তর তৈরি করা যায়নি। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।",
          fallback: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickChip = (chipText: string) => {
    handleSend(chipText);
  };

  const handleFlagResponse = async (msgId: string, text: string) => {
    try {
      await apiClient.post("/feedback", {
        module_type: "CHAT",
        rating: 1,
        flagged: true,
        comment: `Flagged chat response: ${text.slice(0, 100)}`,
      });
      alert("মতামত গৃহীত হয়েছে। আমাদের কৃষি কর্মকর্তা উত্তরটি পর্যালোচনা করবেন।");
    } catch {
      // Ignore
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-12rem)] min-h-[500px]">
      {/* Header */}
      <div className="bg-white p-4 rounded-t-3xl border border-gray-200 border-b-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-mrittika-800 text-white flex items-center justify-center shadow-md">
            <MessageSquare className="w-5 h-5 text-mrittika-300" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">
              বাংলা কৃষি সহকারী (AI Assistant)
            </h1>
            <p className="text-xs text-gray-500">
              যাচাইকৃত নথিভিত্তিক নির্ভুল পরামর্শ
            </p>
          </div>
        </div>

        {/* Unified Flow Context Pill */}
        {assistantContext?.crop && (
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mrittika-100 text-mrittika-900 text-xs font-bold border border-mrittika-200">
            <Sparkles className="w-3.5 h-3.5 text-mrittika-700" />
            <span>প্রসঙ্গ: {assistantContext.crop}</span>
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 border-x border-gray-200 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                  isUser
                    ? "bg-mrittika-800 text-white rounded-tr-none"
                    : msg.fallback
                    ? "bg-amber-50 text-amber-950 border border-amber-200 rounded-tl-none"
                    : "bg-white text-gray-900 border border-gray-200 rounded-tl-none"
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>

                {/* Sources & Citations */}
                {!isUser && msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                    <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-mrittika-700" />
                      <span>উৎস ও তথ্যসূত্র:</span>
                    </span>
                    {msg.sources.map((s, idx) => (
                      <div key={idx} className="text-[11px] text-gray-600">
                        • {s.source} {s.page ? `(পৃ. ${s.page})` : ""}
                        {s.is_sample && (
                          <span className="ml-1 text-[10px] text-amber-700 font-semibold">[নমুনা নথি]</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Fallback Warning Box */}
                {!isUser && msg.fallback && (
                  <div className="mt-2 text-xs text-amber-800 flex items-center gap-1 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-amber-600" />
                    <span>উপজেলা কৃষি কর্মকর্তা বরাবর সুপারিশকৃত উত্তর</span>
                  </div>
                )}
              </div>

              {/* Bot Action Buttons */}
              {!isUser && msg.id !== "welcome" && (
                <div className="flex items-center gap-2 mt-1 px-1">
                  <button
                    onClick={() => handleFlagResponse(msg.id, msg.text)}
                    className="text-[11px] text-gray-400 hover:text-red-600 flex items-center gap-1 transition-colors"
                    title="ভুল বা অনুপযুক্ত হলে রিপোর্ট করুন"
                  >
                    <Flag className="w-3 h-3" />
                    <span>রিপোর্ট</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-white p-3 rounded-2xl border border-gray-200 w-fit">
            <Loader2 className="w-4 h-4 animate-spin text-mrittika-700" />
            <span>নথি থেকে তথ্য অনুসন্ধান ও উত্তর তৈরি করা হচ্ছে...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Chips */}
      <div className="bg-gray-50 px-4 py-2 border-x border-gray-200 overflow-x-auto whitespace-nowrap flex gap-2">
        <button
          onClick={() => handleQuickChip("আমন ধানের ইউরিয়া প্রয়োগ")}
          className="text-xs px-3 py-1.5 rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
        >
          আমন ধানের ইউরিয়া প্রয়োগ
        </button>
        <button
          onClick={() => handleQuickChip("আলুর নাভিধসা রোগ লক্ষণ")}
          className="text-xs px-3 py-1.5 rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
        >
          আলুর নাভিধসা রোগ
        </button>
        <button
          onClick={() => handleQuickChip("মাটির pH ৫.৫ এর নিচে হলে করণীয়")}
          className="text-xs px-3 py-1.5 rounded-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
        >
          অম্লীয় মাটিতে চুন প্রয়োগ
        </button>
      </div>

      {/* Chat Input Bar */}
      <div className="bg-white p-3 rounded-b-3xl border border-gray-200 border-t-0 flex items-center gap-2">
        <VoiceInputButton
          onTranscript={(spokenText) => {
            setInputMessage((prev) => (prev ? `${prev} ${spokenText}` : spokenText));
          }}
          disabled={isLoading}
        />

        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="আপনার প্রশ্নটি বাংলায় লিখুন..."
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-mrittika-500 focus:bg-white"
        />

        <button
          type="button"
          onClick={() => handleSend()}
          disabled={isLoading || !inputMessage.trim()}
          className="p-2.5 rounded-2xl bg-mrittika-800 hover:bg-mrittika-900 text-white disabled:opacity-50 transition-colors shadow-sm"
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
