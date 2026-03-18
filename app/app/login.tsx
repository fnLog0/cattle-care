import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { sendOtp, googleLogin } = useAuth();

  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '',
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.params['id_token'];
      if (idToken) handleGoogleToken(idToken);
    } else if (response?.type === 'error') {
      setIsGoogleLoading(false);
      Alert.alert(t('login.googleFailed'), response.error?.message ?? 'Please try again.');
    } else if (response?.type === 'dismiss') {
      setIsGoogleLoading(false);
    }
  }, [response]);

  async function handleGoogleToken(idToken: string) {
    try {
      const { isNewUser } = await googleLogin(idToken);
      if (isNewUser) {
        router.replace('/onboard-name');
      } else {
        router.replace('/(tabs)');
      }
    } catch (e) {
      Alert.alert('Sign-In Failed', (e as Error).message ?? 'Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  }

  function validate(): boolean {
    if (!phone.trim()) {
      setPhoneError(t('login.phoneRequired'));
      return false;
    }
    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      setPhoneError(t('login.phoneInvalid'));
      return false;
    }
    setPhoneError('');
    return true;
  }

  async function handleSendOtp() {
    if (!validate()) return;
    setIsSending(true);
    try {
      await sendOtp(phone.trim());
      router.push({ pathname: '/otp', params: { phone: phone.trim() } });
    } catch (e) {
      Alert.alert(t('login.sendFailed'), (e as Error).message ?? 'Please try again.');
    } finally {
      setIsSending(false);
    }
  }

  function handleGooglePress() {
    setIsGoogleLoading(true);
    promptAsync();
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.gray800} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.logo}>
              <Ionicons name="leaf" size={32} color={Colors.white} />
            </View>
            <Text style={styles.title}>{t('login.title')}</Text>
            <Text style={styles.subtitle}>{t('login.subtitle')}</Text>
          </View>

          {/* Google */}
          <TouchableOpacity
            style={[styles.googleButton, (!request || isGoogleLoading) && styles.buttonDisabled]}
            onPress={handleGooglePress}
            disabled={!request || isGoogleLoading}
            activeOpacity={0.85}
          >
            {isGoogleLoading ? (
              <ActivityIndicator color={Colors.gray800} />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color={Colors.gray800} />
                <Text style={styles.googleButtonText}>{t('login.continueGoogle')}</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('login.orPhone')}</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Phone */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>{t('login.phoneLabel')}</Text>
            <View style={[styles.inputWrapper, phoneError ? styles.inputError : null]}>
              <Text style={styles.prefix}>🇮🇳 +91</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={(t) => { setPhone(t.replace(/\D/g, '').slice(0, 10)); setPhoneError(''); }}
                placeholder={t('login.phonePlaceholder')}
                placeholderTextColor={Colors.gray400}
                keyboardType="number-pad"
                maxLength={10}
                returnKeyType="done"
                onSubmitEditing={handleSendOtp}
              />
            </View>
            {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
          </View>

          <TouchableOpacity
            style={[styles.sendButton, isSending && styles.buttonDisabled]}
            onPress={handleSendOtp}
            disabled={isSending}
            activeOpacity={0.85}
          >
            {isSending ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.sendButtonText}>{t('login.sendOtp')}</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.note}>{t('login.note')}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  backButton: {
    width: 48, height: 48,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 8, marginLeft: -8,
  },
  header: { alignItems: 'center', marginTop: 16, marginBottom: 32 },
  logo: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  title: { fontSize: 28, fontWeight: '800', color: Colors.gray800, marginBottom: 8 },
  subtitle: { fontSize: 16, color: Colors.gray600, textAlign: 'center' },
  googleButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 56, borderRadius: 14, borderWidth: 1.5,
    borderColor: Colors.gray200, gap: 10, backgroundColor: Colors.white,
  },
  googleButtonText: { fontSize: 16, fontWeight: '600', color: Colors.gray800 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24, gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.gray200 },
  dividerText: { fontSize: 14, color: Colors.gray400 },
  fieldContainer: { gap: 6 },
  label: { fontSize: 16, fontWeight: '600', color: Colors.gray800 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    height: 56, borderRadius: 14, borderWidth: 1.5,
    borderColor: Colors.gray200, backgroundColor: Colors.gray50,
    paddingHorizontal: 16, gap: 10,
  },
  inputError: { borderColor: Colors.danger },
  prefix: { fontSize: 16, color: Colors.gray800, fontWeight: '500' },
  input: { flex: 1, fontSize: 18, color: Colors.gray800, letterSpacing: 1 },
  errorText: { fontSize: 14, color: Colors.danger },
  sendButton: {
    height: 56, borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center', marginTop: 20,
  },
  buttonDisabled: { opacity: 0.6 },
  sendButtonText: { fontSize: 18, fontWeight: '700', color: Colors.white },
  note: {
    fontSize: 13, color: Colors.gray400,
    textAlign: 'center', marginTop: 16, lineHeight: 18,
  },
});
