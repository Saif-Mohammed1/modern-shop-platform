export const AuthTranslate = {
  en: {
    auth: {
      verificationEmailRequest: {
        message: "Verification email sent ",
      },
      emailChangeRequest: { message: "Email change request sent " },
      emailChangeConfirmation: { message: "Email change confirmation sent" },
      revokeAllSessions: { message: "All sessions revoked" },
      lockUserAccount: { message: "User account locked" },
      unlockUserAccount: { message: "User account unlocked" },
      revokeSession: { message: "Session revoked" },
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
      requestPasswordReset: {
        AuditLog: {
          message: "Password reset request",
        },
      },
      forcePasswordReset: {
        AuditLog: {
          message: "Force password reset",
        },
      },
      confirmEmailChange: {
        emailChangeSuccess:
          "Email change successful Please check your email for confirmation link",
      },
      verifyEmail: {
        email_verified: "Email verified successfully",
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
      rateLimit: (minutesLeft: number) =>
        `Too many attempts. Try again in ${minutesLeft} minutes`,

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

      email_verified: "Email already verified",
      invalidToken: "Invalid token",
      emailAlreadyInUse: "Email already in use",
    },
  },
  uk: {
    auth: {
      verificationEmailRequest: {
        message: "Лист підтвердження надіслано",
      },
      emailChangeRequest: {
        message: "Запит на зміну електронної пошти надіслано",
      },
      emailChangeConfirmation: {
        message: "Підтвердження зміни електронної пошти надіслано",
      },
      revokeAllSessions: { message: "Всі сесії відкликані" },
      lockUserAccount: { message: "Обліковий запис користувача заблоковано" },
      unlockUserAccount: {
        message: "Обліковий запис користувача розблоковано",
      },
      revokeSession: { message: "Сесію відкликано" },

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
      requestPasswordReset: {
        AuditLog: {
          message: "Запит на скидання пароля",
        },
      },
      forcePasswordReset: {
        AuditLog: {
          message: "Примусове скидання пароля",
        },
      },
      confirmEmailChange: {
        emailChangeSuccess:
          "Зміна електронної пошти успішна Будь ласка, перевірте свою електронну пошту для отримання посилання на підтвердження",
      },
      verifyEmail: {
        email_verified: "Електронна пошта успішно підтверджена",
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
      rateLimit: (minutesLeft: number) =>
        `Забагато спроб. Спробуйте ще раз через ${minutesLeft} хвилин`,
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

      email_verified: "Електронна пошта вже підтверджена",
      invalidToken: "Недійсний токен",
      emailAlreadyInUse: "Електронна адреса вже використовується",
    },
  },
} as const;
