import { Document, Model, Schema, model, models } from "mongoose";
import { IUser } from "./User.model";

export interface IAddress extends Document {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  country: string;
  userId: IUser["_id"];
  // createdAt: Date;
  // updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, index: true },
    phone: {
      type: String,
      required: true,
      validate: {
        validator: (v: string) => /^\+380\d{9}$/.test(v),
        message: `{VALUE} is not a valid Ukrainian phone number!`,
        type: "invalidPhoneNumber", // Custom error type
      },
    },
    country: { type: String, required: true, trim: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_, ret) {
        ["createdAt", "updatedAt"].forEach((field) => {
          if (ret[field]) {
            ret[field] = new Date(ret[field]).toISOString().split("T")[0];
          }
        });
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for common query patterns
AddressSchema.index({ userId: 1, country: 1 });
AddressSchema.set("toJSON", { versionKey: false });
const AddressModel: Model<IAddress> =
  models.Address || model<IAddress>("Address", AddressSchema);
export default AddressModel;
