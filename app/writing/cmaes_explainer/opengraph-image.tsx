import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "The Incredible Magic of CMA-ES | Jeffrey Emanuel";
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
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23f59e0b' stroke-width='0.5'%3E%3Cpath d='M0 20h40M20 0v40'/%3E%3C/g%3E%3C/svg%3E")`,
            display: "flex",
          }}
        />

        {/* Glowing orb - amber top left */}
        <div
          style={{
            position: "absolute",
            top: -160,
            left: -130,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 60%)",
            display: "flex",
          }}
        />

        {/* Glowing orb - red bottom right */}
        <div
          style={{
            position: "absolute",
            bottom: -200,
            right: -130,
            width: 580,
            height: 580,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 60%)",
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
          {/* Left side - CMA-ES Ellipsoid visualization */}
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
                  "radial-gradient(circle, rgba(245,158,11,0.28) 0%, rgba(249,115,22,0.18) 50%, transparent 70%)",
                filter: "blur(28px)",
                display: "flex",
              }}
            />

            {/* Abstract Ellipsoid SVG */}
            <svg
              width="200"
              height="200"
              viewBox="0 0 100 100"
              fill="none"
              style={{
                filter: "drop-shadow(0 0 24px rgba(245,158,11,0.35))",
              }}
            >
              <defs>
                <linearGradient id="cmaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="50%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>

              {/* Rotated Ellipse representing Covariance */}
              <ellipse 
                cx="50" cy="50" rx="45" ry="18" 
                transform="rotate(-35, 50, 50)"
                stroke="url(#cmaGrad)" 
                strokeWidth="2.5" 
                fill="none" 
                opacity="0.8" 
              />
              
              {/* Inner Ellipse */}
              <ellipse 
                cx="50" cy="50" rx="35" ry="12" 
                transform="rotate(-35, 50, 50)"
                stroke="#f59e0b" 
                strokeWidth="1" 
                fill="none" 
                opacity="0.4" 
              />

              {/* Sample points around the center */}
              <circle cx="50" cy="50" r="3" fill="#ffffff" />
              <circle cx="35" cy="42" r="2" fill="#f59e0b" opacity="0.6" />
              <circle cx="65" cy="58" r="2" fill="#f59e0b" opacity="0.6" />
              <circle cx="42" cy="55" r="1.5" fill="#f97316" opacity="0.4" />
              <circle cx="58" cy="45" r="1.5" fill="#f97316" opacity="0.4" />
              
              {/* Trajectory arrow */}
              <path d="M20 80 L40 60" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4,2" opacity="0.5" />
              <circle cx="20" cy="80" r="2" fill="#f59e0b" opacity="0.3" />
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
                Intelligence / Adaptive Search
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
              The Incredible Magic of
            </h1>
            <h1
              style={{
                fontSize: 56,
                fontWeight: 800,
                background:
                  "linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #ef4444 100%)",
                backgroundClip: "text",
                color: "transparent",
                margin: 0,
                marginBottom: 22,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                display: "flex",
              }}
            >
              CMA-ES
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
              An interactive deep dive into the Covariance Matrix Adaptation 
              Evolution Strategy—the gold standard for black-box optimization.
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
                <span style={{ color: "#f59e0b", fontWeight: 600, display: "flex" }}>
                  Black-Box Opt
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "7px 14px",
                  borderRadius: 7,
                  background: "rgba(249,115,22,0.14)",
                  border: "1px solid rgba(249,115,22,0.26)",
                }}
              >
                <span style={{ color: "#f97316", fontWeight: 600, display: "flex" }}>
                  Geometry
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "7px 14px",
                  borderRadius: 7,
                  background: "rgba(239,68,68,0.14)",
                  border: "1px solid rgba(239,68,68,0.26)",
                }}
              >
                <span style={{ color: "#ef4444", fontWeight: 600, display: "flex" }}>
                  No Gradients
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
              "linear-gradient(90deg, transparent 0%, #f59e0b 25%, #f97316 50%, #ef4444 75%, transparent 100%)",
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
