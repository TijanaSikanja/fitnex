import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  gamificationService,
  getLevelInfo,
  Achievement,
  AchievementWithStatus,
  LevelInfo,
  PointReason,
} from '../services/gamification';

interface GamificationContextType {
  totalPoints: number;
  levelInfo: LevelInfo;
  achievements: AchievementWithStatus[];
  loading: boolean;
  /** Red čekanja dostignuća koja tek treba prikazati korisniku (modal). */
  unlockQueue: Achievement[];
  refresh: () => Promise<void>;
  awardWorkoutCompleted: (workoutId: string) => Promise<void>;
  awardMealLogged: (mealId: string) => Promise<void>;
  awardStepsGoal: () => Promise<void>;
  awardPerfectDay: () => Promise<void>;
  dismissUnlock: () => void;
}

const GamificationContext = createContext<GamificationContextType | null>(null);

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const [totalPoints, setTotalPoints] = useState(0);
  const [achievements, setAchievements] = useState<AchievementWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlockQueue, setUnlockQueue] = useState<Achievement[]>([]);

  const refresh = useCallback(async () => {
    try {
      const [points, allAchievements] = await Promise.all([
        gamificationService.getMyTotalPoints(),
        gamificationService.getAllAchievementsWithStatus(),
      ]);
      setTotalPoints(points);
      setAchievements(allAchievements);
    } catch (e: any) {
      console.log('GamificationContext refresh error:', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleAward = useCallback(
    async (action: () => Promise<{ newTotalPoints: number | null; newlyUnlocked: Achievement[] }>) => {
      const result = await action();
      if (result.newTotalPoints !== null) {
        setTotalPoints(result.newTotalPoints);
      }
      if (result.newlyUnlocked.length > 0) {
        setUnlockQueue(prev => [...prev, ...result.newlyUnlocked]);
        // Osveži katalog dostignuća i (mogući) dodatni XP dobijen za njih.
        refresh();
      }
    },
    [refresh]
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

  const dismissUnlock = useCallback(() => {
    setUnlockQueue(prev => prev.slice(1));
  }, []);

  const levelInfo = getLevelInfo(totalPoints);

  return (
    <GamificationContext.Provider
      value={{
        totalPoints,
        levelInfo,
        achievements,
        loading,
        unlockQueue,
        refresh,
        awardWorkoutCompleted,
        awardMealLogged,
        awardStepsGoal,
        awardPerfectDay,
        dismissUnlock,
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