"use client";

import { useEffect, useState } from "react";

// Same look as scripts/demo-banner.html. Rendered only after mount, so the
// static HTML and the first client render match (no hydration warnings).

const HIDDEN_KEY = "demo-mode-note:hidden";

function DemoModeNote() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(function () {
    try {
      setIsVisible(!sessionStorage.getItem(HIDDEN_KEY));
    } catch {
      setIsVisible(true);
    }
  }, []);

  function handleHide() {
    setIsVisible(false);
    try {
      sessionStorage.setItem(HIDDEN_KEY, "1");
    } catch {}
  }

  if (!isVisible) return null;

  return (
    <div
      id="demo-mode-note"
      role="note"
      style={{
        position: "fixed",
        left: "12px",
        bottom: "12px",
        zIndex: 2147483647,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "5px 6px 5px 12px",
        borderRadius: "999px",
        background: "rgba(20,20,24,.82)",
        color: "#fff",
        font: "500 12px/1.2 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif",
        boxShadow: "0 2px 8px rgba(0,0,0,.25)",
        backdropFilter: "blur(4px)",
      }}
    >
      <span>Demo mode: data is mocked</span>
      <button
        type="button"
        aria-label="Hide demo note"
        style={{
          all: "unset",
          cursor: "pointer",
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          textAlign: "center",
          lineHeight: "18px",
          fontSize: "14px",
          opacity: 0.75,
        }}
        onClick={handleHide}
      >
        ×
      </button>
    </div>
  );
}

export default DemoModeNote;
