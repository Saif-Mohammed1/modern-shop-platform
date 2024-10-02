import { sign, verify } from "jsonwebtoken";
import RefreshToken from "../models/refreshToken.model";
import AppError from "@/components/util/appError";
import { cookies } from "next/headers";
// import { promisify } from "util";
import { sendEmailOnDetectedUnusualActivity } from "@/components/util/email";
import type { NextRequest } from "next/server";
import { refreshTokenControllerTranslate } from "../_Translate/refreshTokenControllerTranslate";
import { lang } from "@/components/util/lang";
import { userControllerTranslate } from "../_Translate/userControllerTranslate";

const createAccessToken = (userId: string) => {
  return sign({ userId }, process.env.JWT_ACCESS_TOKEN_SECRET as string, {
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
  });
};

const createRefreshAccessToken = async (
  userId: string,
  deviceInfo: string,
  ipAddress: string
) => {
  const token = sign(
    { userId },
    process.env.JWT_REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
    }
  );
  const expiresAt = new Date(
    Date.now() +
      Number(process.env.JWT_REFRESH_TOKEN_COOKIE_EXPIRES_IN) *
        24 *
        60 *
        60 *
        1000
  );
  let refreshToken;
  try {
    refreshToken = await RefreshToken.create({
      token,
      user: userId,
      deviceInfo,
      ipAddress,
      expiresAt,
    });
    return token;
  } catch (error) {
    if (refreshToken) {
      await RefreshToken.findByIdAndDelete(refreshToken._id);
    }
    throw error;
  }
};

export const createUserTokens = async (userId: string, req: NextRequest) => {
  const deviceInfo = req.headers.get("user-agent") || "Unknown Device";
  const ipAddress =
    req.headers.get("x-client-ip") ||
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "0.0.0.0";

  const accessToken = createAccessToken(userId);

  const refreshAccessToken = await createRefreshAccessToken(
    userId,
    deviceInfo,
    ipAddress
  );
  cookies().set("refreshAccessToken", refreshAccessToken, {
    path: "/", // Ensure the cookie is available across all routes
    expires: new Date(
      Date.now() +
        Number(process.env.JWT_REFRESH_TOKEN_COOKIE_EXPIRES_IN) *
          24 *
          60 *
          60 *
          1000
    ),
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // 'Lax' in development if set none need secure to true
    secure: process.env.NODE_ENV === "production", // 'false' in development
    // domain: process.env.NODE_ENV === "production" ? undefined : undefined, // No domain in localhost
    // secure: req?.secure || req?.headers["x-forwarded-proto"] === "https",
  });

  return accessToken;
};
export const refreshAccessToken = async (req: NextRequest) => {
  const token =
    cookies()?.get("refreshAccessToken")?.value ||
    req?.cookies?.get("refreshAccessToken")?.value;

  // Get device info and IP address from the request
  const deviceInfo = req.headers.get("user-agent");
  const ipAddress =
    req.headers.get("x-client-ip") ||
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "0.0.0.0";

  //console.log("refreshAccessToken From  refreshAccessToken", token);
  //console.log("deviceInfo", deviceInfo);
  //console.log("ipAddress", ipAddress);

  try {
    if (!token || !deviceInfo || !ipAddress) {
      throw new AppError(
        refreshTokenControllerTranslate[
          lang
        ].functions.refreshAccessToken.requiredFields,
        400
      );
    }

    const userId = await verifyRefreshToken(
      token //deviceInfo, ipAddress
    );

    const accessToken = createAccessToken(userId);

    return { accessToken, statusCode: 200 };
  } catch (error) {
    throw error; // return res.status(401).json({ message: "Invalid refresh token" });
  }
};
const verifyRefreshToken = async (
  token: string //deviceInfo, ipAddress
) => {
  const refreshToken = await RefreshToken.findOne({
    token,
    // deviceInfo,
    // ipAddress,
  });

  if (!refreshToken) {
    throw new AppError(
      refreshTokenControllerTranslate[
        lang
      ].functions.verifyRefreshToken.invalidRefreshToken,
      401
    );
  }

  if (refreshToken.expiresAt.getTime() < Date.now()) {
    await RefreshToken.findByIdAndDelete(refreshToken._id);
    throw new AppError(
      refreshTokenControllerTranslate[
        lang
      ].functions.verifyRefreshToken.refreshTokenExpired,
      401
    );
  }
  //not working with promisify
  // const payload = await promisify(verify)(
  //   token,
  //   process.env.JWT_REFRESH_TOKEN_SECRET as string
  // ) as { userId: string; newEmail: string };

  const payload = verify(
    token,
    process.env.JWT_REFRESH_TOKEN_SECRET as string
  ) as { userId: string; iat: number; exp: number };
  refreshToken.lastActiveAt = new Date();
  await refreshToken.save();

  return payload.userId;
};

//delete user refresh token on logout
export const deleteRefreshTokenOnLogOut = async (req: NextRequest) => {
  try {
    const token =
      cookies()?.get("refreshAccessToken")?.value ||
      req?.cookies?.get("refreshAccessToken")?.value;

    // if (!token) {
    //   throw new AppError("Missing required fields", 400);
    // }

    const refreshToken = await RefreshToken.findOne({ token });

    if (refreshToken) {
      await RefreshToken.findByIdAndDelete(refreshToken._id);

      // throw new AppError("Invalid refresh token", 401);
    }

    return {
      message:
        refreshTokenControllerTranslate[lang].functions
          .deleteRefreshTokenOnLogOut.message,
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};
// delete all user refresh token on change password
export const deleteAllUserRefreshTokens = async (req: NextRequest) => {
  try {
    // Delete all refresh tokens for the user where user === req.user._id
    const result = await RefreshToken.deleteMany({ user: req?.user?._id });

    if (result.deletedCount === 0) {
      throw new AppError(
        refreshTokenControllerTranslate[
          lang
        ].functions.deleteAllUserRefreshTokens.noRefreshTokens,
        404
      );
    }

    return {
      message:
        refreshTokenControllerTranslate[lang].functions
          .deleteAllUserRefreshTokens.message,
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};
// delete all expired refresh token on server start up or on a cron job
export const deleteExpiredRefreshTokens = async () => {
  try {
    // Delete all refresh tokens where expiresAt < Date.now()
    await RefreshToken.deleteMany({
      expiresAt: { $lt: Date.now() },
    });

    return {
      message:
        refreshTokenControllerTranslate[lang].functions
          .deleteExpiredRefreshTokens.message,
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};

// delete specific user refresh token Or unauthorize a devicel
export const deleteSpecificUserRefreshTokens = async (req: NextRequest) => {
  try {
    await RefreshToken.findOneAndDelete({ user: req?.user?._id, _id: req?.id });
    return {
      message:
        refreshTokenControllerTranslate[lang].functions
          .deleteSpecificUserRefreshTokens.message,
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};

export const detectUnusualLogin = async (req: NextRequest) => {
  const currentIp =
    req.headers.get("x-client-ip") ||
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "0.0.0.0";
  const currentDevice = req.headers.get("user-agent") || "Unknown Device";
  try {
    const lastToken = await RefreshToken.findOne({ user: req?.user?._id }).sort(
      {
        createdAt: -1,
      }
    );

    if (lastToken) {
      const isIpDifferent = lastToken.ipAddress !== currentIp;
      const isDeviceDifferent = lastToken.deviceInfo !== currentDevice;

      if (isIpDifferent || isDeviceDifferent) {
        // Potential unusual activity
        /** user,
         * deviceInfo,
         * ipAddress
         *  */
        if (!req?.user) {
          throw new AppError(
            userControllerTranslate[lang].errors.notFoundUser,
            404
          );
        }
        await sendEmailOnDetectedUnusualActivity(
          req?.user,
          currentDevice,
          currentIp
        );
      }
    }
  } catch (error) {
    throw error;
  }
};

export const getUniqueRefreshTokens = async (req: NextRequest) => {
  try {
    await deleteExpiredRefreshTokensFromUser(req);
    const uniqueTokens = await RefreshToken.aggregate([
      {
        $match: { user: req?.user?._id }, // Match tokens for the specific user
      },
      {
        $group: {
          _id: {
            deviceInfo: "$deviceInfo",
            ipAddress: "$ipAddress",
          },
          token: { $first: "$token" }, // Get the first token for this combination
          createdAt: { $first: "$createdAt" }, // Include createdAt if needed
          lastActiveAt: { $first: "$lastActiveAt" }, // Include lastActiveAt if needed
        },
      },
      {
        $project: {
          _id: 0,
          deviceInfo: "$_id.deviceInfo",
          ipAddress: "$_id.ipAddress",
          token: 1,
          createdAt: 1,
          lastActiveAt: 1,
        },
      },
    ]);

    return { data: uniqueTokens, statusCode: 200 };
  } catch (error) {
    throw error;
  }
};
async function deleteExpiredRefreshTokensFromUser(req: NextRequest) {
  try {
    await RefreshToken.deleteMany({
      user: req?.user?._id,
      expiresAt: { $lt: new Date() }, // Find tokens where expiration date is in the past
    });
  } catch (error) {
    throw error;
  }
}
