export const productControllerTranslate = {
  en: {
    model: {
      schema: {
        name: {
          required: "name must be required",
        },
        category: {
          required: "category must be required",
        },
        price: {
          min: "Price must be greater than 0",
          required: "price must be required",
        },
        discount: {
          required: "discount must be less than price",
        },
        discount_expire: {
          required: "discount_expire must be required",
        },
        images: {
          link: {
            required: "link must be required",
          },
          public_id: {
            required: "public_id  must be required",
          },
        },
        user: {
          required: "Product must belong to a user.",
        },
        description: {
          required: "Product must have a description.",
        },
        stock: {
          min: "Stock must be greater or equal to 0",
          required: "Product must have a stock.",
        },
        ratings_average: {
          min: "Rating must be above 1.0",
          max: "Rating must be below or equal 5.0",
        },
        ratings_quantity: {
          required: "ratings_quantity must be required",
        },
        created_at: {
          required: "created_at must be required",
        },
      },
    },
    functions: {
      validateBase64Image: {
        invalidImageFormat: "Invalid image format.",
        invalidImageType:
          "Invalid image type. Only JPEG, PNG, and GIF are allowed.",
        imageSizeExceeds: "Image size exceeds 2MB.",
      },
      updateProductActivity: {
        success: "Product updated successfully",
        error: "Error updating product",
      },
    },

    errors: {
      noProductHistory: "No product history found.",
      notFoundProduct: "Product not found.",
      notFoundProducts: "There are no products.",
      noProductFoundWithId: "No product found with that ID",
      HistoricalProductNotFound: "No historical product found.",
      requiredFields: "Please fill in all required fields.",
      noDocumentFoundWithId: "No document found with that ID",
      ImageDeletedSuccessfully: "Image deleted successfully",
    },
  },
  uk: {
    model: {
      schema: {
        name: {
          required: "Ім'я має бути обов'язковим",
        },
        category: {
          required: "Категорія має бути обов'язковою",
        },
        price: {
          min: "ціна має бути більше 0",
          required: "ціна має бути обов'язковою",
        },
        discount: {
          required: "знижка має бути менше, ніж ціна",
        },
        discount_expire: {
          required: "знижка закінчується має бути обов'язковою",
        },
        images: {
          link: {
            required: "посилання має бути обов'язковим",
          },
          public_id: {
            required: "public_id  має бути обов'язковим",
          },
        },
        user: {
          required: "Продукт повинен належати користувачеві.",
        },
        description: {
          required: "Продукт повинен мати опис.",
        },
        stock: {
          min: "Запас повинен бути більше або рівним 0",
          required: "Продукт повинен мати запас.",
        },
        ratings_average: {
          min: "Рейтинг повинен бути вище 1.0",
          max: "Рейтинг повинен бути нижче або рівним 5.0",
        },
        ratings_quantity: {
          required: "ratings_quantity має бути обов'язковим",
        },
        created_at: {
          required: "created_at має бути обов'язковим",
        },
      },
    },
    functions: {
      validateBase64Image: {
        invalidImageFormat: "Недійсний формат зображення.",
        invalidImageType:
          "Недійсний тип зображення. Дозволені лише JPEG, PNG та GIF.",
        imageSizeExceeds: "Розмір зображення перевищує 2 МБ.",
      },
      updateProductActivity: {
        success: "Продукт успішно оновлено",
        error: "Помилка оновлення продукту",
      },
    },

    errors: {
      noProductHistory: "Історія прод продуктом не знайдена.",
      notFoundProduct: "Продукт не знайдено.",
      notFoundProducts: "Продуктів немає.",
      noProductFoundWithId: "Продукт з таким ідентифікатором не знайдено",
      HistoricalProductNotFound: "Історичний продукт не знайдено.",
      requiredFields: "Будь ласка, заповніть всі обов'язкові поля.",
      noDocumentFoundWithId: "Документ з таким ідентифікатором не знайдено",
      ImageDeletedSuccessfully: "Зображення успішно видалено",
    },
  },
} as const;
