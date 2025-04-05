export const registerTranslate = {
  en: {
    metadata: {
      title: 'Register for an Account - My Online Shop',
      description:
        'Create an account at My Online Shop to start shopping for your favorite products. Enjoy a seamless and secure shopping experience with us.',

      keywords: 'register, account, shop',
    },
    functions: {
      handleRegister: {
        requiredFields: 'Please fill all fields',
        passwordsDoNotMatch: 'Passwords do not match',
        success: 'Account created successfully',
        error: 'an expected error happen please try again later',
      },
    },
    form: {
      title: 'Create Your Account',
      name: {
        label: 'Full Name',
        placeholder: 'Enter Your Full Name',
      },
      email: {
        label: 'Email Address',
        placeholder: 'Enter Your Email Address',
      },
      password: {
        label: 'Password',
        placeholder: 'Enter Your Password',
      },
      confirmPassword: {
        label: 'Confirm Password',
        placeholder: 'Confirm Your Password',
      },
      submit: 'Sign Up',
      login: 'Already have an account? Login',
    },
  },
  uk: {
    metadata: {
      title: 'Зареєструйтесь для облікового запису - Мій інтернет-магазин',
      description:
        'Створіть обліковий запис в Моєму інтернет-магазині, щоб почати покупки улюблених продуктів. Насолоджуйтеся безшовним і безпечним досвідом покупок з нами.',

      keywords: 'реєстрація, обліковий запис, магазин',
    },
    functions: {
      handleRegister: {
        requiredFields: 'Будь ласка, заповніть всі поля',
        passwordsDoNotMatch: 'Паролі не співпадають',
        success: 'Обліковий запис успішно створено',
        error: 'очікувана помилка, будь ласка, спробуйте ще раз пізніше',
      },
    },
    form: {
      title: 'Створіть свій обліковий запис',
      name: {
        label: "Повне ім'я",
        placeholder: "Введіть своє повне ім'я",
      },
      email: {
        label: 'Адреса електронної пошти',
        placeholder: 'Введіть адресу електронної пошти',
      },
      password: {
        label: 'Пароль',
        placeholder: 'Введіть свій пароль',
      },
      confirmPassword: {
        label: 'Підтвердити пароль',
        placeholder: 'Підтвердіть свій пароль',
      },
      submit: 'Зареєструватися',
      login: 'Вже маєте обліковий запис? Увійти',
    },
  },
} as const;
