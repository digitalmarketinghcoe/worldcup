"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [error,    setError]    = React.useState("");
  const [loading,  setLoading]  = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error ?? "Login failed.");
        setLoading(false);
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-pitch flex items-center justify-center px-6 overflow-hidden">
      {/* Background radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 60% 55% at 50% 45%, rgba(255,214,10,0.05) 0%, transparent 70%)",
        }}
      />

      {/* Top accent bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-crimson via-gold to-turf" aria-hidden="true" />

      <form
        onSubmit={submit}
        className="glass relative w-full max-w-sm rounded-2xl p-8"
      >
        {/* Icon */}
        <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-full border border-gold/25 bg-gold/10">
          <Lock className="size-5 text-gold" aria-hidden="true" />
        </div>

        {/* Title */}
        <div className="text-center">
          <p className="mb-1 text-[0.62rem] font-medium uppercase tracking-[0.28em] text-gold/60">
            HCOE · Fan Zone 2026
          </p>
          <h1 className="text-display text-2xl text-frost">Admin Access</h1>
          <p className="mt-1.5 text-sm text-frost/40">
            Enter the admin password to view submissions.
          </p>
        </div>

        {/* Field */}
        <div className="mt-7">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-crimson/30 bg-crimson/8 px-3.5 py-3 text-sm text-frost/80">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-crimson" aria-hidden="true" />
            {error}
          </div>
        )}

        <Button type="submit" size="lg" disabled={loading} className="mt-6 w-full">
          {loading ? "Verifying…" : "Sign In"}
        </Button>
      </form>
    </div>
  );
}
