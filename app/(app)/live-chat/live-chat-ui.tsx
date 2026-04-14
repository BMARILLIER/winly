"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import {
  MessageCircle,
  Plus,
  Send,
  X,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Target,
  Zap,
  Archive,
  Trash2,
  ChevronLeft,
  Instagram,
  Twitter,
  Linkedin,
  Mail,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  createConversation,
  getConversation,
  sendMessage,
  updateConversation,
  deleteConversation,
  dismissInsight,
} from "@/lib/actions/live-chat";
import { analyzeMessages, getInterestLabel, getEmotionLabel } from "@/modules/live-chat";
import type { ChatAnalysis } from "@/modules/live-chat";

// --- Types ---

type ConversationSummary = {
  id: string;
  contactName: string;
  contactType: string;
  platform: string;
  status: string;
  score: number;
  updatedAt: Date;
  messages: { content: string; createdAt: Date }[];
  _count: { messages: number };
};

type FullConversation = {
  id: string;
  contactName: string;
  contactType: string;
  platform: string;
  status: string;
  score: number;
  notes: string | null;
  tags: string | null;
  messages: { id: string; sender: string; content: string; createdAt: Date }[];
  insights: { id: string; type: string; label: string; description: string; priority: string }[];
};

// --- Platform icons ---

function PlatformIcon({ platform, className }: { platform: string; className?: string }) {
  switch (platform) {
    case "instagram": return <Instagram className={className} />;
    case "twitter": return <Twitter className={className} />;
    case "linkedin": return <Linkedin className={className} />;
    case "email": return <Mail className={className} />;
    default: return <MessageCircle className={className} />;
  }
}

const CONTACT_TYPES = [
  { value: "prospect", label: "Prospect" },
  { value: "brand", label: "Marque" },
  { value: "follower", label: "Follower" },
  { value: "partner", label: "Partenaire" },
];

const PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "twitter", label: "Twitter/X" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "email", label: "Email" },
];

// --- Main component ---

export function LiveChatUI({ initialConversations }: { initialConversations: ConversationSummary[] }) {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeConv, setActiveConv] = useState<FullConversation | null>(null);
  const [analysis, setAnalysis] = useState<ChatAnalysis | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [showPanel, setShowPanel] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [input, setInput] = useState("");
  const [senderToggle, setSenderToggle] = useState<"me" | "contact">("me");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages.length]);

  // Load conversation
  function loadConversation(id: string) {
    startTransition(async () => {
      const conv = await getConversation(id);
      if (conv) {
        setActiveConv(conv as FullConversation);
        // Run client-side analysis
        const a = analyzeMessages(conv.messages.map((m) => ({ sender: m.sender, content: m.content })));
        setAnalysis(a);
      }
    });
  }

  // Send message
  function handleSend() {
    if (!input.trim() || !activeConv) return;
    const content = input;
    const sender = senderToggle === "me" ? "me" : activeConv.contactName;
    setInput("");

    startTransition(async () => {
      const { analysis: newAnalysis } = await sendMessage(activeConv.id, content, sender);
      setAnalysis(newAnalysis);
      // Reload conversation
      const conv = await getConversation(activeConv.id);
      if (conv) setActiveConv(conv as FullConversation);
    });
  }

  // Create new conversation
  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const contactName = fd.get("contactName") as string;
    const contactType = fd.get("contactType") as string;
    const platform = fd.get("platform") as string;
    if (!contactName?.trim()) return;

    startTransition(async () => {
      const conv = await createConversation({ contactName, contactType, platform });
      setConversations((prev) => [
        { ...conv, messages: [], _count: { messages: 0 } } as ConversationSummary,
        ...prev,
      ]);
      setShowNewForm(false);
      loadConversation(conv.id);
    });
  }

  // Archive/Delete
  function handleArchive() {
    if (!activeConv) return;
    startTransition(async () => {
      await updateConversation(activeConv.id, { status: "archived" });
      setConversations((prev) => prev.filter((c) => c.id !== activeConv.id));
      setActiveConv(null);
      setAnalysis(null);
    });
  }

  function handleDelete() {
    if (!activeConv) return;
    startTransition(async () => {
      await deleteConversation(activeConv.id);
      setConversations((prev) => prev.filter((c) => c.id !== activeConv.id));
      setActiveConv(null);
      setAnalysis(null);
    });
  }

  return (
    <div className="flex h-[calc(100vh-180px)] gap-4">
      {/* Conversation list */}
      <div className={cn(
        "flex flex-col border border-border rounded-xl bg-surface-1 overflow-hidden",
        activeConv ? "hidden lg:flex w-80 shrink-0" : "flex-1"
      )}>
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">Conversations</h2>
          <button
            onClick={() => setShowNewForm(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* New conversation form */}
        {showNewForm && (
          <form onSubmit={handleCreate} className="border-b border-border p-3 space-y-2 bg-surface-2">
            <input
              name="contactName"
              placeholder="Nom du contact"
              required
              className="w-full rounded-lg border border-border bg-surface-1 px-3 py-1.5 text-sm text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none"
            />
            <div className="flex gap-2">
              <select
                name="contactType"
                defaultValue="prospect"
                className="flex-1 rounded-lg border border-border bg-surface-1 px-2 py-1.5 text-sm text-foreground focus:border-accent focus:outline-none"
              >
                {CONTACT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <select
                name="platform"
                defaultValue="instagram"
                className="flex-1 rounded-lg border border-border bg-surface-1 px-2 py-1.5 text-sm text-foreground focus:border-accent focus:outline-none"
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
              >
                Créer
              </button>
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                className="rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-2 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <MessageCircle className="h-10 w-10 text-text-muted mb-3" />
              <p className="text-sm text-text-secondary">Aucune conversation</p>
              <p className="text-xs text-text-muted mt-1">Créez votre première conversation</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const interest = getInterestLabel(conv.score);
              const lastMsg = conv.messages[0]?.content ?? "Pas de message";
              return (
                <button
                  key={conv.id}
                  onClick={() => loadConversation(conv.id)}
                  className={cn(
                    "w-full flex items-start gap-3 px-4 py-3 text-left border-b border-border transition-colors hover:bg-surface-2",
                    activeConv?.id === conv.id && "bg-accent/10 border-l-2 border-l-accent"
                  )}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-2 border border-border">
                    <PlatformIcon platform={conv.platform} className="h-4 w-4 text-text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground truncate">{conv.contactName}</span>
                      <span className={cn(
                        "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                        interest.color === "success" && "bg-success/15 text-success",
                        interest.color === "info" && "bg-info/15 text-info",
                        interest.color === "warning" && "bg-warning/15 text-warning",
                        interest.color === "danger" && "bg-danger/15 text-danger",
                      )}>
                        {conv.score}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted truncate mt-0.5">{lastMsg}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-text-muted capitalize">{conv.contactType}</span>
                      <span className="text-[10px] text-text-muted">{conv._count.messages} msg</span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat area */}
      {activeConv ? (
        <div className="flex flex-1 gap-4 min-w-0">
          {/* Messages */}
          <div className="flex flex-1 flex-col border border-border rounded-xl bg-surface-1 overflow-hidden min-w-0">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <button
                onClick={() => { setActiveConv(null); setAnalysis(null); }}
                className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-2 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-violet">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{activeConv.contactName}</p>
                <div className="flex items-center gap-2">
                  <PlatformIcon platform={activeConv.platform} className="h-3 w-3 text-text-muted" />
                  <span className="text-[10px] text-text-muted capitalize">{activeConv.contactType}</span>
                  {analysis && (
                    <>
                      <span className="text-[10px] text-text-muted">•</span>
                      <span className="text-[10px]">{getEmotionLabel(analysis.emotion).emoji} {getEmotionLabel(analysis.emotion).label}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowPanel(!showPanel)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                    showPanel ? "bg-accent/15 text-accent" : "text-text-secondary hover:bg-surface-2"
                  )}
                  title="Panneau d'analyse"
                >
                  <Sparkles className="h-4 w-4" />
                </button>
                <button onClick={handleArchive} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-2 transition-colors" title="Archiver">
                  <Archive className="h-4 w-4" />
                </button>
                <button onClick={handleDelete} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-danger/20 hover:text-danger transition-colors" title="Supprimer">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {activeConv.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageCircle className="h-8 w-8 text-text-muted mb-2" />
                  <p className="text-sm text-text-secondary">Commencez la conversation</p>
                  <p className="text-xs text-text-muted mt-1">Copiez-collez les messages échangés</p>
                </div>
              ) : (
                activeConv.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                      msg.sender === "me"
                        ? "bg-accent/15 text-foreground ml-auto rounded-br-md"
                        : "bg-surface-2 text-foreground rounded-bl-md"
                    )}
                  >
                    {msg.sender !== "me" && (
                      <p className="text-[10px] font-medium text-accent mb-0.5">{msg.sender}</p>
                    )}
                    {msg.content}
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border bg-surface-2 px-4 py-3">
              {/* Sender toggle */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] text-text-muted">Expéditeur :</span>
                <button
                  onClick={() => setSenderToggle("me")}
                  className={cn(
                    "px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors",
                    senderToggle === "me" ? "bg-accent text-white" : "bg-surface-1 text-text-secondary border border-border"
                  )}
                >
                  Moi
                </button>
                <button
                  onClick={() => setSenderToggle("contact")}
                  className={cn(
                    "px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors",
                    senderToggle === "contact" ? "bg-primary text-white" : "bg-surface-1 text-text-secondary border border-border"
                  )}
                >
                  {activeConv.contactName}
                </button>
              </div>
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tapez un message..."
                  className="flex-1 bg-surface-1 rounded-lg border border-border px-3 py-2 text-sm text-foreground placeholder:text-text-muted focus:border-accent focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isPending}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-white hover:bg-accent-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Analysis panel */}
          {showPanel && analysis && (
            <div className="hidden xl:flex w-72 shrink-0 flex-col border border-border rounded-xl bg-surface-1 overflow-hidden">
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <Sparkles className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-semibold text-foreground">Analyse</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Interest score */}
                <div>
                  <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-2">Score d'intérêt</p>
                  <div className="flex items-center gap-3">
                    <div className="relative h-14 w-14">
                      <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--border)" strokeWidth="2.5" />
                        <circle
                          cx="18" cy="18" r="15.9" fill="none"
                          stroke={
                            analysis.interestScore >= 70 ? "var(--success)" :
                            analysis.interestScore >= 40 ? "var(--info)" :
                            analysis.interestScore >= 20 ? "var(--warning)" : "var(--danger)"
                          }
                          strokeWidth="2.5"
                          strokeDasharray={`${analysis.interestScore} ${100 - analysis.interestScore}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">
                        {analysis.interestScore}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{getInterestLabel(analysis.interestScore).label}</p>
                      <p className="text-[10px] text-text-muted">{getEmotionLabel(analysis.emotion).emoji} {getEmotionLabel(analysis.emotion).label}</p>
                    </div>
                  </div>
                </div>

                {/* Opportunities */}
                {analysis.opportunities.length > 0 && (
                  <div>
                    <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-2">Opportunités</p>
                    <div className="space-y-1.5">
                      {analysis.opportunities.map((opp, i) => (
                        <div key={i} className="flex items-start gap-2 rounded-lg bg-surface-2 px-3 py-2">
                          <Target className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs font-medium text-foreground">{opp.label}</p>
                            <p className={cn(
                              "text-[10px]",
                              opp.confidence === "high" ? "text-success" : opp.confidence === "medium" ? "text-warning" : "text-text-muted"
                            )}>
                              Confiance {opp.confidence}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                <div>
                  <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-2">Suggestions</p>
                  <div className="space-y-1.5">
                    {analysis.suggestions.map((sug) => (
                      <div
                        key={sug.id}
                        className={cn(
                          "rounded-lg border px-3 py-2",
                          sug.priority === "high"
                            ? "border-accent/30 bg-accent/5"
                            : sug.priority === "medium"
                            ? "border-warning/30 bg-warning/5"
                            : "border-border bg-surface-2"
                        )}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {sug.priority === "high" ? (
                            <Zap className="h-3 w-3 text-accent" />
                          ) : sug.priority === "medium" ? (
                            <TrendingUp className="h-3 w-3 text-warning" />
                          ) : (
                            <AlertCircle className="h-3 w-3 text-text-muted" />
                          )}
                          <span className={cn(
                            "text-[10px] font-medium capitalize",
                            sug.priority === "high" ? "text-accent" : sug.priority === "medium" ? "text-warning" : "text-text-muted"
                          )}>
                            {sug.action.replace(/_/g, " ")}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed">{sug.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Saved insights from DB */}
                {activeConv.insights.length > 0 && (
                  <div>
                    <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-2">Historique insights</p>
                    <div className="space-y-1">
                      {activeConv.insights.slice(0, 5).map((insight) => (
                        <div key={insight.id} className="flex items-start gap-2 text-xs text-text-secondary">
                          <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                          <span className="flex-1">{insight.label}</span>
                          <button
                            onClick={() => {
                              startTransition(async () => {
                                await dismissInsight(insight.id);
                                loadConversation(activeConv.id);
                              });
                            }}
                            className="text-text-muted hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        !conversations.length && !activeConv && (
          <div className="hidden lg:flex flex-1 items-center justify-center border border-border rounded-xl bg-surface-1">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-text-muted mx-auto mb-3" />
              <p className="text-sm text-text-secondary">Sélectionnez ou créez une conversation</p>
            </div>
          </div>
        )
      )}
    </div>
  );
}
