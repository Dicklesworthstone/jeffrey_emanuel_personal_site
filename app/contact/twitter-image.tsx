import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Contact Jeffrey Emanuel - Consulting, Collaborations & Media Inquiries";
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
            "linear-gradient(145deg, #0a0a12 0%, #0d0f1a 30%, #10122a 60%, #0a0a12 100%)",
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
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%238b5cf6' stroke-width='0.5'%3E%3Cpath d='M0 20h40M20 0v40'/%3E%3C/g%3E%3C/svg%3E")`,
            display: "flex",
          }}
        />

        {/* Glowing orb - violet top right */}
        <div
          style={{
            position: "absolute",
            top: -140,
            right: -100,
            width: 450,
            height: 450,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 60%)",
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
              "radial-gradient(circle, rgba(168,85,247,0.14) 0%, transparent 60%)",
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
              background: "rgba(139,92,246,0.12)",
              border: "1px solid rgba(139,92,246,0.26)",
              width: "fit-content",
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: "#8b5cf6",
                fontWeight: 600,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                display: "flex",
              }}
            >
              Contact
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: 58,
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
            Get in Touch
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 24,
              fontWeight: 600,
              background:
                "linear-gradient(90deg, #8b5cf6 0%, #a855f7 50%, #3b82f6 100%)",
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
            Consulting, collaborations, media inquiries, and speaking
            engagements
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
                background: "rgba(139,92,246,0.13)",
                border: "1px solid rgba(139,92,246,0.24)",
              }}
            >
              <span style={{ color: "#a78bfa", fontWeight: 600, display: "flex" }}>
                Consulting
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
                Media
              </span>
            </div>
            <div
              style={{
                display: "flex",
                padding: "6px 12px",
                borderRadius: 6,
                background: "rgba(59,130,246,0.13)",
                border: "1px solid rgba(59,130,246,0.24)",
              }}
            >
              <span style={{ color: "#60a5fa", fontWeight: 600, display: "flex" }}>
                Collaboration
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
                "radial-gradient(circle, rgba(139,92,246,0.28) 0%, rgba(168,85,247,0.16) 50%, transparent 70%)",
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
              filter: "drop-shadow(0 0 20px rgba(139,92,246,0.38))",
            }}
          >
            <defs>
              <linearGradient id="tContactGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>

            {/* Outer circle */}
            <circle
              cx="50"
              cy="50"
              r="44"
              stroke="url(#tContactGrad)"
              strokeWidth="2.5"
              fill="none"
              opacity="0.65"
            />

            {/* Envelope body */}
            <rect
              x="20"
              y="32"
              width="60"
              height="40"
              rx="4"
              stroke="#8b5cf6"
              strokeWidth="2"
              fill="rgba(139,92,246,0.1)"
              opacity="0.8"
            />

            {/* Envelope flap */}
            <path
              d="M20 34 L50 55 L80 34"
              stroke="#a855f7"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              opacity="0.8"
            />

            {/* Signal waves */}
            <path
              d="M68 25 Q 75 20, 80 25"
              stroke="#8b5cf6"
              strokeWidth="1.5"
              fill="none"
              opacity="0.6"
            />
            <path
              d="M72 18 Q 82 10, 88 18"
              stroke="#a855f7"
              strokeWidth="1.5"
              fill="none"
              opacity="0.4"
            />
            <path
              d="M76 11 Q 89 0, 96 11"
              stroke="#3b82f6"
              strokeWidth="1.5"
              fill="none"
              opacity="0.3"
            />

            {/* Center circle on envelope */}
            <circle cx="50" cy="55" r="5" fill="#a855f7" opacity="0.9" />
            <circle cx="50" cy="55" r="2.5" fill="rgba(255,255,255,0.3)" />
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
              "linear-gradient(90deg, transparent 0%, #8b5cf6 25%, #a855f7 50%, #3b82f6 75%, transparent 100%)",
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
          <span style={{ display: "flex" }}>jeffreyemanuel.com/contact</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
