export const OrderTranslate = {
  en: {
    dto: {
      street: {
        required: "Street is required",
      },
      city: {
        required: "City is required",
      },
      state: {
        required: "State is required",
      },
      postal_code: {
        required: "Postal code is required",
      },
      phone: {
        required: "Phone is required",
      },
      country: {
        required: "Country is required",
      },
      items: {
        _id: {
          required: "Product id is required",
        },
        name: {
          required: "Product name is required",
        },
        quantity: {
          required: "Product quantity is required",
        },
        sku: {
          required: "Product Sku is required",
        },
        price: {
          required: "Product price is required",
        },
        discount: {
          required: "Product discount is required",
        },
        final_price: {
          required: "Product final price is required",
        },
      },
      user_id: {
        required: "User id is required",
      },
      shipping_info: {
        required: "Shipping info is required",
      },
      invoice_id: {
        required: "Invoice id is required",
      },
      invoice_link: {
        required: "Invoice link is required",
      },
      totalPrice: {
        required: "Total price is required",
      },
      status: {
        required: "Status is required",
      },
      subtotal: {
        required: "Subtotal is required",
      },
      // shippingCost: {
      //   required: "Shipping cost is required",
      // },
      tax: {
        required: "Tax is required",
      },
      order_notes: {
        required: "Order notes are required",
      },
      cancellationReason: {
        required: "Cancellation reason is required",
      },
      paymentMethod: {
        required: "Payment method is required",
      },
      transactionId: {
        required: "Transaction ID is required",
      },
    },
    functions: {
      create: {
        success: "Order created successfully",
        error: "Error creating order",
      },
      updateStatus: {
        success: "Order status updated successfully",
        error: "Error updating order status",
      },
      findByUser: {
        success: "Orders found successfully",
        error: "Error finding orders",
      },
      findById: {
        success: "Order found successfully",
        error: "Error finding order",
      },
      delete: {
        success: "Order deleted successfully",
        error: "Error deleting order",
      },
    },
    errors: {
      noDocumentsFound: "No documents found",
    },
  },
  uk: {
    dto: {
      street: {
        required: "Вулиця обов'язкова",
      },
      city: {
        required: "Місто обов'язкове",
      },
      state: {
        required: "Область обов'язкова",
      },
      postal_code: {
        required: "Поштовий індекс обов'язковий",
      },
      phone: {
        required: "Телефон обов'язковий",
      },
      country: {
        required: "Країна обов'язкова",
      },
      items: {
        _id: {
          required: "Ідентифікатор продукту обов'язковий",
        },
        name: {
          required: "Назва продукту обов'язкова",
        },
        quantity: {
          required: "Кількість продукту обов'язкова",
        },
        sku: {
          required: "Артикул продукту обов'язковий",
        },
        price: {
          required: "Ціна продукту обов'язкова",
        },
        discount: {
          required: "Знижка на продукт обов'язкова",
        },
        final_price: {
          required: "Кінцева ціна продукту обов'язкова",
        },
      },
      user_id: {
        required: "Ідентифікатор користувача обов'язковий",
      },
      shipping_info: {
        required: "Інформація про доставку обов'язкова",
      },
      invoice_id: {
        required: "Ідентифікатор рахунку обов'язковий",
      },
      invoice_link: {
        required: "Посилання на рахунок обов'язкове",
      },
      totalPrice: {
        required: "Загальна ціна обов'язкова",
      },
      status: {
        required: "Статус обов'язковий",
      },

      subtotal: {
        required: "Проміжна сума обов'язкова",
      },
      // shippingCost: {
      //   required: "Вартість доставки обов'язкова",
      // },
      tax: {
        required: "Податок обов'язковий",
      },
      order_notes: {
        required: "Примітки до замовлення обов'язкові",
      },
      cancellationReason: {
        required: "Причина скасування обов'язкова",
      },
      paymentMethod: {
        required: "Метод оплати обов'язковий",
      },
      transactionId: {
        required: "Ідентифікатор транзакції обов'язковий",
      },
    },
    functions: {
      create: {
        success: "Замовлення успішно створено",
        error: "Помилка створення замовлення",
      },
      updateStatus: {
        success: "Статус замовлення успішно оновлено",
        error: "Помилка оновлення статусу замовлення",
      },
      findByUser: {
        success: "Замовлення успішно знайдено",
        error: "Помилка пошуку замовлень",
      },
      findById: {
        success: "Замовлення успішно знайдено",
        error: "Помилка пошуку замовлення",
      },
      delete: {
        success: "Замовлення успішно видалено",
        error: "Помилка видалення замовлення",
      },
    },
    errors: {
      noDocumentsFound: "Документи не знайдено",
    },
  },
};
