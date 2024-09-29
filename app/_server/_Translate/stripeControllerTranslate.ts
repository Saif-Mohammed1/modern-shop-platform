export const stripeControllerTranslate = {
  en: {
    functions: {
      fetchActiveProducts: {
        message: "No active products found",
      },

      createStripeProduct: {
        productNotAvailableAnymore: (name: string) =>
          `Product ${name} is not available anymore please remove it from your cart for success payment `,
        insufficientStock: (name: string) =>
          `Insufficient stock for product ${name}`,
      },

      invoiceDetails: {
        custom_fields: {
          name: "Order Information",
          value: "Thank you for your purchase!",
        },

        description: "Detailed description of the invoice",
        footer:
          "Thank you for choosing Website. For any inquiries, please contact us at",
      },
      handleStripeWebhook: {
        message: "Stripe webhook received successfully",
        error: "Webhook signature verification failed.",
      },
    },
    errors: {
      noUserFound: "There is no user related to that Email.",
      failedPayment: "Payment not completed.",
    },
  },
  uk: {
    functions: {
      fetchActiveProducts: {
        message: "Активних продуктів не знайдено",
      },
      createStripeProduct: {
        productNotAvailableAnymore: (name: string) =>
          `Продукт ${name} більше не доступний, будь ласка, видаліть його з кошика для успішної оплати`,
        insufficientStock: (name: string) => `Недостатньо товару ${name}`,
      },
      invoiceDetails: {
        custom_fields: {
          name: "Інформація про замовлення",
          value: "Дякуємо за вашу покупку!",
        },
        description: "Детальний опис рахунку",
        footer:
          "Дякуємо, що обрали Website. За всіма питаннями звертайтеся до нас за адресою",
      },
      handleStripeWebhook: {
        message: "Вебхук Stripe успішно отримано",
        error: "Перевірка підпису вебхука не вдалася.",
      },
    },
    errors: {
      noUserFound:
        "Не знайдено жодного користувача, пов'язаного з цією адресою електронної пошти.",

      failedPayment: "Оплата не завершена.",
    },
  },
} as const;
