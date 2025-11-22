"use client";

import { useBrand } from "@/contexts/BrandContext";
import ColorBends from "./ColorBends";

export default function DynamicColorBends() {
  const { brandColors } = useBrand();

  return (
    <ColorBends 
      transparent={false}
      colors={brandColors.length > 0 ? brandColors : ['#40C9FF', '#E81CFF', '#FF9F0A']}
      speed={0.5}
      frequency={1}
      warpStrength={1}
      mouseInfluence={1}
      parallax={0.5}
    />
  );
}

