import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const DEMO_PERSONAS = [
  { name: 'Aarav Sharma (Admin)', email: 'admin@civicfix.org', role: 'admin', desc: 'Chief Municipal Commissioner' },
  { name: 'Priya Nair (Roads Officer)', email: 'roads.officer@civicfix.org', role: 'officer', desc: 'Roads & Infrastructure' },
  { name: 'Rajesh Kumar (Sanitation Officer)', email: 'sanitation.officer@civicfix.org', role: 'officer', desc: 'Solid Waste & Sanitation' },
  { name: 'Kavita Reddy (Lighting Officer)', email: 'electricity.officer@civicfix.org', role: 'officer', desc: 'Power & Streetlighting' },
  { name: 'Vikram Mehta (Citizen)', email: 'citizen1@civicfix.org', role: 'citizen', desc: 'Active Reporter' },
  { name: 'Ananya Iyer (Citizen)', email: 'citizen2@civicfix.org', role: 'citizen', desc: 'Active Reporter' },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Initialize or upgrade session with a real signed JWT from backend
  useEffect(() => {
    const initializeAuth = async () => {
      const savedUserStr = localStorage.getItem('civicfix_user');
      const token = localStorage.getItem('civicfix_token');

      let currentUser = null;
      if (savedUserStr) {
        try {
          currentUser = JSON.parse(savedUserStr);
          setUser(currentUser);
        } catch {
          localStorage.removeItem('civicfix_user');
        }
      }

      // If token is missing or a legacy mock string, fetch a real signed JWT from backend
      if (!token || token.startsWith('demo_') || !currentUser?._id) {
        try {
          const targetEmail = currentUser?.email || 'citizen1@civicfix.org';
          const res = await api.post('/auth/demo-login', { email: targetEmail });
          if (res.data?.token) {
            setUser(res.data);
            localStorage.setItem('civicfix_user', JSON.stringify(res.data));
            localStorage.setItem('civicfix_token', res.data.token);
          }
        } catch (err) {
          console.warn('[Auth] Auto-login fallback notice:', err.message);
        }
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const userId = user._id || user.id || '';
      const res = await api.get(`/notifications?userId=${userId}`);
      setNotifications(res.data || []);
      const unread = (res.data || []).filter((n) => !n.read).length;
      setUnreadCount(unread);
    } catch {
      // quiet
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 20000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const login = async (email, password = 'Password123!') => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const userData = res.data;
      setUser(userData);
      localStorage.setItem('civicfix_token', userData.token);
      localStorage.setItem('civicfix_user', JSON.stringify(userData));
      return { success: true };
    } catch (err) {
      // Fallback: request signed demo token from backend
      try {
        const demoRes = await api.post('/auth/demo-login', { email });
        if (demoRes.data?.token) {
          setUser(demoRes.data);
          localStorage.setItem('civicfix_token', demoRes.data.token);
          localStorage.setItem('civicfix_user', JSON.stringify(demoRes.data));
          return { success: true };
        }
      } catch {}

      return {
        success: false,
        error: err.response?.data?.error || 'Invalid email or password',
      };
    }
  };

  const register = async (name, email, password, phone) => {
    try {
      const res = await api.post('/auth/register', { name, email, password, phone });
      const userData = res.data;
      setUser(userData);
      localStorage.setItem('civicfix_token', userData.token);
      localStorage.setItem('civicfix_user', JSON.stringify(userData));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || 'Registration failed',
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('civicfix_user');
    localStorage.removeItem('civicfix_token');
  };

  // 1-Click Evaluation persona switcher: fetches authentic JWT from backend
  const switchDemoUser = async (email) => {
    try {
      const res = await api.post('/auth/demo-login', { email });
      if (res.data?.token) {
        setUser(res.data);
        localStorage.setItem('civicfix_user', JSON.stringify(res.data));
        localStorage.setItem('civicfix_token', res.data.token);
        return res.data;
      }
    } catch (err) {
      console.error('Demo login failed:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        switchDemoUser,
        demoPersonas: DEMO_PERSONAS,
        notifications,
        unreadCount,
        refreshNotifications: fetchNotifications,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
