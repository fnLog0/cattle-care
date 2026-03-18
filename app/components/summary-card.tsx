import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

type SummaryData = {
  name?: string;
  breed?: string;
  age?: number;
  weight?: number;
  earTag?: string;
};

type Props = {
  data: SummaryData;
  onConfirm: () => void;
  onEdit: () => void;
  isLoading?: boolean;
};

const BREED_LABELS: Record<string, string> = {
  zebu: 'Zebu',
  crossBreed: 'Cross Breed',
  murrah: 'Murrah',
};

export function SummaryCard({ data, onConfirm, onEdit, isLoading = false }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={28} color={Colors.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Registration Summary</Text>
          <Text style={styles.subtitle}>Please confirm the details below</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.rows}>
        <SummaryRow icon="paw" label="Name" value={data.name ?? '—'} />
        <SummaryRow icon="leaf" label="Breed" value={data.breed ? (BREED_LABELS[data.breed] ?? data.breed) : '—'} />
        <SummaryRow icon="time" label="Age" value={data.age !== undefined ? `${data.age} year${data.age !== 1 ? 's' : ''}` : '—'} />
        <SummaryRow icon="fitness" label="Weight" value={data.weight !== undefined ? `${data.weight} kg` : '—'} />
        <SummaryRow icon="pricetag" label="Ear Tag" value={data.earTag ?? '—'} />
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={onEdit}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          <Ionicons name="pencil" size={16} color={Colors.primary} />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.confirmButton, isLoading && styles.confirmButtonDisabled]}
          onPress={onConfirm}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <>
              <Ionicons name="checkmark" size={18} color={Colors.white} />
              <Text style={styles.confirmButtonText}>Confirm & Save</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SummaryRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon as any} size={16} color={Colors.primary} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1.5,
    borderColor: Colors.primary + '30',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.primaryLight,
    gap: 12,
  },
  iconContainer: {},
  headerText: { flex: 1 },
  title: { fontSize: 17, fontWeight: '700', color: Colors.primaryDark },
  subtitle: { fontSize: 14, color: Colors.gray600, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.gray100 },
  rows: { padding: 16, gap: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { flex: 1, fontSize: 15, color: Colors.gray600, fontWeight: '500' },
  rowValue: { fontSize: 15, fontWeight: '700', color: Colors.gray800 },
  buttons: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
  },
  editButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  editButtonText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  confirmButton: {
    flex: 2,
    height: 50,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  confirmButtonDisabled: { opacity: 0.7 },
  confirmButtonText: { fontSize: 16, fontWeight: '700', color: Colors.white },
});
