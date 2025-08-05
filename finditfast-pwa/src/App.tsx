import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import PWAStatus from './components/PWAStatus';
import LoadingScreen from './components/LoadingScreen';
import { SearchPage } from './pages/SearchPage';
import { InventoryPage } from './pages/InventoryPage';
import { StoreDetailsPage } from './pages/StoreDetailsPage';
import { FloorplanPage } from './pages/FloorplanPage';
import { StoreRequestPage } from './pages/StoreRequestPage';
import { OwnerAuthPage } from './pages/OwnerAuthPage';
import { OwnerDashboard } from './pages/OwnerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminAuthPage } from './pages/AdminAuthPage';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth';
import { registerServiceWorker } from './utils/pwaUtils';
import { BundleAnalyzer, CacheOptimizer } from './utilities/performanceUtils';
import { optimizedSearchService } from './services/optimizedSearchService';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize app
    const initializeApp = async () => {
      // Register service worker for PWA functionality
      await registerServiceWorker();

      // Initialize performance monitoring in development
      if (process.env.NODE_ENV === 'development') {
        BundleAnalyzer.logBundleInfo();
        BundleAnalyzer.monitorResources();
      }

      // Preload popular searches for better performance
      await optimizedSearchService.preloadPopularSearches();

      // Clear old caches periodically
      CacheOptimizer.clearOldCaches().catch(console.warn);

      // Simulate minimum loading time for better UX
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsLoading(false);
    };

    initializeApp();

    // Performance cleanup on app unmount
    return () => {
      if (process.env.NODE_ENV === 'development') {
        optimizedSearchService.clearCache();
      }
    };
  }, []);

  // Show loading screen while initializing
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<SearchPage />} />
          <Route path="/inventory/:itemId/:storeId" element={<InventoryPage />} />
          <Route path="/store/:storeId" element={<StoreDetailsPage />} />
          <Route path="/store/:storeId/floorplan" element={<FloorplanPage />} />
          <Route path="/request-store" element={<StoreRequestPage />} />
          
          {/* Owner authentication */}
          <Route path="/owner/auth" element={<OwnerAuthPage />} />
          
          {/* Admin authentication */}
          <Route path="/admin/auth" element={<AdminAuthPage />} />
          
          {/* Protected owner routes */}
          <Route 
            path="/owner/dashboard" 
            element={
              <ProtectedRoute requireOwner={true}>
                <OwnerDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowAdmin={true}>
                <AdminDashboard />
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
