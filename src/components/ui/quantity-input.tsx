"use client";

export function QuantityInput({
  value,
  onChange,
  unit,
  onUnit,
  units,
  label,
}: {
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  onUnit?: (unit: string) => void;
  units?: string[];
  label: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-lg font-semibold" htmlFor="quantity-input">
        {label}
      </label>
      <div className="flex gap-2">
        <button type="button" className="min-h-14 min-w-14 rounded-2xl bg-brand-light text-2xl font-bold" onClick={() => onChange(Math.max(1, value - 1))} aria-label="Decrease">
          −
        </button>
        <input
          id="quantity-input"
          inputMode="numeric"
          className="min-h-14 w-full rounded-2xl border border-line bg-surface text-center text-3xl font-bold"
          value={value}
          onChange={(event) => onChange(Number(event.target.value) || 0)}
        />
        <button type="button" className="min-h-14 min-w-14 rounded-2xl bg-brand-light text-2xl font-bold" onClick={() => onChange(value + 1)} aria-label="Increase">
          +
        </button>
        {units && onUnit ? (
          <select aria-label="Unit" className="min-h-14 rounded-2xl border border-line bg-surface px-3 text-lg font-semibold" value={unit} onChange={(event) => onUnit(event.target.value)}>
            {units.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        ) : null}
      </div>
    </div>
  );
}
