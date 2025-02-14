export const reviewsTranslate = {
  en: {
    ReviewSection: {
      title: "Reviews",
      content: {
        noReviews: "No reviews yet",
        date: "Date",
        loading: "Loading...",
        showMore: "Show More",
      },
    },

    createReviewsSection: {
      functions: {
        checkOrder: {
          loading: "Checking order...",
          success: "You can now write a review.",
        },

        handleSubmit: {
          ratingError:
            "Please provide a rating and it must be greater or equal 1 .",
          reviewError: "Please provide a review.",
          loading: "Submitting review...",
          success: "Review submitted successfully.",
        },
      },
      content: {
        textArea: {
          placeholder: "Write your review here...",
        },
        button: {
          checkButton: {
            loading: "Loading...",
            writeReview: "Write a Review",
            firstReview: "Be the first to review",
          },
          submitButton: {
            loading: "Submitting...",
            submit: "Submit",
          },
        },
      },
    },
    errors: {
      global: "An unexpected error occurred. Please try again later.",
    },
  },
  uk: {
    ReviewSection: {
      title: "Відгуки",
      content: {
        noReviews: "Поки що немає відгуків",
        date: "Дата",
        loading: "Завантаження...",
        showMore: "Показати більше",
      },
    },
    createReviewsSection: {
      functions: {
        checkOrder: {
          loading: "Перевірка замовлення...",
          success: "Тепер ви можете написати відгук.",
        },
        handleSubmit: {
          ratingError:
            "Будь ласка, вкажіть рейтинг, він повинен бути більше або дорівнювати 1.",
          reviewError: "Будь ласка, вкажіть відгук.",
          loading: "Надсилання відгуку...",
          success: "Відгук успішно надіслано.",
        },
      },
      content: {
        textArea: {
          placeholder: "Напишіть ваш відгук тут...",
        },
        button: {
          checkButton: {
            loading: "Завантаження...",
            writeReview: "Написати відгук",
            firstReview: "Будьте першим, хто залишить відгук",
          },
          submitButton: {
            loading: "Надсилання...",
            submit: "Надіслати",
          },
        },
      },
    },

    errors: {
      global: "Сталася непередбачувана помилка. Будь ласка, спробуйте пізніше.",
    },
  },
} as const;
