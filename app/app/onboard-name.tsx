import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';

export default function OnboardNameScreen() {
  const router = useRouter();
  const { updateUser } = useAuth();

  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  function validate(): boolean {
    if (!name.trim() || name.trim().length < 2) {
      setNameError(t('onboardName.nameError'));
      return false;
    }
    setNameError('');
    return true;
  }

  async function handleContinue() {
    if (!validate()) return;
    setIsSaving(true);
    try {
      await updateUser({ fullName: name.trim() });
      router.replace('/(tabs)');
    } catch (e) {
      Alert.alert(t('common.error'), (e as Error).message ?? t('onboardName.saveError'));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Text style={styles.wave}>👋</Text>
            </View>
            <Text style={styles.title}>{t('onboardName.title')}</Text>
            <Text style={styles.subtitle}>{t('onboardName.subtitle')}</Text>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>{t('onboardName.label')}</Text>
            <View style={[styles.inputWrapper, nameError ? styles.inputError : null]}>
              <Ionicons name="person-outline" size={20} color={Colors.gray400} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={(t) => { setName(t); setNameError(''); }}
                placeholder={t('onboardName.placeholder')}
                placeholderTextColor={Colors.gray400}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={handleContinue}
                autoFocus
              />
            </View>
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
          </View>

          <TouchableOpacity
            style={[styles.continueButton, isSaving && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={isSaving}
            activeOpacity={0.85}
          >
            {isSaving ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.continueButtonText}>{t('onboardName.getStarted')}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.skipButton}>
            <Text style={styles.skipText}>{t('onboardName.skip')}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  keyboardView: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 40 },
  header: { alignItems: 'center', marginBottom: 40 },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  wave: { fontSize: 36 },
  title: { fontSize: 32, fontWeight: '800', color: Colors.gray800, marginBottom: 8 },
  subtitle: {
    fontSize: 16, color: Colors.gray600,
    textAlign: 'center', lineHeight: 24,
  },
  fieldContainer: { gap: 6, marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '600', color: Colors.gray800 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    height: 56, borderRadius: 14, borderWidth: 1.5,
    borderColor: Colors.gray200, backgroundColor: Colors.gray50,
    paddingHorizontal: 16, gap: 10,
  },
  inputError: { borderColor: Colors.danger },
  input: { flex: 1, fontSize: 18, color: Colors.gray800 },
  errorText: { fontSize: 14, color: Colors.danger },
  continueButton: {
    height: 56, borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  continueButtonText: { fontSize: 18, fontWeight: '700', color: Colors.white },
  skipButton: { alignItems: 'center', paddingVertical: 16 },
  skipText: { fontSize: 15, color: Colors.gray400 },
});
