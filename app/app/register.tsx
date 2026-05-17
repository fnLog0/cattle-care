import React, { useState } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { StatusBar } from 'expo-status-bar';

export default function RegisterScreen() {
  const router = useRouter();
  const { registerWithEmail } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): string | null {
    if (!fullName.trim() || fullName.trim().length < 2) return 'Enter your full name';
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return 'Enter a valid email';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (password !== confirm) return 'Passwords do not match';
    return null;
  }

  async function handleSubmit() {
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await registerWithEmail(email.trim().toLowerCase(), password, fullName.trim());
      router.replace('/(tabs)');
    } catch (e) {
      setError((e as Error).message ?? 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.gray800} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Account</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.heading}>Sign up 🐄</Text>
          <Text style={styles.sub}>Use your email and a password</Text>

          <Field
            label="Full Name"
            icon="person-outline"
            value={fullName}
            onChangeText={(v) => {
              setFullName(v);
              setError('');
            }}
            placeholder="e.g. Lakshmi Devi"
            autoCapitalize="words"
          />

          <Field
            label="Email"
            icon="mail-outline"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              setError('');
            }}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Field
            label="Password"
            icon="lock-closed-outline"
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              setError('');
            }}
            placeholder="At least 8 characters"
            secureTextEntry={!showPwd}
            rightSlot={
              <TouchableOpacity onPress={() => setShowPwd((p) => !p)}>
                <Ionicons
                  name={showPwd ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={Colors.gray400}
                />
              </TouchableOpacity>
            }
          />

          <Field
            label="Confirm Password"
            icon="lock-open-outline"
            value={confirm}
            onChangeText={(v) => {
              setConfirm(v);
              setError('');
            }}
            placeholder="Re-enter password"
            secureTextEntry={!showPwd}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.submit, isSubmitting && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.submitText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/login')} style={styles.altLink}>
            <Text style={styles.altText}>
              Already have an account? <Text style={styles.altLinkText}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  icon,
  rightSlot,
  ...rest
}: React.ComponentProps<typeof TextInput> & {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  rightSlot?: React.ReactNode;
}) {
  return (
    <View style={fieldStyles.wrap}>
      <Text style={fieldStyles.label}>{label}</Text>
      <View style={fieldStyles.inputWrap}>
        <Ionicons name={icon} size={18} color={Colors.gray400} />
        <TextInput
          style={fieldStyles.input}
          placeholderTextColor={Colors.gray400}
          {...rest}
        />
        {rightSlot}
      </View>
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.gray800 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    backgroundColor: Colors.gray50,
    paddingHorizontal: 14,
    gap: 10,
  },
  input: { flex: 1, fontSize: 16, color: Colors.gray800 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray800 },
  form: { padding: 24, paddingBottom: 40, gap: 16 },
  heading: { fontSize: 28, fontWeight: '800', color: Colors.gray800 },
  sub: { fontSize: 15, color: Colors.gray600, marginBottom: 8 },
  errorText: { fontSize: 13, color: Colors.danger },
  submit: {
    height: 56,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { fontSize: 17, fontWeight: '700', color: Colors.white },
  altLink: { alignItems: 'center', paddingVertical: 12 },
  altText: { fontSize: 14, color: Colors.gray600 },
  altLinkText: { color: Colors.primary, fontWeight: '700' },
});
