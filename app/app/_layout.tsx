import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';

import { AuthProvider } from '@/context/auth-context';
import { useAuth } from '@/hooks/use-auth';
import { Colors } from '@/constants/theme';

function RootLayoutNav() {
  const { isLoggedIn, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(tabs)';
    const inOnboarding = segments[0] === 'onboarding';
    const inLogin = segments[0] === 'login';
    const inRegister = segments[0] === 'register';

    if (!isLoggedIn && inAuthGroup) {
      router.replace('/onboarding');
    } else if (isLoggedIn && (inOnboarding || inLogin || inRegister)) {
      router.replace('/(tabs)');
    }
  }, [isLoggedIn, isLoading, segments]);

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
          headerTitleStyle: { fontWeight: '700', fontSize: 18 },
          contentStyle: { backgroundColor: Colors.gray50 },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen
          name="cattle/create"
          options={{ title: 'Register Cattle', headerBackTitle: 'Back' }}
        />
        <Stack.Screen name="cattle/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="light" backgroundColor={Colors.primary} />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
