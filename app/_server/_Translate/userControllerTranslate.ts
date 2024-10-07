export const userControllerTranslate = {
  en: {
    model: {
      schema: {
        name: {
          required: "name must be required",
        },
        email: {
          required: "Email must be required",
          unique: "Email must be unique",

          validator: "Email is not a valid email address!",
        },
        password: {
          required: "password must be required",
          minlength: "Password must be at least 10 characters long",
          maxlength: "Password must be less than 60 characters long",
        },
        confirmPassword: {
          required: "passwordConfirm must be required",
          minlength: "passwordConfirm must be at least 10 characters long",
          maxlength: "passwordConfirm must be less than 60 characters long",
          validator: "Passwords are not the same!",
        },
      },
    },
    controllers: {
      sendNewVerificationCode: {
        error: "An error occurred while sending the verification code.",

        success:
          "Verification code sent successfully. Please check your email.",
      },
      verifyEmail: {
        requiredVerificationCode: "verification code must be required",
        success: "Your email has been successfully verified!",
      },
      editUserByAdmin: {
        requiredOneOption: "Please select at least one option.",
      },
      changeEmailRequest: {
        newEmail: "newEmail must be required",
        invalidEmail: "Invalid email format for newEmail",
        confirmationEmailSent:
          "Confirmation email sent to your current email address.",
        emailAlreadyExist:
          "Email already exist in our system please try another email",
      },
      updateUserEmail: {
        requiredToken: "Token must be required",
        message:
          "Email has been successfully updated please verify your new email ",

        errors: {
          TokenExpiredError: "Token has expired",
          JsonWebTokenError: "Invalid token",
          global: "An error occurred while processing your request",
        },
      },
    },
    errors: {
      notFoundUser: "User not found.",
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
    model: {
      schema: {
        name: {
          required: "Ім'я має бути обов'язковим",
        },
        email: {
          required: "Електронна пошта має бути обов'язковою",
          unique: "Електронна пошта має бути унікальною",
          validator: "Електронна пошта не є дійсною адресою електронної пошти!",
        },
        password: {
          required: "Пароль має бути обов'язковим",
          minlength: "Пароль має бути довжиною принаймні 10 символів",
          maxlength: "Пароль має бути менше 60 символів",
        },
        confirmPassword: {
          required: "Підтвердження пароля має бути обов'язковим",
          minlength:
            "Підтвердження пароля має бути довжиною принаймні 10 символів",
          maxlength: "Підтвердження пароля має бути менше 60 символів",
          validator: "Паролі не співпадають!",
        },
      },
    },
    controllers: {
      sendNewVerificationCode: {
        error: "Під час відправлення коду верифікації сталася помилка.",
        success:
          "Код верифікації успішно відправлено. Будь ласка, перевірте свою електронну пошту.",
      },

      verifyEmail: {
        requiredVerificationCode: "код верифікації має бути обов'язковим",
        success: "Електронна пошта успішно підтверджена.",
      },
      editUserByAdmin: {
        requiredOneOption: "Будь лас крім одного варіанту.",
      },
      changeEmailRequest: {
        newEmail: "Нова електронна пошта має бути обов'язковою",
        invalidEmail:
          "Недійсний формат електронної пошти для нової електронної пошти",
        confirmationEmailSent:
          "Лист з підтвердженням відправлено на вашу поточну електронну адресу.",
        emailAlreadyExist:
          "Електронна пошта вже існує в нашій системі, спробуйте іншу електронну пошту",
      },
      updateUserEmail: {
        requiredToken: "Токен має бути обов'язковим",
        message:
          "Електронна пошта успішно оновлена, будь ласка, підтвердіть свою нову електронну пошту",
        errors: {
          TokenExpiredError: "Токен закінчився",
          JsonWebTokenError: "Недійсний токен",
          global: "Під час обробки вашого запиту виникла помилка",
        },
      },
    },
    errors: {
      notFoundUser: "Користувач не знайдений.",
      noUserFoundWithId: "Користувача з таким ідентифікатором не знайдено",
      verificationCodeBlockedUntilMessage:
        "Ваші спроби верифікації наразі заблоковані. Будь ласка, зачекайте трохи, перш ніж повторити спробу.",
      verificationAttemptsMessage:
        "Ви досягли максимальної кількості спроб верифікації. Будь ласка, спробуйте пізніше.",

      invalidOrExpiredVerificationCode:
        "Недійсний або прострочений код верифікації.",
      requiredFields: "Будь ласка, заповніть всі обов'язкові поля.",
      noDocumentFoundWithId: "Документ з таким ідентифікатором не знайдено",
    },
  },
} as const;
