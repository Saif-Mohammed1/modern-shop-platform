import AppError from "@/components/util/appError";
import { destroyImage, uploadImage } from "@/components/util/cloudinary";
// import path from "path";
// import os from "os";
// import fs from "fs/promises";
// import { UTApi } from "uploadthing/server";

/**uploadedImages [
  'https://res.cloudinary.com/dv0qpha02/image/upload/v1725776922/shop/products/njzfaobweakcfzdi0bl8.jpg',
  'https://res.cloudinary.com/dv0qpha02/image/upload/v1725776932/shop/products/wgdtl8trpmiejrs5vzfa.jpg',
  'https://res.cloudinary.com/dv0qpha02/image/upload/v1725776940/shop/products/iisd7x20m7ylr7kygxdp.jpg'
]
public_ids [
  'shop/products/njzfaobweakcfzdi0bl8',
  'shop/products/wgdtl8trpmiejrs5vzfa',
  'shop/products/iisd7x20m7ylr7kygxdp'
] */
export const createProduct = async (req, Model) => {
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
      throw new AppError("Please provide all required fields", 400);
    }

    // Array to hold image URLs and public IDs after uploading to Cloudinary
    let uploadedImages = []; // [];
    // Check if the discount is less than the price
    if (discount >= price) {
      throw new AppError("Discount must be less than price", 400);
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
      user: req.user._id,
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
// export const createProduct = async (req, Model) => {
//   let doc;
//   try {
//     let formData = await req.formData();

//     console.log("formData", formData);

//     // let parsedDiscountExpire;
//     // if (data.discountExpire) {
//     //   parsedDiscountExpire = new Date(data.discountExpire);
//     //   if (isNaN(parsedDiscountExpire.getTime())) {
//     //     throw new AppError("Invalid discountExpire date format", 400);
//     //   } else {
//     //     data.discountExpire = parsedDiscountExpire;
//     //   }
//     // }

//     // Initialize an empty object to store form data
//     let extractedData = {};

//     // Iterate over the FormData entries
//     for (let [name, value] of formData.entries()) {
//       // Check if the field already exists in the extractedData object
//       if (extractedData.hasOwnProperty(name)) {
//         // If the field already exists and it's an array, push the new value
//         if (Array.isArray(extractedData[name])) {
//           extractedData[name].push(value);
//         } else {
//           // If the field already exists but it's not an array, convert it into an array and push the new value
//           extractedData[name] = [extractedData[name], value];
//         }
//       } else {
//         // If the field doesn't exist, add it to the extractedData object
//         extractedData[name] = value;
//       }
//     }
//     // Convert single image field to array if necessary
//     if (formData.getAll("images").length === 1) {
//       const singleImage = formData.getAll("images");

//       extractedData.images = singleImage;
//     }

//     console.log("extractedData", extractedData);
//     //for clodianry
//     // let imgUrl = [];
//     // let publicId = [];
//     // // if (extractedData.images) {
//     // //   if (extractedData.images.length > 4) {
//     // //     throw new AppError("Maximum image number is 4.", 400);
//     // //   }
//     // //   const allowedTypes = [
//     // //     "image/png",
//     // //     "image/jpeg",
//     // //     "image/jpg",
//     // //     "image/gif",
//     // //   ]; // Add the third specified image type here

//     // //   for (const img of extractedData.images) {
//     // //     if (!allowedTypes.includes(img.type)) {
//     // //       throw new AppError("Unsupported file type.", 400);
//     // //     }

//     // //     // Check file size (4 MB = 4 * 1024 * 1024 bytes)
//     // //     if (img.size > 4 * 1024 * 1024) {
//     // //       throw new AppError("Maximum file size is 4MB.", 400);
//     // //     }

//     // //     const bytes = await img.arrayBuffer();
//     // //     const buffer = Buffer.from(bytes);

//     // //     const ext = img.type.split("/")[1];
//     // //     const name = `user-${req.user._id}-${Date.now()}.${ext}`;

//     // //     // this does'nt work in vercel
//     // //     const uploadDir = path.join(
//     // //       process.cwd(),
//     // //       "public/tempProducts",
//     // //       "/" + name
//     // //     );

//     // //     // this work in verce
//     // //     // const tempDir = os.tmpdir();
//     // //     // const uploadDir = path.join(tempDir, "/" + name);
//     // //     fs.writeFile(uploadDir, buffer);
//     // //     const { url, public_id } = await uploadImage(
//     // //       uploadDir,
//     // //       "shop/products"
//     // //     );
//     // //     imgUrl.push(url);
//     // //     publicId.push(public_id);
//     // //     // Delete the file after getting the URL
//     // //     // fs.unlink(uploadDir, (err) => {
//     // //     //   if (err) {
//     // //     //     //console.error("Error deleting file:", err);
//     // //     //     throw err;
//     // //     //   }
//     // //     // });
//     // //   }
//     // //   if (imgUrl.length > 0) {
//     // //     extractedData.images = imgUrl;
//     // //     extractedData.public_id = publicId;
//     // //   }
//     // // }
//     doc = await Model.create({ ...extractedData, user: req.user._id });

//     return {
//       data: doc,
//       statusCode: 201,
//     };
//   } catch (error) {
//     if (doc) {
//       await Model.findByIdAndDelete(doc._id);
//     }
//     throw error;
//   }
// };
export const deleteProduct = async (req, Model) => {
  try {
    const doc = await Model.findById(req.id); //.select("+public_id");

    if (!doc) {
      throw new AppError("No document found with that ID", 404);
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

    // //console.log("err", error);
    // return NextResponse.json({ ...error });
  }
};

export const deleteProductImages = async (req, Model) => {
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
      throw new AppError("No document found with that ID", 404);
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
      message: "Images deleted successfully",
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};
// nextUploader
// // export const updateProductImage = async (req, Model) => {
// //   try {
// //     const doc = await Model.findById(req.id).select("+public_id");

// //     if (!doc) {
// //       throw new AppError("No document found with that ID", 404);
// //     }
// //     if (doc.public_id) {
// //       for (const public_id of doc.public_id) {
// //         await destroyImage(public_id);
// //       }
// //     }

// //     // Initialize an empty object to store form data
// //     let extractedData = {};

// //     // Convert single image field to array if necessary
// //     if (!Array.isArray(formData.get("images"))) {
// //       const singleImage = formData.get("images");
// //       //console.log("singleImage", singleImage);
// //       extractedData.images = [singleImage];
// //     }
// //     if (Array.isArray(formData.getAll("images"))) {
// //       const Image = formData.get("images");
// //       //console.log("Image", Image);
// //       extractedData.images = Image;
// //     }

// //     let imgUrl = [];
// //     let publicId = [];
// //     if (extractedData.images) {
// //       if (extractedData.images.length > 4) {
// //         throw new AppError("Maximum image number is 4.", 400);
// //       }
// //       const allowedTypes = [
// //         "image/png",
// //         "image/jpeg",
// //         "image/jpg",
// //         "image/gif",
// //       ]; // Add the third specified image type here

// //       for (const img of extractedData.images) {
// //         if (!allowedTypes.includes(img.type)) {
// //           throw new AppError("Unsupported file type.", 400);
// //         }

// //         // Check file size (4 MB = 4 * 1024 * 1024 bytes)
// //         if (img.size > 4 * 1024 * 1024) {
// //           throw new AppError("Maximum file size is 4MB.", 400);
// //         }

// //         const bytes = await img.arrayBuffer();
// //         const buffer = Buffer.from(bytes);

// //         const ext = img.type.split("/")[1];
// //         const name = `user-${req.user._id}-${Date.now()}.${ext}`;

// //         // this does'nt work in vercel
// //         // const uploadDir = path.join(
// //         //   process.cwd(),
// //         //   "public/tempProducts",
// //         //   "/" + name
// //         // );

// //         // this work in verce
// //         const tempDir = os.tmpdir();
// //         const uploadDir = path.join(tempDir, "/" + name);
// //         fs.writeFile(uploadDir, buffer);
// //         const { url, public_id } = await uploadImage(
// //           uploadDir,
// //           "shop/products"
// //         );
// //         imgUrl.push(url);
// //         publicId.push(public_id);
// //         // Delete the file after getting the URL
// //         // fs.unlink(uploadDir, (err) => {
// //         //   if (err) {
// //         //     //console.error("Error deleting file:", err);
// //         //     throw err;
// //         //   }
// //         // });
// //       }
// //       if (imgUrl.length > 0) {
// //         extractedData.images = imgUrl;
// //         extractedData.public_id = publicId;
// //       }
// //     }

// //     return {
// //       data: null,
// //       statusCode: 200,
// //     };
// //   } catch (error) {
// //     throw error;

// //     // //console.log("err", error);
// //     // return NextResponse.json({ ...error });
// //   }
// // };

// // nextUploader

// export const updateProductImage = async (req, Model) => {
//   try {
//     const doc = await Model.findById(req.id); //.select("+public_id");

//     if (!doc) {
//       throw new AppError("No document found with that ID", 404);
//     }

//     // Extract form data to get updated images
//     const formData = await req.formData();

//     // Initialize an empty array to store new image URLs and public IDs
//     const newImages = formData.getAll("images");
//     const newPublicIds = formData.getAll("public_id");

//     // if (formData.getAll("images").length > 4) {
//     //   throw new AppError("Maximum image number is 4.", 400);
//     // } // Iterate over each uploaded image
//     // for (const [name, image] of formData.entries()) {
//     //   // Validate the image
//     //   // Check file type
//     //   const allowedTypes = [
//     //     "image/png",
//     //     "image/jpeg",
//     //     "image/jpg",
//     //     "image/gif",
//     //   ];
//     //   if (!allowedTypes.includes(image.type)) {
//     //     throw new AppError("Unsupported file type.", 400);
//     //   }

//     //   // Check file size (4 MB = 4 * 1024 * 1024 bytes)
//     //   if (image.size > 4 * 1024 * 1024) {
//     //     throw new AppError("Maximum file size is 4MB.", 400);
//     //   }

//     //   // Process the image
//     //   const bytes = await image.arrayBuffer();
//     //   const buffer = Buffer.from(bytes);

//     //   const ext = image.type.split("/")[1];
//     //   const name = `user-${req.user._id}-${Date.now()}.${ext}`;
//     //   // this does'nt work in vercel
//     //   // const uploadDir = path.join(
//     //   //   process.cwd(),
//     //   //   "public/tempProducts",
//     //   //   "/" + name
//     //   // );

//     //   // this work in verce
//     //   const tempDir = os.tmpdir();
//     //   const uploadDir = path.join(tempDir, "/" + name);
//     //   fs.writeFile(uploadDir, buffer);
//     //   // Upload the image to storage and obtain URL and public ID
//     //   const { url, public_id } = await uploadImage(
//     //     uploadDir,
//     //     // name,
//     //     "shop/products"
//     //   );

//     //   // Add the URL and public ID to the arrays
//     //   newImages.push(url);
//     //   newPublicIds.push(public_id);
//     // }

//     // If the document has public IDs, delete the corresponding images
//     if (doc.public_id && doc.public_id.length > 0) {
//       const utapi = new UTApi();
//       for (const public_id of doc.public_id) {
//         await utapi.deleteFiles(public_id);

//         // await destroyImage(public_id);
//       }
//     }
//     // Update the document with the new image URLs and public IDs
//     doc.images = newImages;
//     doc.public_id = newPublicIds;
//     await doc.save();

//     return {
//       data: doc,
//       statusCode: 200,
//     };
//   } catch (error) {
//     throw error;
//   }
// };
// /**export const updateProductImage = async (req, Model) => {
//   try {
//     const doc = await Model.findById(req.id).select("+public_id");

//     if (!doc) {
//       throw new AppError("No document found with that ID", 404);
//     }

//     // If the document has public IDs, delete the corresponding images
//     if (doc.public_id && doc.public_id.length > 0) {
//       for (const public_id of doc.public_id) {
//         await destroyImage(public_id);
//       }
//     }

//     // Extract form data to get updated images
//     const formData = await req.formData();

//     // Convert single image field to array if necessary
//     const images = Array.isArray(formData.get("images"))
//       ? formData.getAll("images")
//       : [formData.get("images")];

//     // Initialize an empty array to store new image URLs and public IDs
//     const newImages = [];
//     const newPublicIds = [];

//     // Iterate over each uploaded image
//     for (const image of images) {
//       // Validate the image
//       // Check file type
//       const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
//       if (!allowedTypes.includes(image.type)) {
//         throw new AppError("Unsupported file type.", 400);
//       }

//       // Check file size (4 MB = 4 * 1024 * 1024 bytes)
//       if (image.size > 4 * 1024 * 1024) {
//         throw new AppError("Maximum file size is 4MB.", 400);
//       }

//       // Process the image
//       const bytes = await image.arrayBuffer();
//       const buffer = Buffer.from(bytes);

//       const ext = image.type.split("/")[1];
//       const name = `user-${req.user._id}-${Date.now()}.${ext}`;

//       // Upload the image to storage and obtain URL and public ID
//       const { url, public_id } = await uploadImage(buffer, name, "shop/products");

//       // Add the URL and public ID to the arrays
//       newImages.push(url);
//       newPublicIds.push(public_id);
//     }

//     // Update the document with the new image URLs and public IDs
//     doc.images = newImages;
//     doc.public_id = newPublicIds;
//     await doc.save();

//     return {
//       data: null,
//       statusCode: 200,
//     };
//   } catch (error) {
//     throw error;
//   }
// };
//  */

export const updateProduct = async (req, Model) => {
  try {
    const data = await req.json();

    if (data.discount && data.price) {
      // Check if the discount is less than the price
      if (data.discount >= data.price) {
        throw new AppError("Discount must be less than price", 400);
      }
    }

    const doc = await Model.findById(req.id);

    if (!doc) {
      throw new AppError("No document found with that ID", 404);
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

    // Update the document with the new data
    for (let key in data) {
      if (data[key] !== doc[key]) {
        doc[key] = data[key];
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
const validateBase64Image = (image) => {
  // Split the base64 string into the prefix and the data
  const [prefix, data] = image.split(",");

  // Check the file type from the prefix (e.g., 'data:image/jpeg;base64')
  const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
  const mimeType = prefix.match(/data:(.*?);base64/)[1];

  if (!allowedTypes.includes(mimeType)) {
    throw new AppError("Invalid image type. Only JPEG and PNG are allowed.");
  }

  // Calculate the size of the image in bytes
  // base64 encoding uses 4/3 of the size of the original data
  const imageSizeInBytes = (data.length * 3) / 4;
  const imageSizeInMB = imageSizeInBytes / (1024 * 1024);

  if (imageSizeInMB > 2) {
    throw new AppError("Image size exceeds 2MB.");
  }
};
export const getTopOffersAndNewProducts = async (req, Model) => {
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
  return { data };
};
