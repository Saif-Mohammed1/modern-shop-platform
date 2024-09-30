export const verifyEmailPasswordTranslate = {
  en: {
    metadata: {
      title: "Verify Email - My Awesome Shop",
      description:
        "Verify your email address to complete your registration at My Awesome Shop. Enjoy a seamless shopping experience with us!",

      keywords: "verify email, email verification, complete registration",
    },
    functions: {
      handleResendVerification: {
        successMessage: "Verification email sent! Please check your inbox.",
        errorMessage: "Failed to send verification email.",
      },
    },
  },
  uk: {
    metadata: {
      title: "Підтвердіть електронну адресу - Мій крутий магазин",
      description:
        "Підтвердіть свою електронну адресу, щоб завершити реєстрацію на Моєму крутому магазині. Насолоджуйтеся безшовним досвідом покупок з нами!",

      keywords:
        "підтвердити електронну адресу, підтвердження електронної пошти, заверш істрацію",
    },
    functions: {
      handleResendVerification: {
        successMessage:
          "Лист із підтвердженням відправлено! Будь ласка, перевірте свою поштову скриньку.",
        errorMessage: "Не вдалося відправити лист із підтвердженням.",
      },
    },
  },
} as const;
