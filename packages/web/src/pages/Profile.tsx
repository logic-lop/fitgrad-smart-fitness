import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Save, Scale, Ruler, Calendar, Target } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(String(user?.age || 20));
  const [height, setHeight] = useState(String(user?.height || 170));
  const [weight, setWeight] = useState(String(user?.weight || 65));
  const [goal, setGoal] = useState<'gain' | 'lose' | 'maintain'>((user?.goal as 'gain' | 'lose' | 'maintain') || 'maintain');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setAge(String(user.age));
      setHeight(String(user.height));
      setWeight(String(user.weight));
      setGoal((user.goal as 'gain' | 'lose' | 'maintain') || 'maintain');
    }
  }, [user]);

  if (!user) return null;

  const userWeight = user.weight || 65;
  const userHeight = user.height || 170;
  const bmi = (userWeight / ((userHeight / 100) ** 2)).toFixed(1);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim(),
      age: parseInt(age),
      height: parseInt(height),
      weight: parseInt(weight),
      goal: goal as 'gain' | 'lose' | 'maintain',
    });
    toast.success('Profile updated!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Your Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your personal details and fitness goals.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-1">
          <div className="rounded-xl border border-border bg-card p-6 shadow-card text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full gradient-primary">
              <User className="h-10 w-10 text-primary-foreground" />
            </div>
            <h2 className="mt-4 font-display text-xl font-bold text-foreground">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground">BMI</p>
                <p className="text-lg font-bold text-foreground">{bmi}</p>
              </div>
              <div className="rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground">Target</p>
                <p className="text-lg font-bold text-foreground">{user.dailyCalorieTarget}</p>
                <p className="text-xs text-muted-foreground">kcal/day</p>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-accent p-3">
              <p className="text-xs text-accent-foreground">Fitness Goal</p>
              <p className="mt-1 text-sm font-semibold capitalize text-foreground">
                {user.goal === 'gain' ? '💪 Weight Gain' : user.goal === 'lose' ? '🔥 Weight Loss' : '⚖️ Maintain Weight'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Edit form */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
              <Save className="h-5 w-5 text-primary" /> Edit Profile
            </h2>
            <form onSubmit={handleSave} className="mt-5 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <User className="h-3.5 w-3.5" /> Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-ring focus:ring-2"
                  required
                />
              </div>
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Calendar className="h-3.5 w-3.5" /> Age
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-ring focus:ring-2"
                  min="10" max="100" required
                />
              </div>
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Ruler className="h-3.5 w-3.5" /> Height (cm)
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={e => setHeight(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-ring focus:ring-2"
                  min="100" max="250" required
                />
              </div>
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Scale className="h-3.5 w-3.5" /> Weight (kg)
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-ring focus:ring-2"
                  min="30" max="300" required
                />
              </div>
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Target className="h-3.5 w-3.5" /> Fitness Goal
                </label>
                <select
                  value={goal}
                  onChange={e => setGoal(e.target.value as 'gain' | 'lose' | 'maintain')}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-ring focus:ring-2"
                >
                  <option value="lose">Lose Weight</option>
                  <option value="maintain">Maintain Weight</option>
                  <option value="gain">Gain Weight</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <button type="submit" className="rounded-lg gradient-primary px-8 py-2.5 text-sm font-semibold text-primary-foreground transition-shadow hover:shadow-elevated">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
