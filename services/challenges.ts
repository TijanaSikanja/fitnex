import { supabase } from './supabase';
import { getLevelInfo } from './gamification';

export type Recipe = {
  id: string;
  title: string;
  description: string;
  ingredients: string;      // stavke odvojene sa \n
  instructions: string;     // koraci odvojeni sa \n
  calories: number;
  prep_time_minutes: number;
  icon: string;
};

export type ChallengeLevel = {
  id: string;
  level_number: number;
  title: string;
  points_required: number;
  icon: string;
  recipe: Recipe;
};

export type ChallengeLevelWithStatus = ChallengeLevel & {
  unlocked: boolean;
  isCurrent: boolean; // prvi zaključan nivo — "ti si ovde"
};

export type FriendChallengeProgress = {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  total_points: number;
  level_number: number; // trenutni nivo na mapi izazova (0 ako nijedan)
  is_me: boolean;
};



export async function getChallengeLevelsWithStatus(): Promise<ChallengeLevelWithStatus[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const [{ data: levels, error: levelsErr }, { data: profile, error: profileErr }] = await Promise.all([
    supabase
      .from('challenge_levels')
      .select('*, recipe:recipes(*)')
      .order('level_number', { ascending: true }),
    supabase.from('profiles').select('total_points').eq('id', user.id).single(),
  ]);

  if (levelsErr) console.log('getChallengeLevelsWithStatus levels error:', levelsErr.message);
  if (profileErr) console.log('getChallengeLevelsWithStatus profile error:', profileErr.message);

  const totalPoints = profile?.total_points || 0;
  let foundCurrent = false;

  return (levels || []).map((lvl: any) => {
    const unlocked = totalPoints >= lvl.points_required;
    const isCurrent = !unlocked && !foundCurrent;
    if (isCurrent) foundCurrent = true;
    return { ...lvl, unlocked, isCurrent };
  });
}

/** Koliko je otključanih recepata trenutno korisnik osvojio. */
export async function getUnlockedRecipes(): Promise<Recipe[]> {
  const levels = await getChallengeLevelsWithStatus();
  return levels.filter(l => l.unlocked).map(l => l.recipe);
}

// ============================================================================
// Rang lista prijatelja PO NIVOU MAPE IZAZOVA (u real-time preko total_points)
// ============================================================================

export async function getFriendsChallengeProgress(): Promise<FriendChallengeProgress[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const [{ data: leaderboard, error: lbErr }, { data: levels, error: lvlErr }] = await Promise.all([
    supabase.rpc('get_friends_leaderboard'),
    supabase.from('challenge_levels').select('level_number, points_required').order('level_number'),
  ]);

  if (lbErr) console.log('getFriendsChallengeProgress leaderboard error:', lbErr.message);
  if (lvlErr) console.log('getFriendsChallengeProgress levels error:', lvlErr.message);

  const sortedLevels = (levels || []).sort((a, b) => a.level_number - b.level_number);

  const levelForPoints = (points: number) => {
    let current = 0;
    for (const lvl of sortedLevels) {
      if (points >= lvl.points_required) current = lvl.level_number;
    }
    return current;
  };

  return (leaderboard || [])
    .map((entry: any) => ({
      user_id: entry.user_id,
      full_name: entry.full_name,
      avatar_url: entry.avatar_url,
      total_points: entry.total_points,
      level_number: levelForPoints(entry.total_points),
      is_me: entry.is_me,
    }))
    .sort((a: FriendChallengeProgress, b: FriendChallengeProgress) => b.level_number - a.level_number || b.total_points - a.total_points);
}

export const challengesService = {
  getChallengeLevelsWithStatus,
  getUnlockedRecipes,
  getFriendsChallengeProgress,
};