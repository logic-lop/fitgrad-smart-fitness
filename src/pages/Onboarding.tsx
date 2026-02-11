import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Activity, ArrowRight, ArrowLeft, User, Ruler, Scale, Target, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const steps = [
  { title: 'Personal Details', subtitle: 'Tell us about yourself', icon: User },
  { title: 'Body Metrics', subtitle: 'Help us calculate your BMI', icon: Ruler },
  { title: 'Fitness Goal', subtitle: 'What are you aiming for?', icon: Target },
];

export default function Onboarding() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(String(user?.age || 20));
  const [height, setHeight] = useState(String(user?.height || 170));
  const [weight, setWeight] = useState(String(user?.weight || 65));
  const [goal, setGoal] = useState<'gain' | 'lose' | 'maintain'>(user?.goal || 'maintain');

  const next = () => {
    if (step === 0 && !name.trim()) { toast.error('Please enter your name'); return; }
    if (step === 1 && (!age || !height || !weight)) { toast.error('Please fill all fields'); return; }
    if (step < 2) setStep(s => s + 1);
    else finish();
  };

  const finish = () => {
    updateProfile({
      name: name.trim(),
      age: parseInt(age),
      height: parseInt(height),
      weight: parseInt(weight),
      goal,
    });
    toast.success('Profile set up! Welcome to FitGrad 🎉');
    // Mark onboarding complete
    if (user) localStorage.setItem(`fitgrad_onboarded_${user.id}`, 'true');
    navigate('/dashboard');
  };

  const goalOptions = [
    { value: 'lose' as const, emoji: '🔥', label: 'Lose Weight', desc: 'Burn fat and slim down' },
    { value: 'maintain' as const, emoji: '⚖️', label: 'Maintain', desc: 'Stay at current weight' },
    { value: 'gain' as const, emoji: '💪', label: 'Gain Muscle', desc: 'Build mass and strength' },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-2xl font-bold text-foreground">FitGrad</span>
        </div>

        {/* Step indicator */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step ? 'w-10 gradient-primary' : i < step ? 'w-6 bg-primary/40' : 'w-6 bg-muted'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border border-border bg-card p-8 shadow-elevated"
          >
            <div className="mb-6 flex items-center gap-3">
              {(() => { const Icon = steps[step].icon; return (
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
                  <Icon className="h-5 w-5 text-accent-foreground" />
                </div>
              ); })()}
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">{steps[step].title}</h2>
                <p className="text-sm text-muted-foreground">{steps[step].subtitle}</p>
              </div>
            </div>

            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">What should we call you?</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground outline-none ring-ring focus:ring-2"
                    placeholder="Your name"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={e => setAge(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground outline-none ring-ring focus:ring-2"
                    placeholder="20"
                    min="10" max="100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Height (cm)</label>
                    <input
                      type="number"
                      value={height}
                      onChange={e => setHeight(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground outline-none ring-ring focus:ring-2"
                      placeholder="170"
                      min="100" max="250"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">Weight (kg)</label>
                    <input
                      type="number"
                      value={weight}
                      onChange={e => setWeight(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground outline-none ring-ring focus:ring-2"
                      placeholder="65"
                      min="30" max="300"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                {goalOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setGoal(opt.value)}
                    className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                      goal === opt.value
                        ? 'border-primary bg-accent shadow-card'
                        : 'border-border bg-background hover:border-primary/30'
                    }`}
                  >
                    <span className="text-3xl">{opt.emoji}</span>
                    <div>
                      <p className="font-semibold text-foreground">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between">
              {step > 0 ? (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="flex items-center gap-1 rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
              ) : <div />}
              <button
                onClick={next}
                className="flex items-center gap-2 rounded-xl gradient-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-shadow hover:shadow-elevated"
              >
                {step === 2 ? (
                  <>
                    <Sparkles className="h-4 w-4" /> Get Started
                  </>
                ) : (
                  <>
                    Continue <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
