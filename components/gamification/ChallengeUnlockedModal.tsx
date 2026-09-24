import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/Colors';
import { useGamification } from '../../context/GamificationProvider';
import { ConfettiOverlay } from './ConfettiOverlay';

/**
 * Mounted once in app/_layout.tsx, alongside the other gamification modals.
 * Shows up every time the user crosses the points threshold for the next
 * challenge level and unlocks a new recipe.
 */
export function ChallengeUnlockedModal() {
  const { challengeUnlockQueue, dismissChallengeUnlock } = useGamification();
  const current = challengeUnlockQueue[0] || null;

  useEffect(() => {
    if (current) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  }, [current]);

  const handleViewRecipe = () => {
    dismissChallengeUnlock();
    router.push('/challenges');
  };

  return (
    <Modal visible={!!current} transparent animationType="fade">
      <View style={styles.overlay}>
        <ConfettiOverlay active={!!current} />
        <View style={styles.card}>
          <LinearGradient
            colors={['#FF9D5C', Colors.pink]}
            style={styles.iconWrapper}
          >
            <Ionicons name={(current?.recipe_icon || 'restaurant') as any} size={40} color={Colors.white} />
          </LinearGradient>

          <Text style={styles.eyebrow}>New recipe unlocked!</Text>
          <Text style={styles.title}>{current?.recipe_title || current?.title}</Text>
          {!!current?.recipe_description && (
            <Text style={styles.desc}>{current.recipe_description}</Text>
          )}
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Level {current?.level_number}</Text>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleViewRecipe} activeOpacity={0.85}>
            <Text style={styles.primaryButtonText}>View recipe 🍽️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={dismissChallengeUnlock}>
            <Text style={styles.dismissText}>Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    width: '100%',
  },
  iconWrapper: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.pink,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  levelBadge: {
    backgroundColor: Colors.black,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  levelText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  primaryButton: {
    backgroundColor: Colors.pink,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  dismissText: {
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
});