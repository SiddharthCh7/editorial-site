import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.name} - ${site.descriptor}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * A typographic share card rather than a photograph: warm paper, ink serif,
 * one accent rule. Generated at build time, so it ships as a static PNG.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#F3F0E7",
          color: "#202522",
          padding: "72px 80px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 10, height: 10, backgroundColor: "#A9412B" }} />
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 20,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#6C7067",
            }}
          >
            {`${site.descriptor} · independent notes`}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28, alignItems: "flex-start" }}>
          <div style={{ fontSize: 96, lineHeight: 1.02, letterSpacing: -2.5, maxWidth: 940 }}>
            Understanding the systems beneath intelligence.
          </div>
          <div
            style={{
              width: 220,
              height: 2,
              backgroundColor: "#A9412B",
              marginTop: 8,
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderTop: "1px solid #D7D1C4",
            paddingTop: 24,
            fontFamily: "monospace",
            fontSize: 22,
            letterSpacing: 3,
            color: "#5F635B",
            textTransform: "uppercase",
          }}
        >
          <span>{site.name}</span>
          <span>LLM inference · agents · systems</span>
        </div>
      </div>
    ),
    size,
  );
}
