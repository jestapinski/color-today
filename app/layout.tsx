import type { Metadata } from "next";
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
      <body>{children}</body>
    </html>
  );
}
