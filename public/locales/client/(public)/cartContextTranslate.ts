export const cartContextTranslate = {
  en: {
    cartContext: {
      loadCart: {
        loading: 'Loading cart...',
        error: 'Error loading cart',
        success: 'Cart loaded successfully',
      },
      mergeLocalCart: {
        success: 'Cart merged successfully',
        error: 'Failed to merge cart',
      },
    },
    functions: {
      addToCart: {
        success: 'Product added to cart',
        outOfStock: 'Product is out of stock',
        error: 'Failed to add product to cart',
      },
    },
    errors: {
      global: 'Something went wrong please try again later',
    },
  },
  uk: {
    cartContext: {
      loadCart: {
        loading: 'Завантаження кошика...',
        error: 'Помилка завантаження кошика',
        success: 'Кошик успішно завантажено',
      },
      mergeLocalCart: {
        success: "Кошик успішно об'єднано",
        error: "Не вдалося об'єднати кошик",
      },
    },
    functions: {
      addToCart: {
        success: 'Товар додано до кошика',
        outOfStock: 'Товар відсутній на складі',
        error: 'Не вдалося додати товар до кошика',
      },
    },
    errors: {
      global: 'Щось пішло не так, спробуйте пізніше',
    },
  },
} as const;
