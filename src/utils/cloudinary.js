import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; // fs is inbuild filesystem api from nodejs. helps to deal with files

cloudinary.config({
  cloud_name: `${process.env.CLOUDINARY_CLOUD_NAME}`,
  api_key: `${process.env.CLOUDINARY_API_KEY}`,
  api_secret: `${process.env.CLOUDINARY_API_SECRET}`,
});

const uploadCloudinary = async (localFilePath) => { // localFilepath is a Filepath on server
  try {
    if (!localFilePath) return null;
    const cloudinaryReturn = await cloudinary.uploader.upload( localFilePath, { resource_type: "auto" } );
    fs.unlinkSync(localFilePath);
    return cloudinaryReturn;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove locally saves file 
    return null;
  }
};

export default uploadCloudinary;
