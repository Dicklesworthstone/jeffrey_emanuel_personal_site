import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Consulting - Jeffrey Emanuel | AI Strategy for Hedge Funds & Allocators";
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
            "linear-gradient(145deg, #0a0a12 0%, #12100a 30%, #1a1408 60%, #0a0a12 100%)",
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
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23f59e0b' stroke-width='0.5'%3E%3Cpath d='M0 20h40M20 0v40'/%3E%3C/g%3E%3C/svg%3E")`,
            display: "flex",
          }}
        />

        {/* Glowing orb - amber top right */}
        <div
          style={{
            position: "absolute",
            top: -140,
            right: -100,
            width: 450,
            height: 450,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 60%)",
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
              "radial-gradient(circle, rgba(234,88,12,0.14) 0%, transparent 60%)",
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
              background: "rgba(245,158,11,0.12)",
              border: "1px solid rgba(245,158,11,0.26)",
              width: "fit-content",
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: "#f59e0b",
                fontWeight: 600,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                display: "flex",
              }}
            >
              Consulting
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
            AI Strategy
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 24,
              fontWeight: 600,
              background:
                "linear-gradient(90deg, #f59e0b 0%, #ea580c 50%, #3b82f6 100%)",
              backgroundClip: "text",
              color: "transparent",
              margin: 0,
              marginBottom: 18,
              display: "flex",
            }}
          >
            For Hedge Funds & Allocators
          </p>

          {/* Description */}
          <p
            style={{
              fontSize: 17,
              color: "#94a3b8",
              margin: 0,
              marginBottom: 24,
              lineHeight: 1.5,
              display: "flex",
            }}
          >
            Advising on AI automation strategy, risk analysis, and workflow
            design for institutional investors
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
                background: "rgba(245,158,11,0.13)",
                border: "1px solid rgba(245,158,11,0.24)",
              }}
            >
              <span style={{ color: "#fbbf24", fontWeight: 600, display: "flex" }}>
                AI Strategy
              </span>
            </div>
            <div
              style={{
                display: "flex",
                padding: "6px 12px",
                borderRadius: 6,
                background: "rgba(234,88,12,0.13)",
                border: "1px solid rgba(234,88,12,0.24)",
              }}
            >
              <span style={{ color: "#fb923c", fontWeight: 600, display: "flex" }}>
                Risk Analysis
              </span>
            </div>
            <div
              style={{
                display: "flex",
                padding: "6px 12px",
                borderRadius: 6,
                background: "rgba(59,130,246,0.13)",
                border: "1px solid rgba(59,130,246,0.24)",
              }}
            >
              <span style={{ color: "#60a5fa", fontWeight: 600, display: "flex" }}>
                Automation
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
                "radial-gradient(circle, rgba(245,158,11,0.28) 0%, rgba(234,88,12,0.16) 50%, transparent 70%)",
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
              filter: "drop-shadow(0 0 20px rgba(245,158,11,0.38))",
            }}
          >
            <defs>
              <linearGradient id="tConsultGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="50%" stopColor="#ea580c" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>

            {/* Outer diamond frame */}
            <polygon
              points="50,5 95,50 50,95 5,50"
              stroke="url(#tConsultGrad)"
              strokeWidth="2.5"
              fill="none"
              opacity="0.65"
            />

            {/* Inner diamond */}
            <polygon
              points="50,22 78,50 50,78 22,50"
              stroke="#f59e0b"
              strokeWidth="1"
              fill="none"
              opacity="0.35"
            />

            {/* Center circle */}
            <circle cx="50" cy="50" r="10" fill="#f59e0b" opacity="0.9" />
            <circle cx="50" cy="50" r="6" fill="rgba(255,255,255,0.2)" />

            {/* Upward trend line */}
            <path
              d="M20 75 L35 60 L50 45 L65 35 L80 20"
              stroke="#f59e0b"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              opacity="0.8"
            />

            {/* Data points on trend */}
            <circle cx="20" cy="75" r="4" fill="#ea580c" opacity="0.9" />
            <circle cx="35" cy="60" r="4" fill="#f59e0b" opacity="0.9" />
            <circle cx="50" cy="45" r="4" fill="#f59e0b" opacity="0.9" />
            <circle cx="65" cy="35" r="4" fill="#f59e0b" opacity="0.9" />
            <circle cx="80" cy="20" r="5" fill="#3b82f6" opacity="0.9" />
            <circle cx="80" cy="20" r="2.5" fill="rgba(255,255,255,0.4)" />

            {/* Corner nodes */}
            <circle cx="50" cy="5" r="4" fill="#f59e0b" opacity="0.7" />
            <circle cx="95" cy="50" r="4" fill="#ea580c" opacity="0.7" />
            <circle cx="50" cy="95" r="4" fill="#ea580c" opacity="0.7" />
            <circle cx="5" cy="50" r="4" fill="#3b82f6" opacity="0.7" />
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
              "linear-gradient(90deg, transparent 0%, #f59e0b 25%, #ea580c 50%, #3b82f6 75%, transparent 100%)",
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
          <span style={{ display: "flex" }}>jeffreyemanuel.com/consulting</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
