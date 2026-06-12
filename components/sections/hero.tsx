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

// Cinematic load order: darkness → video bg → floodlights → 3D overlay → headline → flags → logo → CTA
const T = {
  videoBg:  0.1,
  lights:   0.4,
  scene:    1.0,
  trophy:   1.2,
  kicker:   1.6,
  headline: 1.9,
  flags:    2.5,
  logo:     2.8,
  cta:      3.1,
};

// Muted looping video helper — handles autoplay policy gracefully
function LoopVideo({
  src,
  className,
  style,
}: {
  src: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = React.useRef<HTMLVideoElement>(null);
  React.useEffect(() => {
    // Trigger play after mount; browsers may suspend autoplay without user gesture
    ref.current?.play().catch(() => {/* silently ignore autoplay block */});
  }, []);
  return (
    <video
      ref={ref}
      src={src}
      autoPlay
      muted
      playsInline
      preload="auto"
      className={className}
      style={style}
      aria-hidden="true"
    />
  );
}

export function Hero() {
  const reduce = useReducedMotion();
  const d = (t: number) => (reduce ? 0 : t);

  const scrollToPredict = () =>
    document.getElementById("predict")?.scrollIntoView({ behavior: "smooth" });
  const scrollToMatches = () =>
    document.getElementById("matches")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section
      className="relative min-h-svh overflow-hidden flex flex-col"
      aria-label="HCOE World Cup Fan Zone hero"
    >
      {/* ── Layer 0: real stadium video background ──────────────────────── */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: d(T.videoBg), duration: 2.2, ease: EASE }}
        aria-hidden="true"
      >
        <LoopVideo
          src="/videos/hero-bg.mp4"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: "brightness(0.38) saturate(1.2)" }}
        />
        {/* dark overlay so the video doesn't compete with text */}
        <div className="absolute inset-0 bg-pitch/55" />
      </motion.div>

      {/* ── Layer 1: CSS stadium beams composite over video ─────────────── */}
      <motion.div
        className="absolute inset-0 z-[1] stadium-beams"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.5, 0.2, 0.85] }}
        transition={{ delay: d(T.lights), duration: 1.6, times: [0, 0.3, 0.45, 1] }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 z-[1] bg-grid-faint" aria-hidden="true" />

      {/* ── Layer 2: trophy reveal video — right-side cinematic panel ────── */}
      <motion.div
        className="absolute inset-0 z-[2] hidden sm:block pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: d(T.trophy), duration: 2.4, ease: EASE }}
        aria-hidden="true"
      >
        <LoopVideo
          src="/videos/trophy-reveal.mp4"
          className="absolute right-0 top-0 h-full w-[62%] object-cover object-center"
          style={{
            maskImage:
              "linear-gradient(to right, transparent 0%, black 38%, black 85%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 38%, black 85%, transparent 100%)",
            filter: "brightness(0.75) saturate(1.3) contrast(1.05)",
            opacity: 0.72,
          }}
        />
      </motion.div>

      {/* ── Layer 3: Three.js — football + particles + pointer parallax ──── */}
      <motion.div
        className="absolute inset-0 z-[3]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: d(T.scene), duration: 1.8, ease: EASE }}
        aria-hidden="true"
      >
        <HeroScene />
      </motion.div>

      {/* ── Layer 4: depth vignette keeps text crisp ─────────────────────── */}
      <div
        className="absolute inset-0 z-[4] bg-[radial-gradient(ellipse_65%_60%_at_50%_48%,transparent_20%,rgba(2,6,23,0.72)_100%)]"
        aria-hidden="true"
      />

      {/* ── Layer 10: hero content ────────────────────────────────────────── */}
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
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: d(T.logo), duration: 1 }}
          className="mt-14 flex flex-col items-center gap-3"
        >
          <span className="text-[0.62rem] uppercase tracking-[0.35em] text-frost/40">Powered by</span>
          <Image
            src="/Himalaya_Logo_White.png"
            alt="Himalaya College of Engineering"
            width={220}
            height={60}
            className="h-32 w-auto opacity-90 drop-shadow-[0_4px_24px_rgba(226,232,240,0.15)]"
            priority
          />
          <span className="text-[0.6rem] uppercase tracking-[0.3em] text-frost/35">
            Himalaya College of Engineering
          </span>
        </motion.div>
      </div>

      {/* ── Layer 10: 48-nation flags ticker ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: d(T.flags), duration: 1 }}
        className="absolute bottom-0 inset-x-0 z-10 overflow-hidden border-t border-frost/10 bg-pitch/70 backdrop-blur-md py-4"
        aria-hidden="true"
      >
        <div className="flex w-max gap-10 animate-ticker">
          {[...COUNTRIES, ...COUNTRIES].map((c, i) => (
            <span
              key={`${c.code}-${i}`}
              className="flex items-center gap-2.5 text-[0.72rem] uppercase tracking-[0.2em] text-frost/50"
            >
              <span className="text-lg">{c.flag}</span>
              {c.name}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
