import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/Colors';
import { useGamification } from '../../context/GamificationProvider';
import { ConfettiOverlay } from './ConfettiOverlay';

/** Mountovan jednom u app/_layout.tsx, pored ostalih gejmifikacionih modala. */
export function LevelUpModal() {
  const { levelUpQueue, dismissLevelUp } = useGamification();
  const current = levelUpQueue[0] || null;

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
            colors={['#FFD166', '#FF9D5C']}
            style={styles.iconWrapper}
          >
            <Ionicons name="rocket" size={44} color={Colors.white} />
          </LinearGradient>

           <Text style={styles.eyebrow}>New level</Text>
          <Text style={styles.title}>Level {current?.level}! 🎉</Text>
          <Text style={styles.desc}>
            Your consistency is paying off — you've leveled up your Fitnex experience.
          </Text>

          <TouchableOpacity style={styles.button} onPress={dismissLevelUp} activeOpacity={0.85}>
            <Text style={styles.buttonText}>Onward! 🚀</Text>
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
    fontSize: 26,
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
    marginBottom: 22,
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