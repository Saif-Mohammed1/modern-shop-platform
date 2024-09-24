export const addAddress = {
  en: {
    title: "Add a New Address (Only in Ukraine)",
    form: {
      street: {
        label: "Street",
        placeholder: "Enter street",
      },
      city: {
        label: "City",
        placeholder: "Enter city",
        option: {
          select: "Select an Option",
        },
      },
      state: {
        label: "State",
        placeholder: "Enter state",
      },
      postalCode: {
        label: "Postal Code",
        placeholder: "Enter postal code",
      },
      phone: {
        label: "Phone Number",
        placeholder: "Enter phone number",
      },
      country: {
        label: "Country",
        placeholder: "Enter Country Name",
      },
    },
    function: {
      handleSubmit: {
        loading: "Adding address...",
        success: "Address added successfully",
        canceled: "Add address canceled",
      },
    },
  },
  uk: {
    title: "Додати нову адресу (Тільки в Україні)",
    form: {
      street: {
        label: "Вулиця",
        placeholder: "Введіть вулицю",
      },
      city: {
        label: "Місто",
        placeholder: "Введіть місто",
        option: {
          select: "Виберіть опцію",
        },
      },
      state: {
        label: "Штат",
        placeholder: "Введіть штат",
      },
      postalCode: {
        label: "Поштовий індекс",
        placeholder: "Введіть поштовий індекс",
      },
      phone: {
        label: "Номер телефону",
        placeholder: "Введіть номер телефону",
      },
      country: {
        label: "Країна",
        placeholder: "Введіть назву країни",
      },
    },
    function: {
      handleSubmit: {
        loading: "Додавання адреси...",
        success: "Адреса успішно додана",
        canceled: "Додавання адреси скасовано",
      },
    },
  },
} as const;
const layout = {
  en: {
    metadata: {
      title: "Account layout",
      description: "Account for the customer",
      keywords: "customer, account, customer account",
    },
    navBar: {
      title: "Customer Account",
      options: {
        title: "Select an Option",
        accountDashboard: "Account Dashboard",
        accountSettings: "Account Settings",
        myWishlist: "My Wishlist",
        addressBook: "Address Book",
        myProductReviews: "My Product Reviews",
        myOrders: "My Orders",
        myTickets: "My Tickets",
      },
    },
  },
  uk: {
    metadata: {
      title: "Макет облікового запису",
      description: "Обліковий запис для клієнта",
      keywords: "клієнт, обліковий запис, обліковий запис клієнта",
    },
    navBar: {
      title: "Обліковий запис клієнта",
      options: {
        title: "Виберіть опцію",
        accountDashboard: "Панель облікового запису",
        accountSettings: "Налаштування облікового запису",
        myWishlist: "Мій список бажань",
        addressBook: "Адресна книга",
        myProductReviews: "Мої відгуки про продукт",
        myOrders: "Мої замовлення",
        myTickets: "Мої квитки",
      },
    },
  },
} as const;

export const addressTranslate = {
  en: {
    metadata: {
      title: "Address Page",
      description: "This page displays the address book for the customer.",
      keywords: "customer, address, customer address",
    },
    title: { main: "My Address Book", subTitle: "Saved Addresses" },
    function: {
      handleAddAddress: {
        cityMustBeInUkraine: "City must be in Ukraine",
        pleaseFillAllFields: "Please fill all fields",
        loading: "Adding Address...",
        success: "Address Added Successfully!",
      },
      handleDeleteAddress: {
        loading: "Deleting Address...",
        success: "Address Deleted Successfully!",
        error: "Error Deleting Address",
      },
      handleSaveEdit: {
        loading: "Updating Address...",
        success: "Address Updated Successfully!",
      },
    },
    addAddress: addAddress.en,
    button: {
      addNewAddress: "Add New Address",
      cancel: "Cancel",
      saveAddress: "Save Address",
      save: "Save",
      edit: "Edit",
      delete: "Delete",
    },
    error: {
      global: "Something went wrong",
      emptyField: "Please fill all fields",
    },
    layout: layout.en,
  },
  uk: {
    metadata: {
      title: "Сторінка адреси",
      description: "Ця сторінка відображає адресну книгу для клієнта.",
      keywords: "клієнт, адреса, адреса клієнта",
    },
    title: { main: "Моя адресна книга", subTitle: "Збережені адреси" },
    function: {
      handleAddAddress: {
        cityMustBeInUkraine: "Місто повинно бути в Україні",
        pleaseFillAllFields: "Будь ласка, заповніть всі поля",
        loading: "Додавання адреси...",
        success: "Адреса успішно додана!",
      },
      handleDeleteAddress: {
        loading: "Видалення адреси...",
        success: "Адреса успішно видалена!",
        error: "Помилка видалення адреси",
      },
      handleSaveEdit: {
        loading: "Оновлення адреси...",
        success: "Адреса успішно оновлена!",
      },
    },
    addAddress: addAddress.uk,
    button: {
      addNewAddress: "Додати нову адресу",
      cancel: "Скасувати",
      saveAddress: "Зберегти адресу",
      save: "Зберегти",
      edit: "Редагувати",
      delete: "Видалити",
    },
    error: {
      global: "Щось пішло не так",
      emptyField: "Будь ласка, заповніть всі поля",
    },
    layout: layout.uk,
  },
} as const;

export type AddressType = {
  _id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  country: string;
};
