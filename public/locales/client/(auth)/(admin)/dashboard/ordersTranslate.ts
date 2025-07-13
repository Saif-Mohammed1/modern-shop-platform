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
            label: "Search by user email",
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
            processing: "Processing",
            shipped: "Shipped",
            delivered: "Delivered",
            completed: "Completed",
            cancelled: "Cancelled",
            refunded: "Refunded",
            failed: "Failed",
            on_hold: "On Hold",
            partially_refunded: "Partially Refunded",
            disputed: "Disputed",
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
        noOrders: "No orders found",
      },
      details: {
        metadata: {
          title: "Order Details",
          description: "Order details for the admin",
          keywords: "admin, order, admin order",
        },
        goBack: "Go back",
        title: "Order Details",
        shipping_info: {
          title: "Shipping Info",
          street: "Street",
          city: "City",
          state: "State",
          postal_code: "Postal Code",
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
            label: "Пошук за електронною поштою користувача",
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
            pending: "В очікуванні",
            processing: "Обробляється",
            shipped: "Відправлено",
            delivered: "Доставлено",
            completed: "Завершено",
            cancelled: "Скасовано",
            refunded: "Повернено",
            failed: "Не вдалося",
            on_hold: "На утриманні",
            partially_refunded: "Частково повернено",
            disputed: "Спірне",
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
        noOrders: "Замовлень не знайдено",
      },

      details: {
        metadata: {
          title: "Деталі замовлення",
          description: "Деталі замовлення для адміністратора",
          keywords: "адміністратор, замовлення, адміністраторське замовлення",
        },
        goBack: "Повернутися",
        title: "Деталі замовлення",
        shipping_info: {
          title: "Інформація про доставку",
          street: "Вулиця",
          city: "Місто",
          state: "Штат",
          postal_code: "Поштовий індекс",
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

export const StatusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-purple-100 text-purple-800",
  shipped: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  completed: "bg-green-200 text-green-900",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-blue-200 text-blue-900",
  failed: "bg-gray-100 text-gray-800",
  on_hold: "bg-orange-100 text-orange-800",
  partially_refunded: "bg-indigo-100 text-indigo-800",
  disputed: "bg-rose-100 text-rose-800",
};
