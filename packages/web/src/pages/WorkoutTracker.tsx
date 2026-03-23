import { useState } from 'react';
import { useFitness, WorkoutEntry } from '@/contexts/FitnessContext';
import { Dumbbell, Plus, Trash2, Pencil, X, Check, Flame, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const workoutTypes = [
  { value: 'gym', label: '🏋️ Gym' },
  { value: 'cardio', label: '🏃 Cardio' },
  { value: 'yoga', label: '🧘 Yoga' },
  { value: 'walking', label: '🚶 Walking' },
  { value: 'home', label: '🏠 Home Workout' },
] as const;

const typeEmoji: Record<string, string> = { gym: '🏋️', cardio: '🏃', yoga: '🧘', walking: '🚶', home: '🏠' };

export default function WorkoutTracker() {
  const { workoutEntries, addWorkoutEntry, updateWorkoutEntry, deleteWorkoutEntry, getTodayCaloriesBurned, getWeeklyData } = useFitness();
  const [type, setType] = useState<WorkoutEntry['type']>('gym');
  const [duration, setDuration] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editType, setEditType] = useState<WorkoutEntry['type']>('gym');
  const [editDur, setEditDur] = useState('');
  const [editCal, setEditCal] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const todayEntries = workoutEntries.filter(e => e.date === today);
  const olderEntries = workoutEntries.filter(e => e.date !== today);
  const todayBurned = getTodayCaloriesBurned();
  const todayDuration = todayEntries.reduce((s, e) => s + e.duration, 0);
  const weeklyData = getWeeklyData();

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const dur = parseInt(duration);
    const cal = parseInt(caloriesBurned);
    if (isNaN(dur) || dur <= 0 || isNaN(cal) || cal <= 0) {
      toast.error('Please fill all fields correctly');
      return;
    }
    addWorkoutEntry({ date: today, type, duration: dur, calories: cal });
    setDuration(''); setCaloriesBurned('');
    toast.success('Workout logged! 💪');
  };

  const startEdit = (entry: WorkoutEntry) => {
    setEditingId(entry.id);
    setEditType(entry.type);
    setEditDur(String(entry.duration));
    setEditCal(String(entry.calories));
  };

  const saveEdit = () => {
    if (!editingId) return;
    const dur = parseInt(editDur);
    const cal = parseInt(editCal);
    if (isNaN(dur) || dur <= 0 || isNaN(cal) || cal <= 0) { toast.error('Invalid values'); return; }
    updateWorkoutEntry(editingId, { type: editType, duration: dur, calories: cal });
    setEditingId(null);
    toast.success('Updated!');
  };

  const formatDate = (d: string) => {
    const date = new Date(d + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Workout Tracker</h1>
        <p className="mt-1 text-sm text-muted-foreground">Log workouts and track your calories burned.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
              <Plus className="h-5 w-5 text-primary" /> Log Workout
            </h2>
            <form onSubmit={handleAdd} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Type</label>
                <select value={type} onChange={e => setType(e.target.value as WorkoutEntry['type'])}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none ring-ring focus:ring-2">
                  {workoutTypes.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Duration (min)</label>
                <input type="number" value={duration} onChange={e => setDuration(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none ring-ring focus:ring-2"
                  placeholder="e.g. 45" min="1" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Calories Burned</label>
                <input type="number" value={caloriesBurned} onChange={e => setCaloriesBurned(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none ring-ring focus:ring-2"
                  placeholder="e.g. 300" min="1" required />
              </div>
              <button type="submit" className="w-full rounded-lg gradient-primary py-2.5 text-sm font-semibold text-primary-foreground transition-shadow hover:shadow-elevated">
                Log Workout
              </button>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-center gap-1.5 text-primary">
                <Flame className="h-4 w-4" />
                <span className="text-xs font-medium">Burned</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-foreground">{todayBurned}</p>
              <p className="text-xs text-muted-foreground">kcal today</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-center gap-1.5 text-secondary">
                <Timer className="h-4 w-4" />
                <span className="text-xs font-medium">Duration</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-foreground">{todayDuration}</p>
              <p className="text-xs text-muted-foreground">min today</p>
            </div>
          </div>

          {/* Workout trend mini chart */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-card">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Weekly Burn Trend</h3>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <XAxis dataKey="date" tickFormatter={formatDate} fontSize={10} />
                  <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '11px' }} labelFormatter={formatDate} />
                  <Bar dataKey="caloriesBurned" fill="hsl(30, 95%, 55%)" radius={[3, 3, 0, 0]} name="Burned" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h2 className="font-display text-lg font-semibold text-foreground">Today's Workouts</h2>
            <div className="mt-4 space-y-2">
              <AnimatePresence>
                {todayEntries.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No workouts logged today. Time to move! 🏃</p>
                ) : (
                  todayEntries.map(entry => {
                    if (editingId === entry.id) {
                      return (
                        <motion.div key={entry.id} layout className="rounded-lg border-2 border-primary/30 bg-accent p-3">
                          <div className="grid gap-2 sm:grid-cols-3">
                            <select value={editType} onChange={e => setEditType(e.target.value as WorkoutEntry['type'])}
                              className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground outline-none">
                              {workoutTypes.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                            </select>
                            <input type="number" value={editDur} onChange={e => setEditDur(e.target.value)}
                              className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground outline-none" placeholder="Min" />
                            <input type="number" value={editCal} onChange={e => setEditCal(e.target.value)}
                              className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground outline-none" placeholder="Cal" />
                          </div>
                          <div className="mt-2 flex justify-end gap-2">
                            <button onClick={() => setEditingId(null)} className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted">
                              <X className="h-3 w-3" /> Cancel
                            </button>
                            <button onClick={saveEdit} className="flex items-center gap-1 rounded-md gradient-primary px-3 py-1.5 text-xs text-primary-foreground">
                              <Check className="h-3 w-3" /> Save
                            </button>
                          </div>
                        </motion.div>
                      );
                    }
                    return (
                      <motion.div key={entry.id} layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
                        className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{typeEmoji[entry.type]}</span>
                          <div>
                            <p className="text-sm font-medium capitalize text-foreground">{entry.type}</p>
                            <p className="text-xs text-muted-foreground">{entry.duration} min</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">{entry.calories} kcal</span>
                          <button onClick={() => startEdit(entry)}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => { deleteWorkoutEntry(entry.id); toast.success('Removed'); }}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>

          {olderEntries.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
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
                    <span className="text-sm font-semibold text-foreground">{entry.calories} kcal</span>
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
