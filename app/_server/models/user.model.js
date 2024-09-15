import { Schema, model, models } from "mongoose";
import crypto from "crypto"; // Add import for the crypto module
import { sendVerificationCode } from "@/components/util/email";
import bcrypt from "bcryptjs";
const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, "name must be required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email must be required"],
    unique: true,
    index: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function (v) {
        // Regular expression to validate email format
        return /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(v);
      },
      message: (props) => `${props.value} is not a valid email address!`,
    },
  },
  emailVerify: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: [true, "password must be required"],
    select: false,
    minlength: [10, "Password must be at least 10 characters long"],
  },
  // passwordConfirm: {
  //   type: String,
  //   required: [true, "passwordConfirm must be required"],
  //   validate: {
  //     // This only works on CREATE and SAVE!!!
  //     validator: function (el) {
  //       return el === this.password;
  //     },
  //     message: "Passwords are not the same!",
  //   },
  // },
  // photo: {
  //   type: String,
  //   default: "user.jpg",
  // },
  // public_id: String,
  role: {
    type: String,

    enum: ["user", "seller", "admin"],
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
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  // this.passwordConfirm = undefined;
  next();
});
UserSchema.methods.CheckPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

UserSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// UserSchema.pre(/^find/, function (next) {
//   // this points to the current query
//   this.find({ active: { $ne: false } });
//   next();
// });
UserSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

UserSchema.methods.isEmailVerified = function () {
  return this.emailVerify;
};

UserSchema.methods.createPasswordResetToken = function () {
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
UserSchema.methods.generateVerificationCode = function () {
  const verificationCode = crypto.randomBytes(8).toString("hex"); // Generate a 4-digit verification code
  this.verificationCode = verificationCode;
  this.verificationCodeExpires = Date.now() + 10 * 60 * 1000; // Code expires in 10 minutes
};

// Define a method to send the verification email
UserSchema.methods.sendVerificationCode = async function () {
  // Send the verification email using Nodemailer
  await sendVerificationCode(this, this.verificationCode);
};
const User = models.User || model("User", UserSchema);

export default User;
