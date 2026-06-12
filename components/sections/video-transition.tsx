"use client";

import * as React from "react";

interface VideoTransitionProps {
  src: string;
  height?: string;
  /** gradient fade direction — "down" fades top-edge, "up" fades bottom-edge, "both" fades both, "none" no mask */
  fade?: "down" | "up" | "both" | "none";
  brightness?: number;
  /** Optional overlay label shown center */
  label?: string;
}

export function VideoTransition({
  src,
  height = "40vh",
  fade = "both",
  brightness = 0.45,
  label,
}: VideoTransitionProps) {
  const ref = React.useRef<HTMLVideoElement>(null);
  const wrapRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const video = ref.current;
    const wrap = wrapRef.current;
    if (!video || !wrap) return;

    // Play once when scrolled into view; never replay
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(wrap);
    return () => observer.disconnect();
  }, []);

  const maskParts: Record<string, string | undefined> = {
    down: "linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)",
    up:   "linear-gradient(to top, transparent 0%, black 25%, black 75%, transparent 100%)",
    both: "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
    none: undefined,
  };

  return (
    <div
      ref={wrapRef}
      className="relative w-full overflow-hidden pointer-events-none"
      style={{ height }}
      aria-hidden="true"
    >
      <video
        ref={ref}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          filter: `brightness(${brightness}) saturate(1.2)`,
          maskImage: maskParts[fade ?? "both"],
          WebkitMaskImage: maskParts[fade ?? "both"],
        }}
      />
      {label && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[0.6rem] uppercase tracking-[0.35em] text-frost/30 bg-pitch/40 backdrop-blur-sm px-4 py-1.5 rounded-full">
            {label}
          </span>
        </div>
      )}
    </div>
  );
}
