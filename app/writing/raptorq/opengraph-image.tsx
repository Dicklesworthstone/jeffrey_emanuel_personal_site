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
            "linear-gradient(145deg, #0a0a12 0%, #0f1218 35%, #121620 65%, #0a0a12 100%)",
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
          {/* Left side - Fountain code visualization */}
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
                  "radial-gradient(circle, rgba(34,211,238,0.28) 0%, rgba(168,85,247,0.18) 50%, transparent 70%)",
                filter: "blur(28px)",
                display: "flex",
              }}
            />

            {/* Network/fountain SVG */}
            <svg
              width="200"
              height="200"
              viewBox="0 0 100 100"
              fill="none"
              style={{
                filter: "drop-shadow(0 0 24px rgba(34,211,238,0.35))",
              }}
            >
              <defs>
                <linearGradient id="rqGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>

              {/* Outer ring */}
              <circle cx="50" cy="50" r="45" stroke="url(#rqGrad)" strokeWidth="2" fill="none" opacity="0.6" />
              <circle cx="50" cy="50" r="38" stroke="#22d3ee" strokeWidth="0.5" fill="none" opacity="0.3" />

              {/* Source nodes (top) */}
              <rect x="30" y="15" width="10" height="10" rx="2" fill="#0f172a" stroke="#22d3ee" strokeWidth="1.5" opacity="0.9" />
              <rect x="45" y="12" width="10" height="10" rx="2" fill="#0f172a" stroke="#22d3ee" strokeWidth="1.5" opacity="0.9" />
              <rect x="60" y="15" width="10" height="10" rx="2" fill="#0f172a" stroke="#22d3ee" strokeWidth="1.5" opacity="0.9" />

              {/* Flow lines from source to encoded */}
              <path d="M35 25 Q 40 50 30 72" stroke="#22d3ee" strokeWidth="1" fill="none" opacity="0.4" />
              <path d="M50 22 Q 50 50 50 72" stroke="#3b82f6" strokeWidth="1" fill="none" opacity="0.4" />
              <path d="M65 25 Q 60 50 70 72" stroke="#a855f7" strokeWidth="1" fill="none" opacity="0.4" />
              <path d="M35 25 Q 55 45 70 72" stroke="#22d3ee" strokeWidth="0.8" fill="none" opacity="0.25" />
              <path d="M65 25 Q 45 45 30 72" stroke="#a855f7" strokeWidth="0.8" fill="none" opacity="0.25" />

              {/* Encoded nodes (bottom) */}
              <circle cx="30" cy="78" r="6" fill="#0f172a" stroke="#a855f7" strokeWidth="1.5" opacity="0.9" />
              <circle cx="50" cy="80" r="6" fill="#0f172a" stroke="#a855f7" strokeWidth="1.5" opacity="0.9" />
              <circle cx="70" cy="78" r="6" fill="#0f172a" stroke="#a855f7" strokeWidth="1.5" opacity="0.9" />

              {/* Center symbol */}
              <circle cx="50" cy="50" r="8" fill="rgba(34,211,238,0.15)" stroke="#22d3ee" strokeWidth="1" opacity="0.6" />
              <path d="M47 50 L50 46 L53 50 L50 54 Z" fill="#22d3ee" opacity="0.8" />
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
                Deep Dive — RFC 6330
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
              The Black Magic of
            </h1>
            <h1
              style={{
                fontSize: 56,
                fontWeight: 800,
                background:
                  "linear-gradient(135deg, #22d3ee 0%, #3b82f6 50%, #a855f7 100%)",
                backgroundClip: "text",
                color: "transparent",
                margin: 0,
                marginBottom: 22,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                display: "flex",
              }}
            >
              Liquid Data
            </h1>

            {/* Description */}
            <p
              style={{
                fontSize: 20,
                color: "#94a3b8",
                margin: 0,
                marginBottom: 28,
                lineHeight: 1.55,
                display: "flex",
              }}
            >
              How RaptorQ turns any file into an infinite stream of
              self-healing packets with under 5% overhead
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
                <span style={{ color: "#22d3ee", fontWeight: 600, display: "flex" }}>
                  Fountain Codes
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
                  Linear Algebra
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
                  O(K) Decoding
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
              "linear-gradient(90deg, transparent 0%, #22d3ee 25%, #a855f7 50%, #f472b6 75%, transparent 100%)",
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
