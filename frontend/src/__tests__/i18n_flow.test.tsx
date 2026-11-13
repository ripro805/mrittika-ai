import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../context/AuthContext";
import { UnifiedFlowProvider, useUnifiedFlow } from "../context/UnifiedFlowContext";
import i18n from "../i18n";

const queryClient = new QueryClient();

const FlowConsumer: React.FC = () => {
  const { selectedCrop, prefillFertilizerFromCrop } = useUnifiedFlow();

  return (
    <div>
      <span data-testid="crop-name">{selectedCrop?.name_bn || "none"}</span>
      <button
        onClick={() =>
          prefillFertilizerFromCrop(
            { crop_slug: "rice_aman", crop_name_bn: "আমন ধান", crop_name_en: "Aman Rice", fertilizer_supported: true },
            { N: 100, P: 50, K: 60 }
          )
        }
      >
        Prefill
      </button>
    </div>
  );
};

describe("i18n and Unified Flow Context Tests", () => {
  it("toggles language between Bangla and English cleanly", async () => {
    await act(async () => {
      await i18n.changeLanguage("bn");
    });
    expect(i18n.t("app_name")).toBe("মৃত্তিকা এআই");

    await act(async () => {
      await i18n.changeLanguage("en");
    });
    expect(i18n.t("app_name")).toBe("Mrittika AI");

    // Reset back to Bangla
    await act(async () => {
      await i18n.changeLanguage("bn");
    });
  });

  it("carries crop context into unified flow state on one-tap prefill", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <UnifiedFlowProvider>
            <BrowserRouter>
              <FlowConsumer />
            </BrowserRouter>
          </UnifiedFlowProvider>
        </AuthProvider>
      </QueryClientProvider>
    );

    expect(screen.getByTestId("crop-name").textContent).toBe("none");

    const prefillBtn = screen.getByText("Prefill");
    act(() => {
      prefillBtn.click();
    });

    expect(screen.getByTestId("crop-name").textContent).toBe("আমন ধান");
  });
});
