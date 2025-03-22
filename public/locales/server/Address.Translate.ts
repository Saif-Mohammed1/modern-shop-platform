export const AddressTranslate = {
  en: {
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
      positive: "Postal code must be positive",
    },
    phone: {
      required: "Phone is required",
      invalid: "Invalid Ukrainian phone number it should be like +380xxxxxxxxx",
    },
    country: {
      required: "Country is required",
    },
    delete: {
      success: "Address deleted successfully",
    },
    error: {
      addressNotFound: "Address not found",
    },
  },
  uk: {
    street: {
      required: "Вулиця обов'язкова",
    },
    city: {
      required: "Місто обов'язкове",
    },
    state: {
      required: "Штат обов'язковий",
    },
    postalCode: {
      required: "Поштовий індекс обов'язковий",
      positive: "Поштовий індекс повинен бути позитивним",
    },
    phone: {
      required: "Телефон обов'язковий",
      invalid:
        "Недійсний український номер телефону, він повинен бути на кшталт +380xxxxxxxxx",
    },
    country: {
      required: "Країна обов'язкова",
    },
    delete: {
      success: "Адресу успішно видалено",
    },
    error: {
      addressNotFound: "Адресу не знайдено",
    },
  },
} as const;
