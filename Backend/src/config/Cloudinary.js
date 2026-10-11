import { v2 as cloudinary } from "cloudinary";
import { env } from "./env.js";

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
  secure: true,
});

/**
 * Best-effort delete of an image from its Cloudinary URL.
 * Never throws: a failed cleanup must not fail the request.
 */
export async function destroyByUrl(url) {
  if (!url || !url.includes("res.cloudinary.com")) return;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.[a-z0-9]+$/i);
  if (!match) return;
  try {
    await cloudinary.uploader.destroy(decodeURIComponent(match[1]));
  } catch (err) {
    console.warn("Cloudinary cleanup failed:", err.message);
  }
}

export default cloudinary;