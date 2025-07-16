export const CartTranslate = {
  en: {
    dto: {
      quantity: {
        number: "Quantity should be a number",
        positive: "Quantity should be positive",
        int: "Quantity should be an integer",
        min: "Quantity should be at least 1",
      },
    },
    messages: {
      addToCart: "Product added to cart successfully",
      decreaseQuantity: "Product quantity decreased successfully",
      removeFromCart: "Product removed from cart successfully",
      clearCart: "Cart cleared successfully",
      mergeLocalCart: "Merged local cart with user cart",
    },
    errors: {
      productNotFound: "Product not found",
      insufficientStock: (name: string) =>
        `Insufficient stock for product ${name}`,
      noDocumentsFoundWithId: "No documents found with id",
    },
  },
  uk: {
    dto: {
      quantity: {
        number: "Кількість повинна бути числом",
        positive: "Кількість повинна бути додатньою",
        int: "Кількість повинна бути цілим числом",
        min: "Кількість повинна бути не менше 1",
      },
    },
    messages: {
      addToCart: "Товар успішно додано до кошика",
      decreaseQuantity: "Кількість товару успішно зменшено",
      removeFromCart: "Товар успішно видалено з кошика",
      clearCart: "Кошик успішно очищено",
      mergeLocalCart: "Локальний кошик об'єднано з кошиком користувача",
    },
    errors: {
      productNotFound: "Товар не знайдено",
      insufficientStock: (name: string) =>
        `Недостатньо товару на складі ${name}`,
      noDocumentsFoundWithId: "Документи з цим id не знайдено",
    },
  },
} as const;
