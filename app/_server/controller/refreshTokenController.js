import { sign, verify } from "jsonwebtoken";
import RefreshToken from "../models/refreshToken.model";
import AppError from "@/components/util/appError";
import { cookies } from "next/headers";
import { promisify } from "util";
import { sendEmailOnDetectedUnusualActivity } from "@/components/util/email";

/**  
 * token: { type: String, required: true },
  userId: {
    type: Schema.ObjectId,
    ref: "User",
    required: true,
  },
  deviceInfo: { type: String, required: true }, // e.g., "iPhone 12, iOS 14.4"
  ipAddress: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }, */
const createAccessToken = (userId) => {
  return sign({ userId }, process.env.JWT_ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
  });
};

const createRefreshAccessToken = async (userId, deviceInfo, ipAddress) => {
  const token = sign({ userId }, process.env.JWT_REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
  });
  const expiresAt = new Date(
    Date.now() +
      process.env.JWT_REFRESH_TOKEN_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
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

export const createUserTokens = async (userId, req) => {
  throw new AppError("This is a test error" + JSON.stringify(req), 400);
  const deviceInfo = req.headers.get("user-agent");
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
        process.env.JWT_REFRESH_TOKEN_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax", // 'Lax' in development if set none need secure to true
    secure: process.env.NODE_ENV === "production", // 'false' in development
    // domain: process.env.NODE_ENV === "production" ? undefined : undefined, // No domain in localhost
    // secure: req?.secure || req?.headers["x-forwarded-proto"] === "https",
  });

  return accessToken;
};
export const refreshAccessToken = async (req, res) => {
  const token =
    cookies()?.get("refreshAccessToken")?.value ||
    req?.cookies?.get("refreshAccessToken")?.value ||
    req.cookies?.refreshAccessToken;

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
      throw new AppError("Missing required fields", 400);
    }

    const userId = await verifyRefreshToken(token, deviceInfo, ipAddress);

    const accessToken = createAccessToken(userId);

    return { accessToken };
  } catch (error) {
    throw error; // return res.status(401).json({ message: "Invalid refresh token" });
  }
};
const verifyRefreshToken = async (token, deviceInfo, ipAddress) => {
  const refreshToken = await RefreshToken.findOne({
    token,
    // deviceInfo,
    // ipAddress,
  });

  if (!refreshToken) {
    throw new AppError("Invalid refresh token", 401);
  }

  if (refreshToken.expiresAt < Date.now()) {
    await RefreshToken.findByIdAndDelete(refreshToken._id);
    throw new AppError("Refresh token expired", 401);
  }

  const payload = await promisify(verify)(
    token,
    process.env.JWT_REFRESH_TOKEN_SECRET
  );
  refreshToken.lastActiveAt = new Date();
  await refreshToken.save();

  return payload.userId;
};

//delete user refresh token on logout
export const deleteRefreshTokenOnLogOut = async (req) => {
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

    return { message: "Refresh token deleted", statusCode: 200 };
  } catch (error) {
    throw error;
  }
};
// delete all user refresh token on change password
export const deleteAllUserRefreshTokens = async (req) => {
  try {
    // Delete all refresh tokens for the user where user === req.user._id
    const result = await RefreshToken.deleteMany({ user: req.user._id });

    if (result.deletedCount === 0) {
      throw new AppError("No refresh tokens found", 404);
    }

    return { message: "All refresh tokens deleted", statusCode: 200 };
  } catch (error) {
    throw error;
  }
};
// delete all expired refresh token on server start up or on a cron job
export const deleteExpiredRefreshTokens = async () => {
  try {
    // Delete all refresh tokens where expiresAt < Date.now()
    const result = await RefreshToken.deleteMany({
      expiresAt: { $lt: Date.now() },
    });

    return { message: "Expired refresh tokens deleted", statusCode: 200 };
  } catch (error) {
    throw error;
  }
};

// delete specific user refresh token Or unauthorize a devicel
export const deleteSpecificUserRefreshTokens = async (req) => {
  try {
    await RefreshToken.findOneAndDelete({ user: req.user._id, _id: req.id });
    return { message: "Refresh token deleted", statusCode: 200 };
  } catch (error) {
    throw error;
  }
};

export const detectUnusualLogin = async (user, req) => {
  const currentIp =
    req.headers.get("x-client-ip") ||
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "0.0.0.0";
  const currentDevice = req.headers.get("user-agent");
  try {
    const lastToken = await RefreshToken.findOne({ user: user._id }).sort({
      createdAt: -1,
    });

    if (lastToken) {
      const isIpDifferent = lastToken.ipAddress !== currentIp;
      const isDeviceDifferent = lastToken.deviceInfo !== currentDevice;

      if (isIpDifferent || isDeviceDifferent) {
        // Potential unusual activity
        /** user,
         * deviceInfo,
         * ipAddress
         *  */
        await sendEmailOnDetectedUnusualActivity(
          user,
          currentDevice,
          currentIp
        );
      }
    }
  } catch (error) {
    throw error;
  }
};
