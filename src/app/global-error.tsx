"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ background: "#050609", color: "#ece9e2", fontFamily: "system-ui", minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ letterSpacing: "0.2em", fontSize: "0.7rem" }}>500</p>
          <h1 style={{ fontSize: "2rem", marginTop: "1rem" }}>System interrupt</h1>
          <button type="button" onClick={reset} style={{ marginTop: "1.5rem", border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "inherit", padding: "0.7rem 1.4rem", borderRadius: 999 }}>
            Retry
          </button>
        </div>
      </body>
    </html>
  );
}
