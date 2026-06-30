import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import fs from "fs";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./connection.js";
import UserModel from "./models/UserModel.js";
import Mobile from "./models/Mobile.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware: only lets the request through if the JWT is valid AND
// carries isAdmin: true. Used to protect admin-only routes (like
// updating a product's image) from being called directly via
// Postman/curl by a non-admin user, even if they have a valid login token.
const requireAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: "Admin access only" });
    }
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// ---------------- DB CONNECTION ----------------
connectDB()
  .then(() => {
    console.log("✅ DB Connected");
  })
  .catch((err) => {
    console.log("❌ DB Error:", err.message);
  });

// ---------------- MIDDLEWARE ----------------
app.use(
  cors({
    origin: "*", // change later to your Vercel URL
  })
);

app.use(express.json());
app.use("/uploads", express.static("uploads"));

// ---------------- CREATE UPLOADS FOLDER ----------------
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// ---------------- MULTER ----------------
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ======================================================
// AUTH ROUTES
// ======================================================

// SIGNUP
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await UserModel.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const hash = await bcrypt.hash(password, 10);

    await UserModel.create({
      name,
      email,
      password: hash,
    });

    res.json({ message: "Signup successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Only this email is treated as admin. Checked on the backend so it
// can't be spoofed by editing frontend code or localStorage.
const ADMIN_EMAIL = "touseefrafique2008@gmail.com";

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const isAdmin = user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

    const token = jwt.sign({ id: user._id, isAdmin }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token, userId: user._id, isAdmin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PROFILE
app.get("/profile", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json(decoded);
  } catch {
    res.status(403).json({ message: "Invalid token" });
  }
});

// ======================================================
// SEED 100 MOBILES
// ======================================================
app.post("/api/mobiles/seed", async (req, res) => {
  try {
    const uploadsDir = path.join(process.cwd(), "uploads");

    const allFiles = fs.readdirSync(uploadsDir);

    // Only keep actual image files (skip any stray non-image files in the folder)
    const imageFiles = allFiles.filter((f) =>
      /\.(jpe?g|png|webp|gif)$/i.test(f)
    );

    if (imageFiles.length < 1) {
      return res.status(400).json({
        message: "No image files found in the uploads folder",
      });
    }

    const knownBrands = ["apple", "samsung", "oneplus", "oppo", "vivo", "xiaomi"];

    // Derive the brand directly from each filename (e.g. "samsung_1.jpg" -> "samsung")
    // instead of assigning brands by array position, which had no relationship
    // to what the image actually showed.
    const getBrandFromFilename = (filename) => {
      const lower = filename.toLowerCase();
      return knownBrands.find((b) => lower.includes(b)) || "unknown";
    };

    const unmatched = imageFiles.filter(
      (f) => getBrandFromFilename(f) === "unknown"
    );
    if (unmatched.length > 0) {
      console.warn(
        `⚠️ ${unmatched.length} image(s) didn't match a known brand and will be skipped:`,
        unmatched
      );
    }

    await Mobile.deleteMany();

    // Track a running count per brand so names go Apple 1, Apple 2, Samsung 1, etc.
    const brandCounters = {};

    const mobiles = imageFiles
      .filter((filename) => getBrandFromFilename(filename) !== "unknown")
      .map((filename) => {
        const brand = getBrandFromFilename(filename);
        brandCounters[brand] = (brandCounters[brand] || 0) + 1;

        return {
          name: `${brand.toUpperCase()} ${brandCounters[brand]}`,
          brand,
          price: Math.floor(Math.random() * 50000) + 20000,
          specs: {
            ram: `${Math.floor(Math.random() * 12) + 2}GB`,
            storage: `${Math.floor(Math.random() * 256) + 64}GB`,
            battery: `${3000 + Math.floor(Math.random() * 2000)}mAh`,
            camera: `${8 + Math.floor(Math.random() * 100)}MP`,
          },
          image: `uploads/${filename}`,
        };
      });

    await Mobile.insertMany(mobiles);

    res.json({
      message: `${mobiles.length} mobiles added successfully`,
      skipped: unmatched.length,
      breakdown: brandCounters,
    });
  } catch (err) {
    res.status(500).json({ message: "Seed error", error: err.message });
  }
});

// ======================================================
// MOBILES API
// ======================================================

// GET ALL
app.get("/api/mobiles", async (req, res) => {
  try {
    const data = await Mobile.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ONE
app.get("/api/mobiles/:id", async (req, res) => {
  try {
    const item = await Mobile.findById(req.params.id);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
app.patch("/api/mobiles/:id", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const update = {};

    if (req.body.name) update.name = req.body.name;
    if (req.file) update.image = `uploads/${req.file.filename}`;

    const updated = await Mobile.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ======================================================
// HOME
// ======================================================
app.get("/", (req, res) => {
  res.send("API Running 🚀");
});

// ======================================================
// START SERVER
// ======================================================
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});