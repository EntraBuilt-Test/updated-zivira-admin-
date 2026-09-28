"use client";

// Small reusable modal styled like a native browser alert() — title,
// message, single OK button — used wherever a screen needs to show a
// blocking "Alert!" popup without the drawbacks of a real alert() (can't be
// styled, breaks headless/automated screenshots). Matches sanpharma.info's
// own "Alert! ... [OK]" popups exactly (e.g. Slide Upload's View/Priority
// "No Records Found!").
export function AlertModal({
  title = "Alert!",
  message,
  onClose
}: {
  title?: string;
  message: string;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.15)",
        zIndex: 200,
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 4,
          boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
          minWidth: 340,
          maxWidth: 420,
          padding: "24px 24px 16px"
        }}
      >
        <h3 style={{ fontSize: 22, fontWeight: 500, margin: 0, color: "#1f2937" }}>{title}</h3>
        <p style={{ marginTop: 16, marginBottom: 24, color: "#1f2937", fontSize: 15 }}>{message}</p>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "#e5e7eb",
              border: "1px solid #cbd5e1",
              borderRadius: 4,
              padding: "6px 18px",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
