"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Crown, Flame, RefreshCw, Clock } from "lucide-react";
import { SectionHeading, Stagger, StaggerItem, Reveal } from "@/components/motion/reveal";
import type { LeaderboardEntry } from "@/lib/data";

// ─── helpers ────────────────────────────────────────────────────────────────

function timeUntilRefresh(computedAt: string | null): string {
  if (!computedAt) return "";
  const nextMs = new Date(computedAt).getTime() + 12 * 60 * 60 * 1000;
  const diffMs = nextMs - Date.now();
  if (diffMs <= 0) return "refreshing soon";
  const h = Math.floor(diffMs / 3_600_000);
  const m = Math.floor((diffMs % 3_600_000) / 60_000);
  return h > 0 ? `~${h}h ${m}m` : `~${m}m`;
}

// ─── sub-components ──────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="glass rounded-xl px-5 py-4 grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 animate-pulse">
      <div className="h-7 w-7 rounded-md bg-frost/10" />
      <div className="space-y-2">
        <div className="h-3.5 w-32 rounded-full bg-frost/10" />
        <div className="h-2.5 w-20 rounded-full bg-frost/8" />
      </div>
      <div className="h-6 w-10 rounded-full bg-frost/10" />
    </div>
  );
}

function RankRow({ entry, index, maxPoints }: { entry: LeaderboardEntry; index: number; maxPoints: number }) {
  const isPodium = entry.rank <= 3;

  return (
    <StaggerItem>
      <motion.div
        whileHover={{ x: 6 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        className={`glass rounded-xl px-5 py-4 grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 ${
          isPodium ? "glass-gold" : ""
        }`}
      >
        <span
          className={`text-numeric text-2xl font-medium ${
            entry.rank === 1 ? "text-gold" : isPodium ? "text-frost" : "text-frost/40"
          }`}
        >
          {String(entry.rank).padStart(2, "0")}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium text-frost">{entry.name}</p>
            {entry.streak >= 4 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-crimson/15 border border-crimson/30 px-2 py-0.5 text-[0.6rem] uppercase tracking-wider text-crimson">
                <Flame className="size-3" aria-hidden="true" /> {entry.streak} streak
              </span>
            )}
          </div>
          <p className="text-[0.68rem] uppercase tracking-[0.16em] text-frost/40">
            {entry.program} · {entry.correct} correct
          </p>
          <div className="mt-2 h-1 rounded-full bg-frost/8 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${(entry.points / maxPoints) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: index * 0.06 }}
              className={`h-full rounded-full ${
                entry.rank === 1
                  ? "bg-gradient-to-r from-gold/60 to-gold"
                  : "bg-gradient-to-r from-crimson/50 to-crimson"
              }`}
            />
          </div>
        </div>
        <span className="text-numeric text-xl text-frost">
          {entry.points}
          <span className="ml-1 text-[0.6rem] uppercase tracking-wider text-frost/40">pts</span>
        </span>
      </motion.div>
    </StaggerItem>
  );
}

// ─── main export ─────────────────────────────────────────────────────────────

export function Leaderboard() {
  const [entries, setEntries] = React.useState<LeaderboardEntry[]>([]);
  const [computedAt, setComputedAt] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        setEntries(data.entries ?? []);
        setComputedAt(data.computedAt ?? null);
      })
      .catch(() => active && setError(true))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const top = entries[0] ?? null;
  const rest = entries.slice(1, 10);
  const maxPoints = top?.points ?? 1;

  return (
    <section id="leaderboard" aria-label="Prediction Leaderboard" className="relative px-6 py-28 md:py-40">
      <div className="mx-auto max-w-4xl">
        <SectionHeading
          kicker="Live Standings"
          title="The Prediction Leaderboard"
          copy="Every correct match winner call earns 3 points. Streaks multiply the glory. Top predictors take home real prizes."
        />

        {loading ? (
          /* skeleton */
          <div className="grid gap-3 mb-8">
            <div className="glass glass-gold rounded-2xl px-8 py-10 animate-pulse">
              <div className="mx-auto h-9 w-9 rounded-full bg-gold/20 mb-4" />
              <div className="mx-auto h-4 w-24 rounded-full bg-frost/10 mb-3" />
              <div className="mx-auto h-7 w-48 rounded-full bg-frost/10" />
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : error ? (
          <Reveal className="mb-8">
            <div className="glass rounded-2xl px-8 py-10 text-center">
              <RefreshCw className="mx-auto size-8 text-frost/30 mb-3" />
              <p className="text-frost/50 text-sm">Could not load standings. Try refreshing the page.</p>
            </div>
          </Reveal>
        ) : entries.length === 0 ? (
          <Reveal className="mb-8">
            <div className="glass rounded-2xl px-8 py-10 text-center">
              <Crown className="mx-auto size-9 text-gold/40 mb-3" />
              <p className="text-frost/60 text-sm font-medium">No predictions yet — be the first!</p>
              <p className="text-frost/35 text-xs mt-1">Head to the Predictions section to make your call.</p>
            </div>
          </Reveal>
        ) : (
          <>
            {/* top predictor spotlight */}
            {top && (
              <Reveal className="mb-10">
                <div className="glass glass-gold relative overflow-hidden rounded-2xl px-8 py-10 text-center">
                  <div
                    className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_-20%,rgba(255,214,10,0.16),transparent)]"
                    aria-hidden="true"
                  />
                  <Crown className="mx-auto size-9 text-gold" aria-hidden="true" />
                  <p className="mt-3 text-[0.7rem] uppercase tracking-[0.3em] text-gold/80">
                    Top Predictor
                  </p>
                  <h3 className="text-display mt-2 text-5xl text-frost">{top.name}</h3>
                  <p className="mt-2 text-frost/50 text-sm">
                    {top.program} —{" "}
                    <span className="text-numeric text-gold">{top.points} pts</span> ·{" "}
                    {top.correct} correct calls
                    {top.streak > 0 && ` · ${top.streak}-match streak`}
                  </p>
                </div>
              </Reveal>
            )}

            <Stagger className="grid gap-3">
              {rest.map((e, i) => (
                <RankRow key={e.rank} entry={e} index={i + 1} maxPoints={maxPoints} />
              ))}
            </Stagger>
          </>
        )}

        <Reveal className="mt-8 text-center">
          <p className="text-frost/40 text-sm flex items-center justify-center gap-1.5">
            <Clock className="size-3.5" aria-hidden="true" />
            {loading
              ? "Loading standings…"
              : computedAt
              ? `Standings refresh every 12 h · Next update in ${timeUntilRefresh(computedAt)}`
              : "Make a prediction to enter the board."}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
