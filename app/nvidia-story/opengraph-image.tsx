import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "The $600B Drop - How a Blog Post Moved Markets | Jeffrey Emanuel";
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
            "linear-gradient(145deg, #0a0a12 0%, #1a0808 35%, #200a0a 65%, #0a0a12 100%)",
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
            opacity: 0.025,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ef4444' stroke-width='0.5'%3E%3Cpath d='M0 20h40M20 0v40'/%3E%3C/g%3E%3C/svg%3E")`,
            display: "flex",
          }}
        />

        {/* Glowing orb - red top left */}
        <div
          style={{
            position: "absolute",
            top: -160,
            left: -140,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(239,68,68,0.18) 0%, transparent 60%)",
            display: "flex",
          }}
        />

        {/* Glowing orb - orange bottom right */}
        <div
          style={{
            position: "absolute",
            bottom: -200,
            right: -140,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 60%)",
            display: "flex",
          }}
        />

        {/* Accent orb - amber center */}
        <div
          style={{
            position: "absolute",
            top: 150,
            right: 300,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 60%)",
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
            gap: 60,
            zIndex: 10,
            padding: "40px 70px",
            width: "100%",
          }}
        >
          {/* Left side - Downtrend chart icon */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {/* Outer glow */}
            <div
              style={{
                position: "absolute",
                width: 240,
                height: 240,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(239,68,68,0.28) 0%, rgba(249,115,22,0.18) 50%, transparent 70%)",
                filter: "blur(28px)",
                display: "flex",
              }}
            />

            {/* Market drop SVG - downward chart with dramatic crash */}
            <svg
              width="180"
              height="180"
              viewBox="0 0 100 100"
              fill="none"
              style={{
                filter: "drop-shadow(0 0 22px rgba(239,68,68,0.4))",
              }}
            >
              <defs>
                <linearGradient id="nvidiaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="50%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
                <linearGradient id="dropGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(239,68,68,0.3)" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>

              {/* Outer circle */}
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke="url(#nvidiaGrad)"
                strokeWidth="2"
                fill="none"
                opacity="0.6"
              />

              {/* Price chart - rise then dramatic crash */}
              <path
                d="M15 65 L25 55 L35 50 L45 30 L50 25 L55 28 L58 60 L65 72 L75 78 L85 80"
                stroke="#ef4444"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.9"
              />

              {/* Fill under crash */}
              <path
                d="M50 25 L55 28 L58 60 L65 72 L75 78 L85 80 L85 85 L50 85 Z"
                fill="url(#dropGrad)"
                opacity="0.4"
              />

              {/* Crash arrow */}
              <path d="M56 40 L60 55 L52 50 Z" fill="#ef4444" opacity="0.8" />

              {/* Key data points */}
              <circle cx="50" cy="25" r="5" fill="#f59e0b" opacity="0.9" />
              <circle cx="50" cy="25" r="2.5" fill="rgba(255,255,255,0.4)" />

              <circle cx="58" cy="60" r="4" fill="#ef4444" opacity="0.9" />
              <circle cx="58" cy="60" r="2" fill="rgba(255,255,255,0.3)" />

              {/* Horizontal grid lines */}
              <line x1="12" y1="40" x2="88" y2="40" stroke="#ef4444" strokeWidth="0.5" opacity="0.15" />
              <line x1="12" y1="60" x2="88" y2="60" stroke="#ef4444" strokeWidth="0.5" opacity="0.15" />
              <line x1="12" y1="80" x2="88" y2="80" stroke="#ef4444" strokeWidth="0.5" opacity="0.15" />
            </svg>
          </div>

          {/* Right side - Text content */}
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
                gap: 8,
                marginBottom: 18,
                padding: "7px 15px",
                borderRadius: 18,
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.28)",
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  color: "#ef4444",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  display: "flex",
                }}
              >
                Feature Story
              </span>
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: 62,
                fontWeight: 800,
                background:
                  "linear-gradient(135deg, #ffffff 0%, #e2e8f0 50%, #94a3b8 100%)",
                backgroundClip: "text",
                color: "transparent",
                margin: 0,
                marginBottom: 10,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                display: "flex",
              }}
            >
              The $600B Drop
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: 24,
                fontWeight: 600,
                background:
                  "linear-gradient(90deg, #ef4444 0%, #f97316 50%, #f59e0b 100%)",
                backgroundClip: "text",
                color: "transparent",
                margin: 0,
                marginBottom: 22,
                display: "flex",
              }}
            >
              When a Blog Post Moved Markets
            </p>

            {/* Description */}
            <p
              style={{
                fontSize: 18,
                color: "#94a3b8",
                margin: 0,
                marginBottom: 28,
                lineHeight: 1.55,
                display: "flex",
              }}
            >
              How a 12,000-word post from a Brooklyn apartment contributed to
              the largest single-day market cap drop in stock market history
            </p>

            {/* Tags */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                fontSize: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "7px 14px",
                  borderRadius: 7,
                  background: "rgba(239,68,68,0.14)",
                  border: "1px solid rgba(239,68,68,0.26)",
                }}
              >
                <span style={{ color: "#f87171", fontWeight: 600, display: "flex" }}>
                  Nvidia
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "7px 14px",
                  borderRadius: 7,
                  background: "rgba(249,115,22,0.14)",
                  border: "1px solid rgba(249,115,22,0.26)",
                }}
              >
                <span style={{ color: "#fb923c", fontWeight: 600, display: "flex" }}>
                  Short Thesis
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "7px 14px",
                  borderRadius: 7,
                  background: "rgba(245,158,11,0.14)",
                  border: "1px solid rgba(245,158,11,0.26)",
                }}
              >
                <span style={{ color: "#fbbf24", fontWeight: 600, display: "flex" }}>
                  Markets
                </span>
              </div>
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
              "linear-gradient(90deg, transparent 0%, #ef4444 25%, #f97316 50%, #f59e0b 75%, transparent 100%)",
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
          <span style={{ display: "flex" }}>jeffreyemanuel.com/nvidia-story</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
