import multer from "multer";
import { CloudinaryStorage } from "multer-storage-Cloudinary";
import Cloudinary from "../config/Cloudinary.js";
import { AppError } from "../utils/AppError.js";

// Images go straight to Cloudinary because the host's local disk is wiped on every deploy.
const storage = new CloudinaryStorage({
  Cloudinary,
  params: {
    folder: "technest-mobiles",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
  },
});

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const uploader = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return cb(new AppError("Only JPG, PNG, WEBP or GIF images are allowed", 400, "INVALID_FILE_TYPE"));
    }
    cb(null, true);
  },
});

export const uploadImage = uploader.single("image");