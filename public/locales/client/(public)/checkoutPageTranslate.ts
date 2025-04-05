export const checkoutPageTranslate = {
  en: {
    metadata: {
      title: 'Checkout',
      description: 'Checkout for the customer',
      keywords: 'customer, checkout, customer checkout',
    },
    functions: {
      handleAddNewAddress: {
        loading: 'Adding new address...',
        success: 'Address added successfully',
        canceled: 'Add address canceled',
      },
      handelCheckout: {
        loading: 'Processing your order...',
        success: 'redirecting to payment page',
        emptyCartMessage: 'You have no items in your cart,please add some items',
        selectAddress: 'Please select an address',
      },
    },
    title: 'Shipping Address',
    body: {
      select: {
        noAddress: 'No addresses available',
      },
      order: {
        summery: 'Order Summary',
        fee: 'fee',
        total: 'total',
      },
      cartItems: 'Cart Items',
    },
    button: {
      addNewAddress: 'Add New Address',
      checkout: 'Checkout',
      back: 'Back',
    },
    errors: {
      requiredField: 'Please fill all fields',
      global: 'Something went wrong. Please try again later',
    },
  },
  uk: {
    metadata: {
      title: 'Оформлення замовлення',
      description: 'Оформлення замовлення для клієнта',
      keywords: 'клієнт, оформлення, оформлення клієнта',
    },
    functions: {
      handleAddNewAddress: {
        loading: 'Додавання нової адреси...',
        success: 'Адреса успішно додана',
        canceled: 'Додавання адреси скасовано',
      },
      handelCheckout: {
        loading: 'Обробка вашого замовлення....',
        success: 'Перенаправлення на сторінку оплати',

        emptyCartMessage: 'У вас немає товарів у кошику, будь ласка, додайте товари',
        selectAddress: 'Будь ласка, виберіть адресу',
      },
    },
    title: 'Адреса доставки',
    body: {
      select: {
        noAddress: 'Адреси відсутні',
      },
      order: {
        summery: 'Загальна сума',
        fee: 'плата',
        total: 'всього',
      },
      cartItems: 'Товари в кошику',
    },
    button: {
      addNewAddress: 'Додати нову адресу',
      checkout: 'Оформити замовлення',
      back: 'Назад',
    },

    errors: {
      requiredField: 'Будь ласка, заповніть всі поля',
      global: 'Щось пішло не так. Будь ласка, спробуйте пізніше',
    },
  },
} as const;
