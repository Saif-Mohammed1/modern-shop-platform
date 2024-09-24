export const ordersTranslate = {
  metadata: {
    en: {
      title: "Orders",
      description: "Orders management for the admin",
      keywords: "admin, orders, admin orders",
    },
    uk: {
      title: "Замовлення",
      description: "Управління замовленнями для адміністратора",
      keywords: "адміністратор, замовлення, адміністраторські замовлення",
    },
  },
  functions: {
    en: {
      handleDelete: {
        confirm: "Are you sure you want to delete this order?",
        loading: "deleting orders...",
        success: "Order deleted",
        canceled: "Delete canceled",
        error: "Something went wrong",
      },
      handleStatusUpdate: {
        confirm: "Are you sure you want to update the status of this order?",
        loading: "updating order status...",
        success: "Order status updated",
        canceled: "Status update canceled",
      },

      error: "Something went wrong",
    },
    uk: {
      handleDelete: {
        confirm: "Ви впевнені, що хочете видалити це замовлення?",
        loading: "видалення замовлень...",
        success: "Замовлення видалено",
        canceled: "Видалення скасовано",
      },
      handleStatusUpdate: {
        confirm: "Ви впевнені, що хочете оновити статус цього замовлення?",
        loading: "оновлення статусу замовлення...",
        success: "Статус замовлення оновлено",
        canceled: "Оновлення статусу скасовано",
      },
      error: "Щось пішло не так",
    },
  },

  orders: {
    en: {
      title: "Manage Orders",
      filter: {
        input: {
          search: {
            label: "Search by user",
            placeholder: "Search by user email",
          },
          date: {
            label: "Filter by date",
            placeholder: "Select date",
          },
        },
        select: {
          title: "Filter by Status",
          options: {
            all: "All",
            pending: "Pending",
            completed: "Completed",
            refunded: "Refunded",
            processing: "Processing",
            cancelled: "Cancelled",
          },
        },
      },
      thead: {
        orderId: "Order ID",
        user: "User",
        date: "Date",
        totalPrice: "Total Price",
        status: "Status",
        actions: "Actions",
      },
      tbody: {
        view: "View",
        delete: "Delete",
        updateStatus: "Update Status",
      },
      details: {
        metadata: {
          title: "Order Details",
          description: "Order details for the admin",
          keywords: "admin, order, admin order",
        },
        title: "Order Details",
        shippingInfo: {
          title: "Shipping Info",
          street: "Street",
          city: "City",
          state: "State",
          postalCode: "Postal Code",
          phone: "Phone",
          country: "Country",
        },
        items: {
          title: "Items",
          name: "Name",
          quantity: "Quantity",
          price: "Price",
        },
        status: "Order Status",
        submit: "Update Status",
      },
    },
    uk: {
      title: "Управління замовленнями",
      filter: {
        input: {
          search: {
            label: "Пошук за користувачем",
            placeholder: "Пошук за електронною поштою користувача",
          },
          date: {
            label: "Фільтрувати за датою",
            placeholder: "Виберіть дату",
          },
        },
        select: {
          title: "Фільтрувати за статусом",
          options: {
            all: "Всі",
            pending: "Очікується",
            completed: "Завершено",
            refunded: "Повернено",
            processing: "Обробляється",
            cancelled: "Скасовано",
          },
        },
      },
      thead: {
        orderId: "ID замовлення",
        user: "Користувач",
        date: "Дата",
        totalPrice: "Загальна вартість",
        status: "Статус",
        actions: "Дії",
      },
      tbody: {
        view: "Переглянути",
        delete: "Видалити",
        updateStatus: "Оновити статус",
      },

      details: {
        metadata: {
          title: "Деталі замовлення",
          description: "Деталі замовлення для адміністратора",
          keywords: "адміністратор, замовлення, адміністраторське замовлення",
        },
        title: "Деталі замовлення",
        shippingInfo: {
          title: "Інформація про доставку",
          street: "Вулиця",
          city: "Місто",
          state: "Штат",
          postalCode: "Поштовий індекс",
          phone: "Телефон",
          country: "Країна",
        },
        items: {
          title: "Предмети",
          name: "Назва",
          quantity: "Кількість",
          price: "Ціна",
        },
        status: "Статус замовлення",
        submit: "Оновити статус",
      },
    },
  },
} as const;

export enum OrderStatus {
  pending = "pending",
  completed = "completed",
  refunded = "refunded",
  processing = "processing",
  cancelled = "cancelled",
}
