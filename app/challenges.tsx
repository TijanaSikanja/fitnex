import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { useGamification } from '../context/GamificationProvider';
import { StreakCard } from '../components/gamification/StreakCard';
import { ChallengeLevelWithStatus } from '../services/gamification';

export default function ChallengesScreen() {
  const router = useRouter();
  const { challengeLevels, currentStreak, longestStreak, totalPoints, loading } = useGamification();
  const [selected, setSelected] = useState<ChallengeLevelWithStatus | null>(null);

  const unlockedCount = challengeLevels.filter(c => c.unlocked).length;
  const nextLocked = challengeLevels.find(c => !c.unlocked);
  const progressToNext = nextLocked
    ? Math.min(1, totalPoints / nextLocked.points_required)
    : 1;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <LinearGradient colors={[Colors.gradientStart, Colors.gradientEnd]} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Culinary challenges</Text>
        <Text style={styles.headerSubtitle}>
          Earn Fitnex points and unlock new recipes
        </Text>
        <View style={styles.headerCountBadge}>
          <Ionicons name="restaurant" size={14} color={Colors.white} />
          <Text style={styles.headerCountText}>
            {unlockedCount}/{challengeLevels.length} unlocked
          </Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <StreakCard currentStreak={currentStreak} longestStreak={longestStreak} />

        {nextLocked && (
          <View style={styles.nextCard}>
            <View style={styles.nextCardHeader}>
              <Text style={styles.nextCardTitle}>Next challenge</Text>
              <Text style={styles.nextCardPoints}>
                {totalPoints.toLocaleString()} / {nextLocked.points_required.toLocaleString()} points
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.round(progressToNext * 100)}%` }]} />
            </View>
          </View>
        )}

        <View style={styles.list}>
          {loading && challengeLevels.length === 0 && (
            <Text style={styles.emptyText}>Loading challenges...</Text>
          )}

          {challengeLevels.map(level => (
            <TouchableOpacity
              key={level.id}
              style={[styles.levelCard, !level.unlocked && styles.levelCardLocked]}
              activeOpacity={0.85}
              onPress={() => level.unlocked && setSelected(level)}
              disabled={!level.unlocked}
            >
             {level.unlocked && level.recipe?.image_url ? (
                <Image
                  source={{ uri: level.recipe.image_url }}
                  style={styles.levelThumbnail}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[
                    styles.levelIconWrapper,
                    level.unlocked ? styles.levelIconUnlocked : styles.levelIconLocked,
                  ]}
                >
                  <Ionicons
                    name={(level.unlocked ? level.recipe?.icon || 'restaurant' : 'lock-closed') as any}
                    size={24}
                    color={level.unlocked ? Colors.white : '#B0B0B0'}
                  />
                </View>
              )}

              <View style={styles.levelTextWrapper}>
                <Text style={styles.levelLabel}>Level {level.level_number} · {level.title}</Text>
                <Text style={[styles.levelRecipeTitle, !level.unlocked && styles.textLocked]}>
                  {level.unlocked ? level.recipe?.title : `Unlocks at ${level.points_required.toLocaleString()} points`}
                </Text>
              </View>

              {level.unlocked ? (
                <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
              ) : (
                <View style={styles.pointsBadge}>
                  <Text style={styles.pointsBadgeText}>{level.points_required.toLocaleString()}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* RECIPE DETAIL */}
      <Modal
        visible={!!selected}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
             <ScrollView showsVerticalScrollIndicator={false}>
              {selected?.recipe?.image_url ? (
                <Image
                  source={{ uri: selected.recipe.image_url }}
                  style={styles.modalImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.modalIconWrapper}>
                  <Ionicons name={(selected?.recipe?.icon || 'restaurant') as any} size={32} color={Colors.white} />
                </View>
              )}
              <Text style={styles.modalTitle}>{selected?.recipe?.title}</Text>
              <Text style={styles.modalDesc}>{selected?.recipe?.description}</Text>

              <View style={styles.modalStatsRow}>
                <View style={styles.modalStat}>
                  <Ionicons name="flame-outline" size={16} color={Colors.pink} />
                  <Text style={styles.modalStatText}>{selected?.recipe?.calories} kcal</Text>
                </View>
                <View style={styles.modalStat}>
                  <Ionicons name="time-outline" size={16} color={Colors.pink} />
                  <Text style={styles.modalStatText}>{selected?.recipe?.prep_time_minutes} min</Text>
                </View>
              </View>

              <Text style={styles.modalSectionTitle}>Ingredients</Text>
              <Text style={styles.modalSectionText}>{selected?.recipe?.ingredients}</Text>

              <Text style={styles.modalSectionTitle}>Instructions</Text>
              <Text style={styles.modalSectionText}>{selected?.recipe?.instructions}</Text>
            </ScrollView>

            <TouchableOpacity style={styles.closeButton} onPress={() => setSelected(null)} activeOpacity={0.85}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    gap: 6,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.white,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  headerCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginTop: 8,
  },
  headerCountText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  body: {
    padding: 20,
    gap: 16,
    paddingBottom: 48,
  },
  nextCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.gray,
    gap: 10,
  },
  nextCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  nextCardPoints: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
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
  list: {
    gap: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 13,
    paddingVertical: 20,
  },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.gray,
  },
  levelCardLocked: {
    opacity: 0.7,
  },
  levelIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  levelIconUnlocked: {
    backgroundColor: Colors.pink,
  },
  levelIconLocked: {
    backgroundColor: '#F0F0F0',
  },
  levelTextWrapper: {
    flex: 1,
    gap: 2,
  },
  levelLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  levelRecipeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  textLocked: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  pointsBadge: {
    backgroundColor: Colors.gray,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pointsBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '85%',
    gap: 4,
  },
  modalIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
   modalImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  modalDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 6,
    marginBottom: 14,
  },
  modalStatsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 18,
  },
  modalStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalStatText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 10,
    marginBottom: 6,
  },
  modalSectionText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  closeButton: {
    backgroundColor: Colors.pink,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
});


// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   Dimensions,
//   Modal,
//   Image,
//   ActivityIndicator,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import { useRouter, useFocusEffect } from 'expo-router';
// import { Colors } from '../constants/Colors';
// import {
//   challengesService,
//   ChallengeLevelWithStatus,
//   FriendChallengeProgress,
// } from '../services/challenges';

// const { width: SCREEN_WIDTH } = Dimensions.get('window');
// const NODE_SIZE = 64;
// const ROW_HEIGHT = 130;
// const PATH_AMPLITUDE = SCREEN_WIDTH * 0.26;
// const PATH_CENTER_X = SCREEN_WIDTH / 2;

// function nodeX(index: number) {
//   return PATH_CENTER_X + PATH_AMPLITUDE * Math.sin(index * 0.9) - NODE_SIZE / 2;
// }
// function nodeY(index: number) {
//   return index * ROW_HEIGHT + 40;
// }

// export default function ChallengesScreen() {
//   const router = useRouter();
//   const scrollRef = useRef<ScrollView>(null);

//   const [levels, setLevels] = useState<ChallengeLevelWithStatus[]>([]);
//   const [friends, setFriends] = useState<FriendChallengeProgress[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedLevel, setSelectedLevel] = useState<ChallengeLevelWithStatus | null>(null);

//   const load = useCallback(async () => {
//     const [lvls, friendsProgress] = await Promise.all([
//       challengesService.getChallengeLevelsWithStatus(),
//       challengesService.getFriendsChallengeProgress(),
//     ]);
//     setLevels(lvls);
//     setFriends(friendsProgress);
//     setLoading(false);
//   }, []);

//   useFocusEffect(
//     useCallback(() => {
//       load();
//     }, [load])
//   );

//   const currentIndex = levels.findIndex(l => l.isCurrent);
//   const scrollToCurrentLevel = () => {
//     if (currentIndex < 0) return;
//     const y = Math.max(0, nodeY(currentIndex) - 200);
//     scrollRef.current?.scrollTo({ y, animated: true });
//   };

//   useEffect(() => {
//     if (!loading && levels.length > 0) {
//       setTimeout(scrollToCurrentLevel, 200);
//     }
//   }, [loading]);

//   const mapHeight = levels.length > 0 ? nodeY(levels.length - 1) + NODE_SIZE + 60 : 400;

//   const friendsAtLevel = (levelNumber: number) =>
//     friends.filter(f => f.level_number === levelNumber && !f.is_me);

//   return (
//     <SafeAreaView style={styles.container} edges={['top']}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
//           <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Challenges Map</Text>
//         <TouchableOpacity onPress={() => router.push('/recipe-book')} style={styles.backButton}>
//           <Ionicons name="book" size={22} color={Colors.pink} />
//         </TouchableOpacity>
//       </View>

     
//       {friends.length > 1 && (
//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={styles.friendsStrip}
//         >
//           {friends.map(f => (
//             <View key={f.user_id} style={[styles.friendChip, f.is_me && styles.friendChipMe]}>
//               {f.avatar_url ? (
//                 <Image source={{ uri: f.avatar_url }} style={styles.friendAvatar} />
//               ) : (
//                 <View style={[styles.friendAvatar, styles.friendAvatarPlaceholder]}>
//                   <Ionicons name="person" size={12} color={Colors.textLight} />
//                 </View>
//               )}
//               <Text style={styles.friendChipName} numberOfLines={1}>
//                 {f.is_me ? 'Ti' : f.full_name.split(' ')[0]}
//               </Text>
//               <View style={styles.friendChipLevel}>
//                 <Text style={styles.friendChipLevelText}>{f.level_number}</Text>
//               </View>
//             </View>
//           ))}
//         </ScrollView>
//       )}

//       {loading ? (
//         <View style={styles.center}>
//           <ActivityIndicator size="large" color={Colors.pink} />
//         </View>
//       ) : (
//         <ScrollView ref={scrollRef} contentContainerStyle={{ height: mapHeight }}>
//           <View style={[styles.mapBackground, { height: mapHeight }]}>
        
//             {levels.map((_, i) => {
//               if (i === levels.length - 1) return null;
//               const x1 = nodeX(i) + NODE_SIZE / 2;
//               const y1 = nodeY(i) + NODE_SIZE / 2;
//               const x2 = nodeX(i + 1) + NODE_SIZE / 2;
//               const y2 = nodeY(i + 1) + NODE_SIZE / 2;
//               const dx = x2 - x1;
//               const dy = y2 - y1;
//               const length = Math.sqrt(dx * dx + dy * dy);
//               const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
//               return (
//                 <View
//                   key={`line-${i}`}
//                   style={[
//                     styles.pathLine,
//                     {
//                       width: length,
//                       left: x1,
//                       top: y1,
//                       transform: [{ rotate: `${angle}deg` }],
//                       backgroundColor: levels[i + 1].unlocked || levels[i + 1].isCurrent
//                         ? Colors.pink
//                         : Colors.gray,
//                     },
//                   ]}
//                 />
//               );
//             })}

//             {levels.map((level, i) => {
//               const friendsHere = friendsAtLevel(level.level_number);
//               return (
//                 <View key={level.id} style={{ position: 'absolute', left: nodeX(i), top: nodeY(i) }}>
//                   <TouchableOpacity
//                     style={[
//                       styles.node,
//                       level.unlocked && styles.nodeUnlocked,
//                       level.isCurrent && styles.nodeCurrent,
//                     ]}
//                     activeOpacity={0.8}
//                     onPress={() => level.unlocked && setSelectedLevel(level)}
//                   >
//                     {level.isCurrent && (
//                       <View style={styles.hereBadge}>
//                         <Text style={styles.hereBadgeText}>You are here</Text>
//                       </View>
//                     )}
//                     <Ionicons
//                       name={level.unlocked ? (level.icon as any) : 'lock-closed'}
//                       size={26}
//                       color={level.unlocked ? Colors.white : '#B0B0B0'}
//                     />
//                     <Text style={[styles.nodeNumber, level.unlocked && styles.nodeNumberUnlocked]}>
//                       {level.level_number}
//                     </Text>
//                   </TouchableOpacity>

//                   {friendsHere.length > 0 && (
//                     <View style={styles.friendMarkers}>
//                       {friendsHere.slice(0, 3).map(f => (
//                         <View key={f.user_id} style={styles.friendMarkerDot}>
//                           {f.avatar_url ? (
//                             <Image source={{ uri: f.avatar_url }} style={styles.friendMarkerAvatar} />
//                           ) : (
//                             <Ionicons name="person" size={10} color={Colors.white} />
//                           )}
//                         </View>
//                       ))}
//                     </View>
//                   )}
//                 </View>
//               );
//             })}
//           </View>
//         </ScrollView>
//       )}

     
//       <Modal visible={!!selectedLevel} transparent animationType="slide" onRequestClose={() => setSelectedLevel(null)}>
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalCard}>
//             <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedLevel(null)}>
//               <Ionicons name="close" size={22} color={Colors.textPrimary} />
//             </TouchableOpacity>

//             {selectedLevel && (
//               <ScrollView showsVerticalScrollIndicator={false}>
//                 <LinearGradient
//                   colors={[Colors.gradientStart, Colors.gradientEnd]}
//                   style={styles.modalIconWrapper}
//                 >
//                   <Ionicons name={selectedLevel.recipe.icon as any} size={36} color={Colors.white} />
//                 </LinearGradient>

//                 <Text style={styles.modalEyebrow}>Nivo {selectedLevel.level_number} — otključano</Text>
//                 <Text style={styles.modalTitle}>{selectedLevel.recipe.title}</Text>
//                 <Text style={styles.modalDesc}>{selectedLevel.recipe.description}</Text>

//                 <View style={styles.modalStatsRow}>
//                   <View style={styles.modalStat}>
//                     <Ionicons name="flame" size={16} color={Colors.pink} />
//                     <Text style={styles.modalStatText}>{selectedLevel.recipe.calories} kcal</Text>
//                   </View>
//                   <View style={styles.modalStat}>
//                     <Ionicons name="time" size={16} color={Colors.pink} />
//                     <Text style={styles.modalStatText}>{selectedLevel.recipe.prep_time_minutes} min</Text>
//                   </View>
//                 </View>

//                 <Text style={styles.modalSectionTitle}>Sastojci</Text>
//                 {selectedLevel.recipe.ingredients.split('\n').map((line, i) => (
//                   <Text key={i} style={styles.modalListItem}>• {line}</Text>
//                 ))}

//                 <Text style={styles.modalSectionTitle}>Priprema</Text>
//                 {selectedLevel.recipe.instructions.split('\n').map((line, i) => (
//                   <Text key={i} style={styles.modalListItem}>{i + 1}. {line}</Text>
//                 ))}
//               </ScrollView>
//             )}
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F4F8F0' },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//   },
//   backButton: { padding: 4 },
//   headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
//   center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

//   friendsStrip: {
//     paddingHorizontal: 16,
//     paddingBottom: 10,
//     gap: 8,
//   },
//   friendChip: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     backgroundColor: Colors.white,
//     borderRadius: 20,
//     paddingVertical: 6,
//     paddingHorizontal: 10,
//     borderWidth: 1,
//     borderColor: Colors.gray,
//   },
//   friendChipMe: {
//     borderColor: Colors.pink,
//     borderWidth: 1.5,
//   },
//   friendAvatar: { width: 22, height: 22, borderRadius: 11 },
//   friendAvatarPlaceholder: {
//     backgroundColor: Colors.gray,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   friendChipName: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary, maxWidth: 60 },
//   friendChipLevel: {
//     backgroundColor: Colors.pink,
//     borderRadius: 8,
//     paddingHorizontal: 6,
//     paddingVertical: 1,
//   },
//   friendChipLevelText: { fontSize: 10, fontWeight: '800', color: Colors.white },

//   mapBackground: {
//     width: '100%',
//     position: 'relative',
//   },
//   pathLine: {
//     position: 'absolute',
//     height: 6,
//     borderRadius: 3,
//     transformOrigin: 'left center',
//   },
//   node: {
//     width: NODE_SIZE,
//     height: NODE_SIZE,
//     borderRadius: NODE_SIZE / 2,
//     backgroundColor: '#D9D9D9',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 4,
//     borderColor: '#C4C4C4',
//   },
//   nodeUnlocked: {
//     backgroundColor: Colors.pink,
//     borderColor: Colors.darkPink,
//   },
//   nodeCurrent: {
//     backgroundColor: '#FFB74D',
//     borderColor: '#F57C00',
//   },
//   nodeNumber: {
//     position: 'absolute',
//     bottom: -20,
//     fontSize: 12,
//     fontWeight: '800',
//     color: Colors.textLight,
//   },
//   nodeNumberUnlocked: {
//     color: Colors.textPrimary,
//   },
//   hereBadge: {
//     position: 'absolute',
//     top: -34,
//     backgroundColor: Colors.black,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 8,
//   },
//   hereBadgeText: {
//     color: Colors.white,
//     fontSize: 9,
//     fontWeight: '800',
//   },
//   friendMarkers: {
//     position: 'absolute',
//     top: -8,
//     right: -8,
//     flexDirection: 'row',
//   },
//   friendMarkerDot: {
//     width: 18,
//     height: 18,
//     borderRadius: 9,
//     backgroundColor: Colors.darkGray,
//     borderWidth: 1.5,
//     borderColor: Colors.white,
//     marginLeft: -6,
//     alignItems: 'center',
//     justifyContent: 'center',
//     overflow: 'hidden',
//   },
//   friendMarkerAvatar: { width: 18, height: 18 },

//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'flex-end',
//   },
//   modalCard: {
//     backgroundColor: Colors.white,
//     borderTopLeftRadius: 28,
//     borderTopRightRadius: 28,
//     padding: 24,
//     maxHeight: '85%',
//   },
//   modalClose: {
//     alignSelf: 'flex-end',
//     marginBottom: 8,
//   },
//   modalIconWrapper: {
//     width: 72,
//     height: 72,
//     borderRadius: 36,
//     alignItems: 'center',
//     justifyContent: 'center',
//     alignSelf: 'center',
//     marginBottom: 12,
//   },
//   modalEyebrow: {
//     fontSize: 11,
//     fontWeight: '800',
//     color: Colors.pink,
//     textTransform: 'uppercase',
//     letterSpacing: 1,
//     textAlign: 'center',
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: '800',
//     color: Colors.textPrimary,
//     textAlign: 'center',
//     marginTop: 4,
//   },
//   modalDesc: {
//     fontSize: 13,
//     color: Colors.textSecondary,
//     textAlign: 'center',
//     marginTop: 6,
//     marginBottom: 14,
//   },
//   modalStatsRow: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     gap: 20,
//     marginBottom: 20,
//   },
//   modalStat: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//   },
//   modalStatText: {
//     fontSize: 13,
//     fontWeight: '700',
//     color: Colors.textPrimary,
//   },
//   modalSectionTitle: {
//     fontSize: 15,
//     fontWeight: '800',
//     color: Colors.textPrimary,
//     marginTop: 10,
//     marginBottom: 8,
//   },
//   modalListItem: {
//     fontSize: 13,
//     color: Colors.textSecondary,
//     lineHeight: 20,
//   },
// });