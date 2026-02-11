import { Link } from "react-router-dom";
import { Activity } from "lucide-react";

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary">
          <Activity className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="mb-4 font-display text-4xl font-bold text-foreground">FitGrad</h1>
        <p className="text-lg text-muted-foreground">Smart Diet & Fitness Companion</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-lg gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default Index;
