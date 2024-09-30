// @ts-ignore
import { Document, Model, Schema, model, models } from "mongoose";
import User, { IUserSchema } from "./user.model";
import { contactUsControllerTranslate } from "../_Translate/contactUsControllerTranslate";
import { lang } from "@/components/util/lang";
type status = "received" | "read" | "responded";
export interface IContactUsSchema extends Document {
  _id: Schema.Types.ObjectId;

  user: IUserSchema["_id"];
  subject: string;
  message: string;
  status: status;
  createdAt: Date;
}
const ContactUsSchema = new Schema<IContactUsSchema>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [
      true,
      contactUsControllerTranslate[lang].model.schema.user.required,
    ],
  },
  subject: {
    type: String,
    required: [
      true,
      contactUsControllerTranslate[lang].model.schema.subject.required,
    ],
  },
  message: {
    type: String,
    required: [
      true,
      contactUsControllerTranslate[lang].model.schema.message.required,
    ],
  },
  status: {
    type: String,
    enum: ["received", "read", "responded"],
    default: "received",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ContactUs: Model<IContactUsSchema> =
  models.ContactUs || model<IContactUsSchema>("ContactUs", ContactUsSchema);

export default ContactUs;
