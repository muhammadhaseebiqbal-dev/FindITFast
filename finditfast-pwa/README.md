# FindItFast PWA

A Progressive Web Application that helps users quickly locate items within physical stores using interactive floorplans.

## 🌐 Live Application

**The app is deployed and ready to use at:** https://finditfastapp.firebaseapp.com

## Features

- 🔍 Search for items across multiple stores
- 🗺️ Interactive store floorplans with item locations
- 📱 Mobile-first PWA design with offline capabilities
- 🏪 Store owner portal for managing layouts and items
- �‍💼 Admin dashboard for store approval and management
- �📍 GPS integration for store navigation
- ⚡ Offline functionality with service worker caching
- 📊 Real-time inventory and reporting system

## 📱 PWA Installation Guide

### Desktop (Chrome/Edge)
1. Open https://finditfastapp.firebaseapp.com in Chrome or Edge
2. Look for the **install icon** (⬇️ or +) in the address bar (right side)
3. Click the install icon and select **"Install FindItFast"**
4. The app will be installed and appear in your Start Menu/Applications
5. You can now launch it like any desktop app

### Mobile (Android/iPhone)
1. Open https://finditfastapp.firebaseapp.com in Chrome (Android) or Safari (iPhone)
2. **Android**: Tap the menu (⋮) → **"Add to Home screen"** → **"Install"**
3. **iPhone**: Tap the share button (□↗) → **"Add to Home Screen"** → **"Add"**
4. The app icon will appear on your home screen
5. Tap to launch - it works like a native app with offline capabilities

### Features When Installed
- ✅ Works offline (cached content)
- ✅ Push notifications for store updates
- ✅ Full-screen experience (no browser UI)
- ✅ Faster loading and better performance
- ✅ App-like navigation and feel

## 👥 User Types & Access Levels

### 1. **Admin** (System Administrator)
- **Access**: Full system control
- **Features**: 
  - Approve/reject store requests
  - Manage store owners
  - System analytics and reporting
  - Content moderation
  - User management

### 2. **Store Owner** (Business Owner)
- **Access**: Own store management
- **Features**:
  - Submit store registration requests
  - Upload and manage store floorplans
  - Add/edit inventory items with locations
  - View store analytics
  - Manage store information

### 3. **Customer** (End User)
- **Access**: Search and browse
- **Features**:
  - Search for items across stores
  - View interactive store maps
  - Get directions to stores
  - Browse store inventories
  - Report item location issues


## 🔥 Admin User Flow (Step-by-Step)

### Getting Admin Access
1. Visit https://finditfastapp.firebaseapp.com
2. Click **"Sign In"** in the top navigation
3. Use admin credentials (provided separately for security)
4. You'll be redirected to the **Admin Dashboard**

### Managing Store Requests
1. From the Admin Dashboard, click **"Store Requests"** in the sidebar
2. You'll see a list of pending store registration requests
3. **To approve a request**:
   - Click **"View Details"** on any pending request
   - Review store information (name, address, owner details)
   - Click **"Approve Store"** button
   - Confirm approval in the popup dialog
   - The store owner will receive notification and can now access their store portal

4. **To reject a request**:
   - Click **"View Details"** on the request
   - Click **"Reject"** button
   - Provide a rejection reason in the text field
   - Click **"Confirm Rejection"**
   - The owner will be notified with the reason

### Managing Store Owners
1. Click **"Store Owners"** in the admin sidebar
2. View all registered store owners and their stores
3. **To suspend a store owner**:
   - Find the owner in the list
   - Click **"Actions"** dropdown → **"Suspend"**
   - Confirm suspension (this disables their store access)

4. **To view store details**:
   - Click **"View Store"** next to any owner
   - See store floorplan, inventory, and analytics

### System Analytics
1. Click **"Analytics"** in the admin sidebar
2. View system-wide statistics:
   - Total stores, users, searches
   - Most searched items
   - Store performance metrics
3. Use date filters to view specific time periods
4. Export reports using the **"Export Data"** button

## 🏪 Store Owner Flow (Step-by-Step)

### Step 1: Create Account & Submit Store Request
1. Visit https://finditfastapp.firebaseapp.com
2. Click **"Become a Store Owner"** on the homepage
3. Click **"Sign Up"** to create your account
4. Fill out the registration form:
   - Full Name
   - Email Address
   - Phone Number
   - Create Password (minimum 6 characters)
5. Click **"Create Account"**
6. You'll be redirected to **"Submit Store Request"** page
7. Fill out store details:
   - Store Name
   - Store Address (use the address autocomplete)
   - Business Phone
   - Store Description
   - Business License Number (if required)
8. Click **"Submit Request"**
9. You'll see a confirmation message: **"Store request submitted successfully!"**
10. Wait for admin approval (you'll receive an email notification)

### Step 2: Access Store Portal (After Approval)
1. Check your email for approval notification
2. Sign in at https://finditfastapp.firebaseapp.com
3. Click **"Sign In"** → Enter your credentials
4. You'll now see the **Store Owner Dashboard**
5. Your approved store will be listed

### Step 3: Upload Store Floorplan
1. From Store Owner Dashboard, click **"Manage Store"** on your store
2. Click **"Floorplan"** in the store management sidebar
3. Click **"Upload Floorplan"** button
4. **Choose your floorplan image**:
   - Supported formats: PNG, JPG, JPEG
   - Recommended size: 1200x800 pixels minimum
   - File size limit: 5MB
5. Click **"Browse"** and select your floorplan file
6. You'll see a preview of the uploaded image
7. Click **"Save Floorplan"**
8. Success message: **"Floorplan uploaded successfully!"**

### Step 4: Add Inventory Items
1. From store management, click **"Inventory"** in the sidebar
2. Click **"Add New Item"** button
3. Fill out item details:
   - **Item Name**: e.g., "Organic Bananas"
   - **Category**: Select from dropdown (Food, Electronics, Clothing, etc.)
   - **Description**: Brief description of the item
   - **Price**: Item price (optional)
   - **Stock Quantity**: Number in stock
   - **Upload Item Image**: Click "Browse" and select item photo
4. Click **"Save Item"** 
5. You'll see the item added to your inventory list

### Step 5: Place Items on Floorplan
1. From inventory list, click **"Place on Map"** for any item
2. The floorplan will open in editing mode
3. **To place the item**:
   - Click anywhere on the floorplan where the item is located
   - A pin will appear with the item name
   - Drag the pin to adjust position if needed
4. Click **"Save Location"**
5. The item now shows **"Mapped"** status in your inventory
6. Repeat for all items

### Step 6: Manage Store Settings
1. Click **"Store Settings"** in the sidebar
2. Update store information:
   - Store hours
   - Contact information  
   - Store description
3. Click **"Save Changes"**

## 🛍️ Customer User Flow (Step-by-Step)

### Basic Search
1. Visit https://finditfastapp.firebaseapp.com
2. Use the search bar on the homepage
3. Type what you're looking for: e.g., "bananas", "iPhone charger"
4. Press **Enter** or click the search icon (🔍)
5. You'll see search results showing:
   - Items found
   - Which stores have them
   - Distance from your location (if location is enabled)

### View Store and Item Location
1. From search results, click **"View in Store"** for any item
2. The store page opens showing:
   - Store information
   - Interactive floorplan with item locations
3. **To find the item**:
   - The item you searched for is highlighted with a red pin
   - Click on the pin to see item details
   - Use zoom controls (+/-) to get a better view
4. Click **"Get Directions"** to navigate to the store

### Browse Stores
1. From the homepage, click **"Browse Stores"**
2. You'll see all available stores with:
   - Store names and addresses
   - Distance from you
   - Store ratings
3. Click on any store to view their inventory and floorplan

### Enable Location Services
1. When prompted, click **"Allow"** for location access
2. This enables:
   - Distance calculations to stores
   - Better search results based on proximity
   - Navigation features

### Advanced Search Filters
1. On the search page, click **"Filters"**
2. Set preferences:
   - **Distance**: How far you're willing to travel
   - **Category**: Food, Electronics, Clothing, etc.
   - **Price Range**: Min and max price
   - **Store Type**: Chain stores, local businesses
3. Click **"Apply Filters"**
4. Results update based on your preferences

### Report Issues
1. If an item location is incorrect, click the **"Report Issue"** button on the item pin
2. Select issue type:
   - Item not found at this location
   - Item out of stock
   - Wrong item information
3. Add optional comments
4. Click **"Submit Report"**
5. Store owners receive notifications to fix the issue

## 🚀 Development & Deployment

### Source Code
- **GitHub Repository**: https://github.com/muhammadhaseebiqbal-dev/finditfast
- **Live Application**: https://finditfastapp.firebaseapp.com

### Technology Stack
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS  
- **Backend**: Firebase (Firestore, Storage, Auth, Analytics)
- **PWA**: Vite PWA Plugin with Workbox
- **Hosting**: Firebase Hosting

### Project Structure
```
src/
├── components/     # Reusable UI components
├── pages/         # Page components  
├── services/      # Firebase and API services
├── utilities/     # Helper functions
├── types/         # TypeScript type definitions
└── assets/        # Static assets
```

### Firebase Configuration
The app is configured with the following Firebase services:

```env
# Firebase Configuration - Updated from Firebase Console
VITE_FIREBASE_API_KEY=AIzaSyCsIptYZldF6V4MQI0bMm_bK64doLW1Mmk
VITE_FIREBASE_AUTH_DOMAIN=finditfastapp.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=finditfastapp
VITE_FIREBASE_STORAGE_BUCKET=finditfastapp.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=120028303360
VITE_FIREBASE_APP_ID=1:120028303360:web:446a06f68b93c7cd2c88e5

# Google Maps API Configuration
VITE_GOOGLE_MAPS_API_KEY=AIzaSyCsIptYZldF6V4MQI0bMm_bK64doLW1Mmk
```

### Google Maps API Setup
The app uses Google Maps API for geocoding (converting addresses to coordinates). The same Firebase API key is used for Google Maps services.

**To enable geocoding:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the **Geocoding API** for your project
3. The API key is already configured in the environment variables

**Features using Google Maps:**
- ✅ Address validation when creating store requests
- ✅ Converting store addresses to map coordinates
- ✅ Generating directions links for customers
- ✅ Location-based search functionality

### Local Development Setup
1. **Clone the repository**:
   ```bash
   git clone https://github.com/muhammadhaseebiqbal-dev/finditfast.git
   cd finditfast/finditfast-pwa
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   - Copy `.env.example` to `.env`
   - Update with your Firebase configuration values

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Access the app**:
   - Open http://localhost:5173 in your browser

### Building for Production
```bash
# Build the application
npm run build

# Preview the production build locally
npm run preview
```

### Firebase Deployment Commands

#### Initial Setup (One-time)
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project directory
firebase init

# Select:
# - Hosting: Configure files for Firebase Hosting
# - Choose existing project: finditfastapp
# - Public directory: dist
# - Single-page app: Yes
# - Overwrite index.html: No
```

#### Deploy to Firebase Hosting
```bash
# Build the application for production
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Deploy with custom message
firebase deploy --only hosting -m "Deploy version 2.1.0"
```

#### Advanced Deployment Options
```bash
# Preview deployment before going live
firebase hosting:channel:deploy preview

# Deploy to a specific channel
firebase hosting:channel:deploy feature-branch

# Deploy only specific Firebase services
firebase deploy --only hosting,firestore,storage

# View deployment history
firebase hosting:channel:list
```

#### Environment-Specific Deployments
```bash
# Deploy to staging environment
firebase use staging
firebase deploy --only hosting

# Deploy to production environment  
firebase use production
firebase deploy --only hosting
```

#### Post-Deployment Verification
```bash
# Check hosting status
firebase hosting:sites:list

# View live site
firebase open hosting:site
```

### Deployment Checklist
- [ ] Run `npm run build` successfully
- [ ] Test the production build with `npm run preview`
- [ ] Ensure all environment variables are set correctly
- [ ] Run `firebase deploy --only hosting`
- [ ] Verify the deployment at https://finditfastapp.firebaseapp.com
- [ ] Test PWA installation on mobile devices
- [ ] Check all user flows (admin, store owner, customer)

### Rollback Instructions
If you need to rollback a deployment:
```bash
# List recent deployments
firebase hosting:releases:list

# Rollback to a specific release
firebase hosting:rollback
```

### Monitoring & Analytics
- **Firebase Console**: https://console.firebase.google.com/project/finditfastapp
- **Analytics**: Real-time user activity and app performance
- **Crashlytics**: Error reporting and crash analysis
- **Performance**: Page load times and user experience metrics

## 📝 Development Guidelines

- Follow mobile-first responsive design principles
- Use TypeScript for type safety
- Implement proper error handling and loading states
- Optimize images and assets for mobile performance
- Test PWA functionality across different browsers
- Run tests with `npm test` before deploying

## 🔧 Troubleshooting

### Current Production Issues (August 2025)

#### 🚨 Active Issues
The app is currently experiencing the following known issues:

1. **Firebase Permission Errors**: 
   ```
   Error getting storeRequests: FirebaseError: Missing or insufficient permissions
   Search error: FirebaseError: Missing or insufficient permissions
   ```

2. **JavaScript Reference Error**:
   ```
   Uncaught ReferenceError: setStoresLoading is not defined
   ```

#### 🔧 Immediate Fixes Needed

1. **Update Firestore Rules**: The current rules have conflicts between public access and authentication requirements. Update `firestore.rules`:

   ```javascript
   // Allow public read access to store requests for search functionality
   match /storeRequests/{requestId} {
     allow read: if true;  // Allow all users to read for search
     allow create: if isAuthenticated() && 
                   request.resource.data.requestedBy == request.auth.uid;
     allow update: if isAdmin() || (isAuthenticated() && 
                   resource.data.requestedBy == request.auth.uid);
     allow delete: if isAdmin();
   }
   ```

2. **Fix Missing State Variables**: Add missing React state in components:
   ```typescript
   const [storesLoading, setStoresLoading] = useState(false);
   ```

3. **Deploy Firestore Rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

### Common Issues and Solutions

#### Firebase Permission Errors
If you see errors like "Missing or insufficient permissions":

1. **Check Firestore Rules**:
   ```bash
   # View current rules
   firebase firestore:rules:get
   
   # Deploy updated rules
   firebase deploy --only firestore:rules
   ```

2. **Verify Authentication State**:
   - Ensure users are properly signed in before accessing protected data
   - Check if authentication tokens have expired
   - Verify user roles and permissions in your auth context

3. **Update Firestore Security Rules** (in `firestore.rules`):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Allow public read access to stores for search
       match /stores/{storeId} {
         allow read: if true;
         allow write: if isStoreOwner(storeId) || isAdmin();
       }
       
       // Store requests - public read for search, authenticated write
       match /storeRequests/{requestId} {
         allow read: if true;  // Public read for search functionality
         allow create: if isAuthenticated();
         allow update, delete: if isAdmin() || isOwner(requestId);
       }
       
       // User profiles
       match /users/{userId} {
         allow read, write: if isOwner(userId) || isAdmin();
       }
       
       // Helper functions
       function isAuthenticated() {
         return request.auth != null;
       }
       
       function isAdmin() {
         return isAuthenticated() && 
                get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
       }
       
       function isStoreOwner(storeId) {
         return isAuthenticated() && 
                get(/databases/$(database)/documents/stores/$(storeId)).data.ownerId == request.auth.uid;
       }
       
       function isOwner(resourceId) {
         return isAuthenticated() && request.auth.uid == resourceId;
       }
     }
   }
   ```

#### JavaScript Reference Errors
If you see "setStoresLoading is not defined":

1. **Check Component State Management**:
   - Verify all useState hooks are properly defined
   - Ensure loading states are initialized correctly
   - Check for typos in variable names

2. **Fix Missing State Variables**:
   ```typescript
   // Make sure you have this in your component
   const [storesLoading, setStoresLoading] = useState(false);
   ```

3. **Rebuild and Redeploy**:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

#### Authentication Issues

1. **Clear Browser Cache**:
   - Clear cookies and local storage
   - Hard refresh (Ctrl+F5 or Cmd+Shift+R)

2. **Check Firebase Auth Configuration**:
   ```bash
   # Verify auth settings in Firebase Console
   # Authentication > Settings > Authorized domains
   ```

3. **Re-authenticate Users**:
   - Sign out and sign back in
   - Check if email verification is required

#### Performance Issues

1. **Enable Firestore Offline Persistence**:
   ```typescript
   // In your Firebase initialization
   import { enableNetwork, disableNetwork } from 'firebase/firestore';
   ```

2. **Optimize Bundle Size**:
   ```bash
   # Analyze bundle
   npm run build
   npx vite-bundle-analyzer dist
   ```

#### PWA Installation Problems

1. **Check Service Worker**:
   - Open Developer Tools > Application > Service Workers
   - Verify service worker is active and running

2. **Clear PWA Cache**:
   - Uninstall and reinstall the PWA
   - Clear application data in browser

### Getting Help

If issues persist:

1. **Check Firebase Console Logs**:
   - Visit https://console.firebase.google.com/project/finditfastapp
   - Go to Firestore > Usage tab for detailed error logs

2. **Enable Debug Mode**:
   ```bash
   # Add to your .env file
   VITE_DEBUG_MODE=true
   ```

3. **Contact Support**:
   - Create an issue on GitHub: https://github.com/muhammadhaseebiqbal-dev/finditfast/issues
   - Include error messages, browser console logs, and steps to reproduce