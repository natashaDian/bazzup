import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { cn } from "@/lib/utils";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BazzUp",
  description: "Temukan bazaar, kembangkan bisnismu.",
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html lang="id" className={cn(inter.variable, "h-full antialiased")}>
      <body className="min-h-full flex flex-col overflow-x-hidden bg-white">{children}</body>
    </html>
  );
}