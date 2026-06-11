"use client";

import * as React from "react";
import { motion, useInView } from "framer-motion";
import { SectionHeading, Stagger, StaggerItem } from "@/components/motion/reveal";
import { TOURNAMENT } from "@/lib/data";

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    if (!inView) return;
    const duration = 1600;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);

  return (
    <span ref={ref} className="text-numeric">
      {value}
      {suffix}
    </span>
  );
}

const STATS = [
  { value: TOURNAMENT.teams, label: "Nations", suffix: "" },
  { value: TOURNAMENT.matches, label: "Matches", suffix: "" },
  { value: TOURNAMENT.venues, label: "Stadiums", suffix: "" },
  { value: 3, label: "Host Countries", suffix: "" },
];

export function Intro() {
  return (
    <section id="intro" className="relative px-6 py-28 md:py-40">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          kicker="The Biggest World Cup Ever"
          title="One Tournament. Three Nations. Infinite Drama."
          copy="For the first time in history, 48 teams battle across USA, Canada and Mexico. HCOE brings every kick, save and screamer to campus."
        />

        <Stagger className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {STATS.map((s) => (
            <StaggerItem key={s.label}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="glass glass-gold rounded-2xl px-6 py-10 text-center"
              >
                <span className="text-display block text-6xl md:text-7xl text-gold">
                  <CountUp target={s.value} suffix={s.suffix} />
                </span>
                <span className="mt-3 block text-[0.72rem] uppercase tracking-[0.24em] text-frost/55">
                  {s.label}
                </span>
              </motion.div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
