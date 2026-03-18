import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/theme';

type Chip = {
  label: string;
  value: string;
};

type Props = {
  chips: Chip[];
  onSelect: (value: string) => void;
  disabled?: boolean;
};

export function QuickChips({ chips, onSelect, disabled = false }: Props) {
  if (chips.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {chips.map((chip) => (
          <TouchableOpacity
            key={chip.value}
            style={[styles.chip, disabled && styles.chipDisabled]}
            onPress={() => !disabled && onSelect(chip.value)}
            activeOpacity={0.75}
          >
            <Text style={[styles.chipText, disabled && styles.chipTextDisabled]}>
              {chip.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray100,
    paddingVertical: 8,
  },
  container: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1.5,
    borderColor: Colors.primary + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipDisabled: {
    backgroundColor: Colors.gray100,
    borderColor: Colors.gray200,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  chipTextDisabled: {
    color: Colors.gray400,
  },
});
