import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User } from '@/types';
import * as authService from '@/services/auth';

// TODO: Replace in-memory state with AsyncStorage when @react-native-async-storage/async-storage is installed
// import AsyncStorage from '@react-native-async-storage/async-storage';
// const TOKEN_KEY = '@cattlecare_token';
// const USER_KEY = '@cattlecare_user';

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  // Start true so auth guard waits until initialization is complete
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: restore session from AsyncStorage here
    // For now, just mark init as done after one tick
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await authService.login(email, password);
      setUser(result.user);
      setToken(result.token);
      // TODO: persist to AsyncStorage
      // await AsyncStorage.setItem(TOKEN_KEY, result.token);
      // await AsyncStorage.setItem(USER_KEY, JSON.stringify(result.user));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      const result = await authService.register(email, password, fullName);
      setUser(result.user);
      setToken(result.token);
      // TODO: persist to AsyncStorage
      // await AsyncStorage.setItem(TOKEN_KEY, result.token);
      // await AsyncStorage.setItem(USER_KEY, JSON.stringify(result.user));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    // TODO: clear AsyncStorage
    // AsyncStorage.removeItem(TOKEN_KEY);
    // AsyncStorage.removeItem(USER_KEY);
  }, []);

  const updateUser = useCallback(
    async (data: Partial<User>) => {
      if (!user) return;
      const updated = await authService.updateProfile(user.id, data);
      setUser(updated);
      // TODO: update AsyncStorage
      // await AsyncStorage.setItem(USER_KEY, JSON.stringify(updated));
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn: !!token,
        isLoading,
        login,
        register,
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
