import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt =
  "Drafting a Serious Estate Plan on a Saturday | Jeffrey Emanuel";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  const illustrationData = await fetch(
    new URL(
      "../../../assets/wills_estate_post_illustration.webp",
      import.meta.url,
    ),
  ).then((response) => response.arrayBuffer());

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
            "linear-gradient(145deg, #07070b 0%, #120b12 36%, #0a1118 68%, #06070b 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.04,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='42' height='42' viewBox='0 0 42 42' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%2306b6d4' stroke-width='0.5'%3E%3Cpath d='M0 21h42M21 0v42'/%3E%3C/g%3E%3C/svg%3E")`,
            display: "flex",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: -200,
            left: -150,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(245,158,11,0.16) 0%, transparent 60%)",
            display: "flex",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 88,
            left: 160,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 60%)",
            display: "flex",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: -220,
            right: -150,
            width: 620,
            height: 620,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 60%)",
            display: "flex",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 80,
            zIndex: 10,
            padding: "40px 80px",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 520,
              height: 520,
              position: "relative",
              marginLeft: 24,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -24,
                left: -24,
                right: -24,
                bottom: -24,
                borderRadius: 48,
                background:
                  "radial-gradient(circle, rgba(6,182,212,0.28) 0%, rgba(168,85,247,0.16) 45%, transparent 70%)",
                filter: "blur(40px)",
                display: "flex",
              }}
            />

            <div
              style={{
                display: "flex",
                width: 480,
                height: 480,
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
                width={480}
                height={480}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "flex",
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "center",
              flex: 1,
              maxWidth: 560,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 22,
                padding: "8px 16px",
                borderRadius: 20,
                background: "rgba(245,158,11,0.12)",
                border: "1px solid rgba(245,158,11,0.26)",
              }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#f59e0b",
                  display: "flex",
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  color: "#fdba74",
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  display: "flex",
                }}
              >
                Life Planning · AI Agents · Attorney Review
              </span>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginBottom: 22,
              }}
            >
              <h1
                style={{
                  fontSize: 54,
                  fontWeight: 900,
                  color: "white",
                  margin: 0,
                  letterSpacing: "-0.04em",
                  lineHeight: 1.08,
                  display: "flex",
                }}
              >
                Drafting a Serious
              </h1>
              <h1
                style={{
                  fontSize: 54,
                  fontWeight: 900,
                  background:
                    "linear-gradient(to right, #f59e0b 0%, #a855f7 40%, #06b6d4 72%, #10b981 100%)",
                  backgroundClip: "text",
                  color: "transparent",
                  margin: 0,
                  letterSpacing: "-0.04em",
                  lineHeight: 1.08,
                  display: "flex",
                }}
              >
                Estate Plan on a Saturday.
              </h1>
            </div>

            <p
              style={{
                fontSize: 22,
                color: "#94a3b8",
                margin: 0,
                marginBottom: 26,
                lineHeight: 1.5,
                fontWeight: 400,
                display: "flex",
                maxWidth: 520,
              }}
            >
              {"AI agents · paid skill · attorney signs the docs."}
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                marginBottom: 28,
              }}
            >
              {[
                {
                  label: "201 files",
                  color: "rgba(168,85,247,0.12)",
                  border: "rgba(168,85,247,0.24)",
                  text: "#d8b4fe",
                },
                {
                  label: "17 subagents",
                  color: "rgba(6,182,212,0.12)",
                  border: "rgba(6,182,212,0.24)",
                  text: "#7dd3fc",
                },
                {
                  label: "45 templates",
                  color: "rgba(16,185,129,0.12)",
                  border: "rgba(16,185,129,0.24)",
                  text: "#6ee7b7",
                },
              ].map((badge) => (
                <div
                  key={badge.label}
                  style={{
                    display: "flex",
                    padding: "9px 14px",
                    borderRadius: 999,
                    background: badge.color,
                    border: `1px solid ${badge.border}`,
                    color: badge.text,
                    fontSize: 15,
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {badge.label}
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginTop: 6,
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #f59e0b 0%, #a855f7 45%, #06b6d4 100%)",
                  display: "flex",
                }}
              />
              <span
                style={{
                  fontSize: 17,
                  color: "#cbd5e1",
                  fontWeight: 500,
                  letterSpacing: "-0.01em",
                  display: "flex",
                }}
              >
                Jeffrey Emanuel · jeffreyemanuel.com
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
