import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthService } from '../services/authService';
import type { User } from 'firebase/auth';
import type { StoreOwner } from '../types';

interface AuthContextType {
  user: User | null;
  ownerProfile: StoreOwner | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshOwnerProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [ownerProfile, setOwnerProfile] = useState<StoreOwner | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshOwnerProfile = async () => {
    if (user) {
      try {
        const profile = await AuthService.getCurrentOwnerProfile();
        setOwnerProfile(profile);
      } catch (error) {
        console.error('Error fetching owner profile:', error);
        setOwnerProfile(null);
      }
    } else {
      setOwnerProfile(null);
    }
  };

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChange(async (user) => {
      setUser(user);
      
      if (user) {
        await refreshOwnerProfile();
      } else {
        setOwnerProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Refresh owner profile when user changes
  useEffect(() => {
    if (user && !loading) {
      refreshOwnerProfile();
    }
  }, [user, loading]);

  const signOut = async () => {
    try {
      await AuthService.signOutOwner();
      setUser(null);
      setOwnerProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    ownerProfile,
    loading,
    signOut,
    refreshOwnerProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};