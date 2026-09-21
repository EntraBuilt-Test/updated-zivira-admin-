"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

interface ModernDatePickerProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ModernDatePicker({ value, onChange, placeholder = "Select date", disabled = false }: ModernDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // The month currently being viewed in the calendar
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  });

  // Keep viewDate synced with value when opening
  useEffect(() => {
    if (isOpen && value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) setViewDate(d);
    }
  }, [isOpen, value]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const selectDate = (year: number, month: number, date: number) => {
    // format as YYYY-MM-DD
    const yyyy = year;
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(date).padStart(2, '0');
    onChange(`${yyyy}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const calendarGrid = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const grid = [];
    
    // Previous month padding
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      grid.push({
        date: daysInPrevMonth - i,
        month: month - 1,
        year: month === 0 ? year - 1 : year,
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      grid.push({
        date: i,
        month: month,
        year: year,
        isCurrentMonth: true
      });
    }

    // Next month padding to fill out 6 rows of 7 (42 cells)
    const remaining = 42 - grid.length;
    for (let i = 1; i <= remaining; i++) {
      grid.push({
        date: i,
        month: month + 1,
        year: month === 11 ? year + 1 : year,
        isCurrentMonth: false
      });
    }

    return grid;
  }, [viewDate]);

  // Format value for display
  const displayValue = useMemo(() => {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
  }, [value]);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-[42px] px-3.5 rounded-xl border border-border-subtle bg-surface-canvas hover:bg-surface-subtle text-text-primary font-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className={`truncate ${!displayValue ? 'text-text-muted/60' : ''}`}>
          {displayValue || placeholder}
        </span>
        <CalendarIcon className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors flex-shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-[240px] bg-surface-card rounded-xl shadow-xl border border-border-subtle p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button 
              onClick={handlePrevMonth}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-subtle text-text-secondary hover:text-text-primary transition-colors active:scale-95 border border-transparent hover:border-border-subtle"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <div className="font-label-sm text-[13px] text-text-primary font-semibold">
              {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </div>
            <button 
              onClick={handleNextMonth}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-subtle text-text-secondary hover:text-text-primary transition-colors active:scale-95 border border-transparent hover:border-border-subtle"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 mb-1.5">
            {DAYS.map(day => (
              <div key={day} className="text-center font-label-sm text-[10px] text-text-muted font-semibold uppercase">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarGrid.map((cell, index) => {
              // Construct YYYY-MM-DD for comparison
              const yyyy = cell.year;
              // Handles wrap-around correctly via Date object logic in JS
              const realD = new Date(yyyy, cell.month, cell.date);
              const cellY = realD.getFullYear();
              const cellM = String(realD.getMonth() + 1).padStart(2, '0');
              const cellD = String(realD.getDate()).padStart(2, '0');
              const cellValue = `${cellY}-${cellM}-${cellD}`;
              
              const isSelected = value === cellValue;
              
              // Check if today
              const today = new Date();
              const isToday = today.getFullYear() === cellY && today.getMonth() === realD.getMonth() && today.getDate() === realD.getDate();

              return (
                <button
                  key={`${index}-${cellValue}`}
                  onClick={(e) => {
                    e.preventDefault();
                    selectDate(cellY, realD.getMonth(), realD.getDate());
                  }}
                  className={`
                    w-full h-7 flex items-center justify-center rounded-md font-body-sm transition-all text-[12px]
                    ${isSelected 
                      ? "bg-primary text-on-primary font-bold shadow-sm scale-105" 
                      : cell.isCurrentMonth
                        ? "text-text-primary hover:bg-surface-subtle hover:text-primary font-medium"
                        : "text-text-muted opacity-50 hover:bg-surface-subtle"
                    }
                    ${isToday && !isSelected ? "ring-1 ring-primary/50 text-primary font-bold bg-brand-primary-subtle" : ""}
                  `}
                >
                  {realD.getDate()}
                </button>
              );
            })}
          </div>
          
          <div className="mt-3 pt-2.5 border-t border-border-subtle flex justify-between items-center">
             <button 
              onClick={(e) => {
                e.preventDefault();
                onChange("");
                setIsOpen(false);
              }}
              className="text-[11px] font-label-sm text-text-muted hover:text-status-danger transition-colors"
             >
               Clear
             </button>
             <button 
              onClick={(e) => {
                e.preventDefault();
                const d = new Date();
                selectDate(d.getFullYear(), d.getMonth(), d.getDate());
              }}
              className="text-[11px] font-label-sm font-semibold text-primary hover:text-brand-primary-hover transition-colors"
             >
               Today
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
