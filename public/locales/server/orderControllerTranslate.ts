export const orderControllerTranslate = {
  en: {
    model: {
      schema: {
        user: {
          required: "Order must belong to a user.",
        },
        shipping_info: {
          street: {
            required: "Please add a street",
          },
          city: {
            required: "Please add a city",
          },
          state: {
            required: "Please add a state",
          },
          postal_code: {
            required: "Please add a postal_code",
          },
          phone: {
            required: "Please add a phone",
          },
          country: {
            required: "Please add a country",
          },
        },
        items: {
          _id: {
            required: "Please add a product id",
          },
          name: {
            required: "Please add a product name",
          },
          quantity: {
            required: "Please add a product quantity",
          },
          price: {
            required: "Please add a product price",
          },
          final_price: {
            required: "Please add a product final_price",
          },
        },
        status: {
          enum: "Invalid status",
        },
        invoice_id: {
          required: "Invoice ID field is required.",
        },
        invoice_link: {
          required: "Invoice Link field is required.",
        },
        totalPrice: {
          required: "totalPrice field is required.",
        },
      },
    },
    controllers: {
      createUserOrder: {
        notEnoughData: "You Need to provide  data",
      },
    },
    errors: {
      userNotFound: "user is invalid ",
      noDocFound: "No order found",
    },
  },
  uk: {
    model: {
      schema: {
        user: {
          required: "Замовлення повинно належати користувачеві.",
        },
        shipping_info: {
          street: {
            required: "Будь ласка, додайте вулицю",
          },
          city: {
            required: "Будь ласка, додайте місто",
          },
          state: {
            required: "Будь ласка, додайте штат",
          },
          postal_code: {
            required: "Будь ласка, додайте поштовий індекс",
          },
          phone: {
            required: "Будь ласка, додайте телефон",
          },
          country: {
            required: "Будь ласка, додайте країну",
          },
        },
        items: {
          _id: {
            required: "Будь ласка, додайте ідентифікатор продукту",
          },
          name: {
            required: "Будь ласка, додайте назву продукту",
          },
          quantity: {
            required: "Будь ласка, додайте кількість продукту",
          },
          price: {
            required: "Будь ласка, додайте ціну продукту",
          },
          final_price: {
            required: "Будь ласка, додайте кінцеву ціну продукту",
          },
        },
        status: {
          enum: "Недійсний статус",
        },
        invoice_id: {
          required: "Поле ідентифікатора рахунку обов'язкове.",
        },
        invoice_link: {
          required: "Поле посилання на рахунок обов'язкове.",
        },
        totalPrice: {
          required: "Поле загальної вартості обов'язкове.",
        },
      },
    },
    controllers: {
      createUserOrder: {
        notEnoughData: "Вам потрібно надати дані",
      },
    },
    errors: {
      userNotFound: "користувач недійсний",
      noDocFound: "Замовлення не знайдено",
    },
  },
} as const;
