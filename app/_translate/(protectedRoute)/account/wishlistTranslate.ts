export const accountWishlistTranslate = {
  en: {
    metadata: {
      title: "Wishlist",
      description: "Wishlist for the customer",
      keywords: "customer, wishlist, customer wishlist",
    },
    wishListContext: {
      loadWishlist: {
        loading: "Loading wishlist...",
        error: "Error loading wishlist",
        success: "Wishlist loaded successfully",
      },
    },
    WishListCard: {
      functions: {
        handleWishlistClick: {
          success: "Added to wishlist",
          error: "Failed to Handel to wishlist",
          removed: "Removed from wishlist",
        },
        isInWishlist: {
          remove: "Remove from Wishlist",
          add: "Add to Wishlist",
        },
      },
    },

    errors: {
      global: "Something went wrong please try again later",
    },
  },
  uk: {
    metadata: {
      title: "Список бажань",
      description: "Список бажань для клієнта",
      keywords: "клієнт, список бажань, список бажань клієнта",
    },
    wishListContext: {
      loadWishlist: {
        loading: "Завантаження списку бажань...",
        error: "Помилка завантаження списку бажань",
        success: "Список бажань успішно завантажено",
      },
    },
    WishListCard: {
      functions: {
        handleWishlistClick: {
          success: "Додано до списку бажань",
          error: "Не вдалося обробити список бажань",
          removed: "Видалено зі списку бажань",
        },
        isInWishlist: {
          remove: "Видалити зі списку бажань",
          add: "Додати до списку бажань",
        },
      },
    },
    errors: {
      global: "Щось пішло не так, спробуйте пізніше",
    },
  },
} as const;
