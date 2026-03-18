import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';

const { height } = Dimensions.get('window');

export default function OnboardingScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.statusBarSeparator} />
      <View style={styles.heroSection}>
        <View style={styles.logoContainer}>
          <Ionicons name="leaf" size={64} color={Colors.white} />
        </View>
        <Text style={styles.appName}>CattleCare</Text>
        <Text style={styles.tagline}>{t('onboarding.tagline')}</Text>
        <Text style={styles.subTagline}>{t('onboarding.subTagline')}</Text>
      </View>

      <View style={styles.featuresSection}>
        <FeatureRow icon="pulse" label={t('onboarding.feature1')} />
        <FeatureRow icon="shield-checkmark" label={t('onboarding.feature2')} />
        <FeatureRow icon="notifications" label={t('onboarding.feature3')} />
      </View>

      <View style={styles.buttonsSection}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/login')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>{t('onboarding.signIn')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/register')}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryButtonText}>{t('onboarding.createAccount')}</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>{t('onboarding.disclaimer')}</Text>
      </View>
    </SafeAreaView>
  );
}

function FeatureRow({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon as any} size={20} color={Colors.primary} />
      </View>
      <Text style={styles.featureText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  statusBarSeparator: { height: 1, backgroundColor: 'rgba(255,255,255,0.25)' },
  heroSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  logoContainer: {
    width: 112,
    height: 112,
    borderRadius: 32,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  appName: {
    fontSize: 40,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -1,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primaryLight,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 12,
  },
  subTagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresSection: {
    paddingHorizontal: 32,
    paddingVertical: 24,
    gap: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: '500',
  },
  buttonsSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: Colors.white,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  secondaryButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  disclaimer: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 8,
  },
});
