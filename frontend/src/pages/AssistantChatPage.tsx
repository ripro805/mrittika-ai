import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useUnifiedFlow } from "../context/UnifiedFlowContext";
import { useAuth } from "../context/AuthContext";
import apiClient, { getAccessToken, API_BASE } from "../services/api";
import { VoiceInputButton } from "../components/VoiceInputButton";
import { MarkdownRenderer } from "../components/MarkdownRenderer";
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
  Sprout,
  FlaskConical,
  Bug,
  CloudSun,
  ShieldCheck,
  Zap,
  Wheat,
  ExternalLink,
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
  timestamp?: string;
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    typeof window !== "undefined" ? window.innerWidth > 768 : true
  );

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
  const [isWarmingUp, setIsWarmingUp] = useState(false);

  // Background ping to pre-warm sleeping backend on cloud (Render Free Tier)
  useEffect(() => {
    apiClient.get("/health/").catch(() => {});
  }, []);

  // Track slow loading (>5 seconds) to notify user about cloud cold start
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading) {
      timer = setTimeout(() => {
        setIsWarmingUp(true);
      }, 5000);
    } else {
      setIsWarmingUp(false);
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

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
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
    if (inputRef.current) inputRef.current.focus();
  };

  const selectSession = async (sessionId: string) => {
    try {
      setIsLoading(true);
      const res = await apiClient.get(`/assistant/sessions/${sessionId}/`);
      setCurrentSessionId(res.data.id);
      const history: ChatMessage[] = (res.data.messages || []).map((m: any) => ({
        id: `msg_${m.id}`,
        sender: (m.role || "").toLowerCase() === "user" ? "user" : "bot",
        text: m.content || m.text || "",
        sources: m.sources || [],
        fallback: m.fallback || false,
        timestamp: m.created_at
          ? new Date(m.created_at).toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" })
          : undefined,
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
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
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

  // Send Message (SSE streaming with fetch + ReadableStream, with seamless fallback to JSON REST)
  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || inputMessage).trim();
    if (!textToSend || isLoading) return;

    setErrorMessage(null);
    setLastUserMessage(textToSend);
    setInputMessage("");

    const timeNow = new Date().toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" });

    const userMsgId = `user_${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: textToSend,
      timestamp: timeNow,
    };

    const botMsgId = `bot_${Date.now()}`;
    const initialBotMsg: ChatMessage = {
      id: botMsgId,
      sender: "bot",
      text: "",
      sources: [],
      fallback: false,
      timestamp: timeNow,
    };

    setMessages((prev) => [...prev, userMsg, initialBotMsg]);
    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let streamedAny = false;
    let accumulatedText = "";
    let sources: SourceItem[] = [];
    let isFallback = false;

    try {
      const token = getAccessToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const streamEndpoint = `${API_BASE.replace(/\/+$/, "")}/assistant/chat/stream/`;

      const response = await fetch(streamEndpoint, {
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
        } else {
          throw new Error(`STREAM_HTTP_${response.status}`);
        }
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");

      if (!reader) throw new Error("NO_STREAM");

      let buffer = "";
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
              if (parsed.token) {
                streamedAny = true;
                accumulatedText += parsed.token;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === botMsgId ? { ...m, text: accumulatedText } : m
                  )
                );
              }
            } catch {
              // Ignore incomplete token json
            }
          } else if (eventType === "done") {
            try {
              const parsed = JSON.parse(dataContent);
              if (parsed.session_id) {
                if (!currentSessionId) setCurrentSessionId(parsed.session_id);
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
        return;
      }

      // If streaming encountered an error and no text was received yet, fall back seamlessly to standard JSON REST endpoint!
      if (!streamedAny) {
        try {
          // Give waking-up cloud server a brief moment to finish booting
          await new Promise((resolve) => setTimeout(resolve, 1200));
          const fallbackRes = await apiClient.post("/assistant/chat/", {
            message: textToSend,
            session_id: currentSessionId,
            context: assistantContext || {},
          });

          const answerText = fallbackRes.data?.answer || "";
          const answerSources = fallbackRes.data?.sources || [];
          const answerFallback = !!fallbackRes.data?.fallback;
          if (fallbackRes.data?.session_id) {
            if (!currentSessionId) setCurrentSessionId(fallbackRes.data.session_id);
            loadSessions();
          }

          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMsgId
                ? {
                    ...m,
                    text: answerText,
                    sources: answerSources,
                    fallback: answerFallback,
                    provider_used: fallbackRes.data?.provider_used,
                  }
                : m
            )
          );
          setErrorMessage(null);
          return;
        } catch (fallbackErr: any) {
          console.error("Assistant chat REST fallback failed:", fallbackErr);
        }
      }

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
    <div className="w-full max-w-7xl mx-auto flex flex-1 h-[calc(100vh-4.5rem)] min-h-[580px] glass-workspace rounded-3xl shadow-[0_20px_60px_-15px_rgba(15,23,42,0.12),0_0_1px_1px_rgba(255,255,255,0.9)_inset] overflow-hidden font-sans border border-emerald-100/90">
      {/* Sessions Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "flex w-72 sm:w-80" : "hidden"
        } bg-slate-50/95 border-r border-emerald-100/90 flex-col flex-shrink-0 z-20 transition-all duration-200 backdrop-blur-md`}
        aria-label="আলোচনার ইতিহাস"
      >
        <div className="p-3.5 border-b border-emerald-100/80 flex items-center justify-between bg-white/70">
          <button
            onClick={startNewChat}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-2xl btn-3d-emerald text-xs font-bold shadow-md cursor-pointer group"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            <span>নতুন আলোচনা (New Chat)</span>
          </button>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-2 text-gray-500 hover:text-gray-700 ml-1 rounded-xl hover:bg-gray-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
          <div className="px-3 py-1 flex items-center justify-between">
            <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <span>পূর্বের আলোচনা সমূহ</span>
            </p>
            {sessions.length > 0 && (
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full badge-3d">
                {sessions.length}
              </span>
            )}
          </div>
          {!isAuthenticated ? (
            <div className="p-4 text-xs text-emerald-950 bg-linear-to-b from-emerald-50 to-teal-50/50 rounded-2xl border border-emerald-200/80 space-y-2 m-1 shadow-2xs">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>ক্লাউড সেশন হিস্ট্রি</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                লগইন করলে আপনার অতীতের সকল পরামর্শ, প্রশ্নোত্তর ও সারের ডোজ এই মেন্যুতে আজীবনের জন্য সংরক্ষিত থাকবে।
              </p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 px-4 text-slate-400 space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto opacity-30 text-slate-400" />
              <p className="text-xs">কোনো পূর্বের আলোচনা নেই।</p>
              <p className="text-[10px] text-slate-400">নতুন প্রশ্ন জিজ্ঞাসা করলে এখানে যুক্ত হবে।</p>
            </div>
          ) : (
            sessions.map((s) => {
              const isActive = currentSessionId === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => selectSession(s.id)}
                  className={`group flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs cursor-pointer transition-all ${
                    isActive
                      ? "bg-linear-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/5 text-emerald-950 font-bold border border-emerald-300 shadow-xs badge-3d"
                      : "text-slate-700 hover:bg-white hover:shadow-xs border border-transparent hover:border-slate-200"
                  }`}
                >
                  <div className="truncate flex-1 pr-2">
                    <div className="truncate font-semibold text-slate-900">{s.title || "নতুন আলোচনা"}</div>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                      <span>{new Date(s.updated_at || s.created_at).toLocaleDateString("bn-BD")}</span>
                      {s.message_count !== undefined && (
                        <span className="px-1.5 py-0.2 rounded-full bg-slate-200/60 font-mono text-[9px] text-slate-600">
                          {s.message_count} বার্তা
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => deleteSession(s.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-opacity"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {user?.role === "ADMIN" && (
          <div className="p-3 border-t border-emerald-100/80 bg-white/80">
            <button
              onClick={openAdminKnowledge}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-emerald-300 text-emerald-900 bg-emerald-50/50 hover:bg-emerald-100 text-xs font-bold shadow-2xs transition-all cursor-pointer"
            >
              <Database className="w-4 h-4 text-emerald-700" />
              <span>Admin: নলেজবেস পরিচালনা</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 min-w-0 flex flex-col h-full bg-white/70 relative overflow-hidden">
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-emerald-100/90 flex items-center justify-between bg-white/90 backdrop-blur-md z-10 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors border border-slate-200 shadow-2xs cursor-pointer"
              title="আলোচনার ইতিহাস (Toggle Sidebar)"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center shadow-md shadow-emerald-700/25 border border-emerald-400/40">
              <MessageSquare className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                  মৃত্তিকা এআই বাংলা কৃষি সহকারী
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono badge-3d">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  অনলাইন
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                BRRI ও BARC সরকারি গবেষণা নথিভিত্তিক নির্ভরযোগ্য এআই পরামর্শক
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Unified Flow Context Pill */}
            {assistantContext?.crop && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-linear-to-r from-emerald-50 to-teal-50 text-emerald-900 text-xs font-bold border border-emerald-300 shadow-2xs badge-3d">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>প্রসঙ্গ: {assistantContext.crop}</span>
                <button
                  onClick={() => carryContextToAssistant("", "")}
                  className="hover:text-red-600 ml-1 p-0.5 rounded-full hover:bg-emerald-200/50 cursor-pointer"
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
          <div className="bg-red-50/95 border-b border-red-200 p-3 px-4 flex items-center justify-between text-xs text-red-900 shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span className="font-medium">{errorMessage}</span>
            </div>
            {lastUserMessage && (
              <button
                onClick={() => handleSend(lastUserMessage)}
                className="flex items-center gap-1.5 font-bold text-red-700 hover:text-red-900 underline ml-3 px-2 py-1 rounded-lg hover:bg-red-100/70 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>পুনরায় চেষ্টা করুন</span>
              </button>
            )}
          </div>
        )}

        {/* Messages List / 3D Welcome Hub */}
        <div
          className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-4 bg-slate-50/40"
          aria-live="polite"
        >
          {messages.length <= 1 && messages[0]?.id === "welcome" ? (
            /* 3D Agricultural AI Command Hub (Zero Blank Space) */
            <div className="max-w-4xl mx-auto py-2 sm:py-4 space-y-6 animate-in fade-in duration-300">
              {/* 3D Hero Showcase Card */}
              <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-emerald-900 via-slate-900 to-teal-950 p-6 sm:p-8 text-white border border-emerald-500/30 shadow-[0_20px_50px_rgba(6,78,59,0.3)]">
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-teal-500/20 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold badge-3d">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <span>v2.0 রিয়েলটাইম BRRI ও BARC এআই নলেজবেস সক্রিয়</span>
                  </div>

                  <div className="space-y-1.5">
                    <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight bg-linear-to-r from-white via-emerald-100 to-teal-200 bg-clip-text text-transparent">
                      মৃত্তিকা এআই বাংলা কৃষি সহকারীতে স্বাগতম
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl font-bangla">
                      ফসলের যেকোনো রোগ, সুষম সার প্রয়োগের সঠিক কিস্তি, বালাই দমন কিংবা আবহাওয়া সংক্রান্ত প্রশ্ন বাংলায় লিখুন। নিচে দেওয়া জনপ্রিয় বিষয়গুলোতে চাপ দিয়েও সরাসরি আলোচনা শুরু করতে পারেন:
                    </p>
                  </div>

                  {/* Feature Badges */}
                  <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-semibold text-emerald-200">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      সাব-মিলি-সেকেন্ড দ্রুততম রেসপন্স
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-300" />
                      পৃষ্ঠা নম্বরযুক্ত সরকারি নির্দেশিকা সূত্র
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
                      শতভাগ নিরাপদ ও নির্ভরযোগ্য
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 Interactive 3D Workstation Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                {/* Card 1 */}
                <button
                  type="button"
                  onClick={() => handleSend("আমন ধানের ইউরিয়া উপরিপ্রয়োগের নিয়ম")}
                  disabled={isLoading}
                  className="card-3d card-3d-interactive p-4 sm:p-5 rounded-2xl text-left border border-emerald-100/90 bg-white/95 flex items-start gap-3.5 group shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                        ইউরিয়া ও সার ব্যবস্থাপনা
                      </h3>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        ৩ কিস্তি
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                      আমন ও বোরো ধানে ইউরিয়া উপরিপ্রয়োগের সঠিক সময়সূচী ও নিয়মাবলী
                    </p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 pt-1 group-hover:translate-x-0.5 transition-transform">
                      <span>প্রশ্ন করুন</span>
                      <span>→</span>
                    </span>
                  </div>
                </button>

                {/* Card 2 */}
                <button
                  type="button"
                  onClick={() => handleSend("আলুর নাভিধসা রোগ লক্ষণ ও প্রতিকার")}
                  disabled={isLoading}
                  className="card-3d card-3d-interactive p-4 sm:p-5 rounded-2xl text-left border border-amber-100/90 bg-white/95 flex items-start gap-3.5 group shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Bug className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                        ফসলের রোগ ও পোকা দমন
                      </h3>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        প্রতিকার
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                      আলুর লেইট ব্লাইট (নাভিধসা) ও ধানের ব্লাস্ট রোগের স্থায়ী চিকিৎসা
                    </p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 pt-1 group-hover:translate-x-0.5 transition-transform">
                      <span>পরামর্শ নিন</span>
                      <span>→</span>
                    </span>
                  </div>
                </button>

                {/* Card 3 */}
                <button
                  type="button"
                  onClick={() => handleSend("অম্লীয় মাটিতে চুন প্রয়োগের সঠিক মাত্রা")}
                  disabled={isLoading}
                  className="card-3d card-3d-interactive p-4 sm:p-5 rounded-2xl text-left border border-teal-100/90 bg-white/95 flex items-start gap-3.5 group shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-teal-500 to-cyan-700 text-white flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Sprout className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                        মাটির পুষ্টি ও অম্লত্ব সংস্কার
                      </h3>
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                        পিএইচ
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                      অম্লীয় মাটিতে চুন ও জৈব সার প্রয়োগের সঠিক অনুপাত ও পদ্ধতি
                    </p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 pt-1 group-hover:translate-x-0.5 transition-transform">
                      <span>মাত্রা জানুন</span>
                      <span>→</span>
                    </span>
                  </div>
                </button>

                {/* Card 4 */}
                <button
                  type="button"
                  onClick={() => handleSend("বেলে দোআঁশ মাটিতে বোরো ধানের সার ব্যবস্থাপনা")}
                  disabled={isLoading}
                  className="card-3d card-3d-interactive p-4 sm:p-5 rounded-2xl text-left border border-blue-100/90 bg-white/95 flex items-start gap-3.5 group shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
                    <CloudSun className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-800 transition-colors">
                        আবহাওয়া ও জাত নির্বাচন
                      </h3>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        বোরো ধান
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                      দোআঁশ ও বেলে মাটিতে বোরো ধান এবং রবি ফসলের সুষম সার পরিকল্পনা
                    </p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 pt-1 group-hover:translate-x-0.5 transition-transform">
                      <span>পরিকল্পনা দেখুন</span>
                      <span>→</span>
                    </span>
                  </div>
                </button>
              </div>

              {/* Regional Agro Tip Card */}
              <div className="p-4 rounded-2xl bg-linear-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200/80 shadow-xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 font-bold text-lg shadow-2xs">
                  🌾
                </div>
                <div className="text-xs leading-relaxed text-slate-700 font-bangla">
                  <span className="font-bold text-emerald-950">আজকের বিশেষ কৃষি বার্তা: </span>
                  বোরো মৌসুমের চারা রোপণের পূর্বে বীজতলায় অতিরিক্ত ঠান্ডার প্রভাব রোধে রাতের বেলায় পলিথিন দিয়ে ঢেকে রাখুন এবং সকালে সূর্যের আলোতে উন্মুক্ত করুন।
                </div>
              </div>
            </div>
          ) : (
            /* Active Conversation Messages */
            <div className="max-w-4xl mx-auto w-full space-y-4">
              {messages.map((msg) => {
                const isUser = msg.sender === "user";

                return (
                  <div
                    key={msg.id}
                    className={`w-full flex ${isUser ? "justify-end" : "justify-start"} my-2`}
                  >
                    <div
                      className={`rounded-2xl p-4 sm:p-5 text-sm leading-relaxed transition-all overflow-hidden break-words ${
                        isUser
                          ? "max-w-[85%] sm:max-w-[75%] bg-linear-to-r from-emerald-800 via-emerald-850 to-teal-900 text-white rounded-tr-xs shadow-[0_8px_20px_-3px_rgba(6,78,59,0.35)] border border-emerald-700/60 ml-auto"
                          : msg.fallback
                          ? "w-full max-w-[95%] sm:max-w-[92%] bg-amber-50/70 text-slate-900 border border-amber-300 rounded-tl-xs card-3d"
                          : "w-full max-w-[95%] sm:max-w-[92%] bg-white/95 text-slate-900 border border-emerald-100/90 rounded-tl-xs card-3d"
                      }`}
                    >
                    {/* Sender Header */}
                    <div className="flex items-center justify-between gap-3 mb-2.5 text-[11px] font-semibold border-b border-black/5 pb-2">
                      {isUser ? (
                        <div className="flex items-center justify-between w-full text-emerald-100">
                          <span className="flex items-center gap-1.5 font-bold">
                            <span>👤 আপনি</span>
                          </span>
                          {msg.timestamp && (
                            <span className="text-[10px] text-emerald-200/80 font-normal ml-2 font-mono">
                              {msg.timestamp}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-emerald-900 flex items-center gap-1.5 font-bold">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            <span>মৃত্তিকা এআই</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 badge-3d">
                              BRRI নির্দেশিকা
                            </span>
                          </span>
                          {msg.timestamp && (
                            <span className="text-[10px] text-slate-400 font-normal font-mono">
                              {msg.timestamp}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Message Content */}
                    {isUser ? (
                      <p className="whitespace-pre-wrap break-words leading-relaxed font-bangla text-white text-[13px] sm:text-sm">
                        {msg.text}
                      </p>
                    ) : (
                      <div>
                        {!msg.text && isLoading ? (
                          <div className="flex items-center gap-2 py-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-bounce" />
                            <span className="text-xs text-slate-500 font-medium ml-1 font-bangla">মৃত্তিকা এআই নির্ভুল উত্তর প্রস্তুত করছে...</span>
                          </div>
                        ) : (
                          <div className="font-bangla leading-relaxed">
                            <MarkdownRenderer content={msg.text} />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Fallback Special Card */}
                    {!isUser && msg.fallback && (
                      <div className="mt-4 p-3.5 bg-amber-100/70 rounded-xl border border-amber-300 text-xs text-amber-950 space-y-1.5 shadow-2xs font-bangla">
                        <div className="flex items-center gap-2 font-bold text-amber-900">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>উপজেলা কৃষি কর্মকর্তার সাথে যোগাযোগ করুন</span>
                        </div>
                        <p className="text-[11px] text-amber-900/90 leading-relaxed font-bangla">
                          উচ্চ-ঝুঁকি বা বিষাক্ত রাসায়নিক প্রয়োগের ক্ষেত্রে শুধুমাত্র সরকারি লাইসেন্সধারী কর্মকর্তা বা আপনার নিকটস্থ উপজেলা কৃষি অফিসে গিয়ে সরাসরি পরামর্শ নিন।
                        </p>
                      </div>
                    )}

                    {/* Expandable Sources Chips */}
                    {!isUser && msg.sources && msg.sources.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                          <span>যাচাইকৃত তথ্যসূত্র ({msg.sources.length}টি নথি):</span>
                        </div>
                        <div className="space-y-1.5">
                          {msg.sources.map((s, idx) => {
                            const chipKey = `${msg.id}_src_${idx}`;
                            const isExpanded = expandedSourceIndex === chipKey;
                            return (
                              <div
                                key={idx}
                                className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-[11px] text-slate-700 hover:border-emerald-300 transition-colors badge-3d"
                              >
                                <div
                                  onClick={() =>
                                    setExpandedSourceIndex(isExpanded ? null : chipKey)
                                  }
                                  className="flex items-center justify-between cursor-pointer font-medium"
                                >
                                  <span className="truncate flex-1 font-bangla font-semibold text-slate-900">
                                    📄 {s.source} {s.page ? `(পৃষ্ঠা: ${s.page})` : ""}
                                  </span>
                                  <div className="flex items-center gap-1.5 ml-2">
                                    {s.is_sample && (
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200 font-bangla">
                                        নমুনা নথি
                                      </span>
                                    )}
                                    {isExpanded ? (
                                      <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                                    ) : (
                                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                                    )}
                                  </div>
                                </div>
                                {isExpanded && s.snippet && (
                                  <p className="mt-2 pt-2 border-t border-slate-200 text-slate-600 italic bg-white p-2.5 rounded-lg text-[11px] leading-relaxed font-bangla border border-slate-100">
                                    "{s.snippet}"
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Assistant Message Actions */}
                    {!isUser && msg.id !== "welcome" && msg.text && (
                      <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-100 text-slate-400 text-xs">
                        <button
                          onClick={() => handleCopyText(msg.id, msg.text)}
                          className="hover:text-emerald-700 p-1.5 flex items-center gap-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                          title="অনুলিপি (Copy)"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-[11px] text-emerald-600 font-medium">কপি হয়েছে</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span className="text-[11px]">কপি</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setFeedbackTargetMessage(msg);
                            submitFeedback(true);
                          }}
                          className="hover:text-emerald-700 p-1.5 flex items-center gap-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                          title="সহায়ক উত্তর (Helpful)"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span className="text-[11px]">পছন্দ</span>
                        </button>
                        <button
                          onClick={() => openFeedbackModal(msg)}
                          className="hover:text-red-600 p-1.5 flex items-center gap-1 rounded-lg hover:bg-slate-100 transition-colors ml-auto cursor-pointer"
                          title="রিপোর্ট করুন"
                        >
                          <Flag className="w-3.5 h-3.5" />
                          <span className="text-[11px]">রিপোর্ট</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Smart Follow-up Inquiries Bar when conversation has 1-3 messages */}
            {messages.length <= 4 && !isLoading && (
              <div className="mt-3 p-4 rounded-2xl bg-white/90 border border-emerald-100/90 shadow-sm space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-950 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    সম্পর্কিত প্রস্তাবিত বিষয় (Related Queries)
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">পরামর্শ পেতে যেকোনো বিষয়ে চাপুন</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSend("আলুর নাবিধসা রোগ লক্ষণ ও প্রতিকার")}
                    className="p-2.5 rounded-xl bg-slate-50/90 hover:bg-emerald-50/90 border border-slate-200/80 hover:border-emerald-300 text-left text-xs font-semibold text-slate-700 hover:text-emerald-900 transition-all flex items-center gap-2 group cursor-pointer shadow-2xs"
                  >
                    <span className="text-base group-hover:scale-110 transition-transform">🥔</span>
                    <span className="truncate">আলুর নাবিধসা রোগ ও প্রতিকার</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSend("অম্লীয় মাটিতে চুন প্রয়োগের সঠিক মাত্রা")}
                    className="p-2.5 rounded-xl bg-slate-50/90 hover:bg-teal-50/90 border border-slate-200/80 hover:border-teal-300 text-left text-xs font-semibold text-slate-700 hover:text-teal-900 transition-all flex items-center gap-2 group cursor-pointer shadow-2xs"
                  >
                    <span className="text-base group-hover:scale-110 transition-transform">🧪</span>
                    <span className="truncate">অম্লীয় মাটিতে চুন প্রয়োগের মাত্রা</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSend("বেলে দোআঁশ মাটিতে বোরো ধানের সার ব্যবস্থাপনা")}
                    className="p-2.5 rounded-xl bg-slate-50/90 hover:bg-blue-50/90 border border-slate-200/80 hover:border-blue-300 text-left text-xs font-semibold text-slate-700 hover:text-blue-900 transition-all flex items-center gap-2 group cursor-pointer shadow-2xs"
                  >
                    <span className="text-base group-hover:scale-110 transition-transform">🌾</span>
                    <span className="truncate">বোরো ধানের সুষম সার ব্যবস্থাপনা</span>
                  </button>
                </div>
              </div>
            )}
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col gap-1.5 bg-white p-3.5 rounded-2xl border border-emerald-100/90 w-fit shadow-md card-3d">
              <div className="flex items-center gap-2 text-xs text-slate-800">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                <span className="font-semibold">নথি বিশ্লেষণ ও উত্তর প্রস্তুত করা হচ্ছে...</span>
              </div>
              {isWarmingUp && (
                <p className="text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 font-bangla animate-pulse">
                  ⏳ সার্ভার ক্লাউড থেকে সক্রিয় হচ্ছে (Render Cold Start)... অনুগ্রহ করে কয়েক সেকেন্ড অপেক্ষা করুন।
                </p>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 6 Suggested Starter Prompts Bar */}
        <div className="bg-white/95 px-4 py-2.5 border-t border-slate-200/80 overflow-x-auto whitespace-nowrap flex gap-2 no-scrollbar backdrop-blur-md">
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
              className="text-xs px-3.5 py-1.5 rounded-full bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-950 border border-slate-200/90 hover:border-emerald-300 transition-all font-medium badge-3d shadow-2xs hover:-translate-y-0.5 cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>

        {/* 3D Floating Input Dock */}
        <div className="bg-white/95 p-3 sm:p-4 border-t border-emerald-100/90 backdrop-blur-md">
          <div className="flex items-end gap-2.5 bg-slate-50/90 rounded-2xl border border-slate-200/90 p-2.5 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 shadow-inner transition-all">
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
                  if (e.nativeEvent.isComposing) return;
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="আপনার প্রশ্নটি বাংলায় লিখুন... (Enter চাপলে সেন্ড হবে)"
              disabled={isLoading}
              className="flex-1 bg-transparent border-0 text-sm focus:outline-none resize-none max-h-32 min-h-[2.25rem] py-1 text-slate-900 placeholder-slate-400 font-bangla"
            />

            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-mono ${
                  inputMessage.length > 900 ? "text-amber-600 font-bold" : "text-slate-400"
                }`}
              >
                {inputMessage.length}/1000
              </span>

              {isLoading ? (
                <button
                  type="button"
                  onClick={handleStopGeneration}
                  className="p-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors shadow-md cursor-pointer"
                  title="উত্তর থামান (Stop)"
                >
                  <Square className="w-4 h-4 fill-white" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={isLoading || !inputMessage.trim()}
                  className="btn-3d-emerald p-2.5 rounded-xl disabled:opacity-40 transition-all shadow-md cursor-pointer flex items-center justify-center"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4 text-white" />
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
