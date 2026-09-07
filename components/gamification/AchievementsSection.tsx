import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { AchievementWithStatus } from '../../services/gamification';
import { AchievementBadge } from './AchievementBadge';

interface AchievementsSectionProps {
  achievements: AchievementWithStatus[];
}

export function AchievementsSection({ achievements }: AchievementsSectionProps) {
  const [selected, setSelected] = useState<AchievementWithStatus | null>(null);

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dostignuća</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{unlockedCount}/{achievements.length}</Text>
        </View>
      </View>

      <View style={styles.grid}>
        {achievements.map(a => (
          <AchievementBadge key={a.id} achievement={a} onPress={() => setSelected(a)} />
        ))}
      </View>

      <Modal
        visible={!!selected}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelected(null)}
        >
          <View style={styles.modalCard}>
            {selected && (
              <>
                <View
                  style={[
                    styles.modalIconWrapper,
                    selected.unlocked ? styles.iconWrapperUnlocked : styles.iconWrapperLocked,
                  ]}
                >
                  <Ionicons
                    name={(selected.unlocked ? selected.icon : 'lock-closed') as any}
                    size={32}
                    color={selected.unlocked ? Colors.white : '#B0B0B0'}
                  />
                </View>
                <Text style={styles.modalTitle}>{selected.title}</Text>
                <Text style={styles.modalDesc}>{selected.description}</Text>
                <Text style={styles.modalXp}>
                  {selected.unlocked ? `+${selected.xp_reward} XP osvojeno` : `${selected.xp_reward} XP nagrada`}
                </Text>
                {selected.unlocked && selected.unlocked_at && (
                  <Text style={styles.modalDate}>
                    Otključano {new Date(selected.unlocked_at).toLocaleDateString('sr-RS')}
                  </Text>
                )}
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
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
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  iconWrapperUnlocked: {
    backgroundColor: Colors.pink,
  },
  iconWrapperLocked: {
    backgroundColor: '#F0F0F0',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    gap: 6,
  },
  modalIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  modalDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },
  modalXp: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.pink,
    marginTop: 4,
  },
  modalDate: {
    fontSize: 11,
    color: Colors.textLight,
  },
});