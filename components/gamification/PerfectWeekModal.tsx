import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/Colors';
import { useGamification } from '../../context/GamificationProvider';
import { ConfettiOverlay } from './ConfettiOverlay';

/** Mounted once in app/_layout.tsx, alongside the other gamification modals. */
export function PerfectWeekModal() {
  const { perfectWeekQueue, dismissPerfectWeek } = useGamification();
  const current = perfectWeekQueue[0] || null;

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
            colors={['#4CAF50', '#2E9E52']}
            style={styles.iconWrapper}
          >
            <Ionicons name="star" size={44} color={Colors.white} />
          </LinearGradient>

          <Text style={styles.eyebrow}>Perfect Week</Text>
          <Text style={styles.title}>Perfect Week! 🏆</Text>
          <Text style={styles.desc}>
            You hit all three daily goals every single day this week. Not many people pull that off.
          </Text>
          <View style={styles.xpBadge}>
            <Text style={styles.xpText}>+{current?.xpAwarded} XP</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={dismissPerfectWeek} activeOpacity={0.85}>
            <Text style={styles.buttonText}>Well earned! 🎉</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
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
    width: 88,
    height: 88,
    borderRadius: 44,
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
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  desc: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 14,
  },
  xpBadge: {
    backgroundColor: Colors.black,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  xpText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '800',
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