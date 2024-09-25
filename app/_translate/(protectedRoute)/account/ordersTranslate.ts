const OrderTracking = {
  en: {
    orderId: "Order #",
    shippingInfo: {
      title: "Shipping Info",
      street: "Street",
      city: "City",
      state: "State",
      postalCode: "Postal Code",
      country: "Country",
      phone: "Phone",
    },
    items: {
      title: "Items Ordered",
      name: "Name",
      quantity: "Quantity",

      price: "Price",
      discount: "Discount",
      existDiscount: "N/A",
      finalPrice: "Final Price",
    },
    orderStatus: {
      title: "Order Status",
      totalPrice: "Total Price",
    },
    invoice: {
      title: "Invoice",
      viewInvoice: "View Invoice",
    },
  },
  uk: {
    orderId: "Замовлення #",
    shippingInfo: {
      title: "Інформація про доставку",
      street: "Вулиця",
      city: "Місто",
      state: "Область",
      postalCode: "Поштовий індекс",
      country: "Країна",
      phone: "Телефон",
    },
    items: {
      title: "Замовлені товари",
      name: "Назва",
      quantity: "Кількість",
      price: "Ціна",
      discount: "Знижка",
      existDiscount: "Немає",
      finalPrice: "Кінцева ціна",
    },
    orderStatus: {
      title: "Статус замовлення",
      totalPrice: "Загальна ціна",
    },
    invoice: {
      title: "Рахунок",
      viewInvoice: "Переглянути рахунок",
    },
  },
} as const;
const OrderCase = {
  en: {
    succuss: {
      title: "Order Successful!",
      message:
        "Thank you for your purchase. Your order has been successfully placed.",
    },
    failed: {
      title: "Order Failed",
      message:
        "Unfortunately, your order could not be processed. Please try again or contact support.",
    },
    button: "Go Back to Shop",
  },
  uk: {
    succuss: {
      title: "Замовлення успішно!",
      message: "Дякуємо за покупку. Ваше замовлення успішно виконано.",
    },
    failed: {
      title: "Замовлення не вдалося",
      message:
        "На жаль, ваше замовлення не може бути оброблено. Спробуйте ще раз або зверніться до служби підтримки.",
    },
    button: "Повернутися до магазину",
  },
};

const OrderCancellation = {
  en: {
    metadata: {
      title: "Order Cancellation",
      description: "Order Cancellation for the customer",
      keywords: "customer, order cancellation, customer order cancellation",
    },
    title: "Cancel Your Order",
    submitted: {
      title: "Order Canceled Successfully",
      message: "Thank you for your feedback!",
    },
    form: {
      label: "Why are you cancelling your order?",
      select: {
        placeholder: "Select a reason",
        options: {
          found_cheaper: "Found a cheaper alternative",
          changed_mind: "Changed my mind",
          late_delivery: "Delivery is taking too long",
          other: "Other",
        },
      },
      feedback: {
        label: "Please provide additional feedback (optional):",
        placeholder: "Your feedback here...",
      },
    },
    button: "Confirm Cancellation",
  },
  uk: {
    metadata: {
      title: "Скасування замовлення",
      description: "Скасування замовлення для клієнта",
      keywords: "клієнт, скасування замовлення, скасування замовлення клієнта",
    },

    title: "Скасувати ваше замовлення",
    submitted: {
      title: "Замовлення скасовано успішно",
      message: "Дякуємо за ваш відгук!",
    },
    form: {
      label: "Чому ви скасовуєте своє замовлення?",
      select: {
        placeholder: "Виберіть причину",
        options: {
          found_cheaper: "Знайшов дешевший аналог",
          changed_mind: "Змінив свою думку",
          late_delivery: "Доставка займає забагато часу",
          other: "Інше",
        },
      },
      feedback: {
        label: "Надайте додатковий відгук (необов'язково):",
        placeholder: "Ваш відгук тут...",
      },
    },
    button: "Підтвердити скасування",
  },
} as const;
const OrderHistory = {
  en: {
    title: "My Order History",
    order: {
      orderId: "Order #",
      status: "Status",
      products: {
        title: "Products",
        name: "Name",
        quantity: "Quantity",
      },
      shippingInfo: {
        title: "Shipping Info",
        street: "Street",
        city: "City",
        state: "State",
        postalCode: "Postal Code",
        country: "Country",
        phone: "Phone",
      },
      amount: "Amount",
      viewInvoice: "View Invoice",
      orderedOn: "Ordered on",
    },
    noOrdersFound: "No orders found.",
  },
  uk: {
    title: "Історія моїх замовлень",
    order: {
      orderId: "Замовлення #",
      status: "Статус",
      products: {
        title: "Товари",
        name: "Назва",
        quantity: "Кількість",
      },
      shippingInfo: {
        title: "Інформація про доставку",
        street: "Вулиця",
        city: "Місто",
        state: "Область",
        postalCode: "Поштовий індекс",
        country: "Країна",
        phone: "Телефон",
      },
      amount: "Сума",
      viewInvoice: "Переглянути рахунок",
      orderedOn: "Замовлено",
    },
    noOrdersFound: "Замовлення не знайдено.",
  },
} as const;
const OrderCompleted = {
  en: {
    metadata: {
      title: "Order Completed",
      description: "Order Completed for the customer",
      keywords: "customer, order completed, customer order completed",
    },
    title: "🎉 Thank You! Your Order is Completed!",
    message:
      "Thank you for your purchase. Your order has been successfully placed.",
    summery: {
      orderId: "Order ID",
      orderDate: "Order Date",
      totalAmount: "Total Amount",
      Items: {
        title: "Order Items",
        name: "Name",
        quantity: "Quantity",
        discountApplied: "Discount Applied",
        discountExpires: "Discount Expires",
        price: "Price",
        finalPrice: "Final Price",
      },
    },
    button: { orderTracking: "Track Order", backToHome: "Back to Home" },
  },
  uk: {
    metadata: {
      title: "Замовлення виконано",
      description: "Замовлення виконано для клієнта",
      keywords: "клієнт, замовлення виконано, замовлення виконано клієнта",
    },
    title: "🎉 Дякуємо! Ваше замовлення виконано!",
    message: "Дякуємо за покупку. Ваше замовлення успішно виконано.",
    summery: {
      orderId: "ID замовлення",
      orderDate: "Дата замовлення",
      totalAmount: "Загальна сума",
      Items: {
        title: "Товари замовлення",
        name: "Назва",
        quantity: "Кількість",
        discountApplied: "Застосована знижка",
        discountExpires: "Знижка закінчується",
        price: "Ціна",
        finalPrice: "Кінцева ціна",
      },
    },
    button: {
      orderTracking: "Відстежити замовлення",
      backToHome: "На головну",
    },
  },
} as const;
export const accountOrdersTranslate = {
  en: {
    metadata: {
      title: "Order History",
      description: "Order History for the customer",
      keywords: "customer, order history, customer order history",
    },
    title: "Track Your Order",
    noOrdersFound: "No Orders Found",
    orderTracking: OrderTracking.en,
    orderCase: OrderCase.en,
    orderCancellation: OrderCancellation.en,
    orderHistory: OrderHistory.en,
    orderCompleted: OrderCompleted.en,
  },
  uk: {
    metadata: {
      title: "Історія замовлень",
      description: "Історія замовлень для клієнта",
      keywords: "клієнт, історія замовлень, історія замовлень клієнта",
    },
    title: "Відстежте ваше замовлення",
    noOrdersFound: "Замовлення не знайдено",
    orderTracking: OrderTracking.uk,
    orderCase: OrderCase.uk,
    orderCancellation: OrderCancellation.uk,
    orderHistory: OrderHistory.uk,
    orderCompleted: OrderCompleted.uk,
  },
} as const;

type ShippingInfoType = {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  country: string;
};
type ItemsType = {
  _id: string;
  name: string;
  quantity: number;
  price: number;
  discount: number;
  finalPrice: number;
  discountExpire: Date;
};
export type OrdersType = {
  _id: string;
  user: string;

  shippingInfo: ShippingInfoType;
  items: ItemsType[];

  status: string;
  invoiceId: string;
  invoiceLink: string;
  totalPrice: number;
  createdAt: Date;
};
