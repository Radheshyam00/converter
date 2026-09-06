import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PDF & Image Tools",
  description:
    "Free browser-based tools to convert, edit, compress, resize and manage PDF and image files.",
  keywords: [
    "PDF tools",
    "Markdown to PDF",
    "PDF to JPEG",
    "JPEG to PDF",
    "Merge PDF",
    "Compress PDF",
    "Resize PDF",
    "Compress Image",
    "Resize Image",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}