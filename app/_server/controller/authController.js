import User from "../models/user.model";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { promisify } from "util";

import AppError from "@/components/util/appError";
import { Email } from "@/components/util/email";
import { createUserTokens, detectUnusualLogin } from "./refreshTokenController";

export const modifyFinalResponse = (
  user,
  accessToken,
  statusCode,
  message = false
) => {
  let userData = {};
  userData.user = {
    _id: user._id,
    name: user.name,
    email: user.email,
    emailVerify: user.emailVerify,
    // password: user.password,
    // photo: user.photo,
    role: user.role,
    createdAt: user.createdAt,
  };
  return {
    message:
      (message &&
        "User created successfully. Check your email for verification.") ||
      undefined,
    user: userData.user,
    accessToken,
    statusCode,
  };
};
export const isAuth = async (req) => {
  const authHeader =
    req?.headers?.authorization || req?.headers?.get("authorization");
  const token = authHeader?.startsWith("Bearer") && authHeader.split(" ")[1];
  if (!token) {
    throw new AppError(
      "You are not logged in! Please log in to get access.",
      401
    );
  }

  try {
    const decoded = await promisify(verify)(
      token,
      process?.env?.JWT_ACCESS_TOKEN_SECRET
    );

    const currentUser = await User.findOne({
      _id: decoded?.userId,
      active: true,
    });
    if (!currentUser) {
      throw new AppError(
        "The user belonging to this token no longer exists.",
        401
      );
    }

    if (
      currentUser?.updatedAt &&
      currentUser?.updatedAt?.getTime() !== decoded?.iat
    ) {
      throw new AppError("Your session is invalid .", 401);
    }

    if (currentUser.changedPasswordAfter(decoded?.iat)) {
      throw new AppError(
        "User recently changed password! Please log in again.",
        401
      );
    }

    req.user = currentUser; // Add user to request
  } catch (error) {
    throw error;
  }
};
export const restrictTo = async (req, ...roles) => {
  // roles ['admin', 'lead-guide']?. role='user'
  if (!roles?.includes(req?.user?.role)) {
    throw new AppError(
      "You do not have permission to perform this action",
      403
    );
  }
  return;
};
export const register = async (req) => {
  let user;
  try {
    const { name, email, password, confirmPassword } = await req?.json();

    if (!confirmPassword) {
      throw new AppError("confirmPassword must be required", 400);
    }
    if (password !== confirmPassword) {
      throw new AppError("password and confirmPassword don't match", 400);
    }

    user = await User.create({
      name,
      email: email, //.toLowerCase(),
      password,
    });

    user.generateVerificationCode();
    await user.save();
    // Send the verification email
    await user.sendVerificationCode();
    const accessToken = await createUserTokens(user._id, req);
    return modifyFinalResponse(user, accessToken, 201, true);
  } catch (error) {
    if (user) {
      await User.findByIdAndDelete(user._id);
    }
    throw error;
  }
};
export const logIn = async (req) => {
  try {
    const { email, password } = await req?.json();
    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!user) {
      throw new AppError("Email or Password are incorrect", 400);
    }
    if (!user?.active) {
      throw new AppError(
        "This user is no longer active please contact support",
        401
      );
    }
    // Check if login attempts are already blocked
    if (user.passwordLoginBlockedUntil) {
      if (user.passwordLoginBlockedUntil < new Date()) {
        user.passwordLoginBlockedUntil = undefined;
        await user.save();
      } else {
        throw new AppError(
          "Your logIn attempts are currently blocked. Please wait for an hour before attempting again.",
          400
        );
      }
    }

    const passwordCorrect = await user.CheckPassword(password, user.password);
    if (!passwordCorrect) {
      user.passwordLoginAttempts = (user.passwordLoginAttempts || 0) + 1;
      // await user.save({ validateBeforeSave: false });
      await user.save();

      // Block the user after 3 unsuccessful attempts
      if (user.passwordLoginAttempts >= 3) {
        user.passwordLoginAttempts = undefined;

        user.passwordLoginBlockedUntil = new Date(Date.now() + 3600000); // 1 hour in milliseconds
        // await user.save({ validateBeforeSave: false });
        await user.save();
        throw new AppError(
          "Too many unsuccessful password attempts. Please try again later.",
          400
        );
      }
      throw new AppError("Email or Password are incorrect", 400);
    }
    // }
    // Reset counters on successful login
    user.passwordLoginAttempts = undefined;
    user.passwordLoginBlockedUntil = undefined;
    // await user.save({ validateBeforeSave: false });
    await user.save();
    await detectUnusualLogin(user, req);

    const accessToken = await createUserTokens(user._id, req);
    return modifyFinalResponse(user, accessToken, 200);
  } catch (error) {
    throw error;
  }
};

export const logout = async (req) => {
  cookies().set("refreshAccessToken", "loggedOut", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
  return { data: [], statusCode: 200 };
};
export const forgetPassword = async (req) => {
  let user;
  try {
    const { email } = await req?.json();

    if (!email) {
      throw new AppError("Email is required", 400);
    }

    user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      // User not found
      throw new AppError("Email does not exist", 400);
    }
    // Check if the user is currently blocked

    // Check if login attempts are already blocked
    if (user.passwordResetBlockedUntil) {
      if (user.passwordResetBlockedUntil < new Date()) {
        user.passwordResetBlockedUntil = undefined;
        await user.save();
      } else {
        throw new AppError(
          "Your Forget Password attempts are currently blocked. Please wait for an hour before attempting again.",
          400
        );
      }
    }
    // Increment password reset attempts counter
    user.passwordResetAttempts = (user.passwordResetAttempts || 0) + 1;
    // await user.save({ validateBeforeSave: false });
    await user.save();
    // If the user has made 5 unsuccessful attempts, block them for 1 hour
    if (user.passwordResetAttempts >= 5) {
      // Block the user for 1 hour
      user.passwordResetBlockedUntil = new Date(Date.now() + 3600000); // 1 hour in milliseconds
      user.passwordResetAttempts = undefined;

      // await user.save({ validateBeforeSave: false });
      await user.save();
      throw new AppError(
        "Too many unsuccessful password reset attempts. Please try again later.",
        400
      );
    }

    // 2) Generate the random reset token
    const createToken = user.createPasswordResetToken();
    // await user.save({ validateBeforeSave: false });
    await user.save();
    await Email(user, createToken);
    return {
      message: "Token sent to email!",
      statusCode: 200,
    };
    // Continue with password reset logic...
  } catch (error) {
    throw error;
  }
};
export const validateToken = async (req) => {
  try {
    const { email, token } = await req?.json();
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      throw new AppError("User doesn't exist", 404);
    }

    const isBlocked =
      user.passwordResetBlockedUntil &&
      user.passwordResetBlockedUntil > new Date();
    if (isBlocked) {
      throw new AppError(
        "Your reset password attempts are currently blocked. Please wait for an hour before trying again.",
        400
      );
    }

    if (
      !user.passwordResetToken ||
      user.passwordResetExpires < new Date() ||
      token !== user.passwordResetToken
    ) {
      user.passwordResetAttempts = (user.passwordResetAttempts || 0) + 1;
      if (user.passwordResetAttempts >= 5) {
        user.passwordResetBlockedUntil = new Date(Date.now() + 3600000); // Block for 1 hour
        user.passwordResetAttempts = 0;
        await user.save();
        throw new AppError(
          "Too many unsuccessful password reset attempts. Blocked for an hour.",
          400
        );
      }
      await user.save();
      throw new AppError("Invalid or expired token.", 400);
    }

    // Clear blocked state if it was previously set but expired
    if (user.passwordResetBlockedUntil < new Date()) {
      user.passwordResetBlockedUntil = undefined;
      await user.save();
    }

    return { message: "Success", statusCode: 200 };
  } catch (error) {
    throw error;
  }
};

// export const validateToken = async (req) => {
//   let user;
//   try {
//     const { email, token } = await req?.json();
//     user = await User.findOne({
//       email: email, //.toLowerCase(),
//     });
//     if (!user) {
//       throw new AppError("User doesn't exist", 404);
//     }
//     if (user.passwordResetBlockedUntil) {
//       if (user.passwordResetBlockedUntil < new Date()) {
//         user.passwordResetBlockedUntil = undefined;
//         await user.save();
//       } else {
//         throw new AppError(
//           "Your Rest Password attempts are currently blocked. Please wait for an hour before attempting again.",
//           400
//         );
//       }
//     }
//     if (!user.passwordResetToken) {
//       throw new AppError(
//         "Your rest password token has been invalid anymore please request new one.",
//         400
//       );
//     }
//     if (
//       (user.passwordResetExpires && user.passwordResetExpires < new Date()) ||
//       (user.passwordResetToken && token !== user.passwordResetToken)
//     ) {
//       user.passwordResetAttempts = (user.passwordResetAttempts || 0) + 1;
//       // await user.save({ validateBeforeSave: false });
//       await user.save(); // If the user has made 5 unsuccessful attempts, block them for 1 hour
//       if (user.passwordResetAttempts >= 5) {
//         // Block the user for 1 hour
//         user.passwordResetBlockedUntil = new Date(Date.now() + 3600000); // 1 hour in milliseconds
//         user.passwordResetAttempts = undefined;

//         // await user.save({ validateBeforeSave: false });
//         await user.save();
//         throw new AppError(
//           "Too many unsuccessful password reset attempts. Please try again later.",
//           400
//         );
//       }
//       throw new AppError("Invalid token Or has been expired.", 400);
//     }
//     return {
//       message: "succuss",
//       statusCode: 200,
//     };
//   } catch (error) {
//     throw error//   }
// };
export const restPassword = async (req) => {
  try {
    const { newPassword, confirmPassword, token } = await req.json();

    if (!newPassword || !confirmPassword) {
      throw new AppError("password OR confirmPassword cannot be empty", 400);
    }

    if (!token) {
      throw new AppError("token is required", 400);
    }
    if (newPassword !== confirmPassword) {
      throw new AppError("password and confirmPassword don't match", 400);
    }
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      //       // User not found
      throw new AppError("Invalid or expired token.", 400);
    }

    // 3) If so, update password
    user.password = newPassword;
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    user.passwordResetAttempts = undefined;
    await user.save();
    // User.findByIdAndUpdate will NOT work as intended!
    const accessToken = await createUserTokens(user._id, req);
    return modifyFinalResponse(user, accessToken, 200);
  } catch (error) {
    throw error;
  }
};
export const updatePassword = async (req) => {
  try {
    const { password, confirmPassword, newPassword } = await req.json();

    if (newPassword !== confirmPassword) {
      throw new AppError("password and confirmPassword don't match", 400);
    }
    if (!password || !newPassword || !confirmPassword) {
      throw new AppError(
        "password, newPassword, confirmPassword cannot be empty",
        400
      );
    }
    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      //       // User not found
      throw new AppError("User does not exist", 400);
    }

    const CheckPassword = await user.CheckPassword(password, user.password);
    if (!CheckPassword) {
      throw new AppError(" old password isn't correct", 400);
    }

    // 3) If so, update password
    user.password = newPassword;
    await user.save();
    const accessToken = await createUserTokens(user._id, req);
    return modifyFinalResponse(user, accessToken, 200);
  } catch (error) {
    throw error;
  }
};
