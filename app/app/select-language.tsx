import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { StatusBar } from 'expo-status-bar';
import { LANGUAGES, changeLanguage, type LangCode } from '@/i18n';

export default function SelectLanguageScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<LangCode>('en');

  const handleContinue = async () => {
    await changeLanguage(selected);
    router.replace('/onboarding');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.hero}>
        <View style={styles.logoContainer}>
          <Ionicons name="leaf" size={52} color={Colors.white} />
        </View>
        <Text style={styles.appName}>CattleCare</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Choose your language</Text>
        <Text style={styles.titleHi}>अपनी भाषा चुनें</Text>

        <View style={styles.options}>
          {LANGUAGES.map((lang) => {
            const isSelected = selected === lang.code;
            return (
              <TouchableOpacity
                key={lang.code}
                style={[styles.option, isSelected && styles.optionSelected]}
                onPress={() => setSelected(lang.code as LangCode)}
                activeOpacity={0.8}
              >
                <View style={styles.optionLeft}>
                  <Text style={[styles.optionNative, isSelected && styles.optionTextSelected]}>
                    {lang.native}
                  </Text>
                  {lang.code !== lang.native.toLowerCase() && (
                    <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                      {lang.label}
                    </Text>
                  )}
                </View>
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.continueText}>Continue / जारी रखें</Text>
          <Ionicons name="arrow-forward" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 32,
    gap: 16,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.gray800,
    textAlign: 'center',
  },
  titleHi: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.gray400,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 32,
  },
  options: {
    gap: 12,
    marginBottom: 32,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.gray100,
    backgroundColor: Colors.gray50,
  },
  optionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight + '33',
  },
  optionLeft: {
    gap: 2,
  },
  optionNative: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.gray800,
  },
  optionTextSelected: {
    color: Colors.primary,
  },
  optionLabel: {
    fontSize: 14,
    color: Colors.gray400,
    fontWeight: '500',
  },
  optionLabelSelected: {
    color: Colors.primary,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: Colors.primary,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  continueButton: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  continueText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
});
