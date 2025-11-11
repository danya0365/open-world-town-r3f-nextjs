import { ThemeProvider } from "@/src/presentation/providers/ThemeProvider";
import type { Metadata } from "next";
import "../public/styles/index.css";

export const metadata: Metadata = {
  title: "Open World Town – Multiplayer Top-Down Sandbox",
  description:
    "สร้างเมืองเสมือนแบบ Top-Down ด้วย React Three Fiber ปรับแต่งสิ่งปลูกสร้างได้อิสระ เชื่อมต่อเพื่อนแบบเรียลไทม์ผ่าน Colyseus พร้อมวิดีโอ/สกรีนแชร์ผ่าน PeerJS และสินทรัพย์ SunnySide UI",
  keywords: [
    "open world town",
    "top-down multiplayer",
    "react three fiber",
    "colyseus",
    "peerjs",
    "webrtc",
    "tailwind css ui",
    "customizable town",
    "sunny side assets",
    "gathertown inspiration",
    "next.js app router",
    "zustand state",
  ],
  authors: [{ name: "Open World Town Team" }],
  creator: "Marosdee Uma",
  publisher: "Open World Town",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    shortcut: ["/favicon.ico"],
    apple: ["/favicon/apple-touch-icon.png"],
  },
  manifest: "/favicon/site.webmanifest",
  openGraph: {
    title: "Open World Town – Multiplayer Top-Down Sandbox",
    description:
      "ผจญภัยในเมืองเสมือนมุมมอง Top-Down ปรับแต่งฉากได้ไม่จำกัด พร้อมระบบมัลติเพลเยอร์เรียลไทม์และสื่อสารผ่าน WebRTC",
    type: "website",
    siteName: "Open World Town",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Open World Town – Top-Down Multiplayer Sandbox",
      },
    ],
    locale: "th_TH",
  },
  twitter: {
    card: "summary_large_image",
    title: "Open World Town – Multiplayer Top-Down Sandbox",
    description:
      "สร้างและแชร์เมืองเสมือนแบบ Top-Down เล่นพร้อมเพื่อนแบบเรียลไทม์ด้วย Colyseus และ PeerJS",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
