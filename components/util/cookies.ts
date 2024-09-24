"use server";

import { cookies } from "next/headers";

export const deleteCookies = (cookiesName: string) =>
  cookies().delete(cookiesName);
export const getCookiesValue = (cookiesName: string) =>
  cookies()?.get(cookiesName)?.value;
