"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface BrandContextType {
  brandColors: string[];
  setBrandColors: (colors: string[]) => void;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export function BrandProvider({ children }: { children: ReactNode }) {
  const [brandColors, setBrandColors] = useState<string[]>([]);

  return (
    <BrandContext.Provider value={{ brandColors, setBrandColors }}>
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

