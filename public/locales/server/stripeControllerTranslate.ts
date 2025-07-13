export const stripeControllerTranslate = {
  en: {
    functions: {
      fetchActiveProducts: {
        message: "No active products found",
      },

      createStripeProduct: {
        shipping_info: {
          name: "Shipping Information",
          noShippingInfo: "Please provide your shipping information",
        },
        products: {
          name: "Products",
          noProducts: "You need at least one product to proceed",
        },
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
      notFoundProduct: (name: string) => `Product ${name} not found`,
      cartEmpty: "Cart is empty",
      noUserFound: "There is no user related to that Email.",
      failedPayment: "Payment not completed.",
      InventoryError: "Inventory reservation failed",
      maxRetry: "Max retries reached for transaction",
      ConcurrentOrder: "Concurrent order processing",
      InvalidMetadata: "Invalid session metadata",
      // noUserExist:
      //   "No user found with the provided email address. Please check the email and try again.",
      noUserExist: "No user found",
      acquireLock: (id: string, maxRetries: number) =>
        `Failed to acquire lock for product ${id} after ${maxRetries} attempts`,
      PartialReservation: (count: number) =>
        `Partial reservation failed for ${count} products`,
      InvalidShipping: "Invalid shipping information format",
      InsufficientStock: (name: string, availableStock: number) =>
        `Insufficient stock. Available: ${availableStock} items for ${name}`,
      priceMismatch: (name: string) => `Product ${name} price mismatch`,
    },
  },
  uk: {
    functions: {
      fetchActiveProducts: {
        message: "Активних продуктів не знайдено",
      },
      createStripeProduct: {
        shipping_info: {
          name: "Інформація про доставку",
          noShippingInfo: "Будь ласка, надайте інформацію про доставку",
        },
        products: {
          name: "Продукти",
          noProducts: "Вам потрібно щонайменше один продукт для продовження",
        },
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
      notFoundProduct: (name: string) => `Продукт ${name} не знайдено`,
      cartEmpty: "Кошик порожній",
      noUserFound:
        "Не знайдено жодного користувача, пов'язаного з цією адресою електронної пошти.",

      failedPayment: "Оплата не завершена.",
      InventoryError: "Не вдалося зарезервувати запаси",
      maxRetry: "Досягнуто максимальної кількості спроб для транзакції",
      ConcurrentOrder: "Обробка одночасного замовлення",
      InvalidMetadata: "Недійсні метадані сеансу",
      // noUserExist:
      //   "Не знайдено жодного користувача з наданою адресою електронної пошти. Будь ласка, перевірте електронну пошту та спробуйте ще раз.",
      noUserExist: "Користувача не знайдено",
      acquireLock: (id: string, maxRetries: number) =>
        `Не вдалося отримати блокування для продукту ${id} після ${maxRetries} спроб`,
      PartialReservation: (count: number) =>
        `Часткове резервування не вдалося для ${count} продуктів`,
      InvalidShipping: "Недійсний формат інформації про доставку",
      InsufficientStock: (name: string, availableStock: number) =>
        `Недостатньо товару. Доступно: ${availableStock} одиниць для ${name}`,
      priceMismatch: (name: string) => `Ціна продукту ${name} не збігається`,
    },
  },
} as const;
