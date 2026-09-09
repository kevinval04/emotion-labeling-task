import type { Metadata } from "next";
import { Atkinson_Hyperlegible } from "next/font/google";
import "./globals.css";

// Atkinson Hyperlegible is designed by the Braille Institute so that
// similar letterforms stay distinguishable for low-vision readers. The task
// asks participants to read short text closely, so legibility matters more
// here than style.
const atkinson = Atkinson_Hyperlegible({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tweet emotion labeling",
  description:
    "A short research task: read five tweets and label the emotion each expresses.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={atkinson.className}>{children}</body>
    </html>
  );
}
