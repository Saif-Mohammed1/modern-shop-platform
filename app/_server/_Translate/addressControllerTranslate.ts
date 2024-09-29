export const addressControllerTranslate = {
  en: {
    model: {
      schema: {
        street: {
          required: "street must be required",
        },
        city: {
          required: "city must be required",
        },
        state: {
          required: "state must be required",
        },
        postalCode: {
          required: "postalCode must be required",
        },
        phone: {
          required: "phone must be required",
        },
        phoneValidation: (value: string) =>
          `${value} is not a valid Ukrainian phone number!`,
        country: {
          required: "country must be required",
        },
        user: {
          required: "Address must belong to a user.",
        },
      },
    },
    errors: { notFound: "No address found" },
  },
  uk: {
    model: {
      schema: {
        street: {
          required: "вулиця повинна бути обов'язковою",
        },
        city: {
          required: "місто повинно бути обов'язковим",
        },
        state: {
          required: "область повинна бути обов'язковою",
        },
        postalCode: {
          required: "поштовий індекс повинен бути обов'язковим",
        },
        phone: {
          required: "телефон пов инен бути обов'язковим",
        },
        phoneValidation: (value: string) =>
          `${value} не є дійсним українським номером телефону!`,
        country: {
          required: "країна повинна бути обов'язковою",
        },
        user: {
          required: "Адреса повинна належати користувачеві",
        },
      },
    },
    errors: { notFound: "Адресу не знайдено" },
  },
} as const;
