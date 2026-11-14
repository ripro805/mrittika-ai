import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { UnifiedFlowProvider } from "./context/UnifiedFlowContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";

import { LandingPage } from "./pages/LandingPage";
import { CropRecommendPage } from "./pages/CropRecommendPage";
import { FertilizerPlanPage } from "./pages/FertilizerPlanPage";
import { AssistantChatPage } from "./pages/AssistantChatPage";
import { HistoryPage } from "./pages/HistoryPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ProfilePage } from "./pages/ProfilePage";
import { OfficerDashboardPage } from "./pages/OfficerDashboardPage";
import { AboutModelInfoPage } from "./pages/AboutModelInfoPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UnifiedFlowProvider>
          <BrowserRouter>
            <div className="flex flex-col min-h-screen bg-gray-50">
              <Navbar />
              <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/crop" element={<CropRecommendPage />} />
                  <Route path="/fertilizer" element={<FertilizerPlanPage />} />
                  <Route path="/assistant" element={<AssistantChatPage />} />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/officer" element={<OfficerDashboardPage />} />
                  <Route path="/about" element={<AboutModelInfoPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </UnifiedFlowProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
