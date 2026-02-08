import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Media - Jeffrey Emanuel | Press, Podcasts & Interviews";
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
            "linear-gradient(145deg, #0a0a12 0%, #140a10 30%, #1a0c14 60%, #0a0a12 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
          padding: "45px 65px",
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
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ec4899' stroke-width='0.5'%3E%3Cpath d='M0 20h40M20 0v40'/%3E%3C/g%3E%3C/svg%3E")`,
            display: "flex",
          }}
        />

        {/* Glowing orb - rose top right */}
        <div
          style={{
            position: "absolute",
            top: -140,
            right: -100,
            width: 450,
            height: 450,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 60%)",
            display: "flex",
          }}
        />

        {/* Glowing orb - pink bottom left */}
        <div
          style={{
            position: "absolute",
            bottom: -180,
            left: -120,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(244,114,182,0.14) 0%, transparent 60%)",
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
          {/* Page label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 16,
              padding: "6px 14px",
              borderRadius: 16,
              background: "rgba(236,72,153,0.12)",
              border: "1px solid rgba(236,72,153,0.26)",
              width: "fit-content",
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: "#ec4899",
                fontWeight: 600,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                display: "flex",
              }}
            >
              Media
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
            Press & Podcasts
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 24,
              fontWeight: 600,
              background:
                "linear-gradient(90deg, #ec4899 0%, #f472b6 50%, #a855f7 100%)",
              backgroundClip: "text",
              color: "transparent",
              margin: 0,
              marginBottom: 18,
              display: "flex",
            }}
          >
            Jeffrey Emanuel
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
            Press coverage, podcast appearances, and interviews discussing
            AI, markets, and the Nvidia short thesis
          </p>

          {/* Tags */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 13,
            }}
          >
            <div
              style={{
                display: "flex",
                padding: "6px 12px",
                borderRadius: 6,
                background: "rgba(236,72,153,0.13)",
                border: "1px solid rgba(236,72,153,0.24)",
              }}
            >
              <span style={{ color: "#f472b6", fontWeight: 600, display: "flex" }}>
                Press
              </span>
            </div>
            <div
              style={{
                display: "flex",
                padding: "6px 12px",
                borderRadius: 6,
                background: "rgba(244,114,182,0.13)",
                border: "1px solid rgba(244,114,182,0.24)",
              }}
            >
              <span style={{ color: "#f9a8d4", fontWeight: 600, display: "flex" }}>
                Podcasts
              </span>
            </div>
            <div
              style={{
                display: "flex",
                padding: "6px 12px",
                borderRadius: 6,
                background: "rgba(168,85,247,0.13)",
                border: "1px solid rgba(168,85,247,0.24)",
              }}
            >
              <span style={{ color: "#c084fc", fontWeight: 600, display: "flex" }}>
                Interviews
              </span>
            </div>
          </div>
        </div>

        {/* Right - Visual */}
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
              width: 220,
              height: 220,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(236,72,153,0.28) 0%, rgba(244,114,182,0.16) 50%, transparent 70%)",
              filter: "blur(26px)",
              display: "flex",
            }}
          />

          <svg
            width="200"
            height="200"
            viewBox="0 0 100 100"
            fill="none"
            style={{
              filter: "drop-shadow(0 0 20px rgba(236,72,153,0.38))",
            }}
          >
            <defs>
              <linearGradient id="tMediaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="50%" stopColor="#f472b6" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>

            {/* Outer circle */}
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="url(#tMediaGrad)"
              strokeWidth="2.5"
              fill="none"
              opacity="0.65"
            />

            {/* Microphone body */}
            <rect
              x="42"
              y="25"
              width="16"
              height="28"
              rx="8"
              fill="#ec4899"
              opacity="0.9"
            />
            <rect
              x="45"
              y="28"
              width="10"
              height="22"
              rx="5"
              fill="rgba(255,255,255,0.15)"
            />

            {/* Microphone cradle */}
            <path
              d="M35 45 Q 35 62, 50 62 Q 65 62, 65 45"
              stroke="#f472b6"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              opacity="0.7"
            />

            {/* Microphone stand */}
            <line x1="50" y1="62" x2="50" y2="76" stroke="#f472b6" strokeWidth="2" opacity="0.7" />
            <line x1="40" y1="76" x2="60" y2="76" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" opacity="0.7" />

            {/* Broadcast waves - left */}
            <path d="M30 38 Q 24 44, 30 50" stroke="#ec4899" strokeWidth="1.5" fill="none" opacity="0.6" />
            <path d="M24 34 Q 15 44, 24 54" stroke="#f472b6" strokeWidth="1.5" fill="none" opacity="0.4" />
            <path d="M18 30 Q 6 44, 18 58" stroke="#a855f7" strokeWidth="1.5" fill="none" opacity="0.3" />

            {/* Broadcast waves - right */}
            <path d="M70 38 Q 76 44, 70 50" stroke="#ec4899" strokeWidth="1.5" fill="none" opacity="0.6" />
            <path d="M76 34 Q 85 44, 76 54" stroke="#f472b6" strokeWidth="1.5" fill="none" opacity="0.4" />
            <path d="M82 30 Q 94 44, 82 58" stroke="#a855f7" strokeWidth="1.5" fill="none" opacity="0.3" />

            {/* Sound dot */}
            <circle cx="50" cy="36" r="2" fill="rgba(255,255,255,0.5)" />
          </svg>
        </div>

        {/* Bottom accent */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            background:
              "linear-gradient(90deg, transparent 0%, #ec4899 25%, #f472b6 50%, #a855f7 75%, transparent 100%)",
            display: "flex",
          }}
        />

        {/* URL */}
        <div
          style={{
            position: "absolute",
            top: 22,
            right: 28,
            fontSize: 13,
            color: "#4b5563",
            display: "flex",
          }}
        >
          <span style={{ display: "flex" }}>jeffreyemanuel.com/media</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
