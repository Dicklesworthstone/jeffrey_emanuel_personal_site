import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Projects by Jeffrey Emanuel - Open Source AI & Development Tools";
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
            "linear-gradient(145deg, #0a0a12 0%, #10141e 30%, #0f1628 65%, #0a0a12 100%)",
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
            opacity: 0.024,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23f97316' stroke-width='0.5'%3E%3Cpath d='M0 20h40M20 0v40'/%3E%3C/g%3E%3C/svg%3E")`,
            display: "flex",
          }}
        />

        {/* Glowing orbs */}
        <div
          style={{
            position: "absolute",
            top: -130,
            right: -100,
            width: 420,
            height: 420,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(249,115,22,0.2) 0%, transparent 60%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -160,
            left: -110,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(245,158,11,0.14) 0%, transparent 60%)",
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
              background: "rgba(249,115,22,0.12)",
              border: "1px solid rgba(249,115,22,0.26)",
              width: "fit-content",
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: "#f97316",
                fontWeight: 600,
                letterSpacing: "0.07em",
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
              fontSize: 54,
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
            Open Source Work
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 24,
              fontWeight: 600,
              background:
                "linear-gradient(90deg, #f97316 0%, #f59e0b 50%, #f43f5e 100%)",
              backgroundClip: "text",
              color: "transparent",
              margin: 0,
              marginBottom: 18,
              display: "flex",
            }}
          >
            AI Tools & Development Systems
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
            Explore a collection of open-source projects focused on AI, developer
            tools, and systems that accelerate the development workflow
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
                background: "rgba(249,115,22,0.13)",
                border: "1px solid rgba(249,115,22,0.24)",
              }}
            >
              <span style={{ color: "#fb923c", fontWeight: 600, display: "flex" }}>
                AI/ML Tools
              </span>
            </div>
            <div
              style={{
                display: "flex",
                padding: "6px 12px",
                borderRadius: 6,
                background: "rgba(245,158,11,0.13)",
                border: "1px solid rgba(245,158,11,0.24)",
              }}
            >
              <span style={{ color: "#fbbf24", fontWeight: 600, display: "flex" }}>
                Open Source
              </span>
            </div>
            <div
              style={{
                display: "flex",
                padding: "6px 12px",
                borderRadius: 6,
                background: "rgba(244,63,94,0.13)",
                border: "1px solid rgba(244,63,94,0.24)",
              }}
            >
              <span style={{ color: "#fb7185", fontWeight: 600, display: "flex" }}>
                Dev Tools
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
              width: 230,
              height: 230,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(249,115,22,0.28) 0%, rgba(245,158,11,0.16) 50%, transparent 70%)",
              filter: "blur(26px)",
              display: "flex",
            }}
          />

          <svg
            width="210"
            height="210"
            viewBox="0 0 100 100"
            fill="none"
            style={{
              filter: "drop-shadow(0 0 22px rgba(249,115,22,0.38))",
            }}
          >
            <defs>
              <linearGradient id="tProjGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
            </defs>

            {/* Main window */}
            <rect
              x="10"
              y="15"
              width="80"
              height="70"
              rx="6"
              stroke="url(#tProjGrad)"
              strokeWidth="2.5"
              fill="none"
              opacity="0.75"
            />

            {/* Title bar */}
            <rect x="10" y="15" width="80" height="12" rx="6" fill="url(#tProjGrad)" opacity="0.18" />
            <rect x="10" y="21" width="80" height="6" fill="url(#tProjGrad)" opacity="0.18" />

            {/* Window dots */}
            <circle cx="18" cy="21" r="3" fill="#f43f5e" opacity="0.9" />
            <circle cx="27" cy="21" r="3" fill="#f59e0b" opacity="0.9" />
            <circle cx="36" cy="21" r="3" fill="#22c55e" opacity="0.9" />

            {/* Code lines */}
            <rect x="18" y="36" width="38" height="3.5" rx="1.75" fill="#f97316" opacity="0.75" />
            <rect x="22" y="45" width="52" height="3.5" rx="1.75" fill="#f59e0b" opacity="0.55" />
            <rect x="22" y="54" width="42" height="3.5" rx="1.75" fill="#f59e0b" opacity="0.55" />
            <rect x="18" y="63" width="30" height="3.5" rx="1.75" fill="#f97316" opacity="0.75" />
            <rect x="22" y="72" width="48" height="3.5" rx="1.75" fill="#f43f5e" opacity="0.55" />

            {/* Floating blocks */}
            <rect x="70" y="5" width="26" height="20" rx="4" fill="#f97316" opacity="0.22" />
            <rect x="74" y="10" width="15" height="2.5" rx="1.25" fill="#f97316" opacity="0.65" />
            <rect x="74" y="15" width="18" height="2.5" rx="1.25" fill="#f59e0b" opacity="0.55" />

            <rect x="74" y="74" width="23" height="18" rx="4" fill="#f59e0b" opacity="0.22" />
            <rect x="78" y="79" width="13" height="2.5" rx="1.25" fill="#f59e0b" opacity="0.65" />
            <rect x="78" y="84" width="16" height="2.5" rx="1.25" fill="#f97316" opacity="0.55" />

            {/* Git branch */}
            <path d="M5 38 Q 8 50, 5 62" stroke="#f97316" strokeWidth="2.5" fill="none" opacity="0.55" />
            <circle cx="5" cy="38" r="3.5" fill="#f97316" opacity="0.85" />
            <circle cx="5" cy="62" r="3.5" fill="#f59e0b" opacity="0.85" />
            <path d="M5 50 L 10 50" stroke="#f43f5e" strokeWidth="2" fill="none" opacity="0.55" />
            <circle cx="5" cy="50" r="2.5" fill="#f43f5e" opacity="0.85" />
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
              "linear-gradient(90deg, transparent 0%, #f97316 25%, #f59e0b 50%, #f43f5e 75%, transparent 100%)",
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
          <span style={{ display: "flex" }}>jeffreyemanuel.com/projects</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
