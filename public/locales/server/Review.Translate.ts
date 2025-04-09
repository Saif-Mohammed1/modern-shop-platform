export const ReviewTranslate = {
  en: {
    controllers: {
      createReviews: {
        ratingLessThanOne: 'Rating cannot be less than 1',
        reviewTextRequired: 'Review text is required',
      },
      deleteReview: {
        success: 'Review deleted successfully',
      },
      checkReview: {
        needToBuyProductFirst: 'You need to buy the product first',
        needToWaitForOrderCompletion: 'You need to wait for order completion',
        oneReviewPerProduct: 'You have already reviewed this product',
      },
    },

    errors: {
      noDocumentsFound: 'No documents found',
    },
  },
  uk: {
    controllers: {
      createReviews: {
        ratingLessThanOne: 'Рейтинг не може бути менше 1',
        reviewTextRequired: "Текст відгуку обов'язковий",
      },
      deleteReview: {
        success: 'Відгук успішно видалено',
      },
      checkReview: {
        needToBuyProductFirst: 'Спочатку вам потрібно купити продукт',
        needToWaitForOrderCompletion: 'Вам потрібно зачекати завершення замовлення',
        oneReviewPerProduct: 'Ви вже залишили відгук на цей продукт',
      },
    },
    errors: {
      noDocumentsFound: 'Документи не знайдено',
    },
  },
};
