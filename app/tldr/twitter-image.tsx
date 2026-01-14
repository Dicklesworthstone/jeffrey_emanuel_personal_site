import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "TL;DR - The Agentic Coding Flywheel Ecosystem";
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
            "linear-gradient(145deg, #0a0a12 0%, #0f1419 40%, #0d1117 70%, #0a0a12 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
          padding: "50px 70px",
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
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%2322d3ee' stroke-width='0.5'%3E%3Cpath d='M0 20h40M20 0v40'/%3E%3C/g%3E%3C/svg%3E")`,
            display: "flex",
          }}
        />

        {/* Glowing orbs */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -80,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(34,211,238,0.2) 0%, transparent 60%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -150,
            left: -100,
            width: 450,
            height: 450,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(244,114,182,0.12) 0%, transparent 60%)",
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
          {/* Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 18,
              padding: "6px 14px",
              borderRadius: 16,
              background: "rgba(34,211,238,0.1)",
              border: "1px solid rgba(34,211,238,0.25)",
              width: "fit-content",
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#22c55e",
                display: "flex",
              }}
            />
            <span
              style={{
                fontSize: 12,
                color: "#22d3ee",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                display: "flex",
              }}
            >
              TL;DR Overview
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: 52,
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
            Agentic Flywheel
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 24,
              fontWeight: 600,
              background:
                "linear-gradient(90deg, #22d3ee 0%, #a855f7 50%, #f472b6 100%)",
              backgroundClip: "text",
              color: "transparent",
              margin: 0,
              marginBottom: 20,
              display: "flex",
            }}
          >
            AI Agents Coding For You
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
            A comprehensive ecosystem of tools that form a self-reinforcing loop
            for multi-agent AI development workflows
          </p>

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 13,
            }}
          >
            <div
              style={{
                display: "flex",
                padding: "6px 12px",
                borderRadius: 6,
                background: "rgba(34,211,238,0.13)",
                border: "1px solid rgba(34,211,238,0.26)",
              }}
            >
              <span style={{ color: "#22d3ee", fontWeight: 600, display: "flex" }}>
                10+ Tools
              </span>
            </div>
            <div
              style={{
                display: "flex",
                padding: "6px 12px",
                borderRadius: 6,
                background: "rgba(168,85,247,0.13)",
                border: "1px solid rgba(168,85,247,0.26)",
              }}
            >
              <span style={{ color: "#a855f7", fontWeight: 600, display: "flex" }}>
                Multi-Agent
              </span>
            </div>
            <div
              style={{
                display: "flex",
                padding: "6px 12px",
                borderRadius: 6,
                background: "rgba(244,114,182,0.13)",
                border: "1px solid rgba(244,114,182,0.26)",
              }}
            >
              <span style={{ color: "#f472b6", fontWeight: 600, display: "flex" }}>
                Open Source
              </span>
            </div>
          </div>
        </div>

        {/* Right - Flywheel Visual */}
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
              width: 260,
              height: 260,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(34,211,238,0.25) 0%, rgba(168,85,247,0.15) 40%, transparent 70%)",
              filter: "blur(32px)",
              display: "flex",
            }}
          />

          <svg
            width="230"
            height="230"
            viewBox="0 0 100 100"
            fill="none"
            style={{
              filter: "drop-shadow(0 0 24px rgba(34,211,238,0.35))",
            }}
          >
            <defs>
              <linearGradient id="tTldrRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#f472b6" />
              </linearGradient>
              <linearGradient id="tTldrCenterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>

            {/* Outer ring */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="url(#tTldrRingGrad)"
              strokeWidth="2.5"
              fill="none"
              opacity="0.85"
            />

            {/* Middle ring */}
            <circle
              cx="50"
              cy="50"
              r="35"
              stroke="#22d3ee"
              strokeWidth="1"
              fill="none"
              opacity="0.35"
            />

            {/* Center hub */}
            <circle cx="50" cy="50" r="14" fill="url(#tTldrCenterGrad)" opacity="0.95" />
            <circle cx="50" cy="50" r="9" fill="rgba(255,255,255,0.2)" />

            {/* Flywheel nodes */}
            {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              const x = 50 + 40 * Math.cos(rad);
              const y = 50 + 40 * Math.sin(rad);
              const colors = [
                "#22d3ee",
                "#a855f7",
                "#f472b6",
                "#22c55e",
                "#f59e0b",
                "#22d3ee",
                "#a855f7",
                "#f472b6",
                "#22c55e",
                "#f59e0b",
              ];
              return (
                <g key={i}>
                  <line
                    x1="50"
                    y1="50"
                    x2={x}
                    y2={y}
                    stroke={colors[i]}
                    strokeWidth="1.5"
                    opacity="0.45"
                  />
                  <circle cx={x} cy={y} r="6" fill={colors[i]} opacity="0.9" />
                  <circle cx={x} cy={y} r="3.5" fill="rgba(255,255,255,0.25)" />
                </g>
              );
            })}

            {/* Motion arrows */}
            <path d="M50 6 L55 13 L45 13 Z" fill="#22d3ee" opacity="0.65" />
            <path d="M94 50 L87 55 L87 45 Z" fill="#a855f7" opacity="0.65" />
            <path d="M50 94 L45 87 L55 87 Z" fill="#f472b6" opacity="0.65" />
            <path d="M6 50 L13 45 L13 55 Z" fill="#22c55e" opacity="0.65" />
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
              "linear-gradient(90deg, transparent 0%, #22d3ee 25%, #a855f7 50%, #f472b6 75%, transparent 100%)",
            display: "flex",
          }}
        />

        {/* URL */}
        <div
          style={{
            position: "absolute",
            top: 24,
            right: 30,
            fontSize: 13,
            color: "#4b5563",
            display: "flex",
          }}
        >
          <span style={{ display: "flex" }}>jeffreyemanuel.com/tldr</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
