import { Document, Model, Schema, model, models } from "mongoose";
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
  emailVerify: boolean;
}
export interface IUserSchema extends IUserInput, Document {
  _id: Schema.Types.ObjectId;
  role: UserRoleType;
  createdAt: Date;
  updatedAt: Date;
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
  isTwoFactorAuthEnabled: boolean;
}
const UserSchema = new Schema<IUserSchema>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    emailVerify: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: true,
      select: false,
      minlength: 10,
      maxlength: 60,
    },
    passwordConfirm: {
      type: String,
      // required: true,
      minlength: 10,
      maxlength: 60,
      validate: {
        // This only works on CREATE and SAVE!!!
        validator: function (value) {
          return value === this.password;
        },
        message: "passwords are not the same",
        type: "passwordsNotTheSame",
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
    // createdAt: {
    //   type: Date,
    //   default: Date.now,
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
    isTwoFactorAuthEnabled: {
      type: Boolean,
      default: false,
      // select: false,
    },
    // updatedAt: Date,
    passwordLoginAttempts: Number,

    passwordLoginBlockedUntil: Date,
  },
  {
    timestamps: true,
  }
);
//make sure index created in db
UserSchema.index({ email: 1 });
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    this.passwordChangedAt = this.isNew
      ? undefined
      : new Date(Date.now() - 1000); // - 1000 to make sure the token is created after the passwordChangedAt
  }

  if (this.isModified("email") || this.isNew) {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    if (!emailRegex.test(this.email)) {
      return next(
        new AppError(
          userControllerTranslate[lang].model.schema.email.validator,
          400
        )
      );
    }
  }

  next();
});
// its return only the user data without password and __v
UserSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.__v;

    return ret;
  },
});
UserSchema.methods.CheckPassword = async function (
  candidatePassword: string
  // userPassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

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

  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // Date.now() + 10 * 60 * 1000;

  return resetToken;
};
// Define a method to generate a verification code and save it in the user document
UserSchema.methods.generateVerificationCode = function (): void {
  const verificationCode = crypto.randomBytes(8).toString("hex"); // Generate a 4-digit verification code
  this.verificationCode = verificationCode;
  this.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // Date.now() + 10 * 60 * 1000; // Code expires in 10 minutes
};

// Define a method to send the verification email
UserSchema.methods.sendVerificationCode = async function (): Promise<void> {
  // Send the verification email using Nodemailer return nothing

  // Send the verification email using the `sendVerificationCode` utility
  await sendVerificationCode(this, this.verificationCode); // Pass the correct types
};
const User: Model<IUserSchema> =
  models.User || model<IUserSchema>("User", UserSchema);

export default User;
