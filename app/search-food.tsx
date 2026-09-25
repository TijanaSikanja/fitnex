import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../services/supabase';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing } from '../constants/Spacing';
import { useGamification } from '../context/GamificationProvider';

type FoodResult = {
  code: string;
  name: string;
  brand: string;
  imageUrl: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export default function SearchFoodScreen() {
  const router = useRouter();
  const { meal_type } = useLocalSearchParams<{ meal_type?: string }>();
  const { awardMealLogged } = useGamification();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState<FoodResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [grams, setGrams] = useState('100');

  const gramsNum = parseFloat(grams) || 0;
  const scale = gramsNum / 100;
  const scaledCalories = selected ? Math.round(selected.calories * scale) : 0;
  const scaledProtein = selected ? Math.round(selected.protein * scale) : 0;
  const scaledCarbs = selected ? Math.round(selected.carbs * scale) : 0;
  const scaledFat = selected ? Math.round(selected.fat * scale) : 0;

    const fetchFoodResults = async (searchTerm: string): Promise<FoodResult[]> => {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
      searchTerm
    )}&json=1&page_size=25&fields=product_name,image_url,brands,nutriments,code`;
    const response = await fetch(url);
    const data = await response.json();

    return (data.products || [])
      .filter((p: any) => p.product_name && p.nutriments?.['energy-kcal_100g'])
      .map((p: any) => ({
        code: p.code,
        name: p.product_name,
        brand: p.brands || '',
        imageUrl: p.image_url || null,
        calories: Math.round(p.nutriments['energy-kcal_100g'] || 0),
        protein: Math.round(p.nutriments['proteins_100g'] || 0),
        carbs: Math.round(p.nutriments['carbohydrates_100g'] || 0),
        fat: Math.round(p.nutriments['fat_100g'] || 0),
      }));
  };

  const runSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    const searchTerm = query;
    try {
      let mapped = await fetchFoodResults(searchTerm);

      // Poznata mana starog Open Food Facts search.pl endpoint-a — prva
      // pretraga za novi pojam ponekad vrati 0 rezultata dok se ne "zagreje"
      // indeks na njihovoj strani. Tihi jedan retry pre nego što prikažemo
      // "No results", pa korisnik to skoro nikad ne primeti.
      if (mapped.length === 0) {
        await new Promise(resolve => setTimeout(resolve, 400));
        mapped = await fetchFoodResults(searchTerm);
      }

      setResults(mapped);
    } catch (e: any) {
      console.log('Food search error:', e.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: insertedMeal, error } = await supabase
        .from('meals')
        .insert({
          user_id: user.id,
          catalog_id: null,
          meal_type: meal_type || 'Snack',
          name: `${selected.name} (${gramsNum}g)`,
          calories: scaledCalories,
          protein_g: scaledProtein,
          carbs_g: scaledCarbs,
          fat_g: scaledFat,
          image_url: selected.imageUrl,
        })
        .select()
        .single();

      if (!error) {
        if (insertedMeal) {
          awardMealLogged(insertedMeal.id);
        }
        setSelected(null);
        router.dismissAll();
        router.setParams({ showModal: 'true' });
      } else {
        console.log('insert error:', error);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Search foods</Text>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={Colors.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="e.g. banana, greek yogurt, oat milk..."
          placeholderTextColor={Colors.textLight}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={runSearch}
          returnKeyType="search"
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.pink} style={{ marginTop: Spacing.xl }} />
      ) : results.length === 0 && searched ? (
        <View style={styles.emptyState}>
          <Ionicons name="nutrition-outline" size={40} color={Colors.textLight} />
          <Text style={styles.emptyText}>No foods found for "{query}"</Text>
          <Text style={styles.emptySubText}>Try a simpler or more general term.</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item, index) => item.code || String(index)}
          contentContainerStyle={{ padding: Spacing.screenPadding, gap: Spacing.sm }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultRow}
              activeOpacity={0.8}
              onPress={() => {
                setSelected(item);
                setGrams('100');
              }}
            >
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.resultImage} />
              ) : (
                <View style={[styles.resultImage, styles.resultImagePlaceholder]}>
                  <Ionicons name="nutrition-outline" size={20} color={Colors.textLight} />
                </View>
              )}
              <View style={styles.resultInfo}>
                <Text style={styles.resultName} numberOfLines={1}>{item.name}</Text>
                {!!item.brand && (
                  <Text style={styles.resultBrand} numberOfLines={1}>{item.brand}</Text>
                )}
                <Text style={styles.resultCal}>{item.calories} kcal / 100g</Text>
              </View>
              <Ionicons name="add-circle" size={26} color={Colors.pink} />
            </TouchableOpacity>
          )}
        />
      )}

      {/* CONFIRM MODAL */}
      <Modal
        visible={!!selected}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selected?.imageUrl ? (
                <Image source={{ uri: selected.imageUrl }} style={styles.modalImage} />
              ) : (
                <View style={[styles.modalImage, styles.resultImagePlaceholder]}>
                  <Ionicons name="nutrition-outline" size={32} color={Colors.textLight} />
                </View>
              )}
              <Text style={styles.modalTitle}>{selected?.name}</Text>
              {!!selected?.brand && <Text style={styles.modalBrand}>{selected.brand}</Text>}

                           <Text style={styles.modalNote}>How much are you having?</Text>

              <View style={styles.gramsRow}>
                <TouchableOpacity
                  style={styles.gramsStepButton}
                  onPress={() => setGrams(String(Math.max(0, gramsNum - 10)))}
                >
                  <Ionicons name="remove" size={18} color={Colors.textPrimary} />
                </TouchableOpacity>
                <TextInput
                  style={styles.gramsInput}
                  value={grams}
                  onChangeText={setGrams}
                  keyboardType="numeric"
                />
                <Text style={styles.gramsUnit}>g</Text>
                <TouchableOpacity
                  style={styles.gramsStepButton}
                  onPress={() => setGrams(String(gramsNum + 10))}
                >
                  <Ionicons name="add" size={18} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalNote}>Based on {selected?.calories} kcal per 100g</Text>

              <View style={styles.macroRow}>
                <View style={styles.macroBox}>
                  <Text style={styles.macroValue}>{scaledCalories}</Text>
                  <Text style={styles.macroLabel}>kcal</Text>
                </View>
                <View style={styles.macroBox}>
                  <Text style={styles.macroValue}>{scaledProtein}g</Text>
                  <Text style={styles.macroLabel}>Protein</Text>
                </View>
                <View style={styles.macroBox}>
                  <Text style={styles.macroValue}>{scaledCarbs}g</Text>
                  <Text style={styles.macroLabel}>Carbs</Text>
                </View>
                <View style={styles.macroBox}>
                  <Text style={styles.macroValue}>{scaledFat}g</Text>
                  <Text style={styles.macroLabel}>Fat</Text>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleAdd}
              disabled={saving}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmButtonText}>
                {saving ? 'Adding...' : `Add to ${meal_type || 'Diary'}`}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSelected(null)} style={styles.cancelLink}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
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
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    height: 46,
    borderRadius: Spacing.radiusMd,
    backgroundColor: '#F5F5F5',
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.textPrimary,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
  emptyText: {
    ...Typography.h3,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptySubText: {
    ...Typography.bodySmall,
    color: Colors.textLight,
    textAlign: 'center',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: Spacing.radiusMd,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.gray,
  },
  resultImage: {
    width: 52,
    height: 52,
    borderRadius: Spacing.radiusSm,
  },
  resultImagePlaceholder: {
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultInfo: { flex: 1, gap: 2 },
  resultName: {
    ...Typography.bodySmall,
    fontFamily: 'Montserrat_600SemiBold',
    color: Colors.textPrimary,
  },
  resultBrand: {
    ...Typography.caption,
    color: Colors.textLight,
  },
  resultCal: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontFamily: 'Montserrat_600SemiBold',
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
    padding: Spacing.lg,
    maxHeight: '85%',
  },
  modalImage: {
    width: '100%',
    height: 160,
    borderRadius: Spacing.radiusLg,
    marginBottom: Spacing.md,
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  modalBrand: {
    ...Typography.bodySmall,
    color: Colors.textLight,
    marginTop: 2,
  },
    modalNote: {
    ...Typography.caption,
    color: Colors.textLight,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  gramsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  gramsStepButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gramsInput: {
    ...Typography.h3,
    color: Colors.textPrimary,
    textAlign: 'center',
    minWidth: 60,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray,
  },
  gramsUnit: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  macroBox: {
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: Spacing.radiusSm,
    paddingVertical: Spacing.sm,
    flex: 1,
    marginHorizontal: 4,
  },
  macroValue: {
    ...Typography.body,
    fontFamily: 'Montserrat_700Bold',
    color: Colors.textPrimary,
  },
  macroLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  confirmButton: {
    backgroundColor: Colors.pink,
    paddingVertical: Spacing.md,
    borderRadius: Spacing.radiusFull,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  confirmButtonText: {
    ...Typography.button,
    color: Colors.white,
  },
  cancelLink: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  cancelText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
});