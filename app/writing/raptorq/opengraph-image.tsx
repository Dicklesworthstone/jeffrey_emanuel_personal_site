import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "RaptorQ: The Black Magic of Liquid Data | Jeffrey Emanuel";
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
            "linear-gradient(145deg, #020204 0%, #050508 35%, #080812 65%, #020204 100%)",
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
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%2322d3ee' stroke-width='0.5'%3E%3Cpath d='M0 20h40M20 0v40'/%3E%3C/g%3E%3C/svg%3E")`,
            display: "flex",
          }}
        />

        {/* Glowing orb - cyan top left */}
        <div
          style={{
            position: "absolute",
            top: -160,
            left: -130,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(34,211,238,0.18) 0%, transparent 60%)",
            display: "flex",
          }}
        />

        {/* Glowing orb - purple bottom right */}
        <div
          style={{
            position: "absolute",
            bottom: -200,
            right: -130,
            width: 580,
            height: 580,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 60%)",
            display: "flex",
          }}
        />

        {/* Accent orb - blue center */}
        <div
          style={{
            position: "absolute",
            top: 140,
            right: 280,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 60%)",
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
            gap: 65,
            zIndex: 10,
            padding: "40px 70px",
            width: "100%",
          }}
        >
          {/* Left side - "Liquid Data" / Fountain Visual */}
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
                width: 260,
                height: 260,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(34,211,238,0.3) 0%, rgba(168,85,247,0.2) 50%, transparent 70%)",
                filter: "blur(30px)",
                display: "flex",
              }}
            />

            {/* Fountain Code / Liquid Data SVG */}
            <svg
              width="200"
              height="200"
              viewBox="0 0 100 100"
              fill="none"
              style={{
                filter: "drop-shadow(0 0 25px rgba(34,211,238,0.4))",
              }}
            >
              <defs>
                <linearGradient id="liquidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
                <filter id="fountainBlur" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
                </filter>
              </defs>

              {/* Central Source Block */}
              <rect
                x="35"
                y="75"
                width="30"
                height="12"
                rx="4"
                fill="url(#liquidGrad)"
                opacity="0.9"
              />
              <text x="50" y="83" fontFamily="monospace" fontSize="6" fill="#000" fontWeight="bold" textAnchor="middle">SOURCE</text>

              {/* Fountain Spray - represented by floating packets/particles */}
              {/* Arc 1 */}
              <circle cx="20" cy="40" r="3" fill="#22d3ee" opacity="0.8" />
              <circle cx="28" cy="25" r="2.5" fill="#22d3ee" opacity="0.6" />
              <circle cx="45" cy="15" r="3.5" fill="#3b82f6" opacity="0.9" />
              <circle cx="65" cy="20" r="2.8" fill="#3b82f6" opacity="0.7" />
              <circle cx="80" cy="35" r="3.2" fill="#a855f7" opacity="0.8" />
              <circle cx="85" cy="55" r="2.5" fill="#a855f7" opacity="0.5" />

              {/* Smaller particles */}
              <circle cx="15" cy="60" r="1.5" fill="#22d3ee" opacity="0.4" />
              <circle cx="35" cy="10" r="1.2" fill="#3b82f6" opacity="0.5" />
              <circle cx="55" cy="5" r="1.8" fill="#3b82f6" opacity="0.6" />
              <circle cx="75" cy="12" r="1.4" fill="#a855f7" opacity="0.4" />
              <circle cx="95" cy="45" r="1.2" fill="#a855f7" opacity="0.3" />

              {/* Connection lines - representing encoding relations */}
              <path d="M50 75 L20 40" stroke="url(#liquidGrad)" strokeWidth="0.5" opacity="0.3" />
              <path d="M50 75 L45 15" stroke="url(#liquidGrad)" strokeWidth="0.5" opacity="0.3" />
              <path d="M50 75 L80 35" stroke="url(#liquidGrad)" strokeWidth="0.5" opacity="0.3" />

              {/* Matrix-like box representation */}
              <rect x="15" y="35" width="10" height="10" rx="2" stroke="#22d3ee" strokeWidth="1" fill="none" opacity="0.6" />
              <rect x="40" y="10" width="10" height="10" rx="2" stroke="#3b82f6" strokeWidth="1" fill="none" opacity="0.6" />
              <rect x="75" y="30" width="10" height="10" rx="2" stroke="#a855f7" strokeWidth="1" fill="none" opacity="0.6" />
              
              <text x="20" y="42" fontFamily="monospace" fontSize="5" fill="#22d3ee" textAnchor="middle" fontWeight="bold">101</text>
              <text x="45" y="17" fontFamily="monospace" fontSize="5" fill="#3b82f6" textAnchor="middle" fontWeight="bold">011</text>
              <text x="80" y="37" fontFamily="monospace" fontSize="5" fill="#a855f7" textAnchor="middle" fontWeight="bold">110</text>
            </svg>
          </div>

          {/* Right side - Text content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              maxWidth: 620,
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
                background: "rgba(34,211,238,0.12)",
                border: "1px solid rgba(34,211,238,0.28)",
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  color: "#22d3ee",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  display: "flex",
                }}
              >
                Deep Dive / Protocol Intelligence
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
              The Black Magic of Liquid Data
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: 26,
                fontWeight: 600,
                background:
                  "linear-gradient(90deg, #22d3ee 0%, #3b82f6 50%, #a855f7 100%)",
                backgroundClip: "text",
                color: "transparent",
                margin: 0,
                marginBottom: 22,
                display: "flex",
              }}
            >
              Fountain Codes & RFC 6330
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
              How RaptorQ turns any file into an infinite stream of 
              interchangeable packets with near-zero overhead.
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
                  background: "rgba(34,211,238,0.14)",
                  border: "1px solid rgba(34,211,238,0.26)",
                }}
              >
                <span style={{ color: "#67e8f9", fontWeight: 600, display: "flex" }}>
                  RaptorQ
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
                  Algorithms
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "7px 14px",
                  borderRadius: 7,
                  background: "rgba(168,85,247,0.14)",
                  border: "1px solid rgba(168,85,247,0.26)",
                }}
              >
                <span style={{ color: "#c084fc", fontWeight: 600, display: "flex" }}>
                  Math
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
              "linear-gradient(90deg, transparent 0%, #22d3ee 25%, #3b82f6 50%, #a855f7 75%, transparent 100%)",
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
          <span style={{ display: "flex" }}>jeffreyemanuel.com/writing/raptorq</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
