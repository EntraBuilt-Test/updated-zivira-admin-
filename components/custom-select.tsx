"use client";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

// Round 39 item 8 -- instant-open select. Changes vs. the previous version:
//  * the outside-click listener is attached only while the menu is open
//    (it used to be a permanent document listener per instance -- dozens on
//    report screens);
//  * the option list is memoised and rendered only while open, with CSS
//    hover classes instead of per-row onMouseEnter/Leave style mutation;
//  * no animation, and the page's scrollbar gutter is reserved globally
//    (globals.css) so opening a long menu cannot shift the layout.
function CustomSelectImpl({
  value,
  options,
  onChange,
  placeholder,
  style,
  className
}: {
  value: string;
  options: string[];
  onChange: (val: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: PointerEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, [open]);

  const optionNodes = useMemo(
    () =>
      open
        ? options.map((opt) => {
            const isSelected = opt === value;
            return (
              <button
                key={opt}
                type="button"
                className={isSelected ? "cs-option cs-option-selected" : "cs-option"}
                style={{
                  padding: "8px 16px",
                  textAlign: "left",
                  fontSize: "13px",
                  cursor: "pointer",
                  border: "none",
                  borderLeft: isSelected ? "3px solid #f97316" : "3px solid transparent",
                  background: isSelected ? "rgba(249, 115, 22, 0.1)" : "transparent",
                  color: isSelected ? "#f97316" : "var(--ink)",
                  fontWeight: isSelected ? 600 : 400,
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                }}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
              >
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{opt}</span>
              </button>
            );
          })
        : null,
    [open, options, value, onChange]
  );

  return (
    <div ref={ref} className={className} style={{ position: "relative", display: "block", ...style }}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="input flex items-center justify-between h-9 text-sm">
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {value || placeholder || "Select an option"}
        </span>
        <ChevronDown size={16} style={{ color: "var(--muted)", flexShrink: 0, marginLeft: "8px" }} />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            minWidth: "100%",
            width: "max-content",
            maxWidth: "min(90vw, 420px)",
            maxHeight: "320px",
            overflowY: "auto",
            background: "var(--panel)",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            zIndex: 60,
            padding: "6px 0",
            display: "flex",
            flexDirection: "column"
          }}
        >
          {optionNodes}
        </div>
      )}
    </div>
  );
}

export const CustomSelect = memo(CustomSelectImpl);
