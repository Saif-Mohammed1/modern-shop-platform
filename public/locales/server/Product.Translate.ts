export const ProductTranslate = {
  en: {
    productActivityUpdatedSuccessfully:
      "Product activity has been updated successfully",
    invalidImageFormat: "Invalid image format",
    invalidImageType: "Invalid image type",
    imageSizeExceeds: "Image size exceeds 2MB",
    deleteImageSuccess: "Image has been deleted successfully",
    deleteImageError: "Image could not be deleted",
    public_id: "public_id is required",
    slug: "Slug is required",
    dto: {
      name: {
        required: "Name must be required",
        minlength: "Name must be greater than 6",
        maxlength: "Name must be less than 120",
      },
      category: {
        required: "Category must be required",
      },
      price: {
        required: "Price must be required",
        min: "Price must be at least 0.01",
      },
      discount: {
        discountValidation: "Discount must be less than the price",
        min: "Discount must be greater or equal 0",
      },
      discountExpire: {
        required: "DiscountExpire must be required",
      },
      images: {
        required: "Images must be required",
      },
      link: {
        required: "Link must be required",
        invalid: "Link is invalid",
      },
      public_id: {
        required: "Public_id must be required",
      },

      userId: {
        required: "User must be required",
      },
      description: {
        required: "Description must be required",
        minlength: "Description must be greater than 50",
      },
      stock: {
        required: "Stock must be required",
        min: "Stock must be greater than 0",
      },
      ratingsAverage: {
        min: "Rating must be at least 1.0",
        max: "Rating must be less than or equal to 5.0",
      },
      ratingsQuantity: {
        required: "RatingsQuantity must be required",

        min: "Ratings quantity cannot be negative",
      },
      reserved: {
        min: "Reserved quantity cannot be negative",
      },
      sold: {
        min: "Sold quantity cannot be negative",
      },
      weight: {
        min: "Weight cannot be negative",
      },
      length: {
        min: "Length cannot be negative",
      },
      width: {
        min: "Width cannot be negative",
      },
      height: {
        min: "Height cannot be negative",
      },
      ipAddress: {
        required: "IP Address must be required",
        invalid: "Invalid IP Address",
      },
      userAgent: {
        required: "User Agent must be required",
      },
      versionId: {
        required: "Version ID must be required",
      },
    },
  },
  uk: {
    productActivityUpdatedSuccessfully:
      "Активність продукту була успішно оновлена",
    invalidImageFormat: "Недійсний формат зображення",
    invalidImageType: "Недійсний тип зображення",
    imageSizeExceeds: "Розмір зображення перевищує 2 МБ",
    deleteImageSuccess: "Зображення було успішно видалено",
    deleteImageError: "Зображення не вдалося видалити",
    public_id: "public_id обов'язковий",
    slug: "Slug обов'язковий",
    dto: {
      name: {
        required: "Ім'я повинно бути обов'язковим",
        minlength: "Ім'я повинно бути більшим за 6",
        maxlength: "Ім'я повинно бути меншим за 120",
      },
      category: {
        required: "Категорія повинна бути обов'язковою",
      },
      price: {
        required: "Ціна повинна бути обов'язковою",
        min: "Ціна повинна бути принаймні 0,01",
      },
      discount: {
        discountValidation: "Знижка повинна бути менша за ціну",
        min: "Знижка повинна бути більшою або рівною 0",
      },
      discountExpire: {
        required: "Термін дії знижки повинен бути обов'язковим",
      },
      images: {
        required: "Зображення повинні бути обов'язковими",
      },
      link: {
        required: "Посилання повинно бути обов'язковим",

        invalid: "Посилання недійсне",
      },
      public_id: {
        required: "Public_id повинен бути обов'язковим",
      },
      userId: {
        required: "Користувач повинен бути обов'язковим",
      },
      description: {
        required: "Опис повинен бути обов'язковим",
        minlength: "Опис повинен бути більшим за 50",
      },
      stock: {
        required: "Запас повинен бути обов'язковим",
        min: "Запас повинен бути більшим за 0",
      },
      ratingsAverage: {
        min: "Рейтинг повинен бути принаймні 1,0",
        max: "Рейтинг повинен бути меншим або рівним 5,0",
      },
      ratingsQuantity: {
        required: "Кількість рейтингів повинна бути обов'язковою",
        min: "Кількість рейтингів не може бути від'ємною",
      },
      reserved: {
        min: "Зарезервована кількість не може бути від'ємною",
      },
      sold: {
        min: "Продана кількість не може бути від'ємною",
      },
      weight: {
        min: "Вага не може бути від'ємною",
      },
      length: {
        min: "Довжина не може бути від'ємною",
      },
      width: {
        min: "Ширина не може бути від'ємною",
      },
      height: {
        min: "Висота не може бути від'ємною",
      },
      ipAddress: {
        required: "IP-адреса повинна бути обов'язковою",

        invalid: "Недійсна IP-адреса",
      },
      userAgent: {
        required: "Ідентифікатор користувача повинен бути обов'язковим",
      },
      versionId: {
        required: "Ідентифікатор версії повинен бути обов'язковим",
      },
    },
  },
} as const;
