import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { FarmerDashboardPage } from "../pages/farmer/FarmerDashboardPage";
import { OfficerDashboardPage } from "../pages/officer/OfficerDashboardPage";
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";
import apiClient from "../services/api";

vi.mock("../services/api");

describe("Three Premium Role-Based Portals Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Farmer Portal Dashboard with localized stats and weather", async () => {
    (apiClient.get as any).mockResolvedValueOnce({
      data: {
        farmer: {
          id: 1,
          name: "কৃষক আকমল হোসেন",
          district: "Bogra",
          upazila: "Sherpur",
          role: "FARMER",
        },
        stats: {
          total_recommendations: 15,
          crop_recommendations: 10,
          fertilizer_plans: 5,
          chat_sessions: 3,
        },
        weather: {
          temperature: 24.5,
          humidity: 70,
          rainfall: 10,
          district_bn: "বগুড়া",
          fallback: false,
        },
        recent_recommendations: [],
        seasonal_tip: {
          title_bn: "রবি মৌসুমের বিশেষ পরামর্শ",
          content_bn: "শীতকালে মাটিতে রসের ঘাটতি দেখা দিতে পারে।",
        },
      },
    });

    render(
      <BrowserRouter>
        <FarmerDashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/স্বাগতম, কৃষক আকমল হোসেন/i)).toBeInTheDocument();
      expect(screen.getByText(/রবি মৌসুমের বিশেষ পরামর্শ/i)).toBeInTheDocument();
      expect(screen.getByText(/24.5°C/i)).toBeInTheDocument();
    });
  });

  it("renders Extension Officer Dashboard with pending and resolved metrics", async () => {
    (apiClient.get as any).mockResolvedValueOnce({
      data: {
        officer: {
          id: 2,
          name: "ড. মো. রফিকুল ইসলাম",
          district: "Bogra",
          upazila: "Sherpur",
          is_verified: true,
        },
        stats: {
          total_flagged: 64,
          pending_reviews: 32,
          resolved_reviews: 32,
          resolution_rate_percent: 50.0,
        },
        recent_pending: [],
        recent_resolved: [],
      },
    });

    render(
      <BrowserRouter>
        <OfficerDashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/ড. মো. রফিকুল ইসলাম/i)).toBeInTheDocument();
      expect(screen.getByText(/যাচাইকৃত কর্মকর্তা/i)).toBeInTheDocument();
      expect(screen.getByText(/অপেক্ষমাণ নিরীক্ষা \(Pending\)/i)).toBeInTheDocument();
    });
  });

  it("renders Admin Executive Command Center with core metrics", async () => {
    (apiClient.get as any).mockResolvedValueOnce({
      data: {
        users: { total: 270, farmers: 251, officers: 16, admins: 3 },
        recommendations: { total: 3707, crop: 2104, fertilizer: 1603 },
        assistant: { sessions: 523, messages: 1702 },
        audits: { total_feedback: 320, flagged: 64, resolved: 32, pending: 32 },
        system_health: {
          ml_crop_model: "active (ExtraTreesClassifier)",
          ml_fertilizer_model: "active (MultiOutputRegressor)",
          rag_vector_db: "active (ChromaDB)",
          llm_primary: "groq/openai/gpt-oss-120b",
        },
        recent_activity: [],
      },
    });

    render(
      <BrowserRouter>
        <AdminDashboardPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/মৃত্তিকা এআই কোর এক্সিকিউটিভ ড্যাশবোর্ড/i)).toBeInTheDocument();
      expect(screen.getByText(/নিবন্ধিত ব্যবহারকারী/i)).toBeInTheDocument();
      expect(screen.getByText(/ExtraTreesClassifier/i)).toBeInTheDocument();
    });
  });
});
