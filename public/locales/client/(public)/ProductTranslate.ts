const relatedProductTranslate = {
  en: {
    title: "Related Products",
    noRelatedProducts: "No related products found",
    off: "OFF",
    discountedPrice: "Discounted Price",
  },
  uk: {
    title: "Схожі продукти",
    noRelatedProducts: "Схожі продукти не знайдено",
    off: "-",
    discountedPrice: "Знижена ціна",
  },
} as const;
export const ProductTranslate = {
  en: {
    ProductVersionHistory: {
      fun: {
        handleRestore: {
          loading: "Restoring version...",
          success: "Version restored successfully.",
          error: "Failed to restore version. Please try again later.",
        },
      },
    },
    relatedProduct: relatedProductTranslate.en,
    Tables: {
      head: "Version ID",
      date: "Date",
      productName: "Product Name",
      price: "Price",
      discount: "Discount",
      stock: "Stock",
      description: "Description",
      actions: "Actions",
      noValue: "no value",
      noProduct: "No product found",
      noVersion: "No version found",
    },
    Button: {
      restore: "Restore",
    },
    confirmModal: {
      title:
        "Are you sure you want to restore this version? Current data will be replaced.",
    },
  },
  uk: {
    ProductVersionHistory: {
      fun: {
        handleRestore: {
          loading: "Відновлення версії...",
          success: "Версія успішно відновлена.",
          error:
            "Не вдалося відновити версію. Будь ласка, спробуйте ще раз пізніше.",
        },
      },
    },
    Tables: {
      head: "ID версії",
      date: "Дата",
      productName: "Назва продукту",
      price: "Ціна",
      discount: "Знижка",
      stock: "Запас",
      description: "Опис",
      actions: "Дії",
      noValue: "немає значення",
      noProduct: "Товар не знайдено",
      noVersion: "Версія не знайдена",
    },
    Button: {
      restore: "Відновити",
    },
    confirmModal: {
      title:
        "Ви впевнені, що хочете відновити цю версію? Поточні дані будуть замінені.",
    },
    relatedProduct: relatedProductTranslate.uk,
  },
} as const;
