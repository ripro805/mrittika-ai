import React, { createContext, useContext, useState } from "react";

export interface UnifiedFlowState {
  selectedCrop: {
    slug: string;
    name_bn: string;
    name_en: string;
    fertilizer_supported: boolean;
  } | null;
  soilInputs: {
    N: number;
    P: number;
    K: number;
    pH: number;
    season: string;
    soil_type: string;
    temperature: number;
    humidity: number;
    rainfall: number;
    district?: string;
    S?: number | null;
    Zn?: number | null;
    organic_matter?: number | null;
    land_area?: number;
    land_unit?: string;
  } | null;
  fertilizerPlanResult: any | null;
  assistantContext: {
    crop?: string;
    fertilizer_plan?: string;
  } | null;
  prefillFertilizerFromCrop: (cropData: any, inputs: any) => void;
  carryContextToAssistant: (cropName: string, planName?: string) => void;
  resetFlow: () => void;
}

const UnifiedFlowContext = createContext<UnifiedFlowState | undefined>(undefined);

export const UnifiedFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCrop, setSelectedCrop] = useState<any | null>(null);
  const [soilInputs, setSoilInputs] = useState<any | null>(null);
  const [fertilizerPlanResult, setFertilizerPlanResult] = useState<any | null>(null);
  const [assistantContext, setAssistantContext] = useState<any | null>(null);

  const prefillFertilizerFromCrop = (cropData: any, inputs: any) => {
    setSelectedCrop({
      slug: cropData.crop_slug,
      name_bn: cropData.crop_name_bn,
      name_en: cropData.crop_name_en,
      fertilizer_supported: cropData.fertilizer_supported,
    });
    setSoilInputs({
      ...inputs,
      land_area: 1.0,
      land_unit: "bigha",
    });
  };

  const carryContextToAssistant = (cropName: string, planName?: string) => {
    setAssistantContext({
      crop: cropName,
      fertilizer_plan: planName || "",
    });
  };

  const resetFlow = () => {
    setSelectedCrop(null);
    setSoilInputs(null);
    setFertilizerPlanResult(null);
    setAssistantContext(null);
  };

  return (
    <UnifiedFlowContext.Provider
      value={{
        selectedCrop,
        soilInputs,
        fertilizerPlanResult,
        assistantContext,
        prefillFertilizerFromCrop,
        carryContextToAssistant,
        resetFlow,
      }}
    >
      {children}
    </UnifiedFlowContext.Provider>
  );
};

export const useUnifiedFlow = () => {
  const context = useContext(UnifiedFlowContext);
  if (!context) {
    throw new Error("useUnifiedFlow must be used within a UnifiedFlowProvider");
  }
  return context;
};
