import { destroyByUrl } from "../config/cloudinary.js";
import Mobile from "../models/Mobile.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const SORTS = {
  default: { _id: 1 },
  newest: { _id: -1 },
  price_asc: { price: 1, _id: 1 },
  price_desc: { price: -1, _id: 1 },
  name: { name: 1, _id: 1 },
};

const SPEC_FIELDS = ["ram", "storage", "battery", "camera"];

/**
 * Returns a plain array (same shape as before). Pagination info is in response headers,
 * so the existing frontend keeps working while new screens can use page/limit/filters.
 */
export const listMobiles = asyncHandler(async (req, res) => {
  const { page, limit, brand, search, minPrice, maxPrice, sort } = req.query;

  const filter = {};
  if (brand) filter.brand = brand;
  if (search) {
    const rx = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ name: rx }, { brand: rx }];
  }
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  const [items, total] = await Promise.all([
    Mobile.find(filter)
      .select("-__v")
      .sort(SORTS[sort])
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Mobile.countDocuments(filter),
  ]);

  res.set({
    "X-Total-Count": String(total),
    "X-Total-Pages": String(Math.max(1, Math.ceil(total / limit))),
    "X-Page": String(page),
  });
  res.json(items);
});

export const getMobile = asyncHandler(async (req, res) => {
  const mobile = await Mobile.findById(req.params.id).select("-__v").lean();
  if (!mobile) throw new AppError("Mobile not found", 404, "NOT_FOUND");
  res.json(mobile);
});

export const createMobile = asyncHandler(async (req, res) => {
  const { name, brand, price, ram, storage, battery, camera } = req.body;
  const mobile = await Mobile.create({
    name,
    brand,
    price,
    specs: { ram, storage, battery, camera },
    image: req.file?.path,
  });
  res.status(201).json(mobile);
});

export const updateMobile = asyncHandler(async (req, res) => {
  const existing = await Mobile.findById(req.params.id).select("image").lean();
  if (!existing) {
    if (req.file) await destroyByUrl(req.file.path);
    throw new AppError("Mobile not found", 404, "NOT_FOUND");
  }

  // Only fields that were actually sent are changed (dot-notation keeps untouched specs intact).
  const update = {};
  for (const key of ["name", "brand", "price"]) {
    if (req.body[key] !== undefined) update[key] = req.body[key];
  }
  for (const key of SPEC_FIELDS) {
    if (req.body[key] !== undefined) update[`specs.${key}`] = req.body[key];
  }
  if (req.file) update.image = req.file.path;

  if (Object.keys(update).length === 0) {
    throw new AppError("No fields to update", 400, "NO_CHANGES");
  }

  const updated = await Mobile.findByIdAndUpdate(
    req.params.id,
    { $set: update },
    { new: true, runValidators: true }
  );

  if (req.file && existing.image) await destroyByUrl(existing.image); // replaced image no longer needed
  res.json(updated);
});

export const deleteMobile = asyncHandler(async (req, res) => {
  const mobile = await Mobile.findByIdAndDelete(req.params.id);
  if (!mobile) throw new AppError("Mobile not found", 404, "NOT_FOUND");
  await destroyByUrl(mobile.image);
  res.json({ message: "Mobile deleted" });
});