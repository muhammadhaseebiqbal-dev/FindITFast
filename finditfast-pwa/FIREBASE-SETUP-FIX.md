# Firebase Setup Instructions

## ⚠️ Authentication Not Enabled

Your Firebase project needs Authentication to be enabled. Here's how to fix it:

## 🔧 Quick Fix Steps

### 1. Enable Authentication
1. Go to [Firebase Console](https://console.firebase.google.com/project/finditfastapp)
2. Click on **Authentication** in the left sidebar
3. Click **Get started** to enable Authentication
4. Go to **Sign-in method** tab
5. Enable **Email/Password** authentication
6. Save changes

### 2. Get Correct Configuration
1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click on your web app or **Add app** if none exists
4. Copy the **actual** configuration values
5. Replace the values in your `.env` file

### 3. Update .env File
Your current API key might be invalid. Replace with correct values from Firebase Console:

```
VITE_FIREBASE_API_KEY=your-actual-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=finditfastapp.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=finditfastapp
VITE_FIREBASE_STORAGE_BUCKET=finditfastapp.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-actual-sender-id
VITE_FIREBASE_APP_ID=your-actual-app-id
```

## 🚀 After Setup

Once Authentication is enabled:

1. **Test the fix:**
   ```powershell
   npm run test:populate
   ```

2. **Start the app:**
   ```powershell
   npm run dev
   ```

3. **Login with test accounts:**
   - owner1@test.com / TestPassword123!
   - owner2@test.com / TestPassword123!

## 🔍 Current Issues Fixed

- ✅ Firestore indexes deployed (queries will work)
- ✅ Firestore rules deployed (permissions set)
- ⚠️ Authentication needs to be enabled (manual step required)

## 📋 Troubleshooting

If you still get errors after enabling Authentication:
1. Double-check the API key in Firebase Console
2. Make sure Email/Password sign-in is enabled
3. Verify the project ID matches "finditfastapp"
4. Clear browser cache and restart the dev server

**Next Step:** Visit the Firebase Console link above and enable Authentication!
