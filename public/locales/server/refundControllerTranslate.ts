export const refundUsControllerTranslate = {
  en: {
    model: {
      schema: {
        user: {
          required: 'Refund must belong to a user.',
        },
        issue: {
          required: 'Issue field is required.',
        },
        reason: {
          required: 'reason field is required.',
        },
        invoiceId: {
          required: 'Invoice ID field is required.',
        },
      },
    },
    controller: {
      dataRequired: 'You Need to provide  data',
      invalidInvoiceId: 'invalid Invoice Id',
    },
    errors: {
      userNotFound: 'user is invalid ',
      noDocFound: 'No refund found',
    },
  },
  uk: {
    model: {
      schema: {
        user: {
          required: 'Повернення повинно належати користувачеві.',
        },
        issue: {
          required: "Поле питання обов'язкове.",
        },
        reason: {
          required: "поле причини обов'язкове.",
        },
        invoiceId: {
          required: "Поле ідентифікатора рахунку-фактури обов'язкове.",
        },
      },
    },
    controller: {
      dataRequired: 'Вам потрібно надати дані',
      invalidInvoiceId: 'недійсний ідентифікатор рахунку-фактури',
    },
    errors: {
      userNotFound: 'користувач недійсний',
      noDocFound: 'Повернення не знайдено',
    },
  },
} as const;
