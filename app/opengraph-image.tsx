import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Jeffrey Emanuel - AI/ML Engineer & Software Architect";
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
            "linear-gradient(145deg, #0a0a12 0%, #0d1420 30%, #0f1628 60%, #0a0a12 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
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
            opacity: 0.03,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%233b82f6' stroke-width='0.5'%3E%3Cpath d='M0 20h40M20 0v40'/%3E%3C/g%3E%3C/svg%3E")`,
            display: "flex",
          }}
        />

        {/* Glowing orb - blue top left */}
        <div
          style={{
            position: "absolute",
            top: -180,
            left: -120,
            width: 550,
            height: 550,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 60%)",
            display: "flex",
          }}
        />

        {/* Glowing orb - purple bottom right */}
        <div
          style={{
            position: "absolute",
            bottom: -220,
            right: -150,
            width: 650,
            height: 650,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 60%)",
            display: "flex",
          }}
        />

        {/* Accent orb - cyan center-right */}
        <div
          style={{
            position: "absolute",
            top: 80,
            right: 250,
            width: 350,
            height: 350,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 60%)",
            display: "flex",
          }}
        />

        {/* Main content container */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 70,
            zIndex: 10,
            padding: "40px 70px",
            width: "100%",
          }}
        >
          {/* Left side - Geometric Icon representing code/AI */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {/* Outer glow ring */}
            <div
              style={{
                position: "absolute",
                width: 260,
                height: 260,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(139,92,246,0.18) 50%, transparent 70%)",
                filter: "blur(30px)",
                display: "flex",
              }}
            />

            {/* Geometric SVG - Abstract code/neural network representation */}
            <svg
              width="200"
              height="200"
              viewBox="0 0 100 100"
              fill="none"
              style={{
                filter: "drop-shadow(0 0 25px rgba(59,130,246,0.45))",
              }}
            >
              <defs>
                <linearGradient id="mainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                <linearGradient id="nodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>

              {/* Outer hexagon frame */}
              <polygon
                points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5"
                stroke="url(#mainGrad)"
                strokeWidth="2"
                fill="none"
                opacity="0.7"
              />

              {/* Inner hexagon */}
              <polygon
                points="50,20 75,35 75,65 50,80 25,65 25,35"
                stroke="#3b82f6"
                strokeWidth="1"
                fill="none"
                opacity="0.4"
              />

              {/* Center circle */}
              <circle cx="50" cy="50" r="12" fill="url(#nodeGrad)" opacity="0.9" />
              <circle cx="50" cy="50" r="7" fill="rgba(255,255,255,0.2)" />

              {/* Connection nodes - representing interconnected systems */}
              {/* Top */}
              <circle cx="50" cy="5" r="5" fill="#3b82f6" opacity="0.9" />
              <line x1="50" y1="5" x2="50" y2="38" stroke="#3b82f6" strokeWidth="1.5" opacity="0.5" />

              {/* Top right */}
              <circle cx="90" cy="27.5" r="5" fill="#8b5cf6" opacity="0.9" />
              <line x1="90" y1="27.5" x2="60" y2="42" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.5" />

              {/* Bottom right */}
              <circle cx="90" cy="72.5" r="5" fill="#06b6d4" opacity="0.9" />
              <line x1="90" y1="72.5" x2="60" y2="58" stroke="#06b6d4" strokeWidth="1.5" opacity="0.5" />

              {/* Bottom */}
              <circle cx="50" cy="95" r="5" fill="#3b82f6" opacity="0.9" />
              <line x1="50" y1="95" x2="50" y2="62" stroke="#3b82f6" strokeWidth="1.5" opacity="0.5" />

              {/* Bottom left */}
              <circle cx="10" cy="72.5" r="5" fill="#8b5cf6" opacity="0.9" />
              <line x1="10" y1="72.5" x2="40" y2="58" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.5" />

              {/* Top left */}
              <circle cx="10" cy="27.5" r="5" fill="#06b6d4" opacity="0.9" />
              <line x1="10" y1="27.5" x2="40" y2="42" stroke="#06b6d4" strokeWidth="1.5" opacity="0.5" />

              {/* Cross connections for neural network effect */}
              <line x1="50" y1="5" x2="90" y2="72.5" stroke="#3b82f6" strokeWidth="0.5" opacity="0.2" />
              <line x1="90" y1="27.5" x2="10" y2="72.5" stroke="#8b5cf6" strokeWidth="0.5" opacity="0.2" />
              <line x1="10" y1="27.5" x2="90" y2="27.5" stroke="#06b6d4" strokeWidth="0.5" opacity="0.2" />

              {/* Inner node highlights */}
              <circle cx="50" cy="5" r="2.5" fill="rgba(255,255,255,0.4)" />
              <circle cx="90" cy="27.5" r="2.5" fill="rgba(255,255,255,0.4)" />
              <circle cx="90" cy="72.5" r="2.5" fill="rgba(255,255,255,0.4)" />
              <circle cx="50" cy="95" r="2.5" fill="rgba(255,255,255,0.4)" />
              <circle cx="10" cy="72.5" r="2.5" fill="rgba(255,255,255,0.4)" />
              <circle cx="10" cy="27.5" r="2.5" fill="rgba(255,255,255,0.4)" />
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
            {/* Name */}
            <h1
              style={{
                fontSize: 72,
                fontWeight: 800,
                background:
                  "linear-gradient(135deg, #ffffff 0%, #e2e8f0 50%, #94a3b8 100%)",
                backgroundClip: "text",
                color: "transparent",
                margin: 0,
                marginBottom: 8,
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
                display: "flex",
              }}
            >
              Jeffrey Emanuel
            </h1>

            {/* Role with gradient */}
            <p
              style={{
                fontSize: 28,
                fontWeight: 600,
                background:
                  "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)",
                backgroundClip: "text",
                color: "transparent",
                margin: 0,
                marginBottom: 24,
                display: "flex",
              }}
            >
              AI/ML Engineer & Software Architect
            </p>

            {/* Description */}
            <p
              style={{
                fontSize: 20,
                color: "#94a3b8",
                margin: 0,
                marginBottom: 32,
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
                gap: 16,
                fontSize: 15,
              }}
            >
              {/* AI Tag */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 16px",
                  borderRadius: 8,
                  background: "rgba(59,130,246,0.15)",
                  border: "1px solid rgba(59,130,246,0.3)",
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
                  padding: "8px 16px",
                  borderRadius: 8,
                  background: "rgba(139,92,246,0.15)",
                  border: "1px solid rgba(139,92,246,0.3)",
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
                  padding: "8px 16px",
                  borderRadius: 8,
                  background: "rgba(34,211,238,0.15)",
                  border: "1px solid rgba(34,211,238,0.3)",
                }}
              >
                <span style={{ color: "#22d3ee", fontWeight: 600, display: "flex" }}>
                  Open Source
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom gradient accent line */}
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

        {/* Corner accent - domain */}
        <div
          style={{
            position: "absolute",
            top: 30,
            right: 40,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            color: "#475569",
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
