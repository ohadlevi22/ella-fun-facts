import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "העובדות המגניבות ✨",
  description: "עובדות מדהימות על חלל, טבע, חיות, כלי רכב, מטוסים וספינות!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
