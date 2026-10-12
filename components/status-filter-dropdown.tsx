"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, CheckCircle2, XCircle, ListFilter } from "lucide-react";

export function StatusFilterDropdown({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  // See column-filter-dropdown.tsx for why this menu is position:fixed and
  // repositioned from the trigger's rect rather than absolutely positioned
  // inside the (overflow:auto) table wrapper — otherwise it gets clipped
  // whenever that wrapper is short, e.g. right after filtering to 0 rows.
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (ref.current && ref.current.contains(target)) return;
      if (target.closest("[data-status-filter-menu]")) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;
    function reposition() {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) setMenuPos({ top: rect.bottom + 4, left: rect.left });
    }
    reposition();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open]);

  const options = [
    { label: "Active", value: "ACTIVE" },
    { label: "Inactive", value: "INACTIVE" }
  ];

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-start group hover:text-brand-primary transition-colors outline-none"
      >
        <span>Status</span>
        <ChevronDown size={14} style={{ color: "var(--muted)", marginLeft: "4px" }} />
      </button>

      {open && menuPos && (
        <div
          data-status-filter-menu
          style={{
            position: "fixed",
            top: menuPos.top,
            left: menuPos.left,
            width: "170px",
            background: "var(--panel)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            zIndex: 200,
            padding: "6px",
            display: "flex",
            flexDirection: "column",
            gap: "4px"
          }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value || (value === "Active" && opt.value === "ACTIVE") || (value === "Inactive" && opt.value === "INACTIVE");
            const isActive = opt.value === "ACTIVE";
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: "10px",
                  width: "100%",
                  padding: "8px 12px",
                  textAlign: "left",
                  fontSize: "13px",
                  fontWeight: isSelected ? 600 : 500,
                  color: isSelected
                    ? (isActive ? "#059669" : "#dc2626")
                    : "var(--text-primary)",
                  background: isSelected
                    ? (isActive ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)")
                    : "transparent",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "background-color 0.15s ease, color 0.15s ease",
                  outline: "none"
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = "var(--line, rgba(0,0,0,0.05))";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = "transparent";
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "18px", height: "18px", flexShrink: 0 }}>
                  {isActive ? <CheckCircle2 size={16} color="#10b981" /> : <XCircle size={16} color="#ef4444" />}
                </span>
                <span style={{ fontSize: "13px", lineHeight: "18px" }}>{opt.label}</span>
              </button>
            );
          })}
          <div style={{ height: "1px", background: "var(--border)", margin: "4px 6px" }} />
          <button
            type="button"
            onClick={() => {
              onChange("All");
              setOpen(false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: "10px",
              width: "100%",
              padding: "8px 12px",
              textAlign: "left",
              fontSize: "13px",
              fontWeight: (!value || value === "All") ? 600 : 500,
              color: (!value || value === "All") ? "var(--brand, #ea580c)" : "var(--text-muted)",
              background: (!value || value === "All") ? "rgba(234, 88, 12, 0.08)" : "transparent",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "background-color 0.15s ease, color 0.15s ease",
              outline: "none"
            }}
            onMouseEnter={(e) => {
              if (value && value !== "All") e.currentTarget.style.background = "var(--line, rgba(0,0,0,0.05))";
            }}
            onMouseLeave={(e) => {
              if (value && value !== "All") e.currentTarget.style.background = "transparent";
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "18px", height: "18px", flexShrink: 0 }}>
              <ListFilter size={16} color={(!value || value === "All") ? "var(--brand, #ea580c)" : "var(--text-muted)"} />
            </span>
            <span style={{ fontSize: "13px", lineHeight: "18px" }}>Clear Filter</span>
          </button>
        </div>
      )}
    </div>
  );
}
