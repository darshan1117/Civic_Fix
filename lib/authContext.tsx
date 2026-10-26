'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserRole, Profile, Notification } from './types';
import { DEMO_PROFILES } from './dataStore';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  department_id?: string | null;
  phone?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, role?: UserRole) => Promise<boolean>;
  logout: () => Promise<void>;
  switchUser: (userId: string) => void;
  demoUsers: (Profile & { email: string })[];
  unreadCount: number;
  refreshNotifications: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Sync session cookie and localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('civicfix_user');
      if (stored) {
        const parsed = JSON.parse(stored) as AuthUser;
        setUser(parsed);
        // Ensure cookie matches
        document.cookie = `civicfix_session=${encodeURIComponent(
          JSON.stringify(parsed)
        )}; path=/; max-age=604800; SameSite=Lax`;
      } else {
        // Default to citizen-1 for immediate smooth interaction
        const defaultUser = DEMO_PROFILES[4]; // Vikram Mehta
        const authData: AuthUser = {
          id: defaultUser.id,
          email: defaultUser.email,
          role: defaultUser.role,
          full_name: defaultUser.full_name,
          phone: defaultUser.phone,
        };
        setUser(authData);
        localStorage.setItem('civicfix_user', JSON.stringify(authData));
        document.cookie = `civicfix_session=${encodeURIComponent(
          JSON.stringify(authData)
        )}; path=/; max-age=604800; SameSite=Lax`;
      }
    } catch {
      // Ignore storage errors
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch unread notifications
  const refreshNotifications = async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await fetch(`/api/notifications?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        const unread = data.filter((n: Notification) => !n.read).length;
        setUnreadCount(unread);
      }
    } catch {
      // Quiet fail
    }
  };

  useEffect(() => {
    refreshNotifications();
    const interval = setInterval(refreshNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const login = async (email: string, role?: UserRole): Promise<boolean> => {
    const found = DEMO_PROFILES.find((p) => p.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      // Allow dynamic citizen registration
      const newCitizen: AuthUser = {
        id: `user-${Date.now()}`,
        email,
        role: role || 'citizen',
        full_name: email.split('@')[0],
      };
      setUser(newCitizen);
      localStorage.setItem('civicfix_user', JSON.stringify(newCitizen));
      document.cookie = `civicfix_session=${encodeURIComponent(
        JSON.stringify(newCitizen)
      )}; path=/; max-age=604800; SameSite=Lax`;
      return true;
    }

    const authData: AuthUser = {
      id: found.id,
      email: found.email,
      role: found.role,
      full_name: found.full_name,
      department_id: found.department_id,
      phone: found.phone,
    };
    setUser(authData);
    localStorage.setItem('civicfix_user', JSON.stringify(authData));
    document.cookie = `civicfix_session=${encodeURIComponent(
      JSON.stringify(authData)
    )}; path=/; max-age=604800; SameSite=Lax`;
    return true;
  };

  const switchUser = (userId: string) => {
    const found = DEMO_PROFILES.find((p) => p.id === userId);
    if (found) {
      const authData: AuthUser = {
        id: found.id,
        email: found.email,
        role: found.role,
        full_name: found.full_name,
        department_id: found.department_id,
        phone: found.phone,
      };
      setUser(authData);
      localStorage.setItem('civicfix_user', JSON.stringify(authData));
      document.cookie = `civicfix_session=${encodeURIComponent(
        JSON.stringify(authData)
      )}; path=/; max-age=604800; SameSite=Lax`;
      window.location.reload();
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('civicfix_user');
    document.cookie = 'civicfix_session=; path=/; max-age=0';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        switchUser,
        demoUsers: DEMO_PROFILES,
        unreadCount,
        refreshNotifications,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
