import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWorkoutTimer } from '../../context/WorkoutTimerProvider';
import { Colors } from '../../constants/Colors';

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

/** Mounted once in app/_layout.tsx. Shows a small floating pill on top of
 * every screen whenever a workout timer is active, so it keeps counting
 * down no matter where the user navigates. Tapping it stops the timer. */
export function FloatingTimer() {
  const { isActive, isRunning, timeLeft, workoutTitle, stopTimer } = useWorkoutTimer();

  if (!isActive) return null;

  return (
    <TouchableOpacity style={styles.pill} onPress={stopTimer} activeOpacity={0.85}>
      <Ionicons
        name={isRunning ? 'stopwatch' : 'pause-circle'}
        size={18}
        color={Colors.white}
      />
      <Text style={styles.time}>{formatTime(timeLeft)}</Text>
      <Text style={styles.title} numberOfLines={1}>{workoutTitle}</Text>
      <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.7)" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    top: 56,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#111214',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    maxWidth: '85%',
    zIndex: 999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  time: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 14,
  },
  title: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 1,
  },
});