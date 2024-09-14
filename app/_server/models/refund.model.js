import { Schema, model, models } from "mongoose";
import User from "./user.model";
const RefundSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: "User",
    required: [true, "Refund must belong to a user."],
  },
  status: {
    type: String,
    required: true,
    enum: ["pending", "processing", "accepted", "refused"],
    default: "pending",
  },
  issue: {
    type: String,
    required: [true, "Issue field is required."],
  },
  reason: {
    type: String,
    required: [true, "reason field is required."],
  },
  invoiceId: {
    type: String,
    required: [true, "Invoice ID field is required."],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
RefundSchema.pre(/^find/, function (next) {
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
const Refund = models.Refund || model("Refund", RefundSchema);

export default Refund;
