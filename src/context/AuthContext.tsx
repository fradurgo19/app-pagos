import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { authService } from '../services/authService';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, location: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setProfile(null);
        setUser(null);
        return;
      }

      const userProfile = await authService.getUserProfile();
      if (userProfile) {
        setProfile(userProfile);
        setUser({ id: userProfile.id, email: userProfile.email });
      } else {
        setProfile(null);
        setUser(null);
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfile(null);
      setUser(null);
      localStorage.removeItem('auth_token');
    }
  };

  useEffect(() => {
    // Verificar si hay una sesión activa al cargar
    loadProfile().finally(() => setLoading(false));
  }, []);

  const signIn = async (email: string, password: string) => {
    const data = await authService.signIn(email, password);
    setUser(data.user);
    await loadProfile();
  };

  const signUp = async (email: string, password: string, fullName: string, location: string) => {
    const data = await authService.signUp(email, password, fullName, location);
    setUser(data.user);
    await loadProfile();
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    await loadProfile();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
