"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { X, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "assistant" | "user";
  text: string;
}

const SUGGESTIONS = [
  "Quel format performe le mieux ?",
  "Comment améliorer mon engagement ?",
  "Quelle est ma meilleure heure de publication ?",
];

const QUICK_ANSWERS: Record<string, string> = {
  "quel format performe le mieux":
    "D'après votre niche, les Reels courts (< 30s) génèrent le plus d'engagement. Les carrousels éducatifs arrivent en second pour les sauvegardes.",
  "comment améliorer mon engagement":
    "Trois leviers rapides : 1) Ouvrez avec un hook question/choc dans les 2 premières secondes. 2) Ajoutez un CTA clair en fin de contenu. 3) Répondez à chaque commentaire dans la première heure.",
  "quelle est ma meilleure heure de publication":
    "Vos meilleurs créneaux : 8h-9h en semaine et 11h-13h le week-end. Publiez quand votre audience est en ligne pour maximiser la portée initiale.",
};

function getAnswer(input: string): string {
  const lower = input.toLowerCase().trim();
  for (const [key, answer] of Object.entries(QUICK_ANSWERS)) {
    if (lower.includes(key) || key.includes(lower.slice(0, 20))) {
      return answer;
    }
  }
  return "Je suis Winly AI — votre assistant growth. Consultez le Content Lab pour tester vos idées ou l'Opportunity Finder pour découvrir des sujets à fort potentiel.";
}

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Bonjour ! Je suis Winly AI. Comment puis-je vous aider à croître aujourd'hui ?",
    },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [open, messages.length]);

  function send(text: string) {
    if (!text.trim()) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", text: text.trim() };
    const answer = getAnswer(text);
    const aiMsg: Message = { id: crypto.randomUUID(), role: "assistant", text: answer };
    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Halo rings — visible only when closed */}
        {!open && (
          <>
            <span className="absolute inset-0 -m-4 rounded-full border-[3px] border-violet bg-violet/20 animate-halo-ping pointer-events-none" />
            <span className="absolute inset-0 -m-4 rounded-full border-[3px] border-violet/70 bg-violet/10 animate-halo-ping-slow pointer-events-none" />
          </>
        )}
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            "relative flex h-[72px] w-[72px] items-center justify-center rounded-full transition-all duration-300",
            open
              ? "bg-surface-2 border border-border scale-90 shadow-lg"
              : "shadow-[0_0_36px_rgba(139,92,246,0.5)] hover:shadow-[0_0_48px_rgba(139,92,246,0.65)] hover:scale-105 animate-pulse-glow",
          )}
          aria-label={open ? "Fermer l'assistant" : "Ouvrir l'assistant"}
        >
          {open ? (
            <X className="h-5 w-5 text-text-secondary" />
          ) : (
            <Image
              src="/branding/winly-logo.png"
              alt="Winly AI"
              width={72}
              height={72}
              className="rounded-full object-cover h-[72px] w-[72px]"
            />
          )}
        </button>
      </div>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-[104px] right-6 z-50 flex w-[360px] flex-col rounded-2xl border border-border bg-surface-1 shadow-[0_8px_40px_rgba(0,0,0,0.5)] animate-fade-in overflow-hidden"
          style={{ height: "min(520px, calc(100vh - 150px))" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border bg-surface-2 px-4 py-3">
            <div className="relative shadow-[0_0_16px_rgba(139,92,246,0.3)] rounded-full">
              <Image
                src="/branding/winly-logo.png"
                alt="Winly AI"
                width={64}
                height={64}
                className="rounded-full object-cover h-16 w-16"
              />
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-surface-2 bg-success" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Winly AI</p>
              <p className="text-[10px] text-text-muted">Assistant growth</p>
            </div>
            <Sparkles className="h-4 w-4 text-accent" />
            <button
              onClick={() => setOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:bg-surface-3 hover:text-foreground transition-colors"
              aria-label="Fermer le chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed",
                  msg.role === "assistant"
                    ? "bg-surface-2 text-foreground self-start"
                    : "bg-accent/15 text-foreground self-end ml-auto",
                )}
              >
                {msg.text}
              </div>
            ))}

            {/* Suggestions after welcome */}
            {messages.length === 1 && (
              <div className="space-y-1.5 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="block w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-left text-xs text-text-secondary hover:border-accent/40 hover:text-accent transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-border bg-surface-2 px-3 py-2.5"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez une question..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-text-muted focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white transition-colors hover:bg-accent-hover disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
