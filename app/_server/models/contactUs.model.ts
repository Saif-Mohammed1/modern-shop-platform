// @ts-ignore
import { Document, Model, Schema, model, models } from "mongoose";
import User, { IUser } from "./User.model";

type status = "received" | "read" | "responded";
export interface IContactUsSchema extends Document {
  _id: Schema.Types.ObjectId;

  user: IUser["_id"];
  subject: string;
  message: string;
  status: status;
  // createdAt: Date;
  // updatedAt: Date;
}
const ContactUsSchema = new Schema<IContactUsSchema>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      maxlength: 150,
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ["received", "read", "responded"],
      default: "received",
    },
  },
  {
    timestamps: true,
  }
);

const ContactUs: Model<IContactUsSchema> =
  models.ContactUs || model<IContactUsSchema>("ContactUs", ContactUsSchema);

export default ContactUs;
