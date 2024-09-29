enum Lang {
  uk = "uk",
  en = "en",
}
export const lang: Lang =
  typeof window !== "undefined"
    ? document.cookie.includes("lang=uk")
      ? Lang.uk
      : Lang.en
    : Lang.en;
