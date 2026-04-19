import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Activity, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result) {
        toast.success('Welcome back!');
        navigate('/dashboard', { replace: true });
      } else {
        toast.error('Invalid email or password');
      }
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left decorative panel */}
      <div className="hidden w-1/2 items-center justify-center lg:flex relative overflow-hidden animated-gradient-bg">
        {/* Background orbs */}
        <div className="orb orb-green w-[400px] h-[400px] top-[-100px] left-[-100px] animate-float" />
        <div className="orb orb-purple w-[300px] h-[300px] bottom-[-50px] right-[-50px] animate-float-delayed" />
        <div className="orb orb-blue w-[200px] h-[200px] top-1/2 left-1/2 animate-float-slow" />
        <div className="absolute inset-0 bg-dots opacity-20" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative max-w-md text-center px-8"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl gradient-primary shadow-glow-primary animate-pulse-glow">
            <Activity className="h-10 w-10 text-primary-foreground" />
          </div>
          <h2 className="mt-8 font-display text-4xl font-bold text-foreground">Welcome Back</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Track your progress and stay on top of your fitness goals every single day.
          </p>
          <div className="mt-8 flex items-center justify-center gap-6 text-muted-foreground">
            <div className="text-center">
              <p className="text-2xl font-bold text-gradient-primary">500+</p>
              <p className="text-xs mt-1">Foods Database</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-gradient-primary">24/7</p>
              <p className="text-xs mt-1">Track Anytime</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-gradient-primary">Free</p>
              <p className="text-xs mt-1">Forever</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Form */}
      <div className="flex w-full items-center justify-center px-4 lg:w-1/2 mesh-gradient">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="mb-10 flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-glow-primary transition-shadow group-hover:shadow-[0_0_30px_hsl(160_90%_45%/0.4)]">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">
              Fit<span className="text-gradient-primary">Grad</span>
            </span>
          </Link>

          <h1 className="font-display text-3xl font-bold text-foreground">Sign in to your account</h1>
          <p className="mt-3 text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary transition-colors hover:text-primary/80">
              Sign up free →
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-card/50 px-4 py-3 text-sm text-foreground outline-none transition-all focus-glow placeholder:text-muted-foreground/50"
                placeholder="you@college.edu"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card/50 px-4 py-3 text-sm text-foreground outline-none transition-all focus-glow placeholder:text-muted-foreground/50"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="group w-full rounded-xl gradient-primary py-3 text-sm font-semibold text-primary-foreground shadow-glow-primary transition-all hover:shadow-[0_0_30px_hsl(160_90%_45%/0.4)] hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </span>
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
