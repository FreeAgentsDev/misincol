import "./globals.css";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ReactNode } from "react";
import LayoutShell from "@/components/ui/layout-shell";
import { AuthProvider } from "@/context/auth-context";

export const metadata: Metadata = {
  title: "Misincol · Gestión de equipos",
  description: "MVP de gestión de equipos para Misincol con datos mock"
};

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap"
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body
        className={`${fontSans.variable} relative min-h-screen bg-sand-50/80 font-sans text-cocoa-900 antialiased`}
      >
        <div className="pointer-events-none fixed inset-0 -z-10 bg-grain-overlay" aria-hidden />
        <AuthProvider>
          <LayoutShell>{children}</LayoutShell>
        </AuthProvider>
      </body>
    </html>
  );
}

