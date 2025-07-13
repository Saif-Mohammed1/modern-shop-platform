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
      register: {
        success: "User registered successfully.",
        error: "An error occurred while registering the user.",
      },

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
      userAlreadyExist:
        "User already exist in our system please try another email",
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
      register: {
        success: "Користувача успішно зареєстровано.",
        error: "Під час реєстрації користувача сталася помилка.",
      },
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
      userAlreadyExist:
        "Користувач вже існує в нашій системі, спробуйте іншу електронну пошту",
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

/**
 *   .object({
       name: z
         .string()
         .min(3, "Name must be at least 3 characters")
         .max(50, "Name must be under 50 characters"),
       email: z
         .string()
         .email("Invalid email format")
         .refine((email) => {
           const domain = email.split("@")[1];
           return this.allowedEmailDomains.includes(domain);
         }, "Email domain is not allowed"),
       phone: z
         .string()
         .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format") // Supports E.164 format
         .optional(),
       password: z
         .string()
         .min(10, "Password must be at least 10 characters")
         .max(50, "Password must be under 50 characters")
         .regex(
           /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
           "Password must contain at least one lowercase, one uppercase, one number, and one special character"
         ),
       confirmPassword: z.string(),
       role: z.enum(["customer", "admin", "moderator"]).default("customer"),
       preferences: z
         .object({
           language: z.enum(["en", "es", "fr", "de"]).default("en"),
           currency: z.enum(["USD", "EUR", "GBP"]).default("USD"),
           marketingOptIn: z.boolean().default(false),
         })
         .optional(),
     })
     .refine((data) => data.password === data.confirmPassword, {
       message: "Passwords do not match",
       path: ["confirmPassword"],
     });
 */
export const userZodValidatorTranslate = {
  en: {
    name: {
      required: "Name must be required",
      minLength: "Name must be at least 3 characters",
      maxLength: "Name must be under 50 characters",
    },
    email: {
      required: "Email must be required",
      invalid: "Invalid email format",
      domainNotAllowed: "Email domain is not allowed",
    },
    phone: {
      invalid: "Invalid phone number format",
    },
    password: {
      required: "Password must be required",
      minLength: "Password must be at least 10 characters",
      maxLength: "Password must be under 40 characters",
      invalid:
        "Password must contain at least one lowercase, one uppercase, one number, and one special character",
    },
    token: {
      required: "Token must be required",
    },
    currentPassword: {
      required: "Old password must be required",
    },
    confirmPassword: {
      required: "Password confirm must be required",
      invalid: "Passwords do not match",
    },
    role: {
      invalid: "Invalid role",
    },
    verificationCode: {
      required: "Verification code must be required",
      invalid: "Invalid verification code",
    },
    login_notification_sent: {
      required: "Login notification sent must be required",
      boolean: "Login notification sent must be a boolean",
    },
    // preferences: {
  },
  uk: {
    name: {
      required: "Ім'я має бути обов'язковим",
      minLength: "Ім'я має бути принаймні 3 символи",
      maxLength: "Ім'я має бути менше 50 символів",
    },
    email: {
      required: "Електронна пошта має бути обов'язковою",
      invalid: "Недійсний формат електронної пошти",
      domainNotAllowed: "Домен електронної пошти не дозволений",
    },
    phone: {
      invalid: "Недійсний формат номера телефону",
    },
    password: {
      required: "Пароль має бути обов'язковим",
      minLength: "Пароль має бути принаймні 10 символів",
      maxLength: "Пароль має бути менше 40 символів",
      invalid:
        "Пароль має містити принаймні одну маленьку літеру, одну велику літеру, одну цифру та один спеціальний символ",
    },
    token: {
      required: "Токен має бути обов'язковим",
    },
    currentPassword: {
      required: "Старий пароль має бути обов'язковим",
    },
    confirmPassword: {
      required: "Підтвердження пароля має бути обов'язковим",
      invalid: "Паролі не співпадають",
    },
    role: {
      invalid: "Недійсна роль",
    },
    verificationCode: {
      required: "Код верифікації має бути обов'язковим",
      invalid: "Недійсний код верифікації",
    },

    login_notification_sent: {
      required: "Повідомлення про вхід має бути обов'язковим",
      boolean: "Повідомлення про вхід має бути логічним значенням",
    },
  },
} as const;
