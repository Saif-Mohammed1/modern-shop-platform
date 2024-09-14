import { Schema, model, models } from "mongoose";
import User from "./user.model";
const ContactUsSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Contact must belong to a user."],
  },
  subject: {
    type: String,
    required: [true, "Subject is required"],
  },
  message: {
    type: String,
    required: [true, "Message is required"],
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

const ContactUs = models.ContactUs || model("ContactUs", ContactUsSchema);

export default ContactUs;
