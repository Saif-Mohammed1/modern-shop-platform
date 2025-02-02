import { UserAuthType } from "@/app/_types/users";

const addProduct = {
  en: {
    metadata: {
      title: "Add Product",
      description: "Add product for the admin",
      keywords: "admin, add product, admin add product",
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
          discountExpire: "Discount Expiry",
        },
        placeholders: {
          price: "Enter price",
          discount: "Enter discount",
          discountExpire: "Enter discount expiry",
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
      },
      productSubmit: {
        title: "Confirm and Submit",
        productName: "Product Name",
        category: "Category",
        price: "Price",
        stock: "Stock",
        loading: "Adding product...",
        success: "Product added successfully",
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
      title: "Додати продукт",
      description: "Додати продукт для адміністратора",
      keywords: "адміністратор, додати продукт, адміністратор додати продукт",
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
          discountExpire: "Термін дії знижки",
        },
        placeholders: {
          price: "Введіть ціну",
          discount: "Введіть знижку",
          discountExpire: "Введіть термін дії знижки",
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
      },

      productSubmit: {
        title: "Підтвердити та надіслати",
        productName: "Назва продукту",
        category: "Категорія",
        price: "Ціна",
        stock: "Запас",
        loading: "Додавання продукту...",
        success: "Продукт успішно додано",
      },
      button: {
        previous: "Назад",
        next: "Далі",
        submit: "Надіслати",
      },
    },
  },
};
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
          discountExpire: "Discount Expiry",
        },
        placeholders: {
          price: "Enter price",
          discount: "Enter discount",
          discountExpire: "Enter discount expiry",
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
          discountExpire: "Термін дії знижки",
        },
        placeholders: {
          price: "Введіть ціну",
          discount: "Введіть знижку",
          discountExpire: "Введіть термін дії знижки",
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
};
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
      title: "Manage Products",
      function: {
        handleDelete: {
          loading: "Deleting product...",
          success: "Product deleted successfully",
        },
      },
      filter: {
        input: {
          search: "Search....",
        },
        select: {
          all: "All",
          topRated: "Top Rated",
          lowestRated: "Lowest Rated",
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
      },
      //   addProduct: {
      //     metadata: {
      //       title: "Add Product",
      //       description: "Add product for the admin",
      //       keywords: "admin, add product, admin add product",
      //     },
      //     form: {
      //       productDetails: {
      //         title: "Product Details",
      //         labels: {
      //           name: "Product Name",
      //           category: "Category",
      //           description: "Description",
      //         },
      //         placeholders: {
      //           name: "Enter product name",
      //           category: "Enter category",
      //           description: "Enter product description",
      //         },
      //       },
      //       productPricing: {
      //         title: "Pricing",
      //         labels: {
      //           price: "Price",
      //           discount: "Discount",
      //           discountExpire: "Discount Expiry",
      //         },
      //         placeholders: {
      //           price: "Enter price",
      //           discount: "Enter discount",
      //           discountExpire: "Enter discount expiry",
      //         },
      //       },
      //       inventoryDetails: {
      //         title: "Inventory",
      //         labels: {
      //           stock: "Stock",
      //         },
      //         placeholders: {
      //           stock: "Enter stock quantity",
      //         },
      //       },
      //       productImages: {
      //         title: "Upload Images",

      //         description: "Drag & drop files here, or click to select files",
      //       },
      //       productSubmit: {
      //         title: "Confirm and Submit",
      //         productName: "Product Name",
      //         category: "Category",
      //         price: "Price",
      //         stock: "Stock",
      //         loading: "Adding product...",
      //         success: "Product added successfully",
      //       },
      //       error: "An unexpected error occurred",
      //       button: {
      //         previous: "Previous",
      //         next: "Next",
      //         submit: "Submit",
      //       },
      //     },
      //   },
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
      title: "Управління продуктами",
      function: {
        handleDelete: {
          loading: "Видалення продукту...",
          success: "Продукт видалено",
        },
      },

      filter: {
        input: {
          search: "Пошук....",
        },
        select: {
          all: "Всі",
          topRated: "Найвищий рейтинг",
          lowestRated: "Найнижчий рейтинг",
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
      },
      //   addProduct: {
      //     metadata: {
      //       title: "Додати продукт",
      //       description: "Додати продукт для адміністратора",
      //       keywords:
      //         "адміністратор, додати продукт, адміністратор додати продукт",
      //     },
      //     form: {
      //       productDetails: {
      //         title: "Деталі продукту",
      //         labels: {
      //           name: "Назва продукту",
      //           category: "Категорія",
      //           description: "Опис",
      //         },
      //         placeholders: {
      //           name: "Введіть назву продукту",
      //           category: "Введіть категорію",
      //           description: "Введіть опис продукту",
      //         },
      //       },
      //       productPricing: {
      //         title: "Ціноутворення",
      //         labels: {
      //           price: "Ціна",
      //           discount: "Знижка",
      //           discountExpire: "Термін дії знижки",
      //         },
      //         placeholders: {
      //           price: "Введіть ціну",
      //           discount: "Введіть знижку",
      //           discountExpire: "Введіть термін дії знижки",
      //         },
      //       },
      //       inventoryDetails: {
      //         title: "Запаси",
      //         labels: {
      //           stock: "Запас",
      //         },
      //         placeholders: {
      //           stock: "Введіть кількість запасу",
      //         },
      //       },
      //       productImages: {
      //         title: "Завантажити зображення",
      //         description:
      //           "Перетягніть файли сюди або клацніть, щоб вибрати файли",
      //       },

      //       productSubmit: {
      //         title: "Підтвердити та надіслати",
      //         productName: "Назва продукту",
      //         category: "Категорія",
      //         price: "Ціна",
      //         stock: "Запас",
      //         loading: "Додавання продукту...",
      //         success: "Продукт успішно додано",
      //       },
      //       button: {
      //         previous: "Назад",
      //         next: "Далі",
      //         submit: "Надіслати",
      //       },
      //     },
      //   },
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

export type ProductsSearchParams = {
  category?: string;
  name?: string;
  sort?: string;
  fields?: string;
  page?: string;
  limit?: string;
  rating?: string;
  min?: string;
  max?: string;
};

export type Event = React.ChangeEvent<HTMLInputElement | HTMLSelectElement>;

type OldImage = {
  public_id: string;
  link: string;
};
// type UserAuthType = {
//   name: string;
//   _id: string;
// };
export type ProductType = {
  name: string;
  category: string;
  price: number;
  discount: number;
  discountExpire: Date | undefined;
  images: OldImage[] | [];
  user: Partial<UserAuthType>;
  description: string;
  stock: number;
  _id: string;
  ratingsAverage: number;
  ratingsQuantity: number;
  createdAt: string;
};
