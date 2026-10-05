import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DeepSeek: Survive the AI Market",
  description: "A live classroom strategy game. Build an AI company, make four decisions and compete in a changing market.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
