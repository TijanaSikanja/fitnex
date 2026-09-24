import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { ProgressRing } from './ProgressRing';

interface DailyRingsCardProps {
  workoutCompleted: boolean;
  caloriesProgress: number; // 0..1
  caloriesLabel: string;
  stepsProgress: number; // 0..1
  stepsLabel: string;
  totalScore: number;
}

function Ring({
  progress,
  color,
  icon,
  label,
  value,
}: {
  progress: number;
  color: string;
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.ringWrapper}>
      <ProgressRing progress={progress} size={76} strokeWidth={8} color={color}>
        <Ionicons name={icon as any} size={22} color={color} />
      </ProgressRing>
      <Text style={styles.ringValue}>{value}</Text>
      <Text style={styles.ringLabel}>{label}</Text>
    </View>
  );
}

export function DailyRingsCard({
  workoutCompleted,
  caloriesProgress,
  caloriesLabel,
  stepsProgress,
  stepsLabel,
  totalScore,
}: DailyRingsCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's goals</Text>
        <Text style={styles.scoreText}>{totalScore} pts today</Text>
      </View>

      <View style={styles.ringsRow}>
        <Ring
          progress={workoutCompleted ? 1 : 0}
          color={Colors.pink}
          icon="barbell"
          label="Workout"
          value={workoutCompleted ? 'Done' : 'Not yet'}
        />
        <Ring
          progress={caloriesProgress}
          color="#FF9D5C"
          icon="nutrition"
          label="Calories"
          value={caloriesLabel}
        />
        <Ring
          progress={stepsProgress}
          color="#4DA6FF"
          icon="walk"
          label="Steps"
          value={stepsLabel}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.gray,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  ringsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  ringWrapper: {
    alignItems: 'center',
    gap: 4,
  },
  ringValue: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  ringLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textLight,
  },
});