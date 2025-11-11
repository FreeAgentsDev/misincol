import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import LayoutShell from "@/components/ui/layout-shell";
import { AuthProvider } from "@/context/auth-context";

export const metadata: Metadata = {
  title: "Misincol · Gestión de equipos",
  description: "MVP de gestión de equipos para Misincol con datos mock"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-100 font-sans text-slate-900 antialiased">
        <AuthProvider>
          <LayoutShell>{children}</LayoutShell>
        </AuthProvider>
      </body>
    </html>
  );
}

