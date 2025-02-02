export const authControllerTranslate = {
  en: {
    functions: {
      modifyFinalResponse: {
        message:
          "User created successfully. Check your email for verification.",
      },
      isAuth: {
        noExistingToken: "You are not logged in! Please log in to get access.",
        noUserBelongingToken:
          "The user belonging to this token no longer exists.",
        invalidSession: "Your session is invalid.",
        recentlyChangedPassword:
          "User recently changed password! Please log in again.",
      },
      restrictTo: {
        message: "You do not have permission to perform this action",
      },
      register: {
        confirmPasswordRequired: "confirmPassword must be required",
        passwordAndConfirmPasswordDontMatch:
          "password and confirmPassword don't match",
      },
      logIn: {
        invalidEmailOrPassword: "Email or Password are incorrect",
        userNoLongerActive:
          "This user is no longer active please contact support",
        logInAttemptsBlockedMessage:
          "Your logIn attempts are currently blocked. Please wait for an hour before attempting again.",
        tooManyUnsuccessfulPasswordAttemptsMessage:
          "Too many unsuccessful password attempts. Please try again later.",
        // emailOrPasswordIncorrect: "Email or Password are ",
      },

      forgetPassword: {
        emailRequired: "Email is required",
        emailDoesNotExist: "Email does not exist",
        forgetPasswordAttemptsBlockedMessage:
          "Your Forget Password attempts are currently blocked. Please wait for an hour before attempting again.",
        tooManyUnsuccessfulForgetPasswordAttemptsMessage:
          "Too many unsuccessful password reset attempts. Please try again later.",
        tokenSentToEmail: "Token sent to email!",
      },
      validateToken: {
        invalidOrExpiredToken: "Invalid or expired token.",

        restPasswordBlockedUntilMessage:
          "Your reset password attempts are currently blocked. Please wait for an hour before trying again.",
        restPasswordAttemptsMessage:
          "Too many unsuccessful password reset attempts. Blocked for an hour.",
        succussMessage: "Password reset successfully",
      },
      restPassword: {
        newPasswordRequired: "New Password is required",
        confirmPasswordRequired: "confirmPassword is required",
        passwordAndConfirmPasswordDontMatch:
          "password and confirmPassword don't match",
        tokenRequired: "token is required",
        invalidOrExpiredToken: "Invalid or expired token.",
        restPasswordBlockedUntilMessage:
          "Your reset password attempts are currently blocked. Please wait for an hour before trying again.",
        restPasswordAttemptsMessage:
          "Too many unsuccessful password reset attempts. Blocked for an hour.",
        succussMessage: "Password reset successfully",
      },
      updatePassword: {
        passwordRequired: "Old Password is required",
        newPasswordRequired: "New Password is required",
        confirmPasswordRequired: "confirmPassword is required",
        passwordAndConfirmPasswordDontMatch:
          "password and confirmPassword don't match",
        userDoesNotExist: "User does not exist",
        oldPasswordIsntCorrect: " old password isn't correct",
        succussMessage: "Password updated successfully",
      },
    },
    errors: {
      notFoundUser: "User does not exist.",
      noUserFoundWithId: "No user found with that ID",

      verificationCodeBlockedUntilMessage:
        "Your verification attempts are currently blocked. Please wait for a while before attempting again.",
      verificationAttemptsMessage:
        "You have reached the maximum number of verification attempts. Please try again later.",
      invalidOrExpiredVerificationCode: "Invalid or expired verification code.",
      requiredFields: "Please fill in all required fields.",
      noDocumentFoundWithId: "No document found with that ID",
    },
  },
  uk: {
    functions: {
      modifyFinalResponse: {
        message:
          "Користувач успішно створений. Перевірте свою електронну пошту для підтвердження.",
      },
      isAuth: {
        noExistingToken:
          "Ви не увійшли в систему! Будь ласка, увійдіть, щоб отримати доступ.",
        noUserBelongingToken:
          "Користувач, який належить до цього токену, більше не існує.",
        invalidSession: "Ваша сесія недійсна.",
        recentlyChangedPassword:
          "Користувач недавно змінив пароль! Будь ласка, увійдіть знову.",
      },
      restrictTo: {
        message: "У вас немає дозволу виконувати цю дію",
      },
      register: {
        confirmPasswordRequired: "confirmPassword має бути обов'язковим",
        passwordAndConfirmPasswordDontMatch:
          "пароль і підтвердження пароля не збігаються",
      },
      logIn: {
        invalidEmailOrPassword: "Електронна пошта або пароль невірні",
        userNoLongerActive:
          "Цей користувач більше не активний, будь ласка, зверніться в службу підтримки",
        logInAttemptsBlockedMessage:
          "Ваші спроби входу в систему наразі заблоковані. Будь ласка, зачекайте годину, перш ніж повторити спробу.",
        tooManyUnsuccessfulPasswordAttemptsMessage:
          "Забагато невдалих спроб введення пароля. Будь ласка, спробуйте пізніше.",
      },

      forgetPassword: {
        emailRequired: "Електронна пошта обов'язкова",
        emailDoesNotExist: "Електронна пошта не існує",
        forgetPasswordAttemptsBlockedMessage:
          "Ваші спроби скидання пароля наразі заблоковані. Будь ласка, зачекайте годину, перш ніж повторити спробу.",
        tooManyUnsuccessfulForgetPasswordAttemptsMessage:
          "Забагато невдалих спроб скидання пароля. Будь ласка, спробуйте пізніше.",
        tokenSentToEmail: "Токен відправлено на електронну пошту!",
      },
      validateToken: {
        invalidOrExpiredToken: "Нед ійсний або прострочений токен.",
        restPasswordBlockedUntilMessage:
          "Ваші спроби скидання пароля наразі заблоковані. Будь ласка, зачекайте годину, перш ніж повторити спробу.",
        restPasswordAttemptsMessage:
          "Забагато невдалих спроб скидання пароля. Заблоковано на годину.",

        succussMessage: "Пароль успішно скинуто",
      },
      restPassword: {
        newPasswordRequired: "Новий пароль обов'язковий",
        confirmPasswordRequired: "confirmPassword обов'язковий",
        passwordAndConfirmPasswordDontMatch:
          "пароль і підтвердження пароля не збігаються",
        tokenRequired: "токен обов'язковий",
        invalidOrExpiredToken: "Недійсний або прострочений токен.",
        restPasswordBlockedUntilMessage:
          "Ваші спроби скидання пароля наразі заблоковані. Будь ласка, зачекайте годину, перш ніж повторити спробу.",
        restPasswordAttemptsMessage:
          "Забагато невдалих спроб скидання пароля. Заблоковано на годину.",
        succussMessage: "Пароль успішно скинуто",
      },

      updatePassword: {
        passwordRequired: "Старий пароль обов'язковий",
        newPasswordRequired: "Новий пароль обов'язковий",
        confirmPasswordRequired: "confirmPassword обов'язковий",
        passwordAndConfirmPasswordDontMatch:
          "пароль і підтвердження пароля не збігаються",
        userDoesNotExist: "Користувач не існує",
        oldPasswordIsntCorrect: " старий пароль неправильний",
        succussMessage: "Пароль успішно оновлено",
      },
    },

    errors: {
      notFoundUser: "Користувач не існує.",
      noUserFoundWithId: "Користувача з таким ID не знайдено",

      verificationCodeBlockedUntilMessage:
        "Ваші спроби верифікації наразі заблоковані. Будь ласка, зачекайте трохи, перш ніж повторити спробу.",
      verificationAttemptsMessage:
        "Ви досягли максимальної кількості спроб верифікації. Будь ласка, спробуйте пізніше.",
      invalidOrExpiredVerificationCode:
        "Недійсний або прострочений код верифікації.",
      requiredFields: "Будь ласка, заповніть всі обов'язкові поля.",
      noDocumentFoundWithId: "Документа з таким ID не знайдено",
    },
  },
} as const;
