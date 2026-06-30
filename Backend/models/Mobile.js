import mongoose from "mongoose";

const MobileSchema = new mongoose.Schema({
  name: String,
  brand: String,
  price: Number,
  specs: {
    ram: String,
    storage: String,
    battery: String,
    camera: String,
  },
  image: String,
});

const Mobile = mongoose.model("Mobile", MobileSchema);
export default Mobile;
