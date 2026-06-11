"use client";

import { motion } from "framer-motion";
import { Trophy, Medal, Gift, Star } from "lucide-react";
import { SectionHeading, Stagger, StaggerItem } from "@/components/motion/reveal";
import { PRIZES } from "@/lib/data";

const ICONS = [Trophy, Medal, Gift, Star];

const ACCENTS: Record<string, { text: string; glow: string }> = {
  gold: { text: "text-gold", glow: "glass-gold" },
  frost: { text: "text-frost", glow: "" },
  crimson: { text: "text-crimson", glow: "glass-crimson" },
  turf: { text: "text-turf", glow: "" },
};

export function Prizes() {
  return (
    <section id="prizes" className="relative px-6 py-28 md:py-40 bg-grid-faint">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          kicker="Worth Playing For"
          title="The Prize Cabinet"
          copy="Predict well, climb the board, take home more than bragging rights."
        />

        <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {PRIZES.map((p, i) => {
            const Icon = ICONS[i % ICONS.length];
            const accent = ACCENTS[p.accent];
            return (
              <StaggerItem key={p.place}>
                <motion.div
                  whileHover={{ y: -10, rotateX: 3 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  style={{ transformStyle: "preserve-3d" }}
                  className={`glass ${accent.glow} h-full rounded-2xl p-7 flex flex-col`}
                >
                  <Icon className={`size-8 ${accent.text}`} aria-hidden="true" />
                  <p className="mt-5 text-[0.68rem] uppercase tracking-[0.26em] text-frost/45">
                    {p.place}
                  </p>
                  <h3 className={`text-display mt-1.5 text-3xl ${accent.text}`}>{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-frost/55">{p.detail}</p>
                </motion.div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
