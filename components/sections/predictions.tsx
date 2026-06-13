"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { PartyPopper, Share2, Download, MessageCircle, CalendarDays, Trophy } from "lucide-react";

const FootballScene = dynamic(
  () => import("@/components/three/football-scene").then((m) => m.FootballScene),
  { ssr: false }
);

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
import { COUNTRIES, PROGRAMS } from "@/lib/data";
import { drawShareCard } from "@/lib/share-card";

const EASE = [0.16, 1, 0.3, 1] as const;
const COUNTRY_NAMES = new Set(COUNTRIES.map((c) => c.name));

// ─────────────────────────────────────────────────────────────────────────────
// Shared bits
// ─────────────────────────────────────────────────────────────────────────────

function ErrorList({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null;
  return (
    <ul
      className="rounded-xl border border-crimson/40 bg-crimson/10 px-5 py-4 text-sm text-frost/85 space-y-1"
      role="alert"
    >
      {errors.map((err) => (
        <li key={err}>• {err}</li>
      ))}
    </ul>
  );
}

function Textarea({
  id,
  placeholder,
  value,
  onChange,
  maxLength,
  rows = 4,
  required,
}: {
  id?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  maxLength?: number;
  rows?: number;
  required?: boolean;
}) {
  return (
    <textarea
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      maxLength={maxLength}
      rows={rows}
      required={required}
      className="w-full rounded-xl border border-frost/15 bg-white/5 px-4 py-3 text-sm text-frost placeholder:text-frost/35 backdrop-blur-sm transition-colors focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30 resize-none"
    />
  );
}

// Identity fields shared by both forms.
type Identity = { fullName: string; studentId: string; program: string };

function IdentityFields({
  value,
  onChange,
}: {
  value: Identity;
  onChange: (patch: Partial<Identity>) => void;
}) {
  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            placeholder="e.g. Saurav Shrestha"
            value={value.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            maxLength={80}
            required
          />
        </div>
        <div>
          <Label htmlFor="program">Program</Label>
          <Select
            id="program"
            value={value.program}
            onChange={(e) => onChange({ program: e.target.value })}
          >
            {PROGRAMS.map((p) => (
              <option key={p} value={p} className="bg-midnight">
                {p}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="studentId">
          Student ID{value.program === "Faculty" ? " (optional)" : ""}
        </Label>
        <Input
          id="studentId"
          placeholder={value.program === "Faculty" ? "Optional for faculty" : "e.g. HCE080BCT001"}
          value={value.studentId}
          onChange={(e) => onChange({ studentId: e.target.value })}
          maxLength={20}
          required={value.program !== "Faculty"}
        />
      </div>
    </>
  );
}

function validateIdentity(id: Identity): string[] {
  const errs: string[] = [];
  if (id.fullName.trim().length < 3) errs.push("Enter your full name.");
  if (!PROGRAMS.includes(id.program)) errs.push("Select a valid program.");

  // Student ID is optional for faculty; if present it must still be well-formed.
  const sid = id.studentId.trim();
  const isFaculty = id.program === "Faculty";
  if ((!isFaculty || sid) && !/^[A-Za-z0-9/-]{4,20}$/.test(sid))
    errs.push("Student ID: 4–20 letters, digits, / or -.");
  return errs;
}

// ─────────────────────────────────────────────────────────────────────────────
// Form 1 — Daily Match prediction (one entry per match)
// ─────────────────────────────────────────────────────────────────────────────

type TodayFixture = {
  eventId: string;
  matchNumber: number;
  stage: string;
  group: string | null;
  kickoff: string;
  venue: string;
  city: string;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  label: string;
};

function formatKickoff(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", {
    timeZone: "Asia/Kathmandu",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DailyMatchForm() {
  const [identity, setIdentity] = React.useState<Identity>({
    fullName: "",
    studentId: "",
    program: PROGRAMS[0],
  });
  const [fixtures, setFixtures] = React.useState<TodayFixture[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [eventId, setEventId] = React.useState<string | null>(null);
  const [outcome, setOutcome] = React.useState<"home" | "draw" | "away" | null>(null);
  const [status, setStatus] = React.useState<"idle" | "submitting" | "success">("idle");
  const [errors, setErrors] = React.useState<string[]>([]);

  React.useEffect(() => {
    let active = true;
    fetch("/api/fixtures/today")
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        const list: TodayFixture[] = data.fixtures ?? [];
        setFixtures(list);
        if (list.length) setEventId(list[0].eventId);
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const selected = fixtures.find((f) => f.eventId === eventId) ?? null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateIdentity(identity);
    if (eventId == null) errs.push("Pick a match to predict.");
    if (outcome == null) errs.push("Pick who you think wins.");
    if (errs.length) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    setStatus("submitting");
    try {
      const res = await fetch("/api/predict/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: identity.fullName,
          studentId: identity.studentId,
          program: identity.program,
          eventId,
          outcome,
        }),
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

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="glass glass-gold rounded-3xl p-7 md:p-10 text-center"
      >
        <PartyPopper className="mx-auto size-11 text-gold" aria-hidden="true" />
        <h3 className="text-display mt-4 text-3xl md:text-4xl text-frost">Prediction Locked In</h3>
        {selected && (
          <p className="mt-3 text-frost/65">
            You backed{" "}
            <span className="text-gold font-medium">
              {outcome === "home"
                ? `${selected.homeFlag} ${selected.homeTeam} to win`
                : outcome === "away"
                ? `${selected.awayFlag} ${selected.awayTeam} to win`
                : "a Draw"}
            </span>
            {" "} in {selected.homeTeam} vs {selected.awayTeam}.
          </p>
        )}
        <p className="mt-2 text-[0.7rem] uppercase tracking-[0.2em] text-gold/60">+3 pts if correct</p>
        <button
          onClick={() => {
            setOutcome(null);
            setStatus("idle");
          }}
          className="mt-7 inline-flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.2em] text-frost/40 hover:text-frost transition-colors cursor-pointer"
        >
          <Share2 className="size-3.5" aria-hidden="true" /> Predict another match
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} className="glass rounded-3xl p-7 md:p-10 grid gap-6" noValidate>
      <IdentityFields value={identity} onChange={(p) => setIdentity((i) => ({ ...i, ...p }))} />

      <div>
        <Label>Today&apos;s Matches</Label>
        {loading ? (
          <div className="rounded-xl border border-frost/10 bg-white/5 px-4 py-6 text-center text-sm text-frost/45">
            Loading today&apos;s fixtures…
          </div>
        ) : fixtures.length === 0 ? (
          <div className="rounded-xl border border-frost/10 bg-white/5 px-4 py-6 text-center text-sm text-frost/55">
            No World Cup matches scheduled today. Check back tomorrow — or lock in your tournament
            predictions on the next tab.
          </div>
        ) : (
          <div className="grid gap-3">
            {fixtures.map((f) => {
              const active = f.eventId === eventId;
              return (
                <button
                  key={f.eventId}
                  type="button"
                  onClick={() => { setEventId(f.eventId); setOutcome(null); }}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors cursor-pointer ${
                    active
                      ? "border-gold/60 bg-gold/10"
                      : "border-frost/12 bg-white/5 hover:border-frost/30"
                  }`}
                >
                  <span className="flex items-center gap-2 text-sm text-frost">
                    <span>{f.homeFlag}</span>
                    <span className="font-medium">{f.homeTeam}</span>
                    <span className="text-frost/40">vs</span>
                    <span className="font-medium">{f.awayTeam}</span>
                    <span>{f.awayFlag}</span>
                  </span>
                  <span className="text-[0.7rem] uppercase tracking-wider text-frost/45">
                    {formatKickoff(f.kickoff)} · {f.group ?? f.stage}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selected && (
        <div>
          <Label>Who wins?</Label>
          <div className="grid grid-cols-3 gap-3 mt-1">
            {([
              { id: "home", flag: selected.homeFlag, label: selected.homeTeam },
              { id: "draw", flag: "🤝", label: "Draw" },
              { id: "away", flag: selected.awayFlag, label: selected.awayTeam },
            ] as { id: "home" | "draw" | "away"; flag: string; label: string }[]).map(({ id, flag, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setOutcome(id)}
                className={`flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 transition-all cursor-pointer ${
                  outcome === id
                    ? "border-gold bg-gold/15 shadow-[0_0_18px_rgba(255,214,10,0.25)]"
                    : "border-frost/12 bg-white/5 hover:border-frost/30 hover:bg-white/10"
                }`}
              >
                <span className="text-3xl">{flag}</span>
                <span className={`text-xs font-medium text-center leading-tight ${
                  outcome === id ? "text-gold" : "text-frost/70"
                }`}>{label}</span>
                {outcome === id && (
                  <span className="text-[0.6rem] uppercase tracking-widest text-gold/80">✓ picked</span>
                )}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[0.65rem] text-frost/35 text-center">Correct pick earns +3 points</p>
        </div>
      )}

      <ErrorList errors={errors} />

      <Button
        type="submit"
        size="lg"
        disabled={status === "submitting" || fixtures.length === 0 || outcome == null}
        className="w-full"
      >
        {status === "submitting" ? "Locking In…" : "Lock In My Pick"}
      </Button>

      <p className="text-center text-[0.7rem] uppercase tracking-[0.2em] text-frost/35">
        One prediction per match · Predict before kickoff · 3 pts per correct pick
      </p>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Form 2 — Tournament Final prediction (one entry per student)
// ─────────────────────────────────────────────────────────────────────────────

type FinalState = {
  fullName: string;
  studentId: string;
  program: string;
  goldenBall: string;
  goldenBoot: string;
  youngPlayer: string;
  goldenGloves: string;
  finalScore: string;
  finalTeam: string;
  finalMatchGoalScorer: string;
  bestXI: string;
  firstPlace: string;
  secondPlace: string;
  thirdPlace: string;
};

const FINAL_INITIAL: FinalState = {
  fullName: "",
  studentId: "",
  program: PROGRAMS[0],
  goldenBall: "",
  goldenBoot: "",
  youngPlayer: "",
  goldenGloves: "",
  finalScore: "",
  finalTeam: COUNTRIES[0].name,
  finalMatchGoalScorer: "",
  bestXI: "",
  firstPlace: COUNTRIES[0].name,
  secondPlace: COUNTRIES[1].name,
  thirdPlace: COUNTRIES[2].name,
};

function FinalPredictionForm() {
  const [form, setForm] = React.useState<FinalState>(FINAL_INITIAL);
  const [status, setStatus] = React.useState<"idle" | "submitting" | "success">("idle");
  const [errors, setErrors] = React.useState<string[]>([]);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const set = <K extends keyof FinalState>(key: K, value: FinalState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const clientValidate = (): string[] => {
    const errs = validateIdentity(form);

    if (!form.goldenBall.trim()) errs.push("Enter a Golden Ball pick.");
    else if (form.goldenBall.trim().length > 80) errs.push("Golden Ball: max 80 characters.");

    if (!form.goldenBoot.trim()) errs.push("Enter a Golden Boot pick.");
    else if (form.goldenBoot.trim().length > 80) errs.push("Golden Boot: max 80 characters.");

    if (!form.youngPlayer.trim()) errs.push("Enter a Young Player pick.");
    else if (form.youngPlayer.trim().length > 80) errs.push("Young Player: max 80 characters.");

    if (!form.goldenGloves.trim()) errs.push("Enter a Golden Gloves pick.");
    else if (form.goldenGloves.trim().length > 80) errs.push("Golden Gloves: max 80 characters.");

    if (!form.finalScore.trim()) errs.push("Enter the final score prediction.");
    else if (form.finalScore.trim().length > 80) errs.push("Final score: max 80 characters.");

    if (!COUNTRY_NAMES.has(form.finalTeam)) errs.push("Select a valid World Cup winner.");

    if (!form.finalMatchGoalScorer.trim()) errs.push("Enter a final match goal scorer.");
    else if (form.finalMatchGoalScorer.trim().length > 80)
      errs.push("Goal scorer: max 80 characters.");

    if (!form.bestXI.trim()) errs.push("Enter your Best XI.");
    else if (form.bestXI.trim().length > 600) errs.push("Best XI: max 600 characters.");

    if (!COUNTRY_NAMES.has(form.firstPlace)) errs.push("Select a valid 1st place country.");
    if (!COUNTRY_NAMES.has(form.secondPlace)) errs.push("Select a valid 2nd place country.");
    if (!COUNTRY_NAMES.has(form.thirdPlace)) errs.push("Select a valid 3rd place country.");

    if (
      COUNTRY_NAMES.has(form.firstPlace) &&
      COUNTRY_NAMES.has(form.secondPlace) &&
      COUNTRY_NAMES.has(form.thirdPlace) &&
      new Set([form.firstPlace, form.secondPlace, form.thirdPlace]).size < 3
    ) {
      errs.push("1st, 2nd, and 3rd place must be three different countries.");
    }

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

  React.useEffect(() => {
    if (status === "success" && canvasRef.current) {
      drawShareCard(canvasRef.current, {
        name: form.fullName.trim(),
        firstPlace: form.firstPlace,
        goldenBall: form.goldenBall.trim(),
        finalScore: form.finalScore.trim(),
      });
    }
  }, [status, form]);

  const shareText = `I predicted ${form.firstPlace} to win FIFA World Cup 2026 with ${form.goldenBall} taking the Golden Ball! ⚽🏆 Make yours at the HCOE Fan Zone — Powered by Himalaya College of Engineering.`;
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";

  const downloadCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = "hcoe-worldcup-prediction.png";
    a.href = canvas.toDataURL("image/png");
    a.click();
  };

  if (status === "success") {
    return (
      <motion.div
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
        <h3 className="text-display mt-4 text-4xl md:text-5xl text-frost">Prediction Locked In</h3>
        <p className="mt-3 text-frost/60">
          {form.fullName.trim().split(" ")[0]}, you backed{" "}
          <span className="text-gold font-medium">{form.firstPlace}</span> to win and called{" "}
          <span className="text-gold font-medium">{form.goldenBall}</span> for the Golden Ball.
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
            setForm(FINAL_INITIAL);
            setStatus("idle");
          }}
          className="mt-7 inline-flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.2em] text-frost/40 hover:text-frost transition-colors cursor-pointer"
        >
          <Share2 className="size-3.5" aria-hidden="true" /> Make another prediction
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} className="glass rounded-3xl p-7 md:p-10 grid gap-6" noValidate>
      <IdentityFields
        value={form}
        onChange={(p) => setForm((f) => ({ ...f, ...p }))}
      />

      {/* Tournament Awards */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Label htmlFor="goldenBall">Golden Ball (Best Player)</Label>
          <Input
            id="goldenBall"
            placeholder="e.g. Kylian Mbappé"
            value={form.goldenBall}
            onChange={(e) => set("goldenBall", e.target.value)}
            maxLength={80}
            required
          />
        </div>
        <div>
          <Label htmlFor="goldenBoot">Golden Boot (Top Scorer)</Label>
          <Input
            id="goldenBoot"
            placeholder="e.g. Erling Haaland"
            value={form.goldenBoot}
            onChange={(e) => set("goldenBoot", e.target.value)}
            maxLength={80}
            required
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Label htmlFor="youngPlayer">Young Player Award</Label>
          <Input
            id="youngPlayer"
            placeholder="e.g. Lamine Yamal"
            value={form.youngPlayer}
            onChange={(e) => set("youngPlayer", e.target.value)}
            maxLength={80}
            required
          />
        </div>
        <div>
          <Label htmlFor="goldenGloves">Golden Gloves (Best Keeper)</Label>
          <Input
            id="goldenGloves"
            placeholder="e.g. Alisson Becker"
            value={form.goldenGloves}
            onChange={(e) => set("goldenGloves", e.target.value)}
            maxLength={80}
            required
          />
        </div>
      </div>

      {/* Final Predictions */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Label htmlFor="finalScore">Final Score</Label>
          <Input
            id="finalScore"
            placeholder="e.g. Argentina 2–1 France"
            value={form.finalScore}
            onChange={(e) => set("finalScore", e.target.value)}
            maxLength={80}
            required
          />
        </div>
        <div>
          <Label htmlFor="finalTeam">World Cup Winner</Label>
          <Select
            id="finalTeam"
            value={form.finalTeam}
            onChange={(e) => set("finalTeam", e.target.value)}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.name} className="bg-midnight">
                {c.flag} {c.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="finalMatchGoalScorer">Final Match Goal Scorer</Label>
        <Input
          id="finalMatchGoalScorer"
          placeholder="e.g. Vinicius Jr."
          value={form.finalMatchGoalScorer}
          onChange={(e) => set("finalMatchGoalScorer", e.target.value)}
          maxLength={80}
          required
        />
      </div>

      {/* Podium */}
      <div className="grid gap-6 md:grid-cols-3">
        <div>
          <Label htmlFor="firstPlace">🥇 1st Place</Label>
          <Select
            id="firstPlace"
            value={form.firstPlace}
            onChange={(e) => set("firstPlace", e.target.value)}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.name} className="bg-midnight">
                {c.flag} {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="secondPlace">🥈 2nd Place</Label>
          <Select
            id="secondPlace"
            value={form.secondPlace}
            onChange={(e) => set("secondPlace", e.target.value)}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.name} className="bg-midnight">
                {c.flag} {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="thirdPlace">🥉 3rd Place</Label>
          <Select
            id="thirdPlace"
            value={form.thirdPlace}
            onChange={(e) => set("thirdPlace", e.target.value)}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.name} className="bg-midnight">
                {c.flag} {c.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Best XI */}
      <div>
        <Label htmlFor="bestXI">Your Best XI</Label>
        <Textarea
          id="bestXI"
          placeholder={"List your 11 players, one per line:\ne.g. Alisson · Trent · Rúben Dias · Virgil · Robertson · Rodri · Bellingham · Pedri · Salah · Mbappé · Vinicius"}
          value={form.bestXI}
          onChange={(e) => set("bestXI", e.target.value)}
          maxLength={600}
          rows={5}
          required
        />
      </div>

      <ErrorList errors={errors} />

      <Button type="submit" size="lg" disabled={status === "submitting"} className="w-full">
        {status === "submitting" ? "Locking In…" : "Lock In My Prediction"}
      </Button>

      <p className="text-center text-[0.7rem] uppercase tracking-[0.2em] text-frost/35">
        One tournament entry per student · Awards verified after the Final
      </p>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Section shell — slidable tabbed container
// ─────────────────────────────────────────────────────────────────────────────

type Tab = "daily" | "final";

const TABS: { id: Tab; label: string; icon: typeof CalendarDays }[] = [
  { id: "daily", label: "Daily Match", icon: CalendarDays },
  { id: "final", label: "Tournament Final", icon: Trophy },
];

const slideVariants = {
  enter: (d: number) => ({ opacity: 0, x: d >= 0 ? 80 : -80 }),
  center: { opacity: 1, x: 0 },
  exit: (d: number) => ({ opacity: 0, x: d >= 0 ? -80 : 80 }),
};

export function Predictions() {
  const [tab, setTab] = React.useState<Tab>("daily");
  const [dir, setDir] = React.useState(0);

  const switchTab = (next: Tab) => {
    if (next === tab) return;
    setDir(next === "final" ? 1 : -1);
    setTab(next);
  };

  return (
    <section id="predict" className="relative px-6 py-28 md:py-40 overflow-hidden">
      {/* 3D football — floats left side behind form */}
      <div
        className="absolute -left-20 top-1/2 -translate-y-1/2 w-[420px] h-[420px] opacity-25 pointer-events-none hidden lg:block"
        aria-hidden="true"
      >
        <FootballScene />
      </div>
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_40%,rgba(217,4,41,0.07),transparent)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-3xl">
        <SectionHeading
          kicker="Prediction Challenge"
          title="Call the Tournament"
          copy="Two ways to play: predict today's match scores, or lock in your full-tournament awards and podium. The most accurate predictions win prizes."
        />

        {/* Segmented tab control */}
        <div className="mx-auto mb-8 flex w-full max-w-md rounded-full border border-frost/12 bg-white/5 p-1 backdrop-blur-sm">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => switchTab(id)}
                className={`relative flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                  active ? "text-pitch" : "text-frost/60 hover:text-frost"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="predict-tab-pill"
                    className="absolute inset-0 rounded-full bg-gold"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <Icon className="relative size-4" aria-hidden="true" />
                <span className="relative">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Slidable panels */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.div
              key={tab}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: EASE }}
            >
              {tab === "daily" ? <DailyMatchForm /> : <FinalPredictionForm />}
            </motion.div>
          </AnimatePresence>
        </div>

        <Reveal className="mt-6 text-center" delay={0.15}>
          <p className="text-[0.7rem] uppercase tracking-[0.2em] text-frost/35">
            Daily picks: one per match · Tournament entry: one per student
          </p>
        </Reveal>
      </div>
    </section>
  );
}
