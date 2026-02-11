import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age: number;
  height: number; // cm
  weight: number; // kg
  goal: 'gain' | 'lose' | 'maintain';
  dailyCalorieTarget: number;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

function calculateCalorieTarget(weight: number, height: number, age: number, goal: string): number {
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

  useEffect(() => {
    if (user) localStorage.setItem('fitgrad_user', JSON.stringify(user));
    else localStorage.removeItem('fitgrad_user');
  }, [user]);

  const login = (email: string, password: string): boolean => {
    const users = JSON.parse(localStorage.getItem('fitgrad_users') || '[]');
    const found = users.find((u: any) => u.email === email && u.password === password);
    if (found) {
      const { password: _, ...profile } = found;
      setUser(profile);
      return true;
    }
    return false;
  };

  const register = (name: string, email: string, password: string): boolean => {
    const users = JSON.parse(localStorage.getItem('fitgrad_users') || '[]');
    if (users.find((u: any) => u.email === email)) return false;
    const newUser = {
      id: crypto.randomUUID(),
      name,
      email,
      password,
      age: 20,
      height: 170,
      weight: 65,
      goal: 'maintain' as const,
      dailyCalorieTarget: 2200,
    };
    users.push(newUser);
    localStorage.setItem('fitgrad_users', JSON.stringify(users));
    const { password: _, ...profile } = newUser;
    setUser(profile);
    return true;
  };

  const logout = () => setUser(null);

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    if (updates.weight || updates.height || updates.age || updates.goal) {
      updated.dailyCalorieTarget = calculateCalorieTarget(
        updated.weight, updated.height, updated.age, updated.goal
      );
    }
    setUser(updated);
    // Also update in users list
    const users = JSON.parse(localStorage.getItem('fitgrad_users') || '[]');
    const idx = users.findIndex((u: any) => u.id === updated.id);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...updated };
      localStorage.setItem('fitgrad_users', JSON.stringify(users));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
