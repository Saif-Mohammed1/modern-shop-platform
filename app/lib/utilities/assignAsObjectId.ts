import mongoose from "mongoose";
import { z } from "zod";
import { lang } from "./lang";
import { commonTranslations } from "@/public/locales/server/Common.Translate";

export const assignAsObjectId = (id: string) => new mongoose.Types.ObjectId(id);

// export const isValidObjectId = (id: string) =>
//   mongoose.Types.ObjectId.isValid(id);

// export const zodWithObjectIdSchema = z.string().refine(isValidObjectId, {
//   message: commonTranslations[lang].objectIdInvalid,
// });

// export const zObjectId = z.union([z.string(), z.number()])
//   .refine((id) => mongoose.Types.ObjectId.isValid(id), {
//     message: commonTranslations[lang].objectIdInvalid,
//   })
//   .transform((id) => new mongoose.Types.ObjectId(id)); // Converts string to ObjectId

export const zObjectId = z
  .union([z.string(), z.instanceof(mongoose.Types.ObjectId)]) // Accept string or ObjectId
  .refine((id) => mongoose.Types.ObjectId.isValid(id.toString()), {
    message: commonTranslations[lang].objectIdInvalid,
  })
  .transform((id) =>
    typeof id === "string" ? new mongoose.Types.ObjectId(id) : id
  ); // Convert string to ObjectId, keep ObjectId unchanged
