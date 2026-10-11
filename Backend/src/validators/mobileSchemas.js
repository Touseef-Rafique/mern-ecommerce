import { z } from "zod";

// Multipart forms send "" for untouched inputs; treat those as "not provided".
const stripEmpty = (obj) =>
  obj && typeof obj === "object" && !Array.isArray(obj)
    ? Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== ""))
    : obj;

const spec = z.string().trim().max(30, "Spec value is too long").optional();

const price = (required) =>
  z.coerce
    .number({ invalid_type_error: "Price must be a number", required_error: "Price is required" })
    .min(0, "Price cannot be negative")
    .max(10_000_000, "Price is too large");

export const createMobileSchema = z.preprocess(
  stripEmpty,
  z.object({
    name: z
      .string({ required_error: "Name is required" })
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(120, "Name is too long"),
    brand: z
      .string({ required_error: "Brand is required" })
      .trim()
      .toLowerCase()
      .min(2, "Brand must be at least 2 characters")
      .max(40, "Brand is too long"),
    price: price(true),
    ram: spec,
    storage: spec,
    battery: spec,
    camera: spec,
  })
);

export const updateMobileSchema = z.preprocess(
  stripEmpty,
  z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(120, "Name is too long").optional(),
    brand: z.string().trim().toLowerCase().min(2, "Brand must be at least 2 characters").max(40).optional(),
    price: price(false).optional(),
    ram: spec,
    storage: spec,
    battery: spec,
    camera: spec,
  })
);

export const listMobilesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(100),
  brand: z.string().trim().toLowerCase().max(40).optional(),
  search: z.string().trim().max(60).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  // "default" keeps the original insertion order the frontend already relies on.
  sort: z.enum(["default", "newest", "price_asc", "price_desc", "name"]).default("default"),
});

export const idParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid mobile id"),
});