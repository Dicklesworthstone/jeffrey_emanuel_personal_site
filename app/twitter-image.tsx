import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Jeffrey Emanuel - AI/ML Engineer & Software Architect";
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
            "linear-gradient(145deg, #0a0a12 0%, #0d1420 30%, #0f1628 60%, #0a0a12 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
          padding: "50px 70px",
        }}
      >
        {/* Grid pattern overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.025,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%233b82f6' stroke-width='0.5'%3E%3Cpath d='M0 20h40M20 0v40'/%3E%3C/g%3E%3C/svg%3E")`,
            display: "flex",
          }}
        />

        {/* Glowing orb - blue top right */}
        <div
          style={{
            position: "absolute",
            top: -140,
            right: -100,
            width: 450,
            height: 450,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(59,130,246,0.22) 0%, transparent 60%)",
            display: "flex",
          }}
        />

        {/* Glowing orb - purple bottom left */}
        <div
          style={{
            position: "absolute",
            bottom: -180,
            left: -120,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 60%)",
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
            maxWidth: "60%",
          }}
        >
          {/* Name */}
          <h1
            style={{
              fontSize: 60,
              fontWeight: 800,
              background:
                "linear-gradient(135deg, #ffffff 0%, #e2e8f0 50%, #94a3b8 100%)",
              backgroundClip: "text",
              color: "transparent",
              margin: 0,
              marginBottom: 6,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              display: "flex",
            }}
          >
            Jeffrey Emanuel
          </h1>

          {/* Role with gradient */}
          <p
            style={{
              fontSize: 26,
              fontWeight: 600,
              background:
                "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)",
              backgroundClip: "text",
              color: "transparent",
              margin: 0,
              marginBottom: 20,
              display: "flex",
            }}
          >
            AI/ML Engineer & Software Architect
          </p>

          {/* Description */}
          <p
            style={{
              fontSize: 18,
              color: "#94a3b8",
              margin: 0,
              marginBottom: 26,
              lineHeight: 1.5,
              display: "flex",
            }}
          >
            Building intelligent systems and open-source tools for the AI-native
            development era
          </p>

          {/* Tags row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 14,
            }}
          >
            {/* AI Tag */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "6px 14px",
                borderRadius: 6,
                background: "rgba(59,130,246,0.14)",
                border: "1px solid rgba(59,130,246,0.28)",
              }}
            >
              <span style={{ color: "#60a5fa", fontWeight: 600, display: "flex" }}>
                AI/ML
              </span>
            </div>

            {/* Systems Tag */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "6px 14px",
                borderRadius: 6,
                background: "rgba(139,92,246,0.14)",
                border: "1px solid rgba(139,92,246,0.28)",
              }}
            >
              <span style={{ color: "#a78bfa", fontWeight: 600, display: "flex" }}>
                Systems
              </span>
            </div>

            {/* Open Source Tag */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "6px 14px",
                borderRadius: 6,
                background: "rgba(34,211,238,0.14)",
                border: "1px solid rgba(34,211,238,0.28)",
              }}
            >
              <span style={{ color: "#22d3ee", fontWeight: 600, display: "flex" }}>
                Open Source
              </span>
            </div>
          </div>
        </div>

        {/* Right - Geometric Visual */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
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
                "radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(139,92,246,0.18) 45%, transparent 70%)",
              filter: "blur(30px)",
              display: "flex",
            }}
          />

          {/* Geometric SVG */}
          <svg
            width="220"
            height="220"
            viewBox="0 0 100 100"
            fill="none"
            style={{
              filter: "drop-shadow(0 0 22px rgba(59,130,246,0.4))",
            }}
          >
            <defs>
              <linearGradient id="tMainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <linearGradient id="tNodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
            </defs>

            {/* Outer hexagon frame */}
            <polygon
              points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5"
              stroke="url(#tMainGrad)"
              strokeWidth="2.5"
              fill="none"
              opacity="0.75"
            />

            {/* Inner hexagon */}
            <polygon
              points="50,20 75,35 75,65 50,80 25,65 25,35"
              stroke="#3b82f6"
              strokeWidth="1"
              fill="none"
              opacity="0.35"
            />

            {/* Center circle */}
            <circle cx="50" cy="50" r="14" fill="url(#tNodeGrad)" opacity="0.95" />
            <circle cx="50" cy="50" r="8" fill="rgba(255,255,255,0.2)" />

            {/* Connection nodes */}
            <circle cx="50" cy="5" r="6" fill="#3b82f6" opacity="0.9" />
            <line x1="50" y1="5" x2="50" y2="36" stroke="#3b82f6" strokeWidth="1.5" opacity="0.45" />

            <circle cx="90" cy="27.5" r="6" fill="#8b5cf6" opacity="0.9" />
            <line x1="90" y1="27.5" x2="62" y2="42" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.45" />

            <circle cx="90" cy="72.5" r="6" fill="#06b6d4" opacity="0.9" />
            <line x1="90" y1="72.5" x2="62" y2="58" stroke="#06b6d4" strokeWidth="1.5" opacity="0.45" />

            <circle cx="50" cy="95" r="6" fill="#3b82f6" opacity="0.9" />
            <line x1="50" y1="95" x2="50" y2="64" stroke="#3b82f6" strokeWidth="1.5" opacity="0.45" />

            <circle cx="10" cy="72.5" r="6" fill="#8b5cf6" opacity="0.9" />
            <line x1="10" y1="72.5" x2="38" y2="58" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.45" />

            <circle cx="10" cy="27.5" r="6" fill="#06b6d4" opacity="0.9" />
            <line x1="10" y1="27.5" x2="38" y2="42" stroke="#06b6d4" strokeWidth="1.5" opacity="0.45" />

            {/* Cross connections */}
            <line x1="50" y1="5" x2="90" y2="72.5" stroke="#3b82f6" strokeWidth="0.5" opacity="0.18" />
            <line x1="90" y1="27.5" x2="10" y2="72.5" stroke="#8b5cf6" strokeWidth="0.5" opacity="0.18" />
            <line x1="10" y1="27.5" x2="90" y2="27.5" stroke="#06b6d4" strokeWidth="0.5" opacity="0.18" />

            {/* Node highlights */}
            <circle cx="50" cy="5" r="3" fill="rgba(255,255,255,0.35)" />
            <circle cx="90" cy="27.5" r="3" fill="rgba(255,255,255,0.35)" />
            <circle cx="90" cy="72.5" r="3" fill="rgba(255,255,255,0.35)" />
            <circle cx="50" cy="95" r="3" fill="rgba(255,255,255,0.35)" />
            <circle cx="10" cy="72.5" r="3" fill="rgba(255,255,255,0.35)" />
            <circle cx="10" cy="27.5" r="3" fill="rgba(255,255,255,0.35)" />
          </svg>
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
              "linear-gradient(90deg, transparent 0%, #3b82f6 25%, #8b5cf6 50%, #06b6d4 75%, transparent 100%)",
            display: "flex",
          }}
        />

        {/* URL in corner */}
        <div
          style={{
            position: "absolute",
            top: 24,
            right: 30,
            display: "flex",
            alignItems: "center",
            fontSize: 13,
            color: "#4b5563",
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
