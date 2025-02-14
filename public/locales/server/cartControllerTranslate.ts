export const cartControllerTranslate = {
  en: {
    model: {
      schema: {
        user: {
          required: "Cart must belong to a user.",
        },
        product: {
          required: "Cart must belong to a product.",
        },
      },
    },
    controllers: {
      addToCart: {
        notEnoughStock: "Not enough stock available",
        QuantityNotInteger: "Quantity must be an integer",
      },
    },
    errors: {
      noDocumentsFound: "No documents found ",
      noDocumentsFoundWithId: "No documents found with that id",
      productNotFound: "Product not found",
    },
  },

  uk: {
    model: {
      schema: {
        user: {
          required: "Кошик повинен належати користувачеві.",
        },
        product: {
          required: "Кошик повинен належати продукту.",
        },
      },
    },
    controllers: {
      addToCart: {
        notEnoughStock: "Недостатньо товару на складі",
        QuantityNotInteger: "Кількість повинна бути цілим числом",
      },
    },
    errors: {
      noDocumentsFound: "Документи не знайдені ",
      noDocumentsFoundWithId: "Документи не знайдені за цим ідентифікатором",
      productNotFound: "Продукт не знайдено",
    },
  },
} as const;
