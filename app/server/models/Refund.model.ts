// @ts-ignore
import type {Document, Model, Query} from 'mongoose';
import {Schema, model, models} from 'mongoose';

import User, {type IUser} from './User.model';

export interface IRefundSchema extends Document {
  _id: Schema.Types.ObjectId;
  userId: IUser['_id'];
  status: 'pending' | 'approved' | 'rejected';
  issue: string;
  reason: string;
  invoiceId: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}
const RefundSchema = new Schema<IRefundSchema>(
  {
    userId: {
      type: Schema.Types.ObjectId,

      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      // required: true,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    issue: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    invoiceId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);
// Add indexes for common queries
RefundSchema.index({status: 1, amount: -1});

RefundSchema.path('status').validate(function (value) {
  return ['pending', 'approved', 'rejected'].includes(value);
}, 'Invalid refund status');

// Add virtuals for UI-friendly values

RefundSchema.virtual('formattedAmount').get(function () {
  return `$${this.amount.toFixed(2)}`;
});
RefundSchema.pre<Query<any, IRefundSchema>>(/^find/, function (next) {
  this.populate({
    path: 'userId',
    select: 'name email',
    model: User,
    options: {lean: true},
  });
  next();
});
RefundSchema.virtual('isSuspicious').get(function () {
  return this.amount > 500 && this.status === 'pending';
});

RefundSchema.post(/^find/, function (docs, next) {
  // Ensure `docs` is an array (it should be for `find`)
  if (Array.isArray(docs)) {
    // Filter out documents where `product` is null
    const filteredDocs = docs.filter((doc) => doc.userId !== null);
    // You cannot just replace `docs` with `filteredDocs`, as `docs` is what the caller receives
    // You would need to mutate `docs` directly if you need to change the actual array being passed back
    docs.splice(0, docs.length, ...filteredDocs);
  }
  next();
});
RefundSchema.set('toJSON', {
  versionKey: false,
});
const RefundModel: Model<IRefundSchema> =
  models.Refund || model<IRefundSchema>('Refund', RefundSchema);

export default RefundModel;
