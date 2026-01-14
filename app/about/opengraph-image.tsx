import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "About Jeffrey Emanuel - Background, Experience & Philosophy";
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
            "linear-gradient(145deg, #0a0a12 0%, #0f1520 35%, #141a28 65%, #0a0a12 100%)",
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
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%2310b981' stroke-width='0.5'%3E%3Cpath d='M0 20h40M20 0v40'/%3E%3C/g%3E%3C/svg%3E")`,
            display: "flex",
          }}
        />

        {/* Glowing orb - emerald top left */}
        <div
          style={{
            position: "absolute",
            top: -160,
            left: -140,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(16,185,129,0.16) 0%, transparent 60%)",
            display: "flex",
          }}
        />

        {/* Glowing orb - teal bottom right */}
        <div
          style={{
            position: "absolute",
            bottom: -200,
            right: -140,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(20,184,166,0.12) 0%, transparent 60%)",
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
          {/* Left side - Person/Story icon */}
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
                  "radial-gradient(circle, rgba(16,185,129,0.28) 0%, rgba(20,184,166,0.18) 50%, transparent 70%)",
                filter: "blur(28px)",
                display: "flex",
              }}
            />

            {/* Story/Journey SVG - Abstract path/timeline representation */}
            <svg
              width="180"
              height="180"
              viewBox="0 0 100 100"
              fill="none"
              style={{
                filter: "drop-shadow(0 0 22px rgba(16,185,129,0.4))",
              }}
            >
              <defs>
                <linearGradient id="aboutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>

              {/* Outer circle - representing completeness */}
              <circle
                cx="50"
                cy="50"
                r="44"
                stroke="url(#aboutGrad)"
                strokeWidth="2"
                fill="none"
                opacity="0.6"
              />

              {/* Journey path - winding road from bottom to top */}
              <path
                d="M30 85 Q 20 70, 35 60 T 55 45 T 45 30 T 60 15"
                stroke="#10b981"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                opacity="0.8"
              />

              {/* Milestone dots along the path */}
              <circle cx="30" cy="85" r="6" fill="#10b981" opacity="0.9" />
              <circle cx="30" cy="85" r="3" fill="rgba(255,255,255,0.3)" />

              <circle cx="35" cy="60" r="5" fill="#14b8a6" opacity="0.85" />
              <circle cx="35" cy="60" r="2.5" fill="rgba(255,255,255,0.3)" />

              <circle cx="55" cy="45" r="5" fill="#14b8a6" opacity="0.85" />
              <circle cx="55" cy="45" r="2.5" fill="rgba(255,255,255,0.3)" />

              <circle cx="45" cy="30" r="5" fill="#3b82f6" opacity="0.85" />
              <circle cx="45" cy="30" r="2.5" fill="rgba(255,255,255,0.3)" />

              <circle cx="60" cy="15" r="7" fill="#3b82f6" opacity="0.9" />
              <circle cx="60" cy="15" r="4" fill="rgba(255,255,255,0.3)" />

              {/* Star at the destination */}
              <path
                d="M60 8 L61.5 12 L66 12.5 L62.5 15 L63.5 19.5 L60 17 L56.5 19.5 L57.5 15 L54 12.5 L58.5 12 Z"
                fill="#f59e0b"
                opacity="0.9"
              />

              {/* Radiating lines from center - representing impact */}
              <line x1="50" y1="50" x2="80" y2="35" stroke="#10b981" strokeWidth="0.8" opacity="0.3" />
              <line x1="50" y1="50" x2="85" y2="55" stroke="#14b8a6" strokeWidth="0.8" opacity="0.3" />
              <line x1="50" y1="50" x2="75" y2="75" stroke="#3b82f6" strokeWidth="0.8" opacity="0.3" />
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
                background: "rgba(16,185,129,0.12)",
                border: "1px solid rgba(16,185,129,0.28)",
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  color: "#10b981",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
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
                fontSize: 64,
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
              Jeffrey Emanuel
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: 26,
                fontWeight: 600,
                background:
                  "linear-gradient(90deg, #10b981 0%, #14b8a6 50%, #3b82f6 100%)",
                backgroundClip: "text",
                color: "transparent",
                margin: 0,
                marginBottom: 22,
                display: "flex",
              }}
            >
              The Story Behind the Code
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
              From Yale economics to AI engineering - a journey through finance,
              startups, and building systems that amplify human intelligence
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
                  background: "rgba(16,185,129,0.14)",
                  border: "1px solid rgba(16,185,129,0.26)",
                }}
              >
                <span style={{ color: "#34d399", fontWeight: 600, display: "flex" }}>
                  Background
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "7px 14px",
                  borderRadius: 7,
                  background: "rgba(20,184,166,0.14)",
                  border: "1px solid rgba(20,184,166,0.26)",
                }}
              >
                <span style={{ color: "#2dd4bf", fontWeight: 600, display: "flex" }}>
                  Experience
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
                  Philosophy
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
              "linear-gradient(90deg, transparent 0%, #10b981 25%, #14b8a6 50%, #3b82f6 75%, transparent 100%)",
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
          <span style={{ display: "flex" }}>jeffreyemanuel.com/about</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
