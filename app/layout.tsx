import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.tessa22.cc"),
  applicationName: "Tessa AI",
  title: "Tessa AI — AI Film Pre-production Workspace",
  description: "Turn scripts and reference videos into reusable production assets, local keyframes, and continuity-aware shot plans.",
  creator: "Tessa AI",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Tessa AI — AI Film Pre-production Workspace",
    description: "Turn scripts and reference videos into reusable production assets, local keyframes, and continuity-aware shot plans.",
    url: "https://www.tessa22.cc",
    siteName: "Tessa AI",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Tessa AI — AI Film Pre-production Workspace",
    description: "Turn scripts and reference videos into production-ready visual plans.",
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
