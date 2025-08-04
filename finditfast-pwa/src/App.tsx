import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import PWAStatus from './components/PWAStatus';
import { SearchPage } from './pages/SearchPage';
import { StoreDetailsPage } from './pages/StoreDetailsPage';
import { FloorplanPage } from './pages/FloorplanPage';
import { StoreRequestPage } from './pages/StoreRequestPage';
import { OwnerAuthPage } from './pages/OwnerAuthPage';
import { OwnerDashboard } from './pages/OwnerDashboard';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth';
import { registerServiceWorker } from './utils/pwaUtils';

function App() {
  useEffect(() => {
    // Register service worker for PWA functionality
    registerServiceWorker();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<SearchPage />} />
          <Route path="/store/:storeId" element={<StoreDetailsPage />} />
          <Route path="/store/:storeId/floorplan" element={<FloorplanPage />} />
          <Route path="/request-store" element={<StoreRequestPage />} />
          
          {/* Owner authentication */}
          <Route path="/owner/auth" element={<OwnerAuthPage />} />
          
          {/* Protected owner routes */}
          <Route 
            path="/owner/dashboard" 
            element={
              <ProtectedRoute requireOwner={true}>
                <OwnerDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
        
        {/* PWA Components */}
        <PWAInstallPrompt />
        <PWAStatus />
      </Router>
    </AuthProvider>
  );
}

export default App;
