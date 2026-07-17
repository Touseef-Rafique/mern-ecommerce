import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import fs from "fs";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

import connectDB from "./connection.js";
import UserModel from "./models/UserModel.js";
import Mobile from "./models/Mobile.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;


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


connectDB()
  .then(() => {
    console.log("✅ DB Connected");
  })
  .catch((err) => {
    console.log("❌ DB Error:", err.message);
  });


app.use(
  cors({
    origin: "*", 
  })
);

app.use(express.json());


// Cloudinary config — reads credentials from environment variables (set these on Render)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Images are uploaded straight to Cloudinary instead of local disk, because Render's
// local filesystem is wiped on every restart/redeploy — local files would not persist.
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "technest-mobiles",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
  },
});

const upload = multer({ storage });





const ADMIN_EMAIL = "touseefrafique2008@gmail.com";

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await UserModel.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const hash = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
      name,
      email,
      password: hash,
    });

    const isAdmin = user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

    const token = jwt.sign({ id: user._id, isAdmin }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token, userId: user._id, isAdmin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


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


// NOTE: this seed route reads images from a local "uploads/" folder — it only works
// when run locally (or once, right after deploying, before the filesystem resets).
// It does not work as a way to add products on the live Render instance long-term.
app.post("/api/mobiles/seed", async (req, res) => {
  try {
    const uploadsDir = path.join(process.cwd(), "uploads");

    const allFiles = fs.readdirSync(uploadsDir);

  
    const imageFiles = allFiles.filter((f) =>
      /\.(jpe?g|png|webp|gif)$/i.test(f)
    );

    if (imageFiles.length < 1) {
      return res.status(400).json({
        message: "No image files found in the uploads folder",
      });
    }

    const knownBrands = ["apple", "samsung", "oneplus", "oppo", "vivo", "xiaomi"];

   
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


app.get("/api/mobiles", async (req, res) => {
  try {
    const data = await Mobile.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/mobiles/:id", async (req, res) => {
  try {
    const item = await Mobile.findById(req.params.id);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.patch("/api/mobiles/:id", requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const update = {};

    if (req.body.name) update.name = req.body.name;
    if (req.file) update.image = req.file.path; // Cloudinary returns the full hosted URL here

    const updated = await Mobile.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get("/", (req, res) => {
  res.send("API Running 🚀");
});


app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});