// @ts-ignore
import { Document, Model, Query, Schema, model, models } from "mongoose";
import User, { IUser } from "./User.model";
import Product, { IProductSchema } from "./Product.model";

export interface IReportSchema extends Document {
  _id: Schema.Types.ObjectId;
  user: IUser["_id"];
  product: IProductSchema["_id"];
  status: "pending" | "resolved" | "rejected";
  name: string;
  issue: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}
const ReportSchema = new Schema<IReportSchema>(
  {
    user: {
      type: Schema.Types.ObjectId,

      ref: "User",
      required: true,
      index: true,
    },
    product: {
      type: Schema.Types.ObjectId,

      ref: "Product",
      required: true,
      index: true,
    },
    status: {
      type: String,
      // required: true,
      // enum: ["pending", "reviewing", "completed"],
      enum: ["resolved", "pending", "rejected"],
      default: "pending",
    },
    name: {
      type: String,
      required: true,
    },
    issue: {
      type: String,
      required: true,
      // Added descriptive error message
    },
    message: {
      type: String,
      required: true,
      // Added descriptive error message
    },
  },
  {
    timestamps: true,
  }
);
ReportSchema.pre<Query<any, IReportSchema>>(/^find/, function (next) {
  this.populate({
    path: "product",
    model: Product,
    options: { lean: true },
    // select: "name description price",
  }).populate({
    path: "user",
    select: "name email",
    model: User,
    options: { lean: true },
  });

  next();
});
// ReportSchema.pre("aggregate", function (next) {
//   // Adding $lookup stages to simulate population.
//   this.pipeline().unshift(
//     {
//       $lookup: {
//         from: "users", // Assuming 'users' is the name of the collection where user documents are stored
//         localField: "user", // The field in 'reports' collection that holds the reference
//         foreignField: "_id", // The _id field in 'users' collection
//         as: "user", // Where to store the joined documents in the output documents
//       },
//     },
//     {
//       $unwind: {
//         // Optionally unwind the array if you expect one user per report
//         path: "$user",
//         preserveNullAndEmptyArrays: false, // This ensures documents without users are not included
//       },
//     },
//     {
//       $lookup: {
//         from: "products", // Assuming 'products' is the collection name
//         localField: "product", // The field in 'reports' collection
//         foreignField: "_id", // The _id field in 'products' collection
//         as: "product", // Where to store the joined documents
//       },
//     },
//     {
//       $unwind: {
//         // Optionally unwind if you expect at least one product per report
//         path: "$product",
//         preserveNullAndEmptyArrays: false, // This ensures documents without products are not included
//       },
//     }
//   );

//   next();
// });

ReportSchema.pre("aggregate", function (next) {
  this.pipeline().unshift(
    {
      $lookup: {
        from: "products",
        localField: "product",
        foreignField: "_id",
        as: "product",
      },
    },
    {
      $unwind: "$product",
    }
  );

  next();
});

ReportSchema.post(/^find/, function (docs, next) {
  // Ensure `docs` is an array (it should be for `find`)
  if (Array.isArray(docs)) {
    // Filter out documents where `product` is null
    const filteredDocs = docs.filter(
      (doc) => doc.user !== null && doc.product !== null
    );
    // You cannot just replace `docs` with `filteredDocs`, as `docs` is what the caller receives
    // You would need to mutate `docs` directly if you need to change the actual array being passed back
    docs.splice(0, docs.length, ...filteredDocs);
  }
  next();
});
const Report: Model<IReportSchema> =
  models.Report || model<IReportSchema>("Report", ReportSchema);

export default Report;
