import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { MenuRow } from '@/components/menu-row';
import { StatusBar } from 'expo-status-bar';

type BottomSheetType = 'editProfile' | 'changePassword' | 'language' | null;

function Divider() {
  return <View style={styles.divider} />;
}

function SectionLabel({ label }: { label: string }) {
  return <Text style={styles.sectionLabel}>{label}</Text>;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout, updateUser } = useAuth();
  const [activeSheet, setActiveSheet] = useState<BottomSheetType>(null);

  function handleLogout() {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/onboarding');
        },
      },
    ]);
  }

  function handleHelp() {
    Alert.alert('Help & Support', 'For support, email: support@cattlecare.in\n\nVersion 1.0.0');
  }

  function handleContact() {
    Alert.alert('Contact Us', 'Email: hello@cattlecare.in\nPhone: +91 98765 43210');
  }

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.statusBarSeparator} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.fullName ?? 'Farmer'}</Text>
            <Text style={styles.profileEmail}>{user?.email ?? ''}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: user?.status === 'active' ? Colors.primary + '15' : Colors.gray100 },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: user?.status === 'active' ? Colors.primary : Colors.gray400 },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: user?.status === 'active' ? Colors.primary : Colors.gray400 },
                ]}
              >
                {user?.status === 'active' ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={() => setActiveSheet('editProfile')}
          >
            <Ionicons name="pencil" size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <SectionLabel label="ACCOUNT" />
        <View style={styles.menuGroup}>
          <MenuRow
            icon="person-outline"
            iconColor={Colors.primary}
            label="Edit Profile"
            onPress={() => setActiveSheet('editProfile')}
          />
          <Divider />
          <MenuRow
            icon="lock-closed-outline"
            iconColor={Colors.info}
            label="Change Password"
            onPress={() => setActiveSheet('changePassword')}
          />
          <Divider />
          <MenuRow
            icon="language-outline"
            iconColor={Colors.warning}
            label="Language"
            value="English"
            onPress={() => setActiveSheet('language')}
          />
        </View>

        {/* Support Section */}
        <SectionLabel label="SUPPORT" />
        <View style={styles.menuGroup}>
          <MenuRow
            icon="help-circle-outline"
            iconColor={Colors.gray600}
            label="Help & FAQ"
            onPress={handleHelp}
          />
          <Divider />
          <MenuRow
            icon="chatbubble-ellipses-outline"
            iconColor={Colors.gray600}
            label="Contact Us"
            onPress={handleContact}
          />
          <Divider />
          <MenuRow
            icon="information-circle-outline"
            iconColor={Colors.gray600}
            label="About CattleCare"
            value="v1.0.0"
            onPress={() =>
              Alert.alert('About CattleCare', 'CattleCare v1.0.0\nBuilt with love for Indian farmers.\n\n© 2026 CattleCare AI')
            }
          />
        </View>

        {/* Danger Zone */}
        <SectionLabel label="ACCOUNT ACTIONS" />
        <View style={styles.menuGroup}>
          <MenuRow
            icon="log-out-outline"
            iconColor={Colors.danger}
            label="Log Out"
            onPress={handleLogout}
            destructive
            showChevron={false}
          />
        </View>

        <Text style={styles.versionNote}>CattleCare AI · Version 1.0.0</Text>
      </ScrollView>

      {/* Bottom Sheets */}
      <EditProfileSheet
        visible={activeSheet === 'editProfile'}
        onClose={() => setActiveSheet(null)}
        currentName={user?.fullName ?? ''}
        onSave={async (name) => {
          await updateUser({ fullName: name });
          setActiveSheet(null);
        }}
      />

      <ChangePasswordSheet
        visible={activeSheet === 'changePassword'}
        onClose={() => setActiveSheet(null)}
      />

      <LanguageSheet
        visible={activeSheet === 'language'}
        onClose={() => setActiveSheet(null)}
      />
    </SafeAreaView>
  );
}

// ─── Edit Profile Sheet ───────────────────────────────────────────────────────

function EditProfileSheet({
  visible,
  onClose,
  currentName,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  currentName: string;
  onSave: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState(currentName);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (visible) setName(currentName);
  }, [visible, currentName]);

  async function handleSave() {
    if (!name.trim()) { setError('Name is required'); return; }
    if (name.trim().length < 2) { setError('Name must be at least 2 characters'); return; }
    setIsSaving(true);
    try {
      await onSave(name.trim());
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <BottomSheetModal visible={visible} onClose={onClose} title="Edit Profile">
      <View style={sheetStyles.content}>
        <Text style={sheetStyles.label}>Full Name</Text>
        <View style={[sheetStyles.inputWrapper, error ? sheetStyles.inputError : null]}>
          <Ionicons name="person-outline" size={18} color={Colors.gray400} />
          <TextInput
            style={sheetStyles.input}
            value={name}
            onChangeText={(t) => { setName(t); setError(''); }}
            placeholder="Your full name"
            placeholderTextColor={Colors.gray400}
            autoCapitalize="words"
          />
        </View>
        {error ? <Text style={sheetStyles.errorText}>{error}</Text> : null}
        <TouchableOpacity
          style={[sheetStyles.saveButton, isSaving && sheetStyles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={sheetStyles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </BottomSheetModal>
  );
}

// ─── Change Password Sheet ────────────────────────────────────────────────────

function ChangePasswordSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  function handleSave() {
    if (!current) { setError('Current password is required'); return; }
    if (!newPass || newPass.length < 6) { setError('New password must be at least 6 characters'); return; }
    if (newPass !== confirm) { setError('Passwords do not match'); return; }
    Alert.alert('Success', 'Password changed successfully.', [
      { text: 'OK', onPress: () => { setCurrent(''); setNewPass(''); setConfirm(''); setError(''); onClose(); } },
    ]);
  }

  return (
    <BottomSheetModal visible={visible} onClose={onClose} title="Change Password">
      <View style={sheetStyles.content}>
        <Text style={sheetStyles.label}>Current Password</Text>
        <View style={sheetStyles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={18} color={Colors.gray400} />
          <TextInput
            style={sheetStyles.input}
            value={current}
            onChangeText={(t) => { setCurrent(t); setError(''); }}
            placeholder="Enter current password"
            placeholderTextColor={Colors.gray400}
            secureTextEntry
          />
        </View>
        <Text style={sheetStyles.label}>New Password</Text>
        <View style={sheetStyles.inputWrapper}>
          <Ionicons name="lock-open-outline" size={18} color={Colors.gray400} />
          <TextInput
            style={sheetStyles.input}
            value={newPass}
            onChangeText={(t) => { setNewPass(t); setError(''); }}
            placeholder="Min. 6 characters"
            placeholderTextColor={Colors.gray400}
            secureTextEntry
          />
        </View>
        <Text style={sheetStyles.label}>Confirm New Password</Text>
        <View style={sheetStyles.inputWrapper}>
          <Ionicons name="lock-open-outline" size={18} color={Colors.gray400} />
          <TextInput
            style={sheetStyles.input}
            value={confirm}
            onChangeText={(t) => { setConfirm(t); setError(''); }}
            placeholder="Re-enter new password"
            placeholderTextColor={Colors.gray400}
            secureTextEntry
          />
        </View>
        {error ? <Text style={sheetStyles.errorText}>{error}</Text> : null}
        <TouchableOpacity style={sheetStyles.saveButton} onPress={handleSave}>
          <Text style={sheetStyles.saveButtonText}>Update Password</Text>
        </TouchableOpacity>
      </View>
    </BottomSheetModal>
  );
}

// ─── Language Sheet ───────────────────────────────────────────────────────────

function LanguageSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [selected, setSelected] = useState('en');

  const languages = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिंदी (Coming soon)' },
  ];

  return (
    <BottomSheetModal visible={visible} onClose={onClose} title="Select Language">
      <View style={sheetStyles.content}>
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={[sheetStyles.langOption, selected === lang.code && sheetStyles.langOptionActive]}
            onPress={() => {
              setSelected(lang.code);
              if (lang.code === 'hi') {
                Alert.alert('Coming Soon', 'Hindi language support will be added soon.');
                setSelected('en');
              } else {
                setTimeout(onClose, 300);
              }
            }}
          >
            <View>
              <Text style={[sheetStyles.langLabel, selected === lang.code && sheetStyles.langLabelActive]}>
                {lang.label}
              </Text>
              <Text style={sheetStyles.langNative}>{lang.native}</Text>
            </View>
            {selected === lang.code && (
              <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </BottomSheetModal>
  );
}

// ─── Reusable Bottom Sheet Modal ──────────────────────────────────────────────

function BottomSheetModal({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={modalStyles.overlay}
      >
        <Pressable style={modalStyles.backdrop} onPress={onClose} />
        <View style={modalStyles.sheet}>
          <View style={modalStyles.handle} />
          <View style={modalStyles.titleRow}>
            <Text style={modalStyles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.gray600} />
            </TouchableOpacity>
          </View>
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const sheetStyles = StyleSheet.create({
  content: { padding: 20, gap: 12 },
  label: { fontSize: 15, fontWeight: '600', color: Colors.gray800 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    backgroundColor: Colors.gray50,
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 4,
  },
  inputError: { borderColor: Colors.danger },
  input: { flex: 1, fontSize: 16, color: Colors.gray800 },
  errorText: { fontSize: 14, color: Colors.danger, marginTop: -6 },
  saveButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: { fontSize: 17, fontWeight: '700', color: Colors.white },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    backgroundColor: Colors.gray50,
  },
  langOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  langLabel: { fontSize: 17, fontWeight: '600', color: Colors.gray800 },
  langLabelActive: { color: Colors.primaryDark },
  langNative: { fontSize: 13, color: Colors.gray400, marginTop: 2 },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.gray200,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  title: { fontSize: 18, fontWeight: '700', color: Colors.gray800 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray100 },
  statusBarSeparator: { height: 1, backgroundColor: Colors.gray200 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.gray800 },
  content: { paddingVertical: 16, gap: 4, paddingBottom: 40 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 4,
    borderRadius: 20,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: { fontSize: 24, fontWeight: '800', color: Colors.white },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { fontSize: 18, fontWeight: '700', color: Colors.gray800 },
  profileEmail: { fontSize: 14, color: Colors.gray400 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },
  editProfileBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gray400,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 6,
    letterSpacing: 0.8,
  },
  menuGroup: {
    marginHorizontal: 16,
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  divider: { height: 1, backgroundColor: Colors.gray100, marginLeft: 70 },
  versionNote: {
    fontSize: 13,
    color: Colors.gray400,
    textAlign: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
});
