import { cn } from "@/lib/utils/cn";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "earth";
type Size = "md" | "lg";

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
        size === "lg" ? "min-h-14 px-5 text-lg" : "min-h-touch text-base",
        variant === "primary" && "bg-brand text-white hover:bg-brand-dark",
        variant === "secondary" && "border border-line bg-surface text-ink hover:bg-brand-light",
        variant === "ghost" && "bg-transparent text-ink hover:bg-brand-light",
        variant === "danger" && "bg-danger text-white",
        variant === "earth" && "bg-earth text-white",
        className,
      )}
      {...props}
    />
  );
}
