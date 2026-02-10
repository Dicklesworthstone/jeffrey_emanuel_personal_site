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
        {[
          { top: 20, left: 20 },
          { top: 20, right: 20 },
          { bottom: 20, left: 20 },
          { bottom: 20, right: 20 },
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 12,
              height: 12,
              background: "#334155",
              borderRadius: "50%",
              border: "2px solid #1e293b",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)",
              ...pos,
            }}
          />
        ))}

        {/* Main Content Layout */}
        <div
          style={{
            display: "flex",
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
              width: "460px",
              height: "460px",
              position: "relative",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* The "Sigil" Glow */}
            <div
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                background: "radial-gradient(circle, rgba(34,211,238,0.15) 0%, rgba(168,85,247,0.1) 50%, transparent 70%)",
                filter: "blur(40px)",
                display: "flex",
              }}
            />

            <svg
              width="460"
              height="460"
              viewBox="0 0 400 400"
              fill="none"
              style={{
                filter: "drop-shadow(0 0 20px rgba(34,211,238,0.2))",
              }}
            >
              <defs>
                <linearGradient id="magicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Central Alchemical Sigil / Math Ring */}
              <circle cx="200" cy="200" r="180" stroke="#1e293b" strokeWidth="1" strokeDasharray="5,5" />
              <circle cx="200" cy="200" r="160" stroke="url(#magicGrad)" strokeWidth="0.5" opacity="0.3" />
              
              {/* Hexagonal Matrix Frame */}
              <polygon
                points="200,40 340,120 340,280 200,360 60,280 60,120"
                stroke="url(#magicGrad)"
                strokeWidth="1.5"
                opacity="0.4"
                strokeDasharray="10,5"
              />

              {/* Source Symbols (K) - Represented as Alchemical glyphs/blocks */}
              <g transform="translate(180, 80)">
                {Array.from({ length: 6 }).map((_, i) => (
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
                <text x="0" y="5" fill="#22d3ee" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">SOURCE K</text>
              </g>

              {/* Fountain Flow Lines (The "Black Magic") */}
              <g>
                <path d="M 200 140 Q 300 200 200 320" stroke="url(#magicGrad)" strokeWidth="2" opacity="0.5" fill="none" />
                <path d="M 200 140 Q 100 200 200 320" stroke="url(#magicGrad)" strokeWidth="2" opacity="0.5" fill="none" />
                <circle cx="200" cy="230" r="40" stroke="url(#magicGrad)" strokeWidth="1" opacity="0.2" fill="none" />
              </g>

              {/* Encoded Symbols (The Liquid Data) */}
              <g transform="translate(200, 320)">
                <rect x="-40" y="-15" width="80" height="30" rx="6" fill="#0f172a" stroke="#a855f7" strokeWidth="2" />
                <text y="5" fill="#a855f7" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="monospace">ENCODED</text>
                
                {/* Floating "droplets" of data */}
                {Array.from({ length: 12 }).map((_, i) => (
                  <circle
                    key={i}
                    cx={(Math.random() - 0.5) * 160}
                    cy={(Math.random() - 0.5) * 100}
                    r={Math.random() * 3 + 1}
                    fill={Math.random() > 0.5 ? "#22d3ee" : "#a855f7"}
                    opacity={0.6}
                  />
                ))}
              </g>

              {/* Mathematical Formulas (Small, decorative) */}
              <text x="280" y="100" fill="#475569" fontSize="8" fontFamily="monospace">Ax = b</text>
              <text x="80" y="100" fill="#475569" fontSize="8" fontFamily="monospace">GF(256)</text>
              <text x="280" y="300" fill="#475569" fontSize="8" fontFamily="monospace">Ω(d)</text>
              <text x="80" y="300" fill="#475569" fontSize="8" fontFamily="monospace">P = A ⊕ C</text>
            </svg>
          </div>

          {/* Right Side: Typography & Metadata */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              width: "520px",
            }}
          >
            {/* Project ID / Tag */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "30px",
              }}
            >
              <div style={{ width: "12px", height: "12px", background: "#22d3ee", clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }} />
              <span
                style={{
                  fontSize: "13px",
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
            <h1
              style={{
                fontSize: "64px",
                fontWeight: "900",
                margin: 0,
                marginBottom: "16px",
                lineHeight: "1.0",
                letterSpacing: "-0.04em",
                color: "#fff",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span style={{ opacity: 0.7, fontSize: "24px", letterSpacing: "0.2em", marginBottom: "8px", color: "#22d3ee" }}>THE BLACK MAGIC OF</span>
              LIQUID DATA
            </h1>

            {/* Subtitle / Description */}
            <p
              style={{
                fontSize: "22px",
                color: "#94a3b8",
                lineHeight: "1.5",
                margin: 0,
                marginBottom: "40px",
                maxWidth: "460px",
                fontWeight: "500",
              }}
            >
              How RaptorQ turns any file into an infinite stream of
              self-healing packets with near-zero overhead.
            </p>

            {/* Technical Specs Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                width: "100%",
                padding: "20px",
                background: "rgba(15, 23, 42, 0.5)",
                border: "1px solid rgba(51, 65, 85, 0.5)",
                borderRadius: "8px",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "10px", color: "#475569", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.1em" }}>Complexity</span>
                <span style={{ fontSize: "16px", color: "#22d3ee", fontWeight: "bold", fontFamily: "monospace" }}>O(K) Linear Time</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "10px", color: "#475569", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.1em" }}>Recovery</span>
                <span style={{ fontSize: "16px", color: "#a855f7", fontWeight: "bold", fontFamily: "monospace" }}>99.9999% Prob.</span>
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
            height: "40px",
            background: "#0f172a",
            borderTop: "1px solid #1e293b",
            display: "flex",
            alignItems: "center",
            padding: "0 40px",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <span style={{ fontSize: "11px", color: "#334155", fontWeight: "bold", fontFamily: "monospace" }}>[ STATUS: OPERATIONAL ]</span>
            <span style={{ fontSize: "11px", color: "#22d3ee", fontWeight: "bold", fontFamily: "monospace" }}>JEFFREYEMANUEL.COM</span>
          </div>
          <div style={{ display: "flex", gap: "20px" }}>
            <span style={{ fontSize: "11px", color: "#475569", fontFamily: "monospace" }}>TYPE: FOUNTAIN_CODE</span>
            <span style={{ fontSize: "11px", color: "#475569", fontFamily: "monospace" }}>v6330.0.1</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
