import AppError from "@/components/util/appError";
import { destroyImage, uploadImage } from "@/components/util/cloudinary";
import { Model } from "mongoose";
import type { NextRequest } from "next/server";
import { IProductSchema } from "../models/product.model";
import { productControllerTranslate } from "../_Translate/productControllerTranslate";
import { lang } from "@/components/util/lang";

// import path from "path";
// import os from "os";
// import fs from "fs/promises";
// import { UTApi } from "uploadthing/server";

export const createProduct = async (
  req: NextRequest,
  Model: Model<IProductSchema>
) => {
  let doc;
  try {
    let formData = await req.json();
    const {
      name,
      category,
      description,
      price,
      discount,
      stock,
      images,
      discountExpire,
    } = formData;
    if (!name || !category || !description || !price || !stock || !images) {
      throw new AppError(
        productControllerTranslate[lang].errors.requiredFields,
        400
      );
    }

    // Array to hold image URLs and public IDs after uploading to Cloudinary
    let uploadedImages: IProductSchema["images"] = []; // [];
    // Check if the discount is less than the price
    if (discount >= price) {
      throw new AppError(
        productControllerTranslate[lang].model.schema.discount.required,
        400
      );
    }
    // Upload each base64 image to Cloudinary
    for (const image of images) {
      validateBase64Image(image);
      const result = await uploadImage(image, "shop/shop-products");
      // Store the image URL and public ID
      uploadedImages.push({
        link: result.secure_url,
        public_id: result.public_id,
      });
    }

    doc = await Model.create({
      name,
      category,
      description,
      price,
      discount,
      discountExpire,
      stock,
      images: uploadedImages,
      user: req?.user?._id,
    });

    return {
      data: doc,
      statusCode: 201,
    };
  } catch (error) {
    if (doc) {
      await Model.findByIdAndDelete(doc._id);
    }
    throw error;
  }
};
export const deleteProduct = async (
  req: NextRequest,
  Model: Model<IProductSchema>
) => {
  try {
    const doc = await Model.findById(req.id); //.select("+public_id");

    if (!doc) {
      throw new AppError(
        productControllerTranslate[lang].errors.noProductFoundWithId,
        404
      );
    }
    if (doc.images) {
      // const utapi = new UTApi();
      for (const image of doc.images) {
        //   await utapi.deleteFiles(public_id);

        // for cloudainry
        await destroyImage(image.public_id);
      }
    }

    await Model.findByIdAndDelete(req.id);

    return {
      data: null,
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};

export const deleteProductImages = async (
  req: NextRequest,
  Model: Model<IProductSchema>
) => {
  /**
   * images: [{
   *  link: 'https://res.cloudinary.com/dv0qpha02/image/upload/v1725776922/shop/products/njzfaobweakcfzdi0bl8.jpg',
   * public_id: 'shop/products/njzfaobweakcfzdi0bl8'
   * }]
   */

  try {
    const { public_id } = await req.json();
    const doc = await Model.findById(req.id);

    if (!doc) {
      throw new AppError(
        productControllerTranslate[lang].errors.noProductFoundWithId,
        404
      );
    }

    // Filter images to delete
    const imagesToDelete = doc.images.filter((image) =>
      public_id.includes(image.public_id)
    );

    // Delete images from Cloudinary
    for (const image of imagesToDelete) {
      await destroyImage(image.public_id);
    }

    // Remove deleted images from the document
    doc.images = doc.images.filter(
      (image) => !public_id.includes(image.public_id)
    );

    // Save the updated document
    await doc.save();

    return {
      message: productControllerTranslate[lang].errors.ImageDeletedSuccessfully,
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};

export const updateProduct = async (
  req: NextRequest,
  Model: Model<IProductSchema>
) => {
  try {
    const data = await req.json();

    if (data.discount && data.price) {
      // Check if the discount is less than the price
      if (data.discount >= data.price) {
        throw new AppError(
          productControllerTranslate[lang].model.schema.discount.required,
          400
        );
      }
    }

    const doc = await Model.findById(req.id);

    if (!doc) {
      throw new AppError(
        productControllerTranslate[lang].errors.noProductFoundWithId,
        404
      );
    }

    if (data.images && data.images.length > 0) {
      let uploadedImages = [];

      // Upload each base64 image to Cloudinary
      for (const image of data.images) {
        validateBase64Image(image);
        const result = await uploadImage(image, "shop/shop-products");
        // Store the image URL and public ID
        uploadedImages.push({
          link: result.secure_url,
          public_id: result.public_id,
        });
      }

      // Merge old images with new images
      data.images = [...doc.images, ...uploadedImages];
    }
    // before typeScript
    // // Update the document with the new data
    // for (let key in data) {
    //   if (data[key] !== doc[key]) {
    //     doc[key] = data[key];
    //   }
    // }
    for (let key in data) {
      // Assert the key is of type keyof IProductSchema and assign only if it's different
      // check if the key is in the document and the value is different from the new value before assigning it to the document
      if (key in doc && data[key] !== doc[key as keyof IProductSchema]) {
        (doc[key as keyof IProductSchema] as unknown) = data[key];
      }
    }
    await doc.save();

    return {
      data: doc,
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};
// Helper function to validate base64 image
// const validateBase64Image = (image:string):void => {
//   // Split the base64 string into the prefix and the data
//   const [prefix, data] = image.split(",");

//   // Check the file type from the prefix (e.g., 'data:image/jpeg;base64')
//   const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
//   const mimeType = prefix.match(/data:(.*?);base64/)[1];

//   if (!allowedTypes.includes(mimeType)) {
//     throw new AppError(
//       "Invalid image type. Only JPEG and PNG are allowed.",
//       400
//     );
//   }

//   // Calculate the size of the image in bytes
//   // base64 encoding uses 4/3 of the size of the original data
//   const imageSizeInBytes = (data.length * 3) / 4;
//   const imageSizeInMB = imageSizeInBytes / (1024 * 1024);

//   if (imageSizeInMB > 2) {
//     throw new AppError("Image size exceeds 2MB.", 400);
//   }
// };
const validateBase64Image = (image: string): void => {
  // Split the base64 string into the prefix and the data
  const [prefix, data] = image.split(",");

  // Check the file type from the prefix (e.g., 'data:image/jpeg;base64')
  const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
  const mimeTypeMatch = prefix.match(/data:(.*?);base64/);

  // Add a null check for mimeTypeMatch
  if (!mimeTypeMatch || !mimeTypeMatch[1]) {
    throw new AppError(
      productControllerTranslate[
        lang
      ].functions.validateBase64Image.invalidImageFormat,
      400
    );
  }

  const mimeType = mimeTypeMatch[1];

  if (!allowedTypes.includes(mimeType)) {
    throw new AppError(
      productControllerTranslate[
        lang
      ].functions.validateBase64Image.invalidImageType,
      400
    );
  }

  // Calculate the size of the image in bytes
  const imageSizeInBytes = (data.length * 3) / 4;
  const imageSizeInMB = imageSizeInBytes / (1024 * 1024);

  if (imageSizeInMB > 2) {
    throw new AppError(
      productControllerTranslate[
        lang
      ].functions.validateBase64Image.imageSizeExceeds,
      400
    );
  }
};

export const getTopOffersAndNewProducts = async (
  Model: Model<IProductSchema>
) => {
  const products = await Model.aggregate([
    {
      $facet: {
        // Top Offer Products - Sorted by highest discount and rating, filtered by stock and minimum rating
        topOfferProducts: [
          {
            $match: {
              discount: { $gt: 0 }, // Ensure there's a discount
              stock: { $gt: 0 }, // Ensure the product is in stock
              // ratingsAverage: { $gte: .0 }, // Minimum rating of 4.0
            },
          },
          {
            $sort: { discount: -1 }, //ratingsAverage: -1 }, // Sort by discount first, then rating
          },
          {
            $limit: 20, // Limit to top 20 offer products
          },
        ],
        // New Products - Sorted by creation date and optionally filtered by rating
        newProducts: [
          {
            $match: {
              stock: { $gt: 0 }, // Only show products in stock
              // ratingsAverage: { $gte: 4.0 }, // Optional: Minimum rating of 4.0
            },
          },
          {
            $sort: { createdAt: -1 }, //ratingsAverage: -1 }, // Sort by creation date, then rating
          },
          {
            $limit: 20, // Limit to 20 new products
          },
        ],
        // Top Rating Products - Get products with ratings greater than or equal to 3 stars
        topRating: [
          {
            $match: {
              ratingsAverage: { $gte: 3.0 }, // Minimum rating of 3.0
              stock: { $gt: 0 }, // Only show products in stock
            },
          },
          {
            $sort: { ratingsAverage: -1 }, // Sort by rating (highest to lowest)
          },
          {
            $limit: 20, // Limit to top 20 products with the best ratings
          },
        ],
      },
    },
  ]);
  const data = {
    topOfferProducts: products[0].topOfferProducts,
    newProducts: products[0].newProducts,
    topRating: products[0].topRating,
  };
  return { data, statusCode: 200 };
};
export const getUniqueCategories = async (model: Model<IProductSchema>) => {
  try {
    const categories = await model.distinct("category");
    return {
      categories,
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};
