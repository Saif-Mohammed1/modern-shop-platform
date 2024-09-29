export const reportUsControllerTranslate = {
  en: {
    model: {
      schema: {
        user: {
          required: "Report must belong to a user.",
        },
        product: {
          required: "Report must belong to a product.",
        },
        status: {
          required: "Status field is required.",
        },
        name: {
          required: "Name field is required.",
        },
        issue: {
          required: "Issue field is required.",
        },
        message: {
          required: "Message field is required.",
        },
      },
    },
    errors: {
      notFound: "No reports found",
    },
  },
  uk: {
    model: {
      schema: {
        user: {
          required: "Повідомлення повинно належати користувачеві.",
        },
        product: {
          required: "Повідомлен надіслано на продукт.",
        },
        status: {
          required: "Поле статусу обов'язкове.",
        },
        name: {
          required: "Поле імені обов'язкове.",
        },
        issue: {
          required: "Поле питання обов'язкове.",
        },
        message: {
          required: "Поле повідомлення обов'язкове.",
        },
      },
    },
    errors: {
      notFound: "Повідомлення не знайдено",
    },
  },
} as const;
