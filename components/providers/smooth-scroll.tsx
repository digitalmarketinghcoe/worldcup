"use client";

import * as React from "react";
import { ReactLenis } from "lenis/react";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  // Disable Lenis on reduced-motion or touch devices — native scroll is smoother there.
  const [active, setActive] = React.useState(false);
  React.useEffect(() => {
    const noMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActive(!noMotion && !isTouch);
  }, []);

  return active ? (
    <ReactLenis root options={{ lerp: 0.1, wheelMultiplier: 1, touchMultiplier: 1.4 }}>
      {children}
    </ReactLenis>
  ) : (
    <>{children}</>
  );
}
