"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Role = "user" | "assistant" | "system";
type ChatMessage = { role: Role; content: string };

export default function Page() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hello! I am Joey LLM assistant, how can I help you?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(e?: React.FormEvent) {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.content || "Sorry, I cannot process your request.",
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ Error: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    setMessages([
      { role: "assistant", content: "Hello! I am Joey LLM assistant, how can I help you?" },
    ]);
  }

  return (
    <main className="space-y-4">
      {/* Banner */}
      <div className="flex justify-center">
        <Image
          src="/title_pic.png"
          alt="JoeyLLM Logo"
          width={600}
          height={180}
          priority
          className="h-20 w-auto md:h-24 lg:h-28 object-contain drop-shadow"
        />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-lg backdrop-blur">
        <h1 className="text-lg font-semibold tracking-tight">JoeyLLM Chat</h1>
        <button
          className="rounded-md border border-white/15 bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20"
          onClick={clearChat}
          type="button"
        >
          New chat
        </button>
      </header>

      {/* Chat window */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-3 shadow-xl backdrop-blur">
        <div ref={listRef} className="h-[65vh] space-y-2 overflow-y-auto px-1">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[92%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm ${
                m.role === "assistant"
                  ? "bg-white text-slate-800"
                  : "ml-auto bg-amber-400/90 text-slate-900"
              }`}
            >
              <span className="mr-1 font-medium">
                {m.role === "assistant" ? "Joey" : "You"}:
              </span>
              {m.content}
            </div>
          ))}
          {loading && (
            <div className="max-w-[92%] rounded-2xl bg-white px-3 py-2 text-sm text-slate-800 shadow-sm">
              …thinking
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="mt-3 flex items-end gap-2">
          <textarea
            className="min-h-[44px] flex-1 resize-none rounded-xl border border-white/15 bg-white/90 p-3 text-sm text-slate-900 placeholder:text-slate-500 shadow focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            rows={2}
            placeholder="Message Joey…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-medium text-slate-900 shadow hover:bg-amber-300 disabled:opacity-50"
            type="submit"
            disabled={loading || !input.trim()}
          >
            {loading ? "Sending…" : "Send"}
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-slate-300">
        Using API via local route: <code>/api/chat</code>
      </p>
    </main>
  );
}
