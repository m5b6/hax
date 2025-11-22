import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { BrandProvider } from "@/contexts/BrandContext";
import { WizardStoreProvider } from "@/contexts/WizardStore";
import DynamicColorBends from "@/components/DynamicColorBends";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});
const instrumentSerif = Instrument_Serif({ 
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-instrument-serif",
});
// Using Inter as Instrument Sans - Instrument Sans font may not be available
// We'll use Inter with a specific style for MCQ titles
const instrumentSans = inter; // Fallback to Inter for now

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
      <body className={`${inter.variable} ${instrumentSerif.variable} font-sans antialiased text-slate-900 min-h-screen overflow-x-hidden selection:bg-blue-100 selection:text-blue-900`}>
        <BrandProvider>
          <WizardStoreProvider>
            <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
              <DynamicColorBends />
            </div>
            {children}
          </WizardStoreProvider>
        </BrandProvider>
      </body>
    </html>
  );
}
