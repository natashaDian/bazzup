"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  Send,
  Sparkles,
  MapPin,
  Calendar,
  Maximize2,
  Minimize2,
} from "lucide-react";

import buzzyLogo from "./assets/buzzy logo.png";

type ChatBazaarResult = {
  id: string;
  title: string;
  organizerName: string;
  city: string;
  coverImageUrl: string | null;
  category: string | null;
  eventStartDate: string;
  eventEndDate: string;
  totalSlot: number;
  slotsLeft: number;
  minPricePerSlot: number | null;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  bazaars?: ChatBazaarResult[];
};

const INITIAL_REPLIES = [
  "Saya jualan makanan/minuman",
  "Saya jualan fashion",
  "Cari yang budget-nya kecil",
];
const FOUND_RESULTS_REPLIES = [
  "Ada yang lebih murah?",
  "Cari di kota lain",
  "Ada pilihan lain?",
];
const NO_RESULTS_REPLIES = [
  "Coba kategori lain",
  "Coba kota lain",
  "Naikkan budget",
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function BuzzyAvatar({ className }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center overflow-hidden rounded-full bg-white/20 ${className ?? "size-9"}`}
    >
      <Image
        src={buzzyLogo}
        alt="Buzzy"
        width={28}
        height={28}
        className="size-[75%] object-contain"
      />
    </div>
  );
}

function BazaarResultCard({ bazaar }: { bazaar: ChatBazaarResult }) {
  const percentFilled =
    bazaar.totalSlot > 0
      ? Math.round(
          ((bazaar.totalSlot - bazaar.slotsLeft) / bazaar.totalSlot) * 100,
        )
      : 0;

  return (
    <div className="bg-card border border-input rounded-xl overflow-hidden mt-2 shadow-sm">
      <div className="h-20 bg-secondary/15 flex items-center justify-center relative">
        {bazaar.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bazaar.coverImageUrl}
            alt={bazaar.title}
            className="size-full object-cover"
          />
        ) : (
          <Sparkles className="size-4 text-secondary" />
        )}
        {bazaar.category && (
          <span className="absolute top-1.5 left-1.5 text-[9px] px-1.5 py-0.5 rounded-full bg-card/90 text-accent">
            {bazaar.category}
          </span>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-xs font-medium">{bazaar.title}</p>
        <p className="text-[10px] text-muted-foreground mb-1.5">
          by {bazaar.organizerName}
        </p>

        <div className="flex flex-col gap-1 mb-2">
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <MapPin className="size-2.5" /> {bazaar.city}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Calendar className="size-2.5" />{" "}
            {formatDate(bazaar.eventStartDate)} -{" "}
            {formatDate(bazaar.eventEndDate)}
          </span>
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
          <span>
            {bazaar.slotsLeft} of {bazaar.totalSlot} slots left
          </span>
          <span className="font-medium text-foreground">
            {bazaar.minPricePerSlot
              ? `Mulai Rp ${bazaar.minPricePerSlot.toLocaleString("id-ID")}`
              : "-"}
          </span>
        </div>
        <div className="h-1 rounded-full bg-secondary/15 overflow-hidden mb-2">
          <div
            className="h-full bg-accent"
            style={{ width: `${percentFilled}%` }}
          />
        </div>

        <Link
          href={`/bazaars/${bazaar.id}`}
          className="block w-full text-center bg-accent text-accent-foreground text-[11px] py-1.5 rounded-lg"
        >
          Lihat detail
        </Link>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2">
      <BuzzyAvatar className="size-6 mt-0.5" />
      <div className="flex items-center gap-1 bg-secondary/15 rounded-xl rounded-tl-sm px-3 py-2.5 w-fit">
        <span className="size-1.5 rounded-full bg-secondary animate-bounce [animation-delay:-0.3s]" />
        <span className="size-1.5 rounded-full bg-secondary animate-bounce [animation-delay:-0.15s]" />
        <span className="size-1.5 rounded-full bg-secondary animate-bounce" />
      </div>
    </div>
  );
}

export function VendorChatWidget() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Halo! Aku Buzzy 👋\nCeritain usaha kamu, nanti aku bantu carikan bazaar yang cocok ya.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>(INITIAL_REPLIES);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  function closeChat() {
    setOpen(false);
    setExpanded(false);
  }

  async function sendMessage(overrideText?: string) {
    const text = overrideText ?? input;
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setQuickReplies([]);

    try {
      const apiMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.text || "Maaf, aku belum nemu jawabannya.",
          bazaars: data.bazaars,
        },
      ]);

      if (data.bazaars && data.bazaars.length > 0) {
        setQuickReplies(FOUND_RESULTS_REPLIES);
      } else {
        setQuickReplies(NO_RESULTS_REPLIES);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Yah, tunggu sebentar ya 😅 Aku lagi coba proses dulu. Boleh dicoba kirim lagi?",
        },
      ]);
      setQuickReplies([]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {open && expanded && (
        <div
          aria-hidden="true"
          onClick={() => setExpanded(false)}
          className="fixed inset-0 z-40 bg-black/10 backdrop-blur-xs animate-in fade-in-0 duration-150"
        />
      )}

      <div
        className={
          expanded
            ? "fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            : "fixed bottom-5 right-5 z-50"
        }
      >
        {open ? (
          <div
            className={`flex flex-col overflow-hidden rounded-2xl border border-input bg-card shadow-xl transition-all duration-200 ease-out animate-in fade-in-0 zoom-in-95 ${
              expanded
                ? "h-[min(680px,85vh)] w-full max-w-lg"
                : "max-h-[70vh] w-[calc(100vw-2.5rem)] max-w-80"
            }`}
          >
            <div className="bg-gradient-to-br from-accent to-primary px-4 py-3.5 flex items-center gap-2.5 shrink-0">
              <BuzzyAvatar />
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">Bazaar Assistant</p>
                <p className="text-[10px] text-white/75">
                  Biasanya balas dalam beberapa detik
                </p>
              </div>
              <div className="ml-auto flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => setExpanded((prev) => !prev)}
                  aria-label={expanded ? "Perkecil chat" : "Perbesar chat"}
                  className="rounded-full p-1.5 text-white/90 transition-colors hover:bg-white/10"
                >
                  {expanded ? (
                    <Minimize2 className="size-3.5" />
                  ) : (
                    <Maximize2 className="size-3.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={closeChat}
                  aria-label="Tutup chat"
                  className="rounded-full p-1.5 text-white/90 transition-colors hover:bg-white/10"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <div
              ref={scrollRef}
              className={`flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3 ${
                expanded ? "min-h-0" : "min-h-[240px]"
              }`}
            >
              {messages.map((msg, i) =>
                msg.role === "user" ? (
                  <div key={i} className="flex flex-col items-end animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
                    <div className="max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed bg-accent text-accent-foreground rounded-tr-sm">
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div key={i} className="flex w-full items-start gap-2 animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
                    <BuzzyAvatar className="size-6 mt-0.5" />
                    <div className="flex max-w-[85%] min-w-0 flex-col gap-1">
                      <div className="w-fit max-w-full rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-line bg-secondary/15 text-foreground rounded-tl-sm">
                        {msg.content}
                      </div>
                      {msg.bazaars && msg.bazaars.length > 0 && (
                        <div className="w-full">
                          {msg.bazaars.map((b) => (
                            <BazaarResultCard key={b.id} bazaar={b} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ),
              )}

              {isLoading && <TypingIndicator />}

              {!isLoading && quickReplies.length > 0 && (
                <div className="flex flex-col gap-1.5 mt-1">
                  {quickReplies.map((reply) => (
                    <button
                      key={reply}
                      onClick={() => sendMessage(reply)}
                      className="text-left text-[11px] px-3 py-2 rounded-xl border border-accent/30 text-accent hover:bg-accent/5"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="px-3 py-2.5 border-t border-input flex items-center gap-1.5 shrink-0">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ketik pesan..."
                className="flex-1 border border-input rounded-full px-3.5 py-2 text-xs bg-background"
              />
              <button
                onClick={() => sendMessage()}
                disabled={isLoading}
                className="size-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center shrink-0"
              >
                <Send className="size-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setOpen(true)}
            aria-label="Buka chat Buzzy"
            className="size-14 rounded-full bg-gradient-to-br from-accent to-primary text-white flex items-center justify-center shadow-lg"
          >
            <Image
              src={buzzyLogo}
              alt="Buzzy"
              width={40}
              height={40}
              className="size-9 object-contain"
            />
          </button>
        )}
      </div>
    </>
  );
}
