"use client";

import React, { useState, useEffect } from "react";
import { Gift, Award, TrendingUp, HelpCircle } from "lucide-react";
import { useTheme } from "../../theme-provider";

export default function RewardsPage() {
  const { theme } = useTheme();
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("shopifyCustomer");
      if (saved) {
        try {
          setCustomer(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse local customer data:", e);
        }
      }
    }
  }, []);

  const ordersList: any[] = customer?.orders || [];
  const totalSpent = ordersList.reduce((acc: number, o: any) => acc + (parseFloat(o.totalPrice) || 0), 0);
  const currentBalance = customer ? Math.round(totalSpent * 0.1) + 100 : 0;

  let tier = "Indigo Member";
  if (totalSpent >= 15000) tier = "Master Craftsman";
  else if (totalSpent >= 5000) tier = "Selvedge Elite";
  else if (customer) tier = "Raw Denim Member";

  // Build dynamic log entries from Shopify orders
  const rewardsLog: { desc: string; points: string; date: string }[] = [];

  ordersList.forEach((order) => {
    const orderDate = new Date(order.processedAt || Date.now()).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const pts = Math.round((parseFloat(order.totalPrice) || 0) * 0.1);
    rewardsLog.push({
      desc: `Purchase Reward - Order #${order.orderNumber}`,
      points: `+${pts}`,
      date: orderDate,
    });
  });

  if (customer) {
    rewardsLog.push({
      desc: "Account Registration Bonus",
      points: "+100",
      date: "Account Created",
    });
  }

  const isLight = theme === "light";

  return (
    <div className={`space-y-8 font-sans antialiased select-none transition-colors duration-300 ${
      isLight ? "bg-white text-black" : "bg-black text-white"
    }`}>
      
      {/* Title */}
      <div className={`border-b pb-4 ${isLight ? "border-neutral-200" : "border-neutral-900"}`}>
        <h2 className="font-serif text-xl font-bold uppercase">
          OnlyDenims Rewards Program
        </h2>
        <p className={`text-[10px] tracking-wider uppercase mt-1 ${
          isLight ? "text-neutral-500" : "text-neutral-450"
        }`}>
          Review your loyalty points logs and membership milestones.
        </p>
      </div>

      {/* Main card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Balance */}
        <div className={`border p-6 rounded-2xl space-y-4 transition-colors ${
          isLight ? "border-neutral-200 bg-neutral-50" : "border-neutral-900 bg-neutral-950"
        }`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isLight ? "bg-[#1F4E79]/5 text-[#1F4E79]" : "bg-[#3b82f6]/10 text-[#3b82f6]"
          }`}>
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-black tracking-widest text-neutral-400 uppercase">
              Current Balance
            </span>
            <div className={`font-serif italic font-bold text-4xl mt-2 ${
              isLight ? "text-[#1F4E79]" : "text-[#3b82f6]"
            }`}>
              {currentBalance} <span className="text-sm font-sans tracking-widest font-black uppercase text-neutral-500">PTS</span>
            </div>
          </div>
        </div>

        {/* Card 2: Status tier */}
        <div className={`border p-6 rounded-2xl space-y-4 transition-colors ${
          isLight ? "border-neutral-200 bg-neutral-50" : "border-neutral-900 bg-neutral-950"
        }`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isLight ? "bg-[#1F4E79]/5 text-[#1F4E79]" : "bg-[#3b82f6]/10 text-[#3b82f6]"
          }`}>
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-black tracking-widest text-neutral-400 uppercase">
              Membership Level
            </span>
            <div className="font-serif italic font-bold text-2xl mt-3">
              {tier}
            </div>
          </div>
        </div>

        {/* Card 3: Next unlock */}
        <div className={`border p-6 rounded-2xl space-y-4 transition-colors ${
          isLight ? "border-neutral-200 bg-neutral-50" : "border-neutral-900 bg-neutral-950"
        }`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isLight ? "bg-[#1F4E79]/5 text-[#1F4E79]" : "bg-[#3b82f6]/10 text-[#3b82f6]"
          }`}>
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-black tracking-widest text-neutral-400 uppercase">
              Next Voucher Unlock
            </span>
            <div className="font-serif italic font-bold text-lg mt-4">
              500 Points (₹250 Off Voucher)
            </div>
          </div>
        </div>

      </div>

      {/* History table */}
      <div className={`border rounded-2xl p-6 space-y-6 ${
        isLight ? "border-neutral-200 bg-white" : "border-neutral-900 bg-neutral-955"
      }`}>
        <h3 className="text-xs font-black tracking-[0.2em] uppercase text-neutral-450">
          Points Activity History
        </h3>

        {rewardsLog.length === 0 ? (
          <p className="text-xs text-neutral-400 py-4">No points activity recorded yet.</p>
        ) : (
          <div className="space-y-4">
            {rewardsLog.map((log, i) => (
              <div
                key={i}
                className={`flex justify-between items-center pb-3 border-b last:border-0 ${
                  isLight ? "border-neutral-100" : "border-neutral-900"
                }`}
              >
                <div>
                  <h4 className="font-semibold text-xs">{log.desc}</h4>
                  <span className="text-[9px] text-neutral-400 font-mono tracking-widest">{log.date}</span>
                </div>
                <span className={`font-mono text-xs font-bold ${
                  isLight ? "text-[#1F4E79]" : "text-[#3b82f6]"
                }`}>
                  {log.points} PTS
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
