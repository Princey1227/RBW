"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Heart, Info, AlertTriangle, X, ShoppingBag } from "lucide-react";

export interface Toast {
  id: string;
  title?: string;
  message: string;
  type?: "success" | "wishlist" | "info" | "error";
  image?: string;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, "id">) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toastInput: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const duration = toastInput.duration ?? 4000;
      const newToast: Toast = { ...toastInput, id };

      setToasts((prev) => [...prev.slice(-2), newToast]); // Keep max 3 toasts at a time

      if (duration > 0) {
        setTimeout(() => {
          hideToast(id);
        }, duration);
      }
    },
    [hideToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {/* Floating Toast Portal Container */}
      <div className="fixed bottom-6 right-4 sm:right-6 z-[300] flex flex-col gap-3 max-w-[92vw] sm:max-w-md w-full pointer-events-none">
        <AnimatePresence mode="sync">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto w-full p-4 rounded-2xl bg-[#090D14]/95 dark:bg-[#090D14]/95 text-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-[#262D3D] backdrop-blur-xl flex items-center gap-3.5"
            >
              {/* Product Thumbnail or Type Icon */}
              {toast.image ? (
                <div className="w-12 h-14 rounded-xl overflow-hidden bg-neutral-900 border border-neutral-700/60 shrink-0">
                  <img
                    src={toast.image}
                    alt={toast.title || "Product"}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-center shrink-0">
                  {toast.type === "wishlist" && <Heart className="w-5 h-5 text-red-500 fill-red-500/20" />}
                  {toast.type === "success" && <ShoppingBag className="w-5 h-5 text-emerald-400" />}
                  {toast.type === "error" && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                  {(!toast.type || toast.type === "info") && <Info className="w-5 h-5 text-sky-400" />}
                </div>
              )}

              {/* Toast Message Content */}
              <div className="flex-1 min-w-0">
                {toast.title && (
                  <h4 className="text-xs font-black uppercase tracking-wider text-white truncate mb-0.5">
                    {toast.title}
                  </h4>
                )}
                <p className="text-[11px] font-bold text-neutral-300 leading-tight line-clamp-2">
                  {toast.message}
                </p>
              </div>

              {/* Optional Action Button */}
              {toast.actionLabel && toast.onAction && (
                <button
                  onClick={() => {
                    toast.onAction?.();
                    hideToast(toast.id);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#1F4E79] hover:bg-[#286399] text-white text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shrink-0 border border-sky-400/20"
                >
                  {toast.actionLabel}
                </button>
              )}

              {/* Close Button */}
              <button
                onClick={() => hideToast(toast.id)}
                className="p-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0 rounded-lg hover:bg-white/10"
                aria-label="Dismiss toast"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
