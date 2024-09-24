import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Your uploadImage function
export const uploadImage = async (image: string, folder: string) => {
  try {
    const url = await cloudinary.uploader.upload(image, {
      folder: folder, // Specify the folder where you want to upload the image
    });

    return url;
  } catch (error) {
    throw error;
  }
};
export const destroyImage = async (public_id: string, folder: string) => {
  try {
    // const url =
    await cloudinary.uploader.destroy(public_id, {
      // folder: folder, // Specify the folder where you want to upload the image
    });

    // return url;
  } catch (error) {
    throw error;
  }
};
