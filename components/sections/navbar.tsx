"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "#intro",       label: "2026" },
  { href: "#matches",     label: "Fixtures" },
  { href: "#predict",     label: "Predict" },
  { href: "#leaderboard", label: "Standings" },
  { href: "#prizes",      label: "Prizes" },
  { href: "#hcoe",        label: "HCOE" },
];

function smoothTo(href: string) {
  if (href === "#") { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
  document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
}

export function Navbar() {
  const [progress, setProgress] = React.useState(0);
  const [active, setActive] = React.useState("");
  const [open, setOpen] = React.useState(false);

  // Scroll progress + glass trigger
  React.useEffect(() => {
    const handle = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? (window.scrollY / max) * 100 : 0);
    };
    handle();
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  // Active section highlight
  React.useEffect(() => {
    const targets = LINKS.map((l) => document.querySelector(l.href) as HTMLElement | null).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting);
        if (hit.length) setActive(`#${hit[0].target.id}`);
      },
      { threshold: 0.35 }
    );
    targets.forEach((t) => obs.observe(t));
    return () => obs.disconnect();
  }, []);

  const nav = (href: string) => { setOpen(false); smoothTo(href); };

  return (
    <>
      <header
        className="py-2 fixed top-0 inset-x-0 z-50 bg-white/5 backdrop-blur-xl border-b border-frost/10 shadow-[0_1px_0_rgba(226,232,240,0.06)]"
      >
        {/* scroll progress bar */}
        <div
          className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-crimson via-gold to-gold origin-left transition-[width] duration-100"
          style={{ width: `${progress}%` }}
          aria-hidden="true"
        />

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 h-16">
          {/* Logo */}
          <button
            onClick={() => nav("#")}
            className="flex items-center gap-3 cursor-pointer group"
            aria-label="Go to top"
          >
            <Image
              src="/Himalaya_Logo_White.png"
              alt="Himalaya College of Engineering"
              width={640}
              height={320}
              className="h-42 w-auto"
              priority
            />
            <span className="hidden sm:block text-display text-base text-frost/70 group-hover:text-frost transition-colors leading-none">
              Fan Zone <span className="text-gold">26</span>
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7" aria-label="Main navigation">
            {LINKS.map((l) => (
              <button
                key={l.href}
                onClick={() => nav(l.href)}
                className={`cursor-pointer text-[0.68rem] uppercase tracking-[0.22em] font-medium transition-colors relative ${
                  active === l.href ? "text-gold" : "text-frost/50 hover:text-frost"
                }`}
              >
                {l.label}
                {active === l.href && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-gold rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="primary"
              className="hidden md:inline-flex text-sm"
              onClick={() => nav("#predict")}
            >
              ⚽ Predict
            </Button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setOpen((p) => !p)}
              className="md:hidden cursor-pointer text-frost/70 hover:text-frost p-1.5 rounded-lg hover:bg-frost/8 transition-colors"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              <AnimatePresence mode="wait" initial={false}>
                {open ? (
                  <motion.span key="x" initial={{ rotate: -45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 45, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <X className="size-5" />
                  </motion.span>
                ) : (
                  <motion.span key="menu" initial={{ rotate: 45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -45, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Menu className="size-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-pitch/60 backdrop-blur-sm md:hidden"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-16 inset-x-0 z-50 md:hidden bg-midnight/95 backdrop-blur-xl border-b border-frost/12 px-6 py-6 shadow-2xl"
            >
              <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
                {LINKS.map((l, i) => (
                  <motion.button
                    key={l.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.045, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => nav(l.href)}
                    className={`w-full text-left cursor-pointer text-display text-2xl py-3 border-b border-frost/8 transition-colors ${
                      active === l.href ? "text-gold" : "text-frost/75 hover:text-frost"
                    }`}
                  >
                    {l.label}
                  </motion.button>
                ))}
              </nav>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-5"
              >
                <Button onClick={() => nav("#predict")} className="w-full">
                  ⚽ Make Your Prediction
                </Button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
