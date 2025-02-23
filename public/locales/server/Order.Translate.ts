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
      postalCode: {
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
        price: {
          required: "Product price is required",
        },
        discount: {
          required: "Product discount is required",
        },
        finalPrice: {
          required: "Product final price is required",
        },
      },
      userId: {
        required: "User id is required",
      },
      shippingInfo: {
        required: "Shipping info is required",
      },
      invoiceId: {
        required: "Invoice id is required",
      },
      invoiceLink: {
        required: "Invoice link is required",
      },
      totalPrice: {
        required: "Total price is required",
      },
      status: {
        required: "Status is required",
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
      postalCode: {
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
        price: {
          required: "Ціна продукту обов'язкова",
        },
        discount: {
          required: "Знижка на продукт обов'язкова",
        },
        finalPrice: {
          required: "Кінцева ціна продукту обов'язкова",
        },
      },
      userId: {
        required: "Ідентифікатор користувача обов'язковий",
      },
      shippingInfo: {
        required: "Інформація про доставку обов'язкова",
      },
      invoiceId: {
        required: "Ідентифікатор рахунку обов'язковий",
      },
      invoiceLink: {
        required: "Посилання на рахунок обов'язкове",
      },
      totalPrice: {
        required: "Загальна ціна обов'язкова",
      },
      status: {
        required: "Статус обов'язковий",
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
