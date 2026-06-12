"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { SectionHeading, Stagger, StaggerItem, Reveal } from "@/components/motion/reveal";
import { HCOE_SHOWCASE } from "@/lib/data";

export function HcoeShowcase() {
  return (
    <section id="hcoe" className="relative px-6 py-28 md:py-40 overflow-hidden">
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_120%,rgba(7,17,36,1),transparent)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-6xl">
        <SectionHeading
          kicker="HCOE Beyond The Classroom"
          title="We Don't Just Teach Engineering. We Build Arenas For It."
          copy="The same energy powering this fan zone runs through every lab, club and tournament at Himalaya College of Engineering."
        />

        <Stagger className="grid gap-5 md:grid-cols-2">
          {HCOE_SHOWCASE.map((item) => (
            <StaggerItem key={item.title}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 280, damping: 22 }}
                className="glass rounded-2xl p-8 flex items-start gap-6"
              >
                <span className="text-display text-5xl text-gold shrink-0 text-numeric">
                  {item.stat}
                </span>
                <div>
                  <h3 className="text-display text-2xl text-frost">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-frost/55">{item.copy}</p>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal className="mt-16 text-center" delay={0.1}>
          <div className="glass glass-crimson inline-flex flex-col items-center gap-6 rounded-3xl px-12 py-12 md:px-20">
            <Image
              src="/Himalaya_Logo_White.png"
              alt="Himalaya College of Engineering"
              width={300}
              height={80}
              className="h-28 w-auto opacity-95 drop-shadow-[0_6px_32px_rgba(226,232,240,0.2)]"
            />
            <p className="text-display text-2xl md:text-3xl text-frost/80 tracking-wide">
              Himalaya College of Engineering
            </p>
            <p className="max-w-md text-frost/55 text-sm leading-relaxed text-center">
              This entire experience — design, 3D, motion, backend — was engineered on campus.
              Imagine what you could build here.
            </p>
            <a
              href="https://hcoe.edu.np"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-6 py-2.5 text-gold text-[0.72rem] uppercase tracking-[0.26em] hover:bg-gold/20 transition-colors"
            >
              Explore HCOE →
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
