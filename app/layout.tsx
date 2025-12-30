import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "color today",
  description:
    "A daily abstract coloring canvas. Pick a color, tap a shape, and share your creation.",
  applicationName: "color today",
  keywords: ["coloring", "daily", "abstract", "canvas", "art"],
  openGraph: {
    title: "color today",
    description:
      "A daily abstract coloring canvas. Pick a color, tap a shape, and share your creation.",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "color today",
    description:
      "A daily abstract coloring canvas. Pick a color, tap a shape, and share your creation."
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
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
