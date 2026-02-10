import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "RaptorQ: The Black Magic of Liquid Data | Jeffrey Emanuel";
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
          background: "#020204",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
          border: "2px solid #1e293b",
        }}
      >
        {/* Background Atmosphere */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 1) 0%, rgba(2, 2, 4, 1) 100%)",
            display: "flex",
          }}
        />

        {/* Blueprint Grid */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.05,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%233b82f6' stroke-width='0.5'%3E%3Cpath d='M0 30h60M30 0v60'/%3E%3Ccircle cx='30' cy='30' r='1' fill='%233b82f6'/%3E%3C/g%3E%3C/svg%3E")`,
            display: "flex",
          }}
        />

        {/* Stitched Border Detail */}
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            right: 10,
            bottom: 10,
            border: "1px dashed rgba(51, 65, 85, 0.3)",
            borderRadius: "4px",
            display: "flex",
          }}
        />

        {/* Corner Bolts */}
        <div style={{ position: "absolute", top: 20, left: 20, width: 12, height: 12, background: "#334155", borderRadius: "50%", border: "2px solid #1e293b", display: "flex" }} />
        <div style={{ position: "absolute", top: 20, right: 20, width: 12, height: 12, background: "#334155", borderRadius: "50%", border: "2px solid #1e293b", display: "flex" }} />
        <div style={{ position: "absolute", bottom: 20, left: 20, width: 12, height: 12, background: "#334155", borderRadius: "50%", border: "2px solid #1e293b", display: "flex" }} />
        <div style={{ position: "absolute", bottom: 20, right: 20, width: 12, height: 12, background: "#334155", borderRadius: "50%", border: "2px solid #1e293b", display: "flex" }} />

        {/* Main Content Layout */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            height: "100%",
            padding: "60px 90px",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 10,
          }}
        >
          {/* Left Side: Technical Alchemical Illustration */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "440px",
              height: "440px",
              position: "relative",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* The "Sigil" Glow */}
            <div
              style={{
                position: "absolute",
                width: "380px",
                height: "380px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(34,211,238,0.15) 0%, rgba(168,85,247,0.1) 50%, transparent 70%)",
                display: "flex",
              }}
            />

            <svg
              width="440"
              height="440"
              viewBox="0 0 400 400"
              fill="none"
            >
              <defs>
                <linearGradient id="magicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>

              <circle cx="200" cy="200" r="180" stroke="#1e293b" strokeWidth="1" strokeDasharray="5,5" />
              <circle cx="200" cy="200" r="160" stroke="url(#magicGrad)" strokeWidth="0.5" opacity="0.3" />
              
              <polygon
                points="200,40 340,120 340,280 200,360 60,280 60,120"
                stroke="url(#magicGrad)"
                strokeWidth="1.5"
                opacity="0.4"
                strokeDasharray="10,5"
              />

              <g transform="translate(180, 80)">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <rect
                    key={i}
                    x={Math.cos((i / 6) * Math.PI * 2) * 60 - 10}
                    y={Math.sin((i / 6) * Math.PI * 2) * 60 - 10}
                    width="20"
                    height="20"
                    rx="4"
                    fill="#0f172a"
                    stroke="#22d3ee"
                    strokeWidth="1.5"
                    opacity="0.8"
                  />
                ))}
                <text x="0" y="5" fill="#22d3ee" fontSize="10" fontWeight="bold" textAnchor="middle">SOURCE K</text>
              </g>

              <g>
                <path d="M 200 140 Q 300 200 200 320" stroke="url(#magicGrad)" strokeWidth="2" opacity="0.5" fill="none" />
                <path d="M 200 140 Q 100 200 200 320" stroke="url(#magicGrad)" strokeWidth="2" opacity="0.5" fill="none" />
              </g>

              <g transform="translate(200, 320)">
                <rect x="-40" y="-15" width="80" height="30" rx="6" fill="#0f172a" stroke="#a855f7" strokeWidth="2" />
                <text y="5" fill="#a855f7" fontSize="12" fontWeight="bold" textAnchor="middle">ENCODED</text>
              </g>

              <text x="280" y="100" fill="#475569" fontSize="8">Ax = b</text>
              <text x="80" y="100" fill="#475569" fontSize="8">GF(256)</text>
              <text x="280" y="300" fill="#475569" fontSize="8">Ω(d)</text>
              <text x="80" y="300" fill="#475569" fontSize="8">P = A ⊕ C</text>
            </svg>
          </div>

          {/* Right Side: Typography & Metadata */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              width: "500px",
            }}
          >
            {/* Project ID / Tag */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "10px",
                marginBottom: "24px",
              }}
            >
              <div style={{ width: "12px", height: "12px", background: "#22d3ee", display: "flex" }} />
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "900",
                  color: "#475569",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                }}
              >
                PROTOCOL INTEL // RFC 6330
              </span>
            </div>

            {/* Title */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginBottom: "12px",
              }}
            >
              <span style={{ opacity: 0.7, fontSize: "20px", letterSpacing: "0.2em", marginBottom: "6px", color: "#22d3ee", fontWeight: "900" }}>THE BLACK MAGIC OF</span>
              <span style={{ fontSize: "56px", fontWeight: "900", color: "#fff", letterSpacing: "-0.04em", lineHeight: "1.0" }}>LIQUID DATA</span>
            </div>

            {/* Subtitle / Description */}
            <p
              style={{
                fontSize: "20px",
                color: "#94a3b8",
                lineHeight: "1.5",
                margin: 0,
                marginBottom: "32px",
                maxWidth: "440px",
                fontWeight: "500",
                display: "flex",
              }}
            >
              How RaptorQ turns any file into an infinite stream of
              self-healing packets with near-zero overhead.
            </p>

            {/* Technical Specs Rows */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "20px",
                width: "100%",
                padding: "16px",
                background: "rgba(15, 23, 42, 0.5)",
                border: "1px solid rgba(51, 65, 85, 0.5)",
                borderRadius: "8px",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <span style={{ fontSize: "9px", color: "#475569", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.1em" }}>Complexity</span>
                <span style={{ fontSize: "15px", color: "#22d3ee", fontWeight: "bold" }}>O(K) Linear Time</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <span style={{ fontSize: "9px", color: "#475569", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.1em" }}>Recovery</span>
                <span style={{ fontSize: "16px", color: "#a855f7", fontWeight: "bold" }}>99.9999% Prob.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer / Domain Status Bar */}
        <div
          style={{
            position: "absolute",
            bottom: "0",
            left: "0",
            right: "0",
            height: "36px",
            background: "#0f172a",
            borderTop: "1px solid #1e293b",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            padding: "0 40px",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "15px" }}>
            <span style={{ fontSize: "10px", color: "#334155", fontWeight: "bold" }}>[ STATUS: OPERATIONAL ]</span>
            <span style={{ fontSize: "10px", color: "#22d3ee", fontWeight: "bold" }}>JEFFREYEMANUEL.COM</span>
          </div>
          <div style={{ display: "flex", flexDirection: "row", gap: "20px" }}>
            <span style={{ fontSize: "10px", color: "#475569" }}>TYPE: FOUNTAIN_CODE</span>
            <span style={{ fontSize: "10px", color: "#475569" }}>v6330.0.1</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
