import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { UnifiedFlowProvider } from "./context/UnifiedFlowContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PortalLayout } from "./layouts/PortalLayout";

// Public Pages & Components
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
import { AboutModelInfoPage } from "./pages/AboutModelInfoPage";

// 1. Farmer Portal Pages
import { FarmerDashboardPage } from "./pages/farmer/FarmerDashboardPage";

// 2. Extension Officer Portal Pages
import { OfficerDashboardPage } from "./pages/officer/OfficerDashboardPage";
import { OfficerReviewPage } from "./pages/officer/OfficerReviewPage";
import { OfficerAnalyticsPage } from "./pages/officer/OfficerAnalyticsPage";

// 3. System Admin Portal Pages
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminUserManagementPage } from "./pages/admin/AdminUserManagementPage";
import { AdminOfficerVerificationPage } from "./pages/admin/AdminOfficerVerificationPage";
import { AdminKnowledgeBasePage } from "./pages/admin/AdminKnowledgeBasePage";
import { AdminCacheManagementPage } from "./pages/admin/AdminCacheManagementPage";
import { AdminModelRegistryPage } from "./pages/admin/AdminModelRegistryPage";
import { AdminActivityLogsPage } from "./pages/admin/AdminActivityLogsPage";

import apiClient from "./services/api";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Public Layout with dynamic padding and footer handling for chat workspace
const PublicLayout: React.FC = () => {
  const location = useLocation();
  const isAssistant = location.pathname.startsWith("/assistant");

  return (
    <div className="flex flex-col min-h-screen bg-agro-clean relative selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar />
      <main
        className={
          isAssistant
            ? "flex-1 w-full mx-auto px-2 sm:px-4 py-2 sm:py-3 flex flex-col min-h-0"
            : "flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
        }
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/crop" element={<CropRecommendPage />} />
          <Route path="/fertilizer" element={<FertilizerPlanPage />} />
          <Route path="/assistant" element={<AssistantChatPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/about" element={<AboutModelInfoPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isAssistant && <Footer />}
    </div>
  );
};

export const App: React.FC = () => {
  React.useEffect(() => {
    // Proactively ping backend to wake up cloud instance from cold start (Render spin-down)
    apiClient.get("/health/").catch(() => {});
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UnifiedFlowProvider>
          <BrowserRouter>
            <Routes>
              {/* ========================================================= */}
              {/* 1. FARMER PORTAL ROUTES (/farmer/*)                       */}
              {/* ========================================================= */}
              <Route
                path="/farmer/overview"
                element={
                  <ProtectedRoute allowedRoles={["FARMER", "ADMIN"]}>
                    <PortalLayout portalRole="FARMER">
                      <FarmerDashboardPage />
                    </PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/farmer/crop-recommend"
                element={
                  <ProtectedRoute allowedRoles={["FARMER", "ADMIN"]}>
                    <PortalLayout portalRole="FARMER">
                      <CropRecommendPage />
                    </PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/farmer/fertilizer-plan"
                element={
                  <ProtectedRoute allowedRoles={["FARMER", "ADMIN"]}>
                    <PortalLayout portalRole="FARMER">
                      <FertilizerPlanPage />
                    </PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/farmer/assistant"
                element={
                  <ProtectedRoute allowedRoles={["FARMER", "ADMIN"]}>
                    <PortalLayout portalRole="FARMER">
                      <AssistantChatPage />
                    </PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/farmer/history"
                element={
                  <ProtectedRoute allowedRoles={["FARMER", "ADMIN"]}>
                    <PortalLayout portalRole="FARMER">
                      <HistoryPage />
                    </PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/farmer/profile"
                element={
                  <ProtectedRoute allowedRoles={["FARMER", "ADMIN"]}>
                    <PortalLayout portalRole="FARMER">
                      <ProfilePage />
                    </PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route path="/farmer" element={<Navigate to="/farmer/overview" replace />} />

              {/* ========================================================= */}
              {/* 2. EXTENSION OFFICER PORTAL ROUTES (/officer/*)            */}
              {/* ========================================================= */}
              <Route
                path="/officer/overview"
                element={
                  <ProtectedRoute allowedRoles={["OFFICER", "ADMIN"]}>
                    <PortalLayout portalRole="OFFICER">
                      <OfficerDashboardPage />
                    </PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/officer/review"
                element={
                  <ProtectedRoute allowedRoles={["OFFICER", "ADMIN"]}>
                    <PortalLayout portalRole="OFFICER">
                      <OfficerReviewPage />
                    </PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/officer/analytics"
                element={
                  <ProtectedRoute allowedRoles={["OFFICER", "ADMIN"]}>
                    <PortalLayout portalRole="OFFICER">
                      <OfficerAnalyticsPage />
                    </PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/officer/profile"
                element={
                  <ProtectedRoute allowedRoles={["OFFICER", "ADMIN"]}>
                    <PortalLayout portalRole="OFFICER">
                      <ProfilePage />
                    </PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route path="/officer" element={<Navigate to="/officer/overview" replace />} />

              {/* ========================================================= */}
              {/* 3. SYSTEM ADMIN PORTAL ROUTES (/admin-portal/*)           */}
              {/* ========================================================= */}
              <Route
                path="/admin-portal/overview"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <PortalLayout portalRole="ADMIN">
                      <AdminDashboardPage />
                    </PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-portal/users"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <PortalLayout portalRole="ADMIN">
                      <AdminUserManagementPage />
                    </PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-portal/officers"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <PortalLayout portalRole="ADMIN">
                      <AdminOfficerVerificationPage />
                    </PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-portal/knowledge"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <PortalLayout portalRole="ADMIN">
                      <AdminKnowledgeBasePage />
                    </PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-portal/cache"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <PortalLayout portalRole="ADMIN">
                      <AdminCacheManagementPage />
                    </PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-portal/models"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <PortalLayout portalRole="ADMIN">
                      <AdminModelRegistryPage />
                    </PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-portal/activity-logs"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <PortalLayout portalRole="ADMIN">
                      <AdminActivityLogsPage />
                    </PortalLayout>
                  </ProtectedRoute>
                }
              />
              <Route path="/admin-portal" element={<Navigate to="/admin-portal/overview" replace />} />

              {/* ========================================================= */}
              {/* 4. PUBLIC & GUEST ROUTES (Standard App Layout)            */}
              {/* ========================================================= */}
              <Route path="/*" element={<PublicLayout />} />
            </Routes>
          </BrowserRouter>
        </UnifiedFlowProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
