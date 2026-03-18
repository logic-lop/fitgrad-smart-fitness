import { Link } from 'react-router-dom';
import { Activity, Apple, BarChart3, Dumbbell, Target, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  { icon: Apple, title: 'Diet Tracking', desc: 'Log meals and track daily calorie intake effortlessly.' },
  { icon: Dumbbell, title: 'Workout Logs', desc: 'Record gym, cardio, yoga & more with calorie tracking.' },
  { icon: BarChart3, title: 'Smart Analytics', desc: 'Visual charts and insights to keep you on track.' },
  { icon: Target, title: 'Goal Setting', desc: 'Set personalized goals — gain, lose, or maintain weight.' },
  { icon: Users, title: 'Student Friendly', desc: 'Designed for busy college students on the go.' },
  { icon: Activity, title: 'BMI & Progress', desc: 'Track BMI and see weekly/monthly progress charts.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">FitGrad</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="rounded-lg gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-shadow hover:shadow-elevated"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center md:py-32">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-block rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-accent-foreground">
              🎓 Built for College Students
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight text-foreground md:text-6xl">
              Your Smart Diet &<br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Fitness Companion
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
              Track meals, log workouts, and crush your fitness goals — all in one beautifully simple platform.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/register"
                className="rounded-xl gradient-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-elevated transition-transform hover:scale-105"
              >
                Start Free Today
              </Link>
              <Link
                to="/login"
                className="rounded-xl border border-border bg-card px-8 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-muted/50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center font-display text-3xl font-bold text-foreground">
            Everything You Need to Stay Fit
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-muted-foreground">
            Powerful features designed to help you build healthy habits during your college years.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-elevated"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent">
                  <f.icon className="h-5 w-5 text-accent-foreground" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground">Ready to Get Fit?</h2>
          <p className="mt-3 text-muted-foreground">
            Join FitGrad today and take the first step towards a healthier lifestyle.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-block rounded-xl gradient-primary px-10 py-4 text-base font-semibold text-primary-foreground shadow-elevated transition-transform hover:scale-105"
          >
            Create Free Account
          </Link>
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
