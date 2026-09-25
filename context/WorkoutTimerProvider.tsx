import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { Alert } from 'react-native';

interface WorkoutTimerContextType {
  workoutTitle: string | null;
  timeLeft: number;
  isRunning: boolean;
  isActive: boolean; // true dok god ima aktivan/pauziran tajmer za neki trening
  startTimer: (title: string, totalSeconds: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
}

const WorkoutTimerContext = createContext<WorkoutTimerContextType | null>(null);

export function WorkoutTimerProvider({ children }: { children: React.ReactNode }) {
  const [workoutTitle, setWorkoutTitle] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const totalSecondsRef = useRef(0);
  const intervalRef = useRef<any>(null);

  const clearTimerInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startTimer = useCallback((title: string, totalSeconds: number) => {
    clearTimerInterval();
    totalSecondsRef.current = totalSeconds;
    setWorkoutTitle(title);
    setTimeLeft(totalSeconds);
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearTimerInterval();
          setIsRunning(false);
          setWorkoutTitle(null);
          Alert.alert('🎉 Workout finished!', 'Great job! You killed it!');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const pauseTimer = useCallback(() => {
    clearTimerInterval();
    setIsRunning(false);
  }, []);

  const resumeTimer = useCallback(() => {
    if (isRunning || timeLeft <= 0) return;
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearTimerInterval();
          setIsRunning(false);
          setWorkoutTitle(null);
          Alert.alert('🎉 Workout finished!', 'Great job! You killed it!');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [isRunning, timeLeft]);

  const stopTimer = useCallback(() => {
    clearTimerInterval();
    setIsRunning(false);
    setWorkoutTitle(null);
    setTimeLeft(0);
  }, []);

  return (
    <WorkoutTimerContext.Provider
      value={{
        workoutTitle,
        timeLeft,
        isRunning,
        isActive: !!workoutTitle,
        startTimer,
        pauseTimer,
        resumeTimer,
        stopTimer,
      }}
    >
      {children}
    </WorkoutTimerContext.Provider>
  );
}

export function useWorkoutTimer() {
  const ctx = useContext(WorkoutTimerContext);
  if (!ctx) throw new Error('useWorkoutTimer must be used inside WorkoutTimerProvider');
  return ctx;
}