/**
 * One-off seed script (replaces the old unauthenticated POST /api/mobiles/seed route,
 * which let anyone on the internet wipe the products collection).
 *
 * Usage:  npm run seed          (reads images from ./uploads, DELETES existing mobiles)
 *         then: npm run migrate:images   (uploads those images to Cloudinary)
 */
import fs from "fs";
import path from "path";
import "../src/config/env.js";
import { connectDB, disconnectDB } from "../src/config/db.js";
import Mobile from "../src/models/Mobile.js";

if (!process.argv.includes("--confirm")) {
  console.error("This deletes ALL existing mobiles. Re-run with --confirm (npm run seed does this for you).");
  process.exit(1);
}

const uploadsDir = path.join(process.cwd(), "uploads");
const knownBrands = ["apple", "samsung", "oneplus", "oppo", "vivo", "xiaomi"];
const rand = (min, max) => Math.floor(Math.random() * (max - min)) + min;

const brandOf = (filename) => {
  const lower = filename.toLowerCase();
  return knownBrands.find((b) => lower.includes(b));
};

async function run() {
  if (!fs.existsSync(uploadsDir)) throw new Error(`No uploads folder found at ${uploadsDir}`);

  const images = fs.readdirSync(uploadsDir).filter((f) => /\.(jpe?g|png|webp|gif)$/i.test(f));
  if (images.length === 0) throw new Error("No image files found in the uploads folder");

  const unmatched = images.filter((f) => !brandOf(f));
  if (unmatched.length) console.warn(`⚠️  Skipping ${unmatched.length} image(s) with no known brand:`, unmatched);

  await connectDB();
  await Mobile.deleteMany();

  const counters = {};
  const docs = images
    .filter(brandOf)
    .map((file) => {
      const brand = brandOf(file);
      counters[brand] = (counters[brand] || 0) + 1;
      return {
        name: `${brand.toUpperCase()} ${counters[brand]}`,
        brand,
        price: rand(20000, 70000),
        specs: {
          ram: `${rand(2, 14)}GB`,
          storage: `${rand(64, 320)}GB`,
          battery: `${rand(3000, 5000)}mAh`,
          camera: `${rand(8, 108)}MP`,
        },
        image: `uploads/${file}`,
      };
    });

  await Mobile.insertMany(docs);
  console.log(`✅ ${docs.length} mobiles added`, counters);
}

run()
  .catch((err) => {
    console.error("❌ Seed failed:", err.message);
    process.exitCode = 1;
  })
  .finally(disconnectDB);