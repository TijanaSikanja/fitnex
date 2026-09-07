import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { LevelInfo } from '../../services/gamification';

interface LevelProgressCardProps {
  levelInfo: LevelInfo;
}

export function LevelProgressCard({ levelInfo }: LevelProgressCardProps) {
  const { level, totalPoints, xpIntoLevel, xpNeededForLevel, progress } = levelInfo;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.levelBadgeWrapper}>
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            style={styles.levelBadge}
          >
            <Ionicons name="trophy" size={18} color={Colors.white} />
            <Text style={styles.levelBadgeText}>Lvl {level}</Text>
          </LinearGradient>
        </View>

        <View style={styles.pointsWrapper}>
          <Text style={styles.pointsValue}>{totalPoints.toLocaleString()}</Text>
          <Text style={styles.pointsLabel}>Fitnex Points</Text>
        </View>
      </View>

      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>

      <Text style={styles.progressLabel}>
        {xpIntoLevel} / {xpNeededForLevel} XP do nivoa {level + 1}
      </Text>
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
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelBadgeWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  levelBadgeText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  pointsWrapper: {
    alignItems: 'flex-end',
  },
  pointsValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  pointsLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  progressBarTrack: {
    height: 10,
    borderRadius: 6,
    backgroundColor: Colors.gray,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
    backgroundColor: Colors.pink,
  },
  progressLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    textAlign: 'right',
  },
});