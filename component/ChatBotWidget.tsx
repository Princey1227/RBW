"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, X, Send, Sparkles, RefreshCw, Bot, User, RotateCcw, ShoppingBag, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const SUGGESTIONS = [
  "📦 Track my order",
  "❤️ My Wishlist",
  "👖 What fits do you offer?",
  "💰 Product prices?",
  "🏬 Explore RBW Store",
  "🚚 Shipping & Returns",
];

export default function ChatBotWidget() {
  const { addToCart, setIsOpen: openCartDrawer } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [addedItem, setAddedItem] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content: "Hello! I am your ONLY DENIMS assistant. Ask me about your orders, order tracking, wishlist, fits (Baggy, Slim, Ankle), or prices!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleNewChat = () => {
    setMessages([
      {
        id: "welcome-" + Date.now(),
        role: "assistant",
        content: "Hello! I am your ONLY DENIMS assistant. Ask me about your orders, order tracking, wishlist, fits (Baggy, Slim, Ankle), or prices!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage("");
    setIsLoading(true);

    try {
      // Retrieve logged-in user profile from localStorage if present
      let userName: string | null = null;
      if (typeof window !== "undefined") {
        try {
          const savedCustomer = localStorage.getItem("shopifyCustomer");
          if (savedCustomer) {
            const parsed = JSON.parse(savedCustomer);
            const fName = parsed.firstName || parsed.first_name || "";
            const lName = parsed.lastName || parsed.last_name || "";
            const full = `${fName} ${lName}`.trim();
            if (full && full !== "KwikPass Member") {
              userName = full;
            } else if (parsed.email) {
              userName = parsed.email;
            }
          }
          if (!userName && localStorage.getItem("adminAuth") === "true") {
            userName = "ONLY DENIMS Admin";
          }
        } catch (e) {
          console.error("Error parsing user session:", e);
        }
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName,
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply || "Sorry, I couldn't process that request.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Our AI assistant is temporarily offline. Explore our shop at /shop or view orders at /account/orders.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInChatAddToCart = async (item: { title: string; price: number; size: string }) => {
    const variantId = `gid://shopify/ProductVariant/${item.title.toLowerCase().replace(/\s+/g, "-")}-${item.size}`;
    setAddedItem(item.title);
    await addToCart(variantId, 1, {
      title: `${item.title} (Size ${item.size})`,
      price: item.price,
      image: "/raw_jeans.png",
    }, true);
    openCartDrawer(true);
    setTimeout(() => setAddedItem(null), 3500);
  };

  const renderMessageContent = (content: string) => {
    if (!content) return null;

    let actionItem: { title: string; price: number; size: string } | null = null;
    const actionMatch = content.match(/\[ACTION:BUY:(\{.*?\})\]/);

    if (actionMatch) {
      try {
        actionItem = JSON.parse(actionMatch[1]);
      } catch (e) {}
    }

    const cleanContent = content.replace(/\[ACTION:BUY:\{.*?\}\]/g, "").trim();
    const cleaned = cleanContent.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$2");

    const routePattern = /(https?:\/\/onlydenims\.com\/(?:stores\/rbw|account\/orders|account\/wishlist|wishlist|shop|about|contact|journey|blog|jackets|shorts|accessories|faq)|\/(?:stores\/rbw|account\/orders|account\/wishlist|wishlist|shop|about|contact|journey|blog|jackets|shorts|accessories|faq))/gi;
    const matchedUrls = cleaned.match(routePattern) || [];
    const pureText = cleaned.replace(routePattern, "").replace(/\s{2,}/g, " ").trim();

    return (
      <div className="space-y-2.5">
        {pureText && (
          <p className="break-words leading-relaxed">
            {pureText}
          </p>
        )}

        {matchedUrls.length > 0 && (
          <div className="mt-2.5 flex flex-col gap-1.5 font-mono">
            {Array.from(new Set(matchedUrls)).map((url, i) => {
              const rawPath = url.replace(/^https?:\/\/onlydenims\.com/i, "");
              const href = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
              const displayUrl = `https://onlydenims.com${href}`;

              return (
                <Link
                  key={i}
                  href={href}
                  prefetch={false}
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 font-bold text-[#1C1917] bg-[#F4EFE6] hover:bg-[#1C1917] hover:text-white border border-[#E2DDD5] rounded-xl transition-all text-[11px] shadow-2xs cursor-pointer break-all w-fit"
                >
                  <span className="text-[#B9965A]">🔗</span>
                  <span className="underline">{displayUrl}</span>
                </Link>
              );
            })}
          </div>
        )}

        {actionItem && (
          <div className="mt-3 p-3 bg-[#F4EFE6] border border-[#E8E3DA] rounded-2xl flex flex-col gap-2 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-xs text-[#1C1917]">{actionItem.title}</p>
                <p className="text-[10px] text-[#78716C]">Size: <span className="font-bold text-[#1C1917]">{actionItem.size}</span> • Price: <span className="font-bold text-[#1C1917]">₹ {actionItem.price.toLocaleString('en-IN')}</span></p>
              </div>
              <ShoppingBag className="w-4 h-4 text-[#B9965A]" />
            </div>
            <button
              onClick={() => actionItem && handleInChatAddToCart(actionItem)}
              className="w-full py-2 px-3 rounded-xl bg-[#1C1917] hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-98"
            >
              {addedItem === actionItem.title ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Added To Bag!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 text-[#B9965A]" />
                  <span>Add Size {actionItem.size} To Bag — ₹ {actionItem.price.toLocaleString('en-IN')}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  const pathname = usePathname();
  const isRbwStore = Boolean(pathname?.startsWith("/stores/rbw"));

  // Hide AI chatbot on fullscreen 3D Atelier Showroom and Experience Center so it doesn't obstruct controls
  if (pathname === "/stores/rbw" || pathname === "/experience-center") {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="fixed bottom-[68px] min-[390px]:bottom-[84px] sm:bottom-6 right-3.5 sm:right-6 z-[9999] pointer-events-auto select-none font-sans transition-all duration-300"
    >
      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative group flex items-center justify-center w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-[#1C1917] text-white shadow-[0_8px_25px_rgba(0,0,0,0.5)] border-2 border-[#B9965A] hover:bg-black transition-all duration-300 cursor-pointer"
        aria-label="Toggle ONLY DENIMS AI Assistant Chat"
      >
        {/* Hover Tooltip Badge */}
        {!isOpen && (
          <div className="hidden sm:block absolute right-15 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 whitespace-nowrap z-20">
            <div className="bg-[#1C1917] text-white border border-white/20 px-3 py-1.5 rounded-xl shadow-2xl flex items-center gap-2 text-[10px] font-bold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>ONLY DENIMS AI CHATBOT</span>
            </div>
          </div>
        )}

        <div className="absolute inset-0 rounded-full bg-[#B9965A]/20 blur-md group-hover:blur-lg transition-all" />
        {isOpen ? (
          <X className="w-5 h-5 text-white relative z-10" />
        ) : (
          <div className="relative z-10 flex items-center justify-center">
            {/* Robot AI Head Icon */}
            <Bot className="w-6 h-6 text-[#B9965A] group-hover:text-white transition-colors" />

            {/* Online Pulse Dot */}
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-[#1C1917]" />
            </span>
          </div>
        )}
      </motion.button>

      {/* Floating Chat Drawer Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            className="absolute bottom-13 sm:bottom-15 right-0 w-[calc(100vw-1.75rem)] max-w-[330px] sm:max-w-none sm:w-[350px] md:w-[370px] lg:w-[390px] xl:w-[410px] h-[380px] sm:h-[430px] md:h-[480px] lg:h-[540px] xl:h-[570px] max-h-[calc(100vh-8.5rem)] bg-[#FAF8F5] backdrop-blur-xl border border-[#E2DDD5] rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden overscroll-contain text-[#1C1917] z-[9999]"
          >
            {/* Header Bar */}
            <div className="px-4 py-3 bg-[#F4EFE6] border-b border-[#E8E3DA] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#1C1917] text-[#B9965A] border border-[#1C1917] flex items-center justify-center font-serif font-black text-xs tracking-wider select-none shadow-xs shrink-0">
                  OD
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[11px] sm:text-xs font-bold tracking-wider sm:tracking-[0.15em] uppercase text-[#1C1917] flex items-center gap-1.5 whitespace-nowrap">
                    <span className="whitespace-nowrap">ONLY DENIMS AI</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  </h3>
                  <p className="text-[9px] sm:text-[10px] text-[#78716C] tracking-wider font-medium whitespace-nowrap">Fashion Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleNewChat}
                  title="Start New Chat"
                  className="px-2 py-1 rounded-lg bg-white hover:bg-stone-200 border border-[#E2DDD5] text-[#1C1917] transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase shadow-2xs whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-3 h-3 text-[#1C1917] shrink-0" />
                  <span className="whitespace-nowrap">NEW CHAT</span>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-[#E8E3DA] text-[#57534E] hover:text-[#1C1917] transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Body Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto overscroll-contain space-y-3.5 scrollbar-thin scrollbar-thumb-stone-300 text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-lg bg-[#1C1917] text-[#B9965A] flex items-center justify-center font-serif font-bold text-[10px] tracking-tighter shrink-0 mt-0.5 select-none shadow-2xs">
                      OD
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] px-4 py-3 rounded-2xl leading-relaxed text-xs ${
                      msg.role === "user"
                        ? "bg-[#1C1917] text-white font-medium rounded-tr-xs shadow-xs"
                        : "bg-white border border-[#E8E3DA] text-[#1C1917] rounded-tl-xs shadow-2xs"
                    }`}
                  >
                    <div>{renderMessageContent(msg.content)}</div>
                    <span
                      className={`block text-[9px] mt-1.5 ${
                        msg.role === "user" ? "text-stone-300 text-right" : "text-[#78716C]"
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>

                  {msg.role === "user" && (
                    <div className="w-7 h-7 rounded-lg bg-[#F4EFE6] border border-[#E8E3DA] flex items-center justify-center text-[#1C1917] shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex items-center gap-2.5 text-[#57534E] text-xs py-2 px-1">
                  <div className="w-7 h-7 rounded-lg bg-[#1C1917] text-[#B9965A] flex items-center justify-center font-serif font-bold text-[10px] tracking-tighter shrink-0 select-none shadow-2xs">
                    OD
                  </div>
                  <div className="bg-white border border-[#E8E3DA] px-3.5 py-2 rounded-2xl rounded-tl-xs shadow-2xs flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#B9965A]" />
                    <span className="text-xs font-semibold text-[#1C1917]">Thinking...</span>
                    <div className="flex gap-1 items-center ml-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1C1917] animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1C1917] animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1C1917] animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-3.5 py-2 bg-[#F4EFE6] border-t border-[#E8E3DA] flex gap-2 overflow-x-auto no-scrollbar shrink-0">
              {SUGGESTIONS.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(chip)}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-full bg-white hover:bg-[#1C1917] hover:text-white border border-[#E2DDD5] text-[10px] font-medium text-[#1C1917] whitespace-nowrap transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-[#FAF8F5] border-t border-[#E2DDD5] flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about jeans, prices, fits..."
                disabled={isLoading}
                className="flex-1 bg-white border border-[#D6D3D1] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#1C1917] placeholder-[#57534E] outline-none focus:border-[#1C1917] focus:ring-1 focus:ring-[#1C1917] transition-all disabled:opacity-50 shadow-xs"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="w-10 h-10 rounded-2xl bg-[#1C1917] hover:bg-black text-white flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 shrink-0 shadow-md active:scale-95"
              >
                <Send className={`w-4 h-4 transition-colors ${inputMessage.trim() ? "text-[#B9965A]" : "text-white"}`} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
