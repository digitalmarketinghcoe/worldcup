"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type TabsContextValue = {
  value: string;
  setValue: (v: string) => void;
  id: string;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabs() {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("Tabs components must be used within <Tabs>");
  return ctx;
}

function Tabs({
  defaultValue,
  className,
  children,
}: {
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [value, setValue] = React.useState(defaultValue);
  const id = React.useId();
  return (
    <TabsContext.Provider value={{ value, setValue, id }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

function TabsList({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex items-center gap-1 rounded-full glass p-1.5 max-w-full overflow-x-auto scrollbar-none",
        className
      )}
    >
      {children}
    </div>
  );
}

function TabsTrigger({ value, children }: { value: string; children: React.ReactNode }) {
  const { value: active, setValue, id } = useTabs();
  const selected = active === value;
  return (
    <button
      role="tab"
      aria-selected={selected}
      aria-controls={`${id}-panel-${value}`}
      onClick={() => setValue(value)}
      className={cn(
        "relative rounded-full px-4 py-2 text-sm font-medium tracking-wide transition-colors cursor-pointer whitespace-nowrap",
        selected ? "text-midnight" : "text-frost/60 hover:text-frost"
      )}
    >
      {selected && (
        <motion.span
          layoutId={`${id}-pill`}
          className="absolute inset-0 rounded-full bg-gold"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}

function TabsContent({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { value: active, id } = useTabs();
  if (active !== value) return null;
  return (
    <motion.div
      role="tabpanel"
      id={`${id}-panel-${value}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
