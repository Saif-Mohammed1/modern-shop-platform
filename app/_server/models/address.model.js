import { Schema, model, models } from "mongoose";
import User from "./user.model";

const AddressSchema = new Schema({
  street: {
    type: String,
    required: [true, "street must be required"],
  },
  city: {
    type: String,
    required: [true, "city must be required"],
  },

  state: {
    type: String,
    required: [true, "state must be required"],
  },
  postalCode: {
    type: Number,
    required: [true, "postalCode must be required"],
  },

  phone: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /\+380\d{9}/.test(v);
      },
      message: (props) =>
        `${props.value} is not a valid Ukrainian phone number!`,
    },
  },
  country: {
    type: String,
    required: [true, "country must be required"],
  },
  user: {
    type: Schema.ObjectId,
    ref: "User",
    required: [true, "Address must belong to a user."],
  },
});
const Address = models.Address || model("Address", AddressSchema);

export default Address;
