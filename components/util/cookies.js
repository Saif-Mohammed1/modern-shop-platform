"use server";

import { cookies } from "next/headers";

export const deleteCookies = (cookiesName) => cookies().delete(cookiesName);
