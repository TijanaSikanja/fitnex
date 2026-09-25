import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing } from '../constants/Spacing';

const MEAL_TYPES = [
  { label: 'Breakfast', icon: 'egg-outline', color: '#FFB84D' },
  { label: 'Brunch', icon: 'basket-outline', color: '#7BC67E' },
  { label: 'Lunch', icon: 'restaurant-outline', color: '#4DA6FF' },
  { label: 'Dinner', icon: 'fish-outline', color: '#9D7BFF' },
  { label: 'Drinks', icon: 'cafe-outline', color: '#FF9D5C' },
  { label: 'Snack', icon: 'nutrition-outline', color: Colors.pink },
];

export default function AddMealScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View style={styles.titleBlock}>
        <Text style={styles.title}>Add a meal</Text>
        <Text style={styles.subtitle}>What are you logging?</Text>
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        {MEAL_TYPES.map((item) => {
          const isSelected = selected === item.label;
          return (
            <TouchableOpacity
              key={item.label}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => setSelected(item.label)}
              activeOpacity={0.85}
            >
                            {isSelected && (
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark" size={12} color={Colors.white} />
                </View>
              )}
              <View style={styles.cardContent}>
                <View
                  style={[
                    styles.iconWrapper,
                    { backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : `${item.color}1A` },
                  ]}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={26}
                    color={isSelected ? Colors.white : item.color}
                  />
                </View>
                <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>
                  {item.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={!selected}
          onPress={() => {
            if (!selected) return;
            router.push({
              pathname: '/choose-meal',
              params: { meal_type: selected },
            });
          }}
        >
          <LinearGradient
            colors={selected ? [Colors.gradientStart, Colors.gradientEnd] : [Colors.gray, Colors.gray]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.continueButton}
          >
            <Text style={[styles.continueText, !selected && styles.continueTextDisabled]}>
              {selected ? `Continue with ${selected}` : 'Select a meal type'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.screenPadding,
  },
  header: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray,
    alignItems: 'center',
    justifyContent: 'center',
  },
    titleBlock: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: Spacing.md,
  },
  card: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: Colors.white,
    borderRadius: Spacing.radiusLg,
    borderWidth: 1,
    borderColor: Colors.gray,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: Spacing.md,
  },
  cardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  cardSelected: {
    backgroundColor: Colors.pink,
    borderColor: Colors.pink,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    ...Typography.bodySmall,
    fontFamily: 'Montserrat_600SemiBold',
    color: Colors.textPrimary,
  },
  cardLabelSelected: {
    color: Colors.white,
  },
  footer: {
    position: 'absolute',
    bottom: Spacing.xl,
    left: Spacing.screenPadding,
    right: Spacing.screenPadding,
  },
  continueButton: {
    paddingVertical: Spacing.md,
    borderRadius: Spacing.radiusFull,
    alignItems: 'center',
  },
  continueText: {
    ...Typography.button,
    color: Colors.white,
  },
  continueTextDisabled: {
    color: Colors.textLight,
  },
});


// import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
// import { useRouter } from 'expo-router';
// import { useState } from 'react';
// import { Ionicons } from '@expo/vector-icons';
// import { Colors } from '../constants/Colors';

// const MEAL_TYPES = [
//   { label: 'Breakfast', icon: 'egg-outline' },
//   { label: 'Brunch', icon: 'basket-outline' },
//   { label: 'Lunch', icon: 'restaurant-outline' },
//   { label: 'Dinner', icon: 'fish-outline' },
//   { label: 'Drinks', icon: 'cafe-outline' },
//   { label: 'Snack', icon: 'nutrition-outline' },
// ];

// export default function AddMealScreen() {
//   const router = useRouter();
//   const [selected, setSelected] = useState<string | null>(null);

//   return (
//     <SafeAreaView style={styles.container}>
  
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
//           <Ionicons name="arrow-back" size={20} color="#333" />
//         </TouchableOpacity>
//       </View>

 
//       <Text style={styles.title}>Add New Meal</Text>
//       <Text style={styles.subtitle}>Please select meal type</Text>


//       <View style={styles.grid}>
//         {MEAL_TYPES.map((item) => {
//           const isSelected = selected === item.label;
//           return (
//             <TouchableOpacity
//               key={item.label}
//               style={[styles.card, isSelected && styles.cardSelected]}
//               onPress={() => setSelected(item.label)}
//               activeOpacity={0.8}
//             >
//               <Ionicons
//                 name={item.icon as any}
//                 size={32}
//                 color={isSelected ? Colors.white : '#555'}
//               />
//               <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>
//                 {item.label}
//               </Text>
//             </TouchableOpacity>
//           );
//         })}
//       </View>

    
//       <TouchableOpacity
//         style={[styles.continueButton, !selected && styles.continueButtonDisabled]}
//         onPress={() => {
//           if (!selected) return;
//           router.push({
//             pathname: '/choose-meal',
//             params: { meal_type: selected },
//           });
//         }}
//         activeOpacity={0.8}
//         disabled={!selected}
//       >
//         <Text style={styles.continueText}>Continue</Text>
//       </TouchableOpacity>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     paddingHorizontal: 24,
//   },
//   header: {
//     paddingTop: 12,
//     paddingBottom: 8,
//   },
//   backButton: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: '#f2f2f2',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   title: {
//     fontSize: 26,
//     fontWeight: '700',
//     color: '#1a1a1a',
//     textAlign: 'center',
//     marginTop: 16,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: '#888',
//     textAlign: 'center',
//     marginTop: 6,
//     marginBottom: 32,
//   },
//   grid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//     rowGap: 16,
//   },
//   card: {
//     width: '30%',
//     aspectRatio: 1,
//     backgroundColor: '#f5f5f5',
//     borderRadius: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//   },
//   cardSelected: {
//     backgroundColor: Colors.pink,
//   },
//   cardLabel: {
//     fontSize: 13,
//     color: '#555',
//     fontWeight: '500',
//   },
//   cardLabelSelected: {
//     color: Colors.white,
//     fontWeight: '600',
//   },
//   continueButton: {
//     position: 'absolute',
//     bottom: 40,
//     left: 24,
//     right: 24,
//     backgroundColor: Colors.pink,
//     paddingVertical: 18,
//     borderRadius: 30,
//     alignItems: 'center',
//   },
//   continueButtonDisabled: {
//     opacity: 0.5,
//   },
//   continueText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 16,
//   },
// });