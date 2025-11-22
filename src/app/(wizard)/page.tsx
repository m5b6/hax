"use client";

import React, { useState } from "react";
import { WizardLayout } from "@/components/wizard/WizardLayout";
import { StepIdentity } from "@/components/wizard/StepIdentity";
import { StepBrand } from "@/components/wizard/StepBrand";
import { StepStrategy } from "@/components/wizard/StepStrategy";
import { StepFinal } from "@/components/wizard/StepFinal";

export default function WizardPage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<any>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [businessName, setBusinessName] = useState("");

  const handleNext = (newData: any) => {
    setData((prev: any) => ({ ...prev, ...newData }));
    setStep((prev) => prev + 1);
  };

  const getStepTitle = (stepIndex: number) => {
    if (stepIndex === 0) {
      return businessName ? `Cuéntanos sobre ${businessName}` : "Cuéntanos sobre tu negocio";
    }
    return steps[stepIndex].title;
  };

  const steps = [
    {
      title: "Cuéntanos sobre tu negocio",
      subtitle: "Empecemos por lo básico para entender qué ofreces.",
      component: <StepIdentity onNext={handleNext} onAnalyzingChange={setIsAnalyzing} onNameChange={setBusinessName} />,
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

  const currentStepData = steps[step];

  return (
    <WizardLayout
      currentStep={step}
      totalSteps={steps.length}
      title={getStepTitle(step)}
      subtitle={currentStepData.subtitle}
      isAnalyzing={isAnalyzing}
    >
      {currentStepData.component}
    </WizardLayout>
  );
}
