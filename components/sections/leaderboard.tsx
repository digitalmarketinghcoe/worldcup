"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Crown, Flame } from "lucide-react";
import { SectionHeading, Stagger, StaggerItem, Reveal } from "@/components/motion/reveal";
import { LEADERBOARD } from "@/lib/data";

const MAX_POINTS = LEADERBOARD[0].points;

function RankRow({ index }: { index: number }) {
  const entry = LEADERBOARD[index];
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
              whileInView={{ width: `${(entry.points / MAX_POINTS) * 100}%` }}
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

export function Leaderboard() {
  const top = LEADERBOARD[0];

  return (
    <section id="leaderboard" className="relative px-6 py-28 md:py-40">
      <div className="mx-auto max-w-4xl">
        <SectionHeading
          kicker="Live Standings"
          title="The Prediction Leaderboard"
          copy="Every correct call earns points. Streaks multiply them. Top predictors take home real prizes."
        />

        {/* top predictor spotlight */}
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
              {top.program} — <span className="text-numeric text-gold">{top.points} pts</span> ·{" "}
              {top.correct} correct calls · {top.streak}-match streak
            </p>
          </div>
        </Reveal>

        <Stagger className="grid gap-3">
          {LEADERBOARD.slice(1).map((e, i) => (
            <RankRow key={e.rank} index={i + 1} />
          ))}
        </Stagger>

        <Reveal className="mt-8 text-center">
          <p className="text-frost/40 text-sm">
            Standings refresh after every match day. Make a prediction to enter the board.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
