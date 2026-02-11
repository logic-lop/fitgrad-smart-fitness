import { useState } from 'react';
import { useFitness, DietEntry } from '@/contexts/FitnessContext';
import { useAuth } from '@/contexts/AuthContext';
import { Apple, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function DietTracker() {
  const { user } = useAuth();
  const { dietEntries, addDietEntry, deleteDietEntry, getTodayCaloriesIn } = useFitness();
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [calories, setCalories] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const todayEntries = dietEntries.filter(e => e.date === today);
  const olderEntries = dietEntries.filter(e => e.date !== today);
  const todayTotal = getTodayCaloriesIn();

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const cal = parseInt(calories);
    if (!foodName.trim() || !quantity.trim() || isNaN(cal) || cal <= 0) {
      toast.error('Please fill all fields correctly');
      return;
    }
    addDietEntry({ date: today, foodName: foodName.trim(), quantity: quantity.trim(), calories: cal });
    setFoodName('');
    setQuantity('');
    setCalories('');
    toast.success('Meal added!');
  };

  const EntryRow = ({ entry }: { entry: DietEntry }) => (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      className="flex items-center justify-between rounded-lg border border-border bg-background p-3"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
          <Apple className="h-4 w-4 text-accent-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{entry.foodName}</p>
          <p className="text-xs text-muted-foreground">{entry.quantity}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-foreground">{entry.calories} kcal</span>
        <button
          onClick={() => { deleteDietEntry(entry.id); toast.success('Entry removed'); }}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Diet Tracker</h1>
        <p className="mt-1 text-sm text-muted-foreground">Log your meals and track daily calorie intake.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Add form */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
              <Plus className="h-5 w-5 text-primary" /> Add Meal
            </h2>
            <form onSubmit={handleAdd} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Food Name</label>
                <input
                  type="text"
                  value={foodName}
                  onChange={e => setFoodName(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-ring focus:ring-2"
                  placeholder="e.g. Grilled Chicken"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Quantity</label>
                <input
                  type="text"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-ring focus:ring-2"
                  placeholder="e.g. 1 plate, 200g"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Calories</label>
                <input
                  type="number"
                  value={calories}
                  onChange={e => setCalories(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-ring focus:ring-2"
                  placeholder="e.g. 350"
                  min="1"
                  required
                />
              </div>
              <button type="submit" className="w-full rounded-lg gradient-primary py-2.5 text-sm font-semibold text-primary-foreground transition-shadow hover:shadow-elevated">
                Add Meal
              </button>
            </form>
          </div>

          {/* Today's summary */}
          <div className="mt-4 rounded-xl border border-border bg-accent p-4 shadow-card">
            <p className="text-sm font-medium text-accent-foreground">Today's Total</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{todayTotal} kcal</p>
            {user && (
              <p className="mt-1 text-xs text-muted-foreground">
                Target: {user.dailyCalorieTarget} kcal • {todayTotal > user.dailyCalorieTarget ? 'Over limit ⚠️' : 'On track ✅'}
              </p>
            )}
          </div>
        </div>

        {/* Food log */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h2 className="font-display text-lg font-semibold text-foreground">Today's Meals</h2>
            <div className="mt-4 space-y-2">
              <AnimatePresence>
                {todayEntries.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No meals logged yet today. Add your first meal!</p>
                ) : (
                  todayEntries.map(entry => <EntryRow key={entry.id} entry={entry} />)
                )}
              </AnimatePresence>
            </div>
          </div>

          {olderEntries.length > 0 && (
            <div className="mt-4 rounded-xl border border-border bg-card p-5 shadow-card">
              <h2 className="font-display text-lg font-semibold text-foreground">Previous Meals</h2>
              <div className="mt-4 space-y-2">
                {olderEntries.slice(0, 10).map(entry => (
                  <div key={entry.id} className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{entry.foodName}</p>
                      <p className="text-xs text-muted-foreground">{entry.quantity} • {entry.date}</p>
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
