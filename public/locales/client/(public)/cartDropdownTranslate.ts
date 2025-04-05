export const cartDropdownTranslate = {
  en: {
    functions: {
      handleIncrease: {
        addingToCart: 'Adding to cart...',
        success: 'Product Increase successfully',
        error: 'Failed to add from cart',
      },
      handleDecrease: {
        removingFromCart: 'Removing from cart...',
        success: 'Removed from cart',
        error: 'Failed to remove from cart',
      },
      handelClearItem: {
        clearingProduct: 'Clearing Product from cart...',
        success: 'product cleared successfully',
        error: 'Failed to clear product from cart',
      },
      handelOnCheckout: {
        noProduct: 'You need at least one product in the cart to proceed to checkout',
        noUser: 'You need to be login to proceed to checkout',
      },
      quantityUpdate: {notEnoughStock: 'Not enough stock'},
    },
    errors: {
      global: 'an expected error happen please try again later',
    },
    content: {
      emptyCart: 'Your cart is empty.',
      proceedToCheckout: 'Proceed to Checkout',
    },
  },
  uk: {
    functions: {
      handleIncrease: {
        addingToCart: 'Додавання до кошика...',
        success: 'Продукт успішно збільшено',
        error: 'Не вдалося додати з кошика',
      },
      handleDecrease: {
        removingFromCart: 'Видалення з кошика...',
        success: 'Видалено з кошика',
        error: 'Не вдалося видалити з кошика',
      },
      handelClearItem: {
        clearingProduct: 'Очищення продукту з кошика...',
        success: 'продукт успішно очищено',
        error: 'Не вдалося очистити продукт з кошика',
      },
      handelOnCheckout: {
        noProduct:
          'Вам потрібно мати принаймні один продукт у кошику, щоб перейти до оформлення замовлення',
        noUser: 'Вам потрібно увійти, щоб перейти до оформлення замовлення',
      },
      quantityUpdate: {notEnoughStock: 'Недостатньо запасів'},
    },
    errors: {
      global: 'очікувана помилка, будь ласка, спробуйте ще раз пізніше',
    },
    content: {
      emptyCart: 'Ваш кошик порожній.',
      proceedToCheckout: 'Перейти до оформлення замовлення',
    },
  },
} as const;
