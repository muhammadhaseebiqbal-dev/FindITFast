import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OwnerAuth } from '../components/auth/OwnerAuth';
import { AuthService, type AuthError } from '../services/authService';

export const OwnerAuthPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChange((user) => {
      setLoading(false);
      
      // Redirect to dashboard if user is authenticated
      if (user) {
        navigate('/owner/dashboard');
      }
    });

    return unsubscribe;
  }, [navigate]);

  const handleAuthSuccess = () => {
    console.log('Authentication successful!');
    // Navigation will be handled by the useEffect above
  };

  const handleAuthError = (error: AuthError) => {
    console.error('Authentication error:', error);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, they will be redirected by useEffect
  // Only show auth form for unauthenticated users
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <OwnerAuth
        onAuthSuccess={handleAuthSuccess}
        onAuthError={handleAuthError}
      />
    </div>
  );
};