import { Router } from "express";
import {
  createMobile,
  deleteMobile,
  getMobile,
  listMobiles,
  updateMobile,
} from "../controllers/mobileController.js";
import { protect, requireAdmin } from "../middleware/auth.js";
import { uploadImage } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";
import {
  createMobileSchema,
  idParamSchema,
  listMobilesQuerySchema,
  updateMobileSchema,
} from "../validators/mobileSchemas.js";

const router = Router();

// Public
router.get("/", validate(listMobilesQuerySchema, "query"), listMobiles);
router.get("/:id", validate(idParamSchema, "params"), getMobile);

// Admin only. Auth runs before the upload so unauthorized requests never reach Cloudinary.
router.post("/", protect, requireAdmin, uploadImage, validate(createMobileSchema), createMobile);
router.patch(
  "/:id",
  protect,
  requireAdmin,
  validate(idParamSchema, "params"),
  uploadImage,
  validate(updateMobileSchema),
  updateMobile
);
router.delete("/:id", protect, requireAdmin, validate(idParamSchema, "params"), deleteMobile);

export default router;