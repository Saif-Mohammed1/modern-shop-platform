// @ts-ignore
import { Document, Model, Schema, model, models } from "mongoose";
import User, { IUserSchema } from "./user.model";
import { addressControllerTranslate } from "../_Translate/addressControllerTranslate";
import { lang } from "@/components/util/lang";
export interface IAddressSchema extends Document {
  _id: Schema.Types.ObjectId;
  street: string;
  city: string;
  state: string;
  postalCode: number;
  phone: string;
  country: string;
  user: IUserSchema["_id"];
}
type props = {
  value: string;
};
const AddressSchema = new Schema<IAddressSchema>({
  street: {
    type: String,
    required: [
      true,
      addressControllerTranslate[lang].model.schema.street.required,
    ],
  },
  city: {
    type: String,
    required: [
      true,
      addressControllerTranslate[lang].model.schema.city.required,
    ],
  },

  state: {
    type: String,
    required: [
      true,
      addressControllerTranslate[lang].model.schema.state.required,
    ],
  },
  postalCode: {
    type: Number,
    required: [
      true,
      addressControllerTranslate[lang].model.schema.postalCode.required,
    ],
  },

  phone: {
    type: String,
    required: [
      true,
      addressControllerTranslate[lang].model.schema.phone.required,
    ],
    validate: {
      validator: function (v: string) {
        return /\+380\d{9}/.test(v);
      },
      message: (props: props) =>
        addressControllerTranslate[lang].model.schema.phoneValidation(
          props.value
        ),
    },
  },
  country: {
    type: String,
    required: [
      true,
      addressControllerTranslate[lang].model.schema.country.required,
    ],
  },
  user: {
    type: Schema.Types.ObjectId,

    ref: "User",
    required: [
      true,
      addressControllerTranslate[lang].model.schema.user.required,
    ],
  },
});
const Address: Model<IAddressSchema> =
  models.Address || model<IAddressSchema>("Address", AddressSchema);

export default Address;
