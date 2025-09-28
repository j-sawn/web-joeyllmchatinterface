"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Role = "user" | "assistant" | "system";
type ChatMessage = { role: Role; content: string };

export default function Page() {

  const [isDark, setIsDark] = useState(false);
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hello! I am Joey LLM assistant, how can I help you?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Apply theme to body element
  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('dark-theme');
    };
  }, [isDark]);

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

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <div className={`fixed inset-0 overflow-y-auto transition-colors duration-300 ${
      isDark 
        ? 'bg-neutral-950' // if isDark is true
        : 'bg-neutral-100'  // if isDark is false
    }`}>

    <div className="container mx-auto max-w-4xl p-4 space-y-4">  
      
      {/* Banner */}
      <div className="flex justify-center items-center relative">
        <Image
          src="/title_pic.png"
          alt="JoeyLLM Logo"
          width={600}
          height={180}
          priority
          className="h-20 w-auto md:h-24 lg:h-28 object-contain drop-shadow"
        />
        <button 
          className={`absolute right-0 rounded-full border p-3 transition-all duration-200 ${
            isDark
              ? 'border-white/15 bg-white/10 text-white hover:bg-white/20'
              : 'border-slate-200 bg-white/80 text-slate-600 hover:bg-white shadow-sm'
          } backdrop-blur`}
          onClick={toggleTheme}
        >
          {isDark ? '🌔' : '🌒'}
        </button>
      </div>

      {/* Header */}
      <header className={`flex items-center justify-between rounded-2xl border px-4 py-3 shadow-lg backdrop-blur ${
        isDark
          ? 'border-white/10 bg-white/5 text-white'
          : 'border-slate-200 bg-white/80 text-slate-800'
      }`}>
        <h1 className="text-lg font-semibold tracking-tight">JoeyLLM Chat</h1>
        <button
          className={`rounded-md border px-3 py-1 text-xs transition-colors ${
            isDark
              ? 'border-white/15 bg-white/10 text-white hover:bg-white/20'
              : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
          onClick={clearChat}
          type="button"
        >
          New chat
        </button>
      </header>

      {/* Chat window */}
      <div className={`rounded-2xl border p-3 shadow-xl backdrop-blur ${
        isDark
          ? 'border-white/10 bg-white/5'
          : 'border-slate-200 bg-white/80'
      }`}>
        <div ref={listRef} className="h-[65vh] space-y-2 overflow-y-auto px-1">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[92%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm ${
                m.role === "assistant"
                  ? (isDark ? "bg-white text-slate-800"
                  : "bg-sky-600 text-white")
                  : (isDark ? "ml-auto bg-orange-400/90 text-slate-800"
                  : "ml-auto bg-orange-400/90 text-white")
              }`}
            >
              <span className="mr-1 font-bold">
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
            className={`min-h-[44px] flex-1 resize-none rounded-xl border p-3 text-sm shadow focus:outline-none focus:ring-2 focus:ring-orange-400/50 ${
              isDark
                ? 'border-white/15 bg-neutral-800 text-slate-100 placeholder:text-slate-500'
                : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-500'
            }`}
            rows={2}
            placeholder="Message Joey…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            className={`rounded-xl bg-orange-400 px-4 py-2 text-sm font-medium shadow hover:bg-orange-300 disabled:opacity-50 transition-colors"${
              isDark
                ? 'text-slate-800'
                : 'text-white'
            }`}
            type="submit"
            disabled={loading || !input.trim()}
          >
            {loading ? "Sending…" : "Send"}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p className={`text-center text-xs ${
        isDark ? 'text-slate-400' : 'text-slate-500' 
      }`}>
        Using API via local route: <code className={`${
          isDark ? 'bg-black/20' : 'bg-slate-100'
        } px-1 rounded`}>/api/chat</code>
      </p>
    </div>
    </div>
  );
}
