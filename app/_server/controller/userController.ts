import AppError from "@/components/util/appError";
import User, { IUserSchema } from "../models/user.model";
import { modifyFinalResponse } from "./authController";
// import { createUserTokens } from "./refreshTokenController";
import { ChangeEmail } from "@/components/util/email";
import { sign, verify } from "jsonwebtoken";
// import { promisify } from "util";
import type { NextRequest } from "next/server";
import { userControllerTranslate } from "../_Translate/userControllerTranslate";
import { lang } from "@/components/util/lang";
import { Model } from "mongoose";

export const sendNewVerificationCode = async (req: NextRequest) => {
  try {
    const user = await User.findById(req.user?._id);

    if (!user) {
      throw new AppError(
        userControllerTranslate[lang].errors.noUserFoundWithId,
        404
      );
    }
    if (
      user.verificationCodeBlockedUntil
      // user.verificationCodeBlockedUntil < new Date()
    ) {
      if (user.verificationCodeBlockedUntil < new Date()) {
        user.verificationCodeBlockedUntil = undefined; // Reset attempts after successful verification
        await user.save();
      } else {
        throw new AppError(
          userControllerTranslate[
            lang
          ].errors.verificationCodeBlockedUntilMessage,
          400
        );
      }
    }
    if (user.verificationAttempts && user.verificationAttempts >= 5) {
      // Check if the number of attempts is exceeded before even checking the code
      user.verificationAttempts = undefined; // Increment attempts on susses
      user.verificationCodeBlockedUntil = new Date(Date.now() + 3600000); // 1 hour in milliseconds
      // await user.save({ validateBeforeSave: false });
      await user.save();
      throw new AppError(
        userControllerTranslate[lang].errors.verificationAttemptsMessage,
        429
      );
    }

    user.generateVerificationCode();
    // Send the verification email
    await user.sendVerificationCode();
    user.verificationAttempts = (user.verificationAttempts || 0) + 1; // Increment attempts on susses

    await user.save();

    return {
      message:
        userControllerTranslate[lang].controllers.sendNewVerificationCode
          .success,
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};
export const verifyEmail = async (req: NextRequest) => {
  try {
    const { verificationCode } = await req.json();
    if (!verificationCode) {
      throw new AppError(
        userControllerTranslate[
          lang
        ].controllers.verifyEmail.requiredVerificationCode,
        400
      );
    }

    const user = await User.findById(req.user?._id);

    if (!user) {
      throw new AppError(
        userControllerTranslate[lang].errors.noUserFoundWithId,
        404
      );
    }
    if (user.verificationCodeBlockedUntil) {
      if (user.verificationCodeBlockedUntil < new Date()) {
        user.verificationCodeBlockedUntil = undefined; // Reset attempts after successful verification
        await user.save();
      } else {
        throw new AppError(
          userControllerTranslate[
            lang
          ].errors.verificationCodeBlockedUntilMessage,
          400
        );
      }
    }
    // Check if the number of attempts is exceeded before even checking the code
    if (user.verificationAttempts && user.verificationAttempts >= 5) {
      user.verificationAttempts = undefined; // Increment attempts on susses
      user.verificationCodeBlockedUntil = new Date(Date.now() + 3600000); // 1 hour in milliseconds
      // await user.save({ validateBeforeSave: false });
      await user.save();
      throw new AppError(
        userControllerTranslate[lang].errors.verificationAttemptsMessage,
        429
      );
    }

    // Now check if the provided code matches and is not expired
    if (
      user.verificationCode !== verificationCode ||
      (user.verificationCodeExpires &&
        user.verificationCodeExpires.getTime() < Date.now())
    ) {
      user.verificationAttempts = (user.verificationAttempts || 0) + 1; // Increment attempts on failure
      await user.save();
      throw new AppError(
        userControllerTranslate[lang].errors.invalidOrExpiredVerificationCode,
        400
      );
    }

    // Reset the fields on successful verification
    user.emailVerify = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    user.verificationAttempts = undefined; // Reset attempts after successful verification
    if (user.verificationCodeBlockedUntil) {
      user.verificationCodeBlockedUntil = undefined; // Reset attempts after successful verification
    }
    await user.save();

    return {
      message: userControllerTranslate[lang].controllers.verifyEmail.success,
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};
export const createUserByAdmin = async (req: NextRequest) => {
  let user;
  try {
    const { name, email, password, role, active } = await req?.json();

    // if (!confirmPassword) {
    //   throw new AppError("passwordConfirm must be required", 400);
    // }
    // if (!role) {
    //   throw new AppError("role must be required", 400);
    // }
    // // if (password !== confirmPassword) {
    // //   throw new AppError("password and passwordConfirm don't match", 400);
    // // }

    if (!role || !name || !email || !password) {
      throw new AppError(
        userControllerTranslate[lang].errors.requiredFields,
        400
      );
    }

    user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      active,
    });

    user.generateVerificationCode();
    await user.save();
    // Send the verification email
    await user.sendVerificationCode();
    // const accessToken = await createUserTokens(user._id, req);

    return modifyFinalResponse(
      user,
      null, // accessToken,is null when admen create userno need access token here or it will modify users
      201,
      "sendVerificationCode" // for passing typescript strick mode
    );
  } catch (error) {
    if (user) {
      await User.findByIdAndDelete(user._id);
    }
    throw error;
  }
};
export const editUserByAdmin = async (
  req: NextRequest,
  Model: Model<IUserSchema>
) => {
  try {
    let data: Partial<IUserSchema> = {};
    const { active, role } = await req.json();
    ////console.log("active", active);
    ////console.log("role", role);

    if (typeof active !== "boolean" && !role) {
      throw new AppError(
        userControllerTranslate[
          lang
        ].controllers.editUserByAdmin.requiredOneOption,
        400
      );
    }
    if (typeof active === "boolean") {
      data.active = active;
    }
    if (role) {
      data.role = role;
    }
    ////console.log("data", data);
    const doc = await Model.findByIdAndUpdate(
      req.id,

      data,

      {
        new: true,
        runValidators: true,
      }
    );
    if (!doc) {
      throw new AppError(
        userControllerTranslate[lang].errors.noDocumentFoundWithId,
        404
      );
    }

    return { data: doc, statusCode: 200 };
  } catch (error) {
    throw error;
  }
};
export const deleteUserByAdmin = async (
  req: NextRequest,
  Model: Model<IUserSchema>
) => {
  try {
    const doc = await Model.findByIdAndDelete(req.id);

    if (!doc) {
      throw new AppError(
        userControllerTranslate[lang].errors.noDocumentFoundWithId,
        404
      );
    }

    return {
      data: null,
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};
export const deleteUser = async (
  req: NextRequest,
  Model: Model<IUserSchema>
) => {
  try {
    const doc = await Model.findByIdAndUpdate(
      req.user?._id,
      {
        active: false,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!doc) {
      throw new AppError(
        userControllerTranslate[lang].errors.noDocumentFoundWithId,
        404
      );
    }

    return { data: null, statusCode: 200 };
  } catch (error) {
    throw error;
  }
};
// export const deleteProductByUser = async (req: NextRequest, Model) => {
//   try {
//     const doc = await Model.findOne({
//       _id: req.id,
//       user: req.user?._id,
//     }); //.select("+public_id");

//     if (!doc) {
//       throw new AppError("No document found with that ID", 404);
//     }
//     if (doc.public_id) {
//       const utapi = new UTApi();
//       for (const public_id of doc.public_id) {
//         await utapi.deleteFiles(public_id);

//         // for cloudainry
//         // await destroyImage(public_id);
//       }
//     }
//     await Model.findByIdAndDelete(req.id); // or Model.findByIdAndDelete(req.params.id) if you prefer

//     return { data: null, statusCode: 200 };
//   } catch (error) {
//     throw error;
//   }
// };
export const changeEmailRequest = async (req: NextRequest) => {
  const { newEmail } = await req.json();
  if (!newEmail) {
    throw new AppError(
      userControllerTranslate[lang].controllers.changeEmailRequest.newEmail,
      400
    );
  }

  // Validate newEmail

  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      throw new AppError(
        userControllerTranslate[
          lang
        ].controllers.changeEmailRequest.invalidEmail,
        400
      );
    }
    // Generate a confirmation token
    const token = sign(
      { userId: req.user?._id, newEmail },
      process.env.CHANGE_EMAIL_SECRET as string,
      {
        expiresIn: "15m",
      }
    );

    // Send confirmation email to the current email
    // Send confirmation email to the current email
    if (!req.user?.email) {
      throw new AppError(
        userControllerTranslate[lang].errors.noUserFoundWithId,
        404
      );
    }
    await ChangeEmail(req?.user, token);

    return {
      message:
        userControllerTranslate[lang].controllers.changeEmailRequest
          .confirmationEmailSent,
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};

export const updateUserEmail = async (req: NextRequest) => {
  const token = new URLSearchParams(req.nextUrl.searchParams).get("token");

  try {
    if (!token) {
      throw new AppError(
        userControllerTranslate[lang].controllers.updateUserEmail.requiredToken,
        400
      );
    }

    // const user=await User.findById(req.user?._id);

    // Use promisify, but cast result as the decoded token type
    //not working with promisify
    // const decoded = await promisify(verify)(
    //   token,
    //   process.env.CHANGE_EMAIL_SECRET as string
    // ) as { userId: string; newEmail: string };

    const decoded = verify(
      token,
      process.env.CHANGE_EMAIL_SECRET as string
    ) as { userId: string; newEmail: string };

    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new AppError(
        userControllerTranslate[lang].errors.noUserFoundWithId,
        404
      );
    }

    user.email = decoded.newEmail;
    user.emailVerify = false;
    await user.save();

    return {
      message:
        userControllerTranslate[lang].controllers.updateUserEmail.message,
      statusCode: 200,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === "TokenExpiredError") {
        throw new AppError(
          userControllerTranslate[
            lang
          ].controllers.updateUserEmail.errors.TokenExpiredError,
          400
        );
      } else if (error.name === "JsonWebTokenError") {
        throw new AppError(
          userControllerTranslate[
            lang
          ].controllers.updateUserEmail.errors.JsonWebTokenError,
          400
        );
      }
      throw new AppError(
        userControllerTranslate[lang].controllers.updateUserEmail.errors.global,
        500
      );
    }
    throw new AppError(
      userControllerTranslate[lang].controllers.updateUserEmail.errors.global,
      500
    );
  }
};

// export const updateUserPhoto = async (req, Model) => {
//   try {
//     const { photo, public_id } = await req.json();
//     if (!photo) {
//       throw new AppError("photo must be required", 400);
//     }
//     if (!public_id) {
//       throw new AppError("public_id must be required", 400);
//     }
//     const user = await Model.findById(req.user?._id); //.select("+public_id");

//     if (!user) {
//       throw new AppError("No user found with that ID", 404);
//     }
//     if (user.public_id) {
//       const utapi = new UTApi();
//       await utapi.deleteFiles(user.public_id);

//       // for cloudainry
//       // await destroyImage(public_id);
//     }
//     user.public_id = public_id;
//     user.photo = photo;
//     await user.save();
//     return { data: user, statusCode: 200 };
//   } catch (error) {
//     throw error//   }
// };
// export const updatePassword = async (req) => {
//   try {
//     const { password, confirmPassword, newPassword, email } = await req.json();

//     if (!newPassword) {
//       const user = await User.findById({ email });
//       //   const user = await User.findById(req.user.id).select("+password");

//       if (!user) {
//         //       // User not found
//         throw new AppError("User does not exist", 400);
//       }

//       // 3) If so, update password
//       user.password = password;
//       user.passwordConfirm = confirmPassword;
//       await user.save();
//       // User.findByIdAndUpdate will NOT work as intended!

//       // 4) Log user in, send JWT
//       createSendToken(user, 200, req, res);
//     }
//   } catch (error) {

//   }
// };
