import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "About Jeffrey Emanuel - Background, Experience & Philosophy";
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
            "linear-gradient(145deg, #0a0a12 0%, #0f1520 35%, #141a28 65%, #0a0a12 100%)",
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
            opacity: 0.022,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%2310b981' stroke-width='0.5'%3E%3Cpath d='M0 20h40M20 0v40'/%3E%3C/g%3E%3C/svg%3E")`,
            display: "flex",
          }}
        />

        {/* Glowing orbs */}
        <div
          style={{
            position: "absolute",
            top: -130,
            right: -90,
            width: 420,
            height: 420,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 60%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -160,
            left: -110,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(20,184,166,0.14) 0%, transparent 60%)",
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
              background: "rgba(16,185,129,0.12)",
              border: "1px solid rgba(16,185,129,0.26)",
              width: "fit-content",
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: "#10b981",
                fontWeight: 600,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                display: "flex",
              }}
            >
              About
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
            Jeffrey Emanuel
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 24,
              fontWeight: 600,
              background:
                "linear-gradient(90deg, #10b981 0%, #14b8a6 50%, #3b82f6 100%)",
              backgroundClip: "text",
              color: "transparent",
              margin: 0,
              marginBottom: 18,
              display: "flex",
            }}
          >
            The Story Behind the Code
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
            From Yale economics to AI engineering - a journey through finance,
            startups, and building systems that amplify human intelligence
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
                background: "rgba(16,185,129,0.13)",
                border: "1px solid rgba(16,185,129,0.24)",
              }}
            >
              <span style={{ color: "#34d399", fontWeight: 600, display: "flex" }}>
                Background
              </span>
            </div>
            <div
              style={{
                display: "flex",
                padding: "6px 12px",
                borderRadius: 6,
                background: "rgba(20,184,166,0.13)",
                border: "1px solid rgba(20,184,166,0.24)",
              }}
            >
              <span style={{ color: "#2dd4bf", fontWeight: 600, display: "flex" }}>
                Experience
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
                Philosophy
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
                "radial-gradient(circle, rgba(16,185,129,0.28) 0%, rgba(20,184,166,0.16) 50%, transparent 70%)",
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
              filter: "drop-shadow(0 0 20px rgba(16,185,129,0.38))",
            }}
          >
            <defs>
              <linearGradient id="tAboutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#14b8a6" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>

            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="url(#tAboutGrad)"
              strokeWidth="2.5"
              fill="none"
              opacity="0.65"
            />

            <path
              d="M30 85 Q 20 70, 35 60 T 55 45 T 45 30 T 60 15"
              stroke="#10b981"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
              opacity="0.85"
            />

            <circle cx="30" cy="85" r="7" fill="#10b981" opacity="0.9" />
            <circle cx="30" cy="85" r="3.5" fill="rgba(255,255,255,0.3)" />

            <circle cx="35" cy="60" r="6" fill="#14b8a6" opacity="0.85" />
            <circle cx="35" cy="60" r="3" fill="rgba(255,255,255,0.3)" />

            <circle cx="55" cy="45" r="6" fill="#14b8a6" opacity="0.85" />
            <circle cx="55" cy="45" r="3" fill="rgba(255,255,255,0.3)" />

            <circle cx="45" cy="30" r="6" fill="#3b82f6" opacity="0.85" />
            <circle cx="45" cy="30" r="3" fill="rgba(255,255,255,0.3)" />

            <circle cx="60" cy="15" r="8" fill="#3b82f6" opacity="0.9" />
            <circle cx="60" cy="15" r="4.5" fill="rgba(255,255,255,0.3)" />

            <path
              d="M60 6 L62 11 L67.5 11.5 L63.5 14.5 L64.5 20 L60 17 L55.5 20 L56.5 14.5 L52.5 11.5 L58 11 Z"
              fill="#f59e0b"
              opacity="0.9"
            />
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
              "linear-gradient(90deg, transparent 0%, #10b981 25%, #14b8a6 50%, #3b82f6 75%, transparent 100%)",
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
          <span style={{ display: "flex" }}>jeffreyemanuel.com/about</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
