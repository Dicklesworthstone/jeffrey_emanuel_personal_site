import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Writing by Jeffrey Emanuel - Thoughts on AI, Technology & Building Systems";
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
            opacity: 0.025,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ec4899' stroke-width='0.5'%3E%3Cpath d='M0 20h40M20 0v40'/%3E%3C/g%3E%3C/svg%3E")`,
            display: "flex",
          }}
        />

        {/* Glowing orb - pink top left */}
        <div
          style={{
            position: "absolute",
            top: -160,
            left: -130,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(236,72,153,0.14) 0%, transparent 60%)",
            display: "flex",
          }}
        />

        {/* Glowing orb - indigo bottom right */}
        <div
          style={{
            position: "absolute",
            bottom: -200,
            right: -130,
            width: 580,
            height: 580,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 60%)",
            display: "flex",
          }}
        />

        {/* Accent orb - rose center */}
        <div
          style={{
            position: "absolute",
            top: 140,
            right: 280,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(251,113,133,0.08) 0%, transparent 60%)",
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
            gap: 65,
            zIndex: 10,
            padding: "40px 70px",
            width: "100%",
          }}
        >
          {/* Left side - Writing/Document visual */}
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
                width: 250,
                height: 250,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(236,72,153,0.26) 0%, rgba(99,102,241,0.16) 50%, transparent 70%)",
                filter: "blur(28px)",
                display: "flex",
              }}
            />

            {/* Document/Writing visual */}
            <svg
              width="185"
              height="185"
              viewBox="0 0 100 100"
              fill="none"
              style={{
                filter: "drop-shadow(0 0 22px rgba(236,72,153,0.38))",
              }}
            >
              <defs>
                <linearGradient id="writeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="50%" stopColor="#f472b6" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>

              {/* Main document frame */}
              <rect
                x="20"
                y="8"
                width="60"
                height="84"
                rx="4"
                stroke="url(#writeGrad)"
                strokeWidth="2"
                fill="none"
                opacity="0.7"
              />

              {/* Document header */}
              <rect x="20" y="8" width="60" height="14" rx="4" fill="url(#writeGrad)" opacity="0.12" />
              <rect x="20" y="18" width="60" height="4" fill="url(#writeGrad)" opacity="0.12" />

              {/* Title line */}
              <rect x="28" y="28" width="44" height="5" rx="2.5" fill="#ec4899" opacity="0.8" />

              {/* Text lines - representing article content */}
              <rect x="28" y="40" width="44" height="3" rx="1.5" fill="#f472b6" opacity="0.5" />
              <rect x="28" y="47" width="38" height="3" rx="1.5" fill="#f472b6" opacity="0.5" />
              <rect x="28" y="54" width="42" height="3" rx="1.5" fill="#f472b6" opacity="0.5" />
              <rect x="28" y="61" width="35" height="3" rx="1.5" fill="#f472b6" opacity="0.5" />

              {/* Paragraph break */}
              <rect x="28" y="72" width="44" height="3" rx="1.5" fill="#6366f1" opacity="0.5" />
              <rect x="28" y="79" width="40" height="3" rx="1.5" fill="#6366f1" opacity="0.5" />

              {/* Floating article cards */}
              {/* Card 1 - top left */}
              <rect
                x="5"
                y="15"
                width="22"
                height="30"
                rx="3"
                fill="#ec4899"
                opacity="0.15"
              />
              <rect x="9" y="20" width="14" height="2" rx="1" fill="#ec4899" opacity="0.6" />
              <rect x="9" y="25" width="10" height="1.5" rx="0.75" fill="#f472b6" opacity="0.4" />
              <rect x="9" y="29" width="12" height="1.5" rx="0.75" fill="#f472b6" opacity="0.4" />
              <rect x="9" y="33" width="8" height="1.5" rx="0.75" fill="#f472b6" opacity="0.4" />

              {/* Card 2 - bottom left */}
              <rect
                x="8"
                y="55"
                width="18"
                height="26"
                rx="3"
                fill="#6366f1"
                opacity="0.15"
              />
              <rect x="11" y="59" width="12" height="2" rx="1" fill="#6366f1" opacity="0.6" />
              <rect x="11" y="63" width="10" height="1.5" rx="0.75" fill="#818cf8" opacity="0.4" />
              <rect x="11" y="67" width="8" height="1.5" rx="0.75" fill="#818cf8" opacity="0.4" />

              {/* Card 3 - right side */}
              <rect
                x="75"
                y="35"
                width="20"
                height="28"
                rx="3"
                fill="#f472b6"
                opacity="0.15"
              />
              <rect x="78" y="39" width="14" height="2" rx="1" fill="#f472b6" opacity="0.6" />
              <rect x="78" y="44" width="11" height="1.5" rx="0.75" fill="#ec4899" opacity="0.4" />
              <rect x="78" y="48" width="13" height="1.5" rx="0.75" fill="#ec4899" opacity="0.4" />
              <rect x="78" y="52" width="9" height="1.5" rx="0.75" fill="#ec4899" opacity="0.4" />

              {/* Pen/pencil icon */}
              <path
                d="M85 8 L92 15 L78 29 L74 30 L75 26 Z"
                fill="#ec4899"
                opacity="0.7"
              />
              <path
                d="M87 6 L94 13 L92 15 L85 8 Z"
                fill="#6366f1"
                opacity="0.8"
              />
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
            {/* Page label */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 18,
                padding: "7px 15px",
                borderRadius: 18,
                background: "rgba(236,72,153,0.12)",
                border: "1px solid rgba(236,72,153,0.28)",
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  color: "#ec4899",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  display: "flex",
                }}
              >
                Writing
              </span>
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: 62,
                fontWeight: 800,
                background:
                  "linear-gradient(135deg, #ffffff 0%, #e2e8f0 50%, #94a3b8 100%)",
                backgroundClip: "text",
                color: "transparent",
                margin: 0,
                marginBottom: 10,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                display: "flex",
              }}
            >
              Essays & Thoughts
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: 26,
                fontWeight: 600,
                background:
                  "linear-gradient(90deg, #ec4899 0%, #f472b6 50%, #6366f1 100%)",
                backgroundClip: "text",
                color: "transparent",
                margin: 0,
                marginBottom: 22,
                display: "flex",
              }}
            >
              On AI, Technology & Building
            </p>

            {/* Description */}
            <p
              style={{
                fontSize: 19,
                color: "#94a3b8",
                margin: 0,
                marginBottom: 28,
                lineHeight: 1.55,
                display: "flex",
              }}
            >
              Deep dives into artificial intelligence, system design, development
              workflows, and lessons learned from building software at scale
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
                  background: "rgba(236,72,153,0.14)",
                  border: "1px solid rgba(236,72,153,0.26)",
                }}
              >
                <span style={{ color: "#f472b6", fontWeight: 600, display: "flex" }}>
                  AI Research
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "7px 14px",
                  borderRadius: 7,
                  background: "rgba(251,113,133,0.14)",
                  border: "1px solid rgba(251,113,133,0.26)",
                }}
              >
                <span style={{ color: "#fb7185", fontWeight: 600, display: "flex" }}>
                  Tech Essays
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "7px 14px",
                  borderRadius: 7,
                  background: "rgba(99,102,241,0.14)",
                  border: "1px solid rgba(99,102,241,0.26)",
                }}
              >
                <span style={{ color: "#818cf8", fontWeight: 600, display: "flex" }}>
                  Tutorials
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
              "linear-gradient(90deg, transparent 0%, #ec4899 25%, #f472b6 50%, #6366f1 75%, transparent 100%)",
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
          <span style={{ display: "flex" }}>jeffreyemanuel.com/writing</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
