"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowUpRight } from "lucide-react";
import type { PublicStore } from "@/lib/stores/types";
import { ghostFor, StoreLogo, StoreShell, useStoreTheme } from "./StoreShell";

export default function StoreLoginGate({ store }: { store: PublicStore }) {
  const router = useRouter();
  const [theme] = useStoreTheme();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!password) { setError("Enter the store password."); return; }
    setBusy(true); setError("");
    try {
      const res = await fetch(`/api/stores/${store.slug}/login`, {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password }),
      });
      if (res.ok) { router.refresh(); return; }
      const j = await res.json().catch(() => ({}));
      setError(j?.error || "Could not sign in. Please try again.");
      setPassword("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <StoreShell theme={theme} ghostText={ghostFor(store.name)}>
      <main className="od-gate">
        <form onSubmit={submit} className="od-gate__card rbw-in" aria-labelledby="gate-title" noValidate>
          <StoreLogo store={store} theme={theme} className="od-gate__logo" />
          <h1 id="gate-title" className="rbw-j-label" style={{ marginBottom: 18 }}>Private store · enter password</h1>

          <div style={{ position: "relative", width: "100%" }}>
            <label htmlFor="store-pw" className="sr-only" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Store password</label>
            <input
              id="store-pw" type={show ? "text" : "password"} className="od-gate__field" value={password}
              onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" autoFocus
              placeholder="Password" aria-invalid={!!error} aria-describedby={error ? "gate-err" : undefined}
              style={{ paddingRight: 46 }}
            />
            <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"}
              className="od-iconbtn" style={{ position: "absolute", right: 5, top: 5, height: 38, border: 0 }}>
              {show ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
            </button>
          </div>

          <p id="gate-err" className="od-gate__err" role="alert" aria-live="polite">{error}</p>

          <button type="submit" disabled={busy} className="rbw-cta rbw-j-cta-block" style={{ marginTop: 6, justifyContent: "center", width: "100%" }}>
            <span>{busy ? "Checking" : "Login"}</span>
            {!busy && <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />}
          </button>
        </form>
      </main>
    </StoreShell>
  );
}
