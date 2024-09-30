// "use server";
// import { cookies } from "next/headers";

// // const getLang = (): Lang | undefined => {
// //   const langCookie = cookies().get("lang");
// //   return langCookie ? (langCookie.value as Lang) : undefined;
// // };
// // console.log("getLang", getLang);

enum Lang {
  uk = "uk",
  en = "en",
}

export const lang: Lang = Lang.en;
