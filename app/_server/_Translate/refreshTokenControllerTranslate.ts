export const refreshTokenControllerTranslate = {
  en: {
    functions: {
      refreshAccessToken: {
        requiredFields: "Missing required fields",
      },
      verifyRefreshToken: {
        invalidRefreshToken: "Invalid refresh token",
        refreshTokenExpired: "Refresh token expired",
      },
      deleteRefreshTokenOnLogOut: {
        message: "Refresh token deleted",
      },
      deleteAllUserRefreshTokens: {
        message: "All refresh tokens deleted",
        noRefreshTokens: "No refresh tokens found",
      },
      deleteExpiredRefreshTokens: {
        message: "Expired refresh tokens deleted",
      },
      deleteSpecificUserRefreshTokens: {
        message: "Refresh token deleted",
      },
    },
  },
  uk: {
    functions: {
      refreshAccessToken: {
        requiredFields: "Відсутні обов'язкові поля",
      },
      verifyRefreshToken: {
        invalidRefreshToken: "Недійсний токен оновлення",
        refreshTokenExpired: "Токен оновлення закінчився",
      },
      deleteRefreshTokenOnLogOut: {
        message: "Токен оновлення видалено",
      },
      deleteAllUserRefreshTokens: {
        message: "Всі токени оновлення видалено",
        noRefreshTokens: "Токени оновлення не знайдено",
      },
      deleteExpiredRefreshTokens: {
        message: "Закінчені токени оновлення видалено",
      },
      deleteSpecificUserRefreshTokens: {
        message: "Токен оновлення видалено",
      },
    },
  },
} as const;
