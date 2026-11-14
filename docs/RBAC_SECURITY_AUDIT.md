# Role-Based Access Control (RBAC) & Security Audit

## 1. Authentication Architecture
- **Protocol**: JSON Web Token (JWT) using `djangorestframework-simplejwt`.
- **Access Tokens**: Short-lived (15 minutes), kept in client memory (not persisted in `localStorage` to mitigate XSS attacks).
- **Refresh Tokens**: Long-lived (7 days), persisted in secure `httpOnly`, `SameSite=Lax` cookies with strict rotation and blacklisting on each refresh.
- **Password Hashing**: Dual Argon2 / PBKDF2 hashing with salt to prevent dictionary and rainbow table attacks.

---

## 2. Authorization Tiers & Roles
Mrittika AI enforces three discrete authenticated roles alongside guest access:

1. **`FARMER`**:
   - Access to `/farmer/*` workspace.
   - May create crop recommendations and fertilizer calculations.
   - May interact with the agricultural chatbot assistant.
   - **Strict IDOR Protection**: May only view, modify, or download their own recommendation histories and chat sessions (`filter(user=request.user)`).
2. **`OFFICER` (Upazila Extension Officer)**:
   - Access to `/officer/*` workspace.
   - Requires `is_verified=True` to submit official agronomic corrections.
   - May inspect flagged chatbot interactions and submit authoritative guidance notes.
   - Access to regional crop and soil analytics.
3. **`ADMIN` (System Administrator)**:
   - Access to `/admin-portal/*` executive command center.
   - Full user management (role assignments, active/inactive toggles).
   - Approval authority for Extension Officers.
   - Knowledge Base document ingestion and vector re-indexing triggers.
   - System telemetry and activity log auditing.

---

## 3. Server-Side Permission Classes (`apps.accounts.permissions`)
- `IsFarmer`: Verifies `request.user.role in [Role.FARMER, Role.ADMIN]` or `is_staff`.
- `IsVerifiedOfficer`: Verifies `request.user.role == Role.OFFICER and request.user.is_verified` or `Role.ADMIN`.
- `IsAdminRole`: Verifies `request.user.role == Role.ADMIN` or `request.user.is_superuser`.

---

## 4. Client-Side Route Protection (`ProtectedRoute.tsx`)
Any direct navigation to an unauthorized route triggers an immediate redirect:
- Unauthenticated requests are directed to `/login` with previous location saved in state.
- Authenticated users attempting to cross portal boundaries (e.g., a Farmer attempting to access `/admin-portal/overview`) are safely redirected to their own appropriate dashboard.
