"use client";

import { Star } from "lucide-react";

export function RatingStars({ value, onChange, label }: { value: number; onChange?: (value: number) => void; label: string }) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star}`}
          className="min-h-12 min-w-12"
          onClick={() => onChange?.(star)}
        >
          <Star className={star <= value ? "fill-warning text-warning" : "text-muted"} />
        </button>
      ))}
    </div>
  );
}
