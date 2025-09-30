"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Role = "user" | "assistant" | "system";
type ChatMessage = { role: Role; content: string };

export default function Page() {

  // LIGHT/DARK MODE RELATED FUNCTIONALITY 

  const [isDark, setIsDark] = useState(false);

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

  const toggleTheme = () => {
    setIsDark(!isDark);
  };





  // BASIC CHAT FUNCTIONALITY

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



  // CHAT HISTORY RELATED FUNCTIONS

  useEffect(() => {
    const history = messages.map(msg => 
      `${msg.role === 'user' ? 'You' : 'Joey'}: ${msg.content}`
    ).join('\n\n');
    setChatHistory(history);
  }, [messages]);

  function clearChat() {
    setMessages([
      { role: "assistant", content: "Hello! I am Joey LLM assistant, how can I help you?" },
    ]);
  }


  // RAG RELATED FUNCTIONS

  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const [uploadInProgress, setUploadInProgress] = useState(false);
  const [websearchEnabled, setWebsearchEnabled] = useState(true);
  const [rating, setRating] = useState(0);
  const [chatHistory, setChatHistory] = useState('');
  const [dragboxText, setDragboxText] = useState('DRAG or DROP PDF');
  
  const dragboxRef = useRef<HTMLDivElement | null>(null);

    // Drag and drop handlers
    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      if (dragboxRef.current) {
        dragboxRef.current.style.borderColor = isDark ? "#88aacc" : "#66cc88";
        dragboxRef.current.style.backgroundColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(34,197,94,0.1)";
      }
    };
  
    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      if (dragboxRef.current) {
        dragboxRef.current.style.borderColor = isDark ? "rgba(255,255,255,0.2)" : "rgba(203,213,225,1)";
        dragboxRef.current.style.backgroundColor = "";
      }
    };
  
    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      if (dragboxRef.current) {
        dragboxRef.current.style.borderColor = isDark ? "rgba(255,255,255,0.2)" : "rgba(203,213,225,1)";
        dragboxRef.current.style.backgroundColor = "";
      }
      
      const files = e.dataTransfer.files;
      if (files.length > 0 && files[0].type === "application/pdf") {
        setDroppedFile(files[0]);
        setDragboxText(`Selected: ${files[0].name}`);
      } else {
        setDragboxText("⚠️ Please drop a PDF file");
        setTimeout(() => setDragboxText("DRAG or DROP PDF"), 2000);
      }
    };
  
    // PDF upload
    const uploadPDF = async () => {
      if (uploadInProgress) {
        setDragboxText("⏳ Upload already in progress...");
        return;
      }
  
      if (!droppedFile) {
        setDragboxText("⚠️ Please select a PDF first.");
        setTimeout(() => setDragboxText("DRAG or DROP PDF"), 2000);
        return;
      }
  
      setUploadInProgress(true);
      const formData = new FormData();
      formData.append("file", droppedFile);
      setDragboxText("📤 Uploading PDF...");
  
      try {
        const res = await fetch("http://localhost:7860/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        setDragboxText("✅ PDF uploaded: " + data.result);
      } catch (err) {
        setDragboxText("❌ Upload failed: " + (err as Error).message);
      } finally {
        setUploadInProgress(false);
      }
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

















      {/* Main Container */}
      <div className="grid grid-cols-3 lg:grid-cols-12 gap-4">

















        {/* Left Column - Chat History */}
        <div className={`lg:col-span-3 overflow-auto rounded-2xl border p-4 shadow-xl backdrop-blur ${
          isDark
            ? 'border-white/10 bg-white/5'
            : 'border-slate-200 bg-white/80'
        }`}>
          <h3 className={`text-lg font-semibold mb-3 ${
            isDark ? 'text-white' : 'text-slate-800'
          }`}>
            Chat History
          </h3>
          <div className={`h-full overflow-y-auto text-xs leading-relaxed ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
          </div>
        </div>












        {/* Center Column - Chat */}
        <div className={`lg:col-span-6 rounded-2xl border p-3 shadow-xl backdrop-blur ${
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

















        {/* Right Column - Upload & Settings */}
        <div className={`lg:col-span-3 overflow-auto rounded-2xl border p-4 shadow-xl backdrop-blur space-y-6 ${
          isDark
            ? 'border-white/10 bg-white/5'
            : 'border-slate-200 bg-white/80'
        }`}>
          
          {/* PDF Upload Section */}
          <div>
            <h3 className={`text-lg font-semibold mb-3 ${
              isDark ? 'text-white' : 'text-slate-800'
            }`}>
              Upload PDF
            </h3>
            <div 
              ref={dragboxRef}
              className={`min-h-[100px] border-2 border-dashed rounded-xl p-4 text-center text-sm transition-all duration-200 cursor-pointer ${
                isDark
                  ? 'border-white/20 text-slate-300 hover:border-white/40 hover:bg-white/5'
                  : 'border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {dragboxText}
            </div>
            <button 
              onClick={uploadPDF}
              disabled={uploadInProgress}
              className={`w-full mt-3 rounded-xl px-4 py-2 text-sm font-medium shadow transition-colors disabled:opacity-50 ${
                isDark
                  ? 'bg-sky-600 text-white hover:bg-sky-500'
                  : 'bg-sky-600 text-white hover:bg-sky-700'
              }`}
            >
              {uploadInProgress ? "Uploading..." : "Submit PDF"}
            </button>
          </div>

          {/* Web Search Section */}
          <div>
            <h3 className={`text-lg font-semibold mb-3 ${
              isDark ? 'text-white' : 'text-slate-800'
            }`}>
              Web Search
            </h3>
            <label className={`flex items-center space-x-2 cursor-pointer ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              <input 
                type="checkbox" 
                checked={websearchEnabled}
                onChange={(e) => setWebsearchEnabled(e.target.checked)}
                className="rounded"
              />
              <span>Enable web search</span>
            </label>
          </div>

          {/* Rating Section */}
          <div>
            <h3 className={`text-lg font-semibold mb-3 ${
              isDark ? 'text-white' : 'text-slate-800'
            }`}>
              Rate Experience
            </h3>
            <div className="space-y-2">
              <input 
                type="range" 
                min="0" 
                max="5" 
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full"
              />
              <div className={`text-center text-sm ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {rating}/5 stars
              </div>
            </div>
          </div>
        </div>

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
