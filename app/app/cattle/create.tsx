import React, { useState, useCallback } from 'react';
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
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import * as cattleService from '@/services/cattle';
import { uploadCattleImage } from '@/services/upload';
import { Breed } from '@/types';
import { StatusBar } from 'expo-status-bar';

const BREEDS: { label: string; value: Breed }[] = [
  { label: 'Zebu', value: 'zebu' },
  { label: 'Cross Breed', value: 'crossBreed' },
  { label: 'Murrah', value: 'murrah' },
];

export default function CreateCattleScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [breed, setBreed] = useState<Breed | null>(null);
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [earTag, setEarTag] = useState('');
  const [imageLocalUri, setImageLocalUri] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const pickImage = useCallback(async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert('Permission needed', 'Allow photo library access to attach an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    setImageLocalUri(asset.uri);
    const mime =
      asset.mimeType === 'image/png'
        ? 'image/png'
        : asset.mimeType === 'image/webp'
          ? 'image/webp'
          : 'image/jpeg';
    setImageMime(mime);
  }, []);

  const validate = useCallback(() => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!breed) e.breed = 'Select a breed';

    const ageNum = parseFloat(age);
    if (!age.trim()) e.age = 'Age is required';
    else if (isNaN(ageNum) || ageNum < 0 || ageNum > 30) e.age = 'Age must be 0–30 years';

    const weightNum = parseFloat(weight);
    if (!weight.trim()) e.weight = 'Weight is required';
    else if (isNaN(weightNum) || weightNum < 50 || weightNum > 1000) e.weight = 'Weight must be 50–1000 kg';

    if (!earTag.trim()) e.earTag = 'Ear tag is required';

    setErrors(e);
    return Object.keys(e).length === 0;
  }, [name, breed, age, weight, earTag]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      let uploadedUrl: string | undefined;
      if (imageLocalUri) {
        try {
          const uploaded = await uploadCattleImage(imageLocalUri, imageMime);
          uploadedUrl = uploaded.url;
        } catch (e) {
          // Image upload failure shouldn't block cattle creation — proceed without it.
          console.warn('Image upload failed, creating cattle without image:', (e as Error).message);
        }
      }

      await cattleService.addCattle({
        name: name.trim(),
        breed: breed!,
        age: parseFloat(age),
        weight: parseFloat(weight),
        earTag: earTag.trim().toUpperCase(),
        imageUrl: uploadedUrl,
        userId: user?.id ?? '',
      });
      Alert.alert('Success', `${name.trim()} has been added to your herd.`, [
        { text: 'Go to Herd', onPress: () => router.replace('/(tabs)') },
      ]);
    } catch (err: any) {
      const url = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8787';
      console.error('Add cattle error:', err);
      Alert.alert('Error', `${err?.message}\n\nAPI URL: ${url}`);
    } finally {
      setIsSaving(false);
    }
  }, [name, breed, age, weight, earTag, imageLocalUri, imageMime, user, router, validate]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.gray800} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Cattle</Text>
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
          {/* Photo */}
          <View style={styles.field}>
            <Text style={styles.label}>Photo (optional)</Text>
            <TouchableOpacity style={styles.photoPicker} onPress={pickImage} activeOpacity={0.85}>
              {imageLocalUri ? (
                <Image source={{ uri: imageLocalUri }} style={styles.photoPreview} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="camera-outline" size={28} color={Colors.gray400} />
                  <Text style={styles.photoHint}>Tap to add a photo</Text>
                </View>
              )}
            </TouchableOpacity>
            {imageLocalUri ? (
              <TouchableOpacity onPress={() => setImageLocalUri(null)}>
                <Text style={styles.photoClear}>Remove photo</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Name */}
          <View style={styles.field}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Enter cattle name"
              placeholderTextColor={Colors.gray400}
              value={name}
              onChangeText={(t) => { setName(t); setErrors((p) => ({ ...p, name: '' })); }}
              maxLength={100}
            />
            {!!errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Breed */}
          <View style={styles.field}>
            <Text style={styles.label}>Breed</Text>
            <View style={styles.breedRow}>
              {BREEDS.map((b) => (
                <TouchableOpacity
                  key={b.value}
                  style={[styles.breedChip, breed === b.value && styles.breedChipActive]}
                  onPress={() => { setBreed(b.value); setErrors((p) => ({ ...p, breed: '' })); }}
                >
                  <Text style={[styles.breedChipText, breed === b.value && styles.breedChipTextActive]}>
                    {b.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {!!errors.breed && <Text style={styles.errorText}>{errors.breed}</Text>}
          </View>

          {/* Age */}
          <View style={styles.field}>
            <Text style={styles.label}>Age (years)</Text>
            <TextInput
              style={[styles.input, errors.age && styles.inputError]}
              placeholder="e.g. 3"
              placeholderTextColor={Colors.gray400}
              value={age}
              onChangeText={(t) => { setAge(t); setErrors((p) => ({ ...p, age: '' })); }}
              keyboardType="decimal-pad"
            />
            {!!errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
          </View>

          {/* Weight */}
          <View style={styles.field}>
            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput
              style={[styles.input, errors.weight && styles.inputError]}
              placeholder="e.g. 320"
              placeholderTextColor={Colors.gray400}
              value={weight}
              onChangeText={(t) => { setWeight(t); setErrors((p) => ({ ...p, weight: '' })); }}
              keyboardType="decimal-pad"
            />
            {!!errors.weight && <Text style={styles.errorText}>{errors.weight}</Text>}
          </View>

          {/* Ear Tag */}
          <View style={styles.field}>
            <Text style={styles.label}>Ear Tag</Text>
            <TextInput
              style={[styles.input, errors.earTag && styles.inputError]}
              placeholder="e.g. ET-011"
              placeholderTextColor={Colors.gray400}
              value={earTag}
              onChangeText={(t) => { setEarTag(t); setErrors((p) => ({ ...p, earTag: '' })); }}
              autoCapitalize="characters"
              maxLength={50}
            />
            {!!errors.earTag && <Text style={styles.errorText}>{errors.earTag}</Text>}
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, isSaving && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            {isSaving ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color={Colors.white} />
                <Text style={styles.submitBtnText}>Add Cattle</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray50 },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray800 },
  form: {
    padding: 20,
    paddingBottom: 40,
    gap: 20,
  },
  field: { gap: 6 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray800,
    marginBottom: 2,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.gray800,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    marginTop: 2,
  },
  photoPicker: {
    height: 140,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
    borderStyle: 'dashed',
    backgroundColor: Colors.white,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholder: { alignItems: 'center', gap: 6 },
  photoPreview: { width: '100%', height: '100%' },
  photoHint: { fontSize: 13, color: Colors.gray400 },
  photoClear: { fontSize: 13, color: Colors.danger, alignSelf: 'flex-end' },
  breedRow: {
    flexDirection: 'row',
    gap: 10,
  },
  breedChip: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray200,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  breedChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  breedChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray600,
  },
  breedChipTextActive: {
    color: Colors.primary,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    marginTop: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
});
