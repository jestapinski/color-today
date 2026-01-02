import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "color today",
  description:
    "A daily abstract coloring canvas for calm, playful moments. Tap a shape, pick a hue, and share your take on today.",
  applicationName: "color today",
  keywords: ["coloring", "daily", "abstract", "canvas", "art"],
  metadataBase: new URL("https://color-today.com"),
  openGraph: {
    title: "color today",
    description:
      "Daily abstract coloring for calm, playful moments. Tap a shape, pick a hue, and share your take on today.",
    type: "website",
    url: "https://color-today.com",
    siteName: "color today",
    images: [
      {
        url: "/og.svg",
        width: 1200,
        height: 630,
        alt: "color today preview"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "color today",
    description:
      "Daily abstract coloring for calm, playful moments. Tap a shape, pick a hue, and share your take on today.",
    images: ["/og.svg"]
  },
  icons: {
    icon: "/favicon.ico"
  },
  themeColor: "#f0643a"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="google-adsense-account" content="ca-pub-5085814365069072" />
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-J4QMC7WT6T"
          strategy="lazyOnload"
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5085814365069072"
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />
        <Script id="gtag-init" strategy="lazyOnload">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-J4QMC7WT6T');`}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
