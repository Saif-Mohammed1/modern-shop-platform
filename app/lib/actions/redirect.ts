// app/actions/redirect.ts
"use server";

import { redirect } from "next/navigation";

export async function handleRedirect(href: string) {
  redirect(href);
}
