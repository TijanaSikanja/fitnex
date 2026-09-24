import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
}

export function StreakCard({ currentStreak, longestStreak }: StreakCardProps) {
  const isActive = currentStreak > 0;

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={isActive ? ['#fc8739', '#FF5DA3'] : [Colors.gray, Colors.gray]}
        style={styles.flameWrapper}
      >
        <Ionicons name="flame" size={26} color={isActive ? Colors.white : '#B0B0B0'} />
      </LinearGradient>

      <View style={styles.textWrapper}>
        <Text style={styles.streakValue}>
          {currentStreak}-day streak
        </Text>
        <Text style={styles.streakSubtitle}>
          {isActive
            ? `Longest streak: ${longestStreak} ${longestStreak === 1 ? 'day' : 'days'}`
            : 'Hit today\'s goal to start a new streak'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.gray,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  flameWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrapper: {
    flex: 1,
    gap: 2,
  },
  streakValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  streakSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
});