export const loginTranslate = {
  en: {
    Metadata: {
      title: "Shop - Login Page",
      description: "Login to access your account on the Shop app",
      keywords: "login, account, shop",
    },
    functions: {
      handleLogin: {
        requiredFields: "Please fill all fields",
        success: "Login success 👌",
      },
    },
    form: {
      title: "Login to Your Account",
      email: {
        label: "Email Address",
        placeholder: "Enter Your Email Address",
      },
      password: {
        label: "Password",
        placeholder: "Enter Your Password",
      },
      showPassword: {
        show: "Show",
        hide: "Hide",
      },
      forgotPassword: "Forgot Password?",
      login: "Login",
      signUp: "Don't have an account? Sign up",
    },
    errors: {
      global: "An unexpected error occurred, please try again later.",
    },
  },
  uk: {
    Metadata: {
      title: "Магазин - Сторінка входу",
      description:
        "Увійдіть, щоб отримати доступ до свого облікового запису в додатку Магазин",
      keywords: "вхід, обліковий запис, магазин",
    },
    functions: {
      handleLogin: {
        requiredFields: "Будь ласка, заповніть всі поля",
        success: "Успішний вхід 👌",
      },
    },
    form: {
      title: "Увійдіть в свій обліковий запис",
      email: {
        label: "Адреса електронної пошти",
        placeholder: "Введіть свою адресу електронної пошти",
      },
      password: {
        label: "Пароль",
        placeholder: "Введіть свій пароль",
      },
      showPassword: {
        show: "Показати",
        hide: "Приховати",
      },
      forgotPassword: "Забули пароль?",
      login: "Увійти",
      signUp: "Ще не маєте облікового запису? Зареєструватися",
    },
    errors: {
      global: "Виникла непередбачувана помилка, спробуйте ще раз пізніше.",
    },
  },
} as const;
