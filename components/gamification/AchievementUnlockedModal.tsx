import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { useGamification } from '../../context/GamificationProvider';

/**
 * Mounted jednom u app/_layout.tsx, unutar GamificationProvider-a.
 * Automatski prikazuje modal svaki put kad je dodato novo dostignuće u
 * red čekanja (unlockQueue), bez obzira sa kog ekrana je akcija pokrenuta
 * (npr. usred treninga na workout-detail ekranu).
 */
export function AchievementUnlockedModal() {
  const { unlockQueue, dismissUnlock } = useGamification();
  const current = unlockQueue[0] || null;

  return (
    <Modal visible={!!current} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            style={styles.iconWrapper}
          >
            <Ionicons name={(current?.icon || 'trophy') as any} size={40} color={Colors.white} />
          </LinearGradient>

          <Text style={styles.eyebrow}>Novo dostignuće!</Text>
          <Text style={styles.title}>{current?.title}</Text>
          <Text style={styles.desc}>{current?.description}</Text>
          {!!current?.xp_reward && (
            <View style={styles.xpBadge}>
              <Text style={styles.xpText}>+{current.xp_reward} XP</Text>
            </View>
          )}

          <TouchableOpacity style={styles.button} onPress={dismissUnlock} activeOpacity={0.85}>
            <Text style={styles.buttonText}>Super, hvala! 🎉</Text>
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
    marginBottom: 16,
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