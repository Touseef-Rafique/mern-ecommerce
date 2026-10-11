import mongoose from "mongoose";

const mobileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 120,
    },
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
      lowercase: true,
      maxlength: 40,
      index: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      index: true,
    },
    specs: {
      ram: { type: String, trim: true, maxlength: 30 },
      storage: { type: String, trim: true, maxlength: 30 },
      battery: { type: String, trim: true, maxlength: 30 },
      camera: { type: String, trim: true, maxlength: 30 },
    },
    image: String,
  },
  { timestamps: true }
);

const Mobile = mongoose.model("Mobile", mobileSchema);
export default Mobile;