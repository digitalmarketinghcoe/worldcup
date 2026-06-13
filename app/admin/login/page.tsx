"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
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
    <main className="flex min-h-screen items-center justify-center px-6">
      <form onSubmit={submit} className="glass w-full max-w-sm rounded-3xl p-8">
        <Lock className="mx-auto size-9 text-gold" aria-hidden="true" />
        <h1 className="text-display mt-4 text-center text-3xl text-frost">Admin Access</h1>
        <p className="mt-2 text-center text-sm text-frost/50">
          Enter the admin password to view submissions.
        </p>

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

        {error && (
          <p className="mt-4 rounded-lg border border-crimson/40 bg-crimson/10 px-4 py-2.5 text-sm text-frost/85">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" disabled={loading} className="mt-6 w-full">
          {loading ? "Verifying…" : "Sign In"}
        </Button>
      </form>
    </main>
  );
}
