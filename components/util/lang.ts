enum Lang {
  uk = "uk",
  en = "en",
}
export const lang: Lang = Lang.uk || (document?.documentElement?.lang as Lang);
