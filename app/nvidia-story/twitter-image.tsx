import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "The $600B Drop - How a Blog Post Moved Markets | Jeffrey Emanuel";
export const size = {
  width: 1200,
  height: 600,
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
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          background:
            "linear-gradient(145deg, #0a0a12 0%, #1a0808 30%, #200a0a 60%, #0a0a12 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
          padding: "45px 65px",
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

        {/* Glowing orb - red top right */}
        <div
          style={{
            position: "absolute",
            top: -140,
            right: -100,
            width: 450,
            height: 450,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(239,68,68,0.22) 0%, transparent 60%)",
            display: "flex",
          }}
        />

        {/* Glowing orb - orange bottom left */}
        <div
          style={{
            position: "absolute",
            bottom: -180,
            left: -120,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(249,115,22,0.14) 0%, transparent 60%)",
            display: "flex",
          }}
        />

        {/* Left content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            zIndex: 10,
            maxWidth: "58%",
          }}
        >
          {/* Page label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 16,
              padding: "6px 14px",
              borderRadius: 16,
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.26)",
              width: "fit-content",
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: "#ef4444",
                fontWeight: 600,
                letterSpacing: "0.07em",
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
              fontSize: 56,
              fontWeight: 800,
              background:
                "linear-gradient(135deg, #ffffff 0%, #e2e8f0 50%, #94a3b8 100%)",
              backgroundClip: "text",
              color: "transparent",
              margin: 0,
              marginBottom: 8,
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
              fontSize: 22,
              fontWeight: 600,
              background:
                "linear-gradient(90deg, #ef4444 0%, #f97316 50%, #f59e0b 100%)",
              backgroundClip: "text",
              color: "transparent",
              margin: 0,
              marginBottom: 18,
              display: "flex",
            }}
          >
            When a Blog Post Moved Markets
          </p>

          {/* Description */}
          <p
            style={{
              fontSize: 16,
              color: "#94a3b8",
              margin: 0,
              marginBottom: 24,
              lineHeight: 1.5,
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
              gap: 12,
              fontSize: 13,
            }}
          >
            <div
              style={{
                display: "flex",
                padding: "6px 12px",
                borderRadius: 6,
                background: "rgba(239,68,68,0.13)",
                border: "1px solid rgba(239,68,68,0.24)",
              }}
            >
              <span style={{ color: "#f87171", fontWeight: 600, display: "flex" }}>
                Nvidia
              </span>
            </div>
            <div
              style={{
                display: "flex",
                padding: "6px 12px",
                borderRadius: 6,
                background: "rgba(249,115,22,0.13)",
                border: "1px solid rgba(249,115,22,0.24)",
              }}
            >
              <span style={{ color: "#fb923c", fontWeight: 600, display: "flex" }}>
                Short Thesis
              </span>
            </div>
            <div
              style={{
                display: "flex",
                padding: "6px 12px",
                borderRadius: 6,
                background: "rgba(245,158,11,0.13)",
                border: "1px solid rgba(245,158,11,0.24)",
              }}
            >
              <span style={{ color: "#fbbf24", fontWeight: 600, display: "flex" }}>
                Markets
              </span>
            </div>
          </div>
        </div>

        {/* Right - Visual */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 220,
              height: 220,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(239,68,68,0.28) 0%, rgba(249,115,22,0.16) 50%, transparent 70%)",
              filter: "blur(26px)",
              display: "flex",
            }}
          />

          <svg
            width="200"
            height="200"
            viewBox="0 0 100 100"
            fill="none"
            style={{
              filter: "drop-shadow(0 0 20px rgba(239,68,68,0.38))",
            }}
          >
            <defs>
              <linearGradient id="tNvidiaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="50%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
              <linearGradient id="tDropGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(239,68,68,0.3)" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>

            {/* Outer circle */}
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="url(#tNvidiaGrad)"
              strokeWidth="2.5"
              fill="none"
              opacity="0.65"
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
              fill="url(#tDropGrad)"
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

        {/* Bottom accent */}
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

        {/* URL */}
        <div
          style={{
            position: "absolute",
            top: 22,
            right: 28,
            fontSize: 13,
            color: "#4b5563",
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
