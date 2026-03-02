import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { UpdateBanner } from "@/components/fumuly/update-banner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fumuly（フムリー）| 封筒、無理ー！を解決するAIアプリ",
  description:
    "写真を撮るだけでAIが書類を読んで整理。督促も年金も、何をすべきか教えてくれる。電話なしの対処法を優先案内。",
  manifest: "/manifest.json",
  metadataBase: new URL("https://fumuly.com"),
  openGraph: {
    title: "Fumuly（フムリー）| 封筒、無理ー！を解決するAIアプリ",
    description:
      "写真を撮るだけでAIが書類を読んで整理。督促も年金も、何をすべきか教えてくれる。",
    url: "https://fumuly.com",
    siteName: "Fumuly",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Fumuly（フムリー）| 封筒、無理ー！を解決するAIアプリ",
    description:
      "写真を撮るだけでAIが書類を読んで整理。督促も年金も、何をすべきか教えてくれる。",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Fumuly",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2C4A7C",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${inter.variable} ${notoSansJP.variable} antialiased`}
      >
        <UpdateBanner />
        {children}
      </body>
      <GoogleAnalytics gaId="G-LED5D1MCK9" />
    </html>
  );
}
