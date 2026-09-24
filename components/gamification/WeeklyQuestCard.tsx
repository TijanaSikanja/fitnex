import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { WeeklyQuest } from '../../services/gamification';

interface WeeklyQuestCardProps {
  quest: WeeklyQuest | null;
  onClaim: () => void;
}

export function WeeklyQuestCard({ quest, onClaim }: WeeklyQuestCardProps) {
  if (!quest) return null;

  const progressPct = Math.min(1, quest.progress / quest.target_count);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconWrapper}>
          <Ionicons name={(quest.icon || 'star') as any} size={20} color={Colors.white} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Weekly quest</Text>
          <Text style={styles.title}>{quest.title}</Text>
        </View>
        <View style={styles.xpBadge}>
          <Text style={styles.xpText}>+{quest.xp_reward} XP</Text>
        </View>
      </View>

      <Text style={styles.desc}>{quest.description}</Text>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.round(progressPct * 100)}%` }]} />
      </View>
      <Text style={styles.progressLabel}>
        {Math.min(quest.progress, quest.target_count)}/{quest.target_count}
      </Text>

      {quest.completed && !quest.claimed && (
        <TouchableOpacity onPress={onClaim} activeOpacity={0.85}>
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            style={styles.claimButton}
          >
            <Text style={styles.claimButtonText}>Claim reward 🎁</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {quest.claimed && (
        <View style={styles.claimedRow}>
          <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
          <Text style={styles.claimedText}>Reward claimed</Text>
        </View>
      )}
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
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: 1,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.pink,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  xpBadge: {
    backgroundColor: Colors.gray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  xpText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  desc: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  progressTrack: {
    height: 10,
    borderRadius: 6,
    backgroundColor: Colors.gray,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
    backgroundColor: Colors.pink,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textLight,
    textAlign: 'right',
  },
  claimButton: {
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 4,
  },
  claimButtonText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 13,
  },
  claimedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  claimedText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.success,
  },
});