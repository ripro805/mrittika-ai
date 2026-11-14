import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../context/AuthContext";
import { UnifiedFlowProvider } from "../context/UnifiedFlowContext";
import { CropRecommendPage } from "../pages/CropRecommendPage";
import { FertilizerPlanPage } from "../pages/FertilizerPlanPage";
import "../i18n";

const queryClient = new QueryClient();

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UnifiedFlowProvider>
          <BrowserRouter>{component}</BrowserRouter>
        </UnifiedFlowProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe("Frontend Forms and Validation Tests", () => {
  it("renders Crop Recommendation form with all nutrient inputs", () => {
    renderWithProviders(<CropRecommendPage />);

    expect(screen.getByText("মাটি ও আবহাওয়ার ভিত্তিতে সেরা ফসল")).toBeInTheDocument();
    expect(screen.getByText(/নাইট্রোজেন \(N\)/i)).toBeInTheDocument();
    expect(screen.getByText(/ফসফরাস \(P\)/i)).toBeInTheDocument();
    expect(screen.getByText(/পটাশিয়াম \(K\)/i)).toBeInTheDocument();
    expect(screen.getByText(/মাটির পিএইচ \(pH\)/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole("button", { name: /উপযুক্ত ফসল খুঁজুন/i });
    expect(submitBtn).toBeInTheDocument();
  });

  it("renders Fertilizer Plan form and handles land area inputs", () => {
    renderWithProviders(<FertilizerPlanPage />);

    expect(screen.getByText("সুষম সারের সঠিক মাত্রা নির্ধারণ")).toBeInTheDocument();
    expect(screen.getByText(/জমির পরিমাণ/i)).toBeInTheDocument();
    expect(screen.getByText(/জমির একক/i)).toBeInTheDocument();

    const calcBtn = screen.getByRole("button", { name: /সারের হিসাব দেখুন/i });
    expect(calcBtn).toBeInTheDocument();
  });
});
