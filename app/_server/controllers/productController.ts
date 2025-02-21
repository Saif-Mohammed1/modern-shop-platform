import AppError from "@/app/lib/utilities/appError";
import { destroyImage, uploadImage } from "@/app/lib/utilities/cloudinary";
import type { NextRequest } from "next/server";
import { productControllerTranslate } from "../../../public/locales/server/productControllerTranslate";
import { lang } from "@/app/lib/utilities/lang";
import Product, { IProduct } from "../models/Product.model";
import { getReviews } from "./reviewsController";

// import path from "path";
// import os from "os";
// import fs from "fs/promises";
// import { UTApi } from "uploadthing/server";

export const createProduct = async (req: NextRequest) => {
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
    let uploadedImages: IProduct["images"] = []; // [];
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

    doc = await Product.create({
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
      await Product.findByIdAndDelete(doc._id);
    }
    throw error;
  }
};
export const deleteProduct = async (req: NextRequest) => {
  try {
    const doc = await Product.findById(req.id); //.select("+public_id");

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

    await Product.findByIdAndDelete(req.id);

    return {
      data: null,
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};

export const deleteProductImages = async (req: NextRequest) => {
  /**
   * images: [{
   *  link: 'https://res.cloudinary.com/dv0qpha02/image/upload/v1725776922/shop/products/njzfaobweakcfzdi0bl8.jpg',
   * public_id: 'shop/products/njzfaobweakcfzdi0bl8'
   * }]
   */

  try {
    const { public_id } = await req.json();
    const doc = await Product.findById(req.id);

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

export const updateProduct = async (req: NextRequest) => {
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

    const doc = await Product.findById(req.id);

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
      // Assert the key is of type keyof IProduct and assign only if it's different
      // check if the key is in the document and the value is different from the new value before assigning it to the document
      if (key in doc && data[key] !== doc[key as keyof IProduct]) {
        (doc[key as keyof IProduct] as unknown) = data[key];
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

export const getTopOffersAndNewProducts = async () => {
  const products = await Product.aggregate([
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
export const getUniqueCategories = async () => {
  try {
    const categories = await Product.distinct("category");
    return {
      categories,
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};
export const getOneProduct = async (req: NextRequest) => {
  //popOptions ={path: 'user', select: 'name email'}
  try {
    const doc = await Product.findOne({
      slug: req.slug,
    }).lean();

    if (!doc) {
      throw new AppError(
        productControllerTranslate[lang].errors.noProductFoundWithId,
        404
      );
    }
    return { data: doc, statusCode: 200 };
  } catch (error) {
    throw error;
  }
};
export const getOneProductAndRelatedProductsAndReviews = async (
  req: NextRequest
) => {
  try {
    // 1. First get the product (prerequisite for the next steps)
    const { data: product } = await getOneProduct(req);
    req.id = String(product._id);
    // 2. Run these two parallel since they don't depend on each other
    const [relatedProducts, reviews] = await Promise.all([
      getRelatedProducts(product.category),
      getReviews(req),
    ]);

    return {
      data: {
        product,
        relatedProducts,
        reviews,
      },
      statusCode: 200,
    };
  } catch (error) {
    throw error; // Consider adding error handling/formatting here
  }
};
const getRelatedProducts = async (category: string) => {
  try {
    const products = await Product.find({
      category,
    })
      .limit(10)
      .lean();
    return products;
  } catch (error) {
    throw error;
  }
};

export const updateProductActivity = async (req: NextRequest) => {
  try {
    const { active } = await req.json();
    const doc = await Product.findByIdAndUpdate(
      req.id,
      { active },
      { new: true }
    );
    if (!doc) {
      throw new AppError(
        productControllerTranslate[lang].errors.noProductFoundWithId,
        404
      );
    }
    return {
      message:
        productControllerTranslate[lang].functions.updateProductActivity
          .success,
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};
