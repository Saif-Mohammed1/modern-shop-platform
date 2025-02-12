// Usage: Translate for emailUpdatedStatus.tsx
export const emailUpdatedStatusTranslate = {
  en: {
    functions: {
      useEffect: {
        loading: "Processing your request...",
        invalidOrMissingToken: "Invalid or missing token.",
        confirmingRequest: "confirming your request...",
        errorOccurred: "An error occurred while confirming your email.",
      },
      onSuccess: "success",
      onFail: "Error",
      errors: {
        global: "An error occurred while confirming your email.",
      },
    },
  },
  uk: {
    functions: {
      useEffect: {
        loading: "Обробка вашого запиту...",
        invalidOrMissingToken: "Недійсний або відсутній токен.",
        confirmingRequest: "підтвердження вашого запиту...",
        errorOccurred:
          "Під час підтвердження вашої електронної пошти виникла помилка.",
      },
      onSuccess: "успішно",
      onFail: "Помилка",
      errors: {
        global:
          "Під час підтвердження вашої електронної пошти виникла помилка.",
      },
    },
  },
} as const;
