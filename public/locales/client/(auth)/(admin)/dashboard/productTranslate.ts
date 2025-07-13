const addProduct = {
  en: {
    metadata: {
      title: "Add Product",
      description: "Add product for the admin",
      keywords: "admin, add product, admin add product",
    },
    progress: "Add Product Progress",
    form: {
      productDetails: {
        title: "Product Details",
        labels: {
          name: "Product Name",
          category: "Category",
          description: "Description",
          sku: "SKU",
        },
        placeholders: {
          name: "Enter product name",
          category: "Enter category",
          description: "Detailed product description",
          sku: "Unique product code",
        },
      },
      productPricing: {
        title: "Pricing",
        labels: {
          price: "Price",
          discount: "Discount",
          discount_expire: "Discount Expiry",
        },
        placeholders: {
          price: "Enter price",
          discount: "Enter discount",
          discount_expire: "Enter discount expiry",
        },
      },
      productShipping: {
        title: "Shipping Information",
        labels: {
          dimensions: "Dimensions",
          weight: "Weight (kg)",
          length: "Length (cm)",
          width: "Width (cm)",
          height: "Height (cm)",
          kg: "kg",
        },
        placeholders: {
          weight: "Enter weight in kg",
          length: "Enter length in cm",
          width: "Enter width in cm",
          height: "Enter height in cm",
        },
      },
      inventoryDetails: {
        title: "Inventory",
        labels: {
          stock: "Stock",
          reserved: "Reserved",
          sold: "Initial Sold",
        },
        placeholders: {
          required: "Field is required",
          stock: "Enter stock quantity",
        },
      },
      productImages: {
        title: "Upload Images",

        description: "Drag & drop files here, or click to select files",
        max: "Max 10 images, 5MB each",
        existingImage: "Existing Images",
      },
      productReview: {
        name: "Name",
        category: "Category",
        sku: "SKU",
        description: "Description",
        price: "Price",
        discount: "Discount",
        final_price: "Final Price",
        discount_expire: "Discount Expiry",
        weight: "Weight",
        dimensions: "Dimensions",
        stock: "Stock",
        reserved: "Reserved",
        sold: "Sold",
        DiscountExpiry: "Discount Expiry",
      },
      productSubmit: {
        ProductImages: "Product Images",
        title: "Confirm and Submit",
        productName: "Product Name",
        category: "Category",
        price: "Price",
        stock: "Stock",
        loading: "Adding product...",
        success: "Product added successfully",
        reviewText: "Please review the details before submitting",
      },
      error: "An unexpected error occurred",
      errors: {
        discount: "Discount must be less than price",
        discount_expire: "Expiry date must be in the future",
        price: "Valid price required",
      },
      button: {
        saveDraft: "Save Draft",
        previous: "Previous",
        next: "Next",
        submit: "Submit",
      },
    },
  },
  uk: {
    metadata: {
      title: "Додати продукт",
      description: "Додати продукт для адміністратора",
      keywords: "адміністратор, додати продукт, адміністратор додати продукт",
    },
    progress: "Прогрес додавання продукту",
    form: {
      productDetails: {
        title: "Деталі продукту",
        labels: {
          name: "Назва продукту",
          category: "Категорія",
          description: "Опис",
          sku: "SKU",
        },
        placeholders: {
          name: "Введіть назву продукту",
          category: "Введіть категорію",
          description: "Детальний опис продукту",
          sku: "Унікальний код продукту",
        },
      },
      productPricing: {
        title: "Ціноутворення",
        labels: {
          price: "Ціна",
          discount: "Знижка",
          discount_expire: "Термін дії знижки",
        },
        placeholders: {
          price: "Введіть ціну",
          discount: "Введіть знижку",
          discount_expire: "Введіть термін дії знижки",
        },
      },
      productShipping: {
        title: "Інформація про доставку",
        labels: {
          dimensions: "Розміри",
          weight: "Вага (кг)",
          length: "Довжина (см)",
          width: "Ширина (см)",
          height: "Висота (см)",
          kg: "кг",
        },
        placeholders: {
          weight: "Введіть вагу в кг",
          length: "Введіть довжину в см",
          width: "Введіть ширину в см",
          height: "Введіть висоту в см",
        },
      },
      inventoryDetails: {
        title: "Запаси",
        labels: {
          stock: "Запас",
          reserved: "Зарезервовано",
          sold: "Початково продано",
        },
        placeholders: {
          required: "Поле обов'язкове",
          stock: "Введіть кількість запасу",
        },
      },
      productImages: {
        title: "Завантажити зображення",
        description: "Перетягніть файли сюди або клацніть, щоб вибрати файли",

        max: "Максимум 10 зображень, 5 МБ кожне",
        existingImage: "Існуючі зображення",
      },
      productReview: {
        name: "Назва",
        category: "Категорія",
        sku: "SKU",
        description: "Опис",
        price: "Ціна",
        discount: "Знижка",
        final_price: "Кінцева ціна",
        discount_expire: "Термін дії знижки",
        weight: "Вага",
        dimensions: "Розміри",
        stock: "Запас",
        reserved: "Зарезервовано",
        sold: "Продано",
        DiscountExpiry: "Термін дії знижки",
      },

      productSubmit: {
        ProductImages: "Зображення продукту",

        title: "Підтвердити та надіслати",
        productName: "Назва продукту",
        category: "Категорія",
        price: "Ціна",
        stock: "Запас",
        loading: "Додавання продукту...",
        success: "Продукт успішно додано",
        reviewText: "Будь ласка, перегляньте деталі перед надсиланням",
      },
      error: "Сталася непередбачувана помилка",
      errors: {
        discount: "Знижка повинна бути менше ціни",
        discount_expire: "Дата закінчення має бути у майбутньому",
        price: "Потрібна дійсна ціна",
      },
      button: {
        saveDraft: "Зберегти чернетку",
        previous: "Назад",
        next: "Далі",
        submit: "Надіслати",
      },
    },
  },
} as const;
const editProduct = {
  en: {
    metadata: {
      title: "Edit Product",
      description: "Edit product for the admin",
      keywords: "admin, edit product, admin edit product",
    },
    removeImage: {
      loading: "Removing image...",
      success: "Image removed successfully",
    },
    form: {
      productDetails: {
        title: "Product Details",
        labels: {
          name: "Product Name",
          category: "Category",
          description: "Description",
        },
        placeholders: {
          name: "Enter product name",
          category: "Enter category",
          description: "Enter product description",
        },
      },
      productPricing: {
        title: "Pricing",
        labels: {
          price: "Price",
          discount: "Discount",
          discount_expire: "Discount Expiry",
        },
        placeholders: {
          price: "Enter price",
          discount: "Enter discount",
          discount_expire: "Enter discount expiry",
        },
      },
      inventoryDetails: {
        title: "Inventory",
        labels: {
          stock: "Stock",
        },
        placeholders: {
          stock: "Enter stock quantity",
        },
      },
      productImages: {
        title: "Upload Images",

        description: "Drag & drop files here, or click to select files",
        existingImage: "Existing Images",
      },
      productSubmit: {
        title: "Confirm and Submit",
        productName: "Product Name",
        category: "Category",
        price: "Price",
        stock: "Stock",
        loading: "Updating Product...",
        success: "Product Updated Successfully",
      },
      error: "An unexpected error occurred",
      button: {
        previous: "Previous",
        next: "Next",
        submit: "Submit",
      },
    },
  },
  uk: {
    metadata: {
      title: "Редагувати продукт",
      description: "Редагувати продукт для адміністратора",
      keywords:
        "адміністратор, редагувати продукт, адміністратор редагувати продукт",
    },

    removeImage: {
      loading: "Видалення зображення...",
      success: "Зображення успішно видалено",
    },

    form: {
      productDetails: {
        title: "Деталі продукту",
        labels: {
          name: "Назва продукту",
          category: "Категорія",
          description: "Опис",
        },
        placeholders: {
          name: "Введіть назву продукту",
          category: "Введіть категорію",
          description: "Введіть опис продукту",
        },
      },
      productPricing: {
        title: "Ціноутворення",
        labels: {
          price: "Ціна",
          discount: "Знижка",
          discount_expire: "Термін дії знижки",
        },
        placeholders: {
          price: "Введіть ціну",
          discount: "Введіть знижку",
          discount_expire: "Введіть термін дії знижки",
        },
      },
      inventoryDetails: {
        title: "Запаси",
        labels: {
          stock: "Запас",
        },
        placeholders: {
          stock: "Введіть кількість запасу",
        },
      },
      productImages: {
        title: "Завантажити зображення",
        description: "Перетягніть файли сюди або клацніть, щоб вибрати файли",

        existingImage: "Існуючі зображення",
      },

      productSubmit: {
        title: "Підтвердити та надіслати",
        productName: "Назва продукту",
        category: "Категорія",
        price: "Ціна",
        stock: "Запас",
        loading: "Оновлення продукту...",
        success: "Продукт успішно оновлено",
      },
      button: {
        previous: "Назад",
        next: "Далі",
        submit: "Надіслати",
      },
    },
  },
} as const;
export const productsTranslate = {
  metadata: {
    en: {
      title: "Products",
      description: "Products management for the admin",
      keywords: "admin, products, admin products",
    },
    uk: {
      title: "Продукти",
      description: "Управління продуктами для адміністратора",
      keywords: "адміністратор, продукти, адміністраторські продукти",
    },
  },
  products: {
    en: {
      editMode: "Editing existing product - changes will be versioned",
      draftSaved: "Draft saved",
      title: "Manage Products",
      function: {
        handleDelete: {
          loading: "Deleting product...",
          success: "Product deleted successfully",
        },
        toggleProductStatus: {
          loading: "Updating product status...",
          success: "Product status updated successfully",
        },
      },
      filter: {
        title: "Filter By Category",
        input: {
          search: "Search....",
        },
        select: {
          title: "Sort by",
          all: "All",
          topRated: "Top Rated",
          lowestRated: "Lowest Rated",
          newest: "Newest",
          oldest: "Oldest",

          lowestPrice: "Lowest Price",
          highestPrice: "Highest Price",
        },
        addProduct: " Add Product",
      },
      details: {
        category: "Category",
        price: "Price",
        discount: "Discount",
        discountExpiry: "Discount Expiry",
        stock: "Stock",
        rating: "Rating",
        edit: "Edit",
        delete: "Delete",
        daysleft: "Days Left",
        expired: "Expired",
        archived: {
          title: "Archived",
          yes: "Yes",
          no: "No",
        },
      },

      addProduct: addProduct.en,
      editProduct: editProduct.en,
      error: {
        general: "Something went wrong",
        fields: "Please fill all fields",
        unknownStep: "Unknown step",
        noChanges: "No changes were made",
        message:
          "Unfortunately, an error occurred. Please go back to previous step or contact support.",
      },
    },
    uk: {
      editMode: "Редагування існуючого продукту - зміни будуть збережені",
      draftSaved: "Чернетку збережено",
      title: "Управління продуктами",
      function: {
        handleDelete: {
          loading: "Видалення продукту...",
          success: "Продукт видалено",
        },
        toggleProductStatus: {
          loading: "Оновлення статусу продукту...",
          success: "Статус продукту успішно оновлено",
        },
      },

      filter: {
        title: "Фільтрувати за категорією",
        input: {
          search: "Пошук....",
        },
        select: {
          title: "Сортувати за",
          all: "Всі",
          topRated: "Найвищий рейтинг",
          lowestRated: "Найнижчий рейтинг",
          newest: "Найновіший",
          oldest: "Найстарший",

          lowestPrice: "Найнижча ціна",
          highestPrice: "Найвища ціна",
        },
        addProduct: " Додати продукт",
      },
      details: {
        category: "Категорія",
        price: "Ціна",
        discount: "Знижка",
        discountExpiry: "Термін дії знижки",
        stock: "Запас",
        rating: "Рейтинг",
        edit: "Редагувати",
        delete: "Видалити",
        daysleft: "Днів залишилось",
        expired: "Закінчився",
        archived: {
          title: "Архівований",
          yes: "Так",
          no: "Ні",
        },
      },
      addProduct: addProduct.uk,
      editProduct: editProduct.uk,

      error: {
        general: "Щось пішло не так",
        fields: "Будь ласка, заповніть всі поля",

        unknownStep: "Невідомий крок",
        noChanges: "Зміни відсутні",
        message:
          "На жаль, сталася помилка. Будь ласка, поверніться на попередній крок або зверніться до служби підтримки.",
      },
    },
  },
} as const;
