export const errorControllerTranslate = {
  en: {
    controllers: {
      handleCastErrorDB: (path: string, value: string) => {
        return {
          message: `Invalid ${path}: ${value}.`,
        };
      },
      handleDuplicateFieldsDB: (value: string) => {
        return {
          message: `Duplicate field value: ${value}. Please use another value!`,
        };
      },
      handleValidationErrorDB: (errors: string) => {
        return {
          message: `Invalid input data. ${errors}.`,
        };
      },
      handleJWTError: {
        message: "Invalid token. Please log in again!",
      },
      handleJWTExpiredError: {
        message: "Your token has expired! Please log in again.",
      },
    },
    errors: {
      globalError:
        "Something went very wrong!. If the error persists, please let us know. ",
    },
  },

  uk: {
    controllers: {
      handleCastErrorDB: (path: string, value: string) => {
        return {
          message: `Недійсне значення поля: ${path}: ${value}.`,
        };
      },
      handleDuplicateFieldsDB: (value: string) => {
        return {
          message: `Дублююче значення поля: ${value}. Будь ласка, використовуйте інше значення!`,
        };
      },
      handleValidationErrorDB: (errors: string) => {
        return {
          message: `Недійсні дані введення. ${errors}.`,
        };
      },
      handleJWTError: {
        message: "Недійсний токен. Будь ласка, увійдіть знову!",
      },
      handleJWTExpiredError: {
        message: "Ваш токен закінчився! Будь ласка, увійдіть знову.",
      },
    },
    errors: {
      globalError:
        "Щось пішло не так!. Якщо помилка повторюється, будь ласка, дайте нам знати. ",
    },
  },
} as const;
