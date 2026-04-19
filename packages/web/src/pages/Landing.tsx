import { Link } from 'react-router-dom';
import { Activity, Apple, BarChart3, Dumbbell, Target, Users, ArrowRight, Sparkles, Zap, Star, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  { icon: Apple, title: 'Smart Diet Tracking', desc: 'AI-powered nutrition lookup. Log meals instantly with auto-detected calories, protein, carbs & more.', color: 'from-emerald-400 to-cyan-400' },
  { icon: Dumbbell, title: 'Workout Intelligence', desc: 'Log gym, cardio, yoga & more with calorie burn tracking and weekly trend analytics.', color: 'from-violet-400 to-purple-500' },
  { icon: BarChart3, title: 'Visual Analytics', desc: 'Beautiful charts and progress rings that make your fitness journey crystal clear.', color: 'from-blue-400 to-cyan-400' },
  { icon: Target, title: 'Personalized Goals', desc: 'Set and track custom goals — whether you want to gain muscle, lose fat, or maintain.', color: 'from-orange-400 to-pink-500' },
  { icon: Users, title: 'Student-First Design', desc: 'Built specifically for busy college students who need simplicity without sacrifice.', color: 'from-pink-400 to-rose-500' },
  { icon: Activity, title: 'BMI & Progress', desc: 'Track BMI, weekly streaks, and see your transformation through beautiful dashboards.', color: 'from-emerald-400 to-teal-500' },
];

const stats = [
  { value: '10K+', label: 'Active Students' },
  { value: '500K+', label: 'Meals Tracked' },
  { value: '98%', label: 'Satisfaction' },
  { value: '4.9', label: 'App Rating', icon: Star },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-glow-primary">
                <Activity className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
            <span className="font-display text-xl font-bold text-foreground">
              Fit<span className="text-gradient-primary">Grad</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground hover:bg-muted/50"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="group relative rounded-xl gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow-primary transition-all hover:shadow-[0_0_30px_hsl(160_90%_45%/0.4)] hover:scale-105"
            >
              <span className="flex items-center gap-1.5">
                Get Started <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center animated-gradient-bg">
        {/* Background orbs */}
        <div className="orb orb-green w-[500px] h-[500px] -top-32 -left-32 animate-float" />
        <div className="orb orb-purple w-[400px] h-[400px] top-20 right-[-100px] animate-float-delayed" />
        <div className="orb orb-blue w-[300px] h-[300px] bottom-10 left-1/4 animate-float-slow" />
        
        {/* Dot pattern overlay */}
        <div className="absolute inset-0 bg-dots opacity-30" />
        
        <div className="relative mx-auto max-w-6xl px-4 py-32 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-sm font-medium text-primary backdrop-blur-sm"
            >
              <Sparkles className="h-4 w-4" />
              Built for College Students
              <ChevronRight className="h-3.5 w-3.5" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-8 font-display text-5xl font-extrabold leading-[1.1] text-foreground md:text-7xl lg:text-8xl"
            >
              Your Smart Diet &<br />
              <span className="text-gradient-hero">Fitness Companion</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
            >
              Track meals, log workouts, and crush your fitness goals — all in one 
              beautifully designed platform that makes healthy living <span className="text-foreground font-medium">effortless</span>.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
            >
              <Link
                to="/register"
                className="group relative rounded-2xl gradient-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-glow-primary transition-all hover:shadow-[0_0_40px_hsl(160_90%_45%/0.5)] hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  Start Free Today
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
              <Link
                to="/login"
                className="group rounded-2xl border border-border bg-card/50 backdrop-blur-sm px-8 py-4 text-base font-semibold text-foreground transition-all hover:bg-card hover:border-primary/30 hover:shadow-glow-primary"
              >
                <span className="flex items-center gap-2">
                  Sign In
                  <Zap className="h-4 w-4 text-primary" />
                </span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Social proof stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-20 grid grid-cols-2 gap-4 sm:grid-cols-4"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + i * 0.1 }}
                className="rounded-2xl glass-card p-5 text-center hover-lift"
              >
                <p className="text-2xl font-bold text-gradient-primary md:text-3xl flex items-center justify-center gap-1">
                  {stat.value}
                  {stat.icon && <stat.icon className="h-5 w-5 text-yellow-400 fill-yellow-400" />}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-24 mesh-gradient">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
              <Zap className="h-3.5 w-3.5" /> POWERFUL FEATURES
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold text-foreground md:text-5xl">
              Everything You Need to{' '}
              <span className="text-gradient-hero">Stay Fit</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              Powerful features designed to help you build healthy habits during your college years.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative rounded-2xl border border-border bg-card/50 p-7 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card hover-lift"
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: 'radial-gradient(ellipse at 50% 0%, hsl(160 90% 45% / 0.08) 0%, transparent 70%)' }}
                />
                <div className="relative">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} shadow-lg`}>
                    <f.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 overflow-hidden">
        <div className="orb orb-green w-[400px] h-[400px] top-0 right-[-200px] animate-float" />
        <div className="orb orb-purple w-[300px] h-[300px] bottom-0 left-[-150px] animate-float-delayed" />
        
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-glow-primary animate-pulse-glow mb-6">
              <Activity className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="font-display text-4xl font-bold text-foreground md:text-5xl">
              Ready to <span className="text-gradient-primary">Get Fit</span>?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join thousands of students who've transformed their health with FitGrad.
            </p>
            <Link
              to="/register"
              className="group mt-8 inline-flex items-center gap-2 rounded-2xl gradient-primary px-10 py-4 text-lg font-semibold text-primary-foreground shadow-glow-primary transition-all hover:shadow-[0_0_50px_hsl(160_90%_45%/0.5)] hover:scale-105"
            >
              Create Free Account
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
          © 2026 FitGrad — Smart Diet & Fitness Companion. Built with ❤️ for college students.
        </div>
      </footer>
    </div>
  );
}
