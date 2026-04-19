import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt =
  "An AI Skill for Wills & Estate Planning | Jeffrey Emanuel";
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
            "linear-gradient(145deg, #07070b 0%, #060f12 35%, #071210 65%, #07070b 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.03,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%2310b981' stroke-width='0.5'%3E%3Cpath d='M0 20h40M20 0v40'/%3E%3C/g%3E%3C/svg%3E")`,
            display: "flex",
          }}
        />

        {/* Emerald orb - top left */}
        <div
          style={{
            position: "absolute",
            top: -180,
            left: -150,
            width: 560,
            height: 560,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 60%)",
            display: "flex",
          }}
        />

        {/* Teal orb - center */}
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 280,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(20,184,166,0.14) 0%, transparent 60%)",
            display: "flex",
          }}
        />

        {/* Cyan orb - bottom right */}
        <div
          style={{
            position: "absolute",
            bottom: -220,
            right: -150,
            width: 620,
            height: 620,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 60%)",
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
            gap: 80,
            zIndex: 10,
            padding: "40px 80px",
            width: "100%",
          }}
        >
          {/* Left — Scale of Justice SVG */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: 320,
                height: 320,
                borderRadius: "50%",
                border: "1px solid rgba(16,185,129,0.08)",
                display: "flex",
              }}
            />
            <div
              style={{
                position: "absolute",
                width: 240,
                height: 240,
                borderRadius: "50%",
                border: "1px solid rgba(16,185,129,0.15)",
                display: "flex",
              }}
            />
            <div
              style={{
                position: "absolute",
                width: 180,
                height: 180,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(16,185,129,0.25) 0%, rgba(20,184,166,0.1) 60%, transparent 80%)",
                filter: "blur(20px)",
                display: "flex",
              }}
            />
            <svg
              width="220"
              height="220"
              viewBox="0 0 100 100"
              fill="none"
              style={{ filter: "drop-shadow(0 0 20px rgba(16,185,129,0.4))" }}
            >
              <defs>
                <linearGradient id="epGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              {/* Document icon */}
              <rect x="28" y="12" width="44" height="56" rx="4" stroke="url(#epGrad)" strokeWidth="1.5" opacity="0.7" />
              <line x1="36" y1="26" x2="64" y2="26" stroke="url(#epGrad)" strokeWidth="1" opacity="0.5" />
              <line x1="36" y1="34" x2="58" y2="34" stroke="url(#epGrad)" strokeWidth="1" opacity="0.4" />
              <line x1="36" y1="42" x2="62" y2="42" stroke="url(#epGrad)" strokeWidth="1" opacity="0.4" />
              <line x1="36" y1="50" x2="54" y2="50" stroke="url(#epGrad)" strokeWidth="1" opacity="0.3" />
              {/* Shield overlay */}
              <path d="M50 70 L50 88" stroke="url(#epGrad)" strokeWidth="1.2" opacity="0.6" />
              <path d="M50 72 C42 72 38 78 38 84 C38 90 50 96 50 96 C50 96 62 90 62 84 C62 78 58 72 50 72" stroke="url(#epGrad)" strokeWidth="1.5" fill="rgba(16,185,129,0.08)" opacity="0.8" />
              <circle cx="50" cy="84" r="3" fill="#10b981" opacity="0.6" />
              {/* Corner fold */}
              <path d="M60 12 L72 12 L72 24" stroke="url(#epGrad)" strokeWidth="0.8" opacity="0.3" />
            </svg>
          </div>

          {/* Right — Text */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              maxWidth: 600,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 20,
                padding: "8px 16px",
                borderRadius: 20,
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "flex" }} />
              <span
                style={{
                  fontSize: 12,
                  color: "#6ee7b7",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  display: "flex",
                }}
              >
                AI Agents · Estate Planning
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", marginBottom: 24 }}>
              <h1
                style={{
                  fontSize: 56,
                  fontWeight: 900,
                  color: "white",
                  margin: 0,
                  letterSpacing: "-0.04em",
                  lineHeight: 1.12,
                  display: "flex",
                }}
              >
                An AI Skill for
              </h1>
              <h1
                style={{
                  fontSize: 56,
                  fontWeight: 900,
                  background: "linear-gradient(to right, #10b981, #14b8a6, #06b6d4)",
                  backgroundClip: "text",
                  color: "transparent",
                  margin: 0,
                  letterSpacing: "-0.04em",
                  lineHeight: 1.12,
                  display: "flex",
                }}
              >
                Wills & Estate Planning
              </h1>
            </div>

            <p
              style={{
                fontSize: 21,
                color: "#94a3b8",
                margin: 0,
                marginBottom: 28,
                lineHeight: 1.5,
                fontWeight: 400,
                display: "flex",
              }}
            >
              {"Twelve axioms, nine phases, seventy-six tooltips — one attorney-ready handoff."}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {["Claude Code", "Codex", "9-Phase Intake"].map((tag) => (
                <div
                  key={tag}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "6px 14px",
                    borderRadius: 8,
                    background: "rgba(16,185,129,0.08)",
                    border: "1px solid rgba(16,185,129,0.2)",
                  }}
                >
                  <span style={{ color: "#a7f3d0", fontSize: 13, fontWeight: 600, display: "flex" }}>
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
              "linear-gradient(90deg, transparent 0%, #10b981 25%, #14b8a6 50%, #06b6d4 75%, transparent 100%)",
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
    },
  );
}
