// @ts-ignore
import { Document, Model, Query, Schema, model, models } from "mongoose";
import User, { IUserSchema } from "./user.model";
import { refundUsControllerTranslate } from "../_Translate/refundControllerTranslate";
import { lang } from "@/components/util/lang";
export interface IRefundSchema extends Document {
  _id: Schema.Types.ObjectId;
  user: IUserSchema["_id"];
  status: "pending" | "processing" | "accepted" | "refused";
  issue: string;
  reason: string;
  invoiceId: string;
  createdAt: Date;
}
const RefundSchema = new Schema<IRefundSchema>({
  user: {
    type: Schema.Types.ObjectId,

    ref: "User",
    required: [
      true,
      refundUsControllerTranslate[lang].model.schema.user.required,
    ],
  },
  status: {
    type: String,
    required: true,
    enum: ["pending", "processing", "accepted", "refused"],
    default: "pending",
  },
  issue: {
    type: String,
    required: [
      true,
      refundUsControllerTranslate[lang].model.schema.issue.required,
    ],
  },
  reason: {
    type: String,
    required: [
      true,
      refundUsControllerTranslate[lang].model.schema.reason.required,
    ],
  },
  invoiceId: {
    type: String,
    required: [
      true,
      refundUsControllerTranslate[lang].model.schema.invoiceId.required,
    ],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
RefundSchema.pre<Query<any, IRefundSchema>>(/^find/, function (next) {
  this.populate({
    path: "user",
  });
  next();
});
RefundSchema.post(/^find/, function (docs, next) {
  // Ensure `docs` is an array (it should be for `find`)
  if (Array.isArray(docs)) {
    // Filter out documents where `product` is null
    const filteredDocs = docs.filter((doc) => doc.user !== null);
    // You cannot just replace `docs` with `filteredDocs`, as `docs` is what the caller receives
    // You would need to mutate `docs` directly if you need to change the actual array being passed back
    docs.splice(0, docs.length, ...filteredDocs);
  }
  next();
});
const Refund: Model<IRefundSchema> =
  models.Refund || model<IRefundSchema>("Refund", RefundSchema);

export default Refund;
