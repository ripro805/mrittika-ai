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
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const { assistantContext, carryContextToAssistant } = useUnifiedFlow();

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "bot",
      text:
        i18n.language === "en"
          ? "Greetings! I am Mrittika AI Agriculture Assistant. Feel free to ask any questions regarding crop nutrients, pest remedies, balanced fertilizers, and field management."
          : "নমস্কার / আসসালামু আলাইকুম! আমি মৃত্তিকা এআই কৃষি সহকারী। আপনার ফসলের পুষ্টি, রোগবালাই, সুষম সার ও জমি ব্যবস্থাপনা সংক্রান্ত যেকোনো প্রশ্ন বাংলায় করতে পারেন।",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedSourceIndex, setExpandedSourceIndex] = useState<string | null>(null);

  // Streaming & Abort
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
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

  // Scroll to bottom (contained within chat container so window never scrolls)
  const scrollToBottom = () => {
    if (chatScrollRef.current) {
      if (typeof chatScrollRef.current.scrollTo === "function") {
        chatScrollRef.current.scrollTo({
          top: chatScrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      } else {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    } else if (typeof messagesEndRef.current?.scrollIntoView === "function") {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    // Only auto-scroll when user has engaged in conversation, avoiding initial mount window jumps
    if (messages.length > 1 || isLoading) {
      scrollToBottom();
    }
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
    <div className="w-full h-full min-h-0 flex flex-1 bg-white rounded-2xl sm:rounded-3xl shadow-card border border-slate-200/90 overflow-hidden font-sans">
      {/* Sessions Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "flex w-72 sm:w-80" : "hidden"
        } bg-slate-50 border-r border-slate-200 flex-col flex-shrink-0 z-20 transition-all duration-200`}
        aria-label="আলোচনার ইতিহাস"
      >
        <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-white">
          <button
            onClick={startNewChat}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer group"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            <span>নতুন আলোচনা (New Chat)</span>
          </button>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-2 text-slate-500 hover:text-slate-800 ml-1 rounded-xl hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
          <div className="px-3 py-1 flex items-center justify-between">
            <p className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <span>{i18n.language === "en" ? "Discussion History" : "পূর্বের আলোচনা সমূহ"}</span>
            </p>
            {sessions.length > 0 && (
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full border border-emerald-200">
                {sessions.length}
              </span>
            )}
          </div>
          {!isAuthenticated ? (
            <div className="p-4 text-xs text-emerald-950 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-2 m-1 shadow-2xs">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>{i18n.language === "en" ? "Cloud Session History" : "ক্লাউড সেশন হিস্ট্রি"}</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed font-bangla">
                {i18n.language === "en"
                  ? "Sign in to save all your past advisories, QA discussions, and fertilizer doses permanently."
                  : "লগইন করলে আপনার অতীতের সকল পরামর্শ, প্রশ্নোত্তর ও সারের ডোজ এই মেন্যুতে আজীবনের জন্য সংরক্ষিত থাকবে।"}
              </p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 px-4 text-slate-700 space-y-2 font-bangla">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-400" />
              <p className="text-xs font-bold text-slate-800">
                {i18n.language === "en" ? "No previous discussions." : "কোনো পূর্বের আলোচনা নেই।"}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                {i18n.language === "en" ? "New questions will appear here." : "নতুন প্রশ্ন জিজ্ঞাসা করলে এখানে যুক্ত হবে।"}
              </p>
            </div>
          ) : (
            sessions.map((s) => {
              const isActive = currentSessionId === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => selectSession(s.id)}
                  className={`group flex items-center justify-between px-3.5 py-3 rounded-xl text-xs cursor-pointer transition-all ${
                    isActive
                      ? "bg-emerald-50 text-emerald-950 font-bold border border-emerald-300 shadow-2xs"
                      : "text-slate-700 hover:bg-white hover:shadow-2xs border border-transparent hover:border-slate-200"
                  }`}
                >
                  <div className="truncate flex-1 pr-2">
                    <div className="truncate font-semibold text-slate-900">
                      {s.title || (i18n.language === "en" ? "New Discussion" : "নতুন আলোচনা")}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                      <span>{new Date(s.updated_at || s.created_at).toLocaleDateString(i18n.language === "en" ? "en-US" : "bn-BD")}</span>
                      {s.message_count !== undefined && (
                        <span className="px-1.5 py-0.2 rounded-full bg-slate-200/80 font-mono text-[9px] text-slate-700 font-semibold">
                          {s.message_count} {i18n.language === "en" ? "messages" : "বার্তা"}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => deleteSession(s.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-opacity cursor-pointer"
                    title={i18n.language === "en" ? "Delete discussion" : "মুছে ফেলুন"}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {user?.role === "ADMIN" && (
          <div className="p-3 border-t border-slate-200 bg-white">
            <button
              onClick={openAdminKnowledge}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-emerald-300 text-emerald-900 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold shadow-2xs transition-all cursor-pointer"
            >
              <Database className="w-4 h-4 text-emerald-700" />
              <span>Admin: নলেজবেস পরিচালনা</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 min-w-0 min-h-0 flex flex-col bg-slate-50/50 relative overflow-hidden">
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 flex items-center justify-between bg-white z-10 shadow-2xs flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors border border-slate-200 shadow-2xs cursor-pointer"
              title="আলোচনার ইতিহাস (Toggle Sidebar)"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-sm">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                  {i18n.language === "en" ? "Mrittika AI Agriculture Assistant" : "মৃত্তিকা এআই বাংলা কৃষি সহকারী"}
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  {i18n.language === "en" ? "Online" : "অনলাইন"}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 hidden sm:block font-bangla">
                {i18n.language === "en"
                  ? "BRRI & BARC research-backed authoritative AI agricultural advisory"
                  : "BRRI ও BARC সরকারি গবেষণা নথিভিত্তিক নির্ভরযোগ্য এআই পরামর্শক"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Unified Flow Context Pill */}
            {assistantContext?.crop && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 text-xs font-bold border border-emerald-300 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>{i18n.language === "en" ? `Context: ${assistantContext.crop}` : `প্রসঙ্গ: ${assistantContext.crop}`}</span>
                <button
                  onClick={() => carryContextToAssistant("", "")}
                  className="hover:text-red-600 ml-1 p-0.5 rounded-full hover:bg-emerald-200/50 cursor-pointer"
                  title={i18n.language === "en" ? "Clear context" : "প্রসঙ্গ মুছে ফেলুন"}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error Banner with Retry */}
        {errorMessage && (
          <div className="bg-red-50 border-b border-red-200 p-3 px-4 flex items-center justify-between text-xs text-red-900 shadow-2xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span className="font-semibold">{errorMessage}</span>
            </div>
            {lastUserMessage && (
              <button
                onClick={() => handleSend(lastUserMessage)}
                className="flex items-center gap-1.5 font-bold text-red-700 hover:text-red-900 underline ml-3 px-2 py-1 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{i18n.language === "en" ? "Retry" : "পুনরায় চেষ্টা করুন"}</span>
              </button>
            )}
          </div>
        )}

        {/* Messages List / 3D Welcome Hub */}
        <div
          ref={chatScrollRef}
          className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-4"
          aria-live="polite"
        >
          {messages.length <= 1 && messages[0]?.id === "welcome" ? (
            /* Agricultural AI Command Hub */
            <div className="max-w-4xl mx-auto py-2 sm:py-4 space-y-6 animate-in fade-in duration-300">
              {/* Hero Showcase Card */}
              <div
                className="banner-assistant-hero relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white border border-emerald-800 shadow-card"
                style={{
                  background: "linear-gradient(135deg, #020617 0%, #052e16 50%, #0f172a 100%)",
                  backgroundColor: "#020617",
                }}
              >
                <div className="relative z-10 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      {i18n.language === "en"
                        ? "v2.0 Realtime BRRI & BARC AI Knowledge Base Active"
                        : "v2.0 রিয়েলটাইম BRRI ও BARC এআই নলেজবেস সক্রিয়"}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white font-bangla">
                      {i18n.language === "en"
                        ? "Welcome to Mrittika AI Agriculture Assistant"
                        : "মৃত্তিকা এআই বাংলা কৃষি সহকারীতে স্বাগতম"}
                    </h2>
                    <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed max-w-2xl font-bangla">
                      {i18n.language === "en"
                        ? "Ask questions regarding crop diseases, balanced fertilizer split timings, pest control, or weather advisories. Click any popular topic below to begin:"
                        : "ফসলের যেকোনো রোগ, সুষম সার প্রয়োগের সঠিক কিস্তি, বালাই দমন কিংবা আবহাওয়া সংক্রান্ত প্রশ্ন বাংলায় লিখুন। নিচে দেওয়া জনপ্রিয় বিষয়গুলোতে চাপ দিয়েও সরাসরি আলোচনা শুরু করতে পারেন:"}
                    </p>
                  </div>

                  {/* Feature Badges */}
                  <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-bold text-emerald-100 font-bangla">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 border border-white/10">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      {i18n.language === "en" ? "Sub-millisecond Fast Response" : "সাব-মিলি-সেকেন্ড দ্রুততম রেসপন্স"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 border border-white/10">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-300" />
                      {i18n.language === "en" ? "Page-Referenced Government Sources" : "পৃষ্ঠা নম্বরযুক্ত সরকারি নির্দেশিকা সূত্র"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 border border-white/10">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
                      {i18n.language === "en" ? "100% Verified & Credible" : "শতভাগ নিরাপদ ও নির্ভরযোগ্য"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 Interactive Workstation Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                {/* Card 1 */}
                <button
                  type="button"
                  onClick={() => handleSend(i18n.language === "en" ? "Urea application guidelines for Aman rice" : "আমন ধানের ইউরিয়া উপরিপ্রয়োগের নিয়ম")}
                  disabled={isLoading}
                  className="app-card-interactive p-4 sm:p-5 rounded-2xl text-left border border-slate-200/90 bg-white flex items-start gap-3.5 group cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-sm flex-shrink-0 group-hover:bg-emerald-800 transition-colors">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                        {i18n.language === "en" ? "Urea & Fertilizer Timing" : "ইউরিয়া ও সার ব্যবস্থাপনা"}
                      </h3>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {i18n.language === "en" ? "3 Splits" : "৩ কিস্তি"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug line-clamp-2 font-bangla">
                      {i18n.language === "en"
                        ? "Top dressing split timing and guidelines for Aman and Boro rice"
                        : "আমন ও বোরো ধানে ইউরিয়া উপরিপ্রয়োগের সঠিক সময়সূচী ও নিয়মাবলী"}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 pt-1 group-hover:translate-x-0.5 transition-transform">
                      <span>{i18n.language === "en" ? "Ask Question" : "প্রশ্ন করুন"}</span>
                      <span>→</span>
                    </span>
                  </div>
                </button>

                {/* Card 2 */}
                <button
                  type="button"
                  onClick={() => handleSend(i18n.language === "en" ? "Potato Late Blight symptoms and control" : "আলুর নাভিধসা রোগ লক্ষণ ও প্রতিকার")}
                  disabled={isLoading}
                  className="app-card-interactive p-4 sm:p-5 rounded-2xl text-left border border-slate-200/90 bg-white flex items-start gap-3.5 group cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-xl bg-amber-700 text-white flex items-center justify-center shadow-sm flex-shrink-0 group-hover:bg-amber-800 transition-colors">
                    <Bug className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                        {i18n.language === "en" ? "Crop Diseases & Pest Control" : "ফসলের রোগ ও পোকা দমন"}
                      </h3>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        {i18n.language === "en" ? "Remedy" : "প্রতিকার"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug line-clamp-2 font-bangla">
                      {i18n.language === "en"
                        ? "Effective management of Late Blight in potatoes and Rice Blast disease"
                        : "আলুর লেইট ব্লাইট (নাভিধসা) ও ধানের ব্লাস্ট রোগের স্থায়ী চিকিৎসা"}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 pt-1 group-hover:translate-x-0.5 transition-transform">
                      <span>{i18n.language === "en" ? "Get Advice" : "পরামর্শ নিন"}</span>
                      <span>→</span>
                    </span>
                  </div>
                </button>

                {/* Card 3 */}
                <button
                  type="button"
                  onClick={() => handleSend(i18n.language === "en" ? "Lime application dosage in acidic soil" : "অম্লীয় মাটিতে চুন প্রয়োগের সঠিক মাত্রা")}
                  disabled={isLoading}
                  className="app-card-interactive p-4 sm:p-5 rounded-2xl text-left border border-slate-200/90 bg-white flex items-start gap-3.5 group cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-sm flex-shrink-0 group-hover:bg-teal-800 transition-colors">
                    <Sprout className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                        {i18n.language === "en" ? "Soil Nutrients & pH Amendment" : "মাটির পুষ্টি ও অম্লত্ব সংস্কার"}
                      </h3>
                      <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                        {i18n.language === "en" ? "pH Fix" : "পিএইচ"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug line-clamp-2 font-bangla">
                      {i18n.language === "en"
                        ? "Accurate dosage and timing of lime and organic matter in acidic soils"
                        : "অম্লীয় মাটিতে চুন ও জৈব সার প্রয়োগের সঠিক অনুপাত ও পদ্ধতি"}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 pt-1 group-hover:translate-x-0.5 transition-transform">
                      <span>{i18n.language === "en" ? "View Dosages" : "মাত্রা জানুন"}</span>
                      <span>→</span>
                    </span>
                  </div>
                </button>

                {/* Card 4 */}
                <button
                  type="button"
                  onClick={() => handleSend(i18n.language === "en" ? "Boro rice fertilizer management in sandy loam soil" : "বেলে দোআঁশ মাটিতে বোরো ধানের সার ব্যবস্থাপনা")}
                  disabled={isLoading}
                  className="app-card-interactive p-4 sm:p-5 rounded-2xl text-left border border-slate-200/90 bg-white flex items-start gap-3.5 group cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-sm flex-shrink-0 group-hover:bg-blue-800 transition-colors">
                    <CloudSun className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-800 transition-colors">
                        {i18n.language === "en" ? "Climate & Variety Advisory" : "আবহাওয়া ও জাত নির্বাচন"}
                      </h3>
                      <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        {i18n.language === "en" ? "Boro Rice" : "বোরো ধান"}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug line-clamp-2 font-bangla">
                      {i18n.language === "en"
                        ? "Balanced fertilizer plans for Boro rice in loam and sandy-loam soils"
                        : "দোআঁশ ও বেলে মাটিতে বোরো ধান এবং রবি ফসলের সুষম সার পরিকল্পনা"}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 pt-1 group-hover:translate-x-0.5 transition-transform">
                      <span>{i18n.language === "en" ? "Explore Plan" : "পরিকল্পনা দেখুন"}</span>
                      <span>→</span>
                    </span>
                  </div>
                </button>
              </div>

              {/* Regional Agro Tip Card */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 shadow-2xs flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center flex-shrink-0 font-bold text-lg">
                  🌾
                </div>
                <div className="text-xs leading-relaxed text-slate-700 font-bangla">
                  <span className="font-bold text-emerald-950">
                    {i18n.language === "en" ? "Today's Field Advisory: " : "আজকের বিশেষ কৃষি বার্তা: "}
                  </span>
                  {i18n.language === "en"
                    ? "Before transplanting Boro rice seedlings, cover seedbeds with polythene overnight to shield them from intense cold, and uncover in morning sunlight."
                    : "বোরো মৌসুমের চারা রোপণের পূর্বে বীজতলায় অতিরিক্ত ঠান্ডার প্রভাব রোধে রাতের বেলায় পলিথিন দিয়ে ঢেকে রাখুন এবং সকালে সূর্যের আলোতে উন্মুক্ত করুন।"}
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
                          ? "max-w-[85%] sm:max-w-[75%] bg-emerald-800 text-white rounded-tr-xs shadow-sm border border-emerald-900/60 ml-auto"
                          : msg.fallback
                          ? "w-full max-w-[95%] sm:max-w-[92%] bg-amber-50 text-slate-900 border border-amber-300 rounded-tl-xs shadow-card"
                          : "w-full max-w-[95%] sm:max-w-[92%] bg-white text-slate-900 border border-slate-200/90 rounded-tl-xs shadow-card"
                      }`}
                    >
                    {/* Sender Header */}
                    <div className="flex items-center justify-between gap-3 mb-2.5 text-[11px] font-semibold border-b border-black/5 pb-2">
                      {isUser ? (
                        <div className="flex items-center justify-between w-full text-emerald-100">
                          <span className="flex items-center gap-1.5 font-bold">
                            <span>👤 {i18n.language === "en" ? "You" : "আপনি"}</span>
                          </span>
                          {msg.timestamp && (
                            <span className="text-[10px] text-emerald-200/90 font-normal ml-2 font-mono">
                              {msg.timestamp}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-emerald-900 flex items-center gap-1.5 font-bold">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                            <span>{i18n.language === "en" ? "Mrittika AI" : "মৃত্তিকা এআই"}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {i18n.language === "en" ? "BRRI & BARC Guidelines" : "BRRI নির্দেশিকা"}
                            </span>
                          </span>
                          {msg.timestamp && (
                            <span className="text-[10px] text-slate-500 font-normal font-mono">
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
                            <span className="text-xs text-slate-600 font-medium ml-1 font-bangla">
                              {i18n.language === "en" ? "Mrittika AI is compiling verified answer..." : "মৃত্তিকা এআই নির্ভুল উত্তর প্রস্তুত করছে..."}
                            </span>
                          </div>
                        ) : (
                          <div className="font-bangla leading-relaxed text-slate-900">
                            <MarkdownRenderer content={msg.text} />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Fallback Special Card */}
                    {!isUser && msg.fallback && (
                      <div className="mt-4 p-3.5 bg-amber-100/80 rounded-xl border border-amber-300 text-xs text-amber-950 space-y-1.5 shadow-2xs font-bangla">
                        <div className="flex items-center gap-2 font-bold text-amber-900">
                          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                          <span>{i18n.language === "en" ? "Consult Upazila Agriculture Officer" : "উপজেলা কৃষি কর্মকর্তার সাথে যোগাযোগ করুন"}</span>
                        </div>
                        <p className="text-[11px] text-amber-950 leading-relaxed font-bangla">
                          {i18n.language === "en"
                            ? "For high-risk or hazardous agro-chemicals, always seek direct counsel from licensed government officers or your local Upazila Agriculture Office."
                            : "উচ্চ-ঝুঁকি বা বিষাক্ত রাসায়নিক প্রয়োগের ক্ষেত্রে শুধুমাত্র সরকারি লাইসেন্সধারী কর্মকর্তা বা আপনার নিকটস্থ উপজেলা কৃষি অফিসে গিয়ে সরাসরি পরামর্শ নিন।"}
                        </p>
                      </div>
                    )}

                    {/* Expandable Sources Chips */}
                    {!isUser && msg.sources && msg.sources.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-200 space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                          <span>
                            {i18n.language === "en"
                              ? `Verified Research Sources (${msg.sources.length} docs):`
                              : `যাচাইকৃত তথ্যসূত্র (${msg.sources.length}টি নথি):`}
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {msg.sources.map((s, idx) => {
                            const chipKey = `${msg.id}_src_${idx}`;
                            const isExpanded = expandedSourceIndex === chipKey;
                            return (
                              <div
                                key={idx}
                                className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[11px] text-slate-700 hover:border-emerald-300 transition-colors"
                              >
                                <div
                                  onClick={() =>
                                    setExpandedSourceIndex(isExpanded ? null : chipKey)
                                  }
                                  className="flex items-center justify-between cursor-pointer font-medium"
                                >
                                  <span className="truncate flex-1 font-bangla font-semibold text-slate-900">
                                    📄 {s.source} {s.page ? `(${i18n.language === "en" ? "Page" : "পৃষ্ঠা"}: ${s.page})` : ""}
                                  </span>
                                  <div className="flex items-center gap-1.5 ml-2">
                                    {s.is_sample && (
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300 font-bangla">
                                        {i18n.language === "en" ? "Sample Doc" : "নমুনা নথি"}
                                      </span>
                                    )}
                                    {isExpanded ? (
                                      <ChevronUp className="w-3.5 h-3.5 text-slate-600" />
                                    ) : (
                                      <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                                    )}
                                  </div>
                                </div>
                                {isExpanded && s.snippet && (
                                  <p className="mt-2 pt-2 border-t border-slate-200 text-slate-700 italic bg-white p-2.5 rounded-lg text-[11px] leading-relaxed font-bangla border border-slate-100">
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
                      <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-100 text-slate-500 text-xs">
                        <button
                          onClick={() => handleCopyText(msg.id, msg.text)}
                          className="hover:text-emerald-700 p-1.5 flex items-center gap-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                          title={i18n.language === "en" ? "Copy Text" : "অনুলিপি (Copy)"}
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-[11px] text-emerald-700 font-semibold">
                                {i18n.language === "en" ? "Copied" : "কপি হয়েছে"}
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span className="text-[11px] font-medium">{i18n.language === "en" ? "Copy" : "কপি"}</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setFeedbackTargetMessage(msg);
                            submitFeedback(true);
                          }}
                          className="hover:text-emerald-700 p-1.5 flex items-center gap-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                          title={i18n.language === "en" ? "Helpful Answer" : "সহায়ক উত্তর (Helpful)"}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-medium">{i18n.language === "en" ? "Helpful" : "পছন্দ"}</span>
                        </button>
                        <button
                          onClick={() => openFeedbackModal(msg)}
                          className="hover:text-red-600 p-1.5 flex items-center gap-1 rounded-lg hover:bg-slate-100 transition-colors ml-auto cursor-pointer"
                          title={i18n.language === "en" ? "Report Issue" : "রিপোর্ট করুন"}
                        >
                          <Flag className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-medium">{i18n.language === "en" ? "Report" : "রিপোর্ট"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Smart Follow-up Inquiries Bar when conversation has 1-3 messages */}
            {messages.length <= 4 && !isLoading && (
              <div className="mt-3 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                    {i18n.language === "en" ? "Related Recommended Queries" : "সম্পর্কিত প্রস্তাবিত বিষয় (Related Queries)"}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {i18n.language === "en" ? "Click any query to ask directly" : "পরামর্শ পেতে যেকোনো বিষয়ে চাপুন"}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSend(i18n.language === "en" ? "Potato Late Blight symptoms and control" : "আলুর নাবিধসা রোগ লক্ষণ ও প্রতিকার")}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left text-xs font-semibold text-slate-800 hover:text-emerald-950 transition-all flex items-center gap-2 group cursor-pointer shadow-2xs"
                  >
                    <span className="text-base group-hover:scale-110 transition-transform">🥔</span>
                    <span className="truncate">
                      {i18n.language === "en" ? "Potato Late Blight Control" : "আলুর নাবিধসা রোগ ও প্রতিকার"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSend(i18n.language === "en" ? "Lime application dosage in acidic soil" : "অম্লীয় মাটিতে চুন প্রয়োগের সঠিক মাত্রা")}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-left text-xs font-semibold text-slate-800 hover:text-teal-950 transition-all flex items-center gap-2 group cursor-pointer shadow-2xs"
                  >
                    <span className="text-base group-hover:scale-110 transition-transform">🧪</span>
                    <span className="truncate">
                      {i18n.language === "en" ? "Lime Dosage in Acidic Soil" : "অম্লীয় মাটিতে চুন প্রয়োগের মাত্রা"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSend(i18n.language === "en" ? "Boro rice fertilizer management in sandy loam soil" : "বেলে দোআঁশ মাটিতে বোরো ধানের সার ব্যবস্থাপনা")}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-left text-xs font-semibold text-slate-800 hover:text-blue-950 transition-all flex items-center gap-2 group cursor-pointer shadow-2xs"
                  >
                    <span className="text-base group-hover:scale-110 transition-transform">🌾</span>
                    <span className="truncate">
                      {i18n.language === "en" ? "Boro Rice Fertilizer Plan" : "বোরো ধানের সুষম সার ব্যবস্থাপনা"}
                    </span>
                  </button>
                </div>
              </div>
            )}
            </div>
          )}

          {isLoading && (
            <div className="flex flex-col gap-1.5 bg-white p-3.5 rounded-2xl border border-slate-200/90 w-fit shadow-md">
              <div className="flex items-center gap-2 text-xs text-slate-800">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                <span className="font-semibold">
                  {i18n.language === "en" ? "Analyzing docs and generating guidance..." : "নথি বিশ্লেষণ ও উত্তর প্রস্তুত করা হচ্ছে..."}
                </span>
              </div>
              {isWarmingUp && (
                <p className="text-[11px] text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-300 font-bangla animate-pulse">
                  {i18n.language === "en"
                    ? "⏳ Server waking up from cloud idle (Cold Start)... please hold a moment."
                    : "⏳ সার্ভার ক্লাউড থেকে সক্রিয় হচ্ছে (Render Cold Start)... অনুগ্রহ করে কয়েক সেকেন্ড অপেক্ষা করুন।"}
                </p>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 6 Suggested Starter Prompts Bar */}
        <div className="bg-white px-4 py-2 border-t border-slate-200 overflow-x-auto whitespace-nowrap flex gap-2 no-scrollbar flex-shrink-0">
          {[
            { en: "Urea application guidelines for Aman rice", bn: "আমন ধানের ইউরিয়া উপরিপ্রয়োগের নিয়ম" },
            { en: "Potato Late Blight symptoms and control", bn: "আলুর নাভিধসা রোগ লক্ষণ ও প্রতিকার" },
            { en: "Lime application dosage in acidic soil", bn: "অম্লীয় মাটিতে চুন প্রয়োগের সঠিক মাত্রা" },
            { en: "Boro rice fertilizer plan for sandy loam soil", bn: "বেলে দোআঁশ মাটিতে বোরো ধানের সার ব্যবস্থাপনা" },
            { en: "Optimal sowing time for jute crops", bn: "পাট ফসলের সঠিক বীজ বপন সময়" },
            { en: "Methods to increase soil organic matter", bn: "মাটির জৈব পদার্থ বাড়ানোর উপায়" },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(i18n.language === "en" ? item.en : item.bn)}
              disabled={isLoading}
              className="text-xs px-3.5 py-1.5 rounded-full bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-950 border border-slate-200 hover:border-emerald-400 transition-all font-semibold shadow-2xs cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>{i18n.language === "en" ? item.en : item.bn}</span>
            </button>
          ))}
        </div>

        {/* Floating Input Dock */}
        <div className="bg-white p-2.5 sm:p-3.5 border-t border-slate-200 flex-shrink-0">
          <div className="flex items-end gap-2.5 bg-slate-50 rounded-2xl border border-slate-300 p-2.5 focus-within:border-emerald-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-600/15 shadow-inner transition-all">
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
              placeholder={
                i18n.language === "en"
                  ? "Write your agricultural question in English or Bangla... (Press Enter to send)"
                  : "আপনার প্রশ্নটি বাংলায় লিখুন... (Enter চাপলে সেন্ড হবে)"
              }
              disabled={isLoading}
              className="flex-1 bg-transparent border-0 text-sm focus:outline-none resize-none max-h-32 min-h-[2.25rem] py-1 text-slate-900 placeholder:text-slate-500 font-bangla"
            />

            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-mono ${
                  inputMessage.length > 900 ? "text-amber-700 font-bold" : "text-slate-500"
                }`}
              >
                {inputMessage.length}/1000
              </span>

              {isLoading ? (
                <button
                  type="button"
                  onClick={handleStopGeneration}
                  className="p-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors shadow-sm cursor-pointer"
                  title={i18n.language === "en" ? "Stop Generating" : "উত্তর থামান (Stop)"}
                >
                  <Square className="w-4 h-4 fill-white" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={isLoading || !inputMessage.trim()}
                  className="p-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white disabled:opacity-40 transition-all shadow-sm cursor-pointer flex items-center justify-center"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-elevated border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                {i18n.language === "en" ? "Report Inaccurate or Incomplete Answer" : "ভুল বা অনুপযুক্ত উত্তর রিপোর্ট করুন"}
              </h3>
              <button
                onClick={() => setFeedbackModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {feedbackSubmitted ? (
              <div className="p-4 bg-emerald-50 rounded-xl text-emerald-900 text-xs text-center font-bold border border-emerald-200">
                {i18n.language === "en"
                  ? "✓ Your report has been submitted. An agricultural officer will review it."
                  : "✓ আপনার রিপোর্ট সফলভাবে গৃহীত হয়েছে। কৃষি কর্মকর্তা এটি পর্যালোচনা করবেন।"}
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-600 font-bangla">
                  {i18n.language === "en"
                    ? "Let us know the details of the inaccuracy to help improve model reliability."
                    : "উত্তরটিতে কী ধরণের ত্রুটি লক্ষ্য করেছেন তা জানালে আমরা আমাদের সিস্টেম আরও সমৃদ্ধ করতে পারব।"}
                </p>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-800">
                    {i18n.language === "en" ? "Rating (1-5):" : "রেটিং (১-৫):"}
                  </label>
                  <select
                    value={feedbackRating}
                    onChange={(e) => setFeedbackRating(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                  >
                    <option value={1}>{i18n.language === "en" ? "1 - Highly inaccurate / hazardous advice" : "১ - অত্যন্ত অসন্তোষজনক / ক্ষতিকর তথ্য"}</option>
                    <option value={2}>{i18n.language === "en" ? "2 - Contains inaccurate data" : "২ - ভুল তথ্য রয়েছে"}</option>
                    <option value={3}>{i18n.language === "en" ? "3 - Incomplete answer" : "৩ - অসম্পূর্ণ উত্তর"}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-800">
                    {i18n.language === "en" ? "Comments / Correction Details:" : "মন্তব্য / সঠিক তথ্য জানা থাকলে লিখুন:"}
                  </label>
                  <textarea
                    rows={3}
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder={i18n.language === "en" ? "Describe corrections or suggestions..." : "উত্তরের ত্রুটি বিস্তারিত লিখুন..."}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 font-bangla"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setFeedbackModalOpen(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    {i18n.language === "en" ? "Cancel" : "বাতিল"}
                  </button>
                  <button
                    onClick={() => submitFeedback(false)}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm cursor-pointer"
                  >
                    {i18n.language === "en" ? "Submit Report" : "রিপোর্ট জমা দিন"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Admin Knowledge Management Modal */}
      {adminModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-elevated max-h-[85vh] flex flex-col border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-700" />
                  <span>নলেজবেস ও ভেক্টর ডাটাবেস ব্যবস্থাপনা</span>
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  মোট সংরক্ষিত ভেক্টর চাঙ্কস: {adminTotalChunks}
                </p>
              </div>
              <button
                onClick={() => setAdminModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {adminMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs rounded-xl font-medium">
                {adminMessage}
              </div>
            )}

            {/* Document Upload Form */}
            <form
              onSubmit={handleUploadDoc}
              className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3"
            >
              <input
                type="file"
                accept=".pdf,.md,.txt"
                onChange={(e) => setAdminUploadFile(e.target.files?.[0] || null)}
                className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-700 file:text-white hover:file:bg-emerald-800 cursor-pointer flex-1"
              />
              <button
                type="submit"
                disabled={!adminUploadFile || adminUploading}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
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
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                নথিপত্র তালিকা ({adminDocs.length})
              </h4>
              {adminDocs.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">কোনো নথি পাওয়া যায়নি।</p>
              ) : (
                adminDocs.map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs hover:border-slate-300 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-emerald-700" />
                      <div>
                        <span className="font-semibold text-slate-900">
                          {doc.filename}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                          <span>{(doc.size_bytes / 1024).toFixed(1)} KB</span>
                          {doc.is_sample && (
                            <span className="text-amber-800 font-bold bg-amber-100 px-1.5 py-0.2 rounded">[নমুনা]</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {!doc.is_sample && (
                      <button
                        onClick={() => handleDeleteDoc(doc.filename)}
                        className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
              <button
                onClick={handleReindex}
                disabled={adminUploading}
                className="text-xs text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>সম্পূর্ণ ডাটাবেস Re-Index করুন</span>
              </button>
              <button
                onClick={() => setAdminModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 cursor-pointer"
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
