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
app.use(cors({ origin: ["http://localhost:8080", "http://localhost:5173", "http://localhost:3001"] }));
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

// ─── Nutrition Database (per 100g) ──────────────────────────────────────────
const nutritionDB: Record<string, { calories: number; protein: number; carbs: number; fat: number; fiber: number }> = {
  // Proteins
  "chicken breast": { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
  "chicken": { calories: 239, protein: 27, carbs: 0, fat: 14, fiber: 0 },
  "grilled chicken": { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
  "chicken thigh": { calories: 209, protein: 26, carbs: 0, fat: 10.9, fiber: 0 },
  "chicken wings": { calories: 203, protein: 30, carbs: 0, fat: 8, fiber: 0 },
  "turkey": { calories: 135, protein: 30, carbs: 0, fat: 1, fiber: 0 },
  "beef": { calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0 },
  "steak": { calories: 271, protein: 26, carbs: 0, fat: 18, fiber: 0 },
  "ground beef": { calories: 332, protein: 14, carbs: 0, fat: 30, fiber: 0 },
  "pork": { calories: 242, protein: 27, carbs: 0, fat: 14, fiber: 0 },
  "lamb": { calories: 294, protein: 25, carbs: 0, fat: 21, fiber: 0 },
  "fish": { calories: 206, protein: 22, carbs: 0, fat: 12, fiber: 0 },
  "salmon": { calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0 },
  "tuna": { calories: 130, protein: 29, carbs: 0, fat: 1, fiber: 0 },
  "shrimp": { calories: 99, protein: 24, carbs: 0.2, fat: 0.3, fiber: 0 },
  "prawns": { calories: 99, protein: 24, carbs: 0.2, fat: 0.3, fiber: 0 },
  "egg": { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 },
  "eggs": { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 },
  "boiled egg": { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 },
  "omelette": { calories: 154, protein: 11, carbs: 0.6, fat: 12, fiber: 0 },
  "paneer": { calories: 265, protein: 18, carbs: 1.2, fat: 21, fiber: 0 },
  "tofu": { calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3 },
  "cottage cheese": { calories: 98, protein: 11, carbs: 3.4, fat: 4.3, fiber: 0 },

  // Dairy
  "milk": { calories: 42, protein: 3.4, carbs: 5, fat: 1, fiber: 0 },
  "whole milk": { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0 },
  "yogurt": { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0 },
  "greek yogurt": { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0 },
  "curd": { calories: 60, protein: 3.1, carbs: 4.7, fat: 3.3, fiber: 0 },
  "cheese": { calories: 402, protein: 25, carbs: 1.3, fat: 33, fiber: 0 },
  "butter": { calories: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0 },
  "ghee": { calories: 900, protein: 0, carbs: 0, fat: 100, fiber: 0 },
  "whey protein": { calories: 400, protein: 80, carbs: 10, fat: 5, fiber: 0 },
  "protein shake": { calories: 120, protein: 24, carbs: 3, fat: 1.5, fiber: 0 },

  // Grains & Carbs
  "rice": { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 },
  "white rice": { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4 },
  "brown rice": { calories: 112, protein: 2.6, carbs: 24, fat: 0.9, fiber: 1.8 },
  "bread": { calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7 },
  "white bread": { calories: 265, protein: 9, carbs: 49, fat: 3.2, fiber: 2.7 },
  "whole wheat bread": { calories: 247, protein: 13, carbs: 41, fat: 3.4, fiber: 7 },
  "roti": { calories: 297, protein: 9.8, carbs: 56, fat: 3.7, fiber: 10 },
  "chapati": { calories: 297, protein: 9.8, carbs: 56, fat: 3.7, fiber: 10 },
  "naan": { calories: 262, protein: 8.7, carbs: 45, fat: 5.1, fiber: 2 },
  "paratha": { calories: 326, protein: 8, carbs: 45, fat: 13, fiber: 4 },
  "pasta": { calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8 },
  "noodles": { calories: 138, protein: 4.5, carbs: 25, fat: 2.1, fiber: 1 },
  "oats": { calories: 389, protein: 17, carbs: 66, fat: 7, fiber: 11 },
  "oatmeal": { calories: 68, protein: 2.4, carbs: 12, fat: 1.4, fiber: 1.7 },
  "cereal": { calories: 379, protein: 7, carbs: 84, fat: 1.8, fiber: 5 },
  "cornflakes": { calories: 357, protein: 7, carbs: 84, fat: 0.4, fiber: 1.2 },
  "poha": { calories: 130, protein: 2.5, carbs: 24, fat: 3, fiber: 1 },
  "upma": { calories: 130, protein: 3, carbs: 18, fat: 5, fiber: 2 },
  "dosa": { calories: 168, protein: 4, carbs: 27, fat: 4.5, fiber: 1 },
  "idli": { calories: 58, protein: 2, carbs: 10, fat: 0.4, fiber: 0.5 },
  "pizza": { calories: 266, protein: 11, carbs: 33, fat: 10, fiber: 2.3 },
  "burger": { calories: 295, protein: 17, carbs: 24, fat: 14, fiber: 1 },
  "sandwich": { calories: 250, protein: 12, carbs: 28, fat: 10, fiber: 2 },

  // Fruits
  "apple": { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4 },
  "banana": { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 },
  "orange": { calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4 },
  "mango": { calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6 },
  "grapes": { calories: 67, protein: 0.6, carbs: 17, fat: 0.4, fiber: 0.9 },
  "watermelon": { calories: 30, protein: 0.6, carbs: 8, fat: 0.2, fiber: 0.4 },
  "papaya": { calories: 43, protein: 0.5, carbs: 11, fat: 0.3, fiber: 1.7 },
  "pineapple": { calories: 50, protein: 0.5, carbs: 13, fat: 0.1, fiber: 1.4 },
  "strawberry": { calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2 },
  "blueberry": { calories: 57, protein: 0.7, carbs: 14, fat: 0.3, fiber: 2.4 },
  "pomegranate": { calories: 83, protein: 1.7, carbs: 19, fat: 1.2, fiber: 4 },

  // Vegetables
  "broccoli": { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6 },
  "spinach": { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 },
  "carrot": { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8 },
  "potato": { calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2 },
  "sweet potato": { calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3 },
  "tomato": { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 },
  "onion": { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7 },
  "cucumber": { calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5 },
  "capsicum": { calories: 20, protein: 0.9, carbs: 4.6, fat: 0.2, fiber: 1.7 },
  "mushroom": { calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, fiber: 1 },
  "corn": { calories: 86, protein: 3.2, carbs: 19, fat: 1.2, fiber: 2.7 },
  "peas": { calories: 81, protein: 5.4, carbs: 14, fat: 0.4, fiber: 5.1 },
  "cabbage": { calories: 25, protein: 1.3, carbs: 5.8, fat: 0.1, fiber: 2.5 },
  "cauliflower": { calories: 25, protein: 1.9, carbs: 5, fat: 0.3, fiber: 2 },
  "beans": { calories: 347, protein: 21, carbs: 63, fat: 1.2, fiber: 16 },

  // Legumes / Dal
  "dal": { calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 8 },
  "lentils": { calories: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 8 },
  "chickpeas": { calories: 164, protein: 8.9, carbs: 27, fat: 2.6, fiber: 7.6 },
  "rajma": { calories: 127, protein: 8.7, carbs: 23, fat: 0.5, fiber: 6.4 },
  "chole": { calories: 164, protein: 8.9, carbs: 27, fat: 2.6, fiber: 7.6 },
  "soybean": { calories: 446, protein: 36, carbs: 30, fat: 20, fiber: 9 },
  "peanuts": { calories: 567, protein: 26, carbs: 16, fat: 49, fiber: 8.5 },
  "almonds": { calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 12.5 },
  "cashews": { calories: 553, protein: 18, carbs: 30, fat: 44, fiber: 3.3 },
  "walnuts": { calories: 654, protein: 15, carbs: 14, fat: 65, fiber: 6.7 },

  // Indian Dishes
  "biryani": { calories: 200, protein: 8, carbs: 28, fat: 7, fiber: 1 },
  "chicken biryani": { calories: 220, protein: 12, carbs: 28, fat: 8, fiber: 1 },
  "khichdi": { calories: 120, protein: 4, carbs: 22, fat: 2, fiber: 2 },
  "samosa": { calories: 262, protein: 4, carbs: 28, fat: 15, fiber: 2 },
  "pakora": { calories: 240, protein: 5, carbs: 22, fat: 15, fiber: 1.5 },
  "curry": { calories: 110, protein: 5, carbs: 10, fat: 6, fiber: 2 },
  "chicken curry": { calories: 150, protein: 14, carbs: 6, fat: 8, fiber: 1 },
  "paneer butter masala": { calories: 240, protein: 12, carbs: 10, fat: 18, fiber: 1 },
  "dal fry": { calories: 120, protein: 6, carbs: 16, fat: 4, fiber: 4 },
  "palak paneer": { calories: 170, protein: 10, carbs: 6, fat: 12, fiber: 2 },
  "aloo gobi": { calories: 90, protein: 2.5, carbs: 13, fat: 3.5, fiber: 3 },
  "chole bhature": { calories: 450, protein: 12, carbs: 55, fat: 20, fiber: 5 },
  "pav bhaji": { calories: 290, protein: 6, carbs: 38, fat: 13, fiber: 4 },
  "maggi": { calories: 205, protein: 4.6, carbs: 27, fat: 9, fiber: 1 },

  // Drinks & Beverages
  "tea": { calories: 2, protein: 0, carbs: 0.5, fat: 0, fiber: 0 },
  "coffee": { calories: 2, protein: 0.3, carbs: 0, fat: 0, fiber: 0 },
  "chai": { calories: 72, protein: 2, carbs: 10, fat: 2.5, fiber: 0 },
  "lassi": { calories: 75, protein: 3, carbs: 12, fat: 2, fiber: 0 },
  "coconut water": { calories: 19, protein: 0.7, carbs: 3.7, fat: 0.2, fiber: 1.1 },
  "orange juice": { calories: 45, protein: 0.7, carbs: 10, fat: 0.2, fiber: 0.2 },
  "smoothie": { calories: 80, protein: 3, carbs: 14, fat: 1.5, fiber: 2 },
  "cold coffee": { calories: 120, protein: 3, carbs: 20, fat: 3, fiber: 0 },

  // Snacks & Fast Food
  "chips": { calories: 536, protein: 7, carbs: 53, fat: 35, fiber: 4.4 },
  "biscuit": { calories: 502, protein: 6, carbs: 62, fat: 25, fiber: 2 },
  "cookies": { calories: 502, protein: 5, carbs: 64, fat: 25, fiber: 2 },
  "cake": { calories: 347, protein: 4, carbs: 56, fat: 13, fiber: 1 },
  "chocolate": { calories: 546, protein: 5, carbs: 60, fat: 31, fiber: 7 },
  "ice cream": { calories: 207, protein: 3.5, carbs: 24, fat: 11, fiber: 0.6 },
  "french fries": { calories: 312, protein: 3.4, carbs: 41, fat: 15, fiber: 3.8 },
  "popcorn": { calories: 375, protein: 11, carbs: 74, fat: 4.3, fiber: 15 },
  "momos": { calories: 180, protein: 8, carbs: 21, fat: 7, fiber: 1 },
  "spring roll": { calories: 220, protein: 5, carbs: 28, fat: 10, fiber: 1.5 },
  "bhel puri": { calories: 160, protein: 4, carbs: 28, fat: 4, fiber: 2 },

  // Miscellaneous
  "honey": { calories: 304, protein: 0.3, carbs: 82, fat: 0, fiber: 0.2 },
  "sugar": { calories: 387, protein: 0, carbs: 100, fat: 0, fiber: 0 },
  "olive oil": { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
  "coconut oil": { calories: 862, protein: 0, carbs: 0, fat: 100, fiber: 0 },
  "avocado": { calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7 },
  "salad": { calories: 20, protein: 1.5, carbs: 3.5, fat: 0.2, fiber: 2 },
  "soup": { calories: 30, protein: 1.5, carbs: 5, fat: 0.5, fiber: 1 },
  "fried rice": { calories: 163, protein: 4, carbs: 23, fat: 6, fiber: 1 },
  "pulao": { calories: 160, protein: 4, carbs: 25, fat: 5, fiber: 1 },
};

// ─── Nutrition Lookup API ───────────────────────────────────────────────────
app.get("/api/nutrition/search", (req: Request, res: Response) => {
  const query = (req.query.q as string || "").toLowerCase().trim();
  if (!query) {
    return res.json({ results: [] });
  }

  const results = Object.entries(nutritionDB)
    .filter(([name]) => name.includes(query))
    .slice(0, 10)
    .map(([name, data]) => ({ name, ...data }));

  res.json({ results });
});

app.get("/api/nutrition/:foodName", (req: Request, res: Response) => {
  const foodName = req.params.foodName.toLowerCase().trim();

  // Exact match first
  if (nutritionDB[foodName]) {
    return res.json({ found: true, food: foodName, ...nutritionDB[foodName] });
  }

  // Partial match
  const match = Object.entries(nutritionDB).find(([name]) =>
    name.includes(foodName) || foodName.includes(name)
  );

  if (match) {
    return res.json({ found: true, food: match[0], ...match[1] });
  }

  res.json({ found: false });
});

// ─── Auth Routes ────────────────────────────────────────────────────────────
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

// ─── User Routes ────────────────────────────────────────────────────────────
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

// ─── Diet Entries Routes ────────────────────────────────────────────────────
app.post("/api/diet", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { foodName, quantity, calories, protein, carbs, fat, fiber, date } = req.body;

    const entry = await prisma.dietEntry.create({
      data: {
        userId: req.userId!,
        foodName,
        quantity: quantity || "",
        calories: parseInt(calories),
        protein: protein ? parseFloat(protein) : null,
        carbs: carbs ? parseFloat(carbs) : null,
        fat: fat ? parseFloat(fat) : null,
        fiber: fiber ? parseFloat(fiber) : null,
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

app.put("/api/diet/:id", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { foodName, quantity, calories, protein, carbs, fat, fiber } = req.body;

    const entry = await prisma.dietEntry.update({
      where: { id: req.params.id },
      data: {
        foodName,
        quantity,
        calories: calories ? parseInt(calories) : undefined,
        protein: protein !== undefined ? parseFloat(protein) : undefined,
        carbs: carbs !== undefined ? parseFloat(carbs) : undefined,
        fat: fat !== undefined ? parseFloat(fat) : undefined,
        fiber: fiber !== undefined ? parseFloat(fiber) : undefined,
      },
    });

    res.json(entry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update diet entry" });
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

// ─── Workout Entries Routes ─────────────────────────────────────────────────
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

app.put("/api/workout/:id", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { type, duration, calories } = req.body;

    const entry = await prisma.workoutEntry.update({
      where: { id: req.params.id },
      data: {
        type,
        duration: duration ? parseInt(duration) : undefined,
        calories: calories ? parseInt(calories) : undefined,
      },
    });

    res.json(entry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update workout entry" });
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
