const errorHandlerTranslate = {
  en: {
    metadata: {
      title: 'Error',
      description: 'Error page',
      keywords: 'error, page, error page',
    },
    title: 'Oops! Something went wrong.',
    functions: {
      handleReset: {
        loading: 'Resetting...',
        success: 'Reset successful!',
        error: 'Failed to reset!',
      },
    },
    message: {
      default: 'An unexpected error occurred. Please try again later. Or contact support.',
    },
    button: {
      reset: 'Try again',
    },
  },
  uk: {
    metadata: {
      title: 'Помилка',
      description: 'Сторінка помилки',
      keywords: 'помилка, сторінка, сторінка помилки',
    },
    title: 'Упс! Щось пішло не так.',
    functions: {
      handleReset: {
        loading: 'Скидання...',
        success: 'Скидання успішно!',
        error: 'Не вдалося скинути!',
      },
    },
    message: {
      default:
        "Виникла непередбачувана помилка. Будь ласка, спробуйте ще раз пізніше. Або зв'яжіться з підтримкою.",
    },
    button: {
      reset: 'Спробуйте ще раз',
    },
  },
} as const;
const layoutTranslate = {
  en: {
    metadata: {
      title: 'My Awesome Online Shop',
      description:
        'Discover a wide range of products at great prices on My Awesome Online Shop. Shop now and enjoy a seamless shopping experience.',
      keywords: 'shop, online shop, ecommerce, store online',
    },
    fixed: {
      message:
        '⚠️ We are currently undergoing maintenance. Payments and user actions are temporarily disabled. Please check back later.',
    },
  },
  uk: {
    metadata: {
      title: 'Мій крутий онлайн магазин',
      description:
        'Відкрийте широкий асортимент товарів за вигідними цінами на My Awesome Online Shop. Покупайте зараз і насолоджуйтеся безперервними покупками.',

      keywords: 'магазин, онлайн магазин, електронна комерція, магазин онлайн',
    },
    fixed: {
      message:
        '⚠️ В даний час проводиться технічне обслуговування. Платежі та дії користувачів тимчасово вимкнені. Будь ласка, поверніться пізніше.',
    },
  },
} as const;
const notFoundTranslate = {
  en: {
    metadata: {
      title: 'Not Found',
      description: 'Not Found',
      keywords: 'Not Found, 404, page not found, not found',
    },
    title: '404 - Page Not Found',
    suggestions: 'Oops! The page you’re looking for doesn’t exist.',
    links: {
      home: 'Go to Homepage',
      contact: 'Contact Us',
    },
    button: {
      goBack: 'Go Back',
    },
  },
  uk: {
    metadata: {
      title: 'Не знайдено',
      description: 'Не знайдено',
      keywords: 'Не знайдено, 404, сторінка не знайдена, не знайдено',
    },
    title: '404 - Сторінку не знайдено',
    suggestions: 'Упс! Сторінку, яку ви шукаєте, не існує.',
    links: {
      home: 'Перейти на головну',
      contact: "Зв'яжіться з нами",
    },
    button: {
      goBack: 'Повернутися назад',
    },
  },
} as const;
const homeTranslate = {
  en: {
    metadata: {
      title: 'Home',
      description: 'Home page for the shop',
      keywords: 'home, shop, home page',
    },
  },
  uk: {
    metadata: {
      title: 'Головна',
      description: 'Головна сторінка для магазину',
      keywords: 'головна, магазин, головна сторінка',
    },
  },
} as const;
export const rootStaticPagesTranslate = {
  en: {
    error: errorHandlerTranslate.en,
    layout: layoutTranslate.en,
    notFound: notFoundTranslate.en,
    home: homeTranslate.en,
  },
  uk: {
    error: errorHandlerTranslate.uk,
    layout: layoutTranslate.uk,
    notFound: notFoundTranslate.uk,
    home: homeTranslate.uk,
  },
} as const;
