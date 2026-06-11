"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { COUNTRIES } from "@/lib/data";

const HeroScene = dynamic(
  () => import("@/components/three/hero-scene").then((m) => m.HeroScene),
  { ssr: false }
);

const EASE = [0.16, 1, 0.3, 1] as const;

// Cinematic load order: darkness → floodlights → 3D scene → headline → flags → logo → CTA
const T = {
  lights: 0.3,
  scene: 0.9,
  kicker: 1.4,
  headline: 1.7,
  flags: 2.4,
  logo: 2.7,
  cta: 3.0,
};

export function Hero() {
  const reduce = useReducedMotion();
  const d = (t: number) => (reduce ? 0 : t);

  const scrollToPredict = () => {
    document.getElementById("predict")?.scrollIntoView({ behavior: "smooth" });
  };
  const scrollToMatches = () => {
    document.getElementById("matches")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-svh overflow-hidden flex flex-col" aria-label="HCOE World Cup Fan Zone hero">
      {/* floodlights switch on */}
      <motion.div
        className="absolute inset-0 stadium-beams"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.4, 0.15, 1] }}
        transition={{ delay: d(T.lights), duration: 1.4, times: [0, 0.3, 0.45, 1] }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-grid-faint" aria-hidden="true" />

      {/* 3D stage */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: d(T.scene), duration: 1.6, ease: EASE }}
      >
        <HeroScene />
      </motion.div>

      {/* vignette to keep text legible over the scene */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_45%,transparent_30%,rgba(2,6,23,0.78)_100%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pt-24 pb-36 text-center">
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: d(T.kicker), duration: 0.8, ease: EASE }}
          className="inline-flex items-center gap-2 rounded-full border border-crimson/40 bg-crimson/10 px-5 py-2 text-[0.72rem] font-medium uppercase tracking-[0.26em] text-frost"
        >
          <span className="size-1.5 rounded-full bg-turf animate-pulse-dot" />
          USA · Canada · Mexico — June 11 to July 19, 2026
        </motion.p>

        <h1
          className="text-display mt-8 text-frost"
          style={{ fontSize: "var(--fs-hero)" }}
        >
          <motion.span
            className="block"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: d(T.headline), duration: 1, ease: EASE }}
          >
            Engineering
          </motion.span>
          <motion.span
            className="block text-gold-shimmer"
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: d(T.headline + 0.15), duration: 1, ease: EASE }}
          >
            Meets Football
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: d(T.headline + 0.45), duration: 0.9, ease: EASE }}
          className="mt-7 max-w-xl text-frost/60 leading-relaxed"
          style={{ fontSize: "var(--fs-lead)" }}
        >
          The World Cup lands at Himalaya College of Engineering. Predict matches,
          climb the leaderboard, win real prizes.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: d(T.cta), duration: 0.8, ease: EASE }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Button magnetic size="lg" onClick={scrollToPredict}>
            Make Your Prediction
          </Button>
          <Button variant="ghost" size="lg" onClick={scrollToMatches}>
            Match Center
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: d(T.logo), duration: 1 }}
          className="mt-12 flex items-center gap-3 text-frost/45"
        >
          <span className="text-[0.7rem] uppercase tracking-[0.3em]">Powered by</span>
          <Image
            src="/Himalaya_Logo_White.png"
            alt="Himalaya College of Engineering"
            width={132}
            height={36}
            className="h-8 w-auto opacity-80"
            priority
          />
        </motion.div>
      </div>

      {/* national flags ticker */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: d(T.flags), duration: 1 }}
        className="absolute bottom-0 inset-x-0 z-10 overflow-hidden border-t border-frost/10 bg-pitch/70 backdrop-blur-md py-4"
        aria-hidden="true"
      >
        <div className="flex w-max gap-12 animate-ticker">
          {[...COUNTRIES, ...COUNTRIES].map((c, i) => (
            <span
              key={`${c.code}-${i}`}
              className="flex items-center gap-3 text-sm uppercase tracking-[0.2em] text-frost/55"
            >
              <span className="text-xl">{c.flag}</span>
              {c.name}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
