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
    form: {
      /**     Reset Your Password
        </h2>
        <form onSubmit={handlePasswordReset} className="space-y-4">
          <div>
            <label className="block text-gray-600">Token</label>
            <input
              type="text"
              value={token}
              disabled
              // onChange={(e) => setToken(e.target.value)}
              required
              className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-600">New Password</label>
            <input
              type="password"
              value={newPassword}
              placeholder="Enter Your New Password"
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-600">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              placeholder="Confirm Your New Password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? <Spinner /> : "Reset Password"}
          </button>
        </form> */
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
