import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import { useProfile } from './PorifleProvider';
import {
  gamificationService,
  getLevelInfo,
  Achievement,
  AchievementWithStatus,
  ChallengeLevelWithStatus,
  NewlyUnlockedChallenge,
  WeeklyQuest,
  LevelInfo,
  STREAK_MILESTONES,
} from '../services/gamification';

/** Synthetic "achievement-like" object for streak celebrations — doesn't
 * exist in the DB, built client-side when current_streak crosses one of
 * STREAK_MILESTONES, rendered through the same StreakMilestoneModal shape
 * as real achievements. */
export type StreakMilestone = {
  days: number;
  title: string;
  description: string;
  icon: string;
};

function buildStreakMilestone(days: number): StreakMilestone {
  return {
    days,
    title: `${days}-day streak!`,
    description: `You've kept it going for ${days} days straight. Keep it up!`,
    icon: 'flame',
  };
}

export type LevelUpEvent = {
  level: number;
};

export type PerfectWeekEvent = {
  xpAwarded: number;
};

export type TodayScore = {
  score: number;
  workout_completed: boolean;
  calories_completed: boolean;
  steps_completed: boolean;
} | null;

interface GamificationContextType {
  totalPoints: number;
  levelInfo: LevelInfo;
  achievements: AchievementWithStatus[];
  currentStreak: number;
  longestStreak: number;
  challengeLevels: ChallengeLevelWithStatus[];
  weeklyQuest: WeeklyQuest | null;
  todayScore: TodayScore;
  todayCalories: number;
  loading: boolean;
  unlockQueue: Achievement[];
  challengeUnlockQueue: NewlyUnlockedChallenge[];
  streakMilestoneQueue: StreakMilestone[];
  levelUpQueue: LevelUpEvent[];
  perfectWeekQueue: PerfectWeekEvent[];
  refresh: () => Promise<void>;
  awardWorkoutCompleted: (workoutId: string) => Promise<void>;
  awardMealLogged: (mealId: string) => Promise<void>;
  awardStepsGoal: () => Promise<void>;
  awardPerfectDay: () => Promise<void>;
  refreshTodayGoals: () => Promise<void>;
  claimWeeklyQuest: () => Promise<void>;
  dismissUnlock: () => void;
  dismissChallengeUnlock: () => void;
  dismissStreakMilestone: () => void;
  dismissLevelUp: () => void;
  dismissPerfectWeek: () => void;
}

const GamificationContext = createContext<GamificationContextType | null>(null);

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const { dailyCalorieGoal, todaySteps } = useProfile();

  const [totalPoints, setTotalPoints] = useState(0);
  const [achievements, setAchievements] = useState<AchievementWithStatus[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [challengeLevels, setChallengeLevels] = useState<ChallengeLevelWithStatus[]>([]);
  const [weeklyQuest, setWeeklyQuest] = useState<WeeklyQuest | null>(null);
  const [todayScore, setTodayScore] = useState<TodayScore>(null);
  const [todayCalories, setTodayCalories] = useState(0);
  const [loading, setLoading] = useState(true);
  const [unlockQueue, setUnlockQueue] = useState<Achievement[]>([]);
  const [challengeUnlockQueue, setChallengeUnlockQueue] = useState<NewlyUnlockedChallenge[]>([]);
  const [streakMilestoneQueue, setStreakMilestoneQueue] = useState<StreakMilestone[]>([]);
  const [levelUpQueue, setLevelUpQueue] = useState<LevelUpEvent[]>([]);
  const [perfectWeekQueue, setPerfectWeekQueue] = useState<PerfectWeekEvent[]>([]);

  const totalPointsRef = useRef(totalPoints);
  useEffect(() => {
    totalPointsRef.current = totalPoints;
  }, [totalPoints]);

  const refresh = useCallback(async () => {
    try {
      const [points, allAchievements, streak, levels, quest] = await Promise.all([
        gamificationService.getMyTotalPoints(),
        gamificationService.getAllAchievementsWithStatus(),
        gamificationService.getMyStreak(),
        gamificationService.getAllChallengeLevelsWithStatus(),
        gamificationService.getOrAssignWeeklyQuest(),
      ]);
      setTotalPoints(points);
      setAchievements(allAchievements);
      setCurrentStreak(streak.currentStreak);
      setLongestStreak(streak.longestStreak);
      setChallengeLevels(levels);
      setWeeklyQuest(quest);
    } catch (e: any) {
      console.log('GamificationContext refresh error:', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const applyNewTotalPoints = useCallback((newTotal: number) => {
    const prevLevel = getLevelInfo(totalPointsRef.current).level;
    const nextLevel = getLevelInfo(newTotal).level;
    setTotalPoints(newTotal);

    if (nextLevel > prevLevel) {
      const crossed: LevelUpEvent[] = [];
      for (let lvl = prevLevel + 1; lvl <= nextLevel; lvl++) {
        crossed.push({ level: lvl });
      }
      setLevelUpQueue(prev => [...prev, ...crossed]);
    }
  }, []);

  const handleAward = useCallback(
    async (
      action: () => Promise<{
        newTotalPoints: number | null;
        newlyUnlocked: Achievement[];
        newlyUnlockedChallenges: NewlyUnlockedChallenge[];
      }>
    ) => {
      const result = await action();
      if (result.newTotalPoints !== null) {
        applyNewTotalPoints(result.newTotalPoints);
      }
      if (result.newlyUnlocked.length > 0) {
        setUnlockQueue(prev => [...prev, ...result.newlyUnlocked]);
      }
      if (result.newlyUnlockedChallenges.length > 0) {
        setChallengeUnlockQueue(prev => [...prev, ...result.newlyUnlockedChallenges]);
      }
      if (result.newlyUnlocked.length > 0 || result.newlyUnlockedChallenges.length > 0) {
        refresh();
      }
    },
    [refresh, applyNewTotalPoints]
  );

  const awardWorkoutCompleted = useCallback(
    (workoutId: string) => handleAward(() => gamificationService.awardWorkoutCompleted(workoutId)),
    [handleAward]
  );
  const awardMealLogged = useCallback(
    (mealId: string) => handleAward(() => gamificationService.awardMealLogged(mealId)),
    [handleAward]
  );
  const awardStepsGoal = useCallback(
    () => handleAward(() => gamificationService.awardStepsGoal()),
    [handleAward]
  );
  const awardPerfectDay = useCallback(
    () => handleAward(() => gamificationService.awardPerfectDay()),
    [handleAward]
  );

  const syncDailyStreak = useCallback(async () => {
    const prevStreak = currentStreak;
    const result = await gamificationService.updateStreak();
    setCurrentStreak(result.currentStreak);
    setLongestStreak(result.longestStreak);

    const crossedMilestones = STREAK_MILESTONES.filter(
      m => result.currentStreak >= m && prevStreak < m
    );
    if (crossedMilestones.length > 0) {
      setStreakMilestoneQueue(prev => [
        ...prev,
        ...crossedMilestones.map(buildStreakMilestone),
      ]);
    }

    const perfectWeek = await gamificationService.claimPerfectWeek();
    if (perfectWeek.awarded) {
      applyNewTotalPoints(perfectWeek.newTotalPoints);
      setPerfectWeekQueue(prev => [...prev, { xpAwarded: perfectWeek.xpAwarded }]);
    }

    const quest = await gamificationService.getOrAssignWeeklyQuest();
    setWeeklyQuest(quest);
  }, [currentStreak, applyNewTotalPoints]);

  const todayScoreRef = useRef<TodayScore>(todayScore);
  useEffect(() => {
    todayScoreRef.current = todayScore;
  }, [todayScore]);

  const refreshTodayGoals = useCallback(async () => {
    console.log('[Gamification] refreshTodayGoals starting...');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('[Gamification] no user, aborting');
        return;
      }

      const date = new Date().toISOString().split('T')[0];

      const { data: workouts } = await supabase
        .from('workouts')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', `${date}T00:00:00`)
        .lte('created_at', `${date}T23:59:59`);

      const { data: mealsToday } = await supabase
        .from('meals')
        .select('calories')
        .eq('user_id', user.id)
        .gte('created_at', `${date}T00:00:00`)
        .lte('created_at', `${date}T23:59:59`);

      const totalCalories = mealsToday?.reduce((sum, m) => sum + (m.calories || 0), 0) || 0;
      const calorieGoal = dailyCalorieGoal || 2000;
      setTodayCalories(totalCalories);

      const workoutCompleted = (workouts?.length || 0) > 0;
      const caloriesCompleted = totalCalories >= calorieGoal * 0.8 && totalCalories <= calorieGoal * 1.2;
      const stepsCompleted = todaySteps >= 10000;

      let score = 0;
      if (workoutCompleted) score += 40;
      if (caloriesCompleted) score += 40;
      score += stepsCompleted ? 20 : Math.min(20, Math.floor((todaySteps / 10000) * 20));

            const prevRow = todayScoreRef.current;

      const { data: newScore, error: upsertError } = await supabase
        .from('daily_scores')
        .upsert(
          {
            user_id: user.id,
            date,
            calories_completed: caloriesCompleted,
            workout_completed: workoutCompleted,
            steps_completed: stepsCompleted,
            score,
          },
          { onConflict: 'user_id,date' }
        )
        .select()
        .single();

      if (upsertError) {
        console.log('[Gamification] daily_scores upsert error:', upsertError.message);
      }

      console.log('[Gamification] setting todayScore:', newScore);
      setTodayScore(newScore);
      await syncDailyStreak();

      const wasStepsCompleted = !!prevRow?.steps_completed;
      const wasPerfectDay = !!(
        prevRow?.workout_completed && prevRow?.calories_completed && prevRow?.steps_completed
      );
      const isPerfectDayNow = workoutCompleted && caloriesCompleted && stepsCompleted;

      if (stepsCompleted && !wasStepsCompleted) {
        awardStepsGoal();
      }
      if (isPerfectDayNow && !wasPerfectDay) {
        awardPerfectDay();
      }
    } catch (e: any) {
      console.log('refreshTodayGoals error:', e.message);
    }
  }, [dailyCalorieGoal, todaySteps, syncDailyStreak, awardStepsGoal, awardPerfectDay]);

  useEffect(() => {
    refreshTodayGoals();
  }, [refreshTodayGoals]);

  const claimWeeklyQuest = useCallback(async () => {
    const result = await gamificationService.claimWeeklyQuestReward();
    if (result.claimed) {
      applyNewTotalPoints(result.newTotalPoints);
      const quest = await gamificationService.getOrAssignWeeklyQuest();
      setWeeklyQuest(quest);
    }
  }, [applyNewTotalPoints]);

  const dismissUnlock = useCallback(() => {
    setUnlockQueue(prev => prev.slice(1));
  }, []);
  const dismissChallengeUnlock = useCallback(() => {
    setChallengeUnlockQueue(prev => prev.slice(1));
  }, []);
  const dismissStreakMilestone = useCallback(() => {
    setStreakMilestoneQueue(prev => prev.slice(1));
  }, []);
  const dismissLevelUp = useCallback(() => {
    setLevelUpQueue(prev => prev.slice(1));
  }, []);
  const dismissPerfectWeek = useCallback(() => {
    setPerfectWeekQueue(prev => prev.slice(1));
  }, []);

  const levelInfo = getLevelInfo(totalPoints);

  return (
    <GamificationContext.Provider
      value={{
        totalPoints,
        levelInfo,
        achievements,
        currentStreak,
        longestStreak,
        challengeLevels,
        weeklyQuest,
        todayScore,
        todayCalories,
        loading,
        unlockQueue,
        challengeUnlockQueue,
        streakMilestoneQueue,
        levelUpQueue,
        perfectWeekQueue,
        refresh,
        awardWorkoutCompleted,
        awardMealLogged,
        awardStepsGoal,
        awardPerfectDay,
        refreshTodayGoals,
        claimWeeklyQuest,
        dismissUnlock,
        dismissChallengeUnlock,
        dismissStreakMilestone,
        dismissLevelUp,
        dismissPerfectWeek,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const ctx = useContext(GamificationContext);
  if (!ctx) throw new Error('useGamification must be used inside GamificationProvider');
  return ctx;
}