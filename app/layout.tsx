import type { Metadata } from "next";
import { Amita } from "next/font/google";
import Image from "next/image";
import "./globals.css";

const amitaFont = Amita({
  variable: "--amita-sans",
  weight: "700",
  style: "normal"
});

export const metadata: Metadata = {
  title: "Sayapatri",
  description: "Tri-kala club's spring production",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
      </head>
      <body className={`${amitaFont.variable} antialiased overflow-x-hidden`}>
        {children}
      </body>
    </html>
  );
}