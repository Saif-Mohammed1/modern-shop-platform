// @ts-ignore
import { Document, Model, Schema, model, models } from "mongoose";
import User, { IUserSchema } from "./user.model";

export interface IAddressSchema extends Document {
  _id: Schema.Types.ObjectId;
  street: string;
  city: string;
  state: string;
  postalCode: number;
  phone: string;
  country: string;
  user: IUserSchema["_id"];
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddressSchema>(
  {
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },
    postalCode: {
      type: Number,
      required: true,
    },

    phone: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          return /\+380\d{9}/.test(v);
        },
        message: `{VALUE} is not a valid Ukrainian phone number!`,
        type: "invalidPhoneNumber", // Custom error type
      },
    },
    country: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,

      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);
const Address: Model<IAddressSchema> =
  models.Address || model<IAddressSchema>("Address", AddressSchema);

export default Address;
