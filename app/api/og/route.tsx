import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0b0b0f 0%, #1a1025 40%, #0f0a1a 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background circles */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-150px",
            left: "-100px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "80px",
            height: "80px",
            borderRadius: "20px",
            background: "linear-gradient(135deg, #7c3aed, #8b5cf6)",
            marginBottom: "24px",
            boxShadow: "0 0 40px rgba(124,58,237,0.4)",
          }}
        >
          <span style={{ fontSize: "40px", fontWeight: 800, color: "white" }}>W</span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "64px",
            fontWeight: 800,
            color: "white",
            textAlign: "center",
            lineHeight: 1.1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span>Grandis sur Instagram</span>
          <span
            style={{
              background: "linear-gradient(90deg, #7c3aed, #8b5cf6, #06b6d4)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            avec ton coach IA
          </span>
        </div>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "24px",
            color: "rgba(255,255,255,0.6)",
            marginTop: "20px",
            textAlign: "center",
            maxWidth: "800px",
          }}
        >
          Analytics, Viral Score, Analyse concurrentielle, Contenu IA — 6 outils pour booster ta croissance.
        </p>

        {/* Feature pills */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "32px",
          }}
        >
          {["Analytics", "Viral Score", "Coach IA", "Concurrents", "Contenu IA", "Gratuit"].map(
            (label) => (
              <div
                key={label}
                style={{
                  padding: "8px 20px",
                  borderRadius: "50px",
                  background: "rgba(124,58,237,0.15)",
                  border: "1px solid rgba(124,58,237,0.3)",
                  color: "rgba(255,255,255,0.8)",
                  fontSize: "16px",
                  fontWeight: 600,
                }}
              >
                {label}
              </div>
            ),
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "rgba(255,255,255,0.3)",
            fontSize: "16px",
          }}
        >
          <span>winly.app</span>
          <span>·</span>
          <span>Gratuit pour commencer</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
