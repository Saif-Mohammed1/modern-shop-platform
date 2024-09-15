import AppError from "@/components/util/appError";
import Product from "../models/product.model";

// let sending = false;
// export const createCart = async (req, Model) => {
//   try {
//     if (sending) {
//       sending = false;
//       throw new AppError("FromPlease take a while between each request", 400);
//     }
//     sending = true;
//     let doc = await Model.findOne({
//       user: req.user._id,
//       product: req.id,
//     });
//     if (!doc) {
//       doc = await Model.create({
//         user: req.user._id,
//         product: req.id,
//       });
//     }
//     return {
//       data: doc,
//       statusCode: 201,
//     };
//   } catch (error) {
//     throw error//   } finally {
//     sending = false;
//   }
// };
// // export const updateCart = async (req, Model) => {
// //   try {
// //     const { quantity } = await req.json();
// //     if (!quantity) throw new AppError("quantity not exist ", 404);

// //     // const doc = await Model.findByIdAndUpdate(req.id, quantity, {
// //     //   new: true,
// //     //   runValidators: true,
// //     // });
// //     const doc = await Model.findOneAndUpdate(
// //       { product: req.id, user: req.user._id }, // Condition to find the document
// //       { quantity }, // Updated fields
// //       { new: true, runValidators: true } // Options: return the updated document and run validators
// //     );

// //     if (!doc) {
// //       throw new AppError("No document found with that ID", 404);
// //       // return NextResponse.json(
// //       //   { message: "No document found with that ID" },
// //       //   { status: 404 }
// //       // );
// //       // throw new AppError("No document found with that ID", 404);
// //     }

// //     return { data: doc, statusCode: 200 };
// //     // return NextResponse.json(
// //     //   {
// //     //     data: doc,
// //     //   },
// //     //   { status: 200 }
// //     // );
// //   } catch (error) {
// //     throw error// //   }
// // };

// export const updateCart = async (req, Model) => {
//   try {
//     if (sending) {
//       sending = false;

//       throw new AppError("FromPlease take a while between each request", 400);
//     }
//     sending = true;
//     const { quantity } = await req.json(); // Assuming you get the quantity from the request body

//     if (quantity == 0) {
//       await deleteCart(req, Model);
//       return { data: null, statusCode: 200 }; // Ensure data property is included
//     }
//     if (!quantity) throw new AppError("Quantity not provided", 404);

//     // Find the cart item to get the product ID
//     const cartItem = await Model.findOne({
//       product: req.id,
//       user: req.user._id,
//     });
//     if (!cartItem) throw new AppError("Cart item not found", 404);

//     // Now, find the product to check its stock
//     const product = await Product.findById(cartItem.product);
//     if (!product) throw new AppError("Product not found", 404);

//     // Check if the requested quantity is less than or equal to the product's stock
//     if (quantity > product.stock) {
//       throw new AppError(
//         `Requested quantity exceeds available stock. Available stock: ${product.stock}`,
//         400
//       );
//     }

//     // If the stock check passes, update the cart item with the new quantity
//     const updatedCartItem = await Model.findOneAndUpdate(
//       { _id: cartItem._id }, // Using the cart item ID for updating
//       { quantity }, // Updated fields
//       { new: true, runValidators: true } // Options: return the updated document and run validators
//     );

//     // Check if the update operation was successful
//     if (!updatedCartItem) {
//       throw new AppError("Failed to update cart item", 500);
//     }
//     // sending = false;

//     return { data: updatedCartItem, statusCode: 200 };
//   } catch (error) {
//     throw error//   } finally {
//     sending = false;
//   }
// };

// export const deleteCart = async (req, Model) => {
//   try {
//     if (sending) {
//       sending = false;

//       throw new AppError("FromPlease take a while between each request", 400);
//     }
//     sending = true;
//     const doc = await Model.findOneAndDelete(
//       { product: req.id, user: req.user._id } // Condition to find the document
//     );

//     if (!doc) {
//       throw new AppError("No document found with that ID", 404);
//     }
//     // sending = false;

//     return {
//       data: null,
//       statusCode: 200,
//     };
//   } catch (error) {
//     throw error//   } finally {
//     sending = false;
//   }
// };

export const addToCartModel = async (req, Model) => {
  let doc;
  let statusCode;
  try {
    const existingProduct = await Product.findById(req.id);

    if (!existingProduct) {
      await Model.findOneAndDelete({ user: req.user._id, product: req.id });
      throw new AppError("Product not found", 404);
    }
    // Check if there is enough stock
    if (existingProduct.stock < 1) {
      throw new AppError("Not enough stock available", 400);
    }
    doc = await Model.findOne({ user: req.user._id, product: req.id });

    if (doc) {
      if (existingProduct.stock < doc.quantity + 1) {
        throw new AppError("Not enough stock available", 400);
      }
      doc.quantity += 1;
      await doc.save();
      statusCode = 200;
    } else {
      doc = await Model.create({
        user: req.user._id,
        product: req.id,
        quantity: 1,
      });
      statusCode = 201;
    }
    /**{
{
  "_id": {
    "$oid": "66dd4f06b02dc2c87fbe605b"
  },
  "name": "JDFKJAHGKJF",
  "category": "dsfnjgkjsdfkj",
  "price": 2555,
  "discount": 2,
  "discountExpire": {
    "$date": "2024-09-15T07:15:18.783Z"
  },
  "images": [
    "https://res.cloudinary.com/dv0qpha02/image/upload/v1725776922/shop/products/njzfaobweakcfzdi0bl8.jpg",
    "https://res.cloudinary.com/dv0qpha02/image/upload/v1725776932/shop/products/wgdtl8trpmiejrs5vzfa.jpg",
    "https://res.cloudinary.com/dv0qpha02/image/upload/v1725776940/shop/products/iisd7x20m7ylr7kygxdp.jpg"
  ],
  "public_id": [
    "shop/products/njzfaobweakcfzdi0bl8",
    "shop/products/wgdtl8trpmiejrs5vzfa",
    "shop/products/iisd7x20m7ylr7kygxdp"
  ],
  "user": {
    "$oid": "66d8d594abb5fe669872fb16"
  },
  "description": "FDSJFSKJGHKFHJ",
  "stock": 25,
  "ratingsAverage": 4.5,
  "ratingsQuantity": 0,
  "createdAt": {
    "$date": "2024-09-08T07:15:18.779Z"
  },
  "__v": 0
}*/
    return {
      data: {
        // Assuming the product has a name field
        name: existingProduct.name,
        category: existingProduct.category,

        price: existingProduct.price,
        discount: existingProduct.discount,
        discountExpire: existingProduct.discountExpire,
        // Assuming the product has an image field
        images: existingProduct.images,
        public_id: existingProduct.public_id,
        description: existingProduct.description,

        stock: existingProduct.stock,
        ratingsAverage: existingProduct.ratingsAverage,

        ratingsQuantity: existingProduct.ratingsQuantity,
        createdAt: existingProduct.createdAt,
        quantity: doc.quantity,
        _id: existingProduct._id,
      },
      statusCode,
    };
  } catch (error) {
    throw error;
  }
};

export const removeFromCartModel = async (req, Model) => {
  let doc;
  try {
    const existingProduct = await Product.findById(req.id);

    if (!existingProduct) {
      await Model.findOneAndDelete({ user: req.user._id, product: req.id });

      throw new AppError("Product not found", 404);
    }
    doc = await Model.findOne({ user: req.user._id, product: req.id });

    if (!doc) {
      throw new AppError("No document found with that ID", 404);
    }

    if (doc.quantity === 1) {
      await Model.findOneAndDelete({ user: req.user._id, product: req.id });
    } else {
      doc.quantity -= 1;
      await doc.save();
    }
    return { data: null, statusCode: 200 };
  } catch (error) {
    throw error;
  }
};
export const clearCartModel = async (req, Model) => {
  try {
    const doc = await Model.findOneAndDelete({
      user: req.user._id,
      product: req.id,
    });

    if (!doc) {
      throw new AppError("No document found with that ID", 404);
    }

    return { data: null, statusCode: 200 };
  } catch (error) {
    throw error;
  }
};

export const mergeLocalCartWithDBModel = async (req, Model) => {
  try {
    const allProductsData = await req.json();
    for (const product of allProductsData) {
      const existingProduct = await Product.findById(product._id);

      if (existingProduct) {
        let doc = await Model.findOne({
          user: req.user._id,
          product: product._id,
        });

        if (doc) {
          doc.quantity += product.quantity;
          await doc.save();
        } else {
          doc = await Model.create({
            user: req.user._id,
            product: product._id,
            quantity: product.quantity,
          });
        }
      }
    }
  } catch (error) {
    throw error;
  }
};
