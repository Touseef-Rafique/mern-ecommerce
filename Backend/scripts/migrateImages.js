/**
 * Uploads local images from ./uploads to Cloudinary and stores the URLs on each mobile.
 * Safe to re-run: mobiles whose image is already a Cloudinary/http URL are skipped.
 *
 * Usage: npm run migrate:images
 */
import fs from "fs";
import path from "path";
import "../src/config/env.js";
import cloudinary from "../src/config/cloudinary.js";
import { connectDB, disconnectDB } from "../src/config/db.js";
import Mobile from "../src/models/Mobile.js";

const uploadsDir = path.join(process.cwd(), "uploads");

// brand in the database -> filename prefix of its images
const imageMap = {
  apple: "Apple",
  samsung: "Samsung",
  oneplus: "Oneplus",
  oppo: "Oppo",
  vivo: "Vivo",
  xiaomi: "Redmi",
};

async function run() {
  if (!fs.existsSync(uploadsDir)) throw new Error(`No uploads folder found at ${uploadsDir}`);
  await connectDB();

  const mobiles = await Mobile.find().sort({ _id: 1 });
  const byBrand = {};
  for (const m of mobiles) (byBrand[m.brand] ||= []).push(m);

  const allFiles = fs.readdirSync(uploadsDir);

  for (const [brand, products] of Object.entries(byBrand)) {
    const prefix = imageMap[brand];
    if (!prefix) {
      console.warn(`⚠️  No image prefix configured for brand "${brand}", skipping`);
      continue;
    }

    const images = allFiles
      .filter((f) => f.startsWith(prefix) && /\.(png|jpe?g|webp)$/i.test(f))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    console.log(`\n${brand}: ${products.length} products | ${images.length} images`);

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      if (/^https?:\/\//i.test(product.image || "")) continue; // already migrated

      const file = images[i];
      if (!file) {
        console.warn(`⚠️  No image left for ${product.name}, skipping`);
        continue;
      }

      console.log(`Uploading ${product.name} -> ${file}`);
      const result = await cloudinary.uploader.upload(path.join(uploadsDir, file), {
        folder: "technest-mobiles",
        use_filename: true,
        unique_filename: false,
        overwrite: true,
      });

      product.image = result.secure_url;
      await product.save();
      console.log("✅ Updated");
    }
  }

  console.log("\n🎉 Migration complete");
}

run()
  .catch((err) => {
    console.error("❌ Migration failed:", err.message);
    process.exitCode = 1;
  })
  .finally(disconnectDB);