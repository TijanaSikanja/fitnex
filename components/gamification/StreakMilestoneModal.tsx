import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/Colors';
import { useGamification } from '../../context/GamificationProvider';
import { ConfettiOverlay } from './ConfettiOverlay';

/** Mounted once in app/_layout.tsx, alongside the other gamification modals. */
export function StreakMilestoneModal() {
  const { streakMilestoneQueue, dismissStreakMilestone } = useGamification();
  const current = streakMilestoneQueue[0] || null;

  useEffect(() => {
    if (current) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  }, [current]);

  return (
    <Modal visible={!!current} transparent animationType="fade">
      <View style={styles.overlay}>
        <ConfettiOverlay active={!!current} />
        <View style={styles.card}>
          <LinearGradient
            colors={['#FF9D5C', '#FF5DA3']}
            style={styles.iconWrapper}
          >
            <Ionicons name="flame" size={44} color={Colors.white} />
          </LinearGradient>

          <Text style={styles.eyebrow}>Streak</Text>
          <Text style={styles.title}>{current?.title}</Text>
          <Text style={styles.desc}>{current?.description}</Text>

          <TouchableOpacity style={styles.button} onPress={dismissStreakMilestone} activeOpacity={0.85}>
            <Text style={styles.buttonText}>Keep going! 🔥</Text>
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
    marginBottom: 20,
  },
  button: {
    backgroundColor: Colors.pink,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
});