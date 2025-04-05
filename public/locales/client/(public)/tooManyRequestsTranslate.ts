export const tooManyRequestsTranslate = {
  en: {
    metadata: {
      title: 'Too Many Requests',
      description:
        'Our service protection mechanism has detected unusual activity. Please try again later.',
      keywords: 'Too Many Requests, 429, too many requests',
    },
    title: 'Too Many Requests',
    description:
      'Our service protection mechanism has detected unusual activity. Please try again later.',
    retryButton: 'Try Again',
    homeButton: 'Return Home',
    retrySuggestion: 'Suggested retry time: {time}',
    contactSupport: (email: React.JSX.Element) => `Need immediate help? Contact us at ${email}`,
  },
  uk: {
    metadata: {
      title: 'Забагато запитів',
      description:
        'Наш механізм захисту виявив незвичайну активність. Будь ласка, спробуйте пізніше.',
      keywords: 'Забагато запитів, 429, забагато запитів',
    },
    title: 'Забагато запитів',
    description:
      'Наш механізм захисту виявив незвичайну активність. Будь ласка, спробуйте пізніше.',
    retryButton: 'Спробувати ще раз',
    homeButton: 'Повернутися на головну',
    retrySuggestion: 'Рекомендований час повторної спроби: {time}',
    contactSupport: (email: React.JSX.Element) =>
      `Потрібна негайна допомога? Зв'яжіться з нами за адресою ${email}`,
  },
} as const;
// export const tooManyRequestsTranslate = {
//     en: {
//         metadata: {
//         title: "Too Many Requests",
//         description: "Too Many Requests",
//         keywords: "Too Many Requests, 429, too many requests",
//         },
//         title: "429 - Too Many Requests",
//         suggestions: "You have exceeded the rate limit.",
//         links: {
//         home: "Go to Homepage",
//         contact: "Contact Us",
//         },
//         button: {
//         goBack: "Go Back",
//         },
//     },
//     uk: {
//         metadata: {
//         title: "Забагато запитів",
//         description: "Забагато запитів",
//         keywords: "Забагато запитів, 429, забагато запитів",
//         },
//         title: "429 - Забагато запитів",
//         suggestions: "Ви перевищили обмеження швидкості.",
//         links: {
//         home: "Перейти на головну",
//         contact: "Зв'яжіться з нами",
//         },
//         button: {
//         goBack: "Повернутися назад",
//         },
//     },
//     } as const;
