"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface MonthYearPickerProps {
  month: string;
  year: string;
  onMonthChange: (m: string) => void;
  onYearChange: (y: string) => void;
}

export function MonthYearPicker({ month, year, onMonthChange, onYearChange }: MonthYearPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePrevYear = () => {
    onYearChange(String(parseInt(year) - 1));
  };

  const handleNextYear = () => {
    onYearChange(String(parseInt(year) + 1));
  };

  return (
    <div className="relative min-w-[150px]" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-[38px] px-3 rounded-lg bg-surface-canvas hover:bg-surface-subtle text-text-primary font-label-md text-label-md flex items-center justify-between border border-border-subtle hover:border-border-strong focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm transition-all group"
      >
        <div className="flex items-center gap-2.5">
          <Calendar className="w-4 h-4 text-primary opacity-80 group-hover:opacity-100 transition-opacity" />
          <span className="font-semibold tracking-wide">{month} {year}</span>
        </div>
        <span 
          className="material-symbols-outlined text-[18px] text-text-muted transition-transform duration-300 ease-in-out" 
          style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}
        >
          expand_more
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-[280px] bg-surface-card rounded-xl shadow-xl border border-border-subtle p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header for Year selection */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border-subtle">
            <button 
              onClick={handlePrevYear}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-subtle text-text-secondary hover:text-text-primary transition-colors active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-headline-sm text-headline-sm text-text-primary font-bold tracking-wider">
              {year}
            </span>
            <button 
              onClick={handleNextYear}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-subtle text-text-secondary hover:text-text-primary transition-colors active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Grid for Months */}
          <div className="grid grid-cols-3 gap-2">
            {months.map((m) => {
              const isSelected = m === month;
              return (
                <button
                  key={m}
                  onClick={() => {
                    onMonthChange(m);
                    setIsOpen(false);
                  }}
                  className={`
                    py-2.5 rounded-lg font-label-md text-label-md transition-all duration-200 relative overflow-hidden
                    ${isSelected 
                      ? "bg-primary text-on-primary shadow-md font-bold scale-[1.02]" 
                      : "text-text-primary hover:bg-brand-primary-subtle hover:text-primary hover:shadow-sm font-medium"
                    }
                  `}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
