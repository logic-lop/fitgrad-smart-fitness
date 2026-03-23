import { useState, useEffect, useCallback } from 'react';
import { useFitness, DietEntry } from '@/contexts/FitnessContext';
import { useAuth } from '@/contexts/AuthContext';
import { nutritionAPI } from '@/lib/api';
import { Apple, Plus, Trash2, Pencil, X, Check, Search, Zap, Drumstick, Wheat, Droplets, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

interface SearchResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export default function DietTracker() {
  const { user } = useAuth();
  const { dietEntries, addDietEntry, updateDietEntry, deleteDietEntry, getTodayCaloriesIn, getTodayNutrition } = useFitness();
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [fiber, setFiber] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFood, setEditFood] = useState('');
  const [editQty, setEditQty] = useState('');
  const [editCal, setEditCal] = useState('');
  const [nutritionLoaded, setNutritionLoaded] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const todayEntries = dietEntries.filter(e => e.date === today);
  const olderEntries = dietEntries.filter(e => e.date !== today);
  const todayTotal = getTodayCaloriesIn();
  const todayNutrition = getTodayNutrition();

  // Debounced food search
  useEffect(() => {
    if (foodName.trim().length < 2) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await nutritionAPI.search(foodName.trim());
        setSearchResults(res.data.results || []);
        setShowSuggestions(res.data.results?.length > 0);
      } catch {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [foodName]);

  // Auto-lookup nutrition when food name and quantity are set
  const lookupNutrition = useCallback(async (food: string, qty: string) => {
    if (!food.trim()) return;
    try {
      const res = await nutritionAPI.lookup(food.trim());
      if (res.data.found) {
        const per100g = res.data;
        // Parse quantity — try to extract grams
        let grams = 100;
        const qtyLower = qty.toLowerCase().trim();
        const numMatch = qtyLower.match(/^(\d+\.?\d*)\s*(g|gm|grams?)?$/);
        const plateMatch = qtyLower.match(/^(\d+\.?\d*)\s*(plate|bowl|cup|serving|piece|slice|pcs?)s?$/);
        
        if (numMatch) {
          grams = parseFloat(numMatch[1]);
        } else if (plateMatch) {
          const count = parseFloat(plateMatch[1]);
          const unit = plateMatch[2];
          // Approximate serving sizes
          if (unit.startsWith('plate') || unit.startsWith('bowl')) grams = count * 250;
          else if (unit.startsWith('cup')) grams = count * 240;
          else if (unit.startsWith('serving')) grams = count * 150;
          else if (unit.startsWith('piece') || unit.startsWith('slice') || unit.startsWith('pc')) grams = count * 50;
          else grams = count * 100;
        } else if (qtyLower && !isNaN(parseFloat(qtyLower))) {
          grams = parseFloat(qtyLower);
        }

        const multiplier = grams / 100;
        setCalories(String(Math.round(per100g.calories * multiplier)));
        setProtein(String(Math.round(per100g.protein * multiplier * 10) / 10));
        setCarbs(String(Math.round(per100g.carbs * multiplier * 10) / 10));
        setFat(String(Math.round(per100g.fat * multiplier * 10) / 10));
        setFiber(String(Math.round(per100g.fiber * multiplier * 10) / 10));
        setNutritionLoaded(true);
      }
    } catch {
      // silently fail
    }
  }, []);

  // Trigger lookup when quantity changes (if food is set)
  useEffect(() => {
    if (foodName.trim() && quantity.trim()) {
      const timer = setTimeout(() => {
        lookupNutrition(foodName, quantity);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [quantity, lookupNutrition]);

  const selectSuggestion = (result: SearchResult) => {
    setFoodName(result.name);
    setShowSuggestions(false);
    // Auto-fill with 100g default if no quantity set
    if (quantity.trim()) {
      lookupNutrition(result.name, quantity);
    } else {
      setCalories(String(result.calories));
      setProtein(String(result.protein));
      setCarbs(String(result.carbs));
      setFat(String(result.fat));
      setFiber(String(result.fiber));
      setNutritionLoaded(true);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const cal = parseInt(calories);
    if (!foodName.trim() || !quantity.trim() || isNaN(cal) || cal <= 0) {
      toast.error('Please fill food name, quantity, and calories');
      return;
    }
    addDietEntry({
      date: today,
      foodName: foodName.trim(),
      quantity: quantity.trim(),
      calories: cal,
      protein: protein ? parseFloat(protein) : undefined,
      carbs: carbs ? parseFloat(carbs) : undefined,
      fat: fat ? parseFloat(fat) : undefined,
      fiber: fiber ? parseFloat(fiber) : undefined,
    });
    setFoodName(''); setQuantity(''); setCalories('');
    setProtein(''); setCarbs(''); setFat(''); setFiber('');
    setNutritionLoaded(false);
    toast.success('Meal added!');
  };

  const startEdit = (entry: DietEntry) => {
    setEditingId(entry.id);
    setEditFood(entry.foodName);
    setEditQty(entry.quantity);
    setEditCal(String(entry.calories));
  };

  const saveEdit = () => {
    if (!editingId) return;
    const cal = parseInt(editCal);
    if (!editFood.trim() || !editQty.trim() || isNaN(cal) || cal <= 0) {
      toast.error('Please fill all fields');
      return;
    }
    updateDietEntry(editingId, { foodName: editFood.trim(), quantity: editQty.trim(), calories: cal });
    setEditingId(null);
    toast.success('Entry updated!');
  };

  const MacroPill = ({ icon: Icon, label, value, unit = 'g', color }: { icon: any; label: string; value: number; unit?: string; color: string }) => (
    <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 ${color}`}>
      <Icon className="h-3.5 w-3.5" />
      <span className="text-xs font-medium">{Math.round(value * 10) / 10}{unit}</span>
    </div>
  );

  const EntryRow = ({ entry }: { entry: DietEntry }) => {
    const isEditing = editingId === entry.id;

    if (isEditing) {
      return (
        <motion.div layout className="rounded-lg border-2 border-primary/30 bg-accent p-3">
          <div className="grid gap-2 sm:grid-cols-3">
            <input value={editFood} onChange={e => setEditFood(e.target.value)}
              className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground outline-none ring-ring focus:ring-2" placeholder="Food" />
            <input value={editQty} onChange={e => setEditQty(e.target.value)}
              className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground outline-none ring-ring focus:ring-2" placeholder="Qty" />
            <input type="number" value={editCal} onChange={e => setEditCal(e.target.value)}
              className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground outline-none ring-ring focus:ring-2" placeholder="Cal" />
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <button onClick={() => setEditingId(null)} className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted">
              <X className="h-3 w-3" /> Cancel
            </button>
            <button onClick={saveEdit} className="flex items-center gap-1 rounded-md gradient-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
              <Check className="h-3 w-3" /> Save
            </button>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
        className="rounded-lg border border-border bg-background p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
              <Apple className="h-4 w-4 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{entry.foodName}</p>
              <p className="text-xs text-muted-foreground">{entry.quantity}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{entry.calories} kcal</span>
            <button onClick={() => startEdit(entry)}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => { deleteDietEntry(entry.id); toast.success('Entry removed'); }}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        {/* Show macros if available */}
        {(entry.protein || entry.carbs || entry.fat) && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {entry.protein != null && <MacroPill icon={Drumstick} label="Protein" value={entry.protein} color="bg-blue-50 text-blue-700" />}
            {entry.carbs != null && <MacroPill icon={Wheat} label="Carbs" value={entry.carbs} color="bg-amber-50 text-amber-700" />}
            {entry.fat != null && <MacroPill icon={Droplets} label="Fat" value={entry.fat} color="bg-rose-50 text-rose-700" />}
            {entry.fiber != null && <MacroPill icon={Leaf} label="Fiber" value={entry.fiber} color="bg-green-50 text-green-700" />}
          </div>
        )}
      </motion.div>
    );
  };

  const calorieTarget = user?.dailyCalorieTarget || 2200;
  const caloriePercent = Math.round((todayTotal / calorieTarget) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Diet Tracker</h1>
        <p className="mt-1 text-sm text-muted-foreground">Log your meals and track daily calorie & nutrition intake.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
              <Plus className="h-5 w-5 text-primary" /> Add Meal
            </h2>
            <form onSubmit={handleAdd} className="mt-4 space-y-4">
              <div className="relative">
                <label className="mb-1 block text-sm font-medium text-foreground">Food Name</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input type="text" value={foodName} onChange={e => { setFoodName(e.target.value); setNutritionLoaded(false); }}
                    onFocus={() => searchResults.length > 0 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2.5 text-sm text-foreground outline-none ring-ring focus:ring-2"
                    placeholder="Search e.g. chicken, rice, dal..." required />
                </div>
                {/* Search suggestions dropdown */}
                <AnimatePresence>
                  {showSuggestions && searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto rounded-lg border border-border bg-card shadow-elevated"
                    >
                      {searchResults.map(r => (
                        <button
                          key={r.name}
                          type="button"
                          onMouseDown={() => selectSuggestion(r)}
                          className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent"
                        >
                          <span className="font-medium capitalize text-foreground">{r.name}</span>
                          <span className="text-xs text-muted-foreground">{r.calories} kcal/100g</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Quantity</label>
                <input type="text" value={quantity} onChange={e => setQuantity(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none ring-ring focus:ring-2"
                  placeholder="e.g. 200g, 1 plate, 2 pieces" required />
              </div>
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-sm font-medium text-foreground">
                  Calories {nutritionLoaded && <Zap className="h-3.5 w-3.5 text-amber-500" />}
                </label>
                <input type="number" value={calories} onChange={e => setCalories(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none ring-ring focus:ring-2"
                  placeholder="Auto-filled or enter manually" min="1" required />
              </div>

              {/* Nutrition fields — auto-filled */}
              {(nutritionLoaded || protein || carbs || fat || fiber) && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3 rounded-lg border border-primary/20 bg-accent/50 p-3">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-accent-foreground">
                    <Zap className="h-3.5 w-3.5" /> Nutrition Breakdown (auto-detected)
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-0.5 block text-xs text-muted-foreground">Protein (g)</label>
                      <input type="number" step="0.1" value={protein} onChange={e => setProtein(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground outline-none ring-ring focus:ring-2" />
                    </div>
                    <div>
                      <label className="mb-0.5 block text-xs text-muted-foreground">Carbs (g)</label>
                      <input type="number" step="0.1" value={carbs} onChange={e => setCarbs(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground outline-none ring-ring focus:ring-2" />
                    </div>
                    <div>
                      <label className="mb-0.5 block text-xs text-muted-foreground">Fat (g)</label>
                      <input type="number" step="0.1" value={fat} onChange={e => setFat(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground outline-none ring-ring focus:ring-2" />
                    </div>
                    <div>
                      <label className="mb-0.5 block text-xs text-muted-foreground">Fiber (g)</label>
                      <input type="number" step="0.1" value={fiber} onChange={e => setFiber(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground outline-none ring-ring focus:ring-2" />
                    </div>
                  </div>
                </motion.div>
              )}

              <button type="submit" className="w-full rounded-lg gradient-primary py-2.5 text-sm font-semibold text-primary-foreground transition-shadow hover:shadow-elevated">
                Add Meal
              </button>
            </form>
          </div>

          {/* Today summary */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-sm font-medium text-muted-foreground">Today's Intake</p>
            <p className="mt-1 text-3xl font-bold text-foreground">{todayTotal} <span className="text-base font-normal text-muted-foreground">kcal</span></p>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all duration-500 ${caloriePercent > 100 ? 'bg-destructive' : 'gradient-primary'}`}
                style={{ width: `${Math.min(caloriePercent, 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {caloriePercent}% of {calorieTarget} kcal target • {caloriePercent > 100 ? 'Over limit ⚠️' : 'On track ✅'}
            </p>
          </div>

          {/* Macro summary */}
          {(todayNutrition.protein > 0 || todayNutrition.carbs > 0 || todayNutrition.fat > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border bg-card p-5 shadow-card"
            >
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Zap className="h-4 w-4 text-amber-500" /> Today's Macros
              </h3>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-blue-50 p-3 text-center">
                  <Drumstick className="mx-auto h-4 w-4 text-blue-600" />
                  <p className="mt-1 text-lg font-bold text-blue-700">{Math.round(todayNutrition.protein)}g</p>
                  <p className="text-xs text-blue-600">Protein</p>
                </div>
                <div className="rounded-lg bg-amber-50 p-3 text-center">
                  <Wheat className="mx-auto h-4 w-4 text-amber-600" />
                  <p className="mt-1 text-lg font-bold text-amber-700">{Math.round(todayNutrition.carbs)}g</p>
                  <p className="text-xs text-amber-600">Carbs</p>
                </div>
                <div className="rounded-lg bg-rose-50 p-3 text-center">
                  <Droplets className="mx-auto h-4 w-4 text-rose-600" />
                  <p className="mt-1 text-lg font-bold text-rose-700">{Math.round(todayNutrition.fat)}g</p>
                  <p className="text-xs text-rose-600">Fat</p>
                </div>
                <div className="rounded-lg bg-green-50 p-3 text-center">
                  <Leaf className="mx-auto h-4 w-4 text-green-600" />
                  <p className="mt-1 text-lg font-bold text-green-700">{Math.round(todayNutrition.fiber)}g</p>
                  <p className="text-xs text-green-600">Fiber</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h2 className="font-display text-lg font-semibold text-foreground">Today's Meals</h2>
            <div className="mt-4 space-y-2">
              <AnimatePresence>
                {todayEntries.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No meals logged yet today. Add your first meal! 🍽️</p>
                ) : (
                  todayEntries.map(entry => <EntryRow key={entry.id} entry={entry} />)
                )}
              </AnimatePresence>
            </div>
          </div>

          {olderEntries.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <h2 className="font-display text-lg font-semibold text-foreground">Previous Meals</h2>
              <div className="mt-4 space-y-2">
                {olderEntries.slice(0, 10).map(entry => (
                  <div key={entry.id} className="rounded-lg border border-border bg-background p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                          <Apple className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{entry.foodName}</p>
                          <p className="text-xs text-muted-foreground">{entry.quantity} • {entry.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{entry.calories} kcal</span>
                        <button onClick={() => { deleteDietEntry(entry.id); toast.success('Removed'); }}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    {(entry.protein || entry.carbs || entry.fat) && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {entry.protein != null && <MacroPill icon={Drumstick} label="P" value={entry.protein} color="bg-blue-50 text-blue-700" />}
                        {entry.carbs != null && <MacroPill icon={Wheat} label="C" value={entry.carbs} color="bg-amber-50 text-amber-700" />}
                        {entry.fat != null && <MacroPill icon={Droplets} label="F" value={entry.fat} color="bg-rose-50 text-rose-700" />}
                        {entry.fiber != null && <MacroPill icon={Leaf} label="Fi" value={entry.fiber} color="bg-green-50 text-green-700" />}
                      </div>
                    )}
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
