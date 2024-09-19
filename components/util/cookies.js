"use server";

import { cookies, headers } from "next/headers";

export const deleteCookies = (cookiesName) => cookies().delete(cookiesName);
export const getCookiesValue = (cookiesName) =>
  cookies()?.get(cookiesName)?.value;

export const getCustomHeaders = () => {
  return {
    "User-Agent": headers().get("user-agent"), // Get the user agent from headers
    Cookie: `refreshAccessToken=${getCookiesValue("refreshAccessToken")}`, // Get the refresh token from cookies
  };
};
