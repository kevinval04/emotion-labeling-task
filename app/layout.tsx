import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tweet emotion labeling task",
  description:
    "A short research task: read five tweets and label the emotion each expresses.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
