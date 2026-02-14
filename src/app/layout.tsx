// src/app/layout.tsx

// --- 🛡️ THE FIX: START ---
// This teaches the server what "localStorage" is so it stops crashing.
if (typeof window === "undefined") {
  if (typeof localStorage === "undefined" || typeof localStorage.getItem !== "function") {
    (global as any).localStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      key: () => null,
      length: 0,
    };
  }
}
// --- 🛡️ THE FIX: END ---

import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-source-code-pro",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SetMyStay",
  description: "Find Your Perfect Living Space",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn(inter.variable, sourceCodePro.variable)}>
      <body className="font-body bg-background" suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}