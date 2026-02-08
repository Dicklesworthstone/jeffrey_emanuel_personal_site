import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Consulting - Jeffrey Emanuel | AI Strategy for Hedge Funds & Allocators";
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
            "linear-gradient(145deg, #0a0a12 0%, #12100a 35%, #1a1408 65%, #0a0a12 100%)",
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
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23f59e0b' stroke-width='0.5'%3E%3Cpath d='M0 20h40M20 0v40'/%3E%3C/g%3E%3C/svg%3E")`,
            display: "flex",
          }}
        />

        {/* Glowing orb - amber top left */}
        <div
          style={{
            position: "absolute",
            top: -160,
            left: -140,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(245,158,11,0.16) 0%, transparent 60%)",
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
              "radial-gradient(circle, rgba(234,88,12,0.12) 0%, transparent 60%)",
            display: "flex",
          }}
        />

        {/* Accent orb - blue center */}
        <div
          style={{
            position: "absolute",
            top: 150,
            right: 300,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 60%)",
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
          {/* Left side - Strategy/Chart icon */}
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
                  "radial-gradient(circle, rgba(245,158,11,0.28) 0%, rgba(234,88,12,0.18) 50%, transparent 70%)",
                filter: "blur(28px)",
                display: "flex",
              }}
            />

            {/* Strategy SVG */}
            <svg
              width="180"
              height="180"
              viewBox="0 0 100 100"
              fill="none"
              style={{
                filter: "drop-shadow(0 0 22px rgba(245,158,11,0.4))",
              }}
            >
              <defs>
                <linearGradient id="consultGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="50%" stopColor="#ea580c" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>

              {/* Outer diamond frame */}
              <polygon
                points="50,5 95,50 50,95 5,50"
                stroke="url(#consultGrad)"
                strokeWidth="2"
                fill="none"
                opacity="0.6"
              />

              {/* Inner diamond */}
              <polygon
                points="50,22 78,50 50,78 22,50"
                stroke="#f59e0b"
                strokeWidth="1"
                fill="none"
                opacity="0.4"
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
                background: "rgba(245,158,11,0.12)",
                border: "1px solid rgba(245,158,11,0.28)",
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  color: "#f59e0b",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
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
                fontSize: 60,
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
              AI Strategy
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: 26,
                fontWeight: 600,
                background:
                  "linear-gradient(90deg, #f59e0b 0%, #ea580c 50%, #3b82f6 100%)",
                backgroundClip: "text",
                color: "transparent",
                margin: 0,
                marginBottom: 22,
                display: "flex",
              }}
            >
              For Hedge Funds & Allocators
            </p>

            {/* Description */}
            <p
              style={{
                fontSize: 19,
                color: "#94a3b8",
                margin: 0,
                marginBottom: 28,
                lineHeight: 1.55,
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
                  background: "rgba(245,158,11,0.14)",
                  border: "1px solid rgba(245,158,11,0.26)",
                }}
              >
                <span style={{ color: "#fbbf24", fontWeight: 600, display: "flex" }}>
                  AI Strategy
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "7px 14px",
                  borderRadius: 7,
                  background: "rgba(234,88,12,0.14)",
                  border: "1px solid rgba(234,88,12,0.26)",
                }}
              >
                <span style={{ color: "#fb923c", fontWeight: 600, display: "flex" }}>
                  Risk Analysis
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "7px 14px",
                  borderRadius: 7,
                  background: "rgba(59,130,246,0.14)",
                  border: "1px solid rgba(59,130,246,0.26)",
                }}
              >
                <span style={{ color: "#60a5fa", fontWeight: 600, display: "flex" }}>
                  Automation
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
              "linear-gradient(90deg, transparent 0%, #f59e0b 25%, #ea580c 50%, #3b82f6 75%, transparent 100%)",
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
          <span style={{ display: "flex" }}>jeffreyemanuel.com/consulting</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
