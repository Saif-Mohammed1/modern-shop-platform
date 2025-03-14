import { type NextRequest } from "next/server";

import { DeviceInfo, GeoLocation } from "../types/session.types";
import DeviceDetector from "device-detector-js"; // 725.2K (gzipped: 168.3K)
import crypto from "crypto";
import { TokensService } from "@/app/_server/services/tokens.service";
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
  const { city, country, latitude, longitude } =
    await getLocationFromIp(clientIp);
  return {
    os: result.os?.name || "Unknown OS",
    browser: result.client?.name || "Unknown Browser",
    device: result.device?.type || "Desktop",
    brand: result.device?.brand || undefined,
    model: result.device?.model || undefined,
    isBot: !!result.bot,
    ip: hashedIp,
    fingerprint: deviceFingerprint,
    location: {
      city,
      country,
      latitude,
      longitude,
      source: "ip",
    },
  };
};

export const generateDeviceFingerprint = (
  data: Record<string, string>
): string => {
  return crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");
};

// export const getLocationFromIp = async (ip: string): Promise<string> => {
//   try {
//     /**
//      * "http://ipwhois.app/json/${ip}"
//      * "https://ipapi.co/${ip}/json/"
//       * "https://ipinfo.io/${ip}/json"

//   * "http://ip-api.com/json/${ip}"

//      * "https://api.ipbase.com/v1/json/${ip}"

//      */
//     const response = await fetch(`https://ipapi.co/${ip}/json/`);
//     const data = await response.json();
//     const city = data.city || "Unknown City";
//     const country = data.country_name || "Unknown Country";
//     return `${city}, ${country}`;
//   } catch (error) {
//     console.warn("Error fetching location from IP", error);
//     return "Unknown Location";
//   }
// };
export const getLocationFromIp = async (
  ip: string
): Promise<Omit<GeoLocation, "source">> => {
  const apis = [
    `http://ip-api.com/json/${ip}`, // Unlimited for non-commercial use
    `https://ipwhois.app/json/${ip}`, // 10,000 requests/month
    `https://ipapi.co/${ip}/json/`, // Free tier available
    `https://ipinfo.io/${ip}/json`, // Free tier available
    `https://api.ipbase.com/v1/json/${ip}`, // May require key
  ];

  const fetchLocation = async (
    index: number
  ): Promise<Omit<GeoLocation, "source">> => {
    if (index >= apis.length)
      return {
        city: "Unknown City",
        country: "Unknown Country",
        latitude: 0,
        longitude: 0,
      };

    try {
      const response = await fetch(apis[index]);
      if (!response.ok) throw new Error("API request failed");

      const data = await response.json();
      const city = data.city || data.location?.city || "Unknown City";
      const country =
        data.country_name ||
        data.country ||
        data.location?.country ||
        "Unknown Country";

      const latitude =
        data.lat || data.latitude || data.loc?.split(",")[0] || 0;
      const longitude =
        data.lon || data.longitude || data.loc?.split(",")[1] || 0;
      return {
        city,
        country,
        latitude,
        longitude,
      };
    } catch (error) {
      console.warn(`Error fetching from ${apis[index]}, trying next...`, error);
      return fetchLocation(index + 1);
    }
  };

  return fetchLocation(0);
};
