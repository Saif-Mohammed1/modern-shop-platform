import User from "../models/User.model";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
// import { promisify } from "util";
import crypto from "crypto"; // Add import for the crypto module

import AppError from "@/app/lib/utilities/appError";
import { Email, sendSecurityEmail } from "@/app/lib/utilities/email";
import { RefreshTokenService } from "./refreshTokenController";
import type { NextRequest } from "next/server";
import { authControllerTranslate } from "../../../public/locales/server/authControllerTranslate";
import { lang } from "@/app/lib/utilities/lang";
import { UserAuthType } from "@/app/lib/types/users.types";
import TwoFactorAuth from "../models/2fa.model";
import { getDeviceFingerprint } from "@/app/lib/utilities/refresh-token.util";

type UserTokenType = {
  user: UserAuthType;
  // accessToken: string | null;
  statusCode: number;
  message?: string;
};

export const modifyFinalResponse = (
  user: UserAuthType,
  statusCode: number,
  message?: string
): UserTokenType => {
  let userData = {} as { user: UserAuthType };
  const accessTokenExpires =
    Date.now() +
    Number(process.env.JWT_ACCESS_TOKEN_COOKIE_EXPIRES_IN || 15) * 60 * 1000; // 15 minutes
  userData.user = {
    _id: user._id,
    name: user.name,
    email: user.email,
    emailVerify: user.emailVerify,
    isTwoFactorAuthEnabled: user.isTwoFactorAuthEnabled,
    // password: user.password,
    // photo: user.photo,
    role: user.role,
    createdAt: user.createdAt,
    // phone: user.phone,
    accessToken: user.accessToken,
    accessTokenExpires,
  };
  return {
    message:
      message &&
      authControllerTranslate[lang].functions.modifyFinalResponse.message,
    user: userData.user,
    statusCode,
  };
};
export const isAuth = async (req: NextRequest) => {
  const authHeader =
    // req?.headers?.authorization ||
    req?.headers?.get("authorization");
  const token = authHeader?.startsWith("Bearer") && authHeader.split(" ")[1];
  if (!token) {
    throw new AppError(
      authControllerTranslate[lang].functions.isAuth.noExistingToken,
      401
    );
  }
  try {
    //not working with promisify
    // const decoded = await promisify(verify)(
    //   token,
    //        process.env.JWT_ACCESS_TOKEN_SECRET as string
    // ) as { userId: string; newEmail: string };

    const decoded = verify(
      token,
      process.env.JWT_ACCESS_TOKEN_SECRET as string
    ) as {
      userId: string;

      iat: number;
    };

    // const decoded = await promisify(verify)(
    //   token,
    //   process?.env?.JWT_ACCESS_TOKEN_SECRET
    // );

    const currentUser = await User.findOne({
      _id: decoded?.userId,
      active: true,
    });
    if (!currentUser) {
      throw new AppError(
        authControllerTranslate[lang].functions.isAuth.noUserBelongingToken,
        401
      );
    }
    // console.log(currentUser?.updatedAt, decoded?.iat);
    // if (
    //   currentUser?.passwordChangedAt &&
    //   currentUser?.passwordChangedAt?.getTime() !== decoded?.iat
    // ) {
    //   throw new AppError(
    //     authControllerTranslate[lang].functions.isAuth.invalidSession,
    //     401
    //   );
    // }
    if (currentUser.changedPasswordAfter(decoded?.iat)) {
      throw new AppError(
        authControllerTranslate[lang].functions.isAuth.recentlyChangedPassword,
        401
      );
    }

    req.user = currentUser; // Add user to request
  } catch (error) {
    throw error;
  }
};
export const restrictTo = async (req: NextRequest, ...roles: string[]) => {
  // roles ['admin', 'lead-guide']?. role='user'
  // Ensure `req.user?.role` is defined and a string before checking roles
  const userRole = req.user?.role;

  if (!userRole || !roles.includes(userRole)) {
    throw new AppError(
      authControllerTranslate[lang].functions.restrictTo.message,
      403
    );
  }
  return;
};

export const register = async (req: NextRequest) => {
  const transaction = await User.startSession();
  transaction.startTransaction();
  try {
    const { name, email, password, confirmPassword } = await req?.json();

    if (!name || !email || !password) {
      throw new AppError(
        authControllerTranslate[lang].errors.requiredFields,
        400
      );
    }
    if (!confirmPassword) {
      throw new AppError(
        authControllerTranslate[
          lang
        ].functions.register.confirmPasswordRequired,
        400
      );
    }
    if (password !== confirmPassword) {
      throw new AppError(
        authControllerTranslate[
          lang
        ].functions.register.passwordAndConfirmPasswordDontMatch,
        400
      );
    }

    const user = await User.create({
      name,
      email: email, //.toLowerCase(),
      password,
    });

    user.generateVerificationCode();
    // await user.save();
    // // Send the verification email
    // await user.sendVerificationCode();
    const [{ accessToken, refreshToken }, deviceInfo, _] = await Promise.all([
      RefreshTokenService.generateTokens(String(user._id), req),
      getDeviceFingerprint(req),
      user.save(),
      // // Send the verification email
      user.sendVerificationCode(),
    ]);

    const isNewDevice = await RefreshTokenService.isFirstLoginFromDevice(
      req,
      deviceInfo
    );
    // 4. Send notification if new device
    if (isNewDevice) {
      await sendSecurityEmail({
        user: user,
        type: "new-login",
        device: deviceInfo,
      });
    }
    transaction.commitTransaction();

    return modifyFinalResponse(
      {
        ...user.toObject(),
        accessToken,
        // accessTokenExpires: Date.now() + Number(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || 15) * 60 * 1000
      },
      201,
      "User created successfully"
    );
  } catch (error) {
    transaction.abortTransaction();
    throw error;
  } finally {
    transaction.endSession();
  }
};
export const logIn = async (req: NextRequest) => {
  try {
    const { email, password } = await req?.json();
    if (!email || !password) {
      throw new AppError(
        authControllerTranslate[lang].functions.logIn.invalidEmailOrPassword,
        400
      );
    }
    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+password");
    if (!user) {
      // User not found or password incorrect you throw this error to avoid user enumeration
      throw new AppError(
        authControllerTranslate[lang].functions.logIn.invalidEmailOrPassword,
        400
      );
    }
    if (!user?.active) {
      throw new AppError(
        authControllerTranslate[lang].functions.logIn.userNoLongerActive,
        401
      );
    }

    // Check if login attempts are already blocked
    if (user.passwordLoginBlockedUntil) {
      if (user.passwordLoginBlockedUntil < new Date()) {
        user.passwordLoginBlockedUntil = undefined;
        //in case if u save confirm password turn on this line instedd of await user.save();
        // await user.save({ validateBeforeSave: false });
        await user.save();
      } else {
        throw new AppError(
          authControllerTranslate[
            lang
          ].functions.logIn.logInAttemptsBlockedMessage,
          400
        );
      }
    }

    const passwordCorrect = await user.CheckPassword(password, user.password);
    if (!passwordCorrect) {
      user.passwordLoginAttempts = (user.passwordLoginAttempts || 0) + 1;

      // Block the user after 3 unsuccessful attempts
      if (user.passwordLoginAttempts >= 3) {
        user.passwordLoginAttempts = undefined;

        user.passwordLoginBlockedUntil = new Date(Date.now() + 3600000); // 1 hour in milliseconds
      }
      await user.save();

      if (user.passwordLoginAttempts && user.passwordLoginAttempts >= 3) {
        throw new AppError(
          authControllerTranslate[
            lang
          ].functions.logIn.tooManyUnsuccessfulPasswordAttemptsMessage,
          400
        );
      } else {
        throw new AppError(
          authControllerTranslate[lang].functions.logIn.invalidEmailOrPassword,
          400
        );
      }
    }
    if (user.isTwoFactorAuthEnabled) {
      const now = new Date();

      // Check for existing valid token
      if (user.twoFactorTempToken && user.twoFactorTempTokenExpires > now) {
        return {
          user: {
            requires2FA: true,
            tempToken: user.twoFactorTempToken,
            message:
              authControllerTranslate[lang].functions.logIn.twoFactorRequired,
          },
          statusCode: 202,
        };
      }

      // Generate new token only if none exists or expired
      const tempToken = crypto.randomBytes(32).toString("hex");
      const tempTokenExpires = new Date(now.getTime() + 300000); // 5 minutes
      const expires = new Date(
        Date.now() + 5 * 60 * 1000 // 5 minutes * 60 seconds * 1000 milliseconds
      );
      cookies().set("tempToken", tempToken, {
        path: "/", // Ensure the cookie is available across all routes
        expires,

        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // 'Lax' in development if set none need secure to true
        secure: process.env.NODE_ENV === "production", // 'false' in development
        // domain: process.env.NODE_ENV === "production" ? undefined : undefined, // No domain in localhost
        // secure: req?.secure || req?.headers["x-forwarded-proto"] === "https",
      });
      await User.updateOne(
        { _id: user._id },
        {
          twoFactorTempToken: tempToken,
          twoFactorTempTokenExpires: tempTokenExpires,
        }
      );
      return {
        user: {
          requires2FA: true,
          tempToken: tempToken,
          expires,
          message:
            authControllerTranslate[lang].functions.logIn.twoFactorRequired,
        },
        statusCode: 202,
      };
    }
    // }
    // Reset counters on successful login

    // user.passwordLoginAttempts = undefined;
    // user.passwordLoginBlockedUntil = undefined;
    // 4) If everything is correct, send the JWT to the client
    //in case if u save confirm password turn on this line instedd of await user.save();
    // await user.save({ validateBeforeSave: false });
    // await user.save();
    req.user = user;

    const [{ accessToken, refreshToken }, deviceInfo, _] = await Promise.all([
      RefreshTokenService.generateTokens(String(user._id), req),

      getDeviceFingerprint(req),
      User.findByIdAndUpdate(user._id, {
        passwordLoginAttempts: undefined,
        passwordLoginBlockedUntil: undefined,
      }),
    ]);

    const isNewDevice = await RefreshTokenService.isFirstLoginFromDevice(
      req,
      deviceInfo
    );
    // 4. Send notification if new device
    if (isNewDevice) {
      await sendSecurityEmail({
        user: user,
        type: "new-login",
        device: deviceInfo,
      });
    }
    return modifyFinalResponse({ ...user.toObject(), accessToken }, 200);
  } catch (error) {
    throw error;
  }
};

export const logout = async () =>
  /**
   * it will throw error becuse no use of itso commit it
   */
  //req: NextRequest

  {
    cookies().set("refreshAccessToken", "loggedOut", {
      expires: new Date(Date.now() + 10 * 1000), // 10 sec
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    return { data: [], statusCode: 200 };
  };
export const forgetPassword = async (req: NextRequest) => {
  let user;
  try {
    const { email } = await req?.json();

    if (!email) {
      throw new AppError(
        authControllerTranslate[lang].functions.forgetPassword.emailRequired,
        400
      );
    }

    user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      // User not found
      throw new AppError(
        authControllerTranslate[
          lang
        ].functions.forgetPassword.emailDoesNotExist,

        400
      );
    }
    // Check if the user is currently blocked

    // Check if login attempts are already blocked
    if (user.passwordResetBlockedUntil) {
      if (user.passwordResetBlockedUntil < new Date()) {
        user.passwordResetBlockedUntil = undefined;
        await user.save();
      } else {
        throw new AppError(
          authControllerTranslate[
            lang
          ].functions.forgetPassword.forgetPasswordAttemptsBlockedMessage,
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
        authControllerTranslate[
          lang
        ].functions.forgetPassword.tooManyUnsuccessfulForgetPasswordAttemptsMessage,
        400
      );
    }

    // 2) Generate the random reset token
    const createToken = user.createPasswordResetToken();
    // await user.save({ validateBeforeSave: false });
    await user.save();
    await Email(user, createToken);
    return {
      message:
        authControllerTranslate[lang].functions.forgetPassword.tokenSentToEmail,
      statusCode: 200,
    };
    // Continue with password reset logic...
  } catch (error) {
    throw error;
  }
};
export const validateToken = async (req: NextRequest) => {
  try {
    const { email, token } = await req?.json();
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      throw new AppError(
        authControllerTranslate[lang].errors.notFoundUser,

        404
      );
    }

    const isBlocked =
      user.passwordResetBlockedUntil &&
      user.passwordResetBlockedUntil > new Date();
    if (isBlocked) {
      throw new AppError(
        authControllerTranslate[
          lang
        ].functions.validateToken.restPasswordBlockedUntilMessage,
        400
      );
    }

    if (
      !user.passwordResetToken ||
      (user.passwordResetExpires && user.passwordResetExpires < new Date()) ||
      token !== user.passwordResetToken
    ) {
      user.passwordResetAttempts = (user.passwordResetAttempts || 0) + 1;
      if (user.passwordResetAttempts >= 5) {
        user.passwordResetBlockedUntil = new Date(Date.now() + 3600000); // Block for 1 hour
        user.passwordResetAttempts = 0;
        await user.save();
        throw new AppError(
          authControllerTranslate[
            lang
          ].functions.validateToken.restPasswordAttemptsMessage,
          400
        );
      }
      await user.save();
      throw new AppError(
        authControllerTranslate[
          lang
        ].functions.validateToken.invalidOrExpiredToken,
        400
      );
    }

    // Clear blocked state if it was previously set but expired
    if (
      user.passwordResetBlockedUntil &&
      user.passwordResetBlockedUntil < new Date()
    ) {
      user.passwordResetBlockedUntil = undefined;
      await user.save();
    }

    return {
      message:
        authControllerTranslate[lang].functions.validateToken.succussMessage,
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};
export const restPassword = async (req: NextRequest) => {
  try {
    const { newPassword, confirmPassword, token } = await req.json();

    // if (!newPassword || !confirmPassword) {
    //   throw new AppError("password OR confirmPassword cannot be empty", 400);
    // }
    if (!newPassword) {
      throw new AppError(
        authControllerTranslate[
          lang
        ].functions.restPassword.newPasswordRequired,
        400
      );
    }
    if (!confirmPassword) {
      throw new AppError(
        authControllerTranslate[
          lang
        ].functions.restPassword.confirmPasswordRequired,
        400
      );
    }

    if (!token) {
      throw new AppError(
        authControllerTranslate[lang].functions.restPassword.tokenRequired,
        400
      );
    }
    if (newPassword !== confirmPassword) {
      throw new AppError(
        authControllerTranslate[
          lang
        ].functions.restPassword.passwordAndConfirmPasswordDontMatch,
        400
      );
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      //       // User not found
      throw new AppError(
        authControllerTranslate[
          lang
        ].functions.restPassword.invalidOrExpiredToken,

        400
      );
    }

    // 3) If so, update password
    user.password = newPassword;
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    user.passwordResetAttempts = undefined;
    if (user.isTwoFactorAuthEnabled) {
      user.isTwoFactorAuthEnabled = false;
      await Promise.all([
        user.save(),
        TwoFactorAuth.findOneAndDelete({ userId: user._id }),
      ]);
    } else {
      await user.save();
    }

    // User.findByIdAndUpdate will NOT work as intended!
    /**
     * no need accessToken or modifyFinalResponse in restPassword becuse user will login with password
     */
    // const accessToken = await createUserTokens(user._id, req);
    // return modifyFinalResponse(user, accessToken, 200);

    return {
      message:
        authControllerTranslate[lang].functions.restPassword.succussMessage,
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};
export const updatePassword = async (req: NextRequest) => {
  try {
    const { password, confirmPassword, newPassword } = await req.json();

    if (!password) {
      throw new AppError(
        authControllerTranslate[lang].functions.updatePassword.passwordRequired,
        400
      );
    }
    if (!newPassword) {
      throw new AppError(
        authControllerTranslate[
          lang
        ].functions.restPassword.newPasswordRequired,
        400
      );
    }
    if (!confirmPassword) {
      throw new AppError(
        authControllerTranslate[
          lang
        ].functions.restPassword.confirmPasswordRequired,
        400
      );
    }
    if (newPassword !== confirmPassword) {
      throw new AppError(
        authControllerTranslate[
          lang
        ].functions.updatePassword.passwordAndConfirmPasswordDontMatch,
        400
      );
    }
    const user = await User.findById(req?.user?._id).select("+password");
    if (!user) {
      // User not found
      throw new AppError(
        authControllerTranslate[lang].errors.notFoundUser,
        400
      );
    }

    const CheckPassword = await user.CheckPassword(password, user.password);
    if (!CheckPassword) {
      throw new AppError(
        authControllerTranslate[
          lang
        ].functions.updatePassword.oldPasswordIsntCorrect,

        400
      );
    }

    // 3) If so, update password
    user.password = newPassword;

    // await user.save();
    const [{ accessToken, refreshToken }, _] = await Promise.all([
      RefreshTokenService.generateTokens(String(user._id), req),
      user.save(),
    ]);

    return modifyFinalResponse({ ...user.toObject(), accessToken }, 200);
  } catch (error) {
    throw error;
  }
};
