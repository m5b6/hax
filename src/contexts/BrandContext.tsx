"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface BrandContextType {
  brandColors: string[];
  setBrandColors: (colors: string[]) => void;
  brandLogoUrl: string | null;
  setBrandLogoUrl: (logo: string | null) => void;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brandColors, setBrandColors] = useState<string[]>([]);
  const [brandLogoUrl, setBrandLogoUrl] = useState<string | null>(null);

  return (
    <BrandContext.Provider value={{ brandColors, setBrandColors, brandLogoUrl, setBrandLogoUrl }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error("useBrand must be used within a BrandProvider");
  }
  return context;
}

