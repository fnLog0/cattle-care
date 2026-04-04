import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';
import * as authService from '@/services/auth';
import { setStoredToken, clearStoredToken } from '@/services/api-client';

const TOKEN_KEY = '@cattlecare_token';
const USER_KEY = '@cattlecare_user';

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<{ isNewUser: boolean }>;
  googleLogin: (idToken: string) => Promise<{ isNewUser: boolean }>;
  logout: () => Promise<void>;
  updateUser: (data: { fullName?: string; image?: string }) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY),
        ]);
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser) as User);
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    }
    restoreSession();
  }, []);

  async function persistSession(u: User, t: string) {
    await Promise.all([
      AsyncStorage.setItem(TOKEN_KEY, t),
      AsyncStorage.setItem(USER_KEY, JSON.stringify(u)),
      setStoredToken(t),
    ]);
    setUser(u);
    setToken(t);
  }

  const sendOtp = useCallback(async (phone: string) => {
    await authService.sendOtp(phone);
  }, []);

  const verifyOtp = useCallback(async (phone: string, otp: string) => {
    const result = await authService.verifyOtp(phone, otp);
    await persistSession(result.user, result.token);
    return { isNewUser: result.isNewUser };
  }, []);

  const googleLogin = useCallback(async (idToken: string) => {
    const result = await authService.googleLogin(idToken);
    await persistSession(result.user, result.token);
    return { isNewUser: result.isNewUser };
  }, []);

  const logout = useCallback(async () => {
    // Invalidate session on backend (best-effort — don't block local logout)
    try { await authService.logout(); } catch {}
    await Promise.all([
      AsyncStorage.removeItem(TOKEN_KEY),
      AsyncStorage.removeItem(USER_KEY),
      clearStoredToken(),
    ]);
    setUser(null);
    setToken(null);
  }, []);

  const updateUser = useCallback(
    async (data: { fullName?: string; image?: string }) => {
      const updated = await authService.updateProfile(data);
      setUser(updated);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updated));
    },
    [],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn: !!token,
        isLoading,
        sendOtp,
        verifyOtp,
        googleLogin,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
