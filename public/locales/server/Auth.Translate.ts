export const AuthTranslate = {
  en: {
    auth: {
      forgotPassword: {
        passwordResetLinkSent:
          "Please check your email for password reset link",
      },
      isEmailAndTokenValid: {
        tokenIsValid: "Invalid Token Or  expired ",
      },
      resetPassword: {
        passwordResetSuccess: "Password reset successful",
      },
      logOut: {
        logOutSuccess: "Log out successful",
      },
      requestEmailChange: {
        confirmation: "Please check your email for confirmation link",
      },
      confirmEmailChange: {
        emailChangeSuccess:
          "Email change successful Please check your email for confirmation link",
      },
      verifyEmail: {
        emailVerified: "Email verified successfully",
      },
      sendNewVerificationCode: {
        error: "An error occurred while sending the verification code.",
        success:
          "Verification code sent successfully. Please check your email.",
      },
      updateName: {
        success: "Name updated successfully",
        fail: "Failed to update name",
      },
      updateLoginNotificationSent: {
        success: "LoginNotificationSent updated successfully",
        fail: "Failed to update LoginNotificationSent",
      },
    },
    userService: {
      authenticateUser: {
        invalidCredentials: "Invalid credentials",

        userSuspended: "User suspended",
      },
      validateEmailAndToken: {
        invalidToken: "Invalid or expired token",
      },
      isPreviousPassword: {
        passwordMatch: "Cannot reuse previous passwords",
      },
    },
    errors: {
      userNotFound: "User not found",
      userNotActive: "User not active",
      userNotVerified: "User not verified",
      passwordNotMatch: "Password not match",
      userAlreadyExist: "User already exist",
      currentPasswordNotMatch: "Current password is incorrect",
      isPreviousPassword: "Cannot reuse previous passwords",

      emailVerified: "Email already verified",
      invalidToken: "Invalid token",
      emailAlreadyInUse: "Email already in use",
    },
  },
  uk: {
    auth: {
      forgotPassword: {
        passwordResetLinkSent:
          "Будь ласка, перевірте свою електронну пошту для отримання посилання на скидання пароля",
      },
      isEmailAndTokenValid: {
        tokenIsValid: "Недійсний токен або термін дії закінчився",
      },
      resetPassword: {
        passwordResetSuccess: "Скидання пароля успішне",
      },
      logOut: {
        logOutSuccess: "Вихід успішний",
      },
      requestEmailChange: {
        confirmation:
          "Будь ласка, перевірте свою електронну пошту для отримання посилання на підтвердження",
      },
      confirmEmailChange: {
        emailChangeSuccess:
          "Зміна електронної пошти успішна Будь ласка, перевірте свою електронну пошту для отримання посилання на підтвердження",
      },
      verifyEmail: {
        emailVerified: "Електронна пошта успішно підтверджена",
      },
      sendNewVerificationCode: {
        error: "Під час відправлення коду підтвердження виникла помилка.",
        success:
          "Код підтвердження успішно відправлено. Будь ласка, перевірте свою електронну пошту.",
      },

      updateName: {
        success: "Ім'я успішно оновлено",
        fail: "Не вдалося оновити ім'я",
      },
      updateLoginNotificationSent: {
        success: "LoginNotificationSent успішно оновлено",
        fail: "Не вдалося оновити LoginNotificationSent",
      },
    },
    userService: {
      authenticateUser: {
        invalidCredentials: "Невірні дані",

        userSuspended: "Користувач заблокований",
      },
      validateEmailAndToken: {
        invalidToken: "Недійсний або прострочений токен",
      },
      isPreviousPassword: {
        passwordMatch: "Не можна використовувати попередні паролі",
      },
    },
    errors: {
      userNotFound: "Користувач не знайдений",
      userNotActive: "Користувач не активний",
      userNotVerified: "Користувач не підтверджений",
      passwordNotMatch: "Паролі не співпадають",
      userAlreadyExist: "Користувач вже існує",

      currentPasswordNotMatch: "Поточний пароль неправильний",

      isPreviousPassword: "Не можна використовувати попередні паролі",

      emailVerified: "Електронна пошта вже підтверджена",
      invalidToken: "Недійсний токен",
      emailAlreadyInUse: "Електронна адреса вже використовується",
    },
  },
} as const;
