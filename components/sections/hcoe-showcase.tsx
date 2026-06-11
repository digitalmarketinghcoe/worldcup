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
          <div className="glass glass-crimson inline-flex flex-col items-center gap-5 rounded-3xl px-10 py-10 md:px-16">
            <Image
              src="/Himalaya_Logo_White.png"
              alt="Himalaya College of Engineering"
              width={180}
              height={48}
              className="h-10 w-auto opacity-90"
            />
            <p className="max-w-md text-frost/60 text-sm leading-relaxed">
              This entire experience — design, 3D, motion, backend — was engineered on campus.
              Imagine what you could build here.
            </p>
            <a
              href="https://hcoe.edu.np"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold text-[0.72rem] uppercase tracking-[0.26em] underline-offset-4 hover:underline"
            >
              Explore HCOE →
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
