# Mrittika AI: Three Dedicated Role-Based Portals Architecture

## 1. Overview
Mrittika AI (মৃত্তিকা এআই) provides three independent, professional application portals built on top of a shared design system while tailoring workflows, telemetry, and permissions to each authenticated role:

1. **Farmer Digital Portal (`/farmer/*`)**
2. **Extension Officer Portal (`/officer/*`)**
3. **System Admin Command Center (`/admin-portal/*`)**

Guests and unauthenticated visitors retain full public access to core advisory modules via the standard public shell (`/crop`, `/fertilizer`, `/assistant`, `/about`).

---

## 2. Shared Portal Design System (`PortalLayout.tsx`)
All three portals utilize a unified responsive application shell:
- **Collapsible Sidebar**: Fixed desktop navigation with mobile slide-over drawer, role badge indicator with pulsing status beacon, active route highlighting, and quick return links.
- **Top Navigation Bar**: Live breadcrumb navigation, language switcher (বাংলা / English toggle), user jurisdiction details, and secure logout action.
- **Visual Identity**:
  - **Farmer Workspace**: Emerald & Forest Green (`#047857`, `#065f46`)
  - **Officer Workspace**: Deep Teal & Slate Cyan (`#0f766e`, `#115e59`)
  - **Admin Command Center**: Executive Purple & Indigo (`#581c87`, `#3730a3`)

---

## 3. Portal Route & Component Hierarchy

```
frontend/src/
├── layouts/
│   └── PortalLayout.tsx                  # Shared responsive shell
├── components/
│   ├── ProtectedRoute.tsx                # Role-based route guard
│   ├── Navbar.tsx                        # Public navbar with portal quick-switch
│   └── Footer.tsx                        # Public agricultural footer
├── pages/
│   ├── farmer/
│   │   └── FarmerDashboardPage.tsx       # /farmer/overview
│   ├── officer/
│   │   ├── OfficerDashboardPage.tsx      # /officer/overview
│   │   ├── OfficerReviewPage.tsx         # /officer/review
│   │   └── OfficerAnalyticsPage.tsx      # /officer/analytics
│   └── admin/
│       ├── AdminDashboardPage.tsx        # /admin-portal/overview
│       ├── AdminUserManagementPage.tsx   # /admin-portal/users
│       ├── AdminOfficerVerificationPage.tsx # /admin-portal/officers
│       ├── AdminKnowledgeBasePage.tsx    # /admin-portal/knowledge
│       ├── AdminModelRegistryPage.tsx    # /admin-portal/models
│       └── AdminActivityLogsPage.tsx     # /admin-portal/activity-logs
```

---

## 4. Role Navigation Matrix

| Portal | URL Path | Component | Purpose |
| :--- | :--- | :--- | :--- |
| **Farmer** | `/farmer/overview` | `FarmerDashboardPage` | KPI metrics, localized weather, seasonal tips, recent history |
| **Farmer** | `/farmer/crop-recommend` | `CropRecommendPage` | Crop suitability model with 1-tap fertilizer prefill |
| **Farmer** | `/farmer/fertilizer-plan` | `FertilizerPlanPage` | Dosage calculator with stage-wise split application guide |
| **Farmer** | `/farmer/assistant` | `AssistantChatPage` | RAG Chatbot with prompt chips and audio input |
| **Farmer** | `/farmer/history` | `HistoryPage` | Paginated recommendation history with PDF export |
| **Farmer** | `/farmer/profile` | `ProfilePage` | Farm details, land unit preference, upazila/district |
| **Officer** | `/officer/overview` | `OfficerDashboardPage` | Flagged query stats, resolution progress, pending queue |
| **Officer** | `/officer/review` | `OfficerReviewPage` | Side-by-side inspection of AI responses and correction editor |
| **Officer** | `/officer/analytics` | `OfficerAnalyticsPage` | Top queried crops, regional nutrient deficiency trends |
| **Officer** | `/officer/profile` | `ProfilePage` | Official verification badge, designated jurisdiction |
| **Admin** | `/admin-portal/overview` | `AdminDashboardPage` | Executive KPI cards, model telemetry, live activity stream |
| **Admin** | `/admin-portal/users` | `AdminUserManagementPage` | User CRUD, role modification, active/inactive toggle |
| **Admin** | `/admin-portal/officers` | `AdminOfficerVerificationPage` | Officer government credential verification and approval |
| **Admin** | `/admin-portal/knowledge` | `AdminKnowledgeBasePage` | RAG PDF library, chunk telemetry, 1-click re-indexing |
| **Admin** | `/admin-portal/models` | `AdminModelRegistryPage` | ExtraTrees, XGBoost MultiOutput, ChromaDB, LLM routers |
| **Admin** | `/admin-portal/activity-logs` | `AdminActivityLogsPage` | Complete searchable audit trail of all platform events |
