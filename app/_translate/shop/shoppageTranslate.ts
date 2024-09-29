export const shopPageTranslate = {
  en: {
    metadata: {
      title: "Shop - Product Details",
      description:
        "Explore the details of our wide range of products. Find the perfect item for your needs and make a purchase with confidence.",
      keywords: "Shop, Product Details, Product, Details",
    },
    functions: {
      handleAddToCart: {
        outOfStock:
          "This product is out of stock. Please check back later or contact support.",
        loading: "Adding to cart...",
        success: "Product added to cart.",
        failed: "Failed to add to cart",
      },

      toggleWishlist: {
        loadingAdding: "Adding to wishlist...",
        loadingRemoving: "Removing from wishlist...",
        success: "Product Added to wishlist",
        removed: "Product Removed from wishlist",
        failed: "Failed to add to wishlist",
      },
    },

    content: {
      expireOn: "Discount ends on",
      inStock: "In Stock",
      outOfStock: "Out of Stock",
      addToCart: "Add to Cart",
      description: "Description",
    },
    RelatedProducts: {
      off: " OFF",
      discountedPrice: "Discounted Price: ",
      title: "Related Products",
      message: "No related product exists",
    },
    button: {
      prev: "Previous",
      next: "Next",
    },
    errors: {
      noProductFound: "There is no Product Found",
    },
  },
  uk: {
    metadata: {
      title: "Магазин - Деталі продукту",
      description:
        "Досліджуйте деталі нашого широкого асортименту продуктів. Знайдіть ідеальний товар для своїх потреб і здійснюйте покупку з впевненістю.",
      keywords: "Магазин, Деталі продукту, Продукт, Деталі",
    },
    functions: {
      handleAddToCart: {
        outOfStock:
          "Цей продукт відсутній на складі. Будь ласка, перевірте пізніше або зв'яжіться з підтримкою.",
        loading: "Додається до кошика...",
        success: "Продукт додано до кошика.",
        failed: "Не вдалося додати до кошика",
      },

      toggleWishlist: {
        loadingAdding: "Додається до списку бажань...",
        loadingRemoving: "Видаляється зі списку бажань...",
        success: "Продукт додано до списку бажань",
        removed: "Продукт видалено зі списку бажань",
        failed: "Не вдалося додати до списку бажань",
      },
    },

    content: {
      expireOn: "Знижка закінчується",
      inStock: "В наявності",
      outOfStock: "Немає в наявності",
      addToCart: "Додати в кошик",
      description: "Опис",
    },
    RelatedProducts: {
      off: " ЗНИЖКА",
      discountedPrice: "Знижена ціна: ",
      title: "Схожі продукти",
      message: "Схожих продуктів не існує",
    },
    button: {
      prev: "Попередній",
      next: "Наступний",
    },
    errors: {
      noProductFound: "Продукт не знайдено",
    },
  },
} as const;
