export const registerTranslate = {
  en: {
    metadata: {
      title: "Register for an Account - My Online Shop",
      description:
        "Create an account at My Online Shop to start shopping for your favorite products. Enjoy a seamless and secure shopping experience with us.",

      keywords: "register, account, shop",
    },
    functions: {
      handleRegister: {
        requiredFields: "Please fill all fields",
        passwordsDoNotMatch: "Passwords do not match",
        success: "Account created successfully",
        error: "an expected error happen please try again later",
      },
    },
    form: {
      title: "Create Your Account",
      name: {
        label: "Full Name",
        placeholder: "Enter Your Full Name",
      },
      email: {
        label: "Email Address",
        placeholder: "Enter Your Email Address",
      },
      phone: {
        label: "Phone Number (Optional)",
        placeholder: "Enter Your Phone Number",
      },
      password: {
        label: "Password",
        placeholder: "Enter Your Password",
      },
      confirmPassword: {
        label: "Confirm Password",
        placeholder: "Confirm Your Password",
      },
      submit: "Sign Up",
      login: "Already have an account? Login",
      terms: {
        agreement: "I agree to the",
        termsOfService: "Terms of Service",
        and: "and",
        privacyPolicy: "Privacy Policy",
        required: "You must agree to the terms and privacy policy to register",
        fullText:
          "By creating an account, you agree to our Terms of Service and Privacy Policy. You also consent to receive marketing communications from us.",
      },
    },
  },
  uk: {
    metadata: {
      title: "Зареєструйтесь для облікового запису - Мій інтернет-магазин",
      description:
        "Створіть обліковий запис в Моєму інтернет-магазині, щоб почати покупки улюблених продуктів. Насолоджуйтеся безшовним і безпечним досвідом покупок з нами.",

      keywords: "реєстрація, обліковий запис, магазин",
    },
    functions: {
      handleRegister: {
        requiredFields: "Будь ласка, заповніть всі поля",
        passwordsDoNotMatch: "Паролі не співпадають",
        success: "Обліковий запис успішно створено",
        error: "очікувана помилка, будь ласка, спробуйте ще раз пізніше",
      },
    },
    form: {
      title: "Створіть свій обліковий запис",
      name: {
        label: "Повне ім'я",
        placeholder: "Введіть своє повне ім'я",
      },
      email: {
        label: "Адреса електронної пошти",
        placeholder: "Введіть адресу електронної пошти",
      },
      phone: {
        label: "Номер телефону (необов'язково)",
        placeholder: "Введіть номер телефону",
      },
      password: {
        label: "Пароль",
        placeholder: "Введіть свій пароль",
      },
      confirmPassword: {
        label: "Підтвердити пароль",
        placeholder: "Підтвердіть свій пароль",
      },
      submit: "Зареєструватися",
      login: "Вже маєте обліковий запис? Увійти",
      terms: {
        agreement: "Я погоджуюся з",
        termsOfService: "Умовами надання послуг",
        and: "та",
        privacyPolicy: "Політикою конфіденційності",
        required:
          "Ви повинні погодитися з умовами та політикою конфіденційності для реєстрації",
        fullText:
          "Створюючи обліковий запис, ви погоджуєтеся з нашими Умовами надання послуг та Політикою конфіденційності. Ви також надаєте згоду на отримання маркетингових повідомлень від нас.",
      },
    },
  },
} as const;
