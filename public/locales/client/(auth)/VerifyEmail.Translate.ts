export const VerifyEmailTranslate = {
  en: {
    metadata: {
      title: "Verify Email",
      description: "Verify Email",
      keywords: "Verify Email",
    },
    VerifyEmail: {
      VerifyEmail: "Verify Email",
      EnterCode: (codeLength: number) =>
        `Enter the ${codeLength}-digit code that was sent to your email`,
      VerifyCode: "Verify Code",
      ResendCode: "Resend Code",
      success: "Email verified successfully",
      fail: "Failed to verify email",
      resendCodeSuccess: "Code sent successfully Please check your email",
      resendCodeFail: "Failed to send code",
      userNotFound: "User not found please login and try again",
    },
  },
  uk: {
    metadata: {
      title: "Підтвердіть електронну пошту",
      description: "Підтвердіть електронну пошту",
      keywords: "Підтвердіть електронну пошту",
    },
    VerifyEmail: {
      VerifyEmail: "Підтвердіть електронну пошту",
      EnterCode: (codeLength: number) =>
        `Введіть ${codeLength}-значний код, який був відправлений на вашу електронну пошту`,
      VerifyCode: "Підтвердити код",
      ResendCode: "Відправити код ще раз",
      success: "Електронна пошта успішно підтверджена",
      fail: "Не вдалося підтвердити електронну пошту",
      resendCodeSuccess:
        "Код успішно відправлено Перевірте свою електронну пошту",
      resendCodeFail: "Не вдалося відправити код",
      userNotFound:
        "Користувача не знайдено, будь ласка, увійдіть і спробуйте ще раз",
    },
  },
} as const;
