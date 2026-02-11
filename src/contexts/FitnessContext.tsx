import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface DietEntry {
  id: string;
  date: string;
  foodName: string;
  quantity: string;
  calories: number;
}

export interface WorkoutEntry {
  id: string;
  date: string;
  type: 'gym' | 'cardio' | 'yoga' | 'walking' | 'home';
  duration: number; // minutes
  caloriesBurned: number;
}

interface FitnessContextType {
  dietEntries: DietEntry[];
  workoutEntries: WorkoutEntry[];
  addDietEntry: (entry: Omit<DietEntry, 'id'>) => void;
  addWorkoutEntry: (entry: Omit<WorkoutEntry, 'id'>) => void;
  deleteDietEntry: (id: string) => void;
  deleteWorkoutEntry: (id: string) => void;
  getTodayCaloriesIn: () => number;
  getTodayCaloriesBurned: () => number;
  getWeeklyData: () => { date: string; caloriesIn: number; caloriesBurned: number }[];
}

const FitnessContext = createContext<FitnessContextType | null>(null);

export const useFitness = () => {
  const ctx = useContext(FitnessContext);
  if (!ctx) throw new Error('useFitness must be used within FitnessProvider');
  return ctx;
};

const today = () => new Date().toISOString().split('T')[0];

const getLast7Days = () => {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
};

export const FitnessProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const storageKey = user ? `fitgrad_fitness_${user.id}` : null;

  const [dietEntries, setDietEntries] = useState<DietEntry[]>([]);
  const [workoutEntries, setWorkoutEntries] = useState<WorkoutEntry[]>([]);

  useEffect(() => {
    if (storageKey) {
      const data = localStorage.getItem(storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        setDietEntries(parsed.diet || []);
        setWorkoutEntries(parsed.workouts || []);
      } else {
        // Seed some demo data
        const t = today();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const y = yesterday.toISOString().split('T')[0];
        setDietEntries([
          { id: '1', date: t, foodName: 'Oatmeal with Banana', quantity: '1 bowl', calories: 350 },
          { id: '2', date: t, foodName: 'Grilled Chicken Salad', quantity: '1 plate', calories: 450 },
          { id: '3', date: y, foodName: 'Protein Shake', quantity: '1 glass', calories: 280 },
          { id: '4', date: y, foodName: 'Rice & Dal', quantity: '1 plate', calories: 520 },
        ]);
        setWorkoutEntries([
          { id: '1', date: t, type: 'gym', duration: 45, caloriesBurned: 320 },
          { id: '2', date: y, type: 'cardio', duration: 30, caloriesBurned: 250 },
          { id: '3', date: y, type: 'yoga', duration: 20, caloriesBurned: 100 },
        ]);
      }
    }
  }, [storageKey]);

  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify({ diet: dietEntries, workouts: workoutEntries }));
    }
  }, [dietEntries, workoutEntries, storageKey]);

  const addDietEntry = (entry: Omit<DietEntry, 'id'>) => {
    setDietEntries(prev => [...prev, { ...entry, id: crypto.randomUUID() }]);
  };

  const addWorkoutEntry = (entry: Omit<WorkoutEntry, 'id'>) => {
    setWorkoutEntries(prev => [...prev, { ...entry, id: crypto.randomUUID() }]);
  };

  const deleteDietEntry = (id: string) => setDietEntries(prev => prev.filter(e => e.id !== id));
  const deleteWorkoutEntry = (id: string) => setWorkoutEntries(prev => prev.filter(e => e.id !== id));

  const getTodayCaloriesIn = () =>
    dietEntries.filter(e => e.date === today()).reduce((sum, e) => sum + e.calories, 0);

  const getTodayCaloriesBurned = () =>
    workoutEntries.filter(e => e.date === today()).reduce((sum, e) => sum + e.caloriesBurned, 0);

  const getWeeklyData = () => {
    const days = getLast7Days();
    return days.map(date => ({
      date,
      caloriesIn: dietEntries.filter(e => e.date === date).reduce((s, e) => s + e.calories, 0),
      caloriesBurned: workoutEntries.filter(e => e.date === date).reduce((s, e) => s + e.caloriesBurned, 0),
    }));
  };

  return (
    <FitnessContext.Provider value={{
      dietEntries, workoutEntries, addDietEntry, addWorkoutEntry,
      deleteDietEntry, deleteWorkoutEntry, getTodayCaloriesIn, getTodayCaloriesBurned, getWeeklyData,
    }}>
      {children}
    </FitnessContext.Provider>
  );
};
