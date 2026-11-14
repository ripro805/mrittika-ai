import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useUnifiedFlow } from "../context/UnifiedFlowContext";
import { useAuth } from "../context/AuthContext";
import apiClient, { getAccessToken } from "../services/api";
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
  Copy,
  Check,
  Square,
  RefreshCw,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  Database,
  UploadCloud,
  FileText,
  AlertCircle,
  Menu,
} from "lucide-react";

interface SourceItem {
  source: string;
  filename?: string;
  page: string;
  snippet: string;
  is_sample?: boolean;
}

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  sources?: SourceItem[];
  fallback?: boolean;
  provider_used?: string;
}

interface ChatSessionItem {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
}

export const AssistantChatPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const { assistantContext, carryContextToAssistant } = useUnifiedFlow();

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "নমস্কার / আসসালামু আলাইকুম! আমি মৃত্তিকা এআই কৃষি সহকারী। আপনার ফসলের পুষ্টি, রোগবালাই, সুষম সার ও জমি ব্যবস্থাপনা সংক্রান্ত যেকোনো প্রশ্ন বাংলায় করতে পারেন।",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedSourceIndex, setExpandedSourceIndex] = useState<string | null>(null);

  // Streaming & Abort
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Error & Retry State
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState<string>("");

  // Sessions State
  const [sessions, setSessions] = useState<ChatSessionItem[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Feedback Modal State
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackTargetMessage, setFeedbackTargetMessage] = useState<ChatMessage | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number>(1);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Admin Knowledge Modal State
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminDocs, setAdminDocs] = useState<any[]>([]);
  const [adminTotalChunks, setAdminTotalChunks] = useState<number>(0);
  const [adminUploading, setAdminUploading] = useState(false);
  const [adminUploadFile, setAdminUploadFile] = useState<File | null>(null);
  const [adminMessage, setAdminMessage] = useState<string | null>(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    if (typeof messagesEndRef.current?.scrollIntoView === "function") {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load Sessions for authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      loadSessions();
    }
  }, [isAuthenticated]);

  const loadSessions = async () => {
    try {
      const res = await apiClient.get("/assistant/sessions/");
      setSessions(res.data);
    } catch {
      // Ignore background session fetch errors
    }
  };

  const startNewChat = () => {
    setCurrentSessionId(null);
    setMessages([
      {
        id: "welcome",
        sender: "bot",
        text: "নতুন আলোচনা শুরু হয়েছে। আপনার প্রশ্নটি বাংলায় লিখুন।",
      },
    ]);
    setErrorMessage(null);
    setIsSidebarOpen(false);
    if (inputRef.current) inputRef.current.focus();
  };

  const selectSession = async (sessionId: string) => {
    try {
      setIsLoading(true);
      const res = await apiClient.get(`/assistant/sessions/${sessionId}/`);
      setCurrentSessionId(res.data.id);
      const history: ChatMessage[] = (res.data.messages || []).map((m: any) => ({
        id: `msg_${m.id}`,
        sender: m.role === "user" ? "user" : "bot",
        text: m.content,
        sources: m.sources || [],
        fallback: m.fallback || false,
      }));
      setMessages(
        history.length > 0
          ? history
          : [
              {
                id: "welcome",
                sender: "bot",
                text: "আলোচনা লোড হয়েছে। নতুন প্রশ্ন লিখুন।",
              },
            ]
      );
      setIsSidebarOpen(false);
    } catch {
      setErrorMessage("আলোচনাটি লোড করতে সমস্যা হয়েছে।");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই আলোচনা মুছে ফেলতে চান?")) return;
    try {
      await apiClient.delete(`/assistant/sessions/${sessionId}/`);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (currentSessionId === sessionId) {
        startNewChat();
      }
    } catch {
      alert("আলোচনা মুছতে সমস্যা হয়েছে।");
    }
  };

  // Stop Generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  // Send Message (SSE streaming with fetch + ReadableStream)
  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || inputMessage).trim();
    if (!textToSend || isLoading) return;

    setErrorMessage(null);
    setLastUserMessage(textToSend);
    setInputMessage("");

    const userMsgId = `user_${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: textToSend,
    };

    const botMsgId = `bot_${Date.now()}`;
    const initialBotMsg: ChatMessage = {
      id: botMsgId,
      sender: "bot",
      text: "",
      sources: [],
      fallback: false,
    };

    setMessages((prev) => [...prev, userMsg, initialBotMsg]);
    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const token = getAccessToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("/api/v1/assistant/chat/stream/", {
        method: "POST",
        headers,
        credentials: "include",
        signal: controller.signal,
        body: JSON.stringify({
          message: textToSend,
          session_id: currentSessionId,
          context: assistantContext || {},
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("RATE_LIMIT");
        } else if (response.status >= 500) {
          throw new Error("SERVER_ERROR");
        } else {
          throw new Error("REQUEST_FAILED");
        }
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      if (!reader) throw new Error("NO_STREAM");

      let buffer = "";
      let accumulatedText = "";
      let sources: SourceItem[] = [];
      let isFallback = false;

      let isStreaming = true;
      while (isStreaming) {
        const { done, value } = await reader.read();
        if (done) {
          isStreaming = false;
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const block of lines) {
          if (!block.trim()) continue;
          const eventMatch = block.match(/event:\s*([a-zA-Z0-9_-]+)/);
          const dataMatch = block.match(/data:\s*(.*)/s);

          const eventType = eventMatch ? eventMatch[1] : "message";
          const dataContent = dataMatch ? dataMatch[1].trim() : "";

          if (eventType === "sources") {
            try {
              sources = JSON.parse(dataContent);
              setMessages((prev) =>
                prev.map((m) => (m.id === botMsgId ? { ...m, sources } : m))
              );
            } catch {
              // Ignore non-json or incomplete chunk
            }
          } else if (eventType === "token") {
            try {
              const parsed = JSON.parse(dataContent);
              accumulatedText += parsed.token || "";
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === botMsgId ? { ...m, text: accumulatedText } : m
                )
              );
            } catch {
              // Ignore incomplete token json
            }
          } else if (eventType === "done") {
            try {
              const parsed = JSON.parse(dataContent);
              if (parsed.session_id && !currentSessionId) {
                setCurrentSessionId(parsed.session_id);
                loadSessions();
              }
              isFallback = !!parsed.fallback;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === botMsgId
                    ? {
                        ...m,
                        fallback: isFallback,
                        provider_used: parsed.provider_used,
                      }
                    : m
                )
              );
            } catch {
              // Ignore payload parse error on completion
            }
          } else if (eventType === "error") {
            let errorMsg = "STREAM_ERROR";
            try {
              const parsed = JSON.parse(dataContent);
              errorMsg = parsed.error || "STREAM_ERROR";
            } catch {
              errorMsg = "STREAM_ERROR";
            }
            throw new Error(errorMsg);
          }
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        // User voluntarily aborted
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botMsgId
              ? {
                  ...m,
                  text: m.text ? m.text + " [ব্যবহারকারী কর্তৃক স্থগিত]" : "উত্তর প্রদান স্থগিত করা হয়েছে।",
                }
              : m
          )
        );
      } else {
        const errType = err.message || "";
        let friendlyError = "সার্ভারে সাময়িক সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।";
        if (errType === "RATE_LIMIT") {
          friendlyError = "অনুরোধের সীমা (Rate Limit) অতিক্রম করেছে। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করে আবার চেষ্টা করুন।";
        } else if (errType.includes("Failed to fetch") || errType === "NO_STREAM") {
          friendlyError = "ইন্টারনেট সংযোগে সমস্যা হয়েছে। আপনার সংযোগ পরীক্ষা করে পুনরায় চেষ্টা করুন।";
        }
        setErrorMessage(friendlyError);

        // Update bot message to indicate failure
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botMsgId && !m.text
              ? {
                  ...m,
                  text: "দুঃখিত, সংযোগ সমস্যার কারণে উত্তর তৈরি করা যায়নি। নিচে 'পুনরায় চেষ্টা করুন' বোতামে চাপুন।",
                  fallback: true,
                }
              : m
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openFeedbackModal = (msg: ChatMessage) => {
    setFeedbackTargetMessage(msg);
    setFeedbackRating(1);
    setFeedbackComment("");
    setFeedbackSubmitted(false);
    setFeedbackModalOpen(true);
  };

  const submitFeedback = async (helpful: boolean) => {
    if (!feedbackTargetMessage) return;
    try {
      await apiClient.post("/assistant/feedback/", {
        rating: helpful ? 5 : feedbackRating,
        flagged: !helpful,
        comment: feedbackComment || (helpful ? "সঠিক ও সহায়ক উত্তর।" : "ভুল বা অসন্তোষজনক উত্তর।"),
        context_data: {
          message_text: feedbackTargetMessage.text,
          sources: feedbackTargetMessage.sources,
          session_id: currentSessionId,
        },
      });
      setFeedbackSubmitted(true);
      setTimeout(() => {
        setFeedbackModalOpen(false);
        setFeedbackTargetMessage(null);
      }, 1500);
    } catch {
      alert("মতামত সংরক্ষণ করা যায়নি।");
    }
  };

  // Admin Knowledge modal actions
  const openAdminKnowledge = async () => {
    setAdminModalOpen(true);
    setAdminMessage(null);
    try {
      const res = await apiClient.get("/assistant/admin/documents/");
      setAdminDocs(res.data.documents || []);
      setAdminTotalChunks(res.data.total_indexed_chunks || 0);
    } catch {
      setAdminMessage("নথি লোড করতে ব্যর্থ হয়েছে।");
    }
  };

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUploadFile) return;
    setAdminUploading(true);
    setAdminMessage(null);

    const formData = new FormData();
    formData.append("file", adminUploadFile);

    try {
      const res = await apiClient.post("/assistant/admin/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAdminMessage(res.data.message || "নথি সফলভাবে আপলোড হয়েছে!");
      setAdminUploadFile(null);
      openAdminKnowledge();
    } catch (err: any) {
      setAdminMessage(err.response?.data?.error || "আপলোড ব্যর্থ হয়েছে।");
    } finally {
      setAdminUploading(false);
    }
  };

  const handleDeleteDoc = async (filename: string) => {
    if (!window.confirm(`আপনি কি '${filename}' নথিটি মুছে ফেলতে চান?`)) return;
    try {
      await apiClient.delete(`/assistant/admin/documents/${filename}/`);
      setAdminDocs((prev) => prev.filter((d) => d.filename !== filename));
    } catch {
      alert("নথি মুছতে সমস্যা হয়েছে।");
    }
  };

  const handleReindex = async () => {
    if (!window.confirm("আপনি কি সম্পূর্ণ নলেজবেস পুনরায় সূচীকরণ (Re-index) করতে চান?")) return;
    setAdminUploading(true);
    try {
      const res = await apiClient.post("/assistant/admin/reindex/");
      alert(`পুনরায় সূচীকরণ সম্পন্ন: ${res.data.total_indexed_chunks} chunks.`);
      openAdminKnowledge();
    } catch {
      alert("পুনরায় সূচীকরণ ব্যর্থ হয়েছে।");
    } finally {
      setAdminUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex h-[calc(100vh-10rem)] min-h-[550px] bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden font-sans">
      {/* Sessions Sidebar (Drawer on mobile) */}
      <div
        className={`${
          isSidebarOpen ? "flex" : "hidden"
        } md:flex w-64 bg-gray-50 border-r border-gray-200 flex-col flex-shrink-0 z-20`}
      >
        <div className="p-3 border-b border-gray-200 flex items-center justify-between">
          <button
            onClick={startNewChat}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-2xl bg-mrittika-800 hover:bg-mrittika-900 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন আলোচনা (New)</span>
          </button>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1.5 text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <p className="text-[11px] font-bold text-gray-400 px-3 py-1 uppercase tracking-wider">
            পূর্বের আলোচনা সমূহ
          </p>
          {!isAuthenticated ? (
            <div className="p-3 text-xs text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
              <p>লগইন করলে আপনার আলোচনার ইতিহাস এখানে সংরক্ষিত থাকবে।</p>
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-xs text-gray-400 px-3 py-2">কোনো আলোচনা নেই।</p>
          ) : (
            sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => selectSession(s.id)}
                className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                  currentSessionId === s.id
                    ? "bg-mrittika-100 text-mrittika-900 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="truncate flex-1 pr-2">
                  <span>{s.title}</span>
                </div>
                <button
                  onClick={(e) => deleteSession(s.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 p-1 transition-opacity"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {user?.role === "ADMIN" && (
          <div className="p-3 border-t border-gray-200 bg-white">
            <button
              onClick={openAdminKnowledge}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-mrittika-300 text-mrittika-900 hover:bg-mrittika-50 text-xs font-semibold"
            >
              <Database className="w-4 h-4 text-mrittika-700" />
              <span>Admin: নলেজবেস</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-white relative">
        {/* Header */}
        <div className="p-3.5 border-b border-gray-200 flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100"
              title="আলোচনার ইতিহাস (Toggle Sidebar)"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-2xl bg-mrittika-800 text-white flex items-center justify-center shadow-md">
              <MessageSquare className="w-5 h-5 text-mrittika-300" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 leading-tight">
                মৃত্তিকা এআই বাংলা কৃষি সহকারী
              </h1>
              <p className="text-[11px] text-gray-500">
                যাচাইকৃত নথিভিত্তিক নির্ভরযোগ্য কৃষি পরামর্শ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Unified Flow Context Pill */}
            {assistantContext?.crop && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>প্রসঙ্গ: {assistantContext.crop}</span>
                <button
                  onClick={() => carryContextToAssistant("", "")}
                  className="hover:text-red-600 ml-0.5"
                  title="প্রসঙ্গ মুছে ফেলুন"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error Banner with Retry */}
        {errorMessage && (
          <div className="bg-red-50 border-b border-red-200 p-2.5 px-4 flex items-center justify-between text-xs text-red-800 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            {lastUserMessage && (
              <button
                onClick={() => handleSend(lastUserMessage)}
                className="flex items-center gap-1 font-bold text-red-700 hover:text-red-900 underline ml-3"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>পুনরায় চেষ্টা করুন</span>
              </button>
            )}
          </div>
        )}

        {/* Messages List */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50"
          aria-live="polite"
        >
          {messages.map((msg) => {
            const isUser = msg.sender === "user";

            return (
              <div
                key={msg.id}
                className={`w-full flex flex-col ${isUser ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[88%] sm:max-w-[78%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm transition-all ${
                    isUser
                      ? "bg-mrittika-800 text-white rounded-tr-none"
                      : msg.fallback
                      ? "bg-amber-50 text-amber-950 border border-amber-200 rounded-tl-none"
                      : "bg-white text-gray-900 border border-gray-200 rounded-tl-none"
                  }`}
                >
                  {/* Sender Header */}
                  <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-semibold">
                    {isUser ? (
                      <span className="text-emerald-200 ml-auto flex items-center gap-1 font-bold">
                        👤 আপনি
                      </span>
                    ) : (
                      <span className="text-mrittika-800 flex items-center gap-1 font-bold">
                        <Sparkles className="w-3.5 h-3.5 text-mrittika-600" />
                        মৃত্তিকা এআই
                      </span>
                    )}
                  </div>

                  <p className="whitespace-pre-line leading-relaxed font-bangla">
                    {msg.text || (isLoading && !isUser ? "..." : "")}
                  </p>

                  {/* Fallback Special Card */}
                  {!isUser && msg.fallback && (
                    <div className="mt-3 p-3 bg-white/80 rounded-xl border border-amber-300 text-xs text-amber-900 space-y-1.5 shadow-xs">
                      <div className="flex items-center gap-1.5 font-bold text-amber-900">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>উপজেলা কৃষি কর্মকর্তার সাথে যোগাযোগ করুন</span>
                      </div>
                      <p className="text-[11px] text-amber-800 leading-normal">
                        উচ্চ-ঝুঁকি বা বিষাক্ত রাসায়নিক প্রয়োগের ক্ষেত্রে শুধুমাত্র সরকারি লাইসেন্সধারী কর্মকর্তা বা আপনার নিকটস্থ উপজেলা কৃষি অফিসে গিয়ে সরাসরি পরামর্শ নিন।
                      </p>
                    </div>
                  )}

                  {/* Expandable Sources Chips */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="text-[11px] font-bold text-gray-500 mb-1 flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-mrittika-700" />
                        <span>তথ্যসূত্র ও নির্দেশিকা ({msg.sources.length}):</span>
                      </div>
                      <div className="space-y-1.5">
                        {msg.sources.map((s, idx) => {
                          const chipKey = `${msg.id}_src_${idx}`;
                          const isExpanded = expandedSourceIndex === chipKey;
                          return (
                            <div
                              key={idx}
                              className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-[11px] text-gray-700"
                            >
                              <div
                                onClick={() =>
                                  setExpandedSourceIndex(isExpanded ? null : chipKey)
                                }
                                className="flex items-center justify-between cursor-pointer font-medium"
                              >
                                <span className="truncate flex-1">
                                  📄 {s.source} {s.page ? `(পৃ. ${s.page})` : ""}
                                </span>
                                <div className="flex items-center gap-1">
                                  {s.is_sample && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                      নমুনা নথি
                                    </span>
                                  )}
                                  {isExpanded ? (
                                    <ChevronUp className="w-3 h-3 text-gray-500" />
                                  ) : (
                                    <ChevronDown className="w-3 h-3 text-gray-500" />
                                  )}
                                </div>
                              </div>
                              {isExpanded && s.snippet && (
                                <p className="mt-1.5 pt-1.5 border-t border-gray-200 text-gray-600 italic bg-white p-1.5 rounded text-[10px] leading-relaxed">
                                  "{s.snippet}"
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Assistant Message Actions */}
                {!isUser && msg.id !== "welcome" && (
                  <div className="flex items-center gap-2 mt-1 px-1 text-gray-400 text-xs">
                    <button
                      onClick={() => handleCopyText(msg.id, msg.text)}
                      className="hover:text-gray-700 p-1 flex items-center gap-1"
                      title="অনুলিপি (Copy)"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setFeedbackTargetMessage(msg);
                        submitFeedback(true);
                      }}
                      className="hover:text-emerald-700 p-1"
                      title="সহায়ক উত্তর (Helpful)"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openFeedbackModal(msg)}
                      className="hover:text-red-600 p-1 flex items-center gap-1"
                      title="ভুল উত্তর রিপোর্ট করুন"
                    >
                      <Flag className="w-3.5 h-3.5" />
                      <span className="text-[10px]">রিপোর্ট</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-white p-3 rounded-2xl border border-gray-200 w-fit animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-mrittika-700" />
              <span>নথি বিশ্লেষণ ও উত্তর প্রস্তুত করা হচ্ছে...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 6 Suggested Starter Prompts */}
        <div className="bg-white px-4 py-2 border-t border-gray-100 overflow-x-auto whitespace-nowrap flex gap-2 no-scrollbar">
          {[
            "আমন ধানের ইউরিয়া উপরিপ্রয়োগের নিয়ম",
            "আলুর নাভিধসা রোগ লক্ষণ ও প্রতিকার",
            "অম্লীয় মাটিতে চুন প্রয়োগের সঠিক মাত্রা",
            "বেলে দোআঁশ মাটিতে বোরো ধানের সার ব্যবস্থাপনা",
            "পাট ফসলের সঠিক বীজ বপন সময়",
            "মাটির জৈব পদার্থ বাড়ানোর উপায়",
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 rounded-full bg-gray-50 hover:bg-mrittika-50 text-gray-700 hover:text-mrittika-900 border border-gray-200 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="bg-white p-3 border-t border-gray-200">
          <div className="flex items-end gap-2 bg-gray-50 rounded-2xl border border-gray-300 p-2 focus-within:border-mrittika-600 focus-within:bg-white focus-within:ring-1 focus-within:ring-mrittika-600 transition-all">
            <VoiceInputButton
              onTranscript={(spoken) => {
                setInputMessage((prev) => (prev ? `${prev} ${spoken}` : spoken));
              }}
              disabled={isLoading}
            />

            <textarea
              ref={inputRef}
              rows={1}
              value={inputMessage}
              maxLength={1000}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="আপনার প্রশ্নটি বাংলায় লিখুন... (Enter চাপলে সেন্ড হবে)"
              disabled={isLoading}
              className="flex-1 bg-transparent border-0 text-sm focus:outline-none resize-none max-h-32 min-h-[2.25rem] py-1 text-gray-900 placeholder-gray-400 font-bangla"
            />

            <div className="flex items-center gap-1.5">
              <span
                className={`text-[10px] ${
                  inputMessage.length > 900 ? "text-amber-600 font-bold" : "text-gray-400"
                }`}
              >
                {inputMessage.length}/1000
              </span>

              {isLoading ? (
                <button
                  type="button"
                  onClick={handleStopGeneration}
                  className="p-2 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors shadow-sm"
                  title="উত্তর থামান (Stop)"
                >
                  <Square className="w-4 h-4 fill-white" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={isLoading || !inputMessage.trim()}
                  className="p-2 rounded-xl bg-mrittika-800 hover:bg-mrittika-900 text-white disabled:opacity-40 transition-colors shadow-sm"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {feedbackModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl border border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">
                ভুল বা অনুপযুক্ত উত্তর রিপোর্ট করুন
              </h3>
              <button
                onClick={() => setFeedbackModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {feedbackSubmitted ? (
              <div className="p-4 bg-emerald-50 rounded-xl text-emerald-800 text-xs text-center font-bold">
                ✓ আপনার রিপোর্ট সফলভাবে গৃহীত হয়েছে। কৃষি কর্মকর্তা এটি পর্যালোচনা করবেন।
              </div>
            ) : (
              <>
                <p className="text-xs text-gray-600">
                  উত্তরটিতে কী ধরণের ত্রুটি লক্ষ্য করেছেন তা জানালে আমরা আমাদের সিস্টেম আরও সমৃদ্ধ করতে পারব।
                </p>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">
                    রেটিং (১-৫):
                  </label>
                  <select
                    value={feedbackRating}
                    onChange={(e) => setFeedbackRating(Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-lg border border-gray-300"
                  >
                    <option value={1}>১ - অত্যন্ত অসন্তোষজনক / ক্ষতিকর তথ্য</option>
                    <option value={2}>২ - ভুল তথ্য রয়েছে</option>
                    <option value={3}>৩ - অসম্পূর্ণ উত্তর</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">
                    মন্তব্য / সঠিক তথ্য জানা থাকলে লিখুন:
                  </label>
                  <textarea
                    rows={3}
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="উত্তরের ত্রুটি বিস্তারিত লিখুন..."
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-mrittika-600"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setFeedbackModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100"
                  >
                    বাতিল
                  </button>
                  <button
                    onClick={() => submitFeedback(false)}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm"
                  >
                    রিপোর্ট জমা দিন
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Admin Knowledge Management Modal */}
      {adminModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-mrittika-700" />
                  <span>নলেজবেস ও ভেক্টর ডাটাবেস ব্যবস্থাপনা</span>
                </h3>
                <p className="text-xs text-gray-500">
                  মোট সংরক্ষিত ভেক্টর চাঙ্কস: {adminTotalChunks}
                </p>
              </div>
              <button
                onClick={() => setAdminModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {adminMessage && (
              <div className="p-3 bg-mrittika-50 border border-mrittika-200 text-mrittika-900 text-xs rounded-xl font-medium">
                {adminMessage}
              </div>
            )}

            {/* Document Upload Form */}
            <form
              onSubmit={handleUploadDoc}
              className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-center gap-3"
            >
              <input
                type="file"
                accept=".pdf,.md,.txt"
                onChange={(e) => setAdminUploadFile(e.target.files?.[0] || null)}
                className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-mrittika-800 file:text-white hover:file:bg-mrittika-900 cursor-pointer flex-1"
              />
              <button
                type="submit"
                disabled={!adminUploadFile || adminUploading}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-mrittika-800 hover:bg-mrittika-900 text-white text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {adminUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <UploadCloud className="w-4 h-4" />
                )}
                <span>আপলোড ও ইনডেক্স</span>
              </button>
            </form>

            {/* Documents List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              <h4 className="text-xs font-bold text-gray-700 uppercase">
                নথিপত্র তালিকা ({adminDocs.length})
              </h4>
              {adminDocs.length === 0 ? (
                <p className="text-xs text-gray-400">কোনো নথি পাওয়া যায়নি।</p>
              ) : (
                adminDocs.map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between text-xs hover:border-gray-300"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-mrittika-700" />
                      <div>
                        <span className="font-semibold text-gray-800">
                          {doc.filename}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                          <span>{(doc.size_bytes / 1024).toFixed(1)} KB</span>
                          {doc.is_sample && (
                            <span className="text-amber-700 font-bold">[নমুনা]</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {!doc.is_sample && (
                      <button
                        onClick={() => handleDeleteDoc(doc.filename)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
              <button
                onClick={handleReindex}
                disabled={adminUploading}
                className="text-xs text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>সম্পূর্ণ ডাটাবেস Re-Index করুন</span>
              </button>
              <button
                onClick={() => setAdminModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-xs font-semibold text-gray-800"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
