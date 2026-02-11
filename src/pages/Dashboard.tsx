import { useAuth } from '@/contexts/AuthContext';
import { useFitness } from '@/contexts/FitnessContext';
import StatCard from '@/components/StatCard';
import { Activity, Apple, Dumbbell, Flame, Scale, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { user } = useAuth();
  const { getTodayCaloriesIn, getTodayCaloriesBurned, getWeeklyData, dietEntries, workoutEntries } = useFitness();

  if (!user) return null;

  const caloriesIn = getTodayCaloriesIn();
  const caloriesBurned = getTodayCaloriesBurned();
  const netCalories = caloriesIn - caloriesBurned;
  const bmi = (user.weight / ((user.height / 100) ** 2)).toFixed(1);
  const weeklyData = getWeeklyData();

  const goalProgress = Math.min(100, Math.round((caloriesIn / user.dailyCalorieTarget) * 100));

  // Insights
  const insights: string[] = [];
  if (caloriesIn > user.dailyCalorieTarget) insights.push('⚠️ You exceeded your calorie limit today!');
  else if (caloriesIn > 0) insights.push('✅ You\'re within your calorie target — keep it up!');
  if (caloriesBurned > 300) insights.push('🔥 Great job staying active today!');
  if (workoutEntries.filter(w => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return new Date(w.date) >= d;
  }).length >= 5) insights.push('💪 Amazing consistency this week!');

  const formatDate = (d: string) => {
    const date = new Date(d + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

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

      {/* Goal Progress */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-semibold text-foreground">Daily Goal Progress</h2>
          </div>
          <span className="text-sm font-medium text-muted-foreground">{goalProgress}%</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${goalProgress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${goalProgress > 100 ? 'bg-destructive' : 'gradient-primary'}`}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {caloriesIn} / {user.dailyCalorieTarget} kcal consumed • Goal: {user.goal === 'gain' ? 'Weight Gain' : user.goal === 'lose' ? 'Weight Loss' : 'Maintain Weight'}
        </p>
      </motion.div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h2 className="font-display text-lg font-semibold text-foreground">Weekly Calorie Intake</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 15%, 89%)" />
                <XAxis dataKey="date" tickFormatter={formatDate} fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid hsl(150, 15%, 89%)', fontSize: '12px' }}
                  labelFormatter={formatDate}
                />
                <Bar dataKey="caloriesIn" fill="hsl(160, 84%, 32%)" radius={[4, 4, 0, 0]} name="Calories In" />
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
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid hsl(150, 15%, 89%)', fontSize: '12px' }}
                  labelFormatter={formatDate}
                />
                <Line type="monotone" dataKey="caloriesIn" stroke="hsl(160, 84%, 32%)" strokeWidth={2} dot={{ r: 4 }} name="Calories In" />
                <Line type="monotone" dataKey="caloriesBurned" stroke="hsl(30, 95%, 55%)" strokeWidth={2} dot={{ r: 4 }} name="Burned" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h2 className="font-display text-lg font-semibold text-foreground">Health Insights</h2>
          <div className="mt-3 space-y-2">
            {insights.map((insight, i) => (
              <p key={i} className="text-sm text-muted-foreground">{insight}</p>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
