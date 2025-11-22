"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface BrandContextType {
  brandColors: string[];
  setBrandColors: React.Dispatch<React.SetStateAction<string[]>>;
  brandLogoUrl: string | null;
  setBrandLogoUrl: React.Dispatch<React.SetStateAction<string | null>>;
  brandImages: string[];
  setBrandImages: React.Dispatch<React.SetStateAction<string[]>>;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brandColors, setBrandColors] = useState<string[]>([]);
  const [brandLogoUrl, setBrandLogoUrl] = useState<string | null>(null);
  const [brandImages, setBrandImages] = useState<string[]>([]);

  return (
    <BrandContext.Provider value={{ brandColors, setBrandColors, brandLogoUrl, setBrandLogoUrl, brandImages, setBrandImages }}>
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

