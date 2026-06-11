"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 font-display text-lg tracking-[0.08em] uppercase whitespace-nowrap cursor-pointer transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-gold text-midnight [clip-path:polygon(0_0,calc(100%-14px)_0,100%_14px,100%_100%,0_100%)] hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[6px_6px_0_rgba(255,214,10,0.35)] active:translate-x-0 active:translate-y-0 active:shadow-none",
        crimson:
          "bg-crimson text-frost [clip-path:polygon(0_0,calc(100%-14px)_0,100%_14px,100%_100%,0_100%)] hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[6px_6px_0_rgba(217,4,41,0.35)] active:translate-x-0 active:translate-y-0 active:shadow-none",
        ghost:
          "border border-frost/20 text-frost bg-transparent hover:border-gold hover:text-gold hover:bg-gold/5",
        link: "text-gold underline-offset-4 hover:underline normal-case tracking-normal font-sans",
      },
      size: {
        default: "px-8 py-3.5",
        sm: "px-5 py-2 text-base",
        lg: "px-10 py-4 text-xl",
        icon: "size-11",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  }
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { magnetic?: boolean };

function Button({ className, variant, size, magnetic = false, ...props }: ButtonProps) {
  const ref = React.useRef<HTMLButtonElement>(null);

  const onMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!magnetic || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.25;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.25;
    ref.current.style.translate = `${x}px ${y}px`;
  };

  const onMouseLeave = () => {
    if (!magnetic || !ref.current) return;
    ref.current.style.translate = "0px 0px";
  };

  return (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      {...props}
    />
  );
}

export { Button, buttonVariants };
