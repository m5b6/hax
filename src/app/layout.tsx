import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ColorBends from "@/components/ColorBends";

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
      <body className={`${inter.variable} font-sans antialiased text-slate-900 min-h-screen overflow-x-hidden selection:bg-blue-100 selection:text-blue-900`}>
        <ColorBends 
          transparent={true}
          colors={['#40C9FF', '#E81CFF', '#FF9F0A']}
          speed={0.2}
          frequency={1}
          warpStrength={1}
          mouseInfluence={1}
          parallax={0.5}
        />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
