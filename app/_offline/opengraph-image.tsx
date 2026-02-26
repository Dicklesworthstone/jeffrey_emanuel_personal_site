import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Offline - Jeffrey Emanuel";
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
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #050914 0%, #0b1326 45%, #0a101d 100%)",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            position: "absolute",
            inset: 0,
            opacity: 0.025,
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='44' height='44' viewBox='0 0 44 44' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%2360a5fa' stroke-width='0.55'%3E%3Cpath d='M0 22h44M22 0v44'/%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />

        <div
          style={{
            display: "flex",
            position: "absolute",
            width: 640,
            height: 640,
            top: -240,
            right: -180,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.22) 0%, transparent 62%)",
          }}
        />
        <div
          style={{
            display: "flex",
            position: "absolute",
            width: 580,
            height: 580,
            left: -180,
            bottom: -220,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(14,165,233,0.16) 0%, transparent 62%)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 56,
            width: "100%",
            padding: "48px 76px",
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 250,
              height: 250,
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                position: "absolute",
                width: 220,
                height: 220,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(59,130,246,0.24) 0%, transparent 70%)",
                filter: "blur(10px)",
              }}
            />
            <svg
              width="200"
              height="200"
              viewBox="0 0 100 100"
              fill="none"
              style={{
                display: "flex",
                filter: "drop-shadow(0 0 22px rgba(59,130,246,0.4))",
              }}
            >
              <circle cx="50" cy="50" r="44" stroke="#60a5fa" strokeWidth="2" opacity="0.65" />
              <circle cx="50" cy="50" r="31" stroke="#38bdf8" strokeWidth="1" opacity="0.5" />
              <line x1="24" y1="76" x2="76" y2="24" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" opacity="0.9" />
              <line x1="22" y1="22" x2="78" y2="78" stroke="#60a5fa" strokeWidth="2" opacity="0.32" />
              <circle cx="50" cy="50" r="8" fill="#0f172a" stroke="#93c5fd" strokeWidth="1.2" />
            </svg>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              maxWidth: 720,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                borderRadius: 16,
                border: "1px solid rgba(56,189,248,0.26)",
                background: "rgba(56,189,248,0.12)",
                padding: "8px 16px",
                marginBottom: 18,
              }}
            >
              <span
                style={{
                  display: "flex",
                  color: "#7dd3fc",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                }}
              >
                Connection Interrupted
              </span>
            </div>

            <h1
              style={{
                display: "flex",
                margin: 0,
                fontSize: 72,
                lineHeight: 1.02,
                letterSpacing: "-0.03em",
                fontWeight: 860,
                color: "#f8fafc",
              }}
            >
              You&apos;re Offline
            </h1>

            <p
              style={{
                display: "flex",
                margin: 0,
                marginTop: 18,
                fontSize: 26,
                lineHeight: 1.4,
                color: "#94a3b8",
              }}
            >
              Reconnect to load Jeffrey Emanuel&apos;s site and continue browsing.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 4,
            background: "linear-gradient(90deg, transparent 0%, #60a5fa 35%, #f59e0b 65%, transparent 100%)",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
