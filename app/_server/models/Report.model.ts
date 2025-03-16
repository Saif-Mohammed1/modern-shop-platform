// @ts-ignore
import { Document, Model, Query, Schema, model, models } from "mongoose";
import User, { IUser } from "./User.model";
import Product, { IProduct } from "./Product.model";

export interface IReportSchema extends Document {
  _id: Schema.Types.ObjectId;
  userId: IUser["_id"];
  productId: IProduct["_id"];
  status: "pending" | "resolved" | "rejected";
  name: string;
  issue: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}
const ReportSchema = new Schema<IReportSchema>(
  {
    userId: {
      type: Schema.Types.ObjectId,

      ref: "User",
      required: true,
      index: true,
    },
    productId: {
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
ReportSchema.set("toJSON", { versionKey: false });
// ReportSchema.pre<Query<any, IReportSchema>>(/^find/, function (next) {
//   this.populate({
//     path: "productId",
//     model: Product,
//     options: { lean: true },
//     // select: "name description price",
//   }).populate({
//     path: "userId",
//     select: "name email",
//     model: User,
//     options: { lean: true },
//   });

//   next();
// });
ReportSchema.index({ status: 1, createdAt: -1 });

// Add validation for enum values
ReportSchema.path("status").validate(function (value) {
  return ["pending", "resolved", "rejected"].includes(value);
}, "Invalid report status");

ReportSchema.virtual("displayStatus").get(function () {
  return this.status.charAt(0).toUpperCase() + this.status.slice(1);
});
// ReportSchema.pre("aggregate", function (next) {
//   this.pipeline().unshift(
//     {
//       $lookup: {
//         from: "products",
//         localField: "productId",
//         foreignField: "_id",
//         as: "product",
//       },
//     },
//     {
//       $unwind: "$product",
//     }
//   );

//   next();
// });
// Add to ReportSchema
ReportSchema.virtual("predictedResolution").get(function () {
  const keywords = ["urgent", "broken", "defective"];
  return keywords.some((kw) => this.issue.toLowerCase().includes(kw))
    ? "24h"
    : "72h";
});
ReportSchema.post(/^find/, function (docs, next) {
  // Ensure `docs` is an array (it should be for `find`)
  if (Array.isArray(docs)) {
    // Filter out documents where `product` is null
    const filteredDocs = docs.filter(
      (doc) => doc.userId !== null && doc.productId !== null
    );
    // You cannot just replace `docs` with `filteredDocs`, as `docs` is what the caller receives
    // You would need to mutate `docs` directly if you need to change the actual array being passed back
    docs.splice(0, docs.length, ...filteredDocs);
  }
  next();
});
const ReportModel: Model<IReportSchema> =
  models.Report || model<IReportSchema>("Report", ReportSchema);

export default ReportModel;
