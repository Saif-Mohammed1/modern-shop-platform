export const resetPasswordTranslate = {
  en: {
    metadata: {
      title: " Reset Password Page",
      description:
        "This file contains the page component for resetting the password.",
      keywords: "reset password, change password, update password",
    },
    functions: {
      handlePasswordReset: {
        passwordsDoNotMatch: "Passwords do not match",
        fillAllFields: "Please fill all fields",
        successMessage: "Password reset successfully!",
        unexpectedError: "An unexpected error occurred",
      },
    },
    invalidRestToken: {
      title: "Password Reset Issue",
      subtitle: "There was a problem with your password reset request",
      emailLabel: "Associated Email",
    },
    form: {
      title: "Reset Your Password",

      token: {
        label: "Token",
        placeholder: "Enter Your Token",
      },
      newPassword: {
        label: "New Password",
        placeholder: "Enter Your New Password",
      },
      confirmPassword: {
        label: "Confirm New Password",
        placeholder: "Confirm Your New Password",
      },
      submitButton: "Reset Password",
    },
    errors: {
      global: "An unexpected error occurred",
    },
  },
  uk: {
    metadata: {
      title: "Сторінка скидання пароля",
      description: "Цей файл містить компонент сторінки для скидання пароля.",
      keywords: "скинути пароль, змінити пароль, оновити пароль",
    },
    functions: {
      handlePasswordReset: {
        passwordsDoNotMatch: "Паролі не співпадають",
        fillAllFields: "Будь ласка, заповніть всі поля",
        successMessage: "Пароль успішно скинуто!",
        unexpectedError: "Сталася непередбачувана помилка",
      },
    },
    invalidRestToken: {
      title: "Проблема з скиданням пароля",
      subtitle: "Виникла проблема з вашим запитом на скидання пароля",
      emailLabel: "Пов'язаний Email",
    },
    form: {
      title: "Скинути пароль",
      token: {
        label: "Токен",
        placeholder: "Введіть свій токен",
      },
      newPassword: {
        label: "Новий пароль",
        placeholder: "Введіть новий пароль",
      },
      confirmPassword: {
        label: "Підтвердіть новий пароль",
        placeholder: "Підтвердіть свій новий пароль",
      },
      submitButton: "Скинути пароль",
    },
    errors: {
      global: "Сталася непередбачувана помилка",
    },
  },
} as const;
