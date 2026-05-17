import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';

const OTP_LENGTH = 4;
const RESEND_SECONDS = 30;

export default function OtpScreen() {
  const router = useRouter();
  const { phone, otp: prefilledOtp } = useLocalSearchParams<{ phone: string; otp?: string }>();
  const { sendOtp, verifyOtp } = useAuth();
  const { t } = useTranslation();

  const [digits, setDigits] = useState(['', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const refs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  useEffect(() => {
    if (prefilledOtp && prefilledOtp.length === OTP_LENGTH) {
      setDigits(prefilledOtp.split(''));
    } else {
      refs[0]?.current?.focus();
    }
  }, [prefilledOtp]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  function handleDigit(value: string, index: number) {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < OTP_LENGTH - 1) {
      refs[index + 1]?.current?.focus();
    }
  }

  function handleBackspace(index: number) {
    if (digits[index] === '' && index > 0) {
      const next = [...digits];
      next[index - 1] = '';
      setDigits(next);
      refs[index - 1]?.current?.focus();
    }
  }

  const handleVerify = useCallback(async () => {
    const otp = digits.join('');
    if (otp.length < OTP_LENGTH) {
      Alert.alert(t('otp.enterAlert'), t('otp.enterAlertMsg'));
      return;
    }
    setIsVerifying(true);
    try {
      const { isNewUser } = await verifyOtp(phone, otp);
      if (isNewUser) {
        router.replace('/onboard-name');
      } else {
        router.replace('/(tabs)');
      }
    } catch (e) {
      Alert.alert(t('otp.invalidOtp'), (e as Error).message ?? t('otp.invalidOtpMsg'));
      setDigits(['', '', '', '']);
      refs[0]?.current?.focus();
    } finally {
      setIsVerifying(false);
    }
  }, [digits, phone, verifyOtp, router]);

  // Auto-verify when all 4 digits entered
  useEffect(() => {
    if (digits.every((d) => d !== '')) {
      handleVerify();
    }
  }, [digits]);

  async function handleResend() {
    setIsResending(true);
    try {
      await sendOtp(phone);
      setCountdown(RESEND_SECONDS);
      setDigits(['', '', '', '']);
      refs[0]?.current?.focus();
    } catch (e) {
      Alert.alert(t('otp.failed'), (e as Error).message ?? t('otp.resendFailed'));
    } finally {
      setIsResending(false);
    }
  }

  const otp = digits.join('');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={Colors.gray800} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="chatbubble-ellipses-outline" size={32} color={Colors.primary} />
          </View>
          <Text style={styles.title}>{t('otp.title')}</Text>
          <Text style={styles.subtitle}>
            {t('otp.sentTo')} <Text style={styles.phone}>+91 {phone}</Text>
          </Text>
        </View>

        {/* OTP Boxes */}
        <View style={styles.boxRow}>
          {digits.map((digit, i) => (
            <TextInput
              key={i}
              ref={refs[i]}
              style={[styles.box, digit ? styles.boxFilled : null]}
              value={digit}
              onChangeText={(v) => handleDigit(v, i)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace') handleBackspace(i);
              }}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Verify */}
        <TouchableOpacity
          style={[styles.verifyButton, (isVerifying || otp.length < OTP_LENGTH) && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={isVerifying || otp.length < OTP_LENGTH}
          activeOpacity={0.85}
        >
          {isVerifying ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.verifyButtonText}>{t('otp.verify')}</Text>
          )}
        </TouchableOpacity>

        {/* Resend */}
        <View style={styles.resendRow}>
          <Text style={styles.resendLabel}>{t('otp.didntGet')}</Text>
          {countdown > 0 ? (
            <Text style={styles.countdown}>{t('otp.resendIn', { count: countdown })}</Text>
          ) : (
            <TouchableOpacity onPress={handleResend} disabled={isResending}>
              {isResending ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Text style={styles.resendLink}>{t('otp.resend')}</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  backButton: {
    width: 48, height: 48,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 8, marginLeft: 16,
  },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  header: { alignItems: 'center', marginBottom: 40 },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  title: { fontSize: 28, fontWeight: '800', color: Colors.gray800, marginBottom: 8 },
  subtitle: { fontSize: 16, color: Colors.gray600, textAlign: 'center' },
  phone: { fontWeight: '700', color: Colors.gray800 },
  boxRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 32 },
  box: {
    width: 64, height: 72,
    borderRadius: 16, borderWidth: 2,
    borderColor: Colors.gray200,
    fontSize: 28, fontWeight: '700',
    color: Colors.gray800, textAlign: 'center',
    backgroundColor: Colors.gray50,
  },
  boxFilled: { borderColor: Colors.primary, backgroundColor: Colors.white },
  verifyButton: {
    height: 56, borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  verifyButtonText: { fontSize: 18, fontWeight: '700', color: Colors.white },
  resendRow: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', marginTop: 24,
  },
  resendLabel: { fontSize: 15, color: Colors.gray600 },
  countdown: { fontSize: 15, color: Colors.gray400, fontWeight: '600' },
  resendLink: { fontSize: 15, color: Colors.primary, fontWeight: '700' },
});
