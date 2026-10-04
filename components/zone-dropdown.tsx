"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

// Coordinator follow-up round (Item 4) -- this used to hold its own
// `selected` state that was never read by anything: picking a region
// changed the button's label and nothing else anywhere on the page. Now a
// controlled component: the caller owns the selected value and the real
// option list (real employee territories, not fixed fake zone names), and
// actually filters the Activities dashboard's data by it.
export function ZoneDropdown({
  value,
  options,
  onChange
}: {
  value: string;
  options: string[];
  onChange: (next: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-surface-card px-3 py-1.5 rounded-lg shadow-sm hover:bg-surface-subtle transition-colors focus:outline-none border border-transparent hover:border-border-subtle group"
      >
        <span className="material-symbols-outlined text-text-muted text-[18px] group-hover:text-primary transition-colors">
          public
        </span>
        <span className="font-label-md text-label-md text-text-primary whitespace-nowrap">
          {value}
        </span>
        <ChevronDown
          size={16}
          className={`text-text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-[calc(100%+8px)] left-0 z-50 min-w-[240px] max-h-80 overflow-y-auto bg-surface-card border border-border-subtle rounded-xl shadow-lg overflow-hidden py-1">
          {options.map((opt) => {
            const isSelected = opt === value;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${isSelected ? "bg-brand-primary/10 text-[#b43403] font-medium" : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary"}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
