import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GTM Monitoring System - Monitor & Optimize Google Tag Manager",
  description:
    "Professional dashboard for analyzing Google Tag Manager performance. Track load times, script execution, and optimize your website’s tag strategy with actionable insights.",
  keywords:
    "GTM, Google Tag Manager, insights, dashboard, performance, audit, analytics, optimization",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
