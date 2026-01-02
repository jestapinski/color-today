import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "color today",
  description:
    "A daily, feel-good coloring ritual for adults and kids. Relax with playful abstract art, tap shapes, pick calming colors, and unwind with today’s canvas.",
  applicationName: "color today",
  keywords: [
    "coloring",
    "daily coloring",
    "relaxing coloring",
    "calming art",
    "mindful coloring",
    "stress relief",
    "coloring app",
    "coloring game",
    "creative break",
    "abstract art",
    "coloring canvas",
    "paint by shape",
    "digital coloring",
    "soothing activity",
    "fun relaxation"
  ],
  metadataBase: new URL("https://color-today.com"),
  openGraph: {
    title: "color today — a fun, relaxing daily coloring ritual",
    description:
      "Unwind with a playful, calming coloring canvas every day. Tap shapes, choose soothing hues, and enjoy a mindful creative break.",
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
    title: "color today — fun, calming daily coloring",
    description:
      "Relax with a new abstract coloring canvas every day. Tap shapes, pick soothing colors, and take a mindful break.",
    images: ["/og.svg"]
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
