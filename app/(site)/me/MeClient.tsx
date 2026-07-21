"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Medal,
  Search,
  Trophy,
  XCircle,
} from "lucide-react";
import { SectionHeading, Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { readIdentityCookie } from "@/lib/identity-cookie";
import type {
  MatchResultDetail,
  MeResponse,
  PendingPrediction,
  PersonalEntry,
} from "@/lib/me-types";

export function MeClient() {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "done">("idle");
  const [result, setResult] = React.useState<MeResponse | null>(null);

  React.useEffect(() => {
    const saved = readIdentityCookie();
    if (!saved) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate the client-only cookie after mount
    setQuery(saved.studentId || saved.fullName);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setStatus("loading");
    try {
      const res = await fetch(`/api/me?q=${encodeURIComponent(q)}`);
      const data: MeResponse = await res.json();
      setResult(data);
    } catch {
      setResult({ status: "service_unavailable" });
    } finally {
      setStatus("done");
    }
  };

  return (
    <section
      aria-label="My Score"
      className="relative px-6 py-28 md:py-40 overflow-hidden"
    >
      <div className="relative mx-auto max-w-2xl">
        <SectionHeading
          kicker="Score Lookup"
          title="My Score"
          copy="Enter your Student ID or full name to see your rank, points, and match history."
        />

        <Reveal>
          <form
            onSubmit={handleSubmit}
            className="glass rounded-3xl p-7 md:p-10 grid gap-5"
            noValidate
          >
            <div>
              <Label htmlFor="meQuery">Student ID or Full Name</Label>
              <Input
                id="meQuery"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. HCE080BCT001 or Saurav Shrestha"
                maxLength={80}
                required
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={status === "loading"}
              className="w-full"
            >
              <Search className="size-4" aria-hidden="true" />
              {status === "loading" ? "Looking up…" : "Look Up My Score"}
            </Button>
          </form>
        </Reveal>

        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="mt-8"
        >
          {status === "done" && result && <ResultPanel result={result} />}
        </div>
      </div>
    </section>
  );
}

function ResultPanel({ result }: { result: MeResponse }) {
  if (result.status === "not_found") {
    return <GlassMessage>No predictions found matching that ID or name.</GlassMessage>;
  }
  if (result.status === "service_unavailable") {
    return (
      <GlassMessage>
        Score lookup is unavailable right now. Try again shortly.
      </GlassMessage>
    );
  }
  if (result.status === "validation_error") {
    return <GlassMessage error>{result.message}</GlassMessage>;
  }
  if (result.status === "ambiguous") {
    return <GlassMessage>{result.message}</GlassMessage>;
  }
  return <PersonalScoreCard entry={result.entry} />;
}

function GlassMessage({
  children,
  error = false,
}: {
  children: React.ReactNode;
  error?: boolean;
}) {
  return (
    <div
      className={`glass rounded-2xl p-6 text-center text-frost/70 ${
        error ? "border-crimson/30 text-crimson/80" : ""
      }`}
    >
      {children}
    </div>
  );
}

function PersonalScoreCard({ entry }: { entry: PersonalEntry }) {
  const rankColor =
    entry.rank === 1
      ? "text-gold border-gold/40 bg-gold/10"
      : entry.rank === 2
        ? "text-frost border-frost/30 bg-frost/8"
        : entry.rank === 3
          ? "text-crimson border-crimson/30 bg-crimson/10"
          : "text-frost/50 border-frost/15 bg-white/5";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass rounded-3xl p-7 md:p-10 grid gap-8"
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-display text-2xl md:text-3xl text-frost flex items-center gap-2">
            <Trophy className="size-6 text-gold" aria-hidden="true" />
            {entry.fullName}
          </p>
          <p className="text-sm text-frost/50 mt-1">
            {entry.program}
            {entry.maskedStudentId ? ` · ${entry.maskedStudentId}` : ""}
          </p>
        </div>
        {entry.rank > 0 && (
          <div
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium flex items-center gap-1.5 ${rankColor}`}
          >
            <Medal className="size-3.5" aria-hidden="true" />#{entry.rank}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCell label="Points" value={entry.totalPoints} accent="gold" />
        <StatCell label="Daily Points" value={entry.matchPoints} />
        <StatCell label="Tournament Points" value={entry.tournamentPoints} />
        {entry.manualAdjustment > 0 && (
          <StatCell
            label="Final Adjustment"
            value={`${entry.manualAdjustment > 0 ? "+" : ""}${entry.manualAdjustment}`}
          />
        )}
        <StatCell label="Correct" value={entry.correctPredictions} />
        <StatCell label="Best Streak" value={entry.bestStreak} />
        <StatCell label="Predictions Scored" value={entry.scoredPredictions} />
        <StatCell label="Incorrect" value={entry.incorrectPredictions} />
        <div className="rounded-xl border border-frost/10 bg-white/5 p-4">
          <p className="text-[0.65rem] uppercase tracking-wider text-frost/40">
            Scoring
          </p>
          <p className="mt-1 text-xs text-frost/60">{entry.scoringRule}</p>
        </div>
      </div>

      {entry.finishedResults.length > 0 && (
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.18em] text-frost/40 mb-3">
            Match Results
          </p>
          <div className="grid gap-2">
            {entry.finishedResults.map((result) => (
              <MatchRow key={result.matchNumber} result={result} />
            ))}
          </div>
        </div>
      )}

      {entry.pendingPredictions.length > 0 && (
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.18em] text-frost/40 mb-3 flex items-center gap-1.5">
            <Clock className="size-3.5" /> Pending
          </p>
          <div className="grid gap-2">
            {entry.pendingPredictions.map((prediction) => (
              <PendingRow
                key={prediction.matchNumber}
                prediction={prediction}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function StatCell({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: "gold";
}) {
  return (
    <div className="rounded-xl border border-frost/10 bg-white/5 p-4">
      <p className="text-[0.65rem] uppercase tracking-wider text-frost/40">
        {label}
      </p>
      <p
        className={`text-2xl font-medium mt-1 ${
          accent === "gold" ? "text-gold" : "text-frost"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function MatchRow({ result }: { result: MatchResultDetail }) {
  const outcomeLabel = (outcome: string, home: string, away: string) =>
    outcome === "home" ? `${home} win` : outcome === "away" ? `${away} win` : "Draw";
  const ResultIcon = result.correct ? CheckCircle2 : XCircle;

  return (
    <div
      className={`rounded-xl border px-4 py-3 grid gap-1 ${
        result.correct
          ? "border-turf/25 bg-turf/5"
          : "border-crimson/20 bg-crimson/5"
      }`}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className="text-sm text-frost/80 flex items-center gap-1.5">
          <ResultIcon
            className={`size-3.5 ${
              result.correct ? "text-turf" : "text-crimson/70"
            }`}
            aria-hidden="true"
          />
          {result.matchLabel}
        </span>
        <span
          className={`text-sm font-medium ${
            result.correct ? "text-turf" : "text-crimson/70"
          }`}
        >
          {result.correct ? "+3 pts" : "—"}
        </span>
      </div>
      <div className="flex gap-4 text-[0.7rem] text-frost/45">
        <span>
          Picked: {outcomeLabel(result.predicted, result.homeTeam, result.awayTeam)}
        </span>
        <span>·</span>
        <span>
          Result: {outcomeLabel(result.actual, result.homeTeam, result.awayTeam)}
        </span>
      </div>
    </div>
  );
}

function PendingRow({ prediction }: { prediction: PendingPrediction }) {
  const label =
    prediction.predicted === "home"
      ? `${prediction.homeTeam} win`
      : prediction.predicted === "away"
        ? `${prediction.awayTeam} win`
        : "Draw";
  return (
    <div className="rounded-xl border border-frost/10 bg-white/5 px-4 py-3 flex items-center justify-between gap-3">
      <span className="text-sm text-frost/70">{prediction.matchLabel}</span>
      <span className="text-[0.7rem] text-frost/40">
        {label} · awaiting result
      </span>
    </div>
  );
}
