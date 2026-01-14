import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Writing by Jeffrey Emanuel - Thoughts on AI, Technology & Building Systems";
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
            "linear-gradient(145deg, #0a0a12 0%, #0f1218 35%, #121620 65%, #0a0a12 100%)",
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
            opacity: 0.022,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ec4899' stroke-width='0.5'%3E%3Cpath d='M0 20h40M20 0v40'/%3E%3C/g%3E%3C/svg%3E")`,
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
              "radial-gradient(circle, rgba(236,72,153,0.18) 0%, transparent 60%)",
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
              "radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 60%)",
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
              Writing
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
            Essays & Thoughts
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 24,
              fontWeight: 600,
              background:
                "linear-gradient(90deg, #ec4899 0%, #f472b6 50%, #6366f1 100%)",
              backgroundClip: "text",
              color: "transparent",
              margin: 0,
              marginBottom: 18,
              display: "flex",
            }}
          >
            On AI, Technology & Building
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
            Deep dives into artificial intelligence, system design, development
            workflows, and lessons learned from building software at scale
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
                AI Research
              </span>
            </div>
            <div
              style={{
                display: "flex",
                padding: "6px 12px",
                borderRadius: 6,
                background: "rgba(251,113,133,0.13)",
                border: "1px solid rgba(251,113,133,0.24)",
              }}
            >
              <span style={{ color: "#fb7185", fontWeight: 600, display: "flex" }}>
                Tech Essays
              </span>
            </div>
            <div
              style={{
                display: "flex",
                padding: "6px 12px",
                borderRadius: 6,
                background: "rgba(99,102,241,0.13)",
                border: "1px solid rgba(99,102,241,0.24)",
              }}
            >
              <span style={{ color: "#818cf8", fontWeight: 600, display: "flex" }}>
                Tutorials
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
                "radial-gradient(circle, rgba(236,72,153,0.26) 0%, rgba(99,102,241,0.16) 50%, transparent 70%)",
              filter: "blur(26px)",
              display: "flex",
            }}
          />

          <svg
            width="205"
            height="205"
            viewBox="0 0 100 100"
            fill="none"
            style={{
              filter: "drop-shadow(0 0 20px rgba(236,72,153,0.36))",
            }}
          >
            <defs>
              <linearGradient id="tWriteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="50%" stopColor="#f472b6" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>

            {/* Main document */}
            <rect
              x="20"
              y="8"
              width="60"
              height="84"
              rx="4"
              stroke="url(#tWriteGrad)"
              strokeWidth="2.5"
              fill="none"
              opacity="0.75"
            />

            {/* Header */}
            <rect x="20" y="8" width="60" height="14" rx="4" fill="url(#tWriteGrad)" opacity="0.14" />
            <rect x="20" y="18" width="60" height="4" fill="url(#tWriteGrad)" opacity="0.14" />

            {/* Title line */}
            <rect x="28" y="28" width="46" height="5.5" rx="2.75" fill="#ec4899" opacity="0.85" />

            {/* Text lines */}
            <rect x="28" y="41" width="46" height="3.5" rx="1.75" fill="#f472b6" opacity="0.55" />
            <rect x="28" y="49" width="40" height="3.5" rx="1.75" fill="#f472b6" opacity="0.55" />
            <rect x="28" y="57" width="44" height="3.5" rx="1.75" fill="#f472b6" opacity="0.55" />
            <rect x="28" y="65" width="36" height="3.5" rx="1.75" fill="#f472b6" opacity="0.55" />

            <rect x="28" y="77" width="46" height="3.5" rx="1.75" fill="#6366f1" opacity="0.55" />
            <rect x="28" y="85" width="42" height="3.5" rx="1.75" fill="#6366f1" opacity="0.55" />

            {/* Floating cards */}
            <rect x="5" y="15" width="20" height="28" rx="3" fill="#ec4899" opacity="0.18" />
            <rect x="8" y="19" width="14" height="2.5" rx="1.25" fill="#ec4899" opacity="0.65" />
            <rect x="8" y="24" width="10" height="2" rx="1" fill="#f472b6" opacity="0.45" />
            <rect x="8" y="29" width="12" height="2" rx="1" fill="#f472b6" opacity="0.45" />

            <rect x="8" y="56" width="16" height="24" rx="3" fill="#6366f1" opacity="0.18" />
            <rect x="11" y="60" width="10" height="2.5" rx="1.25" fill="#6366f1" opacity="0.65" />
            <rect x="11" y="65" width="8" height="2" rx="1" fill="#818cf8" opacity="0.45" />

            <rect x="77" y="38" width="18" height="26" rx="3" fill="#f472b6" opacity="0.18" />
            <rect x="80" y="42" width="12" height="2.5" rx="1.25" fill="#f472b6" opacity="0.65" />
            <rect x="80" y="47" width="10" height="2" rx="1" fill="#ec4899" opacity="0.45" />
            <rect x="80" y="52" width="8" height="2" rx="1" fill="#ec4899" opacity="0.45" />

            {/* Pen */}
            <path d="M86 6 L94 14 L78 30 L73 31 L74 26 Z" fill="#ec4899" opacity="0.75" />
            <path d="M88 4 L96 12 L94 14 L86 6 Z" fill="#6366f1" opacity="0.85" />
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
              "linear-gradient(90deg, transparent 0%, #ec4899 25%, #f472b6 50%, #6366f1 75%, transparent 100%)",
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
          <span style={{ display: "flex" }}>jeffreyemanuel.com/writing</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
