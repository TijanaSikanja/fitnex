import { supabase } from './supabase';

export type AchievementCategory = 'workout' | 'nutrition' | 'steps' | 'streak' | 'general';

export type Achievement = {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  criteria_type: string;
  criteria_value: number;
  xp_reward: number;
  sort_order: number;
};

export type AchievementWithStatus = Achievement & {
  unlocked: boolean;
  unlocked_at: string | null;
};

export type PointTransaction = {
  id: string;
  points: number;
  reason: PointReason;
  reference_id: string | null;
  created_at: string;
};

export type PointReason =
  | 'workout_completed'
  | 'meal_logged'
  | 'steps_goal'
  | 'perfect_day'
  | 'achievement_unlocked';

export type LevelInfo = {
  level: number;
  totalPoints: number;
  currentLevelStart: number;
  nextLevelStart: number;
  xpIntoLevel: number;
  xpNeededForLevel: number;
  progress: number; // 0..1
};

// Nagrade za pojedinačne akcije (drži ih ovde na jednom mestu radi lakšeg
// balansiranja/menjanja u budućnosti, bez petljanja po ekranima).
export const POINTS = {
  WORKOUT_COMPLETED: 50,
  MEAL_LOGGED: 15,
  STEPS_GOAL: 30,
  PERFECT_DAY: 25,
} as const;

// ============================================================================
// Nivo — čista funkcija, bez odlaska u bazu (ista formula je ogledana i u
// SQL view-u `user_levels` radi konzistentnosti sa admin/SQL uvidom).
// Nivo L počinje na 100 * L * (L-1) poena: L1=0, L2=200, L3=600, L4=1200, L5=2000 ...
// ============================================================================
export function getLevelInfo(totalPoints: number): LevelInfo {
  const p = Math.max(0, totalPoints || 0);
  const level = Math.max(1, Math.floor((1 + Math.sqrt(1 + p / 25)) / 2));
  const currentLevelStart = 100 * level * (level - 1);
  const nextLevelStart = 100 * (level + 1) * level;
  const xpIntoLevel = p - currentLevelStart;
  const xpNeededForLevel = nextLevelStart - currentLevelStart;
  const progress = xpNeededForLevel > 0 ? Math.min(1, Math.max(0, xpIntoLevel / xpNeededForLevel)) : 1;
  return { level, totalPoints: p, currentLevelStart, nextLevelStart, xpIntoLevel, xpNeededForLevel, progress };
}

// ============================================================================
// Čitanje podataka
// ============================================================================

export async function getMyTotalPoints(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data, error } = await supabase
    .from('profiles')
    .select('total_points')
    .eq('id', user.id)
    .single();

  if (error) {
    console.log('getMyTotalPoints error:', error.message);
    return 0;
  }
  return data?.total_points || 0;
}

export async function getAllAchievementsWithStatus(): Promise<AchievementWithStatus[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const [{ data: achievements, error: achErr }, { data: unlocked, error: unlErr }] = await Promise.all([
    supabase.from('achievements').select('*').order('sort_order', { ascending: true }),
    supabase.from('user_achievements').select('achievement_id, unlocked_at').eq('user_id', user.id),
  ]);

  if (achErr) console.log('getAllAchievementsWithStatus achievements error:', achErr.message);
  if (unlErr) console.log('getAllAchievementsWithStatus user_achievements error:', unlErr.message);

  const unlockedMap = new Map<string, string>();
  (unlocked || []).forEach(u => unlockedMap.set(u.achievement_id, u.unlocked_at));

  return (achievements || []).map((a: Achievement) => ({
    ...a,
    unlocked: unlockedMap.has(a.id),
    unlocked_at: unlockedMap.get(a.id) || null,
  }));
}

export async function getRecentPointTransactions(limit = 10): Promise<PointTransaction[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('point_transactions')
    .select('id, points, reason, reference_id, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.log('getRecentPointTransactions error:', error.message);
    return [];
  }
  return data || [];
}

// ============================================================================
// Pisanje podataka — sve ide preko Postgres funkcija (award_points /
// check_achievements), nikad direktnim insertom/update-om sa klijenta.
// ============================================================================

async function callAwardPoints(points: number, reason: PointReason, referenceId?: string | null) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.rpc('award_points', {
    p_user_id: user.id,
    p_points: points,
    p_reason: reason,
    p_reference_id: referenceId ?? null,
  });

  if (error) {
    console.log('award_points RPC error:', error.message);
    return null;
  }
  return data as number; // novi total_points
}

async function callCheckAchievements(): Promise<Achievement[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase.rpc('check_achievements', {
    p_user_id: user.id,
  });

  if (error) {
    console.log('check_achievements RPC error:', error.message);
    return [];
  }
  return (data || []) as Achievement[];
}

export type AwardResult = {
  newTotalPoints: number | null;
  newlyUnlocked: Achievement[];
};


async function awardAndCheck(points: number, reason: PointReason, referenceId?: string | null): Promise<AwardResult> {
  const newTotalPoints = await callAwardPoints(points, reason, referenceId);
  const newlyUnlocked = await callCheckAchievements();
  return { newTotalPoints, newlyUnlocked };
}

export const gamificationService = {
  awardWorkoutCompleted: (workoutId: string) =>
    awardAndCheck(POINTS.WORKOUT_COMPLETED, 'workout_completed', workoutId),

  awardMealLogged: (mealId: string) =>
    awardAndCheck(POINTS.MEAL_LOGGED, 'meal_logged', mealId),

  awardStepsGoal: () =>
    awardAndCheck(POINTS.STEPS_GOAL, 'steps_goal', null),

  awardPerfectDay: () =>
    awardAndCheck(POINTS.PERFECT_DAY, 'perfect_day', null),

  /** Samo proveri dostignuća bez dodele dodatnih poena (npr. pri otvaranju profila). */
  checkAchievementsOnly: () => callCheckAchievements(),

  getMyTotalPoints,
  getAllAchievementsWithStatus,
  getRecentPointTransactions,
  getLevelInfo,
};