// const GlobalSchemaError = {
//   en: {
//     review: {
//       user_id: {
//         required: "User must be required",
//       },
//       product_id: {
//         required: "Product must be required",
//       },
//       rating: {
//         required: "Rating must be required",
//         min: "Rating must be greater than 1",
//         max: "Rating must be less than or equal to 5",
//       },
//       comment: {
//         required: "comment must be required",
//         minlength: "comment must be greater than 4",
//         maxlength: "comment must be less than 200",
//       },
//       created_at: {
//         required: "CreatedAt must be required",
//       },
//     },
//     report: {
//       user: {
//         required: "User must be required",
//       },
//       product: {
//         required: "Product must be required",
//       },
//       status: {
//         required: "Status must be required",
//       },
//       name: {
//         required: "Name must be required",
//       },
//       issue: {
//         required: "Issue must be required",
//       },
//       message: {
//         required: "Message must be required",
//       },
//       created_at: {
//         required: "CreatedAt must be required",
//       },
//     },
//     refund: {
//       user: {
//         required: "User must be required",
//       },
//       status: {
//         required: "Status must be required",
//       },
//       issue: {
//         required: "Issue must be required",
//       },
//       reason: {
//         required: "Reason must be required",
//       },
//       invoice_id: {
//         required: "InvoiceId must be required",
//       },
//       created_at: {
//         required: "CreatedAt must be required",
//       },
//     },
//     refreshtoken: {
//       required: "Token must be required",

//       token: {
//         required: "Token must be required",
//       },
//       user: {
//         required: "User must be required",
//       },
//       device_info: {
//         required: "DeviceInfo must be required",
//       },
//       ipAddress: {
//         required: "IpAddress must be required",
//       },
//       expires_at: {
//         required: "ExpiresAt must be required",
//       },
//       created_at: {
//         required: "CreatedAt must be required",
//       },
//       lastActiveAt: {
//         required: "LastActiveAt must be required",
//       },
//     },
//     order: {
//       user: {
//         required: "User must be required",
//       },
//       "shipping_info.street": {
//         required: "Street must be required",
//       },

//       "shipping_info.city": {
//         required: "City must be required",
//       },
//       "shipping_info.state": {
//         required: "State must be required",
//       },
//       "shipping_info.postal_code": {
//         required: "PostalCode must be required",
//       },
//       "shipping_info.phone": {
//         required: "Phone must be required",
//       },
//       "shipping_info.country": {
//         required: "Country must be required",
//       },

//       shipping_info: {
//         street: {
//           required: "Street must be required",
//         },
//         city: {
//           required: "City must be required",
//         },
//         state: {
//           required: "State must be required",
//         },
//         postal_code: {
//           required: "PostalCode must be required",
//         },
//         phone: {
//           required: "Phone must be required",
//         },
//         country: {
//           required: "Country must be required",
//         },
//       },
//       items: {
//         _id: {
//           required: "Product must be required",
//         },
//         name: {
//           required: "Name must be required",
//         },
//         quantity: {
//           required: "Quantity must be required",
//         },
//         price: {
//           required: "Price must be required",
//         },
//         final_price: {
//           required: "FinalPrice must be required",
//         },
//       },
//       status: {
//         required: "Status must be required",
//       },
//       invoice_id: {
//         required: "InvoiceId must be required",
//       },
//       invoice_link: {
//         required: "InvoiceLink must be required",
//       },
//       totalPrice: {
//         required: "TotalPrice must be required",
//       },
//       created_at: {
//         required: "CreatedAt must be required",
//       },
//     },
//     favorite: {
//       user: {
//         required: "User must be required",
//       },
//       product: {
//         required: "Product must be required",
//       },
//     },
//     contactus: {
//       user: {
//         required: "User must be required",
//       },
//       subject: {
//         required: "Subject must be required",
//         maxlength: "Subject must be less than 150 characters",
//       },
//       message: {
//         required: "Message must be required",
//         maxlength: "Message must be less than 1000 characters",
//       },
//       status: {
//         required: "Status must be required",
//       },
//     },
//     cart: {
//       user_id: {
//         required: "User must be required",
//       },
//       product_id: {
//         required: "Product must be required",
//       },
//       quantity: {
//         required: "Quantity must be required",
//         min: "Quantity must be at least 1",
//       },
//     },
//     address: {
//       street: {
//         required: "Street must be required",
//       },
//       city: {
//         required: "City must be required",
//       },
//       state: {
//         required: "State must be required",
//       },
//       postal_code: {
//         required: "PostalCode must be required",
//       },
//       phone: {
//         required: "Phone must be required",
//         invalidPhoneNumber: "please enter a valid ukrainian phone number",
//       },
//       country: {
//         required: "Country must be required",
//       },
//       user: {
//         required: "User must be required",
//       },
//     },
//     user: {
//       name: {
//         required: "Name must be required",
//       },
//       email: {
//         required: "Email must be required",
//         unique: "Email must be unique",
//       },
//       emailVerify: {
//         required: "EmailVerify must be required",
//       },
//       password: {
//         required: "Password must be required",
//         minlength: "Password must be greater than 10",
//         maxlength: "Password must be less than 60",
//       },
//       passwordConfirm: {
//         required: "PasswordConfirm must be required",
//         minlength: "PasswordConfirm must be greater than 10",
//         maxlength: "PasswordConfirm must be less than 60",
//         passwordsNotTheSame: "PasswordConfirm must be equal to the password",
//       },
//       role: {
//         required: "Role must be required",
//       },
//       created_at: {
//         required: "CreatedAt must be required",
//       },
//     },
//     product: {
//       name: {
//         required: "Name must be required",
//         minlength: "Name must be greater than 6",
//         maxlength: "Name must be less than 120",
//       },
//       category: {
//         required: "Category must be required",
//       },
//       price: {
//         required: "Price must be required",
//         min: "Price must be at least 0.01",
//       },
//       discount: {
//         discountValidation: "Discount must be less than the price",
//         min: "Discount must be greater or equal 0",
//       },
//       discount_expire: {
//         required: "DiscountExpire must be required",
//       },
//       images: {
//         required: "Images must be required",
//       },
//       link: {
//         required: "Link must be required",
//         invalid: "Link is invalid",
//       },
//       public_id: {
//         required: "Public_id must be required",
//       },

//       user_id: {
//         required: "User must be required",
//       },
//       description: {
//         required: "Description must be required",
//         minlength: "Description must be greater than 50",
//       },
//       stock: {
//         required: "Stock must be required",
//         min: "Stock must be greater than 0",
//       },
//       ratings_average: {
//         min: "Rating must be at least 1.0",
//         max: "Rating must be less than or equal to 5.0",
//       },
//       ratings_quantity: {
//         required: "RatingsQuantity must be required",

//         min: "Ratings quantity cannot be negative",
//       },
//       reserved: {
//         min: "Reserved quantity cannot be negative",
//       },
//       sold: {
//         min: "Sold quantity cannot be negative",
//       },
//       weight: {
//         min: "Weight cannot be negative",
//       },
//       length: {
//         min: "Length cannot be negative",
//       },
//       width: {
//         min: "Width cannot be negative",
//       },
//       height: {
//         min: "Height cannot be negative",
//       },
//     },
//   },
//   uk: {
//     review: {
//       user: {
//         required: "Користувач повинен бути обов'язковим",
//       },
//       product: {
//         required: "Продукт повинен бути обов'язковим",
//       },
//       rating: {
//         required: "Рейтинг повинен бути обов'язковим",
//         min: "Рейтинг повинен бути більшим за 1",
//         max: "Рейтинг повинен бути меншим або рівним 5",
//       },
//       comment: {
//         required: "Текст відгуку повинен бути обов'язковим",
//         minlength: "Текст відгуку повинен бути більшим за 4",
//         maxlength: "Текст відгуку повинен бути меншим за 200",
//       },
//       created_at: {
//         required: "Дата створення повинна бути обов'язковою",
//       },
//     },
//     report: {
//       user: {
//         required: "Користувач повинен бути обов'язковим",
//       },
//       product: {
//         required: "Продукт повинен бути обов'язковим",
//       },
//       status: {
//         required: "Статус повинен бути обов'язковим",
//       },
//       name: {
//         required: "Ім'я повинно бути обов'язковим",
//       },
//       issue: {
//         required: "Проблема повинна бути обов'язковою",
//       },
//       message: {
//         required: "Повідомлення повинно бути обов'язковим",
//       },
//       created_at: {
//         required: "Дата створення повинна бути обов'язковою",
//       },
//     },
//     refund: {
//       user: {
//         required: "Користувач повинен бути обов'язковим",
//       },
//       status: {
//         required: "Статус повинен бути обов'язковим",
//       },
//       issue: {
//         required: "Проблема повинна бути обов'язковою",
//       },
//       reason: {
//         required: "Причина повинна бути обов'язковою",
//       },
//       invoice_id: {
//         required: "Ідентифікатор рахунку повинен бути обов'язковим",
//       },
//       created_at: {
//         required: "Дата створення повинна бути обов'язковою",
//       },
//     },
//     refreshtoken: {
//       required: "Токен повинен бути обов'язковим",
//       token: {
//         required: "Токен повинен бути обов'язковим",
//       },
//       user: {
//         required: "Користувач повинен бути обов'язковим",
//       },
//       device_info: {
//         required: "Інформація про пристрій повинна бути обов'язковою",
//       },
//       ipAddress: {
//         required: "IP-адреса повинна бути обов'язковою",
//       },
//       expires_at: {
//         required: "Термін дії закінчується повинен бути обов'язковим",
//       },
//       created_at: {
//         required: "Дата створення повинна бути обов'язковою",
//       },
//       lastActiveAt: {
//         required: "Останній активний повинен бути обов'язковим",
//       },
//     },
//     order: {
//       user: {
//         required: "Користувач повинен бути обов'язковим",
//       },

//       "shipping_info.street": {
//         required: "Вулиця пов должна бути обов'язковою",
//       },
//       "shipping_info.city": {
//         required: "Місто повинно бути обов'язковим",
//       },
//       "shipping_info.state": {
//         required: "Штат повинен бути обов'язковим",
//       },
//       "shipping_info.postal_code": {
//         required: "Поштовий індекс повинен бути обов'язковим",
//       },
//       "shipping_info.phone": {
//         required: "Телефон повинен бути обов'язковим",
//       },
//       "shipping_info.country": {
//         required: "Країна пов должна бути обов'язковою",
//       },
//       shipping_info: {
//         street: {
//           required: "Вулиця пов должна бути обов'язковою",
//         },
//         city: {
//           required: "Місто повинно бути обов'язковим",
//         },
//         state: {
//           required: "Штат повинен бути обов'язковим",
//         },

//         postal_code: {
//           required: "Поштовий індекс повинен бути обов'язковим",
//         },
//         phone: {
//           required: "Телефон повинен бути обов'язковим",
//         },
//         country: {
//           required: "Країна повинна бути обов'язковою",
//         },
//       },
//       // items: {
//       _id: {
//         required: "Продукт повинен бути обов'язковим",
//       },
//       name: {
//         required: "Ім'я повинно бути обов'язковим",
//       },
//       quantity: {
//         required: "Кількість повинна бути обов'язковою",
//       },
//       price: {
//         required: "Ціна повинна бути обов'язковою",
//       },
//       final_price: {
//         required: "Кінцева ціна повинна бути обов'язковою",
//       },
//       // },
//       status: {
//         required: "Статус повинен бути обов'язковим",
//       },
//       invoice_id: {
//         required: "Ідентифікатор рахунку повинен бути обов'язковим",
//       },
//       invoice_link: {
//         required: "Посилання на рахунок повинно бути обов'язковим",
//       },
//       totalPrice: {
//         required: "Загальна вартість повинна бути обов'язковою",
//       },
//       created_at: {
//         required: "Дата створення повинна бути обов'язковою",
//       },
//     },
//     favorite: {
//       user: {
//         required: "Користувач повинен бути обов'язковим",
//       },
//       product: {
//         required: "Продукт повинен бути обов'язковим",
//       },
//     },
//     contactus: {
//       user: {
//         required: "Користувач повинен бути обов'язковим",
//       },
//       subject: {
//         required: "Тема повинна бути обов'язковою",
//         maxlength: "Тема повинна бути меншою за 150 символів",
//       },
//       message: {
//         required: "Повідомлення повинно бути обов'язковим",
//         maxlength: "Повідомлення повинно бути меншим за 1000 символів",
//       },
//       status: {
//         required: "Статус повинен бути обов'язковим",
//       },
//     },
//     cart: {
//       user: {
//         required: "Користувач повинен бути обов'язковим",
//       },
//       product: {
//         required: "Продукт повинен бути обов'язковим",
//       },
//       quantity: {
//         required: "Кількість повинна бути обов'язковою",
//         min: "Кількість повинна бути принаймні 1",
//       },
//     },
//     address: {
//       street: {
//         required: "Вулиця повинна бути обов'язковою",
//       },
//       city: {
//         required: "Місто повинно бути обов'язковим",
//       },
//       state: {
//         required: "Штат повинен бути обов'язковим",
//       },
//       postal_code: {
//         required: "Поштовий індекс повинен бути обов'язковим",
//       },
//       phone: {
//         required: "Телефон повинен бути обов'язковим",

//         invalidPhoneNumber:
//           "Будь ласка, введіть дійсний український номер телефону",
//       },
//       country: {
//         required: "Країна повинна бути обов'язковою",
//       },
//       user: {
//         required: "Користувач повинен бути обов'язковим",
//       },
//     },
//     user: {
//       name: {
//         required: "Ім'я повинно бути обов'язковим",
//       },
//       email: {
//         required: "Електронна пошта повинна бути обов'язковою",
//         unique: "Електронна пошта повинна бути унікальною",
//       },
//       emailVerify: {
//         required: "Електронна пошта повинна бути обов'язковою",
//       },
//       password: {
//         required: "Пароль повинен бути обов'язковим",
//         minlength: "Пароль повинен бути більшим за 10",
//         maxlength: "Пароль повинен бути меншим за 60",
//       },
//       passwordConfirm: {
//         required: "Підтвердження пароля повинно бути обов'язковим",
//         minlength: "Підтвердження пароля повинно бути більшим за 10",
//         maxlength: "Підтвердження пароля повинно бути меншим за 60",
//         passwordsNotTheSame: "Підтвердження пароля повинно бути рівним паролю",
//       },
//       role: {
//         required: "Роль повинна бути обов'язковою",
//       },
//       created_at: {
//         required: "Дата створення повинна бути обов'язковою",
//       },
//     },

//     product: {
//       name: {
//         required: "Ім'я повинно бути обов'язковим",
//         minlength: "Ім'я повинно бути більшим за 6",
//         maxlength: "Ім'я повинно бути меншим за 120",
//       },
//       category: {
//         required: "Категорія повинна бути обов'язковою",
//       },
//       price: {
//         required: "Ціна повинна бути обов'язковою",
//         min: "Ціна повинна бути принаймні 0,01",
//       },
//       discount: {
//         discountValidation: "Знижка повинна бути менша за ціну",
//         min: "Знижка повинна бути більшою або рівною 0",
//       },
//       discount_expire: {
//         required: "Термін дії знижки повинен бути обов'язковим",
//       },
//       images: {
//         required: "Зображення повинні бути обов'язковими",
//       },
//       link: {
//         required: "Посилання повинно бути обов'язковим",

//         invalid: "Посилання недійсне",
//       },
//       public_id: {
//         required: "Public_id повинен бути обов'язковим",
//       },
//       user_id: {
//         required: "Користувач повинен бути обов'язковим",
//       },
//       description: {
//         required: "Опис повинен бути обов'язковим",
//         minlength: "Опис повинен бути більшим за 50",
//       },
//       stock: {
//         required: "Запас повинен бути обов'язковим",
//         min: "Запас повинен бути більшим за 0",
//       },
//       ratings_average: {
//         min: "Рейтинг повинен бути принаймні 1,0",
//         max: "Рейтинг повинен бути меншим або рівним 5,0",
//       },
//       ratings_quantity: {
//         required: "Кількість рейтингів повинна бути обов'язковою",
//         min: "Кількість рейтингів не може бути від'ємною",
//       },
//       reserved: {
//         min: "Зарезервована кількість не може бути від'ємною",
//       },
//       sold: {
//         min: "Продана кількість не може бути від'ємною",
//       },
//       weight: {
//         min: "Вага не може бути від'ємною",
//       },
//       length: {
//         min: "Довжина не може бути від'ємною",
//       },
//       width: {
//         min: "Ширина не може бути від'ємною",
//       },
//       height: {
//         min: "Висота не може бути від'ємною",
//       },
//     },
//   },
// } as const;

// export const errorControllerTranslate = {
//   en: {
//     controllers: {
//       handleCastErrorDB: (path: string, value: string) => {
//         return {
//           message: `Invalid ${path}: ${value}.`,
//         };
//       },
//       handleDuplicateFieldsDB: (value: string) => {
//         return {
//           message: `Duplicate field value: ${value}. Please use another value!`,
//         };
//       },
//       handleValidationErrorDB: GlobalSchemaError.en,
//       //  (errors: string) => {
//       //   return {
//       //     message: `Invalid input data. ${errors}.`,
//       //   };
//       // },
//       handleJWTError: {
//         message: "Invalid token. Please log in again!",
//       },
//       handleJWTExpiredError: {
//         message: "Your token has expired! Please log in again.",
//       },
//     },
//     errors: {
//       message: "An error occurred",
//       validationError: "Invalid input data",
//       globalError:
//         "Something went very wrong!. If the error persists, please let us know. ",
//     },
//   },

//   uk: {
//     controllers: {
//       handleCastErrorDB: (path: string, value: string) => {
//         return {
//           message: `Недійсне значення поля: ${path}: ${value}.`,
//         };
//       },
//       handleDuplicateFieldsDB: (value: string) => {
//         return {
//           message: `Дублююче значення поля: ${value}. Будь ласка, використовуйте інше значення!`,
//         };
//       },
//       handleValidationErrorDB: GlobalSchemaError.uk,
//       // handleValidationErrorDB: (errors: string) => {
//       //   return {
//       //     message: `Недійсні дані введення. ${errors}.`,
//       //   };
//       // },
//       handleJWTError: {
//         message: "Недійсний токен. Будь ласка, увійдіть знову!",
//       },
//       handleJWTExpiredError: {
//         message: "Ваш токен закінчився! Будь ласка, увійдіть знову.",
//       },
//     },
//     errors: {
//       message: "Сталася помилка",
//       validationError: "Недійсні дані введення",
//       globalError:
//         "Щось пішло не так!. Якщо помилка повторюється, будь ласка, дайте нам знати. ",
//     },
//   },
// } as const;
// errorControllerTranslate.en.ts
export const errorControllerTranslate = {
  en: {
    errors: {
      globalError: "Something went wrong! Please try again later.",
    },
    controllers: {
      zodError: (path: string) => `Invalid value provided for ${path}`,
      uniqueViolationError: (field: string, value: string) =>
        `${field} '${value}' already exists. Please use a different value.`,
      foreignKeyViolationError: (constraint: string) =>
        `Invalid reference to ${constraint.replace(/_/g, " ")}`,
      invalidInputError: (field: string) =>
        `Invalid format provided for ${field}`,
      notNullViolationError: (field: string) =>
        `${field} is required and cannot be empty`,
      undefinedColumnError: (column: string) =>
        `Unknown field requested: ${column}`,
      undefinedTableError: (table: string) =>
        `Database configuration error - unknown table: ${table}`,
      genericDBError: (code: string) =>
        `Database operation failed (Error code: ${code})`,
      invalidTokenError: "Invalid authentication token",
      expiredTokenError: "Authentication token has expired",
    },
  },
  uk: {
    errors: {
      globalError: "Сталася помилка! Будь ласка, спробуйте ще раз пізніше.",
    },
    controllers: {
      zodError: (path: string) => `Недійсне значення для ${path}`,
      uniqueViolationError: (field: string, value: string) =>
        `${field} '${value}' вже існує. Будь ласка, використовуйте інше значення.`,
      foreignKeyViolationError: (constraint: string) =>
        `Недійсне посилання на ${constraint.replace(/_/g, " ")}`,
      invalidInputError: (field: string) => `Недійсний формат для ${field}`,
      notNullViolationError: (field: string) =>
        `${field} є обов'язковим і не може бути порожнім`,
      undefinedColumnError: (column: string) =>
        `Запитуване невідоме поле: ${column}`,
      undefinedTableError: (table: string) =>
        `Помилка конфігурації бази даних - невідома таблиця: ${table}`,
      genericDBError: (code: string) =>
        `Операція з базою даних не вдалася (код помилки: ${code})`,
      invalidTokenError: "Недійсний токен аутентифікації",
      expiredTokenError: "Термін дії токена аутентифікації закінчився",
    },
  },
} as const;
