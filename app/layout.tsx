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
  description: "Discover bazaars, grow your business.",
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn(inter.variable, "h-full antialiased bg-background")}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}