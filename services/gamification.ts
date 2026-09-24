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
export type WeeklyQuest = {
  id: string; // red user_weekly_quests
  quest_id: string;
  quest_type: 'workouts' | 'meals' | 'steps_days' | 'perfect_days';
  target_count: number;
  xp_reward: number;
  title: string;
  description: string;
  icon: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
};

export type ClaimResult = {
  claimed: boolean;
  xpAwarded: number;
  newTotalPoints: number;
};

export type PerfectWeekResult = {
  awarded: boolean;
  xpAwarded: number;
  newTotalPoints: number;
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

export const POINTS = {
  WORKOUT_COMPLETED: 50,
  MEAL_LOGGED: 15,
  STEPS_GOAL: 30,
  PERFECT_DAY: 25,
} as const;

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

export type Recipe = {
  id: string;
  title: string;
  description: string;
  ingredients: string;
  instructions: string;
  calories: number;
  prep_time_minutes: number;
  icon: string;
  image_url: string | null;
};

export type ChallengeLevel = {
  id: string;
  level_number: number;
  title: string;
  points_required: number;
  recipe_id: string | null;
  icon: string;
  recipe: Recipe | null;
};

export type ChallengeLevelWithStatus = ChallengeLevel & {
  unlocked: boolean;
  unlocked_at: string | null;
};

export type NewlyUnlockedChallenge = {
  id: string;
  level_number: number;
  title: string;
  points_required: number;
  recipe_id: string | null;
  icon: string;
  recipe_title: string | null;
  recipe_description: string | null;
  recipe_icon: string | null;
};

export type StreakInfo = {
  currentStreak: number;
  longestStreak: number;
};

// Prag (u dostignutim danima zaredom) na kojima se korisniku prikazuje
// proslavni modal. Ne piše ništa dodatno u bazu — samo klijentska
// detekcija prelaska praga, na osnovu prethodnog i novog current_streak.
export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 180, 365] as const;


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

export async function getMyStreak(): Promise<StreakInfo> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { currentStreak: 0, longestStreak: 0 };

  const { data, error } = await supabase
    .from('profiles')
    .select('current_streak, longest_streak')
    .eq('id', user.id)
    .single();

  if (error) {
    console.log('getMyStreak error:', error.message);
    return { currentStreak: 0, longestStreak: 0 };
  }
  return {
    currentStreak: data?.current_streak || 0,
    longestStreak: data?.longest_streak || 0,
  };
}

export async function getAllChallengeLevelsWithStatus(): Promise<ChallengeLevelWithStatus[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const [{ data: levels, error: lvlErr }, { data: unlocked, error: unlErr }] = await Promise.all([
    supabase
      .from('challenge_levels')
      .select('*, recipe:recipes(*)')
      .order('level_number', { ascending: true }),
    supabase
      .from('user_challenge_unlocks')
      .select('challenge_level_id, unlocked_at')
      .eq('user_id', user.id),
  ]);

  if (lvlErr) console.log('getAllChallengeLevelsWithStatus levels error:', lvlErr.message);
  if (unlErr) console.log('getAllChallengeLevelsWithStatus unlocks error:', unlErr.message);

  const unlockedMap = new Map<string, string>();
  (unlocked || []).forEach(u => unlockedMap.set(u.challenge_level_id, u.unlocked_at));

  return (levels || []).map((lvl: any) => ({
    ...lvl,
    unlocked: unlockedMap.has(lvl.id),
    unlocked_at: unlockedMap.get(lvl.id) || null,
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

async function callUpdateStreak(): Promise<StreakInfo & { isNewRecord: boolean }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { currentStreak: 0, longestStreak: 0, isNewRecord: false };

  const { data, error } = await supabase.rpc('update_streak', { p_user_id: user.id });

  if (error) {
    console.log('update_streak RPC error:', error.message);
    return { currentStreak: 0, longestStreak: 0, isNewRecord: false };
  }
  const row = Array.isArray(data) ? data[0] : data;
  return {
    currentStreak: row?.current_streak || 0,
    longestStreak: row?.longest_streak || 0,
    isNewRecord: !!row?.is_new_record,
  };
}

async function callCheckChallengeLevels(): Promise<NewlyUnlockedChallenge[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase.rpc('check_challenge_levels', {
    p_user_id: user.id,
  });

  if (error) {
    console.log('check_challenge_levels RPC error:', error.message);
    return [];
  }
  return (data || []) as NewlyUnlockedChallenge[];
}

async function callGetOrAssignWeeklyQuest(): Promise<WeeklyQuest | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.rpc('get_or_assign_weekly_quest', {
    p_user_id: user.id,
  });

  if (error) {
    console.log('get_or_assign_weekly_quest RPC error:', error.message);
    return null;
  }
  const row = Array.isArray(data) ? data[0] : data;
  return row || null;
}

async function callClaimWeeklyQuestReward(): Promise<ClaimResult> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { claimed: false, xpAwarded: 0, newTotalPoints: 0 };

  const { data, error } = await supabase.rpc('claim_weekly_quest_reward', {
    p_user_id: user.id,
  });

  if (error) {
    console.log('claim_weekly_quest_reward RPC error:', error.message);
    return { claimed: false, xpAwarded: 0, newTotalPoints: 0 };
  }
  const row = Array.isArray(data) ? data[0] : data;
  return {
    claimed: !!row?.claimed,
    xpAwarded: row?.xp_awarded || 0,
    newTotalPoints: row?.new_total_points || 0,
  };
}

async function callClaimPerfectWeek(): Promise<PerfectWeekResult> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { awarded: false, xpAwarded: 0, newTotalPoints: 0 };

  const { data, error } = await supabase.rpc('claim_perfect_week', {
    p_user_id: user.id,
  });

  if (error) {
    console.log('claim_perfect_week RPC error:', error.message);
    return { awarded: false, xpAwarded: 0, newTotalPoints: 0 };
  }
  const row = Array.isArray(data) ? data[0] : data;
  return {
    awarded: !!row?.awarded,
    xpAwarded: row?.xp_awarded || 0,
    newTotalPoints: row?.new_total_points || 0,
  };
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
  newlyUnlockedChallenges: NewlyUnlockedChallenge[];
};


async function awardAndCheck(points: number, reason: PointReason, referenceId?: string | null): Promise<AwardResult> {
  const newTotalPoints = await callAwardPoints(points, reason, referenceId);
  // total_points se menja tek nakon award_points-a, pa se dostignuća i
  // otključavanje nivoa izazova (koji zavisi od total_points) proveravaju
  // odmah nakon toga, u istom pozivu.
  const [newlyUnlocked, newlyUnlockedChallenges] = await Promise.all([
    callCheckAchievements(),
    callCheckChallengeLevels(),
  ]);
  return { newTotalPoints, newlyUnlocked, newlyUnlockedChallenges };
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

  checkAchievementsOnly: () => callCheckAchievements(),

  
  updateStreak: () => callUpdateStreak(),

 
  getOrAssignWeeklyQuest: () => callGetOrAssignWeeklyQuest(),

 
  claimWeeklyQuestReward: () => callClaimWeeklyQuestReward(),

  
  claimPerfectWeek: () => callClaimPerfectWeek(),

  getMyTotalPoints,
  getAllAchievementsWithStatus,
  getRecentPointTransactions,
  getLevelInfo,
  getMyStreak,
  getAllChallengeLevelsWithStatus,
};