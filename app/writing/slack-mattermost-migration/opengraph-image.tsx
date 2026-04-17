import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Using AI Agents and Skills to Migrate Off Slack | Jeffrey Emanuel";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(145deg, #0a0a0c 0%, #0d0a12 35%, #0a1014 65%, #0a0a0c 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle grid pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.03,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%2306b6d4' stroke-width='0.5'%3E%3Cpath d='M0 20h40M20 0v40'/%3E%3C/g%3E%3C/svg%3E")`,
            display: "flex",
          }}
        />

        {/* Purple orb - top left */}
        <div
          style={{
            position: "absolute",
            top: -200,
            left: -160,
            width: 620,
            height: 620,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(168,85,247,0.16) 0%, transparent 60%)",
            display: "flex",
          }}
        />

        {/* Cyan orb - center */}
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 420,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 60%)",
            display: "flex",
          }}
        />

        {/* Emerald orb - bottom right */}
        <div
          style={{
            position: "absolute",
            bottom: -220,
            right: -160,
            width: 640,
            height: 640,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(16,185,129,0.14) 0%, transparent 60%)",
            display: "flex",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 72,
            zIndex: 10,
            padding: "40px 80px",
            width: "100%",
          }}
        >
          {/* Left - Migration arrow visual */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              width: 260,
              height: 260,
            }}
          >
            {/* Outer ring */}
            <div
              style={{
                position: "absolute",
                width: 260,
                height: 260,
                borderRadius: "50%",
                border: "1px solid rgba(6,182,212,0.16)",
                display: "flex",
              }}
            />

            {/* Core glow */}
            <div
              style={{
                position: "absolute",
                width: 170,
                height: 170,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(168,85,247,0.32) 0%, rgba(6,182,212,0.16) 50%, transparent 80%)",
                filter: "blur(16px)",
                display: "flex",
              }}
            />

            {/* Migration SVG: # → arrow → chevron */}
            <svg
              width="260"
              height="260"
              viewBox="0 0 100 100"
              fill="none"
              style={{
                filter: "drop-shadow(0 0 20px rgba(6,182,212,0.35))",
              }}
            >
              <defs>
                <linearGradient id="smGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
                <linearGradient id="smGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.6" />
                </linearGradient>
              </defs>

              {/* Slack hash-like symbol on left */}
              <g transform="translate(14, 32)" stroke="#a855f7" strokeWidth="3" strokeLinecap="round">
                <line x1="3" y1="10" x2="27" y2="10" />
                <line x1="3" y1="26" x2="27" y2="26" />
                <line x1="9" y1="4" x2="9" y2="32" />
                <line x1="21" y1="4" x2="21" y2="32" />
              </g>

              {/* Arrow */}
              <g stroke="url(#smGrad)" strokeWidth="2.2" strokeLinecap="round" fill="none">
                <line x1="46" y1="50" x2="64" y2="50" />
                <polyline points="58,44 64,50 58,56" />
              </g>

              {/* Mattermost-like chevron/speech on right */}
              <g transform="translate(68, 30)" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
                <path d="M 2 30 L 2 8 A 4 4 0 0 1 6 4 L 22 4 A 4 4 0 0 1 26 8 L 26 22 A 4 4 0 0 1 22 26 L 10 26 L 2 32" />
                <circle cx="14" cy="15" r="4" fill="#10b981" stroke="none" />
              </g>

              {/* Radiating dashes */}
              <g stroke="url(#smGrad2)" strokeWidth="0.5" opacity="0.45">
                <line x1="50" y1="8" x2="50" y2="16" />
                <line x1="50" y1="84" x2="50" y2="92" />
                <line x1="8" y1="50" x2="16" y2="50" />
                <line x1="84" y1="50" x2="92" y2="50" />
                <line x1="20" y1="20" x2="26" y2="26" />
                <line x1="80" y1="20" x2="74" y2="26" />
                <line x1="20" y1="80" x2="26" y2="74" />
                <line x1="80" y1="80" x2="74" y2="74" />
              </g>
            </svg>
          </div>

          {/* Right - Text content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              maxWidth: 640,
            }}
          >
            {/* Page label */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 22,
                padding: "8px 16px",
                borderRadius: 20,
                background: "rgba(6,182,212,0.1)",
                border: "1px solid rgba(6,182,212,0.22)",
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#06b6d4" }} />
              <span
                style={{
                  fontSize: 12,
                  color: "#06b6d4",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  display: "flex",
                }}
              >
                AI Agents / Infrastructure
              </span>
            </div>

            {/* Title */}
            <div style={{ display: "flex", flexDirection: "column", marginBottom: 22 }}>
              <h1
                style={{
                  fontSize: 58,
                  fontWeight: 900,
                  color: "white",
                  margin: 0,
                  letterSpacing: "-0.04em",
                  lineHeight: 1.1,
                  display: "flex",
                }}
              >
                Using AI Agents to
              </h1>
              <h1
                style={{
                  fontSize: 58,
                  fontWeight: 900,
                  background:
                    "linear-gradient(to right, #a855f7, #06b6d4, #10b981)",
                  backgroundClip: "text",
                  color: "transparent",
                  margin: 0,
                  letterSpacing: "-0.04em",
                  lineHeight: 1.1,
                  display: "flex",
                }}
              >
                Migrate Off Slack
              </h1>
            </div>

            {/* Description */}
            <p
              style={{
                fontSize: 21,
                color: "#94a3b8",
                margin: 0,
                marginBottom: 26,
                lineHeight: 1.5,
                fontWeight: 400,
                display: "flex",
              }}
            >
              {"Two paired skills. One weekend. ~99% lower ongoing cost."}
            </p>

            {/* Badges */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              {["Mattermost", "Claude Code / Codex", "Fail-Closed Cutover"].map((tag) => (
                <div
                  key={tag}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "6px 14px",
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600, display: "flex" }}>
                    {tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom gradient accent */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background:
              "linear-gradient(90deg, transparent 0%, #a855f7 22%, #06b6d4 50%, #10b981 78%, transparent 100%)",
            display: "flex",
          }}
        />

        {/* Domain */}
        <div
          style={{
            position: "absolute",
            top: 28,
            right: 38,
            fontSize: 14,
            color: "#475569",
            display: "flex",
          }}
        >
          <span style={{ display: "flex" }}>jeffreyemanuel.com</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
