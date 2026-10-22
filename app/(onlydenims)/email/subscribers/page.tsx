"use client";

import React, { useState } from "react";
import axios from "axios";
import { Lock, Download, ShieldCheck, Mail, ArrowLeft, User, KeyRound, Eye, EyeOff, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function EmailSubscribersPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [subscribers, setSubscribers] = useState<Array<{ email: string; subscribedAt: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter both Username and Password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await axios.post("/api/newsletter/export-csv", {
        username: username.trim(),
        adminKey: password.trim(),
      });
      // If res succeeded, credentials are valid! Fetch subscriber list
      const listRes = await axios.post("/api/newsletter/list-subscribers", {
        username: username.trim(),
        adminKey: password.trim(),
      });
      setSubscribers(listRes.data?.subscribers || []);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid Username or Password.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const response = await axios.post(
        "/api/newsletter/export-csv",
        { username: username.trim(), adminKey: password.trim() },
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `onlydenims_subscribers_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to download CSV.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917] flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Background ambient gold glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#B9965A]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl bg-[#FDFBF7] border border-[#E8E3DA] rounded-3xl p-7 sm:p-10 shadow-2xl relative z-10 transition-all duration-300">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-[#E8E3DA] mb-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-bold text-[#78716C] hover:text-[#1C1917] uppercase tracking-widest transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 text-[#B9965A] group-hover:-translate-x-1 transition-transform" />
            <span>MAIN STORE</span>
          </Link>

          <div className="flex items-center gap-2 text-[10px] font-extrabold tracking-widest text-[#855B14] uppercase bg-[#FAF3E0] px-3.5 py-1.5 rounded-full border border-[#E5D2A6] shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#B9965A]" />
            <span>SECURE SUBSCRIBERS PORTAL</span>
          </div>
        </div>

        {!isAuthenticated ? (
          <form onSubmit={handleLogin} className="space-y-5 py-2">
            {/* Header Lock Branding */}
            <div className="text-center space-y-2.5">
              <div className="w-16 h-16 rounded-2xl bg-[#F4EFE6] flex items-center justify-center mx-auto mb-3 border border-[#E5D2A6] text-[#B9965A] shadow-inner relative group">
                <Lock className="w-7 h-7 group-hover:scale-110 transition-transform" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#B9965A] rounded-full border-2 border-white animate-pulse" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-wider uppercase text-[#1C1917]">
                AUTHENTICATION
              </h1>
              <p className="text-xs text-[#78716C] max-w-sm mx-auto leading-relaxed">
                Enter your administrative credentials to unlock newsletter subscriber data.
              </p>
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold text-center flex items-center justify-center gap-2 animate-in fade-in duration-200">
                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-[10.5px] font-bold uppercase tracking-widest text-[#78716C] ml-1">
                USERNAME
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#A8A29E] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username..."
                  className="w-full bg-white border border-[#E2DDD5] focus:border-[#1C1917] rounded-2xl pl-11 pr-4 py-3.5 text-xs font-semibold text-[#1C1917] placeholder-[#A8A29E] outline-none transition-all shadow-xs"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-[10.5px] font-bold uppercase tracking-widest text-[#78716C] ml-1">
                PASSWORD
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#A8A29E] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secret password"
                  className="w-full bg-white border border-[#E2DDD5] focus:border-[#1C1917] rounded-2xl pl-11 pr-11 py-3.5 text-xs font-semibold text-[#1C1917] placeholder-[#A8A29E] outline-none transition-all shadow-xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-[#1C1917] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#1C1917] hover:bg-black text-white font-extrabold text-xs uppercase tracking-[0.2em] rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              <Sparkles className="w-4 h-4 text-[#B9965A]" />
              <span>{loading ? "VERIFYING CREDENTIALS..." : "VERIFY & UNLOCK DATA"}</span>
            </button>
          </form>
        ) : (
          /* Authenticated Dashboard View */
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-[#F4EFE6]/80 p-5 rounded-2xl border border-[#E5D2A6]">
              <div>
                <p className="text-[10px] font-bold text-[#78716C] uppercase tracking-widest">TOTAL SUBSCRIBERS</p>
                <p className="text-3xl font-extrabold text-[#1C1917] mt-1">{subscribers.length}</p>
              </div>
              <button
                onClick={handleDownloadCSV}
                className="px-5 py-3.5 bg-[#1C1917] hover:bg-black text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#B9965A]" />
                <span>EXPORT CSV</span>
              </button>
            </div>

            <div className="space-y-3">
              <h2 className="text-xs font-bold tracking-widest text-[#78716C] uppercase">SUBSCRIBER LOGS</h2>
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {subscribers.length === 0 ? (
                  <p className="text-xs text-[#78716C] text-center py-6">No subscribers found yet.</p>
                ) : (
                  subscribers.map((sub, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-white border border-[#E8E3DA] rounded-xl flex items-center justify-between text-xs shadow-2xs"
                    >
                      <span className="font-semibold text-[#1C1917] flex items-center gap-2.5">
                        <Mail className="w-3.5 h-3.5 text-[#B9965A]" />
                        <span>{sub.email}</span>
                      </span>
                      <span className="text-[10px] text-[#78716C] font-medium">
                        {new Date(sub.subscribedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={() => {
                setIsAuthenticated(false);
                setUsername("");
                setPassword("");
              }}
              className="w-full py-3 bg-[#F4EFE6] hover:bg-[#E8E3DA] text-xs font-bold text-[#57534E] hover:text-[#1C1917] uppercase tracking-widest rounded-2xl transition-all border border-[#E8E3DA] cursor-pointer"
            >
              LOCK & LOG OUT
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
