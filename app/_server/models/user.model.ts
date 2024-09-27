import { Document, Schema, model, models } from "mongoose";
import crypto from "crypto"; // Add import for the crypto module
import { sendVerificationCode } from "@/components/util/email";
import bcrypt from "bcryptjs";
import AppError from "@/components/util/appError";
import { lang } from "@/components/util/lang";
import { userControllerTranslate } from "../_Translate/userControllerTranslate";
// enum Role {
//   USER = "user",
//   seller = "seller",
//   admin = "admin",
// }
export type UserRoleType =
  | "user" //| "seller"
  | "admin";
export interface IUserInput {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string | undefined;
  emailVerify?: boolean;
}
export interface IUserSchema extends IUserInput, Document {
  role: UserRoleType;
  createdAt: Date;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  passwordResetAttempts?: number;
  passwordResetBlockedUntil?: Date;
  verificationCode?: string;
  verificationCodeExpires?: Date;
  verificationAttempts?: number;
  verificationCodeBlockedUntil?: Date;
  active: boolean;
  updatedAt?: Date;
  passwordLoginAttempts?: number;
  passwordLoginBlockedUntil?: Date;
  CheckPassword(
    candidatePassword: string,
    userPassword: string
  ): Promise<boolean>;
  changedPasswordAfter(JWTTimestamp: number): boolean;
  isEmailVerified(): boolean;
  createPasswordResetToken(): string;
  generateVerificationCode(): void;
  sendVerificationCode(): Promise<void>;
}
const UserSchema = new Schema<IUserSchema>({
  name: {
    type: String,
    required: [true, userControllerTranslate[lang].model.schema.name.required],
    trim: true,
  },
  email: {
    type: String,
    required: [true, userControllerTranslate[lang].model.schema.email.required],
    unique: true,
    index: true,
    trim: true,
    lowercase: true,
    // validate: {
    //   validator: function (v) {
    //     // Regular expression to validate email format
    //     return /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(v);
    //   },
    //   message: (props) => `${props.value} is not a valid email address!`,
    // },
  },
  emailVerify: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: [
      true,
      userControllerTranslate[lang].model.schema.password.required,
    ],
    select: false,
    minlength: [
      10,
      userControllerTranslate[lang].model.schema.password.minlength,
    ],
    maxlength: [
      60,
      userControllerTranslate[lang].model.schema.password.maxlength,
    ],
  },
  passwordConfirm: {
    type: String,
    required: [
      true,
      userControllerTranslate[lang].model.schema.confirmPassword.required,
    ],
    minlength: [
      10,
      userControllerTranslate[lang].model.schema.confirmPassword.minlength,
    ],
    maxlength: [
      60,
      userControllerTranslate[lang].model.schema.confirmPassword.maxlength,
    ],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (value) {
        return value === this.password;
      },
      message:
        userControllerTranslate[lang].model.schema.confirmPassword.validator,
    },
  },

  role: {
    type: String,

    enum: [
      "user", //"seller",
      "admin",
    ],
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  //   phoneNumber: {
  //   type: String,
  //   // required: true,
  //   validate: {
  //     validator: function(v) {
  //       return /\+380\d{9}/.test(v);
  //     },
  //     message: props => `${props.value} is not a valid Ukrainian phone number!`
  //   }
  // },
  // phoneVerificationCode: {
  //   type: String,
  //   // required: true
  // },
  // phoneVerified: {
  //   type: Boolean,
  //   default: false
  // },
  // phoneVerificationCodeExpires: {
  //   type: Date,
  //   required: true
  // },
  // phoneVerificationAttempts: {
  //   type: Number,
  //   default: 0
  // },

  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  passwordResetAttempts: Number,
  passwordResetBlockedUntil: Date,
  verificationCode: String,
  verificationCodeExpires: Date,
  verificationAttempts: Number,
  verificationCodeBlockedUntil: Date,

  active: {
    type: Boolean,
    default: true,
    // select: false,
  },
  updatedAt: Date,
  passwordLoginAttempts: Number,

  passwordLoginBlockedUntil: Date,
});
//make sure index created in db
UserSchema.index({ email: 1 });

UserSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  // if (!this.isModified("password")) return next();
  if (!this.isModified("password") || this.isNew) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  // this.passwordChangedAt = Date.now() - 1000;
  // typeScript case date.now return number
  this.passwordChangedAt = new Date(Date.now() - 1000);
  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});
UserSchema.pre("save", function (next) {
  // Only run the email validation if the email has been modified (or it's a new document)
  if (!this.isModified("email" || !this.isNew)) {
    return next();
  }

  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  if (!emailRegex.test(this.email)) {
    return next(
      new AppError(
        userControllerTranslate[lang].model.schema.email.validator,
        400
      )
    );
  }

  next();
});
// UserSchema.pre("save", function (next) {
//   if (!this.isModified("password") || this.isNew) return next();

//   // this.passwordChangedAt = Date.now() - 1000;
//   // typeScript case date.now return number
//   this.passwordChangedAt = new Date(Date.now() - 1000);

//   next();
// });
UserSchema.methods.CheckPassword = async function (
  candidatePassword: string,
  userPassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// UserSchema.pre(/^find/, function (next) {
//   // this points to the current query
//   this.find({ active: { $ne: false } });
//   next();
// });
// UserSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
//   if (this.passwordChangedAt) {
//     const changedTimestamp = parseInt(
//       this.passwordChangedAt.getTime() / 1000,
//       10
//     );

//     return JWTTimestamp < changedTimestamp;
//   }

//   // False means NOT changed
//   return false;
// };
UserSchema.methods.changedPasswordAfter = function (
  JWTTimestamp: number
): boolean {
  if (!this.passwordChangedAt) return false; // False means NOT changed

  const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
  return JWTTimestamp < changedTimestamp;
};

UserSchema.methods.isEmailVerified = function (): boolean {
  return this.emailVerify;
};

UserSchema.methods.createPasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // ////console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
// Define a method to generate a verification code and save it in the user document
UserSchema.methods.generateVerificationCode = function (): void {
  const verificationCode = crypto.randomBytes(8).toString("hex"); // Generate a 4-digit verification code
  this.verificationCode = verificationCode;
  this.verificationCodeExpires = Date.now() + 10 * 60 * 1000; // Code expires in 10 minutes
};

// Define a method to send the verification email
UserSchema.methods.sendVerificationCode = async function (): Promise<void> {
  // Send the verification email using Nodemailer return nothing

  // Send the verification email using the `sendVerificationCode` utility
  await sendVerificationCode(this, this.verificationCode); // Pass the correct types
};
const User = models.User || model<IUserSchema>("User", UserSchema);

export default User;
