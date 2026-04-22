import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt =
  "Using AI Agents and Skills to Migrate Off Slack | Jeffrey Emanuel";
export const size = {
  width: 1200,
  height: 600,
};
export const contentType = "image/png";

export default async function Image() {
  // Load the hero illustration as an ArrayBuffer so Satori can embed it.
  const illustrationData = await fetch(
    new URL("./og-illustration.png", import.meta.url),
  ).then((r) => r.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
          background:
            "linear-gradient(145deg, #07070b 0%, #0b0912 35%, #08111a 65%, #060912 100%)",
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
            opacity: 0.04,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='42' height='42' viewBox='0 0 42 42' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%2306b6d4' stroke-width='0.5'%3E%3Cpath d='M0 21h42M21 0v42'/%3E%3C/g%3E%3C/svg%3E")`,
            display: "flex",
          }}
        />

        {/* Purple orb */}
        <div
          style={{
            position: "absolute",
            top: -180,
            left: -160,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(168,85,247,0.26) 0%, transparent 60%)",
            display: "flex",
          }}
        />

        {/* Cyan orb */}
        <div
          style={{
            position: "absolute",
            top: 80,
            left: 150,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(6,182,212,0.22) 0%, transparent 60%)",
            display: "flex",
          }}
        />

        {/* Emerald orb */}
        <div
          style={{
            position: "absolute",
            bottom: -220,
            right: -160,
            width: 620,
            height: 620,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 60%)",
            display: "flex",
          }}
        />

        {/* Left — Illustration */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 500,
            height: 500,
            marginLeft: 48,
            position: "relative",
            zIndex: 10,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -22,
              left: -22,
              right: -22,
              bottom: -22,
              borderRadius: 44,
              background:
                "radial-gradient(circle, rgba(6,182,212,0.28) 0%, rgba(168,85,247,0.16) 45%, transparent 70%)",
              filter: "blur(40px)",
              display: "flex",
            }}
          />
          <div
            style={{
              display: "flex",
              width: 460,
              height: 460,
              borderRadius: 28,
              border: "1px solid rgba(255,255,255,0.12)",
              overflow: "hidden",
              boxShadow:
                "0 30px 80px -20px rgba(6,182,212,0.35), 0 10px 40px -10px rgba(168,85,247,0.28)",
              position: "relative",
            }}
          >
            <img
              src={illustrationData as unknown as string}
              alt=""
              width={460}
              height={460}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "flex",
              }}
            />
          </div>
        </div>

        {/* Right — Text content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            flex: 1,
            padding: "0 64px 0 64px",
            zIndex: 10,
          }}
        >
          {/* Page label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 22,
              padding: "8px 16px",
              borderRadius: 20,
              background: "rgba(6,182,212,0.12)",
              border: "1px solid rgba(6,182,212,0.28)",
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#06b6d4",
                display: "flex",
              }}
            />
            <span
              style={{
                fontSize: 12,
                color: "#7dd3fc",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                display: "flex",
              }}
            >
              AI Agents · Infrastructure · Cost
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginBottom: 20,
            }}
          >
            <h1
              style={{
                fontSize: 56,
                fontWeight: 900,
                color: "white",
                margin: 0,
                letterSpacing: "-0.04em",
                lineHeight: 1.08,
                display: "flex",
              }}
            >
              Using AI Agents
            </h1>
            <h1
              style={{
                fontSize: 56,
                fontWeight: 900,
                background:
                  "linear-gradient(to right, #a855f7 0%, #06b6d4 55%, #10b981 100%)",
                backgroundClip: "text",
                color: "transparent",
                margin: 0,
                letterSpacing: "-0.04em",
                lineHeight: 1.08,
                display: "flex",
              }}
            >
              to Migrate Off Slack
            </h1>
          </div>

          {/* Description */}
          <p
            style={{
              fontSize: 20,
              color: "#94a3b8",
              margin: 0,
              marginBottom: 22,
              lineHeight: 1.5,
              fontWeight: 400,
              display: "flex",
              maxWidth: 520,
            }}
          >
            {
              "Two paired skills, one focused weekend, and a ~99% cut in ongoing cost."
            }
          </p>

          {/* Badges */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "6px 13px",
                borderRadius: 8,
                background: "rgba(168,85,247,0.10)",
                border: "1px solid rgba(168,85,247,0.28)",
              }}
            >
              <span
                style={{
                  color: "#d8b4fe",
                  fontSize: 13,
                  fontWeight: 700,
                  display: "flex",
                }}
              >
                Slack → Mattermost
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "6px 13px",
                borderRadius: 8,
                background: "rgba(6,182,212,0.10)",
                border: "1px solid rgba(6,182,212,0.28)",
              }}
            >
              <span
                style={{
                  color: "#7dd3fc",
                  fontSize: 13,
                  fontWeight: 700,
                  display: "flex",
                }}
              >
                Claude Code · Codex
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "6px 13px",
                borderRadius: 8,
                background: "rgba(16,185,129,0.10)",
                border: "1px solid rgba(16,185,129,0.28)",
              }}
            >
              <span
                style={{
                  color: "#6ee7b7",
                  fontSize: 13,
                  fontWeight: 700,
                  display: "flex",
                }}
              >
                Fail-Closed Cutover
              </span>
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
              "linear-gradient(90deg, transparent 0%, #a855f7 22%, #06b6d4 50%, #10b981 78%, transparent 100%)",
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
            color: "#64748b",
            letterSpacing: "0.04em",
            display: "flex",
          }}
        >
          <span style={{ display: "flex" }}>jeffreyemanuel.com</span>
        </div>
      </div>
    ),
    {
      ...size,
      headers: {
        "cache-control": "public, immutable, no-transform, max-age=31536000",
      },
    },
  );
}
