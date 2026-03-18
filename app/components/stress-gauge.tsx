import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StressLevel } from '@/types';
import { STRESS_COLORS, STRESS_LABELS } from '@/constants/stress';
import { Colors } from '@/constants/theme';

type Props = {
  stressIndex: number;
  stressLevel: StressLevel;
  size?: number;
};

export function StressGauge({ stressIndex, stressLevel, size = 160 }: Props) {
  const color = STRESS_COLORS[stressLevel];
  const label = STRESS_LABELS[stressLevel];
  const clampedIndex = Math.min(100, Math.max(0, stressIndex));

  // Calculate arc segments — we use nested circles for a simple gauge
  const ringSize = size;
  const ringWidth = size * 0.12;
  const innerSize = ringSize - ringWidth * 2;

  return (
    <View style={[styles.container, { width: ringSize, height: ringSize }]}>
      {/* Background ring */}
      <View
        style={[
          styles.ring,
          {
            width: ringSize,
            height: ringSize,
            borderRadius: ringSize / 2,
            borderWidth: ringWidth,
            borderColor: Colors.gray100,
          },
        ]}
      />

      {/* Progress overlay — simple arc approximation using clip + rotation */}
      <GaugeArc
        progress={clampedIndex / 100}
        color={color}
        size={ringSize}
        ringWidth={ringWidth}
      />

      {/* Center content */}
      <View
        style={[
          styles.center,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
          },
        ]}
      >
        <Text style={[styles.indexValue, { color, fontSize: size * 0.18 }]}>
          {Math.round(clampedIndex)}
        </Text>
        <Text style={[styles.indexLabel, { fontSize: size * 0.085 }]}>/ 100</Text>
        <View style={[styles.levelBadge, { backgroundColor: color + '20' }]}>
          <Text style={[styles.levelText, { color, fontSize: size * 0.075 }]}>{label}</Text>
        </View>
      </View>

      {/* Min / Max labels */}
      <Text style={[styles.minLabel, { fontSize: size * 0.07 }]}>0</Text>
      <Text style={[styles.maxLabel, { fontSize: size * 0.07 }]}>100</Text>
    </View>
  );
}

// Arc rendered using two half-circle Views
function GaugeArc({
  progress,
  color,
  size,
  ringWidth,
}: {
  progress: number;
  color: string;
  size: number;
  ringWidth: number;
}) {
  // We approximate a circular progress using border colors on quadrant halves
  // For values 0–0.5: rotate left half
  // For values 0.5–1.0: fill left, rotate right half
  const leftDeg = progress <= 0.5 ? progress * 360 : 180;
  const rightDeg = progress > 0.5 ? (progress - 0.5) * 360 : 0;

  return (
    <View style={[StyleSheet.absoluteFill, styles.arcContainer]}>
      {/* Left half-circle clip */}
      <View
        style={[
          styles.halfCircleContainer,
          {
            left: 0,
            width: size / 2,
            height: size,
          },
        ]}
      >
        <View
          style={[
            styles.halfCircle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderWidth: ringWidth,
              borderColor: color,
              transform: [{ rotate: `${leftDeg - 180}deg` }],
              left: 0,
            },
          ]}
        />
      </View>

      {/* Right half-circle clip */}
      {progress > 0.5 && (
        <View
          style={[
            styles.halfCircleContainer,
            {
              right: 0,
              width: size / 2,
              height: size,
            },
          ]}
        >
          <View
            style={[
              styles.halfCircle,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: ringWidth,
                borderColor: color,
                transform: [{ rotate: `${rightDeg - 180}deg` }],
                right: 0,
              },
            ]}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ring: {
    position: 'absolute',
  },
  arcContainer: {
    position: 'absolute',
  },
  halfCircleContainer: {
    position: 'absolute',
    top: 0,
    overflow: 'hidden',
  },
  halfCircle: {
    position: 'absolute',
    top: 0,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    gap: 2,
  },
  indexValue: {
    fontWeight: '800',
    lineHeight: undefined,
  },
  indexLabel: {
    color: Colors.gray400,
    fontWeight: '500',
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 4,
  },
  levelText: {
    fontWeight: '700',
  },
  minLabel: {
    position: 'absolute',
    bottom: -2,
    left: 8,
    color: Colors.gray400,
    fontWeight: '500',
  },
  maxLabel: {
    position: 'absolute',
    bottom: -2,
    right: 4,
    color: Colors.gray400,
    fontWeight: '500',
  },
});
