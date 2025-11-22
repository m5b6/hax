import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Copiloto de Campañas",
  description: "Apple-like reductionist copilot for Meta ads",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans antialiased bg-slate-50/50 text-slate-900 min-h-screen overflow-x-hidden selection:bg-blue-100 selection:text-blue-900`}>
        {children}
      </body>
    </html>
  );
}
