import type { Metadata } from "next";
import "./globals.css";
import "./mobile-overrides.css";

export const metadata: Metadata = {
  title: "THE XINJIANG EDIT｜北疆秋日旅行指南",
  description: "一份关于北疆秋日路线、穿搭、摄影与旅行舒适度的中文指南。",
  openGraph: {
    title: "THE XINJIANG EDIT",
    description: "北疆秋日旅行指南 · STYLE · PLACES · NOTES",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "THE XINJIANG EDIT",
    description: "北疆秋日旅行指南 · STYLE · PLACES · NOTES",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/icons/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="theme-color" content="#edf1ed" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
