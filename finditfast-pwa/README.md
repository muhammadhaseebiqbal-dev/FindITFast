# FindItFast PWA

A Progressive Web Application that helps users quickly locate items within physical stores using interactive floorplans.

## Features

- 🔍 Search for items across multiple stores
- 🗺️ Interactive store floorplans with item locations
- 📱 Mobile-first PWA design
- 🏪 Store owner portal for managing layouts and items
- 📍 GPS integration for store navigation
- ⚡ Offline functionality with service worker caching

## Technology Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore, Storage, Auth, Analytics)
- **PWA**: Vite PWA Plugin with Workbox

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── services/      # Firebase and API services
├── utilities/     # Helper functions
├── types/         # TypeScript type definitions
└── assets/        # Static assets
```

## Setup Instructions

1. **Clone and install dependencies**:
   ```bash
   cd finditfast-pwa
   npm install
   ```

2. **Configure Firebase**:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Firestore, Storage, Authentication, and Analytics
   - Copy `.env.example` to `.env` and fill in your Firebase config values

3. **Development**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## Firebase Configuration

The app requires the following Firebase services:
- **Firestore**: For storing store, item, and user data
- **Storage**: For storing floorplan and item images
- **Authentication**: For store owner accounts
- **Analytics**: For usage tracking

## PWA Features

- Installable on mobile devices
- Offline functionality for cached content
- Service worker for background updates
- Optimized for mobile performance

## Environment Variables

Create a `.env` file with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Development Guidelines

- Follow mobile-first responsive design principles
- Use TypeScript for type safety
- Implement proper error handling and loading states
- Optimize images and assets for mobile performance
- Test PWA functionality across different browsers

## Test Report (2025-08-14)

This section captures the latest automated test run using Vitest.

### Summary

- Runner: Vitest 2.1.9 (jsdom environment)
- Test Files: 30 total — 19 passed, 11 failed
- Tests: 214 total — 194 passed, 20 failed
- Duration: ~35.6s

### Failing Areas

- Hooks
   - `src/tests/hooks/usePermissions.test.tsx` — 5 failing tests due to an invalid hook call (React `useMemo` null/invalid hook usage). Likely missing proper React provider/wrapper in tests or renderer mismatch.

- Auth Service
   - `src/tests/services/authService.test.ts` — 14 failing tests. Several functions are not found on `AuthService` (e.g., `isValidEmail`, `isValidPhone`, `isValidPassword`, `formatAuthError`, `registerOwner`, `signInOwner`, `signOutOwner`). Verify the service exports match test expectations.

- Store Request Service
   - `src/tests/services/storeRequestService.test.ts` — 1 failing test in `createStoreRequest` flow. Mock error indicates missing `serverTimestamp` export on the `firebase/firestore` mock. Update the partial mock to include `serverTimestamp` (or refactor tests).

- Suites that errored during setup (0 tests executed but suite failed):
   - `src/tests/contexts/AuthContext.test.tsx`
   - `src/tests/components/auth/OwnerAuth.test.tsx`
   - `src/tests/components/auth/OwnerOnly.test.tsx`
   - `src/tests/components/auth/ProtectedRoute.test.tsx`
   - `src/tests/components/auth/UserOnly.test.tsx`
   - `src/tests/components/owner/FloorplanUpload.test.tsx`
   - `src/tests/components/owner/ItemManager.test.tsx`
   - `src/tests/components/user/UserActions.test.tsx`

   These suites hit a runtime error from React DOM (`Cannot read properties of undefined (reading 'indexOf')`). This typically points to an environment setup issue or a missing wrapper/provider in the test harness.

### Notable Passes

- Integration permissions: `src/tests/integration/permissionSystem.test.ts` — passed
- Reporting system integration: `src/tests/integration/reportingSystem.test.ts` — passed (logs show expected error handling)
- Services: `permissionService`, `storageService`, `searchService`, `itemVerificationService`, `mapsService` — all passed

### How to Run Tests Locally

```powershell
# From the repository root
cd finditfast-pwa
npm test

# Optional: watch mode and UI
npm run test:watch
npm run test:ui
```

If you use coverage with Vitest, you can enable it by adding a `coverage` block in `vitest.config.ts` and running with coverage flags.

### Immediate Fix Suggestions

- Ensure `src/tests/setup.ts` wraps React component tests with the required providers (e.g., AuthContext, Router) or add per-suite wrappers.
- Align `AuthService` exported API with test expectations or update tests to the current API. Confirm `src/services/authService.ts` exports the validation and auth methods used in tests.
- Update Firestore mocks in tests to include `serverTimestamp` (partial mock using `importOriginal`), or adjust `storeRequestService` to inject timestamps for easier testing.

After addressing the above, rerun `npm test` to generate an updated report and replace this section with the new results.