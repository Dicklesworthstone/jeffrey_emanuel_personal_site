import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "The Overprompting Trap | Jeffrey Emanuel";
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
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(145deg, #0a0a0c 0%, #0f0d0a 35%, #12100a 65%, #0a0a0c 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle grid pattern */}
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

        {/* Warm glowing orb - amber top left */}
        <div
          style={{
            position: "absolute",
            top: -180,
            left: -150,
            width: 560,
            height: 560,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(245,158,11,0.16) 0%, transparent 60%)",
            display: "flex",
          }}
        />

        {/* Rose orb - bottom right */}
        <div
          style={{
            position: "absolute",
            bottom: -220,
            right: -150,
            width: 620,
            height: 620,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(244,63,94,0.12) 0%, transparent 60%)",
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
            gap: 80,
            zIndex: 10,
            padding: "30px 80px",
            width: "100%",
          }}
        >
          {/* Left side - Singularity Visual */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {/* HUD Rings */}
            <div
              style={{
                position: "absolute",
                width: 300,
                height: 300,
                borderRadius: "50%",
                border: "1px solid rgba(245,158,11,0.1)",
                display: "flex",
              }}
            />
            <div
              style={{
                position: "absolute",
                width: 220,
                height: 220,
                borderRadius: "50%",
                border: "1px solid rgba(245,158,11,0.2)",
                display: "flex",
              }}
            />

            {/* Core Glow */}
            <div
              style={{
                position: "absolute",
                width: 160,
                height: 160,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(245,158,11,0.3) 0%, rgba(244,63,94,0.1) 60%, transparent 80%)",
                filter: "blur(20px)",
                display: "flex",
              }}
            />

            {/* Singularity SVG */}
            <svg
              width="220"
              height="240"
              viewBox="0 0 100 100"
              fill="none"
              style={{
                filter: "drop-shadow(0 0 20px rgba(245,158,11,0.4))",
              }}
            >
              <defs>
                <linearGradient id="opGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#f43f5e" />
                </linearGradient>
              </defs>

              {/* Collapsing Rings */}
              <circle cx="50" cy="50" r="45" stroke="url(#opGrad)" strokeWidth="0.5" opacity="0.3" />
              <circle cx="50" cy="50" r="35" stroke="url(#opGrad)" strokeWidth="1" opacity="0.5" />
              <circle cx="50" cy="50" r="20" stroke="url(#opGrad)" strokeWidth="2" opacity="0.8" />
              
              {/* Central Point */}
              <circle cx="50" cy="50" r="4" fill="white" />
              <circle cx="50" cy="50" r="8" fill="#f59e0b" opacity="0.4" />

              {/* Coordinate Lines */}
              <line x1="50" y1="5" x2="50" y2="15" stroke="#f59e0b" strokeWidth="0.5" opacity="0.5" />
              <line x1="50" y1="85" x2="50" y2="95" stroke="#f59e0b" strokeWidth="0.5" opacity="0.5" />
              <line x1="5" y1="50" x2="15" y2="50" stroke="#f59e0b" strokeWidth="0.5" opacity="0.5" />
              <line x1="85" y1="50" x2="95" y2="50" stroke="#f59e0b" strokeWidth="0.5" opacity="0.5" />

              {/* Constraint 'X' marks on outer ring */}
              <g opacity="0.6" stroke="#f43f5e" strokeWidth="1">
                <path d="M18 18 L24 24 M24 18 L18 24" />
                <path d="M76 18 L82 24 M82 18 L76 24" />
                <path d="M18 76 L24 82 M24 76 L18 82" />
                <path d="M76 76 L82 82 M82 76 L76 82" />
              </g>
            </svg>
          </div>

          {/* Right side - Text content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              maxWidth: 600,
            }}
          >
            {/* Page label */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 18,
                padding: "8px 16px",
                borderRadius: 20,
                background: "rgba(245,158,11,0.1)",
                border: "1px solid rgba(245,158,11,0.2)",
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b" }} />
              <span
                style={{
                  fontSize: 12,
                  color: "#f59e0b",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  display: "flex",
                }}
              >
                AI Strategy Analysis
              </span>
            </div>

            {/* Title */}
            <div style={{ display: "flex", flexDirection: "column", marginBottom: 20 }}>
              <h1
                style={{
                  fontSize: 60,
                  fontWeight: 900,
                  color: "white",
                  margin: 0,
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                  display: "flex",
                }}
              >
                The Overprompting
              </h1>
              <h1
                style={{
                  fontSize: 60,
                  fontWeight: 900,
                  background:
                    "linear-gradient(to right, #f59e0b, #f43f5e)",
                  backgroundClip: "text",
                  color: "transparent",
                  margin: 0,
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                  display: "flex",
                }}
              >
                Trap
              </h1>
            </div>

            {/* Description */}
            <p
              style={{
                fontSize: 21,
                color: "#94a3b8",
                margin: 0,
                marginBottom: 28,
                lineHeight: 1.5,
                fontWeight: 400,
                display: "flex",
              }}
            >
              {"Why your best intentions are the model's worst enemy, and what to do instead"}
            </p>

            {/* Badges */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              {["Chef Analogy", "Two-Phase Workflow", "Search Space"].map((tag) => (
                <div
                  key={tag}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "6px 14px",
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600, display: "flex" }}>
                    {tag}
                  </span>
                </div>
              ))}
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
              "linear-gradient(90deg, transparent 0%, #f59e0b 25%, #f97316 50%, #f43f5e 75%, transparent 100%)",
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
