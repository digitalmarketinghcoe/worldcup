import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "w-full rounded-lg border border-frost/15 bg-midnight/60 px-4 py-3 text-frost placeholder:text-frost/35 transition-colors focus:border-gold/60 focus:bg-midnight outline-none aria-invalid:border-crimson",
        className
      )}
      {...props}
    />
  );
}

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn(
        "block text-[0.72rem] font-medium uppercase tracking-[0.18em] text-frost/60 mb-2",
        className
      )}
      {...props}
    />
  );
}

function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "w-full appearance-none rounded-lg border border-frost/15 bg-midnight/60 px-4 py-3 text-frost transition-colors focus:border-gold/60 outline-none",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export { Input, Label, Select };
