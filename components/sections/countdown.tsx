"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeading } from "@/components/motion/reveal";
import { TOURNAMENT } from "@/lib/data";

type TimeLeft = { days: number; hours: number; minutes: number; seconds: number };

function getTimeLeft(target: Date): TimeLeft | null {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor(diff / 3_600_000) % 24,
    minutes: Math.floor(diff / 60_000) % 60,
    seconds: Math.floor(diff / 1_000) % 60,
  };
}

function FlipDigit({ value, label }: { value: number; label: string }) {
  const text = String(value).padStart(2, "0");
  return (
    <div className="glass rounded-2xl px-4 py-6 md:px-8 md:py-9 text-center min-w-[5rem] md:min-w-[8.5rem]">
      <div className="relative h-[3.2rem] md:h-[5rem] overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={text}
            initial={{ y: "-100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="text-numeric absolute inset-x-0 text-5xl md:text-7xl font-medium text-frost"
          >
            {text}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-2 block text-[0.65rem] uppercase tracking-[0.28em] text-gold/80">
        {label}
      </span>
    </div>
  );
}

export function Countdown() {
  // Kickoff first; once the tournament starts, count to the final.
  const [target, setTarget] = React.useState<{ date: Date; label: string } | null>(null);
  const [left, setLeft] = React.useState<TimeLeft | null>(null);

  React.useEffect(() => {
    const kickoff = new Date(TOURNAMENT.kickoff);
    const final = new Date(TOURNAMENT.final);
    const t =
      kickoff.getTime() > Date.now()
        ? { date: kickoff, label: "Until Kickoff — Estadio Azteca" }
        : { date: final, label: "Until the Final — MetLife Stadium" };
    // First paint happens on the next frame to avoid a sync setState cascade
    const raf = requestAnimationFrame(() => {
      setTarget(t);
      setLeft(getTimeLeft(t.date));
    });
    const id = setInterval(() => setLeft(getTimeLeft(t.date)), 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(id);
    };
  }, []);

  return (
    <section id="countdown" className="relative px-6 py-28 md:py-36 overflow-hidden">
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(7,17,36,0.9),transparent)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-5xl text-center">
        <SectionHeading
          kicker="The Clock Is Ticking"
          title="History Kicks Off Soon"
          copy={target?.label ?? "Loading the broadcast clock…"}
        />

        {left ? (
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6">
            <FlipDigit value={left.days} label="Days" />
            <FlipDigit value={left.hours} label="Hours" />
            <FlipDigit value={left.minutes} label="Minutes" />
            <FlipDigit value={left.seconds} label="Seconds" />
          </div>
        ) : (
          target && (
            <p className="text-display text-5xl md:text-7xl text-gold-shimmer">
              It&apos;s Match Day
            </p>
          )
        )}
      </div>
    </section>
  );
}
