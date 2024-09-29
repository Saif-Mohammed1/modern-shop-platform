export const contactUsControllerTranslate = {
  en: {
    model: {
      schema: {
        user: {
          required: "Contact must belong to a user.",
        },
        subject: {
          required: "Subject is required",
        },
        message: {
          required: "Message is required",
        },
      },
    },
  },
  uk: {
    model: {
      schema: {
        user: {
          required: "Контакт повинен належати користувачеві.",
        },
        subject: {
          required: "Тема обов'язкова",
        },
        message: {
          required: "Повідомлення обов'язкове",
        },
      },
    },
  },
} as const;
