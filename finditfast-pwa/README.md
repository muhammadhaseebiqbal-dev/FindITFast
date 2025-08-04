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