"use server";

import { cookies } from "next/headers";

export const deleteCookies = (cookiesName) => cookies().delete(cookiesName);
export const getCookiesValue = (cookiesName) =>
  cookies()?.get(cookiesName)?.value;
