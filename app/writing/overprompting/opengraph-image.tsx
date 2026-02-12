import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "The Overprompting Trap | Jeffrey Emanuel";
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
            gap: 60,
            zIndex: 10,
            padding: "40px 70px",
            width: "100%",
          }}
        >
          {/* Left side - Constraint funnel visualization */}
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
                  "radial-gradient(circle, rgba(245,158,11,0.24) 0%, rgba(244,63,94,0.14) 50%, transparent 70%)",
                filter: "blur(28px)",
                display: "flex",
              }}
            />

            {/* Funnel SVG */}
            <svg
              width="200"
              height="200"
              viewBox="0 0 100 100"
              fill="none"
              style={{
                filter: "drop-shadow(0 0 24px rgba(245,158,11,0.3))",
              }}
            >
              <defs>
                <linearGradient id="opGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="50%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#f43f5e" />
                </linearGradient>
              </defs>

              {/* Outer ring */}
              <circle cx="50" cy="50" r="45" stroke="url(#opGrad)" strokeWidth="2" fill="none" opacity="0.5" />
              <circle cx="50" cy="50" r="38" stroke="#f59e0b" strokeWidth="0.5" fill="none" opacity="0.25" />

              {/* Funnel shape - wide top, narrow bottom */}
              <path
                d="M20 25 L80 25 L65 75 L35 75 Z"
                fill="rgba(245,158,11,0.08)"
                stroke="url(#opGrad)"
                strokeWidth="1.5"
                opacity="0.8"
              />

              {/* Constraint lines (crossing through funnel) */}
              <line x1="25" y1="35" x2="75" y2="35" stroke="#f43f5e" strokeWidth="1" opacity="0.4" />
              <line x1="30" y1="45" x2="70" y2="45" stroke="#f43f5e" strokeWidth="1" opacity="0.4" />
              <line x1="35" y1="55" x2="65" y2="55" stroke="#f43f5e" strokeWidth="1" opacity="0.4" />
              <line x1="40" y1="65" x2="60" y2="65" stroke="#f43f5e" strokeWidth="1" opacity="0.4" />

              {/* Input dots (top - many) */}
              <circle cx="30" cy="18" r="3" fill="#f59e0b" opacity="0.9" />
              <circle cx="42" cy="16" r="2.5" fill="#f97316" opacity="0.8" />
              <circle cx="50" cy="14" r="3" fill="#f59e0b" opacity="0.9" />
              <circle cx="58" cy="16" r="2.5" fill="#f97316" opacity="0.8" />
              <circle cx="70" cy="18" r="3" fill="#f59e0b" opacity="0.9" />

              {/* Output dot (bottom - single, dim) */}
              <circle cx="50" cy="82" r="4" fill="#f43f5e" opacity="0.5" />

              {/* X marks for constraints */}
              <path d="M22 32 L28 38 M28 32 L22 38" stroke="#f43f5e" strokeWidth="1.5" opacity="0.7" />
              <path d="M72 32 L78 38 M78 32 L72 38" stroke="#f43f5e" strokeWidth="1.5" opacity="0.7" />
              <path d="M27 52 L33 58 M33 52 L27 58" stroke="#f43f5e" strokeWidth="1.5" opacity="0.7" />
              <path d="M67 52 L73 58 M73 52 L67 58" stroke="#f43f5e" strokeWidth="1.5" opacity="0.7" />
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
                AI Prompting — Strategy
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
              The Overprompting
            </h1>
            <h1
              style={{
                fontSize: 56,
                fontWeight: 800,
                background:
                  "linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #f43f5e 100%)",
                backgroundClip: "text",
                color: "transparent",
                margin: 0,
                marginBottom: 22,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                display: "flex",
              }}
            >
              Trap
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
              {"Why your best intentions are the model's worst enemy—and what to do instead"}
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
                  Chef Analogy
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
                <span style={{ color: "#fb923c", fontWeight: 600, display: "flex" }}>
                  Two-Phase
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "7px 14px",
                  borderRadius: 7,
                  background: "rgba(244,63,94,0.14)",
                  border: "1px solid rgba(244,63,94,0.26)",
                }}
              >
                <span style={{ color: "#fb7185", fontWeight: 600, display: "flex" }}>
                  Search Space
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
