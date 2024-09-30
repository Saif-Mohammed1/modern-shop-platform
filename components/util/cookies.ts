"use server";

import { cookies } from "next/headers";

export const deleteCookies = async (cookiesName: string) =>
  cookies().delete(cookiesName);
export const getCookiesValue = async (cookiesName: string) =>
  cookies()?.get(cookiesName)?.value;
