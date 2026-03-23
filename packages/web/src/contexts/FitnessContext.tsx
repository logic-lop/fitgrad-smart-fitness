import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { dietAPI, workoutAPI } from '../lib/api';

export interface DietEntry {
  id: string;
  date: string;
  foodName: string;
  quantity: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
}

export interface WorkoutEntry {
  id: string;
  date: string;
  type: 'gym' | 'cardio' | 'yoga' | 'walking' | 'home';
  duration: number;
  calories: number;
}

interface FitnessContextType {
  dietEntries: DietEntry[];
  workoutEntries: WorkoutEntry[];
  addDietEntry: (entry: Omit<DietEntry, 'id'>) => Promise<void>;
  updateDietEntry: (id: string, updates: Partial<Omit<DietEntry, 'id' | 'date'>>) => Promise<void>;
  addWorkoutEntry: (entry: Omit<WorkoutEntry, 'id'>) => Promise<void>;
  updateWorkoutEntry: (id: string, updates: Partial<Omit<WorkoutEntry, 'id' | 'date'>>) => Promise<void>;
  deleteDietEntry: (id: string) => Promise<void>;
  deleteWorkoutEntry: (id: string) => Promise<void>;
  getTodayCaloriesIn: () => number;
  getTodayCaloriesBurned: () => number;
  getTodayNutrition: () => { protein: number; carbs: number; fat: number; fiber: number };
  getWeeklyData: () => { date: string; caloriesIn: number; caloriesBurned: number }[];
  getActiveDays: () => Set<string>;
  loadData: () => Promise<void>;
  isLoading: boolean;
}

const FitnessContext = createContext<FitnessContextType | null>(null);

export const useFitness = () => {
  const ctx = useContext(FitnessContext);
  if (!ctx) throw new Error('useFitness must be used within FitnessProvider');
  return ctx;
};

const todayStr = () => new Date().toISOString().split('T')[0];

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
  const { isAuthenticated } = useAuth();

  const [dietEntries, setDietEntries] = useState<DietEntry[]>([]);
  const [workoutEntries, setWorkoutEntries] = useState<WorkoutEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const [dietRes, workoutRes] = await Promise.all([
        dietAPI.getAll(),
        workoutAPI.getAll(),
      ]);

      const dietData = dietRes.data.map((entry: any) => ({
        id: entry.id,
        date: new Date(entry.date).toISOString().split('T')[0],
        foodName: entry.foodName,
        quantity: entry.quantity || '',
        calories: entry.calories,
        protein: entry.protein,
        carbs: entry.carbs,
        fat: entry.fat,
        fiber: entry.fiber,
      }));

      const workoutData = workoutRes.data.map((entry: any) => ({
        id: entry.id,
        date: new Date(entry.date).toISOString().split('T')[0],
        type: entry.type as any,
        duration: entry.duration,
        calories: entry.calories,
      }));

      setDietEntries(dietData);
      setWorkoutEntries(workoutData);
    } catch (error) {
      console.error('Failed to load fitness data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAuthenticated]);

  const addDietEntry = async (entry: Omit<DietEntry, 'id'>) => {
    try {
      const response = await dietAPI.add({
        foodName: entry.foodName,
        quantity: entry.quantity,
        calories: entry.calories,
        protein: entry.protein,
        carbs: entry.carbs,
        fat: entry.fat,
        fiber: entry.fiber,
        date: entry.date,
      });
      setDietEntries(prev => [...prev, {
        id: response.data.id,
        date: new Date(response.data.date).toISOString().split('T')[0],
        foodName: response.data.foodName,
        quantity: response.data.quantity || '',
        calories: response.data.calories,
        protein: response.data.protein,
        carbs: response.data.carbs,
        fat: response.data.fat,
        fiber: response.data.fiber,
      }]);
    } catch (error) {
      console.error('Failed to add diet entry:', error);
      throw error;
    }
  };

  const updateDietEntry = async (id: string, updates: Partial<Omit<DietEntry, 'id' | 'date'>>) => {
    try {
      const response = await dietAPI.update(id, updates);
      setDietEntries(prev => prev.map(e =>
        e.id === id
          ? {
              ...e,
              foodName: response.data.foodName,
              quantity: response.data.quantity || '',
              calories: response.data.calories,
              protein: response.data.protein,
              carbs: response.data.carbs,
              fat: response.data.fat,
              fiber: response.data.fiber,
            }
          : e
      ));
    } catch (error) {
      console.error('Failed to update diet entry:', error);
      throw error;
    }
  };

  const addWorkoutEntry = async (entry: Omit<WorkoutEntry, 'id'>) => {
    try {
      const response = await workoutAPI.add(
        entry.type,
        entry.duration,
        entry.calories,
        entry.date
      );
      setWorkoutEntries(prev => [...prev, {
        id: response.data.id,
        date: new Date(response.data.date).toISOString().split('T')[0],
        type: response.data.type,
        duration: response.data.duration,
        calories: response.data.calories,
      }]);
    } catch (error) {
      console.error('Failed to add workout entry:', error);
      throw error;
    }
  };

  const updateWorkoutEntry = async (id: string, updates: Partial<Omit<WorkoutEntry, 'id' | 'date'>>) => {
    try {
      const response = await workoutAPI.update(id, updates);
      setWorkoutEntries(prev => prev.map(e =>
        e.id === id
          ? {
              ...e,
              type: response.data.type,
              duration: response.data.duration,
              calories: response.data.calories,
            }
          : e
      ));
    } catch (error) {
      console.error('Failed to update workout entry:', error);
      throw error;
    }
  };

  const deleteDietEntry = async (id: string) => {
    try {
      await dietAPI.delete(id);
      setDietEntries(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error('Failed to delete diet entry:', error);
      throw error;
    }
  };

  const deleteWorkoutEntry = async (id: string) => {
    try {
      await workoutAPI.delete(id);
      setWorkoutEntries(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error('Failed to delete workout entry:', error);
      throw error;
    }
  };

  const getTodayCaloriesIn = () =>
    dietEntries.filter(e => e.date === todayStr()).reduce((sum, e) => sum + e.calories, 0);

  const getTodayCaloriesBurned = () =>
    workoutEntries.filter(e => e.date === todayStr()).reduce((sum, e) => sum + e.calories, 0);

  const getTodayNutrition = () => {
    const todayDiet = dietEntries.filter(e => e.date === todayStr());
    return {
      protein: todayDiet.reduce((s, e) => s + (e.protein || 0), 0),
      carbs: todayDiet.reduce((s, e) => s + (e.carbs || 0), 0),
      fat: todayDiet.reduce((s, e) => s + (e.fat || 0), 0),
      fiber: todayDiet.reduce((s, e) => s + (e.fiber || 0), 0),
    };
  };

  const getWeeklyData = () => {
    const days = getLast7Days();
    return days.map(date => ({
      date,
      caloriesIn: dietEntries.filter(e => e.date === date).reduce((s, e) => s + e.calories, 0),
      caloriesBurned: workoutEntries.filter(e => e.date === date).reduce((s, e) => s + e.calories, 0),
    }));
  };

  const getActiveDays = () => {
    const active = new Set<string>();
    workoutEntries.forEach(e => active.add(e.date));
    return active;
  };

  return (
    <FitnessContext.Provider value={{
      dietEntries, workoutEntries, addDietEntry, updateDietEntry, addWorkoutEntry, updateWorkoutEntry,
      deleteDietEntry, deleteWorkoutEntry, getTodayCaloriesIn, getTodayCaloriesBurned,
      getTodayNutrition, getWeeklyData, getActiveDays, loadData, isLoading,
    }}>
      {children}
    </FitnessContext.Provider>
  );
};
