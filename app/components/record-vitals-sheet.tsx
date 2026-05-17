import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/theme';
import { recordStress } from '@/services/vitals';

type Props = {
  visible: boolean;
  cattleId: string;
  cattleName?: string;
  onClose: () => void;
  onRecorded: () => void;
};

export function RecordVitalsSheet({
  visible,
  cattleId,
  cattleName,
  onClose,
  onRecorded,
}: Props) {
  const { t } = useTranslation();
  const [temp, setTemp] = useState('');
  const [resp, setResp] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  function reset() {
    setTemp('');
    setResp('');
    setError('');
  }

  async function handleSave() {
    const tempNum = parseFloat(temp);
    const respNum = parseFloat(resp);
    if (!temp.trim() || Number.isNaN(tempNum) || tempNum < 30 || tempNum > 45) {
      setError(t('vitals.sheetErrTemp'));
      return;
    }
    if (!resp.trim() || Number.isNaN(respNum) || respNum < 1 || respNum > 200) {
      setError(t('vitals.sheetErrResp'));
      return;
    }
    setError('');
    setIsSaving(true);
    try {
      const result = await recordStress(cattleId, {
        rectalTemperature: tempNum,
        respirationRate: respNum,
      });
      Alert.alert(
        `✓ ${t('vitals.sheetSuccess')}`,
        t('vitals.sheetSuccessMsg', {
          si: result.strainIndex.toFixed(2),
          level: t(`stress.${result.stressLevel}`),
        }),
        [
          {
            text: 'OK',
            onPress: () => {
              reset();
              onRecorded();
              onClose();
            },
          },
        ],
      );
    } catch (e) {
      setError((e as Error).message ?? t('vitals.sheetErrFail'));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.titleRow}>
            <Text style={styles.title}>
              {t('vitals.sheetTitle')}{cattleName ? ` — ${cattleName}` : ''}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.gray600} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.label}>{t('vitals.sheetTempLabel')}</Text>
            <TextInput
              style={[styles.input, error && temp ? styles.inputError : null]}
              placeholder={t('vitals.sheetTempPlaceholder')}
              placeholderTextColor={Colors.gray400}
              value={temp}
              onChangeText={(v) => {
                setTemp(v);
                setError('');
              }}
              keyboardType="decimal-pad"
            />

            <Text style={styles.label}>{t('vitals.sheetRespLabel')}</Text>
            <TextInput
              style={[styles.input, error && resp ? styles.inputError : null]}
              placeholder={t('vitals.sheetRespPlaceholder')}
              placeholderTextColor={Colors.gray400}
              value={resp}
              onChangeText={(v) => {
                setResp(v);
                setError('');
              }}
              keyboardType="decimal-pad"
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={isSaving}
              activeOpacity={0.85}
            >
              {isSaving ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <Ionicons name="pulse" size={18} color={Colors.white} />
                  <Text style={styles.saveBtnText}>{t('vitals.sheetSubmit')}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  title: { fontSize: 18, fontWeight: '700', color: Colors.gray800, flexShrink: 1 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: 20, gap: 10 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.gray800, marginTop: 4 },
  input: {
    backgroundColor: Colors.gray50,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.gray800,
  },
  inputError: { borderColor: Colors.danger },
  errorText: { fontSize: 13, color: Colors.danger, marginTop: -4 },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    marginTop: 12,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: Colors.white },
});
