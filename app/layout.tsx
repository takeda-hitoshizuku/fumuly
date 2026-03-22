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
  alternates: {
    canonical: "https://fumuly.com",
  },
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
    card: "summary_large_image",
    title: "Fumuly（フムリー）| 封筒、無理ー！を解決するAIアプリ",
    description:
      "写真を撮るだけでAIが書類を読んで整理。督促も年金も、何をすべきか教えてくれる。",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebApplication",
                  "name": "Fumuly",
                  "alternateName": "フムリー",
                  "url": "https://fumuly.com",
                  "description":
                    "写真を撮るだけでAIが書類を読んで整理。督促も年金も、何をすべきか教えてくれる。電話なしの対処法を優先案内。",
                  "applicationCategory": "UtilitiesApplication",
                  "operatingSystem": "Web",
                  "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "JPY",
                    "description": "無料プランあり",
                  },
                  "inLanguage": "ja",
                },
                {
                  "@type": "Organization",
                  "name": "Fumuly",
                  "url": "https://fumuly.com",
                  "logo": "https://fumuly.com/icons/icon-512x512.png",
                },
              ],
            }),
          }}
        />
        <UpdateBanner />
        {children}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
