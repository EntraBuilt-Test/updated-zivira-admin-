"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Search, Users } from "lucide-react";

export type FieldForceRowMinimal = {
  employeeCode: string;
  name: string;
  territory: string;
  role: string;
};

interface FieldForcePickerProps {
  value: string;
  onChange: (val: string) => void;
  rows: FieldForceRowMinimal[];
}

export function FieldForcePicker({ value, onChange, rows }: FieldForcePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredRows = useMemo(() => {
    if (!searchQuery) return rows;
    const lowerQuery = searchQuery.toLowerCase();
    return rows.filter(
      (r) => 
        r.name.toLowerCase().includes(lowerQuery) || 
        r.employeeCode.toLowerCase().includes(lowerQuery) ||
        r.territory.toLowerCase().includes(lowerQuery)
    );
  }, [rows, searchQuery]);

  const selectedRow = rows.find(r => r.employeeCode === value);
  const displayLabel = value === "admin" ? "All Field Force" : selectedRow ? `${selectedRow.name}` : value;

  return (
    <div className="relative min-w-[220px]" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-[38px] px-3 rounded-lg bg-surface-canvas hover:bg-surface-subtle text-text-primary font-label-md text-label-md flex items-center justify-between border border-border-subtle hover:border-border-strong focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm transition-all group"
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <Users className="w-4 h-4 text-primary opacity-80 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          <span className="font-semibold truncate">{displayLabel}</span>
        </div>
        <span 
          className="material-symbols-outlined text-[18px] text-text-muted transition-transform duration-300 ease-in-out ml-2 flex-shrink-0" 
          style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}
        >
          expand_more
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-[320px] bg-surface-card rounded-xl shadow-xl border border-border-subtle overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Search Header */}
          <div className="p-3 border-b border-border-subtle bg-surface-canvas/50">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                className="w-full pl-9 pr-3 py-2 bg-surface-card border border-border-subtle rounded-lg text-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
                placeholder="Search by name, code, or territory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {/* List Options */}
          <div className="max-h-[320px] overflow-y-auto p-2">
            <button
              onClick={() => {
                onChange("admin");
                setIsOpen(false);
                setSearchQuery("");
              }}
              className={`
                w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-3 group/btn
                ${value === "admin" 
                  ? "bg-brand-primary-subtle border border-primary/20 shadow-sm" 
                  : "hover:bg-surface-subtle border border-transparent"
                }
              `}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold transition-colors ${value === "admin" ? "bg-primary text-on-primary" : "bg-surface-canvas border border-border-subtle text-text-muted group-hover/btn:border-primary/30 group-hover/btn:text-primary"}`}>
                <Users className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className={`font-label-md text-label-md ${value === "admin" ? "text-primary font-bold" : "text-text-primary font-medium"}`}>All Field Force</span>
                <span className="font-body-sm text-body-sm text-text-muted">Entire Organization</span>
              </div>
            </button>

            {filteredRows.length > 0 ? (
              filteredRows.map((r) => {
                const isSelected = r.employeeCode === value;
                const initials = r.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                return (
                  <button
                    key={r.employeeCode}
                    onClick={() => {
                      onChange(r.employeeCode);
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                    className={`
                      w-full text-left px-3 py-2.5 mt-1 rounded-lg transition-all duration-200 flex items-center gap-3 group/btn
                      ${isSelected 
                        ? "bg-brand-primary-subtle border border-primary/20 shadow-sm" 
                        : "hover:bg-surface-subtle border border-transparent"
                      }
                    `}
                  >
                    <div className={`w-9 h-9 rounded-full flex flex-shrink-0 items-center justify-center font-bold text-xs transition-colors ${isSelected ? "bg-primary text-on-primary" : "bg-surface-canvas border border-border-subtle text-text-secondary group-hover/btn:border-primary/30 group-hover/btn:text-primary"}`}>
                      {initials}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className={`font-label-md text-label-md truncate ${isSelected ? "text-primary font-bold" : "text-text-primary font-medium"}`}>{r.name}</span>
                      <span className="font-body-sm text-body-sm text-text-muted truncate">{r.employeeCode} | {r.territory}</span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="py-8 text-center text-text-muted text-body-sm flex flex-col items-center gap-2">
                <Search className="w-6 h-6 text-text-subtle opacity-50" />
                No results found for "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
