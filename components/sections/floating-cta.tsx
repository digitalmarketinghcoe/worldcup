"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function FloatingCta() {
  const pathname = usePathname();
  const [visible, setVisible] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);

  if (pathname?.startsWith("/admin")) return null;

  React.useEffect(() => {
    const hero = document.querySelector('[aria-label*="hero"]') as HTMLElement | null;

    if (hero) {
      const obs = new IntersectionObserver(
        ([entry]) => setVisible(!entry.isIntersecting),
        { threshold: 0.05 }
      );
      obs.observe(hero);
      return () => obs.disconnect();
    }

    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Re-show if user scrolls past predict section (they missed it)
  React.useEffect(() => {
    const predict = document.getElementById("predict");
    if (!predict) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setDismissed(false); },
      { threshold: 0.1 }
    );
    obs.observe(predict);
    return () => obs.disconnect();
  }, []);

  const show = visible && !dismissed;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 360, damping: 28 }}
          className="fixed bottom-6 right-5 z-50 flex items-center gap-2"
        >
          <button
            onClick={() => {
              document.getElementById("predict")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="cursor-pointer flex items-center gap-2.5 rounded-full bg-gold px-5 py-3 text-midnight text-[0.78rem] font-bold uppercase tracking-[0.14em] shadow-[0_8px_32px_rgba(255,214,10,0.45)] hover:shadow-[0_12px_44px_rgba(255,214,10,0.6)] hover:scale-105 active:scale-95 transition-all select-none"
            aria-label="Make your World Cup prediction"
          >
            <span aria-hidden="true">⚽</span>
            Predict
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="cursor-pointer size-7 rounded-full bg-midnight/80 border border-frost/20 text-frost/50 hover:text-frost hover:border-frost/40 transition-colors flex items-center justify-center text-base leading-none"
            aria-label="Dismiss"
          >
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
