"use client";

import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { useTheme } from "../../theme-provider";

export default function NotificationsPage() {
  const { theme } = useTheme();
  const [preferences, setPreferences] = useState({
    emailMarketing: true,
    smsAlerts: true,
    whatsappUpdates: false,
    orderTracking: true,
  });

  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("onlydenims_notification_prefs");
      if (saved) {
        try {
          setPreferences(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse notifications preferences:", e);
        }
      }
    }
  }, []);

  const handleToggle = (key: keyof typeof preferences) => {
    if (key === "orderTracking") return; // cannot toggle security settings
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "onlydenims_notification_prefs",
          JSON.stringify(preferences)
        );
      }
      setIsLoading(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }, 800);
  };

  const renderCheckbox = (active: boolean) => {
    return (
      <span className="font-mono text-xs tracking-widest font-black select-none transition-colors duration-200">
        {active ? "[ X ]" : "[   ]"}
      </span>
    );
  };

  const isLight = theme === "light";

  return (
    <div className={`space-y-10 font-sans antialiased select-none transition-colors duration-300 ${
      isLight ? "bg-white text-black" : "bg-black text-white"
    }`}>
      
      {/* Title */}
      <div className={`border-b pb-4 ${isLight ? "border-neutral-200" : "border-neutral-900"}`}>
        <h2 className="font-serif text-xl font-bold uppercase">
          Notifications
        </h2>
        <p className="text-[10px] text-neutral-450 tracking-wider uppercase mt-1">
          Configure updates regarding new catalog launches and order tracking.
        </p>
      </div>

      {/* Preferences List */}
      <div className="space-y-8 max-w-xl select-none">
        
        {/* Preference Card 1: Email marketing */}
        <div
          onClick={() => handleToggle("emailMarketing")}
          className={`flex items-start justify-between gap-6 cursor-pointer group py-2 border-b pb-6 ${
            isLight ? "border-neutral-200" : "border-neutral-900"
          }`}
        >
          <div className="space-y-1">
            <h4 className={`text-xs font-bold uppercase tracking-wider transition-colors ${
              isLight ? "group-hover:text-[#1F4E79]" : "group-hover:text-[#3b82f6]"
            }`}>Email Newsletters</h4>
            <p className="text-[10px] text-neutral-400 max-w-md leading-relaxed">
              Receive weekly updates regarding new Kojima selvedge wash drops, restocks, and exclusive styling lookbooks.
            </p>
          </div>
          <div className={`pt-0.5 ${isLight ? "text-[#1F4E79]" : "text-[#3b82f6]"}`}>
            {renderCheckbox(preferences.emailMarketing)}
          </div>
        </div>

        {/* Preference Card 2: SMS alerts */}
        <div
          onClick={() => handleToggle("smsAlerts")}
          className={`flex items-start justify-between gap-6 cursor-pointer group py-2 border-b pb-6 ${
            isLight ? "border-neutral-200" : "border-neutral-900"
          }`}
        >
          <div className="space-y-1">
            <h4 className={`text-xs font-bold uppercase tracking-wider transition-colors ${
              isLight ? "group-hover:text-[#1F4E79]" : "group-hover:text-[#3b82f6]"
            }`}>SMS Dispatch Alerts</h4>
            <p className="text-[10px] text-neutral-400 max-w-md leading-relaxed">
              Opt-in for text alerts showing when your package departs from Mumbai with live track and trace links.
            </p>
          </div>
          <div className={`pt-0.5 ${isLight ? "text-[#1F4E79]" : "text-[#3b82f6]"}`}>
            {renderCheckbox(preferences.smsAlerts)}
          </div>
        </div>

        {/* Preference Card 3: WhatsApp updates */}
        <div
          onClick={() => handleToggle("whatsappUpdates")}
          className={`flex items-start justify-between gap-6 cursor-pointer group py-2 border-b pb-6 ${
            isLight ? "border-neutral-200" : "border-neutral-900"
          }`}
        >
          <div className="space-y-1">
            <h4 className={`text-xs font-bold uppercase tracking-wider transition-colors ${
              isLight ? "group-hover:text-[#1F4E79]" : "group-hover:text-[#3b82f6]"
            }`}>WhatsApp Slips</h4>
            <p className="text-[10px] text-neutral-400 max-w-md leading-relaxed">
              Opt-in for order booking receipts and payments status logs via WhatsApp secure channels.
            </p>
          </div>
          <div className={`pt-0.5 ${isLight ? "text-[#1F4E79]" : "text-[#3b82f6]"}`}>
            {renderCheckbox(preferences.whatsappUpdates)}
          </div>
        </div>

        {/* Preference Card 4: Order tracking */}
        <div
          className={`flex items-start justify-between gap-6 py-2 opacity-60 border-b pb-6 ${
            isLight ? "border-neutral-200" : "border-neutral-900"
          }`}
        >
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider">Account Security Slips</h4>
            <p className="text-[10px] text-neutral-400 max-w-md leading-relaxed">
              Required system updates regarding OTP login, JWE token verification, and details updates. (Mandatory)
            </p>
          </div>
          <div className="pt-0.5 cursor-not-allowed text-neutral-500">
            {renderCheckbox(preferences.orderTracking)}
          </div>
        </div>

        {/* Save button */}
        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className={`px-6 py-3 font-black tracking-[0.2em] text-[10px] uppercase transition-colors rounded-xl flex items-center justify-center gap-2 cursor-pointer border-0 ${
              isLight 
                ? "bg-[#1F4E79] text-white hover:bg-black" 
                : "bg-[#3b82f6] text-white hover:bg-white hover:text-black"
            }`}
          >
            {isLoading ? (
              <div className="w-3.5 h-3.5 border border-t-transparent border-current animate-spin" />
            ) : isSaved ? (
              <>
                <Check className="w-3.5 h-3.5" />
                PREFERENCES UPDATED
              </>
            ) : (
              "APPLY SETTINGS"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
