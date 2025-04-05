export const reviewControllerTranslate = {
  en: {
    model: {
      schema: {
        user: {
          required: 'Review must belong to a user.',
        },
        product: {
          required: 'Review must belong to a product.',
        },
        rating: {
          min: 'Rating must be at least 1.',
          max: 'Rating cannot be more than 5.',
          required: 'Rating is required.',
        },
        comment: {
          minlength: 'Review must be at least 4 characters long.',
          maxlength: 'Review cannot exceed 200 characters.',
          required: 'comment is required.',
        },
        createdAt: {
          required: 'createdAt must be required',
        },
      },
    },
    controllers: {
      createReviews: {
        reviewTextRequired: 'comment is required',
        minReviewText: 'Review must be at least 4 characters long.',
        maxReviewText: 'Review cannot exceed 200 characters.',
        ratingLessThanOne: `Rating cannot be less than 1. Current rate is:`,
        maxRating: 'Rating cannot be more than 5.',
        ratingRequired: 'Rating is required',
      },
      checkReview: {
        needToBuyProductFirst: 'You need to buy that product first to leave a review',
        needToWaitForOrderCompletion: `Thank you for your interest in leaving a review! Please note that you need to wait until  your order complete before you can leave a review. Once your order is completed, you'll be able to share your feedback with us. We appreciate your patience and understanding`,
        oneReviewPerProduct:
          'You have already submitted a review for this product. Only one review per product is allowed.',
      },
    },
    errors: {
      noDocumentsFound: 'No documents found ',
      noDocumentsFoundWithId: 'No documents found with that id',
      unauthorized: {
        update: 'Unauthorized to update this review',
        delete: 'Unauthorized to delete this review',
      },
    },
  },

  uk: {
    model: {
      schema: {
        user: {
          required: 'Відгук повинен належати користувачу.',
        },
        product: {
          required: 'Відгук повинен належати продукту.',
        },
        rating: {
          min: 'Рейтинг повинен бути не менше 1.',
          max: 'Рейтинг не може бути більше 5.',
          required: "Рейтинг обов'язковий.",
        },
        comment: {
          minlength: 'Відгук повинен бути не менше 4 символів.',
          maxlength: 'Відгук не може перевищувати 200 символів.',
          required: "comment обов'язковий.",
        },
        createdAt: {
          required: "createdAt обов'язковий",
        },
      },
    },
    controllers: {
      createReviews: {
        reviewTextRequired: "comment обов'язковий",
        minReviewText: 'Відгук повинен бути не менше 4 символів.',
        maxReviewText: 'Відгук не може перевищувати 200 символів.',
        ratingLessThanOne: `Рейтинг не може бути менше 1. Поточна оцінка:`,
        maxRating: 'Рейтинг не може бути більше 5.',
        ratingRequired: "Рейтинг обов'язковий",
      },
      checkReview: {
        needToBuyProductFirst: 'Спочатку вам потрібно купити цей продукт, щоб залишити відгук',
        needToWaitForOrderCompletion: `Дякуємо за ваш інтерес до залишення відгуку! Зверніть увагу, що вам потрібно зачекати, поки ваше замовлення завершиться, перш ніж ви зможете залишити відгук. Після завершення вашого замовлення ви зможете поділитися з нами своїми враженнями. Ми вдячні за ваше терпіння та розуміння`,
        oneReviewPerProduct:
          'Ви вже подали відгук на цей продукт. Дозволено лише один відгук на продукт.',
      },
    },
    errors: {
      noDocumentsFound: 'Документи не знайдені ',
      noDocumentsFoundWithId: 'Документи не знайдені за цим ідентифікатором',

      unauthorized: {
        update: 'Ви не маєте права оновлювати цей відгук',
        delete: 'Ви не маєте права видаляти цей відгук',
      },
    },
  },
} as const;
