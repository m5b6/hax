"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { WizardLayout } from "@/components/wizard/WizardLayout";
import { StepIdentity } from "@/components/wizard/StepIdentity";
import { StepBrand } from "@/components/wizard/StepBrand";
import { StepStrategy } from "@/components/wizard/StepStrategy";
import { StepFinal } from "@/components/wizard/StepFinal";

function WizardContent() {
  const searchParams = useSearchParams();
  const initialStep = parseInt(searchParams.get("step") || "0");
  const [step, setStep] = useState(initialStep);
  
  // Update step if URL param changes
  useEffect(() => {
    const stepParam = searchParams.get("step");
    if (stepParam) {
      setStep(parseInt(stepParam));
    }
  }, [searchParams]);

  const [data, setData] = useState<any>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [brandColors, setBrandColors] = useState<string[]>([]);

  const handleNext = (newData: any) => {
    setData((prev: any) => ({ ...prev, ...newData }));
    setStep((prev) => prev + 1);
  };

  const steps = [
    {
      title: "Cuéntanos sobre tu negocio",
      subtitle: "Empecemos por lo básico para entender qué ofreces.",
      component: <StepIdentity onNext={handleNext} onAnalyzingChange={setIsAnalyzing} onNameChange={setBusinessName} onColorsDiscovered={setBrandColors} />,
    },
    {
      title: "Identidad de Marca",
      subtitle: "Analizando tu estilo para sugerir la mejor estética.",
      component: <StepBrand onNext={handleNext} previousData={data} />,
    },
    {
      title: "Estrategia de Campaña",
      subtitle: "Definamos a quién vamos a impactar.",
      component: <StepStrategy onNext={handleNext} previousData={data} />,
    },
    {
      title: "Tu Campaña Lista",
      subtitle: "Todo lo que necesitas para lanzar en Meta Ads.",
      component: <StepFinal data={data} />,
    },
  ];

  const getStepTitle = (stepIndex: number) => {
    if (stepIndex === 0) {
      return businessName ? `Cuéntanos sobre ${businessName}` : "Cuéntanos sobre tu negocio";
    }
    return steps[stepIndex]?.title || "";
  };

  const currentStepData = steps[step] || steps[0];

  return (
    <WizardLayout
      currentStep={step}
      totalSteps={steps.length}
      title={getStepTitle(step)}
      subtitle={currentStepData.subtitle}
      isAnalyzing={isAnalyzing}
      brandColors={brandColors}
    >
      {currentStepData.component}
    </WizardLayout>
  );
}

export default function WizardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WizardContent />
    </Suspense>
  );
}
