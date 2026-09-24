import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { ChallengeLevelWithStatus } from '../../services/gamification';

interface ChallengesPreviewCardProps {
  challengeLevels: ChallengeLevelWithStatus[];
}

export function ChallengesPreviewCard({ challengeLevels }: ChallengesPreviewCardProps) {
  const unlockedCount = challengeLevels.filter(c => c.unlocked).length;
  const nextLocked = challengeLevels.find(c => !c.unlocked);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => router.push('/challenges')}
    >
      <View style={styles.iconWrapper}>
        <Ionicons name="restaurant" size={22} color={Colors.white} />
      </View>

      <View style={styles.textWrapper}>
        <Text style={styles.title}>Culinary challenges</Text>
        <Text style={styles.subtitle}>
          {nextLocked
            ? `Next recipe at ${nextLocked.points_required.toLocaleString()} points`
            : 'You\'ve unlocked every recipe! 🎉'}
        </Text>
      </View>

      <View style={styles.countBadge}>
        <Text style={styles.countText}>
          {unlockedCount}/{challengeLevels.length}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
    </TouchableOpacity>
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
    gap: 12,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrapper: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  countBadge: {
    backgroundColor: Colors.black,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  countText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
});