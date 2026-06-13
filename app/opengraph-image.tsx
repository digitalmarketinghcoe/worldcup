import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "HCOE World Cup Fan Zone 2026 — Engineering Meets Football";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #020617 0%, #0d1a2e 55%, #1a0508 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Gold top bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 5, background: "#D4AF37" }} />
        {/* Crimson bottom bar */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 5, background: "#D9042A" }} />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          {/* Event badge */}
          <div
            style={{
              fontSize: 13,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#D4AF37",
              background: "rgba(212,175,55,0.1)",
              border: "1px solid rgba(212,175,55,0.35)",
              borderRadius: 999,
              padding: "8px 28px",
            }}
          >
            FIFA World Cup 2026 · Fan Zone
          </div>

          {/* Main headline */}
          <div
            style={{
              marginTop: 8,
              fontSize: 88,
              fontWeight: 900,
              color: "#E2E8F0",
              letterSpacing: "-0.025em",
              lineHeight: 0.95,
            }}
          >
            Engineering
          </div>
          <div
            style={{
              fontSize: 88,
              fontWeight: 900,
              color: "#D4AF37",
              letterSpacing: "-0.025em",
              lineHeight: 0.95,
            }}
          >
            Meets Football
          </div>

          {/* Subline */}
          <div
            style={{
              marginTop: 20,
              fontSize: 22,
              color: "rgba(226,232,240,0.55)",
              textAlign: "center",
            }}
          >
            Predict matches · Climb the leaderboard · Win prizes
          </div>

          {/* College name */}
          <div
            style={{
              marginTop: 28,
              fontSize: 15,
              color: "rgba(226,232,240,0.35)",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
            }}
          >
            Himalaya College of Engineering · Nepal
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
