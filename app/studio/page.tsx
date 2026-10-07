import type { Metadata } from "next";
import { TessaStudio } from "@/components/tessa-studio";

export const metadata: Metadata = {
  title: "Production Lab — Tessa AI",
  description: "Build reusable production assets, extract local keyframes, and plan continuity-aware shots.",
  robots: { index: false, follow: false },
};

export default function StudioPage() {
  return <TessaStudio />;
}
