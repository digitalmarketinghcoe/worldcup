"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PartyPopper, Share2, Download, MessageCircle } from "lucide-react";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.62.77-1.62 1.56v1.88h2.76l-.44 2.91h-2.32V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  );
}
import { SectionHeading, Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { COUNTRIES, FIXTURES, PROGRAMS } from "@/lib/data";
import { drawShareCard } from "@/lib/share-card";

type FormState = {
  fullName: string;
  studentId: string;
  program: string;
  matchId: string;
  pick: string;
  champion: string;
};

const INITIAL: FormState = {
  fullName: "",
  studentId: "",
  program: PROGRAMS[0],
  matchId: FIXTURES[0].id,
  pick: "",
  champion: COUNTRIES[0].name,
};

const EASE = [0.16, 1, 0.3, 1] as const;

export function Predictions() {
  const [form, setForm] = React.useState<FormState>(INITIAL);
  const [status, setStatus] = React.useState<"idle" | "submitting" | "success">("idle");
  const [errors, setErrors] = React.useState<string[]>([]);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const fixture = FIXTURES.find((f) => f.id === form.matchId) ?? FIXTURES[0];
  const picks = [fixture.home.name, "Draw", fixture.away.name];

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value, ...(key === "matchId" ? { pick: "" } : {}) }));

  const clientValidate = (): string[] => {
    const errs: string[] = [];
    if (form.fullName.trim().length < 3) errs.push("Enter your full name.");
    if (!/^[A-Za-z0-9/-]{4,20}$/.test(form.studentId.trim()))
      errs.push("Student ID: 4–20 letters, digits, / or -.");
    if (!form.pick) errs.push("Pick a match result.");
    return errs;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = clientValidate();
    if (errs.length) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    setStatus("submitting");
    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.ok) {
        setErrors(data.errors ?? ["Something went wrong. Try again."]);
        setStatus("idle");
        return;
      }
      setStatus("success");
    } catch {
      setErrors(["Network error. Check your connection and try again."]);
      setStatus("idle");
    }
  };

  // Render the share card once we hit the success state
  React.useEffect(() => {
    if (status === "success" && canvasRef.current) {
      drawShareCard(canvasRef.current, {
        name: form.fullName.trim(),
        champion: form.champion,
        match: `${fixture.home.name} vs ${fixture.away.name}`,
        pick: form.pick,
      });
    }
  }, [status, form, fixture]);

  const shareText = `I predicted ${form.champion} to win the FIFA World Cup 2026! ⚽🏆 Make yours at the HCOE Fan Zone — Powered by Himalaya College of Engineering.`;
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";

  const downloadCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = "hcoe-worldcup-prediction.png";
    a.href = canvas.toDataURL("image/png");
    a.click();
  };

  return (
    <section id="predict" className="relative px-6 py-28 md:py-40 overflow-hidden">
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_40%,rgba(217,4,41,0.07),transparent)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-3xl">
        <SectionHeading
          kicker="Prediction Challenge"
          title="Call It Before It Happens"
          copy="Lock in your match result and champion pick. Correct calls earn leaderboard points and a shot at the prize cabinet."
        />

        <AnimatePresence mode="wait">
          {status !== "success" ? (
            <motion.form
              key="form"
              onSubmit={submit}
              exit={{ opacity: 0, y: -24, transition: { duration: 0.35 } }}
              className="glass rounded-3xl p-7 md:p-10 grid gap-6"
              noValidate
            >
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="e.g. Saurav Shrestha"
                    value={form.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                    maxLength={80}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input
                    id="studentId"
                    placeholder="e.g. HCE080BCT001"
                    value={form.studentId}
                    onChange={(e) => set("studentId", e.target.value)}
                    maxLength={20}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="program">Program</Label>
                <Select
                  id="program"
                  value={form.program}
                  onChange={(e) => set("program", e.target.value)}
                >
                  {PROGRAMS.map((p) => (
                    <option key={p} value={p} className="bg-midnight">
                      {p}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="match">Match</Label>
                <Select
                  id="match"
                  value={form.matchId}
                  onChange={(e) => set("matchId", e.target.value)}
                >
                  {FIXTURES.map((f) => (
                    <option key={f.id} value={f.id} className="bg-midnight">
                      {f.home.flag} {f.home.name} vs {f.away.name} {f.away.flag} — {f.stage}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label>Your Call</Label>
                <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Match prediction">
                  {picks.map((p) => (
                    <button
                      key={p}
                      type="button"
                      role="radio"
                      aria-checked={form.pick === p}
                      onClick={() => setForm((f) => ({ ...f, pick: p }))}
                      className={`rounded-xl border px-3 py-4 text-sm font-medium transition-all cursor-pointer ${
                        form.pick === p
                          ? "border-gold bg-gold/12 text-gold scale-[1.03]"
                          : "border-frost/15 text-frost/60 hover:border-frost/35 hover:text-frost"
                      }`}
                    >
                      {p === "Draw" ? "Draw" : `${p} Win`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="champion">Who Lifts The Trophy?</Label>
                <Select
                  id="champion"
                  value={form.champion}
                  onChange={(e) => set("champion", e.target.value)}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.name} className="bg-midnight">
                      {c.flag} {c.name}
                    </option>
                  ))}
                </Select>
              </div>

              {errors.length > 0 && (
                <ul className="rounded-xl border border-crimson/40 bg-crimson/10 px-5 py-4 text-sm text-frost/85 space-y-1" role="alert">
                  {errors.map((err) => (
                    <li key={err}>• {err}</li>
                  ))}
                </ul>
              )}

              <Button type="submit" size="lg" disabled={status === "submitting"} className="w-full">
                {status === "submitting" ? "Locking In…" : "Lock In My Prediction"}
              </Button>
            </motion.form>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 32, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="glass glass-gold rounded-3xl p-7 md:p-10 text-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.2 }}
              >
                <PartyPopper className="mx-auto size-12 text-gold" aria-hidden="true" />
              </motion.div>
              <h3 className="text-display mt-4 text-4xl md:text-5xl text-frost">
                Prediction Locked In
              </h3>
              <p className="mt-3 text-frost/60">
                {form.fullName.trim().split(" ")[0]}, you called{" "}
                <span className="text-gold font-medium">{form.pick}</span> and backed{" "}
                <span className="text-gold font-medium">{form.champion}</span> for the trophy.
              </p>

              <canvas
                ref={canvasRef}
                width={1080}
                height={1350}
                className="mx-auto mt-8 w-full max-w-xs rounded-2xl border border-frost/15 shadow-2xl"
                aria-label="Your shareable prediction card"
              />

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${siteUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-turf/40 bg-turf/10 px-5 py-2.5 text-sm text-turf hover:bg-turf/20 transition-colors"
                >
                  <MessageCircle className="size-4" aria-hidden="true" /> WhatsApp
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}&quote=${encodeURIComponent(shareText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-frost/25 bg-frost/5 px-5 py-2.5 text-sm text-frost hover:bg-frost/15 transition-colors"
                >
                  <FacebookIcon className="size-4" /> Facebook
                </a>
                <button
                  onClick={downloadCard}
                  className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-5 py-2.5 text-sm text-gold hover:bg-gold/20 transition-colors cursor-pointer"
                >
                  <Download className="size-4" aria-hidden="true" /> Instagram Story
                </button>
              </div>

              <button
                onClick={() => {
                  setForm(INITIAL);
                  setStatus("idle");
                }}
                className="mt-7 inline-flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.2em] text-frost/40 hover:text-frost transition-colors cursor-pointer"
              >
                <Share2 className="size-3.5" aria-hidden="true" /> Make another prediction
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <Reveal className="mt-6 text-center" delay={0.15}>
          <p className="text-[0.7rem] uppercase tracking-[0.2em] text-frost/35">
            One entry per match per student · Results verified after full time
          </p>
        </Reveal>
      </div>
    </section>
  );
}
