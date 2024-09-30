export const forgetPasswordTranslate = {
  en: {
    metadata: {
      title: "Forgot Password - My Awesome Shop",
      description:
        "Recover your password for My Awesome Shop and regain access to your account.",

      keywords:
        "forgot password, recover password, reset password, My Awesome Shop",
    },
    functions: {
      handlePasswordReset: {
        hasToken: {
          error: "Please enter your token",
        },
        email: {
          error: "Please enter your email",
        },
        successMessage: {
          token: "Password reset token verified! Redirecting...",
          email: "Password reset email sent! Please check your inbox.",
        },
      },
      form: {
        title: "Forgot Password",

        email: {
          label: "Email Address",
          placeholder: "Enter Your Email Address",
        },
        token: {
          label: "Token",
          placeholder: "Enter Your Token",
        },
        submit: {
          hasToken: "Submit Token",
          email: "Send Reset Link",
        },
        toggle: {
          hasToken: {
            requestResetLink: "Don't have a token? Request reset link",
          },
          email: {
            alreadyHaveToken: "Already have a token?",
          },
        },
      },
      errors: {
        global: "Something went wrong. Please try again.",
      },
    },
  },
  uk: {
    metadata: {
      title: "Забули пароль - Мій крутий магазин",
      description:
        "Відновіть свій пароль для Мого крутого магазину та поверніть доступ до свого облікового запису.",

      keywords:
        "забули пароль, відновити пароль, скинути пароль, Мій крутий магазин",
    },
    functions: {
      handlePasswordReset: {
        hasToken: {
          error: "Будь ласка, введіть свій токен",
        },
        email: {
          error: "Будь ласка, введіть свою електронну пошту",
        },
        successMessage: {
          token: "Токен скидання пароля перевірено! Перенаправлення...",
          email:
            "Електронний лист зі скиданням пароля надіслано! Будь ласка, перевірте свою скриньку.",
        },
      },
      form: {
        title: "Забули пароль",

        email: {
          label: "Адреса електронної пошти",
          placeholder: "Введіть свою адресу електронної пошти",
        },
        token: {
          label: "Токен",
          placeholder: "Введіть свій токен",
        },
        submit: {
          hasToken: "Надіслати токен",
          email: "Надіслати посилання для скидання",
        },
        toggle: {
          hasToken: {
            requestResetLink: "Немає токена? Запитайте посилання для скидання",
          },
          email: {
            alreadyHaveToken: "Вже маєте токен?",
          },
        },
      },
      errors: {
        global: "Щось пішло не так. Будь ласка, спробуйте ще раз.",
      },
    },
  },
} as const;
