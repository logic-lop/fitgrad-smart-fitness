import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();

const app: Express = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware
app.use(cors({ origin: "http://localhost:8080" }));
app.use(express.json());

// Types
interface AuthRequest extends Request {
  userId?: string;
}

// Middleware to verify JWT token
const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Auth Routes
app.post("/api/auth/register", async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/api/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        age: user.age,
        height: user.height,
        weight: user.weight,
        goal: user.goal,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
});

// User Routes
app.get("/api/user/profile", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        dietEntries: true,
        workoutEntries: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

app.put("/api/user/profile", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { name, age, height, weight, goal } = req.body;

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { name, age, height, weight, goal },
    });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Diet Entries Routes
app.post("/api/diet", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { foodName, calories, date } = req.body;

    const entry = await prisma.dietEntry.create({
      data: {
        userId: req.userId!,
        foodName,
        calories: parseInt(calories),
        date: date ? new Date(date) : new Date(),
      },
    });

    res.json(entry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create diet entry" });
  }
});

app.get("/api/diet", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const entries = await prisma.dietEntry.findMany({
      where: { userId: req.userId },
      orderBy: { date: "desc" },
    });

    res.json(entries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch diet entries" });
  }
});

app.delete("/api/diet/:id", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.dietEntry.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete diet entry" });
  }
});

// Workout Entries Routes
app.post("/api/workout", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { type, duration, calories, date } = req.body;

    const entry = await prisma.workoutEntry.create({
      data: {
        userId: req.userId!,
        type,
        duration: parseInt(duration),
        calories: parseInt(calories),
        date: date ? new Date(date) : new Date(),
      },
    });

    res.json(entry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create workout entry" });
  }
});

app.get("/api/workout", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const entries = await prisma.workoutEntry.findMany({
      where: { userId: req.userId },
      orderBy: { date: "desc" },
    });

    res.json(entries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch workout entries" });
  }
});

app.delete("/api/workout/:id", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.workoutEntry.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete workout entry" });
  }
});

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
