import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Activity, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      const result = await register(name, email, password);
      if (result) {
        toast.success('Account created! Let\'s set up your profile.');
        navigate('/onboarding', { replace: true });
      }
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left decorative panel */}
      <div className="hidden w-1/2 items-center justify-center gradient-hero lg:flex">
        <div className="max-w-sm text-center text-primary-foreground">
          <Activity className="mx-auto h-16 w-16" />
          <h2 className="mt-6 font-display text-3xl font-bold">Start Your Journey</h2>
          <p className="mt-3 opacity-80">Create your free account and begin tracking today.</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex w-full items-center justify-center px-4 lg:w-1/2">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">FitGrad</span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-foreground">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground outline-none ring-ring focus:ring-2"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground outline-none ring-ring focus:ring-2"
                placeholder="you@college.edu"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground outline-none ring-ring focus:ring-2"
                  placeholder="Min 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full rounded-lg gradient-primary py-2.5 text-sm font-semibold text-primary-foreground transition-shadow hover:shadow-elevated"
            >
              Create Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
