// refresh-token.util.ts
import { DeviceInfo } from "@/app/lib/types/session.types";
import crypto from "crypto";
import DeviceDetector from "device-detector-js";
import { NextRequest } from "next/server";

export const generateSecureRefreshToken = (userId: string): string => {
  const randomBytes = crypto.randomBytes(40);
  return `${userId}_${randomBytes.toString("hex")}`;
};

// export const getDeviceFingerprint = (req: NextRequest): string => {
//   const detector = new DeviceDetector();
//   const userAgent = req.headers.get("user-agent") || "";
//   const currentIp =
//     req.headers.get("x-client-ip") ||
//     req.headers.get("x-forwarded-for") ||
//     req.headers.get("x-real-ip") ||
//     "127.0.0.1";
//   const device = detector.parse(userAgent);

//   return [
//     device.device?.type || "desktop",
//     device.os?.name || "unknown",
//     device.client?.name || "unknown",
//     currentIp,
//     req.headers.get("accept-language") || "en",
//   ].join("|");
// };

export const hashRefreshToken = (token: string): string => {
  return crypto
    .createHmac("sha256", process.env.HASHED_REFRESH_TOKEN_SECRET!)
    .update(token)
    .digest("hex");
};

export const getDeviceFingerprint = async (
  req: NextRequest
): Promise<DeviceInfo> => {
  const userAgent = req.headers.get("user-agent") || "";
  const deviceDetector = new DeviceDetector();
  const result = deviceDetector.parse(userAgent);
  const clientIp =
    req.headers.get("x-client-ip") ||
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "Unknown IP";
  const deviceFingerprint = generateDeviceFingerprint({
    userAgent,
    ip: clientIp,
    os: result.os?.name || "Unknown OS",
    browser: result.client?.name || "Unknown Browser",
    device: result.device?.type || "Desktop",
  });
  const location = await getLocationFromIp(clientIp);
  return {
    os: result.os?.name || "Unknown OS",
    browser: result.client?.name || "Unknown Browser",
    device: result.device?.type || "Desktop",
    brand: result.device?.brand || undefined,
    model: result.device?.model || undefined,
    isBot: !!result.bot,
    ip: clientIp,
    fingerprint: deviceFingerprint,
    location,
  };
};

const generateDeviceFingerprint = (data: Record<string, string>): string => {
  return crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");
};

export const getLocationFromIp = async (ip: string): Promise<string> => {
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();
    return `${data.city}, ${data.country_name}`;
  } catch (error) {
    return "Unknown Location";
  }
};
