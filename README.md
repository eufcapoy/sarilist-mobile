# SariList Mobile

SariList is a cross-platform Expo app for turning store-restocking notes into an organized shopping trip. This repository contains the mobile app only.

## Technology

- React Native and Expo SDK 54
- TypeScript
- Expo Router
- Expo Go compatible
- Mock and in-memory data during the initial UI phase

## Project structure

```text
app/
  _layout.tsx          Root providers and navigation theme
  (app)/               Main application route group
    _layout.tsx        Screen stack
    index.tsx          Home
    lists.tsx          Session list history
    new-list.tsx       Manual list creation
    review-scan.tsx    Scan review and correction
    shopping.tsx       In-store shopping mode
    summary.tsx        Trip summary
components/
  navigation/          Shared navigation UI
  scan/                Scan-state and review UI
  shopping/            Shopping and quantity controls
  ui/                  Reusable design-system components
constants/             Design tokens and unit catalog
data/                  Mock data
state/                 Shared in-memory list and session-history state
types/                 Domain types
assets/                App icons and splash assets
```

Review Scan accepts camera and gallery photos, while recognition results remain mocked. It exposes empty, loading, error, and success previews. OCR, persistence, and backend services are intentionally deferred.

## Product roadmap

1. List management: rename, duplicate, and delete with themed confirmation. — Complete
2. Live user onboarding flow with cat-guided spotlights across the real app screens. — Complete (session-based until persistence)
3. Accessibility and cross-screen responsive QA.
4. Permanent storage.
5. Actual OCR integration.

## Run locally

```powershell
npm install
npx expo start --clear
```

Scan the QR code with Expo Go. Type checking and linting can be run with:

```powershell
npx tsc --noEmit
npm run lint
```
