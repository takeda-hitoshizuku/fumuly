import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "Fumuly（フムリー）| 封筒、無理ー！を解決するAIアプリ";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const notoSansBold = fetch(
    new URL(
      "https://fonts.gstatic.com/s/notosansjp/v53/-F6jfjtqLzI2JPCgQBnw7HFYwQgP-UBF.woff",
    ),
  ).then((res) => res.arrayBuffer());

  const fontData = await notoSansBold;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #2C4A7C 0%, #1a3460 100%)",
          fontFamily: "Noto Sans JP",
          position: "relative",
        }}
      >
        {/* 背景の装飾 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(244, 132, 95, 0.08)",
            transform: "translate(100px, -100px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "rgba(244, 132, 95, 0.06)",
            transform: "translate(-80px, 80px)",
            display: "flex",
          }}
        />

        {/* ロゴ */}
        <div
          style={{
            fontSize: "36px",
            fontWeight: 700,
            color: "rgba(255, 255, 255, 0.6)",
            letterSpacing: "4px",
            marginBottom: "24px",
            display: "flex",
          }}
        >
          Fumuly
        </div>

        {/* メインコピー */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              fontSize: "64px",
              fontWeight: 700,
              color: "white",
              display: "flex",
              alignItems: "baseline",
              gap: "8px",
            }}
          >
            <span>封筒、無理ー！</span>
          </div>
          <div
            style={{
              fontSize: "52px",
              fontWeight: 700,
              color: "#F4845F",
              display: "flex",
            }}
          >
            を解決する。
          </div>
        </div>

        {/* サブコピー */}
        <div
          style={{
            fontSize: "22px",
            color: "rgba(255, 255, 255, 0.7)",
            marginTop: "32px",
            display: "flex",
          }}
        >
          写真を撮るだけでAIが書類を読んで整理
        </div>

        {/* 下部のURL */}
        <div
          style={{
            position: "absolute",
            bottom: "36px",
            fontSize: "20px",
            color: "rgba(255, 255, 255, 0.4)",
            letterSpacing: "2px",
            display: "flex",
          }}
        >
          fumuly.com
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Noto Sans JP",
          data: fontData,
          style: "normal",
          weight: 700,
        },
      ],
    },
  );
}
