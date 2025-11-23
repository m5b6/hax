"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { WizardLayout } from "@/components/wizard/WizardLayout";
import { StepIdentity } from "@/components/wizard/StepIdentity";
import { StepStrategy } from "@/components/wizard/StepStrategy";
import { StepFinal } from "@/components/wizard/StepFinal";
import { useWizardStore } from "@/contexts/WizardStore";

function WizardContent() {
    const searchParams = useSearchParams();
    const initialStep = parseInt(searchParams.get("step") || "0");
    const [step, setStep] = useState(initialStep);
    const wizardStore = useWizardStore();

    // Update step if URL param changes
    useEffect(() => {
        const stepParam = searchParams.get("step");
        if (stepParam) {
            setStep(parseInt(stepParam));
        }
    }, [searchParams]);

    // Update metadata with current step
    useEffect(() => {
        wizardStore.setMetadata({
            currentStep: step,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step]);

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const businessName = wizardStore.getInput("name") || "";

    const handleNext = () => {
        setStep((prev) => prev + 1);
    };

    const steps = [
        {
            title: "Cuéntanos sobre tu negocio",
            subtitle: "Empecemos por lo básico para entender qué ofreces.",
            component: <StepIdentity onNext={handleNext} onAnalyzingChange={setIsAnalyzing} />,
        },
        {
            title: "Estrategia de Campaña",
            subtitle: "Definamos a quién vamos a impactar.",
            component: <StepStrategy onNext={handleNext} />,
        },
        {
            title: "Creando tu campaña",
            subtitle: "Estamos preparando todo lo que necesitas para tu campaña.",
            component: <StepFinal />,
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
        >
            {currentStepData.component}
        </WizardLayout>
    );
}

export default function DemoPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <WizardContent />
        </Suspense>
    );
}
