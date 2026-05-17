import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import '@/i18n';

import { AuthProvider } from '@/context/auth-context';
import { useAuth } from '@/hooks/use-auth';
import { Colors } from '@/constants/theme';
import { loadSavedLanguage } from '@/i18n';

function RootLayoutNav() {
  const { isLoggedIn, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [langChecked, setLangChecked] = useState(false);
  const [hasLang, setHasLang] = useState(false);

  useEffect(() => {
    loadSavedLanguage().then((found) => {
      setHasLang(found);
      setLangChecked(true);
    });
  }, []);

  useEffect(() => {
    if (isLoading || !langChecked) return;

    const inAuthGroup = segments[0] === '(tabs)';
    const inPublicScreen = ['onboarding', 'login', 'register', 'otp', 'onboard-name', 'select-language'].includes(segments[0] ?? '');

    if (!isLoggedIn && inAuthGroup) {
      router.replace(hasLang ? '/onboarding' : '/select-language');
    } else if (isLoggedIn && inPublicScreen && segments[0] !== 'onboard-name') {
      router.replace('/(tabs)');
    } else if (!isLoggedIn && !inPublicScreen) {
      router.replace(hasLang ? '/onboarding' : '/select-language');
    }
  }, [isLoggedIn, isLoading, segments, langChecked, hasLang]);

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
        <Stack.Screen name="select-language" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="otp" options={{ headerShown: false }} />
        <Stack.Screen name="onboard-name" options={{ headerShown: false }} />
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
    <KeyboardProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </KeyboardProvider>
  );
}
