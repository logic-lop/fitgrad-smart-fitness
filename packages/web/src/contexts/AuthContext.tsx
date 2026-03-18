import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, userAPI } from '../lib/api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age?: number;
  height?: number; // cm
  weight?: number; // kg
  goal?: 'gain' | 'lose' | 'maintain';
  dailyCalorieTarget?: number;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

function calculateCalorieTarget(weight?: number, height?: number, age?: number, goal?: string): number {
  if (!weight || !height || !age || !goal) return 2200;
  // Mifflin-St Jeor simplified
  const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  const maintenance = bmr * 1.55;
  if (goal === 'lose') return Math.round(maintenance - 500);
  if (goal === 'gain') return Math.round(maintenance + 400);
  return Math.round(maintenance);
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const stored = localStorage.getItem('fitgrad_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) localStorage.setItem('fitgrad_user', JSON.stringify(user));
    else localStorage.removeItem('fitgrad_user');
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authAPI.login(email, password);
      const { token, user: userData } = response.data;
      localStorage.setItem('authToken', token);
      setUser(userData);
      return true;
    } catch (err: any) {
      const message = err.response?.data?.error || 'Login failed';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authAPI.register(email, password, name);
      const { token, user: userData } = response.data;
      localStorage.setItem('authToken', token);
      setUser(userData);
      return true;
    } catch (err: any) {
      const message = err.response?.data?.error || 'Registration failed';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('fitgrad_user');
    setUser(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await userAPI.updateProfile({
        name: updates.name,
        age: updates.age,
        height: updates.height,
        weight: updates.weight,
        goal: updates.goal,
      });
      
      const updated: UserProfile = {
        ...user,
        ...response.data,
      };
      
      if (updates.weight || updates.height || updates.age || updates.goal) {
        updated.dailyCalorieTarget = calculateCalorieTarget(
          updated.weight, updated.height, updated.age, updated.goal
        );
      }
      setUser(updated);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Update failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, updateProfile, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

