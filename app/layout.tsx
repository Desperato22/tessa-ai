import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://tessa22.cc"),
  applicationName: "Tessa AI",
  title: "Tessa AI — Production Lab",
  description: "Turn scripts and videos into reusable production assets, keyframes, and continuity-aware shot plans.",
  creator: "Tessa AI",
  openGraph: {
    title: "Tessa AI — Production Lab",
    description: "Turn scripts and videos into reusable production assets, keyframes, and continuity-aware shot plans.",
    url: "https://tessa22.cc",
    siteName: "Tessa AI",
    type: "website",
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
    <html lang="vi">
      <body className="antialiased">{children}</body>
    </html>
  );
}
