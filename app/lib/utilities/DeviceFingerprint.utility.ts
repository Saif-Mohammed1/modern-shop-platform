import { NextRequest } from "next/server";
import { DeviceInfo } from "../types/refresh.types";
import DeviceDetector from "device-detector-js"; // 725.2K (gzipped: 168.3K)
import crypto from "crypto";
import { TokensService } from "@/app/api/v1/test/services/tokens.service";
const tokensService = new TokensService();
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
  const hashedIp = tokensService.hashIpAddress(clientIp);
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
    ip: hashedIp,
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
    const city = data.city || "Unknown City";
    const country = data.country_name || "Unknown Country";
    return `${city}, ${country}`;
  } catch (error) {
    return "Unknown Location";
  }
};
