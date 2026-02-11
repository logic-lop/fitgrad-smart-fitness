import { useState } from 'react';
import { useFitness, WorkoutEntry } from '@/contexts/FitnessContext';
import { Dumbbell, Plus, Trash2, Flame, Timer, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const workoutTypes = [
  { value: 'gym', label: '🏋️ Gym' },
  { value: 'cardio', label: '🏃 Cardio' },
  { value: 'yoga', label: '🧘 Yoga' },
  { value: 'walking', label: '🚶 Walking' },
  { value: 'home', label: '🏠 Home Workout' },
] as const;

const typeEmoji: Record<string, string> = { gym: '🏋️', cardio: '🏃', yoga: '🧘', walking: '🚶', home: '🏠' };

export default function WorkoutTracker() {
  const { workoutEntries, addWorkoutEntry, deleteWorkoutEntry, getTodayCaloriesBurned } = useFitness();
  const [type, setType] = useState<WorkoutEntry['type']>('gym');
  const [duration, setDuration] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const todayEntries = workoutEntries.filter(e => e.date === today);
  const olderEntries = workoutEntries.filter(e => e.date !== today);
  const todayBurned = getTodayCaloriesBurned();
  const todayDuration = todayEntries.reduce((s, e) => s + e.duration, 0);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const dur = parseInt(duration);
    const cal = parseInt(caloriesBurned);
    if (isNaN(dur) || dur <= 0 || isNaN(cal) || cal <= 0) {
      toast.error('Please fill all fields correctly');
      return;
    }
    addWorkoutEntry({ date: today, type, duration: dur, caloriesBurned: cal });
    setDuration('');
    setCaloriesBurned('');
    toast.success('Workout logged! 💪');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Workout Tracker</h1>
        <p className="mt-1 text-sm text-muted-foreground">Log your workouts and track calories burned.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
              <Plus className="h-5 w-5 text-primary" /> Log Workout
            </h2>
            <form onSubmit={handleAdd} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Workout Type</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as WorkoutEntry['type'])}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-ring focus:ring-2"
                >
                  {workoutTypes.map(w => (
                    <option key={w.value} value={w.value}>{w.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Duration (min)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-ring focus:ring-2"
                  placeholder="e.g. 45"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Calories Burned</label>
                <input
                  type="number"
                  value={caloriesBurned}
                  onChange={e => setCaloriesBurned(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-ring focus:ring-2"
                  placeholder="e.g. 300"
                  min="1"
                  required
                />
              </div>
              <button type="submit" className="w-full rounded-lg gradient-primary py-2.5 text-sm font-semibold text-primary-foreground transition-shadow hover:shadow-elevated">
                Log Workout
              </button>
            </form>
          </div>

          {/* Today stats */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-accent p-4 shadow-card">
              <div className="flex items-center gap-1.5 text-accent-foreground">
                <Flame className="h-4 w-4" />
                <span className="text-xs font-medium">Burned</span>
              </div>
              <p className="mt-1 text-xl font-bold text-foreground">{todayBurned}</p>
              <p className="text-xs text-muted-foreground">kcal today</p>
            </div>
            <div className="rounded-xl border border-border bg-accent p-4 shadow-card">
              <div className="flex items-center gap-1.5 text-accent-foreground">
                <Timer className="h-4 w-4" />
                <span className="text-xs font-medium">Duration</span>
              </div>
              <p className="mt-1 text-xl font-bold text-foreground">{todayDuration}</p>
              <p className="text-xs text-muted-foreground">min today</p>
            </div>
          </div>
        </div>

        {/* Workout log */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h2 className="font-display text-lg font-semibold text-foreground">Today's Workouts</h2>
            <div className="mt-4 space-y-2">
              <AnimatePresence>
                {todayEntries.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No workouts logged yet today. Time to move! 🏃</p>
                ) : (
                  todayEntries.map(entry => (
                    <motion.div
                      key={entry.id}
                      layout
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      className="flex items-center justify-between rounded-lg border border-border bg-background p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{typeEmoji[entry.type]}</span>
                        <div>
                          <p className="text-sm font-medium capitalize text-foreground">{entry.type}</p>
                          <p className="text-xs text-muted-foreground">{entry.duration} min</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-foreground">{entry.caloriesBurned} kcal</span>
                        <button
                          onClick={() => { deleteWorkoutEntry(entry.id); toast.success('Workout removed'); }}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          {olderEntries.length > 0 && (
            <div className="mt-4 rounded-xl border border-border bg-card p-5 shadow-card">
              <h2 className="font-display text-lg font-semibold text-foreground">Workout History</h2>
              <div className="mt-4 space-y-2">
                {olderEntries.slice(0, 10).map(entry => (
                  <div key={entry.id} className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{typeEmoji[entry.type]}</span>
                      <div>
                        <p className="text-sm font-medium capitalize text-foreground">{entry.type}</p>
                        <p className="text-xs text-muted-foreground">{entry.duration} min • {entry.date}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{entry.caloriesBurned} kcal</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
