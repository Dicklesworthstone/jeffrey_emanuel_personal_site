import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Projects by Jeffrey Emanuel - Open Source AI & Development Tools";
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
            "linear-gradient(145deg, #0a0a12 0%, #10141e 30%, #0f1628 65%, #0a0a12 100%)",
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
            opacity: 0.028,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23f97316' stroke-width='0.5'%3E%3Cpath d='M0 20h40M20 0v40'/%3E%3C/g%3E%3C/svg%3E")`,
            display: "flex",
          }}
        />

        {/* Glowing orb - orange top right */}
        <div
          style={{
            position: "absolute",
            top: -150,
            right: -120,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(249,115,22,0.16) 0%, transparent 60%)",
            display: "flex",
          }}
        />

        {/* Glowing orb - amber bottom left */}
        <div
          style={{
            position: "absolute",
            bottom: -180,
            left: -130,
            width: 550,
            height: 550,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 60%)",
            display: "flex",
          }}
        />

        {/* Accent orb - rose center */}
        <div
          style={{
            position: "absolute",
            top: 120,
            left: 280,
            width: 320,
            height: 320,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(244,63,94,0.08) 0%, transparent 60%)",
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
          {/* Left side - Code/Projects visual */}
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
                  "radial-gradient(circle, rgba(249,115,22,0.28) 0%, rgba(245,158,11,0.16) 50%, transparent 70%)",
                filter: "blur(28px)",
                display: "flex",
              }}
            />

            {/* Code blocks / Repository visual */}
            <svg
              width="190"
              height="190"
              viewBox="0 0 100 100"
              fill="none"
              style={{
                filter: "drop-shadow(0 0 24px rgba(249,115,22,0.4))",
              }}
            >
              <defs>
                <linearGradient id="projGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#f43f5e" />
                </linearGradient>
              </defs>

              {/* Main code window frame */}
              <rect
                x="10"
                y="15"
                width="80"
                height="70"
                rx="6"
                stroke="url(#projGrad)"
                strokeWidth="2"
                fill="none"
                opacity="0.7"
              />

              {/* Window title bar */}
              <rect x="10" y="15" width="80" height="12" rx="6" fill="url(#projGrad)" opacity="0.15" />
              <rect x="10" y="21" width="80" height="6" fill="url(#projGrad)" opacity="0.15" />

              {/* Window dots */}
              <circle cx="18" cy="21" r="2.5" fill="#f43f5e" opacity="0.9" />
              <circle cx="26" cy="21" r="2.5" fill="#f59e0b" opacity="0.9" />
              <circle cx="34" cy="21" r="2.5" fill="#22c55e" opacity="0.9" />

              {/* Code lines */}
              <rect x="18" y="36" width="35" height="3" rx="1.5" fill="#f97316" opacity="0.7" />
              <rect x="22" y="44" width="50" height="3" rx="1.5" fill="#f59e0b" opacity="0.5" />
              <rect x="22" y="52" width="40" height="3" rx="1.5" fill="#f59e0b" opacity="0.5" />
              <rect x="18" y="60" width="28" height="3" rx="1.5" fill="#f97316" opacity="0.7" />
              <rect x="22" y="68" width="45" height="3" rx="1.5" fill="#f43f5e" opacity="0.5" />
              <rect x="18" y="76" width="15" height="3" rx="1.5" fill="#f97316" opacity="0.7" />

              {/* Floating code blocks representing multiple projects */}
              {/* Block 1 - top right */}
              <rect
                x="68"
                y="5"
                width="28"
                height="22"
                rx="4"
                fill="#f97316"
                opacity="0.2"
              />
              <rect x="72" y="10" width="16" height="2" rx="1" fill="#f97316" opacity="0.6" />
              <rect x="72" y="15" width="20" height="2" rx="1" fill="#f59e0b" opacity="0.5" />
              <rect x="72" y="20" width="12" height="2" rx="1" fill="#f59e0b" opacity="0.5" />

              {/* Block 2 - bottom right */}
              <rect
                x="72"
                y="72"
                width="25"
                height="20"
                rx="4"
                fill="#f59e0b"
                opacity="0.2"
              />
              <rect x="76" y="77" width="14" height="2" rx="1" fill="#f59e0b" opacity="0.6" />
              <rect x="76" y="82" width="18" height="2" rx="1" fill="#f97316" opacity="0.5" />
              <rect x="76" y="87" width="10" height="2" rx="1" fill="#f97316" opacity="0.5" />

              {/* Git branch lines */}
              <path
                d="M5 40 Q 8 50, 5 60"
                stroke="#f97316"
                strokeWidth="2"
                fill="none"
                opacity="0.5"
              />
              <circle cx="5" cy="40" r="3" fill="#f97316" opacity="0.8" />
              <circle cx="5" cy="60" r="3" fill="#f59e0b" opacity="0.8" />
              <path
                d="M5 50 L 10 50"
                stroke="#f43f5e"
                strokeWidth="1.5"
                fill="none"
                opacity="0.5"
              />
              <circle cx="5" cy="50" r="2" fill="#f43f5e" opacity="0.8" />
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
                background: "rgba(249,115,22,0.12)",
                border: "1px solid rgba(249,115,22,0.28)",
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  color: "#f97316",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  display: "flex",
                }}
              >
                Projects
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
              Open Source Work
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: 26,
                fontWeight: 600,
                background:
                  "linear-gradient(90deg, #f97316 0%, #f59e0b 50%, #f43f5e 100%)",
                backgroundClip: "text",
                color: "transparent",
                margin: 0,
                marginBottom: 22,
                display: "flex",
              }}
            >
              AI Tools & Development Systems
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
              Explore a collection of open-source projects focused on AI, developer
              tools, and systems that accelerate the development workflow
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
                  background: "rgba(249,115,22,0.14)",
                  border: "1px solid rgba(249,115,22,0.26)",
                }}
              >
                <span style={{ color: "#fb923c", fontWeight: 600, display: "flex" }}>
                  AI/ML Tools
                </span>
              </div>

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
                <span style={{ color: "#fbbf24", fontWeight: 600, display: "flex" }}>
                  Open Source
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
                  Dev Tools
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
              "linear-gradient(90deg, transparent 0%, #f97316 25%, #f59e0b 50%, #f43f5e 75%, transparent 100%)",
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
          <span style={{ display: "flex" }}>jeffreyemanuel.com/projects</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
