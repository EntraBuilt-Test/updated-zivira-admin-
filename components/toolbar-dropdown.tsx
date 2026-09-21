"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export function ToolbarDropdown({
  options,
  initialSelected,
  onChange,
  icon
}: {
  options: string[];
  initialSelected: string;
  onChange?: (val: string) => void;
  icon?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(initialSelected);
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
        className="flex items-center gap-2 h-[38px] px-3 rounded-lg bg-surface-card shadow-sm hover:bg-surface-subtle transition-colors focus:outline-none border border-transparent hover:border-border-subtle group"
      >
        {icon && <span className="group-hover:text-primary transition-colors flex items-center text-text-muted">{icon}</span>}
        <span className="font-label-md text-label-md text-text-primary whitespace-nowrap">{selected}</span>
        <ChevronDown size={16} className={`text-text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-[calc(100%+8px)] right-0 z-50 min-w-[240px] bg-surface-card border border-border-subtle rounded-xl shadow-lg overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200">
          {options.map((opt) => {
            const isSelected = opt === selected;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  setSelected(opt);
                  setOpen(false);
                  if (onChange) onChange(opt);
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
