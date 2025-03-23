"use server";

import { cookies } from "next/headers";

export const deleteCookies = async (cookiesName: string) =>
  (await cookies()).delete(cookiesName);
export const getCookiesValue = async (cookiesName: string) =>
  (await cookies())?.get(cookiesName)?.value;
