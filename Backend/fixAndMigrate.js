import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

import connectDB from "./connection.js";
import Mobile from "./models/Mobile.js";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const uploadsDir = path.join(process.cwd(), "uploads");


const imageMap = {
  apple: "Apple",
  samsung: "Samsung",
  oneplus: "Oneplus",
  oppo: "Oppo",
  vivo: "Vivo",
  xiaomi: "Redmi",
};


async function start() {

  await connectDB();

  const mobiles = await Mobile.find();


  const grouped = {};

  mobiles.forEach((mobile)=>{

    if(!grouped[mobile.brand]){
      grouped[mobile.brand] = [];
    }

    grouped[mobile.brand].push(mobile);

  });


  for(const brand in grouped){

    const products = grouped[brand];

    const prefix = imageMap[brand];


    const images = fs
      .readdirSync(uploadsDir)
      .filter(file =>
        file.startsWith(prefix) &&
        /\.(png|jpg|jpeg|webp)$/i.test(file)
      )
      .sort((a,b)=>
        a.localeCompare(b, undefined, {numeric:true})
      );


    console.log(
      `\n${brand}: ${products.length} products | ${images.length} images`
    );


    for(let i=0; i<products.length; i++){

      const filePath = path.join(
        uploadsDir,
        images[i]
      );


      console.log(
        `Uploading ${products[i].name} -> ${images[i]}`
      );


      const result = await cloudinary.uploader.upload(
        filePath,
        {
          folder:"technest-mobiles",
          use_filename:true,
          unique_filename:false,
          overwrite:true
        }
      );


      products[i].image = result.secure_url;

      await products[i].save();


      console.log("✅ Updated");
    }
  }


  console.log("\n🎉 Migration Complete");

  process.exit();

}


start();