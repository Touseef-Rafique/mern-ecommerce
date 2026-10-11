import { v2 as Cloudinary } from "Cloudinary";
import { env } from "./env.js";

Cloudinary.config({
  cloud_name: env.Cloudinary.cloudName,
  api_key: env.Cloudinary.apiKey,
  api_secret: env.Cloudinary.apiSecret,
  secure: true,
});

/**
 * Best-effort delete of an image from its Cloudinary URL.
 * Never throws: a failed cleanup must not fail the request.
 */
export async function destroyByUrl(url) {
  if (!url || !url.includes("res.Cloudinary.com")) return;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.[a-z0-9]+$/i);
  if (!match) return;
  try {
    await Cloudinary.uploader.destroy(decodeURIComponent(match[1]));
  } catch (err) {
    console.warn("Cloudinary cleanup failed:", err.message);
  }
}

export default Cloudinary;