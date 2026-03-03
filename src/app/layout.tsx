import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "העובדות המגניבות של אלה ושקד ✨",
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
      </body>
    </html>
  );
}
