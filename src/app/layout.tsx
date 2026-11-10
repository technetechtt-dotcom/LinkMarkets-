import type { Metadata } from "next";
import { DM_Sans, Manrope } from "next/font/google";
import { Header } from "@/components/header";
import { Providers } from "@/components/providers";
import "./globals.css";

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const display = Manrope({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "FleetMarket SA | Cars & Motorcycles for Work",
  description:
    "South African marketplace for renting delivery motorcycles and e-hailing cars. Post listings or request a vehicle.",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-ZA">
      <body className={`${sans.variable} ${display.variable} font-[family-name:var(--font-sans)] antialiased`}>
        <Providers>
          <Header />
          <main>{children}</main>
          <footer className="mt-16 bg-[var(--navy)] px-4 py-8 text-xs text-slate-300">
            <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-3">
              <span>FleetMarket SA · Vehicle rental marketplace</span>
              <span>Not affiliated with Uber, Bolt, inDrive, Maxim, Checkers or delivery brands.</span>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
