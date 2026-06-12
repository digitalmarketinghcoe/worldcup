// Three.js r183 deprecated THREE.Clock. R3F hasn't migrated yet, so every
// Canvas mount fires the warning. Suppress only that specific message.

if (typeof window !== "undefined") {
  const _warn = console.warn.bind(console);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.warn = (...args: any[]) => {
    if (typeof args[0] === "string" && args[0].includes("THREE.Clock")) return;
    _warn(...args);
  };
}
