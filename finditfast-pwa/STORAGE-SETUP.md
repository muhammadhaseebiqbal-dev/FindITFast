# Firebase Storage Setup Instructions

## Setting up Firebase Storage

1. Go to the Firebase Console: https://console.firebase.google.com/project/finditfastapp/storage

2. Click "Get Started" to initialize Firebase Storage

3. Choose your location (should match your Firestore location)

4. Once Storage is set up, apply the CORS configuration by running:
   ```bash
   gsutil cors set cors.json gs://finditfastapp.appspot.com
   ```

5. If you don't have gsutil installed, you can:
   - Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install
   - Or apply CORS through the Firebase Console

## Alternative Solution

If you continue to have CORS issues, you can temporarily disable the floorplan upload feature by:

1. Commenting out the floorplan upload functionality
2. Using a placeholder image URL for testing
3. Setting up a server-side proxy for uploads

## Storage Rules

The storage rules are already configured in `storage.rules` and will be automatically deployed once Storage is set up.

## Testing

After setup, test the floorplan upload feature to ensure CORS is working correctly.
