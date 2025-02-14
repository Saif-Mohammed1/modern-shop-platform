import AppError from "@/app/lib/utilities/appError";
import Product from "../models/product.model";
import { Model } from "mongoose";
import type { NextRequest } from "next/server";
import { ICartSchema } from "../models/cart.model";
import { cartControllerTranslate } from "../../../public/locales/server/cartControllerTranslate";
import { lang } from "@/app/lib/utilities/lang";
export const getCartModel = async (
  req: NextRequest,
  Model: Model<ICartSchema>
) => {
  try {
    const doc = await Model.find({ user: req?.user?._id });

    return {
      data: doc,
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};
// export const addToCartModel = async (
//   req: NextRequest,
//   Model: Model<ICartSchema>
// ) => {
//   // let doc;
//   let statusCode;
//   try {
//     // const {quantity}
//     // const existingProduct = await Product.findById(req.id);

//     const [body, existingProduct] = await Promise.all([
//       req.json(),
//       Product.findById(req.id).lean(),
//     ]);
//     // Validate input quantity
//     const quantity = Math.max(1, Number(body.quantity) || 1);
//     if (!Number.isInteger(quantity)) {
//       throw new AppError(
//         cartControllerTranslate[lang].controllers.addToCart.QuantityNotInteger,
//         400
//       );
//     }
//     if (!existingProduct) {
//       await Model.findOneAndDelete({ user: req.user?._id, product: req.id });
//       throw new AppError(
//         cartControllerTranslate[lang].errors.productNotFound,
//         404
//       );
//     }
//     // Check if there is enough stock
//     // if (existingProduct.stock < 1) {
//     if (existingProduct.stock < quantity) {
//       throw new AppError(
//         cartControllerTranslate[lang].controllers.addToCart.notEnoughStock,
//         400
//       );
//     }
//     // doc = await Model.findOne({ user: req.user?._id, product: req.id });
//     // if (doc) {
//     //   const CheckQuantity = quantity > 1 ? quantity : doc.quantity + quantity;
//     //   // if (existingProduct.stock < doc.quantity + 1) {
//     //   if (existingProduct.stock < CheckQuantity) {
//     //     throw new AppError(
//     //       cartControllerTranslate[lang].controllers.addToCart.notEnoughStock,
//     //       400
//     //     );
//     //   }
//     //   // doc.quantity += 1;
//     //   doc.quantity += quantity;
//     //   await doc.save();
//     //   statusCode = 200;
//     // } else {
//     //   doc = await Model.create({
//     //     user: req.user?._id,
//     //     product: req.id,
//     //     // quantity: 1,
//     //     quantity: quantity,
//     //   });
//     //   statusCode = 201;
//     // }
//     const doc = await Model.findOneAndUpdate(
//       { user: req.user?._id, product: req.id },
//       { $set: { quantity } },
//       { upsert: true, new: true, runValidators: true }
//     );
//     statusCode = doc.isNew ? 201 : 200;
//     return {
//       data: {
//         // Assuming the product has a name field
//         name: existingProduct.name,
//         category: existingProduct.category,

//         price: existingProduct.price,
//         discount: existingProduct.discount,
//         discountExpire: existingProduct.discountExpire,
//         // Assuming the product has an image field
//         images: existingProduct.images,

//         description: existingProduct.description,

//         stock: existingProduct.stock,
//         ratingsAverage: existingProduct.ratingsAverage,

//         ratingsQuantity: existingProduct.ratingsQuantity,
//         createdAt: existingProduct.createdAt,
//         quantity: doc.quantity,
//         _id: existingProduct._id,
//         // user: req.user?._id,
//       },
//       statusCode,
//     };
//   } catch (error) {
//     throw error;
//   }
// };
export const addToCartModel = async (
  req: NextRequest,
  Model: Model<ICartSchema>
) => {
  let statusCode;
  try {
    const [body, existingProduct] = await Promise.all([
      req.json(),
      Product.findById(req.id).lean(),
    ]);

    // Validate input quantity
    const quantity = Math.max(1, Number(body.quantity) || 1);

    if (!Number.isInteger(quantity)) {
      throw new AppError("Quantity must be an integer", 400);
    }

    if (!existingProduct) {
      await Model.findOneAndDelete({ user: req.user?._id, product: req.id });
      throw new AppError("Product not found", 404);
    }
    // Atomic update with stock validation
    const updatePipeline = [
      {
        $set: {
          quantity: {
            $cond: {
              if: { $gt: ["$$requestQuantity", 1] },
              then: { $min: ["$$requestQuantity", "$$stock"] },
              else: {
                $min: [{ $add: ["$quantity", 1] }, "$$stock"],
              },
            },
          },
        },
      },
    ];

    const doc = await Model.findOneAndUpdate(
      { user: req.user?._id, product: req.id },
      updatePipeline,
      {
        upsert: true,
        new: true,
        runValidators: true,
        let: {
          requestQuantity: quantity,
          stock: existingProduct.stock,
        },
      }
    );
    // Post-update validation for set operations
    if (quantity > 1 && doc.quantity < quantity) {
      await Model.findByIdAndDelete(doc._id);
      throw new AppError("Not enough stock", 400);
    }

    statusCode = doc.isNew ? 201 : 200;

    return {
      data: {
        ...existingProduct,
        quantity: doc.quantity,
        _id: existingProduct._id,
      },
      statusCode,
    };
  } catch (error) {
    throw error;
  }
};
export const removeFromCartModel = async (
  req: NextRequest,
  Model: Model<ICartSchema>
) => {
  let doc;
  try {
    const existingProduct = await Product.findById(req.id);

    if (!existingProduct) {
      await Model.findOneAndDelete({ user: req.user?._id, product: req.id });

      throw new AppError(
        cartControllerTranslate[lang].errors.productNotFound,
        404
      );
    }
    doc = await Model.findOne({ user: req.user?._id, product: req.id });

    if (!doc) {
      throw new AppError(
        cartControllerTranslate[lang].errors.noDocumentsFoundWithId,
        404
      );
    }

    if (doc.quantity === 1) {
      await Model.findOneAndDelete({ user: req.user?._id, product: req.id });
    } else {
      doc.quantity -= 1;
      await doc.save();
    }
    return { data: null, statusCode: 200 };
  } catch (error) {
    throw error;
  }
};
export const clearCartModel = async (
  req: NextRequest,
  Model: Model<ICartSchema>
) => {
  try {
    const doc = await Model.findOneAndDelete({
      user: req.user?._id,
      product: req.id,
    });

    if (!doc) {
      throw new AppError(
        cartControllerTranslate[lang].errors.noDocumentsFoundWithId,
        404
      );
    }

    return { data: null, statusCode: 200 };
  } catch (error) {
    throw error;
  }
};

export const mergeLocalCartWithDBModel = async (
  req: NextRequest,
  Model: Model<ICartSchema>
) => {
  try {
    const allProductsData = await req.json();
    for (const product of allProductsData) {
      const existingProduct = await Product.findById(product._id);

      if (existingProduct) {
        let doc = await Model.findOne({
          user: req.user?._id,
          product: product._id,
        });
        const isQuantityBigger =
          existingProduct.stock < product.quantity * 1
            ? existingProduct.stock
            : product.quantity;
        if (doc) {
          const isExistingQuantityBigger =
            existingProduct.stock < isQuantityBigger * 1 + doc.quantity * 1
              ? existingProduct.stock
              : doc.quantity + isQuantityBigger * 1;
          doc.quantity = isExistingQuantityBigger;
          await doc.save();
        } else {
          doc = await Model.create({
            user: req.user?._id,
            product: product._id,
            quantity: isQuantityBigger,
          });
        }
      }
    }
  } catch (error) {
    throw error;
  }
};
