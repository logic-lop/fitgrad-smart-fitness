import { useAuth } from '@/contexts/AuthContext';
import { useFitness } from '@/contexts/FitnessContext';
import StatCard from '@/components/StatCard';
import ProgressRing from '@/components/ProgressRing';
import { Activity, Apple, Dumbbell, Flame, Scale, Target, TrendingUp, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { user } = useAuth();
  const { getTodayCaloriesIn, getTodayCaloriesBurned, getWeeklyData, dietEntries, workoutEntries, getActiveDays } = useFitness();

  if (!user) return null;

  const caloriesIn = getTodayCaloriesIn();
  const caloriesBurned = getTodayCaloriesBurned();
  const netCalories = caloriesIn - caloriesBurned;
  const bmi = (user.weight / ((user.height / 100) ** 2)).toFixed(1);
  const weeklyData = getWeeklyData();
  const activeDays = getActiveDays();

  const calorieProgress = Math.min(100, Math.round((caloriesIn / user.dailyCalorieTarget) * 100));
  const burnProgress = Math.min(100, Math.round((caloriesBurned / 500) * 100)); // 500 kcal daily burn goal
  const weeklyWorkouts = workoutEntries.filter(w => {
    const d = new Date(); d.setDate(d.getDate() - 7);
    return new Date(w.date) >= d;
  }).length;
  const consistencyProgress = Math.min(100, Math.round((weeklyWorkouts / 5) * 100));

  // Richer insights
  const insights: { emoji: string; text: string; type: 'success' | 'warning' | 'info' }[] = [];
  if (caloriesIn > user.dailyCalorieTarget)
    insights.push({ emoji: '⚠️', text: 'You exceeded your calorie limit today. Try a short workout to balance it out!', type: 'warning' });
  else if (caloriesIn > 0 && caloriesIn <= user.dailyCalorieTarget)
    insights.push({ emoji: '✅', text: "You're on track today — keep going!", type: 'success' });
  if (caloriesBurned === 0 && caloriesIn > 0)
    insights.push({ emoji: '🏃', text: 'Try adding a short workout to balance your calories.', type: 'info' });
  if (caloriesBurned > 300)
    insights.push({ emoji: '🔥', text: 'Great job staying active today!', type: 'success' });
  if (weeklyWorkouts >= 5)
    insights.push({ emoji: '💪', text: 'Amazing consistency this week — 5+ workouts logged!', type: 'success' });
  if (weeklyWorkouts >= 1 && weeklyWorkouts < 3)
    insights.push({ emoji: '📈', text: 'Try adding 2 more workouts this week for better results.', type: 'info' });
  if (Number(bmi) >= 25)
    insights.push({ emoji: '📊', text: `Your BMI is ${bmi} — consider focusing on cardio and a calorie deficit.`, type: 'info' });

  const formatDate = (d: string) => {
    const date = new Date(d + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Last 7 days activity dots
  const last7 = (() => {
    const days: { date: string; dayLabel: string; active: boolean }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      days.push({ date: ds, dayLabel: d.toLocaleDateString('en-US', { weekday: 'short' }), active: activeDays.has(ds) });
    }
    return days;
  })();

  const insightBg = { success: 'bg-accent', warning: 'bg-destructive/10', info: 'bg-muted' };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user.name.split(' ')[0]}! 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Here's your fitness overview for today.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Calories In" value={caloriesIn} subtitle={`Target: ${user.dailyCalorieTarget} kcal`} icon={Apple} variant="primary" />
        <StatCard title="Calories Burned" value={caloriesBurned} subtitle="Today's activity" icon={Flame} variant="secondary" />
        <StatCard title="Net Calories" value={netCalories} subtitle={netCalories > 0 ? 'Surplus' : 'Deficit'} icon={Activity} variant="accent" />
        <StatCard title="BMI" value={bmi} subtitle={Number(bmi) < 18.5 ? 'Underweight' : Number(bmi) < 25 ? 'Normal' : Number(bmi) < 30 ? 'Overweight' : 'Obese'} icon={Scale} />
      </div>

      {/* Progress Rings + Activity dots */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-6 shadow-card">
          <h2 className="mb-6 font-display text-lg font-semibold text-foreground">Today's Progress</h2>
          <div className="flex flex-wrap items-center justify-around gap-6">
            <ProgressRing value={calorieProgress} label="Calorie Goal" sublabel={`${caloriesIn} / ${user.dailyCalorieTarget}`} color={calorieProgress > 100 ? 'destructive' : 'primary'} />
            <ProgressRing value={burnProgress} label="Burn Goal" sublabel={`${caloriesBurned} / 500 kcal`} color="secondary" />
            <ProgressRing value={consistencyProgress} label="Weekly Streak" sublabel={`${weeklyWorkouts} / 5 workouts`} color="primary" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border bg-card p-6 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-semibold text-foreground">Weekly Activity</h2>
          </div>
          <div className="flex justify-around">
            {last7.map(day => (
              <div key={day.date} className="flex flex-col items-center gap-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    day.active
                      ? 'gradient-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {day.active ? '✓' : '–'}
                </motion.div>
                <span className="text-xs text-muted-foreground">{day.dayLabel}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between rounded-lg bg-muted p-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">This Week</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {last7.filter(d => d.active).length}/7 active days
            </span>
          </div>
        </motion.div>
      </div>

      {/* Goal Progress Bar */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-semibold text-foreground">Daily Calorie Goal</h2>
          </div>
          <span className="text-sm font-medium text-muted-foreground">{calorieProgress}%</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(calorieProgress, 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${calorieProgress > 100 ? 'bg-destructive' : 'gradient-primary'}`}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {caloriesIn} / {user.dailyCalorieTarget} kcal consumed • Goal: {user.goal === 'gain' ? 'Weight Gain' : user.goal === 'lose' ? 'Weight Loss' : 'Maintain Weight'}
        </p>
      </motion.div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h2 className="font-display text-lg font-semibold text-foreground">Weekly Overview</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 15%, 89%)" />
                <XAxis dataKey="date" tickFormatter={formatDate} fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(150, 15%, 89%)', fontSize: '12px' }} labelFormatter={formatDate} />
                <Legend />
                <Bar dataKey="caloriesIn" fill="hsl(160, 84%, 32%)" radius={[4, 4, 0, 0]} name="Intake" />
                <Bar dataKey="caloriesBurned" fill="hsl(30, 95%, 55%)" radius={[4, 4, 0, 0]} name="Burned" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h2 className="font-display text-lg font-semibold text-foreground">Calorie Trend</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 15%, 89%)" />
                <XAxis dataKey="date" tickFormatter={formatDate} fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(150, 15%, 89%)', fontSize: '12px' }} labelFormatter={formatDate} />
                <Legend />
                <Line type="monotone" dataKey="caloriesIn" stroke="hsl(160, 84%, 32%)" strokeWidth={2} dot={{ r: 4 }} name="Intake" />
                <Line type="monotone" dataKey="caloriesBurned" stroke="hsl(30, 95%, 55%)" strokeWidth={2} dot={{ r: 4 }} name="Burned" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Smart Insights */}
      {insights.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h2 className="mb-4 font-display text-lg font-semibold text-foreground">💡 Smart Insights</h2>
          <div className="space-y-2">
            {insights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className={`flex items-start gap-3 rounded-lg p-3 ${insightBg[insight.type]}`}
              >
                <span className="text-lg">{insight.emoji}</span>
                <p className="text-sm text-foreground">{insight.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
