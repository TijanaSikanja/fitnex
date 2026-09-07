import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { AchievementWithStatus } from '../../services/gamification';

interface AchievementBadgeProps {
  achievement: AchievementWithStatus;
  onPress?: () => void;
}

export function AchievementBadge({ achievement, onPress }: AchievementBadgeProps) {
  const { unlocked, title, icon, xp_reward } = achievement;

  return (
    <TouchableOpacity
      style={[styles.container, !unlocked && styles.containerLocked]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={[styles.iconWrapper, unlocked ? styles.iconWrapperUnlocked : styles.iconWrapperLocked]}>
        <Ionicons
          name={(unlocked ? icon : 'lock-closed') as any}
          size={24}
          color={unlocked ? Colors.white : '#B0B0B0'}
        />
      </View>
      <Text
        style={[styles.title, !unlocked && styles.titleLocked]}
        numberOfLines={2}
      >
        {title}
      </Text>
      <Text style={styles.xp}>{unlocked ? `+${xp_reward} XP` : `${xp_reward} XP`}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '31%',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: Colors.gray,
    gap: 6,
  },
  containerLocked: {
    opacity: 0.55,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperUnlocked: {
    backgroundColor: Colors.pink,
  },
  iconWrapperLocked: {
    backgroundColor: '#F0F0F0',
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  titleLocked: {
    color: Colors.textLight,
  },
  xp: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});